// After reading the AI policy, I've decided to go back to my original code.
// I will redeploy my other etl after this project has been graded.

// work computer setup
import fetch from 'node-fetch';
import { parse } from 'csv-parse/sync';
import fs from 'fs';

// home computer setup
// const fetch = require('node-fetch');
// const { parse } = require('csv-parse/sync');
// const fs = require('fs');

async function fetchCSV(url) {
  const response = await fetch(url);
  const text = await response.text();
  return text;
}

async function main() {
  const csvUrl = 'https://raw.githubusercontent.com/chrislambert-ky/analysis-ky-roadclosures/refs/heads/main/data-reportready/kytc-closures-2021-2025-report_dataset.csv';
  const csvText = await fetchCSV(csvUrl);
  const records = parse(csvText, { columns: true, skip_empty_lines: true });

  const minimalRecords = [];
  for (let i = 0; i < records.length; i++) {
    const row = records[i];
    minimalRecords.push({
      latitude: row.latitude,
      longitude: row.longitude,
      Comments: row.Comments,
      Reported_On: row.Reported_On,
      End_Date: row.End_Date,
      Duration_Hours: row.Duration_Hours
    });
  }

  //since everything is built on the data_v4 file, I need to comment this out
  //const outputFile = './data/data_reportready_dataset.json';
  const outputFile = './data/data_v4_final_roadclosures.json';
  const allEnriched = [];
  const BATCH_SIZE = 200;

  for (let i = 0; i < minimalRecords.length; i += BATCH_SIZE) 
  {
    const batch = minimalRecords.slice(i, i + BATCH_SIZE);
    const enrichedBatch = await Promise.all(batch.map(enrichRow));
    allEnriched.push(...enrichedBatch);
    fs.writeFileSync(outputFile, JSON.stringify(allEnriched, null, 2));
    console.log('Processed:', allEnriched.length);
  }
}

async function enrichRow(row) 
{
  const params = new URLSearchParams();
  params.append('xcoord', row.longitude);
  params.append('ycoord', row.latitude);
  params.append('return_keys', 'District_Number,County_Name,Milepoint,Road_Name,Route,Route_Label,Route_Prefix,Snap_Status');
  params.append('return_format', 'json');
  const apiUrl = 'https://kytc-api-v100-lts-qrntk7e3ra-uc.a.run.app/api/route/GetRouteInfoByCoordinates?' + params.toString();
  const response = await fetch(apiUrl);
  let snap = await response.json();
  return {
    latitude: row.latitude,
    longitude: row.longitude,
    Comments: row.Comments,
    Reported_On: row.Reported_On,
    End_Date: row.End_Date,
    Duration_Hours: row.Duration_Hours,
    District_Number: snap.District_Number || snap.district_number,
    County_Name: snap.County_Name || snap.county_name,
    Milepoint: snap.Milepoint || snap.milepoint,
    Road_Name: snap.Road_Name || snap.road_name,
    Route: snap.Route || snap.route,
    Route_Label: snap.Route_Label || snap.route_label,
    Route_Prefix: snap.Route_Prefix || snap.route_prefix,
    Snap_Status: snap.Snap_Status || snap.snap_status
  };
}

main();