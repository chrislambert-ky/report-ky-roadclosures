// NOTES:
// This script aims to reprocess historic road closure data for analysis and reporting purposes.
// This ETL data will eventually support the Dashboards that are the main focus of this project.
// This script attempts to handle my ETL (extract, transform, and load) process.
// The data being retreived is historic road closure data.
// Since roadway information changes over time, I need to re-process the data with more recent attributes.
// I want to ensure that people can review historic data in the most recent context.


// DISCLAIMERS:
// I do work for the Kentucky Transportation Cabinet but this is not an official KYTC project.
// This is a personal project to help me learn web development (Node.js, HTML, CSS, JavaScript, etc)

// I am not a professional software developer.
// My background is:
//    - IT Project Manager / Data Analyst
//    - Python ETLs
//    - SQL (Google BigQuery, Oracle)
//    - BI Tools (Looker Studio, Tableau, PowerBI).

// This is my first attempt at writing a Node.js ETL script.
// This script is co-written by GitHub CoPilot, GPT 4.1 using the autocomplete feature.

// I'm going to break down my ETLs into steps for my own peace of mind.
// Step 1: Fetch data from CSV source, parse as JSON, and save it to 'data_v1_full_dataset.json'.
// Step 2: Fetch, parse, and filter fields, and save to 'data_v2_parsed_filtered_data.json'.
// Step 3: Fetch, parse, filter, and geo-enrich using the KYTC API, and store as 'data_v3_reprocessed_dataset.json'.
// Step 4: Fetch, parse, filter, reprocess, log etl results, and store the data for final output as 'data_v4_final_roadclosures.json'.

// Import necessary modules.  This is similar to Python's import statement.
import fetch from 'node-fetch';
import { parse } from 'csv-parse/sync';
import fs from 'fs';

async function main() {
  // NOTE: I'm using the 'raw.' because the other "normal" url doesn't work.  GitHub must have that blocked.
  const csvUrl = 'https://raw.githubusercontent.com/chrislambert-ky/analysis-ky-roadclosures/refs/heads/main/data-reportready/kytc-closures-2021-2025-report_dataset.csv';
  // Download the CSV file as text
  const csvText = await fetchCSV(csvUrl);
  
  // Parse the CSV text into an array of objects (one object per row),
  // but instead of keeping all columns, we immediately filter to only the fields needed for enrichment.
  // This is done by passing the raw CSV text to the filterRows function, which handles both parsing and filtering.
  const filteredRows = filterRows(csvText);
  // I need to write the filtered rows to a JSON file.
  // This file may be used in the next step if I cannot figure out how to do everyhing at once in memory.
  fs.writeFileSync('./data/data_v2_parsed_filtered_data.json', JSON.stringify(filteredRows, null, 2));
  console.log(`Wrote ${filteredRows.length} records to data_v2_parsed_filtered_data.json`);
}

// Performs a fetch and returns the contents
async function fetchCSV(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch CSV');
  return await res.text();
}

// Parses the CSV text and returns an array of objects with only the fields needed for enrichment
// What makes a road closure unique is: Lat/Long, Comments, Reported Date, End Date, and Duration.
function filterRows(csvText) {
  // PARSING
  // Parsing the CSV text into an array of objects, one per row.
  const records = parse(csvText, { columns: true, skip_empty_lines: true });
  // Filters each row to only the minimal fields needed for enrichment.
  return records.map(row => ({
    latitude: row.latitude,
    longitude: row.longitude,
    Comments: row.Comments,
    Reported_On: row.Reported_On,
    End_Date: row.End_Date,
    Duration_Hours: row.Duration_Hours
  }));
}

main().catch(console.error);
