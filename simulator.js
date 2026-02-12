/**
 * Campus data simulator
 * Generates realistic simulated data for energy usage, solar generation, waste level, and carbon score
 */

function generateCampusData() {
  return {
    energyUsage: Math.floor(Math.random() * 5000) + 2000, // 2000-7000 kWh
    solarGeneration: Math.floor(Math.random() * 3000) + 1000, // 1000-4000 kWh
    wasteLevel: Math.floor(Math.random() * 80) + 20, // 20-100%
    carbonScore: Math.floor(Math.random() * 40) + 60 // 60-100 score
  };
}

module.exports = { generateCampusData };
