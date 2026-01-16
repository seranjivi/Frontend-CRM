import api from '../utils/api';

class MasterDataService {
  constructor() {
    this.regionsCache = null;
    this.countriesCache = null;
    this.cacheExpiry = null;
    this.CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
  }

  // Get all regions
  async getRegions() {
    if (this.regionsCache && this.cacheExpiry && Date.now() < this.cacheExpiry) {
      return this.regionsCache;
    }

    try {
      const response = await api.get('/master/regions');
      const regions = response.data || [];
      
      if (regions.length === 0) {
        const fallbackRegions = this.getFallbackRegions();
        this.regionsCache = fallbackRegions;
        this.cacheExpiry = Date.now() + this.CACHE_DURATION;
        return fallbackRegions;
      }

      this.regionsCache = regions;
      this.cacheExpiry = Date.now() + this.CACHE_DURATION;
      return regions;
    } catch (error) {
      console.error('Error fetching regions:', error);
      if (this.regionsCache) return this.regionsCache;
      
      const fallbackRegions = this.getFallbackRegions();
      this.regionsCache = fallbackRegions;
      this.cacheExpiry = Date.now() + this.CACHE_DURATION;
      return fallbackRegions;
    }
  }

  // Get region names for dropdowns
  async getRegionNames() {
    const regions = await this.getRegions();
    return regions.map(region => region.name || region.region_name);
  }

  // Get all countries
  async getCountries() {
    if (this.countriesCache && this.cacheExpiry && Date.now() < this.cacheExpiry) {
      return this.countriesCache;
    }

    try {
      const response = await api.get('/master/countries');
      const countries = response.data || [];
      
      if (countries.length === 0) {
        const fallbackCountries = this.getFallbackCountries();
        this.countriesCache = fallbackCountries;
        this.cacheExpiry = Date.now() + this.CACHE_DURATION;
        return fallbackCountries;
      }

      this.countriesCache = countries;
      this.cacheExpiry = Date.now() + this.CACHE_DURATION;
      return countries;
    } catch (error) {
      console.error('Error fetching countries:', error);
      if (this.countriesCache) return this.countriesCache;
      
      const fallbackCountries = this.getFallbackCountries();
      this.countriesCache = fallbackCountries;
      this.cacheExpiry = Date.now() + this.CACHE_DURATION;
      return fallbackCountries;
    }
  }

  // Get countries by region
  async getCountriesByRegion(regionName) {
    const countries = await this.getCountries();
    return countries.filter(country => 
      country.region === regionName || 
      country.region_name === regionName
    );
  }

  // Get country names for a specific region
  async getCountryNamesByRegion(regionName) {
    const countries = await this.getCountriesByRegion(regionName);
    return countries.map(country => country.name || country.country_name);
  }

  // Get region for a specific country
  async getRegionByCountry(countryName) {
    const countries = await this.getCountries();
    const country = countries.find(c => 
      c.name === countryName || 
      c.country_name === countryName
    );
    return country?.region || country?.region_name;
  }

  // Fallback regions data
  getFallbackRegions() {
    return [
      { id: "1", name: "North America" },
      { id: "2", name: "Europe" },
      { id: "3", name: "Asia Pacific" },
      { id: "4", name: "Latin America" },
      { id: "5", name: "Middle East" },
      { id: "6", name: "Africa" }
    ];
  }

  // Fallback countries data with region mapping
  getFallbackCountries() {
    return [
      // North America
      { id: "1", name: "United States", region: "North America" },
      { id: "2", name: "Canada", region: "North America" },
      { id: "3", name: "Mexico", region: "North America" },
      
      // Europe
      { id: "4", name: "Germany", region: "Europe" },
      { id: "5", name: "France", region: "Europe" },
      { id: "6", name: "United Kingdom", region: "Europe" },
      { id: "7", name: "Italy", region: "Europe" },
      { id: "8", name: "Spain", region: "Europe" },
      { id: "9", name: "Netherlands", region: "Europe" },
      { id: "10", name: "Sweden", region: "Europe" },
      { id: "11", name: "Norway", region: "Europe" },
      { id: "12", name: "Denmark", region: "Europe" },
      { id: "13", name: "Poland", region: "Europe" },
      
      // Asia Pacific
      { id: "14", name: "Singapore", region: "Asia Pacific" },
      { id: "15", name: "Japan", region: "Asia Pacific" },
      { id: "16", name: "China", region: "Asia Pacific" },
      { id: "17", name: "India", region: "Asia Pacific" },
      { id: "18", name: "Australia", region: "Asia Pacific" },
      { id: "19", name: "South Korea", region: "Asia Pacific" },
      { id: "20", name: "Malaysia", region: "Asia Pacific" },
      { id: "21", name: "Thailand", region: "Asia Pacific" },
      { id: "22", name: "Indonesia", region: "Asia Pacific" },
      { id: "23", name: "Philippines", region: "Asia Pacific" },
      
      // Latin America
      { id: "24", name: "Brazil", region: "Latin America" },
      { id: "25", name: "Argentina", region: "Latin America" },
      { id: "26", name: "Chile", region: "Latin America" },
      { id: "27", name: "Colombia", region: "Latin America" },
      { id: "28", name: "Peru", region: "Latin America" },
      { id: "29", name: "Venezuela", region: "Latin America" },
      
      // Middle East
      { id: "30", name: "United Arab Emirates", region: "Middle East" },
      { id: "31", name: "Saudi Arabia", region: "Middle East" },
      { id: "32", name: "Israel", region: "Middle East" },
      { id: "33", name: "Qatar", region: "Middle East" },
      { id: "34", name: "Kuwait", region: "Middle East" },
      { id: "35", name: "Oman", region: "Middle East" },
      
      // Africa
      { id: "36", name: "South Africa", region: "Africa" },
      { id: "37", name: "Egypt", region: "Africa" },
      { id: "38", name: "Nigeria", region: "Africa" },
      { id: "39", name: "Kenya", region: "Africa" },
      { id: "40", name: "Morocco", region: "Africa" },
      { id: "41", name: "Ghana", region: "Africa" }
    ];
  }

  // Clear cache (useful for testing or when master data is updated)
  clearCache() {
    this.regionsCache = null;
    this.countriesCache = null;
    this.cacheExpiry = null;
  }
}

// Create singleton instance
const masterDataService = new MasterDataService();

export default masterDataService;
