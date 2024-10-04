const width = 360,
  height = 320,
  chartRadius = height / 2 - 40;

const color = d3.scaleOrdinal(d3.schemeCategory10);



let svg = d3.select('#radialChart').append('svg')
  .attr('width', width)
  .attr('height', height)
  .append('g')
  .attr('transform', `translate(${width / 2}, ${height / 2})`);

let tooltip = d3.select('#radialChart').append('div')
  .attr('class', 'tooltip') // Mantenha a classe da sua div
  .style('position', 'absolute')  // Certifique-se de que a tooltip está posicionada como absoluta
  .style('display', 'none'); // Inicialmente oculta
const PI = Math.PI,
  arcMinRadius = 10,
  arcPadding = 10,
  labelPadding = -5,
  numTicks = 10;

// Carregar o CSV
d3.csv('energy.csv').then(data => {

  // Convertendo valores para números
  data.forEach(d => {
    d.value = +d.value;
  });

  const scale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.value) * 1.1])
    .range([0, 2 * PI]);

  const ticks = scale.ticks(numTicks).slice(0, -1);
  const keys = data.map(d => d.name);

  const numArcs = keys.length;
  const arcWidth = (chartRadius - arcMinRadius - numArcs * arcPadding) / numArcs;

  const arc = d3.arc()
    .innerRadius((d, i) => getInnerRadius(i, numArcs, arcWidth))
    .outerRadius((d, i) => getOuterRadius(i, numArcs, arcWidth))
    .startAngle(0)
    .endAngle((d, i) => scale(d.value));

  // Radial Axis
  const radialAxis = svg.append('g')
    .attr('class', 'r axis')
    .selectAll('g')
    .data(data)
    .enter().append('g');

  radialAxis.append('circle')
    .attr('r', (d, i) => getOuterRadius(i, numArcs, arcWidth) + arcPadding);

  radialAxis.append('text')
    .attr('x', labelPadding)
    .attr('y', (d, i) => -getOuterRadius(i, numArcs, arcWidth) + arcPadding)
    .text(d => d.name);

  // Axial Axis
  const axialAxis = svg.append('g')
    .attr('class', 'a axis')
    .selectAll('g')
    .data(ticks)
    .enter().append('g')
    .attr('transform', d => `rotate(${rad2deg(scale(d)) - 90})`);

  axialAxis.append('line')
    .attr('x2', chartRadius);

  axialAxis.append('text')
    .attr('x', chartRadius + 10)
    .style('text-anchor', d => (scale(d) >= PI && scale(d) < 2 * PI ? 'end' : null))
    .attr('transform', d => `rotate(${90 - rad2deg(scale(d))},${chartRadius + 10},0)`)
    .text(d => d);

  // Data Arcs
  const arcs = svg.append('g')
    .attr('class', 'data')
    .selectAll('path')
    .data(data)
    .enter().append('path')
    .attr('class', 'arc')
    .style('fill', (d, i) => color(i));

  arcs.transition()
    .delay((d, i) => i * 200)
    .duration(1000)
    .attrTween('d', (d, i) => arcTween(d, i, arc));

  // Eventos de Mouse
  arcs.on('mousemove', (event, d) => showTooltip(event, d));
  arcs.on('mouseout', hideTooltip);

});

// Função para interpolação do arco
function arcTween(d, i, arc) {
  const interpolate = d3.interpolate(0, d.value);
  return t => arc({ value: interpolate(t) }, i);
}

// Funções para mostrar e esconder tooltip
function showTooltip(event, d) {
  const svgPosition = svg.node().getBoundingClientRect(); // Posição do contêiner SVG

  tooltip.html(`<strong>${d.value}</strong>`)
    .style("display", "block") // Mostrar tooltip
    .style("left", (event.clientX - 844) + "px") // Ajustar posição horizontal
    .style("top", (event.clientY - svgPosition.top - 20) + "px");  // Ajustar posição vertical
}


function hideTooltip() {
  tooltipTimeout = setTimeout(() => {
    tooltip.style('display', 'none'); // Esconder tooltip
  }, 1000); // 100 ms de atraso para evitar o piscar
}

// Funções auxiliares
function rad2deg(angle) {
  return angle * 180 / Math.PI;
}

function getInnerRadius(index, numArcs, arcWidth) {
  return arcMinRadius + (numArcs - (index + 1)) * (arcWidth + arcPadding);
}

function getOuterRadius(index, numArcs, arcWidth) {
  return getInnerRadius(index, numArcs, arcWidth) + arcWidth;
}
