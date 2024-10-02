const width = 500,
  height = 300,
  chartRadius = height / 2 - 40;

const color = d3.scaleOrdinal(d3.schemeCategory10);

let svg = d3.select('#radialChart').append('svg')
  .attr('width', width)
  .attr('height', height)
  .append('g')
    .attr('transform', `translate(${width / 2}, ${height / 2})`);

let tooltip = d3.select('body').append('div')
  .attr('class', 'tooltip');

// Constantes
const PI = Math.PI,
  arcMinRadius = 10,
  arcPadding = 10,
  labelPadding = -5,
  numTicks = 10;

// Carregando o CSV
d3.csv('energy.csv').then(data => {
  

  data.forEach(d => {
    d.value = +d.value;
  });


  let scale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.value) * 1.1])
    .range([0, 2 * PI]);

  let ticks = scale.ticks(numTicks).slice(0, -1);
  let keys = data.map(d => d.name);

  const numArcs = keys.length;
  const arcWidth = (chartRadius - arcMinRadius - numArcs * arcPadding) / numArcs;

  let arc = d3.arc()
    .innerRadius((d, i) => getInnerRadius(i))
    .outerRadius((d, i) => getOuterRadius(i))
    .startAngle((d, i) => 0) 
    .endAngle((d, i) => scale(d.value)); 

  // Eixos Radiais
  let radialAxis = svg.append('g')
    .attr('class', 'r axis')
    .selectAll('g')
    .data(data)
    .enter().append('g');

  radialAxis.append('circle')
    .attr('r', (d, i) => getOuterRadius(i) + arcPadding);

  radialAxis.append('text')
    .attr('x', labelPadding)
    .attr('y', (d, i) => -getOuterRadius(i) + arcPadding)
    .text(d => d.name);

  // Eixos Axiais
  let axialAxis = svg.append('g')
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

  // Arcos de Dados
  let arcs = svg.append('g')
    .attr('class', 'data')
    .selectAll('path')
    .data(data)
    .enter().append('path')
      .attr('class', 'arc')
      .style('fill', (d, i) => color(i))
      .style('opacity', 1) // Mantendo a opacidade inicial
      .attr('d', arc)
      .on('mousemove', showTooltip)
      .on('mouseout', hideTooltip);
  
  // Transição
  arcs.transition()
    .delay((d, i) => i * 200)
    .duration(1000)
    .attrTween('d', function(d, i) {
      let interpolate = d3.interpolate(0, d.value);
      return function(t) {
        return arc({
          value: interpolate(t)
        }, i);
      };
    });

  function showTooltip(event, d) {
    tooltip.style('left', (event.pageX + 10) + 'px')
      .style('top', (event.pageY - 25) + 'px')
      .style('display', 'inline-block')
      .html(d.value);
  }

  function hideTooltip() {
    tooltip.style('display', 'none');
  }

  function rad2deg(angle) {
    return angle * 180 / PI;
  }

  function getInnerRadius(index) {
    return arcMinRadius + (numArcs - (index + 1)) * (arcWidth + arcPadding);
  }

  function getOuterRadius(index) {
    return getInnerRadius(index) + arcWidth;
  }
});
