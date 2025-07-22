// STAGE 1: Fetch data from CSV source and save it to a JSON file named 'data_full_dataset.json'.
// This script demonstrates how to download a CSV file from the internet and save its raw content as a JSON array of objects.
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
  // Parse the CSV into an array of objects (all columns)
  const records = parse(csvText, { columns: true, skip_empty_lines: true });
  // Save the full dataset to a JSON file
  fs.writeFileSync('./data/data_full_dataset.json', JSON.stringify(records, null, 2));
  console.log(`Saved ${records.length} records to ./data/data_full_dataset.json`);
}

async function fetchCSV(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch CSV');
  return await res.text();
}

main().catch(console.error);
