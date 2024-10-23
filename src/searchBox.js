// List of countries
let countries = [];

// Populate the dropdown with the list of countries
function populateDropdown() {
  const dropdown = document.getElementById("dropdown");
  dropdown.innerHTML = ""; // Clear any existing options
  countries.forEach((country) => {
    const div = document.createElement("div");
    div.textContent = country;
    div.onclick = () => selectCountry(country); // Set click handler
    dropdown.appendChild(div);
  });
}

// Filter the dropdown based on the search input
function filterCountries() {
  const input = document.getElementById("countrySearch").value.toLowerCase();
  const dropdown = document.getElementById("dropdown");
  const filteredCountries = countries.filter((country) =>
    country.toLowerCase().includes(input)
  );

  if (filteredCountries.length === 0 || input === "") {
    dropdown.style.display = "none";
  } else {
    dropdown.style.display = "block";
    dropdown.innerHTML = ""; // Clear the dropdown
    filteredCountries.forEach((country) => {
      const div = document.createElement("div");
      div.textContent = country;
      div.onclick = () => selectCountry(country); // Set click handler
      dropdown.appendChild(div);
    });
  }
}

function selectCountryInSearch(country) {
    document.getElementById("countrySearch").value = country;
    document.getElementById("dropdown").style.display = "none"; // Hide dropdown
}

// Handle selection of a country
function selectCountry(country) {
  document.getElementById("countrySearch").value = country;
  document.getElementById("dropdown").style.display = "none"; // Hide dropdown
  updateCountry(country);
}

// Initialize the search box with the list of countries from geoData
function initializeSearchBox(features) {
  countries = features.map((feature) => feature.properties.name);
  populateDropdown();
}
