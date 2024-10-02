// Função para criar o scatterplot
function createScatterPlot() {
    // Remove qualquer SVG existente para evitar sobreposição
    d3.select("#scatterplot").select("svg").remove();
  
    // Define as margens e dimensões do gráfico
    var margin = {top: 10, right: 30, bottom: 30, left: 60},
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;
  
    // Adiciona o elemento SVG à página
    var svg = d3.select("#scatterplot")
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
    // Lê os dados CSV
    d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/2_TwoNum.csv").then(function(data) {
  
      // Eixo X
      var x = d3.scaleLinear()
        .domain([0, 4000])
        .range([ 0, width ]);
      svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));
  
      // Eixo Y
      var y = d3.scaleLinear()
        .domain([0, 500000])
        .range([ height, 0]);
      svg.append("g")
        .call(d3.axisLeft(y));
  
      // Adiciona os pontos (dots) ao gráfico
      svg.append('g')
        .selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
          .attr("cx", function (d) { return x(d.GrLivArea); } )
          .attr("cy", function (d) { return y(d.SalePrice); } )
          .attr("r", 1.5)
          .style("fill", "#69b3a2");
    });
  }
  
  // Executa o código após o carregamento completo da página
  document.addEventListener("DOMContentLoaded", function() {
    createScatterPlot();
  });
  