// closure_weather.js
// Fetches weather data for each road closure using Open-Meteo API
// Adds weather data to each record and writes to data_v1_full_dataset_weather.json

import fs from 'fs/promises';
import fetch from 'node-fetch';

const INPUT_FILE = './data/data_v1_full_dataset.json';
const OUTPUT_FILE = './data/data_v1_full_dataset_weather_open-meteo.json';

async function getWeather(lat, lon, date) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&start_date=${date}&end_date=${date}&daily=rain_sum,showers_sum,snowfall_sum,precipitation_sum,precipitation_probability_max&hourly=temperature_2m&minutely_15=precipitation&timezone=auto`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    // Extract daily weather values
    const daily = data.daily || {};
    return {
      rain_sum: daily.rain_sum ? daily.rain_sum[0] : null,
      showers_sum: daily.showers_sum ? daily.showers_sum[0] : null,
      snowfall_sum: daily.snowfall_sum ? daily.snowfall_sum[0] : null,
      precipitation_sum: daily.precipitation_sum ? daily.precipitation_sum[0] : null,
      precipitation_probability_max: daily.precipitation_probability_max ? daily.precipitation_probability_max[0] : null
    };
  } catch (err) {
    console.error(`Weather fetch failed for ${lat},${lon} on ${date}:`, err.message);
    return {
      rain_sum: null,
      showers_sum: null,
      snowfall_sum: null,
      precipitation_sum: null,
      precipitation_probability_max: null
    };
  }
}

async function main() {
  const raw = await fs.readFile(INPUT_FILE, 'utf8');
  const records = JSON.parse(raw);
  const sampleRecords = records.slice(0, 5); // Only process first 5 records
  for (const rec of sampleRecords) {
    const lat = rec.latitude;
    const lon = rec.longitude;
    const reportedOn = rec.Reported_On;
    if (lat && lon && reportedOn) {
      const date = reportedOn.split(' ')[0]; // YYYY-MM-DD
      const weather = await getWeather(lat, lon, date);
      rec.rain_sum = weather.rain_sum;
      rec.showers_sum = weather.showers_sum;
      rec.snowfall_sum = weather.snowfall_sum;
      rec.precipitation_sum = weather.precipitation_sum;
      rec.precipitation_probability_max = weather.precipitation_probability_max;
    } else {
      rec.rain_sum = null;
      rec.showers_sum = null;
      rec.snowfall_sum = null;
      rec.precipitation_sum = null;
      rec.precipitation_probability_max = null;
    }
  }
  await fs.writeFile(OUTPUT_FILE, JSON.stringify(sampleRecords, null, 2));
  console.log(`Weather data added for 5 records. Output: ${OUTPUT_FILE}`);
}

main();
