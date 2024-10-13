var selectedCountry = null;
var previousCountry = null;

function updateChoropleth(minYear, maxYear, country) {
  selectedCountry = country
  previousCountry = country
  drawMap(minYear, maxYear, country);
}

function processData(data, minYear, maxYear) {
  // Filtra os dados com base no intervalo de anos
  const filteredData = data.filter((d) => d.StartYear >= minYear && d.StartYear <= maxYear);

  // Agrupa por país e calcula as colunas necessárias
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
    acc[country].total_deaths += +current.total_deaths == 0 ? 1 : +current.total_deaths;

    return acc;
  }, {});

  // Retorna o array de objetos agrupados
  return Object.values(groupedData);
}

function drawMap(minYear, maxYear, country) {
  d3.select("#choropleth").select("svg").remove();
  console.log(previousCountry)
  console.log(selectedCountry)
  // O svg
  const svg = d3.select("#choropleth").append("svg")
    .attr("width", 830)
    .attr("height", 600);

  const width = 800;
  const height = 600;

  // Mapa e projeção
  const projection = d3.geoMercator()
    .scale(70)
    .center([0, 20])
    .translate([width / 2, height / 2]);

  const path = d3.geoPath().projection(projection);

  // Escala de cores baseada no número de desastres
  const colorScale = d3.scaleThreshold()
    .domain([0, 10, 50])  // Defina os limites de desastres conforme necessário
    .range(d3.schemeBlues[7]);

  // Criação de um grupo para aplicar o zoom
  const g = svg.append("g");

  

  // Carregar dados externos e inicializar o mapa
  Promise.all([
    d3.json("./pkg/world.geojson"),
    d3.csv("../satinize_dataset/pre-processing/disasters_per_country.csv", d => {
      // Converta os valores necessários para números
      d.num_disasters = +d.num_disasters;  
      return d;
    })
  ]).then(([topo, disasters]) => {
    // Filtrar dados conforme minYear, maxYear e opcionalmente o país
    const filteredData = disasters.filter(d => 
      d.StartYear >= minYear && 
      d.StartYear <= maxYear && 
      (!country || d.Country === country)
    );

    // Mapa para armazenar os dados de desastres por país
    const dataMap = new Map();
    filteredData.forEach(d => {
      dataMap.set(d.Country, d.num_disasters);
    });

    // Desenhar o mapa
    g.selectAll("path")
      .data(topo.features)
      .join("path")
      .attr("d", path)
      .attr("fill", d => {
        const countryName = d.properties.name;
        const disastersCount = dataMap.get(countryName) || 0;

        // Se o país atual for o selecionado, pinta de vermelho, senão usa a escala de cor
        return (country === countryName) ? "red" : colorScale(disastersCount);
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 0.5)
      
      .on("mouseover", function(event, d) {
        const disastersCount = dataMap.get(d.properties.name) || 0;
        d3.select("#tooltip")
          .style("opacity", 1)
          .html(`<strong>${d.properties.name}</strong><br/>Disasters: ${disastersCount}`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px");
      })
      .on("mouseout", () => d3.select("#tooltip").style("opacity", 0))
      .on("click", function(event, d) {
        const countryName = d.properties.name;

        // Se houver um país anteriormente selecionado, restauramos sua cor original
        if (previousCountry) {
          g.selectAll("path")
            .filter(d => d.properties.name === previousCountry)
            .attr("fill", d => {
              const disastersCount = dataMap.get(d.properties.name) || 0;
              return colorScale(disastersCount);  // Restaurar a cor original
            });
        }

        // Pintar o país atual de vermelho e armazenar o nome como selecionado
        d3.select(this).attr("fill", "red");
        previousCountry = countryName;
        selectedCountry = countryName;
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
