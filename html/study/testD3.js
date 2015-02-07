var dataSet = [
    [{ year: 2010, p: 18 }, { year: 2011, p: 22 }, { year: 2012, p: 30 }, { year: 2013, p: 40 }],
    [{ year: 2010, p: 12 }, { year: 2011, p: 25 }, { year: 2012, p: 45 }, { year: 2013, p: 80 }],
    [{ year: 2010, p: 10 }, { year: 2011, p: 15 }, { year: 2012, p: 20 }, { year: 2013, p: 25 }]
];

var svgHeight = 240;
var barWidth = 50;
var step = 80;
var offsetX = 10;
var color = ["red", "pink", "orange"];
var stack = d3.layout.stack().y(function (d) { return d.p; });

d3.select("#myGraph")
    .selectAll("g")
    .data(stack(dataSet))
    .enter()
    .append("g")
    .attr("fill", function (d, i) { return color[i]; })
    .selectAll("rect")
    .data(function (d, i) { return d; })
    .enter()
    .append("rect")
    .attr("x", function (d, i) { return offsetX + i * step; })
    .attr("y", function (d, i) { return svgHeight - d.y0 - d.y; })
    .attr("width", barWidth)
    .attr("height", function (d, i) { return d.y; });
