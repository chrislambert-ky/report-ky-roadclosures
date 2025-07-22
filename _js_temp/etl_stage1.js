// GOALS AND OBJECTIVES:
// This script aims to reprocess historic road closure data for analysis and reporting purposes.
// This ETL data will eventually support the Dashboards that are the main focus of this project.
// This script attempts to handle my ETL (extract, transform, and load) process.
// I am using partially processed data from a differnet repository/project.
// The data being retreived is historic road closure data.
// Since roadway information changes over time, I need to re-process the data with more recent attributes.
// I want to ensure that people can review historic data in the most recent context.


// DISCLAIMERS:
// I do work for the Kentucky Transportation Cabinet but this is not an official KYTC project.
// This is a personal project to help me learn Node.js and JavaScript.
// I am not a professional software developer.
// This is my first attempt at writing a Node.js ETL script.
// My background is:
//    - IT Project Manager / Data Analyst
//    - Python ETLs
//    - SQL (Google BigQuery, Oracle)
//    - BI Tools (Looker Studio, Tableau, PowerBI).
// This script is co-written by GitHub CoPilot, GPT 4.1 using the autocomplete feature.
// This script is co-documented using the following prompt:  "I want you to now review the code, do not make any changes to existing code or comments, but please ADD comments to make this particular version of the script a learning tool for others who may be trying to learn javascript."


// I'm going to break this out into steps
// Step 1: Fetch data from CSV source and save it to a JSON file named 'data_full_dataset.json'.



const fetch = require('node-fetch');
const { parse } = require('csv-parse/sync');
const fs = require('fs');

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
