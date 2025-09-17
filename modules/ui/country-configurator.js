"use strict";

// Country configuration for flat earth world
let countryConfig = {
  useCustom: false,
  countries: [],
  sizes: [],
  provinceCounts: []
};

// Initialize country configurator
function initCountryConfigurator() {
  const useCustomCheckbox = byId("useCustomCountries");
  const customSection = byId("customCountriesSection");
  const applyButton = byId("applyCountryConfig");
  const resetButton = byId("resetCountryConfig");

  // Toggle custom countries section
  useCustomCheckbox.addEventListener("change", function() {
    customSection.style.display = this.checked ? "block" : "none";
    countryConfig.useCustom = this.checked;
  });

  // Apply configuration
  applyButton.addEventListener("click", applyCountryConfiguration);

  // Reset configuration
  resetButton.addEventListener("click", resetCountryConfiguration);

  // Load saved configuration
  loadCountryConfiguration();
}

// Open country configurator dialog
function editCountries() {
  const template = byId("templateInput").value;
  if (template !== "flatEarth") {
    tip("Country configuration is only available for Flat Earth template", false, "warn");
    return;
  }

  $("#countryConfigurator").dialog({
    title: "Country Configuration",
    width: "32em",
    height: "auto",
    resizable: true,
    position: {my: "center", at: "center", of: "svg"},
    buttons: {
      Close: function() {
        $(this).dialog("close");
      }
    }
  });
}

// Apply country configuration
function applyCountryConfiguration() {
  const countryList = byId("countryList").value.trim();
  const countrySizes = byId("countrySizes").value.trim();
  const provinceCounts = byId("provinceCounts").value.trim();

  if (countryConfig.useCustom && !countryList) {
    tip("Please enter at least one country name", false, "error");
    return;
  }

  // Parse country list
  const countries = countryList ? countryList.split('\n').map(name => name.trim()).filter(name => name) : [];
  
  // Parse sizes
  const sizes = countrySizes ? countrySizes.split(',').map(s => parseFloat(s.trim())).filter(s => !isNaN(s)) : [];
  
  // Parse province counts
  const counts = provinceCounts ? provinceCounts.split(',').map(c => parseInt(c.trim())).filter(c => !isNaN(c)) : [];

  // Validate sizes (should sum to 100 or less)
  if (sizes.length > 0) {
    const totalSize = sizes.reduce((sum, size) => sum + size, 0);
    if (totalSize > 100) {
      tip("Country sizes cannot exceed 100% total", false, "error");
      return;
    }
  }

  // Update configuration
  countryConfig.countries = countries;
  countryConfig.sizes = sizes;
  countryConfig.provinceCounts = counts;
  countryConfig.useCustom = byId("useCustomCountries").checked;

  // Save to localStorage
  localStorage.setItem("countryConfig", JSON.stringify(countryConfig));

  tip("Country configuration applied successfully", false, "success");
}

// Reset country configuration
function resetCountryConfiguration() {
  countryConfig = {
    useCustom: false,
    countries: [],
    sizes: [],
    provinceCounts: []
  };

  byId("useCustomCountries").checked = false;
  byId("customCountriesSection").style.display = "none";
  byId("countryList").value = "";
  byId("countrySizes").value = "";
  byId("provinceCounts").value = "";

  localStorage.removeItem("countryConfig");
  tip("Country configuration reset to default", false, "success");
}

// Load country configuration from localStorage
function loadCountryConfiguration() {
  const saved = localStorage.getItem("countryConfig");
  if (saved) {
    try {
      countryConfig = JSON.parse(saved);
      
      byId("useCustomCountries").checked = countryConfig.useCustom;
      byId("customCountriesSection").style.display = countryConfig.useCustom ? "block" : "none";
      byId("countryList").value = countryConfig.countries.join('\n');
      byId("countrySizes").value = countryConfig.sizes.join(', ');
      byId("provinceCounts").value = countryConfig.provinceCounts.join(', ');
    } catch (e) {
      console.error("Failed to load country configuration:", e);
    }
  }
}

// Get country configuration for map generation
function getCountryConfiguration() {
  return countryConfig;
}

// Check if custom countries should be used
function shouldUseCustomCountries() {
  return countryConfig.useCustom && countryConfig.countries.length > 0;
}

// Get custom country names
function getCustomCountryNames() {
  return countryConfig.countries;
}

// Get custom country sizes
function getCustomCountrySizes() {
  return countryConfig.sizes;
}

// Get custom province counts
function getCustomProvinceCounts() {
  return countryConfig.provinceCounts;
}
