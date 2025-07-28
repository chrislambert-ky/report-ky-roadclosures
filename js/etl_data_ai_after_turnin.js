// DISCLAIMERS:
// I do work for the Kentucky Transportation Cabinet but this is not an official KYTC project.
// This is a personal project to help me learn web development (Node.js, HTML, CSS, JavaScript, etc)
// I am not a professional software developer.
// My background is:
//    - IT Project Manager / Data Analyst / Highways Subject Matter Expert
//    - Python ETLs
//    - SQL (Google BigQuery, Oracle)
//    - BI Tools (Looker Studio, Tableau, PowerBI).
// This is my first attempt at writing a Node.js ETL script.

// AI Use
// See the README.md file for details on how I used AI to develop this script.

// GOAL:
// This script aims to reprocess historic road closure data for analysis and reporting purposes.
// This data will eventually support the Dashboards that are the main focus of this project.
// This particular script attempts to recreate a python based ETL (extract, transform, and load) process.
// Since roadway information changes over time, I need to re-process the data with more recent attributes.
// I want to ensure that people can review historic data in the most recent context.

// METHODOLOGY:
// I'm going to break down my ETLs into steps for my own peace of mind.
// Step 1: Fetch data from CSV source, parse as JSON, and save it to 'data_v1_full_dataset.json'.
// Step 2: Fetch, parse, and filter fields/columns, and save to 'data_v2_parsed_filtered_data.json'.
// Step 3: Fetch, parse, filter, and geo-enrich using the KYTC API, and store as 'data_v3_reprocessed_dataset.json'.
// Step 4: Fetch, parse, filter, reprocess, add etl logging results, and store the data for final output as 'data_v4_final_roadclosures.json'.


// =========================
// MODULE IMPORTS - Very similar to Python imports
// =========================
// 'node-fetch' is self explanatory - it's used for fetching data and/or making API calls.
// 'csv-parse/sync' is used for parsing CSV data into JavaScript objects.
// 'fs ' is used for file system operations (reading/writing files)
import fetch from 'node-fetch';
import { parse } from 'csv-parse/sync';
import fs from 'fs';

// EXTRACT STEP - Pulling data from a remote source
// -------------------------
// This function fetches CSV data from a remote repository using async/await.
// Simplified for educational purposes - main() handles any errors.

async function fetchCSV(url) 
{
  // Use fetch to get the CSV file from the internet and return the text
  const res = await fetch(url);
  return await res.text();
}


// TRANSFORM STEP
// -------------------------
// This function shows how to parse CSV data.
// I only need the unique fields that cannot be replaced with the API.
// The dataset is fairly large (approx 10K rows as of 2025-07-09).
// This will help reduce the amount of data processed and (I hope) improve performance.

function filterRows(csvText)
{
  // Parse CSV text into objects and keep only the essential fields
  const records = parse(csvText, { columns: true, skip_empty_lines: true });
  return records.map(row => ({
    latitude: row.latitude,
    longitude: row.longitude,
    Comments: row.Comments,
    Reported_On: row.Reported_On,
    End_Date: row.End_Date,
    Duration_Hours: row.Duration_Hours
  }));
}


// ENRICHMENT STEP
// -------------------------
// This function demonstrates how to call an external API for each record and merge new attributes into a new dataset.
// This function will leverage a specialized KYTC API for geo-processing data.
// This will reprocess the unique historic data with updated attributes like Road_Name, Milepoint, etc.
// The API endpoint is: https://kytc-api-v100-lts-qrntk7e3ra-uc.a.run.app/api/route/GetRouteInfoByCoordinates
// The API documentation is: https://kytc-api-v100-lts-qrntk7e3ra-uc.a.run.app/docs

// DISCLAIMER: 
// Again, please review the AI disclaimer on my README.md file.
// This function was the most challenging part of the ETL process.
// Even using various AI tools, I struggled to get this working.
// This was very tricky for me. I simply did not have time to troubleshoot the problem.
// I spoke with the API developer but they didn't know Javascript and couldn't help me.
// Working with this API took a considerable amount of trial and error (several hours over multiple sessions)
// I had to rely on GitHub CoPilot to help me with the errors.
// GitHub Copilot in Agentic mode helped me with this after I struggled with the API locking up.

async function enrichRow(row) 
{
  // Skip rows without coordinates
  if (!row.latitude || !row.longitude) return { ...row, api_error: 'Missing coordinates' };
  
  // Build API URL with coordinates and required fields
  const apiUrl = `https://kytc-api-v100-lts-qrntk7e3ra-uc.a.run.app/api/route/GetRouteInfoByCoordinates?xcoord=${row.longitude}&ycoord=${row.latitude}&return_keys=District_Number,County_Name,Milepoint,Road_Name,Route,Route_Label,Route_Prefix,Snap_Status&return_format=json`;
  
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


// MAIN
// -------------------------
// This is the main function that runs everything.
// This function ties together all ETL steps: extraction, transformation, enrichment, and loading.
// It demonstrates batch processing and file input/output.
// This function will attempt to put all of this together.

// Main workflow function:
// 1. Fetches the CSV data.
// 2. Filters rows to retain only fields not available from the enrichment API.
// 3. Enriches each row with additional attributes from the API (in batches).
// 4. Writes results in batches to an output file, overwriting any previous output.

async function main()
{
  // 1. Fetch and parse CSV data
  const csvUrl = 'https://raw.githubusercontent.com/chrislambert-ky/analysis-ky-roadclosures/refs/heads/main/data-reportready/kytc-closures-2021-2025-report_dataset.csv';
  console.log('Fetching CSV from:', csvUrl);
  const csvText = await fetchCSV(csvUrl);
  console.log('CSV fetched. Length:', csvText.length);
  
  const filteredRows = filterRows(csvText);
  console.log('Rows parsed:', filteredRows.length);
  if (filteredRows.length > 0) {
    console.log('First row:', filteredRows[0]);
  }

  // 2. Set up batch processing
  const BATCH_SIZE = 100;
  const outputFile = './data/data_v4_final_roadclosures.json';
  if (fs.existsSync(outputFile)) {
    console.log('Output file will be overwritten at the end of processing.');
  }

async function processBatch(batch, batchStartIdx)
{
    // Process batch concurrently but with smaller batch size to avoid API overload
    return await Promise.all(batch.map(row => enrichRow(row)));
  }

  // 3. Process data in batches
  const startTime = Date.now();
  let allEnriched = [];
  let idx = 0;

  while (idx < filteredRows.length) {
    const batch = filteredRows.slice(idx, idx + BATCH_SIZE);
    const enrichedBatch = await processBatch(batch, idx);
    allEnriched.push(...enrichedBatch);
    fs.writeFileSync(outputFile, JSON.stringify(allEnriched, null, 2));
    console.log(`Batch ${Math.floor(idx / BATCH_SIZE) + 1}: ${enrichedBatch.length} records processed. Total so far: ${allEnriched.length}`);
    idx += BATCH_SIZE;
  }

  // 4. Show completion summary
  const endTime = Date.now();
  const elapsedSeconds = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log(`All records processed. Total: ${allEnriched.length} records written to ${outputFile}`);
  console.log(`Processing time: ${elapsedSeconds} seconds`);
  
  if (allEnriched.length > 0) {
    console.log('Sample enriched row:', allEnriched[0]);
  }
}

main().catch(console.error);
