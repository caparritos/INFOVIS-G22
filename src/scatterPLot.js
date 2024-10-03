function updateScatterPlot(minYear, maxYear) {
  console.log(`Updating scatter plot with range: ${minYear} to ${maxYear}`);
  
  // Chama a função para criar o gráfico com os novos limites
  createScatterPlot(minYear, maxYear);
}

// Função para criar o scatterplot
function createScatterPlot(minYear,maxYear) {
    // Remove qualquer SVG existente para evitar sobreposição
    d3.select("#scatterplot").select("svg").remove();
    
    
    // Define as margens e dimensões do gráfico
    var margin = {top: 10, right: 15, bottom:50, left: 50},
        width = 600 ,
        height = 300 - margin.top - margin.bottom;
  
    // Adiciona o elemento SVG à página
    var svg = d3.select("#scatterplot")
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
    // Lê os dados CSV
    d3.csv("../satinize_dataset/pre-processing/disasters_per_country.csv").then(function(data) {
      var filteredData = data.filter(function(d) {
        return d.StartYear >= minYear && d.StartYear <= maxYear;
    });

    
    var maxY = d3.max(filteredData, function(d) { return d.num_disasters; });
    var maxX = d3.max(filteredData, function(d) { return d.total_deaths; });
    console.log(parseInt(maxY)+10)
    console.log(maxX)
      // Eixo X
      var x = d3.scaleLinear()
        .domain([0, parseInt(maxX)])
        .range([ 0, width ]);
      svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .style("font-size", "10px");

        

    // Rótulo do eixo X
    svg.append("text")
        .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.bottom - 10) + ")") // Posiciona o rótulo
        .style("text-anchor", "middle")
        .text("Total de Mortes");
        
  
      // Eixo Y
      var y = d3.scaleLinear()
        .domain([0, parseInt(maxY)])
        .range([ height, 0]);
      svg.append("g")
        .call(d3.axisLeft(y))
        .style("font-size", "10px");
      

    // Rótulo do eixo Y
    svg.append("text")
        .attr("transform", "rotate(-90)") // Rotaciona o texto
        .attr("y", 0 - margin.left + 20) // Posiciona o rótulo
        .attr("x", 0 - (height / 2)) // Para o centro
        .style("text-anchor", "middle")
        .text("Número de Desastres");

  
      // Adiciona os pontos (dots) ao gráfico
      svg.append('g')
        .selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
          .attr("cx", function (d) { return x(d.total_deaths); } )
          .attr("cy", function (d) { return y(d.num_disasters); } )
          .attr("r", 3)
          .style("fill", "#69b3a2");
    });
  }
  
  // Executa o código após o carregamento completo da página
  document.addEventListener("DOMContentLoaded", function() {
    createScatterPlot(minYear,maxYear);
  });
  