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


// After reading the AI policy, I decided to revert back to my original script.
// The other script is much faster and better at handling errors but this script is my work.
// The AI assisted ETL script (in the /js folder) will be used after class.

// Chris Lambert
// Date: July 2025



// home pc is setup to use ES6 modules
import fetch from 'node-fetch';
import { parse } from 'csv-parse/sync';
import fs from 'fs';

// work pc is setup to use CommonJS modules
// const fetch = require('node-fetch');
// const { parse } = require('csv-parse/sync');
// const fs = require('fs');

const csvUrl = 'https://raw.githubusercontent.com/chrislambert-ky/analysis-ky-roadclosures/refs/heads/main/data-reportready/kytc-closures-2021-2025-report_dataset.csv';
// Function to fetch the CSV and read as plain text
async function fetchCSV(url)
{
  let response = await fetch(url);
  let csvText = await response.text();
  return csvText;
}

// Function to parse the CSV and only keep the unique fields
const uniqueRecords = [];
function uniqueFields(records)
{
  // Loop through each record
  // I'm essentially transferring values from one array to another
  for (let i = 0; i < records.length; i++) {
    let currentRow = records[i];
    let minimalRow = {};
    minimalRow.latitude = currentRow.latitude;
    minimalRow.longitude = currentRow.longitude;
    minimalRow.Comments = currentRow.Comments;
    minimalRow.Reported_On = currentRow.Reported_On;
    minimalRow.End_Date = currentRow.End_Date;
    minimalRow.Duration_Hours = currentRow.Duration_Hours;
    uniqueRecords.push(minimalRow);
  }
  return uniqueRecords;
}

// Function to reprocess a record using the KYTC API
async function enrichRow(row)
{
  // query the API - Postman was good for this
  // https://kytc-api-v100-lts-qrntk7e3ra-uc.a.run.app/docs
  const params = new URLSearchParams();
  params.append('xcoord', String(row.longitude));
  params.append('ycoord', String(row.latitude));
  params.append('return_keys', 'District_Number,County_Name,Milepoint,Road_Name,Route,Route_Label,Route_Prefix,Snap_Status');
  params.append('return_format', 'json');
  const apiUrl = 'https://kytc-api-v100-lts-qrntk7e3ra-uc.a.run.app/api/route/GetRouteInfoByCoordinates?' + params.toString();
  const response = await fetch(apiUrl);
  let snap = await response.json();

  // This was kind of cool but also a real pain.
  // The enriched roadway attributes are inside of snap.Route_Info object.
  // This is like the class example we had about the car (finding Toyota.Corolla).
  
  const info = snap.Route_Info || {};
  return {
    latitude: row.latitude,
    longitude: row.longitude,
    Comments: row.Comments,
    Reported_On: row.Reported_On,
    End_Date: row.End_Date,
    Duration_Hours: row.Duration_Hours,
    District_Number: info.District_Number || info.district_number || null,
    County_Name: info.County_Name || info.county_name || null,
    Milepoint: info.Milepoint || info.milepoint || null,
    Road_Name: info.Road_Name || info.road_name || null,
    Route: info.Route || info.route || null,
    Route_Label: info.Route_Label || info.route_label || null,
    Route_Prefix: info.Route_Prefix || info.route_prefix || null,
    Snap_Status: info.Snap_Status || info.snap_status || null
  };
}

// Final ETL process: fetch, parse, filter, enrich, and write to JSON
async function main() {
  const csvText = await fetchCSV(csvUrl);
  const records = parse(csvText, { columns: true, skip_empty_lines: true });
  const uniqueRecords = uniqueFields(records);
  const allEnriched = [];
  for (let i = 0; i < uniqueRecords.length; i++)
    {
    const enriched = await enrichRow(uniqueRecords[i]);
    allEnriched.push(enriched);
    console.log (`Processed record ${i + 1}/${uniqueRecords.length}`);
  }
  
  // visualizations are already setup for the v4 filename.
  // const outputFile = './data/data_reportready_dataset.json';
  const outputFile = './data/data_v4_final_roadclosures.json';
  fs.writeFileSync(outputFile, JSON.stringify(allEnriched, null, 2));
}


main();