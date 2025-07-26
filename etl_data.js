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
// This script is co-written by GitHub CoPilot, GPT 4.1 using the autocomplete feature.

// GOAL:
// This script aims to reprocess historic road closure data for analysis and reporting purposes.
// This data will eventually support the Dashboards that are the main focus of this project.
// This particular script attempts to recreate a python based ETL (extract, transform, and load) process.

// METHODOLOGY:
// I'm going to break down my ETLs into steps for my own peace of mind.
// Step 1: Fetch data from CSV source, parse as JSON, and save it to 'data_v1_full_dataset.json'.
// Step 2: Fetch, parse, and filter fields/columns, and save to 'data_v2_parsed_filtered_data.json'.
// Step 3: Fetch, parse, filter, and geo-enrich using the KYTC API, and store as 'data_v3_reprocessed_dataset.json'.
// Step 4: Fetch, parse, filter, reprocess, add etl logging results, and store the data for final output as 'data_v4_final_roadclosures.json'.

// NOTES:
// The data being retreived is historic road closure data.
// Since roadway information changes over time, I need to re-process the data with more recent attributes.
// I want to ensure that people can review historic data in the most recent context.

// AI Use
// This script was first documented by me and then I prompted GitHub Copilot
// to add comments so that others can better understand the ETL process 
// and use this script as a learning tool.
// (Not to mention reminding me how it works after I walk away).
// I was also forced to use AI to help me with the errors
// I kept trying to feed the entire 10k records to the API and it kept locking up.  
// I needed Copilot Agentic mode to get me through it.


// =========================
// MODULE IMPORTS - Very similar to Python imports
// =========================
// 'node-fetch' is self explanatory - it's used for fetching data and/or making API calls.
// 'csv-parse/sync' is used for parsing CSV data into JavaScript objects.
// 'fs ' is used for file system operations (reading/writing files)
import fetch from 'node-fetch';
import { parse } from 'csv-parse/sync';
import fs from 'fs';


async function fetchCSV(url) 
// EXTRACT STEP - Pulling data from a remote source
// -------------------------
// This function demonstrates how to fetch remote data using async/await and error handling.
// Fetches CSV data from the other repo using the raw csv url.
// I have added the error handling to ensure the fetch is successful.

// DESIGN DECISION: I used async/await for network requests becuase that seemed like it would work.
// Error handling is included to help me troubleshoot.
{
  // Use fetch to get the CSV file from the internet
  const res = await fetch(url);
  // If the request didn't work, show an error
  if (!res.ok) throw new Error('Failed to fetch CSV');
  // Return the text of the CSV file
  return await res.text();
}


function filterRows(csvText)
// TRANSFORM STEP
// -------------------------
// This function shows how to parse CSV data.
// I only need the unique fields that cannot be replaced with the API.
// The dataset is fairly large (approx 10K rows as of 2025-07-09).
// This will help reduce the amount of data processed and (I hope) improve performance.

{
  // Colnverts the CSV text into an array of objects (one for each row)
  const records = parse(csvText, { columns: true, skip_empty_lines: true });
  // For each row, keep only the fields that make the record unique.
  return records.map(row => (
    {
    latitude: row.latitude, // Closure location (latitude)
    longitude: row.longitude, // Closure location (longitude)
    Comments: row.Comments, // Notes about the closure
    Reported_On: row.Reported_On, // When the rclosure was first reported
    End_Date: row.End_Date, // When the closure ended (if known)
    Duration_Hours: row.Duration_Hours // Duration (hours) - this is calculate in the previous python script.
    }));
}


async function enrichRow(row) 
// ENRICHMENT STEP
// -------------------------
// This function demonstrates how to call an external API for each record and merge new attributes into a new dataset.
// It also shows robust error handling for API/network issues.
// This functon will leverage a specialized KYTC API for geo-processing data.
// This will reprocess the unique historic data with updated attributes like Road_Name, Milepoint, etc.
// The API endpoint is: https://kytc-api-v100-lts-qrntk7e3ra-uc.a.run.app/api/route/GetRouteInfoByCoordinates
// The API documentation is: https://kytc-api-v100-lts-qrntk7e3ra-uc.a.run.app/docs
// The API docs provide Python code to better understand the API and hopefull recreate the same functionality

