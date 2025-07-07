// possible fectch method
import fetch from 'node-fetch';

const url = 'https://raw.githubusercontent.com/chrislambert-ky/analysis-ky-roadclosures/refs/heads/main/data-reportready/kytc-closures-2021-2025-report_dataset.csv';

async function fetchCSV(url) 
{
  const response = await fetch(url);
  const csvText = await response.text();
  return csvText;
}

fetchCSV(url).then(csvText => 
{
  console.log('Sample data:', csvText.slice(0, 500));
});