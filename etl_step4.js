
// DOCUMENTATION:

// This script was first documented by me and then I prompted GitHub Copilot
// to add comments so that others can better understand the ETL process and use this 
// script as a learning tool (not to mention reminding me how it works once I've walked away).

// NOTES:

// This script aims to reprocess historic road closure data for analysis and reporting purposes.
// This ETL data will eventually support the Dashboards that are the main focus of this project.
// This particular script attempts to handle my ETL (extract, transform, and load) process.
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


// =========================
// ETL PIPELINE OVERVIEW
// =========================
// This script demonstrates a full ETL (Extract, Transform, Load) pipeline in Node.js.
// It fetches a CSV file from a remote source, parses and filters the data, enriches each record
// with additional attributes from an external API, and writes the results to a JSON file.
// It also logs each run to a CSV file for tracking and reproducibility.

// =========================
// MODULE IMPORTS
// =========================
// 'node-fetch' is used for making HTTP requests (fetching remote CSV and API calls)
// 'csv-parse/sync' is used for parsing CSV data into JavaScript objects



// Import the fetch function so we can get data from the internet
import fetch from 'node-fetch';
// Import the parse function so we can turn CSV text into JavaScript objects
import { parse } from 'csv-parse/sync';
import fs from 'fs';


async function fetchCSV(url) 
// -------------------------
// EXTRACT STEP
// -------------------------
// This function demonstrates how to fetch remote data using async/await and error handling.
// Fetches CSV data from the other repo using the raw csv url.
// I have added the error handling to ensure the fetch is successful.
{
  // Use fetch to get the CSV file from the internet
  const res = await fetch(url);
  // If the request didn't work, show an error
  if (!res.ok) throw new Error('Failed to fetch CSV');
  // Return the text of the CSV file
  return await res.text();
}


function filterRows(csvText)
// -------------------------
// TRANSFORM STEP
// -------------------------
// This function shows how to parse CSV data and map it to a new array of objects,
// keeping only the fields needed for downstream processing.
// This function parses out the mos unique fields that cannot be replaced with the API.
// The dataset is fairily large (approx 10K rows as of 2025-07-09).
// This will help reduce the amount of data processed and (I hope) improve performance.
{
  // Turn the CSV text into an array of objects (one for each row)
  const records = parse(csvText, { columns: true, skip_empty_lines: true });
  // For each row, keep only the fields we care about
  return records.map(row => ({
    latitude: row.latitude, // Where the closure is (north/south)
    longitude: row.longitude, // Where the closure is (east/west)
    Comments: row.Comments, // Notes about the closure
    Reported_On: row.Reported_On, // When it was reported
    End_Date: row.End_Date, // When it ended (if known)
    Duration_Hours: row.Duration_Hours // How long it lasted
  }));
}


async function enrichRow(row) 
// -------------------------
// ENRICHMENT STEP
// -------------------------
// This function demonstrates how to call an external API for each record, handle
// different response structures, and merge new attributes into the original data.
// It also shows robust error handling for API/network issues.
// This functon will leverage a specialized KYTC API for geo-processing data.
// This will reprocess the unique historic data with updated attributes like Road_Name, Milepoint, etc.
// The API endpoint is: https://kytc-api-v100-lts-qrntk7e3ra-uc.a.run.app/api/route/GetRouteInfoByCoordinates
// The API documentation is: https://kytc-api-v100-lts-qrntk7e3ra-uc.a.run.app/docs
// The API docs provide Python code to better understand the API and hopefull recreate the same functionality

// DISCLAIMER: 
// Working with this API took a considerable amount of trial and error.
// I had to rely on GitHub CoPilot to help me with the errors.
{
  // If we don't have coordinates, we can't look up the road info
  if (!row.latitude || !row.longitude) return { ...row, api_error: 'Missing coordinates' };
  // Build the API request with the coordinates and the fields we want
  const params = new URLSearchParams({
    xcoord: row.longitude, // API expects longitude as x
    ycoord: row.latitude,  // API expects latitude as y
    return_keys: 'District_Number,County_Name,Milepoint,Road_Name,Route,Route_Label,Route_Prefix,Snap_Status',
    return_format: 'json'
  });
  // Make the full API URL
  const apiUrl = `https://kytc-api-v100-lts-qrntk7e3ra-uc.a.run.app/api/route/GetRouteInfoByCoordinates?${params.toString()}`;
  try {
    // Ask the API for info about this location
    const res = await fetch(apiUrl);
    // If the API didn't work, return the row with an error
    if (!res.ok) return { ...row, api_error: true };
    // Get the data back from the API
    let snap = await res.json();
    // Sometimes the API gives us an array, sometimes an object
    if (Array.isArray(snap)) snap = snap[0] || {};
    if (snap.Route_Info) snap = snap.Route_Info;
    // Add the new info to our row
    return {
      ...row,
      District_Number : snap.District_Number || snap.district_number, // Which district
      County_Name: snap.County_Name || snap.county_name, // Which county
      Milepoint: snap.Milepoint || snap.milepoint, // Where on the road
      Road_Name: snap.Road_Name || snap.road_name, // Name of the road
      Route: snap.Route || snap.route, // Route number
      Route_Label: snap.Route_Label || snap.route_label, // Route label
      Route_Prefix: snap.Route_Prefix || snap.route_prefix, // Prefix (KY, US, etc)
      Snap_Status: snap.Snap_Status || snap.snap_status // How well the API matched the location
    };
  } catch (e) {
    // If something went wrong, add the error message to the row
    return { ...row, api_error: e.message };
  }
}


