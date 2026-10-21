// Where the dashboard gets its site data.
//
// Default (live demo): the sample data in /data/navigationSites/mapSites.js — no server or token needed.
// To use the real API instead, set VITE_USE_API=true (and VITE_API_TOKEN) in your local .env file.
import api from "../axios-test/axiosInstance.js";

const USE_API = import.meta.env.VITE_USE_API === "true";

// The sample file is large, so it is loaded only when first needed (keeps the first page load small)
let samplePromise = null;
const loadSample = () => {
  samplePromise ??= import("../../data/navigationSites/mapSites.js").then((m) => m.mapSitesData);
  return samplePromise;
};

// All sites (used by search and the map)
export async function getAllSites() {
  if (USE_API) {
    const response = await api.get("/sites");
    return response.data.data;
  }
  return loadSample();
}

// Sites for one category id: 1=Economic Zones, 2=Locators, 3=Infrastructure,
// 4=AFP Modernization, 5=Investments, 6=Sustainability
export async function getSitesByCategory(categoryId) {
  if (USE_API) {
    const response = await api.get(`/sites/filter?category_id=${categoryId}`);
    return response.data.data;
  }
  const sites = await loadSample();
  return sites.filter((site) => Number(site.category_id) === Number(categoryId));
}