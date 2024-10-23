// SIZE OF SVG (GRAPH)
const width = 340,
  height = 320,
  chartRadius = height / 2 - 40;

// COLOR OF BARS
const colorNatural = "#fc8d62";
const colorTechnological = "#1f78b4";

const PI = Math.PI,
  arcMinRadius = 10,
  arcPaddingNatural = 10,
  arcPadding = 5,
  arcPaddingTechnological = 20,
  labelPadding = -8,
  numTicks = 10;

var radialChartData = undefined;

const DisasterInfo = {
  "Biological": "are mostly epidemics.",
  "Climatological": "can be droughts or wildfires.",
  "Geophysical": "can be earthquakes, volcanic activity or landslides.",
  "Hydrological": "are mostly floods.",
  "Industrial accident": "can be caused by chemical spills, gas leaks, oil spills, radiation, etc.",
  "Meteorological": "can be extreme temperatures or storms.",
  "Miscellaneous accident": "vary from collapse to explosions to fires.",
  "Transport": "can be from plane crashes, train derailments, etc.",
  "No Data": ""
}

function createRadialChart(minYear, maxYear, country) {
  d3.select("#radialChart").selectAll("svg").remove();

  // ADD SVG TO RADIAL CHART DIV
  let svg = d3
    .select("#radialChart")
    .append("svg")
    .attr("id", "naturalDisasters")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  // Adicionar o segundo SVG para o segundo gráfico (lado a lado)
  let svg2 = d3
    .select("#radialChart")
    .append("svg")
    .attr("id", "techDisasters")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`); // Mesmo centro

  // // SELECT WHERE TO PUT TOOLTIP DIV
  // let tooltip = d3.select('html').append('div')
  //   .attr("id", "radialChartTooltip")
  //   .attr('class', 'tooltip')
  //   .style('position', 'absolute')
  //   .style('display', 'none');
  var tooltip = d3.select("#tooltip"); // Select tooltip

  d3.csv(
    "satinize_dataset/pre-processing/disaster_subgroup_frequency.csv"
  ).then((data) => {
    if (radialChartData === undefined) radialChartData = data;
    // Convert values to numbers
    data.forEach((d) => {
      d.frequency = +d.frequency;
      d.num_disasters = +d.num_disasters;
    });

    const dataNatural = data.filter(
      (d) =>
        d.DisasterGroup == "Natural" &&
        d.StartYear >= minYear &&
        d.StartYear <= maxYear &&
        (country === null || country === undefined || d.Country === country)
    );

    const dataTechnological = data.filter(
      (d) =>
        d.DisasterGroup == "Technological" &&
        d.StartYear >= minYear &&
        d.StartYear <= maxYear &&
        (country === null || country === undefined || d.Country === country)
    );

    // Group by 'DisasterSubgroup' and sum frequency
    let groupedDataNatural = Array.from(
      d3.group(dataNatural, (d) => d.DisasterSubgroup),
      ([key, values]) => ({
        DisasterSubgroup: key,
        num_disasters: d3.sum(values, (v) => v.frequency),
        total_deaths: d3.sum(values, (d) => d.total_deaths),
      })
    ).sort((a, b) => b[globalFilter] - a[globalFilter]);

    let groupedDataTechnological = Array.from(
      d3.group(dataTechnological, (d) => d.DisasterSubgroup),
      ([key, values]) => ({
        DisasterSubgroup: key,
        num_disasters: d3.sum(values, (v) => v.frequency),
        total_deaths: d3.sum(values, (d) => d.total_deaths),
      })
    ).sort((a, b) => b[globalFilter] - a[globalFilter]);

    const scaleNatural = d3
      .scaleLinear()
      .domain([0, d3.max(groupedDataNatural, (d) => d[globalFilter]) * 1.1])
      .range([0, (3 * PI) / 2]);

    const scaleTechnological = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(groupedDataTechnological, (d) => d[globalFilter]) * 1.1,
      ])
      .range([0, (3 * PI) / 2]);

    const ticksNatural = scaleNatural.ticks(numTicks).slice(0, -1);
    const ticksTechnological = scaleTechnological.ticks(numTicks).slice(0, -1);
    const keys = data.map((d) => d.DisasterSubgroup);

    const numArcsNatural = groupedDataNatural.length;
    const numArcsTechnological = groupedDataTechnological.length;
    const arcWidthNatural =
      (chartRadius - arcMinRadius - numArcsNatural * arcPadding) /
      numArcsNatural;
    const arcWidthTechnological =
      (chartRadius -
        arcMinRadius -
        numArcsTechnological * arcPaddingTechnological) /
      numArcsTechnological;

    const arcNatural = d3
      .arc()
      .innerRadius((d, i) => getInnerRadius(i, numArcsNatural, arcWidthNatural))
      .outerRadius((d, i) => getOuterRadius(i, numArcsNatural, arcWidthNatural))
      .startAngle(0)
      .endAngle((d, i) => scaleNatural(d.value));

    const arcTechnological = d3
      .arc()
      .innerRadius((d, i) =>
        getInnerRadius(i, numArcsTechnological, arcWidthTechnological)
      )
      .outerRadius((d, i) =>
        getOuterRadius(i, numArcsTechnological, arcWidthTechnological)
      )
      .startAngle(0)
      .endAngle((d, i) => scaleTechnological(d.value));

    // Radial Axis
    const radialAxis = svg
      .append("g")
      .attr("class", "r axis")
      .selectAll("g")
      .data(groupedDataNatural)
      .enter()
      .append("g");

    radialAxis
      .append("text")
      .attr("x", labelPadding + 3)
      .attr(
        "y",
        (d, i) =>
          -getOuterRadius(i, numArcsNatural, arcWidthNatural) +
          arcPaddingNatural
      )
      .attr("font-size", "14px")
      .text((d) => d.DisasterSubgroup);

    // Radial Axis
    const radialAxis2 = svg2
      .append("g")
      .attr("class", "r axis")
      .selectAll("g")
      .data(groupedDataTechnological)
      .enter()
      .append("g");

    radialAxis2
      .append("text")
      .attr("x", labelPadding + 3)
      .attr(
        "y",
        (d, i) =>
          -getOuterRadius(i, numArcsTechnological, arcWidthTechnological) + 15
      )
      .attr("font-size", "14px")
      .text((d) => d.DisasterSubgroup);

    // Axial Axis
    const axialAxis = svg
      .append("g")
      .attr("class", "a axis")
      .selectAll("g")
      .data(ticksNatural)
      .enter()
      .append("g")
      .attr("transform", (d) => `rotate(${rad2deg(scaleNatural(d)) - 90})`);

    axialAxis.append("line").attr("x2", chartRadius);

    axialAxis
      .append("text")
      .attr("x", chartRadius + 10)
      .style("text-anchor", (d) =>
        scaleNatural(d) >= PI && scaleNatural(d) < 2 * PI ? "end" : null
      )
      .attr(
        "transform",
        (d) => `rotate(${90 - rad2deg(scaleNatural(d))},${chartRadius + 10},0)`
      )
      .text((d) =>
        !Number.isInteger(d) ? "" : d < 500 ? d : d3.format(".2~s")(d)
      );

    // Axial Axis
    const axialAxis2 = svg2
      .append("g")
      .attr("class", "a axis")
      .selectAll("g")
      .data(ticksTechnological)
      .enter()
      .append("g")
      .attr(
        "transform",
        (d) => `rotate(${rad2deg(scaleTechnological(d)) - 90})`
      );

    axialAxis2.append("line").attr("x1", chartRadius - 10);

    axialAxis2
      .append("text")
      .attr("x", chartRadius)
      .style("text-anchor", (d) =>
        scaleTechnological(d) >= PI && scaleTechnological(d) < 2 * PI
          ? "end"
          : null
      )
      .attr(
        "transform",
        (d) => `rotate(${90 - rad2deg(scaleTechnological(d))},${chartRadius},0)`
      )
      .text((d) =>
        !Number.isInteger(d) ? "" : d < 500 ? d : d3.format(".2~s")(d)
      );

    // Data Arcs
    const arcs = svg
      .append("g")
      .attr("class", "data")
      .selectAll("path")
      .data(groupedDataNatural)
      .enter()
      .append("path")
      .attr("class", "arc")
      .style("fill", colorNatural);

    arcs
      .transition()
      .delay((d, i) => i * 200)
      .duration(1000)
      .attrTween("d", (d, i) => arcTween(d, i, arcNatural));

    // Mouse actions
    arcs.on("mousemove", (event, d) => showTooltip(event, d, tooltip, svg));
    arcs.on("mouseout", (e, d) => hideTooltip(tooltip));

    // Data Arcs
    const arcs2 = svg2
      .append("g")
      .attr("class", "data")
      .selectAll("path")
      .data(groupedDataTechnological)
      .enter()
      .append("path")
      .attr("class", "arc")
      .style("fill", colorTechnological);

    arcs2
      .transition()
      .delay((d, i) => i * 200)
      .duration(1000)
      .attrTween("d", (d, i) => arcTween(d, i, arcTechnological));

    // Mouse actions
    arcs2.on("mousemove", (event, d) => showTooltip(event, d, tooltip));
    arcs2.on("mouseout", (e, d) => hideTooltip(tooltip));

    radialChartOldData["natural"] = groupedDataNatural;
    radialChartOldData["tech"] = groupedDataTechnological;
  });
}

function arcTween(d, i, arc, initial = 0) {
  const interpolate = d3.interpolate(initial, d[globalFilter]);
  return (t) => arc({ value: interpolate(t) }, i);
}

//  TOOLTIP FUNCTIONS
function showTooltip(event, d, tooltip) {
  const formatNumber = d3.format(".2~s");
  tooltip.transition().duration(200).style("opacity", 0.9);

  tooltip
    .html(
      `<strong>${country || "World"}</strong><br>
      <span style="font-size: 13px; color: #313538;">${
        d.DisasterSubgroup
      } disasters ${DisasterInfo[d.DisasterSubgroup]}<br></span>
      ${
        d[globalFilter] < 500 ? d[globalFilter] : formatNumber(d[globalFilter])
      } ${globalFilter === "num_disasters" ? "disasters" : "deaths"}`
    )
    .style("left", event.clientX + 10 + "px")
    .style("top", event.clientY - 20 + "px");
}

function hideTooltip(tooltip) {
  tooltip.transition().duration(100).style("opacity", 0);
}

//aux functions
function rad2deg(angle) {
  return (angle * 180) / Math.PI;
}

function getInnerRadius(index, numArcs, arcWidth) {
  return arcMinRadius + (numArcs - (index + 1)) * (arcWidth + arcPadding);
}

function getOuterRadius(index, numArcs, arcWidth) {
  return getInnerRadius(index, numArcs, arcWidth) + arcWidth;
}

// load graph
document.addEventListener("DOMContentLoaded", function () {
  createRadialChart(minYear, maxYear, country);
});