// DISCLAIMER: 
// This was very tricky for me.  I simply did not have time to troubleshoot the problem.
// I spoke with the API developer but they didn't know Javascript and couldn't halp me.
// Working with this API took a considerable amount of trial and error.
// I had to rely on GitHub CoPilot to help me with the errors.
// GitHub Copilot in Agentic mode helped me with this after I struggled with the API locking up.

{
  // Theh API doesn't work without latitude and longitude (sort of - it's complicated).
  if (!row.latitude || !row.longitude) return { ...row, api_error: 'Missing coordinates' };
  // Build the API request with the coordinates and the fields I want
  const params = new URLSearchParams({
    xcoord: row.longitude, // API expects longitude as x
    ycoord: row.latitude,  // API expects latitude as y
    return_keys: 'District_Number,County_Name,Milepoint,Road_Name,Route,Route_Label,Route_Prefix,Snap_Status',
    return_format: 'json'
  });
  // Make the full API URL
  const apiUrl = `https://kytc-api-v100-lts-qrntk7e3ra-uc.a.run.app/api/route/GetRouteInfoByCoordinates?${params.toString()}`;
  try {
    // Ask the API for info about this location.  I'm using 'try' to avoid crashing the script if the API fails.
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
      District_Number : snap.District_Number || snap.district_number,
      County_Name: snap.County_Name || snap.county_name,
      Milepoint: snap.Milepoint || snap.milepoint,
      Road_Name: snap.Road_Name || snap.road_name,
      Route: snap.Route || snap.route,
      Route_Label: snap.Route_Label || snap.route_label,
      Route_Prefix: snap.Route_Prefix || snap.route_prefix,
      Snap_Status: snap.Snap_Status || snap.snap_status // The API snapping has a distance threshold for gps coordinate vs roadway centerline.
    };
  } catch (e) {
    // If something went wrong, add the error message to the row
    return { ...row, api_error: e.message };
  }
}


async function main()
// MAIN
// -------------------------
// This is the main function that runs everything.
// This function ties together all ETL steps: extraction, transformation, enrichment, and loading.
// It demonstrates batch processing, file input/output and logging.
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
  console.log('Fetching CSV from:', csvUrl); // shows the URL being fetched
  const csvText = await fetchCSV(csvUrl); // fetches the CSV file from the URL
  console.log('CSV fetched. Length:', csvText.length); // shows how long the CSV is
  // 2. Turn the CSV into an array of objects
  const filteredRows = filterRows(csvText); // filters the rows to keep only the fields we need
  console.log('Rows parsed:', filteredRows.length); // shows how many rows were parsed
  // Show the first row so users can see what the data looks like.
  if (filteredRows.length > 0) // check if there are any rows to show
  {
    console.log('First row:', filteredRows[0]); // show the first row of data
  }


// NOTE about the API: 
// The following code processes the enrichment in batches to avoid overloading the API and to track progress.
// This was needed for the troubleshooting process.
// After some experimentation, I found that the API cannot handle a large number of requests.
// The API developer told me that my 10K records shouldn't be a problem 
// but it still locks when I try to pass the entire 10K records.
// The API developer is not a Javascript developer and is not familiar with possible Node.js issues
// He and I managed to get it working with GitHub copilot so I'm going to leave it as-is.
  // Set up batch size and output file
  const BATCH_SIZE = 500; // I have adjusted this for performance.  500 records per batch seems to work well.
  const rowsToProcess = filteredRows; // keep the filtered rows for processing
  let idx = 0; // Start at the beginning
  const outputFile = './data/data_v4_final_roadclosures.json'; // Where to save the results
  // Let the user know if the file will be overwritten
  if (fs.existsSync(outputFile)) 
    {
    // This line lets the user know the file will be overwritten.  
    // I had to do this to avoid confusion and troubleshooting.
    console.log('Output file will be overwritten at the end of processing.'); 
    }

async function processBatch(batch, batchStartIdx)
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
