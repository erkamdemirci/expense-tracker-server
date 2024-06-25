// services/currencyService.js
const axios = require("axios");

const getCurrencyRates = async () => {
  try {
    const response = await axios.get(
      "https://api.exchangerate-api.com/v4/latest/USD"
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching currency rates:", error);
    return null;
  }
};

module.exports = { getCurrencyRates };
