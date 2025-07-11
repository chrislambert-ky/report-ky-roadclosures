// NOTES:
// This script aims to reprocess historic road closure data for analysis and reporting purposes.
// This ETL data will eventually support the Dashboards that are the main focus of this project.
// This script attempts to handle my ETL (extract, transform, and load) process.
// I am using partially processed data from a differnet repository/project.
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
  // Run in batches to avoid lockups
  const BATCH_SIZE = 500;
  let allEnriched = [];
  let idx = 0;
  while (idx < minimal.length) {
    const batch = minimal.slice(idx, idx + BATCH_SIZE);
    const enrichedBatch = await Promise.all(batch.map(enrichRow));
    allEnriched.push(...enrichedBatch);
    // Save progress after each batch
    fs.writeFileSync('./data/data_v3_reprocessed_dataset.json', JSON.stringify(allEnriched, null, 2));
    console.log(`Processed: ${allEnriched.length}`);
    idx += BATCH_SIZE;
  }
  console.log(`Saved ${allEnriched.length} records to ./data/data_v3_reprocessed_dataset.json`);
}

async function fetchCSV(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch CSV');
  return await res.text();
}

async function enrichRow(row) {
  if (!row.latitude || !row.longitude) return { ...row, api_error: 'Missing coordinates' };
  const params = new URLSearchParams({
    xcoord: row.longitude,
    ycoord: row.latitude,
    return_keys: 'District_Number,County_Name,Milepoint,Road_Name,Route,Route_Label,Route_Prefix,Snap_Status',
    return_format: 'json'
  });
  const apiUrl = `https://kytc-api-v100-lts-qrntk7e3ra-uc.a.run.app/api/route/GetRouteInfoByCoordinates?${params.toString()}`;
  try {
    const res = await fetch(apiUrl);
    if (!res.ok) return { ...row, api_error: true };
    let snap = await res.json();
    if (Array.isArray(snap)) snap = snap[0] || {};
    if (snap.Route_Info) snap = snap.Route_Info;
    return {
      ...row,
      District_Number: snap.District_Number || snap.district_number,
      County_Name: snap.County_Name || snap.county_name,
      Milepoint: snap.Milepoint || snap.milepoint,
      Road_Name: snap.Road_Name || snap.road_name,
      Route: snap.Route || snap.route,
      Route_Label: snap.Route_Label || snap.route_label,
      Route_Prefix: snap.Route_Prefix || snap.route_prefix,
      Snap_Status: snap.Snap_Status || snap.snap_status
    };
  } catch (e) {
    return { ...row, api_error: e.message };
  }
}

main().catch(console.error);
