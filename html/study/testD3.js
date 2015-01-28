var dataSet = [300, 130, 5, 60, 240];

d3.select("#myGraph")
    .selectAll("rect")
    .data(dataSet)
    .enter()
    .append("rect")
    .attr("x", 0)
    .attr("y", function (d, i) { return i * 25; })
    .attr("width", "0px")
    .attr("height", "20px")
        .on("click", function () {
            d3.select(this).style("fill", "cyan");
        })
    .transition()
    .delay(function (d, i) {
        return i * 500;
    })
    .duration(2000)
    .attr("width", function (d, i) { return d + "px"; });

d3.select("#updateButton").on("click",
    function () {
        for (var i = 0; i < dataSet.length; i++) {
            dataSet[i] = Math.floor(Math.random() * 320);
        }

        d3.select("#myGraph")
            .selectAll("rect")
            .data(dataSet)
            .attr("width",
                function (d, i) {
                    return d + "px";
                })
    }
);