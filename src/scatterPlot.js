//call fucntion with new parameters
function updateScatterPlot(minYear, maxYear) {
  createScatterPlot(minYear, maxYear);
}

function processData(data, minYear, maxYear) {
  // Filter data with range
  const filteredData = data.filter(
    (d) =>
      d.StartYear >= minYear && d.StartYear <= maxYear && d.land_area > 5000
  );

  // group by country and some colums
  const groupedData = filteredData.reduce((acc, current) => {
    const country = current.Country;

    if (!acc[country]) {
      acc[country] = {
        Country: country,
        disasters_per_area: 0,
        total_deaths: 0,
      };
    }

    acc[country].disasters_per_area += +current.disasters_per_area;
    acc[country].total_deaths += +current.total_deaths > 0 ? Math.log(+current.total_deaths) : 0;

    return acc;
  }, {});

  return Object.values(groupedData);
}

// Function to create scatterplot
function createScatterPlot(minYear, maxYear) {
  // Remove svg if exste to avoid sobreposition
  d3.select("#scatterplot").select("svg").remove();

  // Define margins
  var margin = { top: 20, right: 15, bottom: 50, left: 50 },
    width = 600,
    height = 300 - margin.top - margin.bottom;

  // Add svg elemnet to page
  var svg = d3
    .select("#scatterplot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // read csv
  d3.csv("../satinize_dataset/pre-processing/disasters_per_country.csv").then(
    function (data) {
      var filteredData = processData(data, minYear, maxYear);

      var maxY = d3.max(filteredData, function (d) {
        return d.total_deaths;
      });
      var maxX = d3.max(filteredData, function (d) {
        return d.disasters_per_area;
      });

      var formatAbbreviation = d3.format(".2s");

      // axis X
      var x = d3
        .scaleLinear()
        .domain([0, parseInt(maxX) * 1.1])
        .range([0, width]);

      svg
        .append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickFormat(formatAbbreviation).ticks(5))
        .style("font-size", "10px");

      // axis Y
      var y = d3
        .scaleLinear()
        .domain([0, parseInt(maxY) * 1.1])
        .range([height, 0]);

      svg
        .append("g")
        .call(d3.axisLeft(y).tickFormat(formatAbbreviation))
        .style("font-size", "10px");

      // Name of axis X
      svg
        .append("text")
        .attr(
          "transform",
          "translate(" + width / 2 + " ," + (height + margin.bottom - 10) + ")"
        )
        .style("text-anchor", "middle")
        .text("Disasters per 1000km2 (area > 5000km2)");
      // Name of axis Y
      svg
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 20)
        .attr("x", 0 - height / 2)
        .style("text-anchor", "middle")
        .text("Total Deaths (logarithmic)");

      var tooltip = d3.select("#tooltip"); // Select tooltip

      // add points to graph

      svg
        .append("g")
        .selectAll("circle")
        .data(filteredData) // Use filteredData aqui
        .enter()
        .append("circle")
        .attr("cx", function (d) {
          return x(d.disasters_per_area);
        })
        .attr("cy", function (d) {
          return y(d.total_deaths);
        })
        .attr("r", 3)
        .style("fill", "#69b3a2")
        .on("mouseover", function (event, d) {
          tooltip.transition().duration(200).style("opacity", 0.9);

          tooltip
            .html(`<strong>${d.Country}</strong>`) //country name
            .style("left", event.clientX + "px")
            .style("top", event.clientY + "px");
          d3.select(this).style("fill", "#FF0000");
        })
        .on("mouseout", function (d) {
          tooltip.transition().duration(500).style("opacity", 0);
          d3.select(this).style("fill", "#69b3a2"); // Change back to original color
        });
    }
  );
}

// load graph
document.addEventListener("DOMContentLoaded", function () {
  createScatterPlot(minYear, maxYear);
});