async function main()
// This is the main function that runs everything step by step
// -------------------------
// MAIN ORCHESTRATOR
// -------------------------
// This function ties together all ETL steps: extraction, transformation, enrichment, and loading.
// It demonstrates batch processing, file I/O, and logging in Node.js.
  // The following block demonstrates how to check for an existing file and warn the user
  // that it will be overwritten, a common pattern in ETL jobs to avoid accidental data loss.
// This function will attempt to put all of this together.

// Main workflow function:
// 1. Fetches the CSV data.
// 2. Filters rows to retain only fields not available from the enrichment API.
// 3. Enriches each row with additional attributes from the API (in batches).
// 4. Writes results in batches to an output file, overwriting any previous output.


{
// This provides console out to help debug the process
  // 1. Get the CSV file from the internet
  const csvUrl = 'https://raw.githubusercontent.com/chrislambert-ky/analysis-ky-roadclosures/refs/heads/main/data-reportready/kytc-closures-2021-2025-report_dataset.csv';
  console.log('Fetching CSV from:', csvUrl);
  const csvText = await fetchCSV(csvUrl);
  console.log('CSV fetched. Length:', csvText.length);
  // 2. Turn the CSV into an array of objects
  const filteredRows = filterRows(csvText);
  console.log('Rows parsed:', filteredRows.length);
  // Show the first row so we can see what the data looks like
  if (filteredRows.length > 0)
  {
    console.log('First row:', filteredRows[0]);
  }


// NOTE about the API: 
// The following code processes the enrichment in batches to avoid overloading the API and to track progress.
// After some experimentation, I found that the API cannot handle a large number of requests.
// The API developer told me that my 10K records shouldn't be a problem 
// but it still locks when I try to pass the entire 10K records.
// The API developer is not an Node.js developer and is not familiar with possible Node.js issues
// We managed to get it working so I'm going to leave it as-is.
  // Set up batch size and output file
  const BATCH_SIZE = 500; // How many records to process at once
  const rowsToProcess = filteredRows;
  let idx = 0; // Start at the beginning
  const outputFile = './data/data_v4_final_roadclosures.json'; // Where to save the results
  // Let the user know if the file will be overwritten
  if (fs.existsSync(outputFile)) {
    console.log('Output file will be overwritten at the end of processing.');
  }

async function processBatch(batch, batchStartIdx)
// -------------------------
// BATCH PROCESSING
// -------------------------
// This helper function shows how to process a batch of records concurrently using Promise.all.
// It is a common pattern for efficient API calls in Node.js.
  // The following block demonstrates how to measure elapsed time for performance monitoring
  // and how to log ETL run metadata to a CSV file for reproducibility and auditing.
  // The following block demonstrates how to write results to a file in JSON format,
  // and how to print progress and sample output for debugging and learning purposes.

// The API seemed to lock up if I sent too many requests at once.
// This function will handle the enrichment of each row in the batch
// Using Promise.all to handle concurrency
{
    // For each row in the batch, call enrichRow at the same time
    return await Promise.all(batch.map((row, i) => {
      return enrichRow({ ...row });
    }));
  }

  // Start a timer so we know how long the script takes
  const startTime = Date.now();

  let allEnriched = [];
  // Go through the data in batches
  while (idx < rowsToProcess.length) {
    // Get the next batch of rows
    const batch = rowsToProcess.slice(idx, idx + BATCH_SIZE);
    // Enrich each row in the batch (calls the API for each)
    const enrichedBatch = await processBatch(batch, idx);
    // Add the enriched rows to our results
    allEnriched.push(...enrichedBatch);
    // Save the current results to the output file
    fs.writeFileSync(outputFile, JSON.stringify(allEnriched, null, 2));
    // Print progress so we know it's working
    console.log(`Batch ${Math.floor(idx / BATCH_SIZE) + 1}: ${enrichedBatch.length} records processed. Total so far: ${allEnriched.length}`);
    idx += BATCH_SIZE;
  }

  // Stop the timer and calculate how long it took
  const endTime = Date.now();
  const elapsedSeconds = ((endTime - startTime) / 1000).toFixed(2);
  // Set up the log directory and file
  const logDir = './log_etl';
  const logFileCsv = `${logDir}/etl_run_log.csv`;
  // If the log directory doesn't exist, make it
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }
  // Prepare the CSV header and row
  const csvHeader = 'startTime,endTime,totalRecords,elapsedSeconds,outputFile\n';
  const csvRow = `"${new Date(startTime).toISOString()}","${new Date(endTime).toISOString()}",${allEnriched.length},${elapsedSeconds},"${outputFile}"\n`;
  // Only write the header if the file doesn't exist yet
  let writeHeader = !fs.existsSync(logFileCsv);
  // Add the log row to the file
  fs.appendFileSync(logFileCsv, (writeHeader ? csvHeader : '') + csvRow);

  // Let the user know we're done and where the results are
  console.log(`All records processed. Total: ${allEnriched.length} records written to ${outputFile}`);
  console.log(`Log written to ${logFileCsv}`);

  // If we have any results, show a sample row
  if (allEnriched.length > 0) {
    // Output a sample to console for troubleshooting
    console.log('Sample enriched row:', allEnriched[0]);
  }
}

main().catch(console.error);
