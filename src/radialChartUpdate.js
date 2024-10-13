//call fucntion with new parameters
const radialChartOldData = {}

function updateRadialChart(minYear, maxYear, country) {
	//createRadialChart(minYear, maxYear, country);

	let svg = d3.select('#radialChart').select('#naturalDisasters');
	let svg2 = d3.select('#radialChart').select('#techDisasters');

	data = radialChartData;
	data.forEach(d => {
		d.frequency = +d.frequency;
	});

	const dataNatural = data.filter(
		d => d.DisasterGroup == 'Natural' && d.StartYear >= minYear && d.StartYear <= maxYear && (country === null || country === undefined || d.Country === country))

	const dataTechnological = data.filter(
		d => d.DisasterGroup == 'Technological' && d.StartYear >= minYear && d.StartYear <= maxYear && (country === null || country === undefined || d.Country === country))

	// Group by 'DisasterSubgroup' and sum frequency
	const groupedDataNatural = Array.from(d3.group(dataNatural, d => d.DisasterSubgroup), ([key, values]) => ({
		DisasterSubgroup: key,
		frequency: d3.sum(values, v => v.frequency)
	})).sort((a, b) => b.frequency - a.frequency);;

	const groupedDataTechnological = Array.from(d3.group(dataTechnological, d => d.DisasterSubgroup), ([key, values]) => ({
		DisasterSubgroup: key,
		frequency: d3.sum(values, v => v.frequency)
	})).sort((a, b) => b.frequency - a.frequency);;

	const scaleNatural = d3.scaleLinear()
		.domain([0, d3.max(groupedDataNatural, d => d.frequency) * 1.1])
		.range([0, (3 * PI) / 2]);

	const scaleTechnological = d3.scaleLinear()
		.domain([0, d3.max(groupedDataTechnological, d => d.frequency) * 1.1])
		.range([0, (3 * PI) / 2]);

	const ticksNatural = scaleNatural.ticks(numTicks).slice(0, -1);
	const ticksTechnological = scaleTechnological.ticks(numTicks).slice(0, -1);
	const keys = data.map(d => d.DisasterSubgroup);

	const numArcsNatural = groupedDataNatural.length;
	const numArcsTechnological = groupedDataTechnological.length;
	const arcWidthNatural = (chartRadius - arcMinRadius - numArcsNatural * arcPadding) / numArcsNatural;
	const arcWidthTechnological = (chartRadius - arcMinRadius - numArcsTechnological * arcPaddingTechnological) / numArcsTechnological;

	const arcNatural = d3.arc()
		.innerRadius((d, i) => getInnerRadius(i, numArcsNatural, arcWidthNatural))
		.outerRadius((d, i) => getOuterRadius(i, numArcsNatural, arcWidthNatural))
		.startAngle(0)
		.endAngle((d, i) => scaleNatural(d.value));

	const arcTechnological = d3.arc()
		.innerRadius((d, i) => getInnerRadius(i, numArcsTechnological, arcWidthTechnological))
		.outerRadius((d, i) => getOuterRadius(i, numArcsTechnological, arcWidthTechnological))
		.startAngle(0)
		.endAngle((d, i) => scaleTechnological(d.value));


	const oldDataNatural = radialChartOldData["country"] == country ? radialChartOldData["natural"] : undefined;
	const oldDataTech = radialChartOldData["country"] == country ? radialChartOldData["natural"] : undefined;
	updateRadialChartSingle(svg, groupedDataNatural, /* oldDataNatural */ undefined, arcNatural, numArcsNatural, arcWidthNatural, arcPaddingNatural, ticksNatural, scaleNatural)
	updateRadialChartSingle(svg2, groupedDataTechnological, /* oldDataTech */ undefined, arcTechnological, numArcsTechnological, arcWidthTechnological, arcPaddingTechnological, ticksTechnological, scaleTechnological)

	radialChartOldData["natural"] = groupedDataNatural
	radialChartOldData["tech"] = groupedDataTechnological
	radialChartOldData["country"] = country
}

function updateRadialChartSingle(svg, data, oldData, arc, numArcs, arcWidth, arcPadding, ticks, scale) {
	let tooltip = d3.select('#radialChart').select('div')

	// Radial Axis
	const radialAxis = svg.select('.r')
		.selectAll('g')
		.data(data)



	//radial
	radialAxis.transition().duration(1000)
		.select('text')
		.attr('y', (d, i) => -getOuterRadius(i, numArcs, arcWidth) + arcPadding)
		.text(d => d.DisasterSubgroup);

	radialAxis.enter().append('g')
		.append('text')
		.attr('x', labelPadding)
		.attr('y', (d, i) => -getOuterRadius(i, numArcs, arcWidth) + arcPadding)
		.text(d => d.DisasterSubgroup);

	radialAxis.exit()
		.transition().duration(500)
		.attr("transform", "translate(0, 100)")
		.style("opacity", 0)
		.remove()

	// Axial Axis
	const axialAxis = svg.select('.a')
		.selectAll('g')
		.data(ticks);

	axialAxis.transition().duration(500)
		.attr('transform', d => `rotate(${rad2deg(scale(d)) - 90})`)
		.select("text")
		.style('text-anchor', d => (scale(d) >= PI && scale(d) < 2 * PI ? 'end' : null))
		.attr('transform', d => `rotate(${90 - rad2deg(scale(d))},${chartRadius + 10},0)`)
		.text(d => d);

	const newAxialAxis = axialAxis.enter().append('g')
		.attr('transform', d => `rotate(${rad2deg(scale(d)) - 90})`);

	newAxialAxis.append('line')
		.attr('x2', chartRadius);

	newAxialAxis.append('text')
		.attr('x', chartRadius + 10)
		.style('text-anchor', d => (scale(d) >= PI && scale(d) < 2 * PI ? 'end' : null))
		.attr('transform', d => `rotate(${90 - rad2deg(scale(d))},${chartRadius + 10},0)`)
		.text(d => d);

	axialAxis.exit().remove();


	// Data Arcs
	const arcs = svg.select('.data')
		.selectAll('path')
		.data(data);

	arcs.transition()
		.duration(1000)
		.attrTween('d', (d, i) => arcTween(d, i, arc, oldData?.[i].frequency ?? 0));
	const newArcs = arcs.enter().append('path')
		.attr('class', 'arc')
		.style('fill', colorNatural);

	newArcs.transition()
		.delay((d, i) => i * 200)
		.duration(1000)
		.attrTween('d', (d, i) => arcTween(d, i, arc));

	// Mouse actions 
	newArcs.on('mousemove', (event, d) => showTooltip(event, d, tooltip));
	newArcs.on('mouseout', (e, d) => hideTooltip(tooltip));

	arcs.exit().remove()
}