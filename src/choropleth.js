// cloropeth.js

function drawMap() {
    // The svg
    const svg = d3.select("#choropleth").append("svg")
      .attr("width", 800)
      .attr("height", 600);
  
    const width = 800;
    const height = 600;
  
    // Map and projection
    const projection = d3.geoMercator()
      .scale(70)
      .center([0, 20])
      .translate([width / 2, height / 2]);
  
    const path = d3.geoPath().projection(projection);
  
    // Data and color scale
    let data = new Map();
    const colorScale = d3.scaleThreshold()
      .domain([100000, 1000000, 10000000, 30000000, 100000000, 500000000])
      .range(d3.schemeBlues[7]);
  
    // Load external data and boot
    Promise.all([
      d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
      d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world_population.csv", d => {
        data.set(d.code, +d.pop);
      })
    ]).then(([topo]) => {
      // Draw the map
      svg.append("g")
        .selectAll("path")
        .data(topo.features)
        .join("path")
          .attr("d", path)
          .attr("fill", d => {
            d.total = data.get(d.id) || 0;
            return colorScale(d.total);
          });
    }).catch(err => {
      console.error("Error loading the data: ", err);
    });
  }
  
  // Call the drawMap function when the DOM is fully loaded
  document.addEventListener("DOMContentLoaded", function () {
    drawMap();
  });
  