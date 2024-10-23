
document.addEventListener("DOMContentLoaded", function () {

    function updateScatterPlotRegions() {

      updateScatterPlot(minYear, maxYear, country, selectedRegions);
    }

    document.querySelectorAll('.region-btn').forEach(function (button) {
      button.addEventListener('click', function () {
        const region = button.getAttribute('data-region');

        if (selectedRegions.includes(region)) {
          selectedRegions = selectedRegions.filter(r => r !== region); 
          button.classList.remove('selected'); 
        } else {
          selectedRegions.push(region); 
          button.classList.add('selected'); 
        }
        
        updateScatterPlotRegions();
      });
    });
    updateScatterPlotRegions();
  });
  