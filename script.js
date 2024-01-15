// Load CSV data
d3.csv('311_boston_data.csv').then(data => {
    // Process the data
    data.forEach(d => {
        d.Count = +d.Count; // Convert Count to a number
    });

    // Sort the data by Count in descending order. first step to top 10
    data.sort((a, b) => b.Count - a.Count);

    // Take only the top 10 types
    const top10Data = data.slice(0, 10);

    // Set up SVG container
    const svgWidth = 800;
    const svgHeight = 500;
    const margin = { top: 40, right: 40, bottom: 80, left: 200 };
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    const svg = d3.select('#chart_311')
        .append('svg')
        .attr('width', svgWidth)
        .attr('height', svgHeight)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const yScale = d3.scaleBand()
        .domain(top10Data.map(d => d.reason))
        .range([0, height])
        .padding(0.2);

    const xScale = d3.scaleLinear()
        .domain([0, d3.max(top10Data, d => d.Count)])
        .range([0, width]);

    // Create bars
    const bars = svg.selectAll('rect')
        .data(top10Data)
        .enter()
        .append('rect')
        .attr('x', 0)
        .attr('y', d => yScale(d.reason))
        .attr('width', d => xScale(d.Count))
        .attr('height', yScale.bandwidth())
        .attr('fill', (d, i) => `rgb(${i * 25}, ${i * 10}, ${i * 5})`) // Use different colors for each bar
        .on('mouseover', function (event, d) {
            d3.select(this).attr('fill', 'orange'); // Change color on hover
        })
        .on('mouseout', function () {
            d3.select(this).attr('fill', (d, i) => `rgb(${i * 25}, ${i * 10}, ${i * 5})`); // Revert color on mouseout
        });

    // Add labels inside bars
    svg.selectAll('text')
        .data(top10Data)
        .enter()
        .append('text')
        .text(d => d.reason)
        .attr('x', 5) // Adjust the x-coordinate for proper placement
        .attr('y', d => yScale(d.reason) + yScale.bandwidth() / 2)
        .attr('dy', '0.35em')
        .style('font-size', '12px')
        .style('fill', 'white'); // Make text white for visibility

    // Add axes
    svg.append('g')
        .call(d3.axisLeft(yScale))
        .classed('axisLeft', true);

    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale))
        .classed('axisBottom', true);

    // Add attribution line at the bottom
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height + margin.top + 20) // Adjust the y-coordinate for proper placement
        .attr('text-anchor', 'left')
        .style('font-size', '12px')
        .text('Chart created by Sam Muhanguzi. source: boston.gov');

    // Button to show extended bar chart
    d3.select('body')
        .append('button')
        .text('Show Extended Chart')
        .on('click', function () {
            // Update data to include all counts
            const extendedData = data.slice(0);

            // Update scales
            yScale.domain(extendedData.map(d => d.reason));
            xScale.domain([0, d3.max(extendedData, d => d.Count)]);

            // Update bars
            bars.data(extendedData)
                .transition()
                .duration(1000)
                .attr('width', d => xScale(d.Count));

            // Update labels inside bars
            svg.selectAll('text')
                .data(extendedData)
                .text(d => d.reason);

            // Update axes
            svg.select('.axisLeft')
                .transition()
                .duration(1000)
                .call(d3.axisLeft(yScale));

            svg.select('.axisBottom')
                .transition()
                .duration(1000)
                .call(d3.axisBottom(xScale));
        });
});
