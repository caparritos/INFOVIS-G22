var selectedCountry = null;
var previousCountry = null;

function updateChoropleth(minYear, maxYear, country,globalFilter) {
  selectedCountry = country
  previousCountry = country
  drawMap(minYear, maxYear, country,globalFilter);
}

function processDataCloropleth(data, minYear, maxYear) {
  // Filtra os dados com base no intervalo de anos
  const filteredData = data.filter((d) => d.StartYear >= minYear && d.StartYear <= maxYear);

  // Agrupa por país e calcula as colunas necessárias
  const groupedData = filteredData.reduce((acc, current) => {
    const country = current.Country;

    if (!acc[country]) {
      acc[country] = {
        Country: country,
        num_disasters: 0,
        total_deaths: 0,
      };
    }

    acc[country].num_disasters += +current.num_disasters;
    acc[country].total_deaths += +current.total_deaths == 0 ? 1 : +current.total_deaths;

    return acc;
  }, {});

  // Retorna o array de objetos agrupados
  return Object.values(groupedData);
}

function drawMap(minYear, maxYear, country,globalFilter) {
  d3.select("#choropleth").select("svg").remove();
  const svg = d3.select("#choropleth").append("svg")
    .attr("width", 830)
    .attr("height", 400);

  const width = 830;
  const height = 400;

  // Mapa e projeção
  const projection = d3.geoMercator()
    .scale(70)
    .center([0, 20])
    .translate([width / 2, height / 2]);

  const path = d3.geoPath().projection(projection);

  // Escala de cores baseada no número de desastres
  const colorScale = globalFilter === 'num_disasters'? d3.scaleThreshold()
    .domain([0, 10, 50,100,200,300,400])  // Defina os limites de desastres conforme necessário
      .range(d3.schemeBuPu[7]):d3.scaleThreshold()
      .domain([0, 10, 50,100,200,300,400])  // Defina os limites de desastres conforme necessário
      .range(d3.schemePuRd[7]);

  // Criação de um grupo para aplicar o zoom
  const g = svg.append("g");

  

  // Carregar dados externos e inicializar o mapa
  Promise.all([
    d3.json("./pkg/world.geojson"),
    d3.csv("../satinize_dataset/pre-processing/disasters_per_country.csv", d => {
      // Converta os valores necessários para números
      d.total_deaths = +d.total_deaths;  
      return d;
    })
  ]).then(([topo, disasters]) => {
    // Filtrar dados conforme minYear, maxYear e opcionalmente o país
    const filteredData = processDataCloropleth(disasters,minYear,maxYear)
    // Mapa para armazenar os dados de desastres por país
    const dataMap = new Map();
    filteredData.forEach(d => {
      dataMap.set(d.Country, d[globalFilter]);
    });

    // Desenhar o mapa
    g.selectAll("path")
      .data(topo.features)
      .join("path")
      .attr("d", path)
      .attr("fill", d => {
        const countryName = d.properties.name;
        var countryData = filteredData.filter(e=>e.Country == d.properties.name)
        var count =countryData == '' ? 0: countryData[0].num_disasters;
        if (globalFilter == 'total_deaths'){
          count = countryData == '' ? 0: countryData[0].total_deaths;
          }

        // Se o país atual for o selecionado, pinta de vermelho, senão usa a escala de cor
        return (country === countryName) ? "red" : colorScale(count);
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 0.5)
      
      .on("mouseover", function(event, d) {
        var countryData = filteredData.filter(e=>e.Country == d.properties.name)
        var count =countryData == '' ? 0: countryData[0].num_disasters;
        var text ='Disasters';
        if (globalFilter == 'total_deaths'){
          console.log('data')
          count = countryData == '' ? 0: countryData[0].total_deaths;
          text = 'Deaths'}
        

        d3.select("#tooltip")
          .style("opacity", 1)
          .html(`<strong>${d.properties.name}</strong><br/>${text}: ${count}`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px");
      })
      .on("mouseout", () => d3.select("#tooltip").style("opacity", 0))
      .on("click", function(event, d) {
        const countryName = d.properties.name;
    
        // Verifica se o país clicado é o mesmo que o anterior
        if (selectedCountry === countryName) {
            // Deseleciona o país, restaurando sua cor original
            g.selectAll("path")
                .filter(d => d.properties.name === countryName)
                .attr("fill", d => {
                    const disastersCount = dataMap.get(d.properties.name) || 0;
                    return colorScale(disastersCount);  // Restaurar a cor original
                });
    
            // Reseta as variáveis de seleção
            previousCountry = null;
            selectedCountry = null; // ou algum valor padrão
        } else {
            // Se houver um país anteriormente selecionado, restauramos sua cor original
            if (previousCountry) {
                g.selectAll("path")
                    .filter(d => d.properties.name === previousCountry)
                    .attr("fill", d => {
                        const disastersCount = dataMap.get(d.properties.name) || 0;
                        return colorScale(disastersCount);  // Restaurar a cor original
                    });
            }
            d3.select(this).attr("fill", "red");
            previousCountry = countryName;
            selectedCountry = countryName;
        }
    
        // Atualiza os gráficos
        updateCountry(selectedCountry);
        updateRadialChart(minYear, maxYear, selectedCountry);
        updateScatterPlot(minYear, maxYear, selectedCountry);
    });
    
      // Add zoom functionality
      const zoom = d3.zoom()
        .scaleExtent([1, 8])  // Define a escala mínima e máxima
        .on("zoom", (event) => {
          g.attr("transform", event.transform);  // Aplica a transformação de zoom ao grupo
        });

      svg.call(zoom);  // Aplica o zoom ao SVG
  })
  .catch(err => {
    console.error("Error loading the data: ", err);
  });
}
// Executa o drawMap quando o DOM estiver totalmente carregado
document.addEventListener("DOMContentLoaded", function () {
  drawMap(minYear,maxYear, country); // Exemplo de chamada para desenhar o mapa
});
