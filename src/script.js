
// Declare global variables for year range
var minYear = 2000;
var maxYear = 2024;
var country  = null;

function updateCountry(newCountry) {
  country = newCountry;  // Atualiza o valor global de 'country'
  createRadialChart(minYear, maxYear, country);  
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
      if (parseInt(sliderMin.value) > parseInt(sliderMax.value)) {
        sliderMin.value = sliderMax.value;
        slider.parentNode.style.setProperty('--value-a', sliderMax.value);
        slider.parentNode.style.setProperty('--text-value-a', JSON.stringify(sliderMax.value));
      }
    } else {
      slider.parentNode.style.setProperty('--value-b', slider.value);
      slider.parentNode.style.setProperty('--text-value-b', JSON.stringify(slider.value));
  
      // Ensure the max slider doesn't go below the min slider
      if (parseInt(sliderMax.value) < parseInt(sliderMin.value)) {
        sliderMax.value = sliderMin.value;
        slider.parentNode.style.setProperty('--value-b', sliderMin.value);
        slider.parentNode.style.setProperty('--text-value-b', JSON.stringify(sliderMin.value));
      }
    }
    updateScatterPlot(sliderMin.value, sliderMax.value,country);
    updateRadialChart(sliderMin.value, sliderMax.value,country);
  }
  


  