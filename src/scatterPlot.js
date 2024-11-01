/* //call fucntion with new parameters
function updateScatterPlot(minYear, maxYear,country) {
  createScatterPlot(minYear, maxYear,country);
} */

var selection_color = "#1ed928"
var dot_color = '#1F5F5B' 

function processData(data, minYear, maxYear,regions) {
  // Filter data with range
  if(regions=== undefined){
    regions = ['Asia', 'Americas', 'Africa', 'Europe', 'Oceania'];

  }
  const filteredData = data.filter(
    (d) =>
      d.StartYear >= minYear && d.StartYear <= maxYear && d.land_area > 5000 && regions.includes(d.Region) 
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
    acc[country].total_deaths +=
      +current.total_deaths == 0 ? 1 : +current.total_deaths;
    return acc;
  }, {});

  return Object.values(groupedData);
}

// Function to create scatterplot
function updateScatterPlot(minYear, maxYear, country,regions) {
  // Define margins
  var margin = { top: 5, right: 15, bottom: 50, left: 60 },
    width = 600,
    height = 250 - margin.top - margin.bottom;

  // Add svg elemnet to page
  var svg = d3.select("#scatterplot").select("svg");

  // read csv
  d3.csv("satinize_dataset/pre-processing/disasters_per_country.csv").then(
    function (data) {
      var filteredData = processData(data, minYear, maxYear,regions);


      var maxY = d3.max(filteredData, function (d) {
        return d.total_deaths;
      });
      var maxX = d3.max(filteredData, function (d) {
        return d.disasters_per_area;
      });

      var formatAbbreviation = d3.format(".2s");

      // axis X
      var x = d3.scaleLog().base(10).domain([1, 50000]).range([0, width]);

      // axis Y
      var y = d3.scaleLog().base(10).domain([1, 250000]).range([height, 0]);

      svg
        .select("#x-axis-label")
        .transition()
        .duration(1000)
        .style("font-size", "10px");

      var tooltip = d3.select("#tooltip"); // Select tooltip

      // add points to graph

      const circles = svg
        .select("#scatter-points")
        .selectAll("circle")
        .data(filteredData); // Use filteredData aqui

      circles
        .transition()
        .duration(1000)
        .attr("cx", function (d) {
          return x(d.disasters_per_area);
        })
        .attr("cy", function (d) {
          return y(d.total_deaths);
        })
        .style("fill", (d) =>{
          return d.Country === selectedCountry ? selection_color : dot_color
          }
        );

      circles
        .enter()
        .append("circle")
        .attr("cx", function (d) {
          return x(d.disasters_per_area);
        })
        .attr("cy", function (d) {
          return y(d.total_deaths);
        })
        .attr("r", 3)
        .style("fill", (d) =>
          d.Country === selectedCountry ? selection_color : dot_color
        )
        .on("mouseover", function (event, d) {
          tooltip.transition().duration(200).style("opacity", 0.9);

          const formatNumber = d3.format(".2s");
          tooltip
            .html(
              `<strong>${d.Country}</strong><br>` + // Display country
                `Disasters density: ${d.disasters_per_area.toFixed(1)<500 ? d.disasters_per_area.toFixed(1) : formatNumber(d.disasters_per_area.toFixed(1))}<br>` + // Show disasters per area
                `Total Deaths: ${d.total_deaths<500 ? d.total_deaths : formatNumber(d.total_deaths)}` // Show total deaths in scientific notation
            )
            .style("left", event.clientX + 10 + "px")
            .style("top", event.clientY - 20 + "px");
          d3.select(this).style("fill", "#fc8d62");
        })
        .on("mouseout", function (e, d) {
          tooltip.transition().duration(100).style("opacity", 0);
          if (selectedCountry === d.Country) {
            d3.select(this).style("fill", selection_color);
          } else {
            d3.select(this).style("fill", dot_color); // Volta à cor original
          }
        })
        .on("click", (event, d) => {
          if (selectedCountry === d.Country) {
            // Se o país já está selecionado, deselect
            selectedCountry = null; // Reseta a seleção

            // Atualiza a cor dos círculos para o estado não selecionado
            svg.selectAll("circle").style("fill", dot_color); // Cor padrão dos círculos
            selectCountryInSearch(selectedCountry);
            // Aqui você pode querer também limpar ou resetar outros gráficos, se necessário
            updateCountry(null); // Atualiza o país, se necessário
            updateRadialChart(minYear, maxYear, null, globalFilter); // Atualiza o gráfico radial com valores nulos
            updateChoropleth(minYear, maxYear, null, globalFilter); // Atualiza o choropleth com valores nulos
          } else {
            
            selectedCountry = d.Country; 
            updateCountry(selectedCountry);
            selectCountryInSearch(selectedCountry);
            updateRadialChart(minYear, maxYear, selectedCountry, globalFilter); 
            updateChoropleth(minYear, maxYear, selectedCountry, globalFilter); 

            // Atualiza a cor dos círculos
            svg
              .selectAll("circle")
              .style("fill", (d) =>
                d.Country === selectedCountry ? selection_color : dot_color
              );
          }
        });

      circles
        .exit()
        .transition()
        .duration(500)
        .attr("y", height)
        .attr("height", 0)
        .remove();
    }
  );
}
// Function to create scatterplot
function createScatterPlot(minYear, maxYear, country,regions) {

  // Remove svg if exste to avoid sobreposition
  d3.select("#scatterplot").select("svg").remove();

  // Define margins
  var margin = { top: 5, right: 15, bottom: 50, left: 60 },
    width = 580,
    height = 240 - margin.top - margin.bottom;

  // Add svg elemnet to page
  var svg = d3
    .select("#scatterplot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  // read csv
  d3.csv("satinize_dataset/pre-processing/disasters_per_country.csv").then(
    function (data) {
      var filteredData = processData(data, minYear, maxYear,regions);

      var maxY = d3.max(filteredData, function (d) {
        return d.total_deaths;
      });
      var maxX = d3.max(filteredData, function (d) {
        return d.disasters_per_area;
      });


      var formatAbbreviation = d3.format(".2s");
      // axis X
      var x = d3.scaleLog().base(10).domain([1, 50000]).range([0, width]);

      // add ticks
      var xAxis = d3.axisBottom(x)
        .tickValues([1, 10, 100, 1000, 10000]) // Labeled ticks at powers of 10
        .tickFormat(d3.format(".1s"))          // Format powers of 10 using scientific notation
        .tickSize(10);                         // Standard tick size for labeled ticks

      // Add minor ticks
      var minorTicks = d3.axisBottom(x)
        .tickValues([2, 3, 4, 5, 6, 7, 8, 9, 20, 30, 40, 50, 60, 70, 80, 90, 200, 300, 400, 500, 600, 700, 800, 900, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 20000, 30000, 40000, 50000])
        .tickSize(5)                           // Smaller tick size for unlabeled minor ticks
        .tickFormat("");                       // No labels for minor ticks     

      // Append the x-axis to the svg
      svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")
        .style("font-size", "10px")
        .style("text-anchor", "end");

      // Append the minor ticks to the x-axis
      svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(minorTicks);


      // axis Y
      var y = d3.scaleLog().base(10).domain([1, 250000]).range([height, 0]);

      // Add Y-axis with real (linear) values displayed
      svg
        .append("g")
        .attr("id", "y-axis-label")
        .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format(".1s"))) // Display in scientific notation
        .style("font-size", "10px");

      // Name of axis X
      svg
        .append("text")
        .attr(
          "transform",
          "translate(" + width / 2 + " ," + (height + margin.bottom - 10) + ")"
        )
        .style("text-anchor", "middle")
        .attr("font-size", "14px")
        .text("Number of disasters per 10K km²");
      // Name of axis Y
      svg
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 20)
        .attr("x", 0 - height / 2)
        .attr("dy", "-.5em")
        .style("text-anchor", "middle")
        .attr("font-size", "14px")
        .text("Total Deaths");

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
        .style("fill", (d) =>{
          if (d.Country === selectedCountry) {
            return selection_color;
          }else {
            return dot_color;
          }
        })
        .on("mouseover", function (event, d) {
          tooltip.transition().duration(200).style("opacity", 0.9);
          const formatNumber = d3.format(".2s");
          tooltip
            .html(
              `<strong>${d.Country}</strong><br>` + // Display country
                `Disasters density: ${d.disasters_per_area.toFixed(1)<500 ? d.disasters_per_area.toFixed(1) : formatNumber(d.disasters_per_area.toFixed(1))}<br>` + // Show disasters per area
                `Total Deaths: ${d.total_deaths<500 ? d.total_deaths : formatNumber(d.total_deaths)}` // Show total deaths in scientific notation
            )
            .style("left", event.clientX - 180 + "px")
            .style("top", event.clientY - 88 + "px");
          d3.select(this).style("fill", "#fc8d62")
          .attr("r", 5); // Change dot size
        })
        .on("mouseout", function (e, d) {
          tooltip.transition().duration(100).style("opacity", 0);
          if (selectedCountry === d.Country) {
            d3.select(this).style("fill", selection_color).attr("r", 3); // Change dot size;
          }
          else {
            d3.select(this).style("fill", dot_color).attr("r", 3); // Change dot size; // Volta à cor original
          }
        })
        .on("click", (event, d) => {
          if (selectedCountry === d.Country) {
            // Se o país já está selecionado, deselect
            selectedCountry = null; // Reseta a seleção
            selectCountryInSearch(selectedCountry);

            // Atualiza a cor dos círculos para o estado não selecionado
            svg.selectAll("circle").style("fill", dot_color) // Cor padrão dos círculos
            .attr("r", 3); // Default size

            // Aqui você pode querer também limpar ou resetar outros gráficos, se necessário
            updateCountry(null); // Atualiza o país, se necessário
            updateRadialChart(minYear, maxYear, null, globalFilter); // Atualiza o gráfico radial com valores nulos
            updateChoropleth(minYear, maxYear, null, globalFilter); // Atualiza o choropleth com valores nulos
          } else {
            // Se o país não está selecionado, seleciona-o
            selectedCountry = d.Country; // Atualiza o país selecionado
            selectCountryInSearch(selectedCountry);
            updateCountry(selectedCountry);
            updateRadialChart(minYear, maxYear, selectedCountry, globalFilter); // Atualiza o gráfico radial
            updateChoropleth(minYear, maxYear, selectedCountry, globalFilter); // Atualiza o choropleth

            // Atualiza a cor dos círculos
            svg
              .selectAll("circle")
              .style("fill", (d) => d.Country === selectedCountry ? selection_color : dot_color)
              .attr("r", (d) => d.Country === selectedCountry ? 5 : 3 // Larger size if selected
              );
          }
        });
    }
  );
}

// load graph
document.addEventListener("DOMContentLoaded", function () {
  createScatterPlot(minYear, maxYear);
});
