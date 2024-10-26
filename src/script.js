
// Declare global variables for year range
var minYear = 2000;
var maxYear = 2024;
var country  = null;
var globalFilter = "num_disasters" // "num_disasters" or "total_deaths"
var selectedRegions = ['Asia', 'Americas', 'Africa', 'Europe', 'Oceania'];

function updateCountry(newCountry) {
  country = newCountry;  // Atualiza o valor global de 'country'
  updateRadialChart(minYear, maxYear, country, globalFilter);  
  updateScatterPlot(minYear, maxYear, country, selectedRegions);  
  updateChoropleth(minYear, maxYear, country, globalFilter);  
}

// slider prevent max > min
function updateSlider(slider, type) {
    const sliderMin = document.getElementById('slider-min');
    const sliderMax = document.getElementById('slider-max');
  
    // Update the CSS variables for display
    if (type === 'a') {
      slider.parentNode.style.setProperty('--value-a', slider.value);
      slider.parentNode.style.setProperty('--text-value-a', JSON.stringify(slider.value));
  
      // Ensure the min slider doesn't go above the max slider
      // if (parseInt(sliderMin.value) > parseInt(sliderMax.value)) {
      //   sliderMin.value = sliderMax.value;
      //   slider.parentNode.style.setProperty('--value-a', sliderMax.value);
      //   slider.parentNode.style.setProperty('--text-value-a', JSON.stringify(sliderMax.value));
      // }
    } else {
      slider.parentNode.style.setProperty('--value-b', slider.value);
      slider.parentNode.style.setProperty('--text-value-b', JSON.stringify(slider.value));
  
      // Ensure the max slider doesn't go below the min slider
      // if (parseInt(sliderMax.value) < parseInt(sliderMin.value)) {
      //   sliderMax.value = sliderMin.value;
      //   slider.parentNode.style.setProperty('--value-b', sliderMin.value);
      //   slider.parentNode.style.setProperty('--text-value-b', JSON.stringify(sliderMin.value));
      // }
    }
    updateScatterPlot(Math.min(sliderMin.value, sliderMax.value), Math.max(sliderMin.value, sliderMax.value), country,selectedRegions);
    updateRadialChart(Math.min(sliderMin.value, sliderMax.value), Math.max(sliderMin.value, sliderMax.value), country,globalFilter);
    updateChoropleth(Math.min(sliderMin.value, sliderMax.value), Math.max(sliderMin.value, sliderMax.value), country,globalFilter);
    minYear = Math.min(sliderMin.value, sliderMax.value)
    maxYear = Math.max(sliderMin.value, sliderMax.value)
  }

  // Função para lidar com a mudança de filtro
function changeFilter(button, filter) {
  globalFilter = filter;
  const buttons = document.querySelectorAll('.globalFilter-button');
  buttons.forEach(btn => btn.classList.remove('active'));
  button.classList.add('active');
  updateScale = true;
  legendGroup.remove();
  updateChoropleth(minYear, maxYear, country, filter)
  updateRadialChart(minYear, maxYear, country, filter)
}
  

document.addEventListener("DOMContentLoaded", function () {
  const btnDisasters = document.getElementById("Number-Disasters");
  const btnDeaths = document.getElementById("Death-Disasters");

  // btnDisasters.addEventListener("click", function () {
  //   // change border color
  //   btnDisasters.style.borderColor = "#000000";
  //   btnDeaths.style.borderColor = "#ae017e";
  // });

  // btnDeaths.addEventListener("click", function () {
  //   // change border color
  //   btnDeaths.style.borderColor = "#000000";
  //   btnDisasters.style.borderColor = "#006fdd";
  // });
  btnDisasters.addEventListener("click", function () {
    // Change border color and add gray-out effect
    btnDisasters.style.borderColor = "#000000";
    btnDisasters.style.opacity = "1";  // Reset opacity

    // Reset the other button
    btnDeaths.style.borderColor = "#ae017e";  
    btnDeaths.style.opacity = "0.4";  // Slightly reduce opacity for a grayed effect
    
  });

  btnDeaths.addEventListener("click", function () {
      // Change border color and add gray-out effect
      btnDeaths.style.borderColor = "#000000";
      btnDeaths.style.opacity = "1";  // Reset opacity

      // Reset the other button
      btnDisasters.style.borderColor = "#006fdd";
      btnDisasters.style.opacity = "0.4";  // Slightly reduce opacity for a grayed effect
  });
});
  