// STAGE 4: Add logging to the script.
// This script demonstrates a full ETL pipeline with logging of run details to a CSV file.
// Author: Chris Lambert (with GitHub Copilot)
// Date: July 2025

import fetch from 'node-fetch';
import { parse } from 'csv-parse/sync';
import fs from 'fs';

async function main() {
  const startTime = Date.now();
  const log = {
    startTime: new Date(startTime).toISOString(),
    endTime: null,
    totalRecords: 0,
    elapsedSeconds: null,
    outputFile: null
  };
  const csvUrl = 'https://raw.githubusercontent.com/chrislambert-ky/analysis-ky-roadclosures/refs/heads/main/data-reportready/kytc-closures-2021-2025-report_dataset.csv';
  const csvText = await fetchCSV(csvUrl);
  const records = parse(csvText, { columns: true, skip_empty_lines: true });
  const minimal = records.map(row => ({
    latitude: row.latitude,
    longitude: row.longitude,
    Comments: row.Comments,
    Reported_On: row.Reported_On,
    End_Date: row.End_Date,
    Duration_Hours: row.Duration_Hours
  }));
  // Enrich rows in batches of 500 to avoid API lockups
  const BATCH_SIZE = 500;
  let allEnriched = [];
  let idx = 0;
  const outputFile = './data/data_reportready_dataset.json';
  while (idx < minimal.length) {
    const batch = minimal.slice(idx, idx + BATCH_SIZE);
    const enrichedBatch = await Promise.all(batch.map(enrichRow));
    allEnriched.push(...enrichedBatch);
    // Save progress after each batch
    fs.writeFileSync(outputFile, JSON.stringify(allEnriched, null, 2));
    console.log(`Processed: ${allEnriched.length}`);
    idx += BATCH_SIZE;
  }
  // Logging
  const logDir = './log_etl';
  const logFileCsv = `${logDir}/etl_run_log.csv`;
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }
  const endTimestamp = Date.now();
  const elapsedSecs = ((endTimestamp - startTime) / 1000).toFixed(2);
  log.endTime = new Date(endTimestamp).toISOString();
  log.totalRecords = allEnriched.length;
  log.elapsedSeconds = Number(elapsedSecs);
  log.outputFile = outputFile;
  const csvHeader = 'startTime,endTime,totalRecords,elapsedSeconds,outputFile\n';
  const csvRow = `"${log.startTime}","${log.endTime}",${log.totalRecords},${log.elapsedSeconds},"${log.outputFile}"\n`;
  let writeHeader = !fs.existsSync(logFileCsv);
  fs.appendFileSync(logFileCsv, (writeHeader ? csvHeader : '') + csvRow);
  console.log(`Script completed in ${elapsedSecs} seconds. Processed ${allEnriched.length} records.`);
  console.log(`Log written to ${logFileCsv}`);
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
