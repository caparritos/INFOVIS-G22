var selectedCountry = null;
var previousCountry = null;

function updateChoropleth(minYear, maxYear, country, globalFilter) {
  selectedCountry = country;
  previousCountry = country;
  drawMap(minYear, maxYear, country, globalFilter);
}

function processDataCloropleth(data, minYear, maxYear) {
  // Filtra os dados com base no intervalo de anos
  const filteredData = data.filter(
    (d) => d.StartYear >= minYear && d.StartYear <= maxYear
  );

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
    acc[country].total_deaths +=
      +current.total_deaths == 0 ? 1 : +current.total_deaths;

    return acc;
  }, {});

  // Retorna o array de objetos agrupados
  return Object.values(groupedData);
}

function drawMap(minYear, maxYear, country, globalFilter) {
  
  const missingDataColor = '#d9d9d9';
  const selectedCountryColor = "#1ed928";

  d3.select("#choropleth").select("svg").remove();
  const svg = d3
    .select("#choropleth")
    .append("svg")
    .attr("width", 730)
    .attr("height", 400);

  const width = 830;
  const height = 400;

  // Mapa e projeção
  const projection = d3
    .geoMercator()
    .scale(70)
    .center([0, 20])
    .translate([width / 2, height / 2]);

  const path = d3.geoPath().projection(projection);

  // Escala de cores baseada no número de desastres
  const colorScale =
    globalFilter === "num_disasters"
    ? d3
      .scaleThreshold()
      .domain([0, 10, 50, 100, 200, 400, 800, 1600])
      .range([
        '#d0e7ff',  // Light blue
        '#a6cfff',
        '#7eb8ff',
        '#569fff',
        '#2e87ff',  // Medium blue
        '#006fdd',
        '#0059bb',
        '#002966'   // Darkest blue
      ])
      : d3
      .scaleThreshold()
      .domain([0, 100, 200, 500, 1000, 2000, 5000, 10000, 50000])
      .range([
        '#fde0dd',  // Lightest red
        '#fcc5c0',
        '#fa9fb5',
        '#f768a1',
        '#dd3497',
        '#ae017e',
        '#7a0177',
        '#4a016a',
        '#2f004f'   // Darkest red
      ]);

  // Criação de um grupo para aplicar o zoom
  const g = svg.append("g");

  // Carregar dados externos e inicializar o mapa
  Promise.all([
    d3.json("./pkg/world.geojson"),
    d3.csv("satinize_dataset/pre-processing/disasters_per_country.csv", (d) => {
      // Converta os valores necessários para números
      d.num_disasters = +d.num_disasters;
      return d;
    }),
  ])
    .then(([topo, disasters]) => {
      // Filtrar dados conforme minYear, maxYear e opcionalmente o país
      const filteredData = processDataCloropleth(disasters, minYear, maxYear);
      // Mapa para armazenar os dados de desastres por país
      const dataMap = new Map();
      filteredData.forEach((d) => {
        dataMap.set(d.Country, d[globalFilter]);
      });

      // Desenhar o mapa
      g.selectAll("path")
        .data(topo.features)
        .join("path")
        .attr("d", path)
        .attr("fill", (d) => {
          const countryName = d.properties.name;
          var countryData = filteredData.filter(
            (e) => e.Country == d.properties.name
          );
          var count = countryData == 0 ? 0 : countryData[0].num_disasters;
          if (globalFilter == "total_deaths") {
            count = countryData == 0 ? 0 : countryData[0].total_deaths;
          }

          // Use teal for the selected country
          if (country === countryName) return selectedCountryColor;

          // Use gray for missing data
          if (count === 0) return missingDataColor;

          // Apply the color scale for all other countries
          return colorScale(count);
          return country === countryName ? "#1ed928" : colorScale(count);
        })
        .attr("stroke", "#fff")
        .attr("stroke-width", 0.5)

        .on("mouseover", function (event, d) {
          d3.select(this).attr("fill", "#fc8d62");
          var countryData = filteredData.filter(
            (e) => e.Country == d.properties.name
          );
          var count = countryData == "" ? 0 : countryData[0].num_disasters;
          var text = "Disasters";
          if (globalFilter == "total_deaths") {
            count = countryData == "" ? 0 : countryData[0].total_deaths;
            text = "Deaths";
          }

          d3.select("#tooltip")
            .style("opacity", 1)
            .html(`<strong>${d.properties.name}</strong><br/>${text}: ${count}`)
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 10 + "px");
        })
        .on("mouseout", function (event, d) {
          // Restore the original fill color when mouse leaves
          const countryName = d.properties.name;
          var countryData = filteredData.filter(
            (e) => e.Country == countryName
          );
          var count = countryData == 0 ? 0 : countryData[0].num_disasters;
          
          if (globalFilter == "total_deaths") {
            count = countryData == "" ? 0 : countryData[0].total_deaths;
          }
      
          // Set the fill color back to its original state
          d3.select(this).attr("fill", (d) => {
            // Use teal for the selected country
            if (selectedCountry === countryName) return selectedCountryColor;
      
            // Use gray for missing data
            if (count === 0) return missingDataColor;
      
            // Apply the color scale for all other countries
            return colorScale(count);
          });
      
          // Hide the tooltip on mouse out
          d3.select("#tooltip").style("opacity", 0);
        })
        .on("click", function (event, d) {
          const countryName = d.properties.name;

          // Verifica se o país clicado é o mesmo que o anterior
          if (selectedCountry === countryName) {
            // Deseleciona o país, restaurando sua cor original
            g.selectAll("path")
              .filter((d) => d.properties.name === countryName)
              .attr("fill", (d) => {
                const disastersCount = dataMap.get(d.properties.name) || 0;
                return colorScale(disastersCount); // Restaurar a cor original
              });

            // Reseta as variáveis de seleção
            previousCountry = null;
            selectedCountry = null; // ou algum valor padrão
          } else {
            // Se houver um país anteriormente selecionado, restauramos sua cor original
            if (previousCountry) {
              g.selectAll("path")
                .filter((d) => d.properties.name === previousCountry)
                .attr("fill", (d) => {
                  const disastersCount = dataMap.get(d.properties.name) || 0;
                  return colorScale(disastersCount); // Restaurar a cor original
                });
            }
            d3.select(this).attr("fill", "red");
            previousCountry = countryName;
            selectedCountry = countryName;
          }

          // Atualiza os gráficos
          updateCountry(selectedCountry);
          updateRadialChart(minYear, maxYear, selectedCountry, globalFilter);
          updateScatterPlot(minYear, maxYear, selectedCountry);
        });
      // Criar um grupo para a escala
      const legendGroup = svg
        .append("g")
        .attr("transform", "translate(30, 40)"); // Ajuste a posição conforme necessário

      const legendHeight = 300;
      const legendWidth = 20;

      // Desenhar retângulos coloridos para a escala
      colorScale.range().forEach((color, i) => {
        legendGroup
          .append("rect")
          .attr("x", 0)
          .attr("y", (legendHeight / colorScale.range().length) * i) // Distribui verticalmente
          .attr("width", legendWidth)
          .attr("height", legendHeight / colorScale.range().length) // Altura proporcional à barra
          .attr("fill", color);
      });

      // Adicionar rótulos à escala
      const ticks = colorScale.domain(); // Valores para os rótulos
      ticks.forEach((tick, i) => {
        // Adiciona rótulos somente se não for o último
        if (i < ticks.length - 1) {
          legendGroup
            .append("text")
            .attr("x", legendWidth + 5) // Posição do rótulo à direita dos retângulos
            .attr("y", (legendHeight / colorScale.range().length) * (i + 0.5)) // Centraliza verticalmente
            .attr("dy", ".35em") // Alinha verticalmente ao centro
            .text(tick);
        }
      });

      // Adicionar rótulo do valor máximo
      legendGroup
        .append("text")
        .attr("x", legendWidth + 5)
        .attr("y", legendHeight - 5) // Último rótulo na parte inferior
        .text(d3.max(ticks)); // O maior valor no domínio

      // Add zoom functionality
      const zoom = d3
        .zoom()
        .scaleExtent([1, 8]) // Define a escala mínima e máxima
        .on("zoom", (event) => {
          g.attr("transform", event.transform); // Aplica a transformação de zoom ao grupo
        });

      svg.call(zoom); // Aplica o zoom ao SVG
    })
    .catch((err) => {
      console.error("Error loading the data: ", err);
    });
}
// Executa o drawMap quando o DOM estiver totalmente carregado
document.addEventListener("DOMContentLoaded", function () {
  drawMap(minYear, maxYear, country, globalFilter); // Exemplo de chamada para desenhar o mapa
});
