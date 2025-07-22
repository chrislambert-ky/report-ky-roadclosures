// closure_weather_ncei.js
// Fetches daily precipitation for each road closure using NCEI CDO API
// Adds rainfall to each record and writes to data_v1_full_dataset_rainfall_ncei.json

import fs from 'fs/promises';
import fetch from 'node-fetch';

const INPUT_FILE = './data/data_v1_full_dataset.json';
const OUTPUT_FILE = './data/data_v1_full_dataset_rainfall_ncei.json';
const TOKEN = 'XsNGEsSxvLOzhJmPCtjoSohMkEvFUqyk';

async function getPrecipitation(lat, lon, date) {
  // NCEI CDO API requires station ID or location ID. We'll use locationid for Kentucky (FIPS:21) as an example.
  // For more precise results, you may need to map lat/lon to a station using /stations endpoint.
  const params = new URLSearchParams({
    datasetid: 'GHCND',
    datatypeid: 'PRCP',
    locationid: 'FIPS:21', // Kentucky
    startdate: date,
    enddate: date,
    limit: '1'
  });
  const url = `https://www.ncei.noaa.gov/cdo-web/api/v2/data?${params}`;
  try {
    const res = await fetch(url, {
      headers: { token: TOKEN }
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    // Extract precipitation value (in tenths of mm)
    if (data.results && data.results.length > 0) {
      return data.results[0].value / 10; // Convert to mm
    }
    return null;
  } catch (err) {
    console.error(`Precipitation fetch failed for ${lat},${lon} on ${date}:`, err.message);
    return null;
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
      rec.precipitation_mm_ncei = await getPrecipitation(lat, lon, date);
    } else {
      rec.precipitation_mm_ncei = null;
    }
  }
  await fs.writeFile(OUTPUT_FILE, JSON.stringify(sampleRecords, null, 2));
  console.log(`NCEI rainfall data added for 5 records. Output: ${OUTPUT_FILE}`);
}

main();
