
// This is a test.  I'm testing fetch and filtering CSV before I use the next API to enrich the data.
// Making notes for myself and anyone reviewing my code.

// Import necessary modules.
import fetch from 'node-fetch';
import {parse} from 'csv-parse/sync';
import fs from 'fs';

async function main() 
{
  // I need to declare a variale for my CSV.
  // NOTE: I'm using the 'raw.' becuase the other "normal" url doesn't work.  GitHub must have that blocked.
  const csvUrl = 'https://raw.githubusercontent.com/chrislambert-ky/analysis-ky-roadclosures/refs/heads/main/data-reportready/kytc-closures-2021-2025-report_dataset.csv';

  // I need to declare a variable for my fetch results.
  const csvText = await fetchCSV(csvUrl); 

  // I need to declare a variable for my filtered columns.
  // I'm doing this becuase roadway attributes change over time.
  // I will later use a KYTC API to replace fields like Route, Road Name, and Mile Point with the latest roadway data.
  // What makes a road closure unique is: Lat/Long, Comments, Reported Date, End Date, and Duration.
  const filteredRows = filterRows(csvText);
  
  // I need to write the filtered rows to a JSON file.
  fs.writeFileSync('csv_base_data.json', JSON.stringify(filteredRows, null, 2));
  console.log(`Wrote ${filteredRows.length} records to csv_base_data.json`);
}

// Performs a fetch and returns the contents
async function fetchCSV(url) 
{
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch CSV');
  return await res.text();
}

// Parses the CSV text and returns an array of objects with only the fields needed for enrichment
function filterRows(csvText) 
{
  const records = parse(csvText, { columns: true, skip_empty_lines: true });
  return records.map(row => (
    {
    latitude: row.latitude,
    longitude: row.longitude,
    Comments: row.Comments,
    Reported_On: row.Reported_On,
    End_Date: row.End_Date,
    Duration_Hours: row.Duration_Hours
    }));
}


main().catch(console.error);
