// STAGE 2: Fetch data from source, parse through the data, only keeping the minimal fields, and save as 'data_parsed_dataset.json'.
// This script demonstrates how to download a CSV, keep only the minimal fields, and save the result.
// Author: Chris Lambert (with GitHub Copilot)
// Date: July 2025

import fetch from 'node-fetch';
import { parse } from 'csv-parse/sync';
import fs from 'fs';

async function main() {
  // URL of the source CSV file
  const csvUrl = 'https://raw.githubusercontent.com/chrislambert-ky/analysis-ky-roadclosures/refs/heads/main/data-reportready/kytc-closures-2021-2025-report_dataset.csv';
  // Download the CSV file as text
  const csvText = await fetchCSV(csvUrl);
  // Parse and filter the CSV rows to keep only relevant fields
  const records = parse(csvText, { columns: true, skip_empty_lines: true });
  const minimal = records.map(row => ({
    latitude: row.latitude,
    longitude: row.longitude,
    Comments: row.Comments,
    Reported_On: row.Reported_On,
    End_Date: row.End_Date,
    Duration_Hours: row.Duration_Hours
  }));
  // Save the minimal dataset to a JSON file
  fs.writeFileSync('./data/data_parsed_dataset.json', JSON.stringify(minimal, null, 2));
  console.log(`Saved ${minimal.length} records to ./data/data_parsed_dataset.json`);
}

async function fetchCSV(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch CSV');
  return await res.text();
}

main().catch(console.error);
