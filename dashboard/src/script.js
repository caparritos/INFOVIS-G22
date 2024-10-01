const width = 960;
const height = 600;

const svg = d3
  .select("#map")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

// Define a projection
const projection = d3
  .geoNaturalEarth1()
  .scale(150)
  .translate([width / 2, height / 2]);

const path = d3.geoPath().projection(projection);

// Load CSV data and filter for the year 2000
d3.csv("../../satinize_dataset/pre-processing/disasters_per_country.csv").then(
  function (data) {
    const filteredData = data.filter((d) => d.StartYear === "2000");
    console.log(...filteredData);
    const dataMap = new Map(
      filteredData.map((d) => [d.Country, +d.total_deaths])
    );
    console.log(...dataMap);

    // Define color scale
    const colorScale = d3
      .scaleSequential()
      .domain([0, d3.max(filteredData, (d) => +d.total_deaths)])
      .interpolator(d3.interpolateBlues);

    // Load GeoJSON data
    d3.json(
      "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"
    ).then(function (geoData) {
      svg
        .append("g")
        .selectAll("path")
        .data(geoData.features)
        .enter()
        .append("path")
        .attr("class", "region")
        .attr("d", path)
        .attr("fill", (d) => {
          const value = dataMap.get(d.properties.name);
          return value ? colorScale(value) : "#ccc"; // If no data, color gray
        });
    });
  }
);
