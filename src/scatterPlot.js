/* //call fucntion with new parameters
function updateScatterPlot(minYear, maxYear,country) {
  createScatterPlot(minYear, maxYear,country);
} */


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
    acc[country].total_deaths += +current.total_deaths == 0 ? 1 : +current.total_deaths; //> 0 ? Math.log(+current.total_deaths) : 0;

    return acc;
  }, {});

  return Object.values(groupedData);
}

// Function to create scatterplot
function updateScatterPlot(minYear, maxYear, country) {
  let selectedCountry = country;

  // Define margins
  var margin = { top: 5, right: 15, bottom: 50, left: 60 },
    width = 600,
    height = 250 - margin.top - margin.bottom;

  // Add svg elemnet to page
  var svg = d3
    .select("#scatterplot")
    .select("svg")



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

      // axis Y
      var y = d3.scaleLog()
        .base(10)
        .domain([1, 250000])
        .range([height, 0]);


      svg
        .select("#x-axis-label")
        .transition()
        .duration(1000)
        .call(d3.axisBottom(x).tickFormat(formatAbbreviation).ticks(5))
        .style("font-size", "10px");

      var tooltip = d3.select("#tooltip"); // Select tooltip

      // add points to graph

      const circles = svg
        .select("#scatter-points")
        .selectAll("circle")
        .data(filteredData) // Use filteredData aqui

      circles.transition()
      .duration(1000)
      .attr("cx", function (d) {
        return x(d.disasters_per_area);
      })
      .attr("cy", function (d) {
        return y(d.total_deaths);
      })
      .style("fill", (d) => (d.Country === selectedCountry ? "blue" : "#69b3a2"))
        

      circles.enter()
        .append("circle")
        .attr("cx", function (d) {
          return x(d.disasters_per_area);
        })
        .attr("cy", function (d) {
          return y(d.total_deaths);
        })
        .attr("r", 3)
        .style("fill", (d) => (d.Country === selectedCountry ? "blue" : "#69b3a2"))
        .on("mouseover", function (event, d) {
          tooltip.transition().duration(200).style("opacity", 0.9);

          tooltip
            .html(
              `<strong>${d.Country}</strong><br>` + // Display country
              `Disasters density: ${d.disasters_per_area.toFixed(1)}<br>` + // Show disasters per area
              `Total Deaths: ${d.total_deaths.toExponential(2)}` // Show total deaths in scientific notation
            )
            .style("left", (event.clientX + 10) + "px")
            .style("top", (event.clientY - 20) + "px");
          d3.select(this).style("fill", "#fc8d62");
        })
        .on("mouseout", function (e, d) {
          tooltip.transition().duration(100).style("opacity", 0);
          if (selectedCountry === d.Country) {
            d3.select(this).style("fill", "blue");
          } else {
            d3.select(this).style("fill", "#69b3a2"); // Volta à cor original
          }
        })
        .on("click", (event, d) => {
          selectedCountry = d.Country; // Atualiza o país selecionado
          updateCountry(selectedCountry);
          updateRadialChart(minYear, maxYear, selectedCountry); // Atualiza o gráfico radial

          // Atualiza a cor dos círculos
          svg.selectAll("circle")
            .style("fill", (d) => (d.Country === selectedCountry ? "blue" : "#69b3a2"));
        });

      circles.exit()
        .transition()
        .duration(500)
        .attr("y", height)
        .attr("height", 0)
        .remove();
    }
  );

}
// Function to create scatterplot
function createScatterPlot(minYear, maxYear, country) {
  let selectedCountry = country;
  // Remove svg if exste to avoid sobreposition
  d3.select("#scatterplot").select("svg").remove();

  // Define margins
  var margin = { top: 5, right: 15, bottom: 50, left: 60 },
    width = 600,
    height = 250 - margin.top - margin.bottom;

  // Add svg elemnet to page
  var svg = d3
    .select("#scatterplot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    ;

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
        .attr("id", "x-axis-label")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickFormat(formatAbbreviation).ticks(5))
        .style("font-size", "10px");

      // axis Y
      var y = d3.scaleLog()
        .base(10)
        .domain([1, 250000])
        .range([height, 0]);

      // Add Y-axis with real (linear) values displayed
      svg.append("g")
        .attr("id", "y-axis-label")
        .call(d3.axisLeft(y)
          .ticks(5)
          .tickFormat(d3.format(".1e"))) // Display in scientific notation
        .style("font-size", "10px");

      // Name of axis X
      svg
        .append("text")
        .attr(
          "transform",
          "translate(" + width / 2 + " ," + (height + margin.bottom - 10) + ")"
        )
        .style("text-anchor", "middle")
        .text("Disaster density (disasters per 1000km2 for countries with area > 5000km2)");
      // Name of axis Y
      svg
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 20)
        .attr("x", 0 - height / 2)
        .attr("dy", "-.5em")
        .style("text-anchor", "middle")
        .text("Total Deaths (logarithmic)");

      var tooltip = d3.select("#tooltip"); // Select tooltip

      // add points to graph

      svg
        .append("g")
        .attr("id", "scatter-points")
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
        .style("fill", (d) => (d.Country === selectedCountry ? "blue" : "#69b3a2"))
        .on("mouseover", function (event, d) {
          tooltip.transition().duration(200).style("opacity", 0.9);

          tooltip
            .html(
              `<strong>${d.Country}</strong><br>` + // Display country
              `Disasters density: ${d.disasters_per_area.toFixed(1)}<br>` + // Show disasters per area
              `Total Deaths: ${d.total_deaths.toExponential(2)}` // Show total deaths in scientific notation
            )
            .style("left", (event.clientX + 10) + "px")
            .style("top", (event.clientY - 20) + "px");
          d3.select(this).style("fill", "#fc8d62");
        })
        .on("mouseout", function (e, d) {
          tooltip.transition().duration(100).style("opacity", 0);
          if (selectedCountry === d.Country) {
            d3.select(this).style("fill", "blue");
          } else {
            d3.select(this).style("fill", "#69b3a2"); // Volta à cor original
          }
        })
        .on("click", (event, d) => {
          selectedCountry = d.Country; // Atualiza o país selecionado
          updateCountry(selectedCountry);
          updateRadialChart(minYear, maxYear, selectedCountry); // Atualiza o gráfico radial

          // Atualiza a cor dos círculos
          svg.selectAll("circle")
            .style("fill", (d) => (d.Country === selectedCountry ? "blue" : "#69b3a2"));
        });
    }
  );
}

// load graph
document.addEventListener("DOMContentLoaded", function () {
  createScatterPlot(minYear, maxYear);
});
