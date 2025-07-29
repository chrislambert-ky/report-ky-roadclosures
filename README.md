# Project Outline: Interactive Report for Road Closures
This document started as a project outline but I'm updating the document as a I complete work on the project.

## Introduction

**Goal:**  Develop a responsive web application that visualizes historic road closure data sourced from the Kentucky Transportation Cabinet.  This will be accomplished by pulling road closure data hosted on GitHub, enhance the roadway attributes using a Kentucky Transportation Cabinet spatial API, and then produce an interactive, responsive, website that provides business intelligence capabilities.

**Objective:**
  - Retrieve csv formatted road closure data from a github repo.
  - Reprocess historic data with updated roadway attributes.
  - Develop user-friendly, interactive dashboard(s) to quantify closures.
  - Develop filtering for users to focus and explore closure data.

**Tools and Technologies:** 
- [Node.js](https://nodejs.org/en)
- [GitHub API](https://docs.github.com/en/rest/using-the-rest-api)
- [Geospatial API provided by KYTC](https://kytc-api-v100-lts-qrntk7e3ra-uc.a.run.app/docs)
- [HTML](https://developer.mozilla.org/en-US/docs/Web/HTML) / [CSS](https://developer.mozilla.org/en-US/docs/Web/CSS) / [Javascript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [Apache eCharts](https://echarts.apache.org/en/index.html)
- [Plotly Javascript Library](https://plotly.com/javascript/) (optional)
- [Leaflet](https://leafletjs.com/)
- [AG Grid](https://www.ag-grid.com/javascript-data-grid/getting-started/)
- [Free Icons org](https://www.freeicons.org/)


## Getting Started

**Requirements:**
- Node.js v18 or newer
- Internet connection is required to fetch source data and call the KYTC API

1. **Clone the Repository**
   ```bash
   git clone https://github.com/chrislambert-ky/report-ky-roadclosures.git
   cd report-ky-roadclosures
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Run the ETL Pipeline**
  - To fetch, process, enrich, and store road closure data, use:
     ```bash
     npm start
     ```
   - This will execute `etl_data.js` and generate a `./data/data_v4_final_roadclosures.json` file containing the fully processed and enriched dataset.

**Notes: Data Retrieval, Storage, and Integration**
- The current version will take quite some time to run since it processes one record per call.  To help with this, I setup a github action that runs each night so you should receive a working dataeet as part of the clone process.
- The ETL pipeline reprocesses historic road closure data using the KYTC API, ensuring all records have the most up-to-date roadway attributes

## Core Features

#### Back-End / Server-Side ETL & Data Processing
- Fetch CSV formatted data from a GitHub repo
- Parses source dataset to retain only unique fields
  - Latitude
  - Longitude
  - Comments
  - Reported_On
  - End_Date
  - Duration_Hours
- Reprocess unique values using (lat, long) using the **KYTC Route API** to add updated values for the following items:
  - District
  - County
  - Route
  - Route Label
  - Route Prefix
  - Road Name
  - Milepoint
  - Snap Status
- Output written to `./data/data_v4_final_roadclosures.json` after each batch

#### Web Design: Interactive Dashboards
- Responsive site design using CSS Grid and Flexbox
- Consistent, modern CSS across all pages
- Consistent navigation menu bar with hover effects
- Launch page with icons, descriptions, and hover effects
- Analysis by Count: Apache ECharts with count of closures
- Analysis by Duration: Apache ECharts with total hours of closures
- Map View: Interactive Leaflet map with marker clustering and detailed pop-ups
- Table View: Interactive table using AG Grid with filtering and export options
- PowerBI Dashboard: Embedded PowerBI using iframe.
- About page with hover over information about myself and this project

## Under Development
The following items are still being improved or are planned for future releases:
- **Deploy `etl_data_ai.js`** for more efficient API calls.
  - **(coming soon: after capstone)** Batch processing (100 records per batch) to avoid API overload
  - **(coming soon: after capstone)** Error handling: API errors and missing data are logged in the output
- Continue to enhance dashboard UI/UX and interactivity
  - Add more advanced filtering for apache echart graphs.
  - Add multiple graphs per page, aligning more closely with BI solutions.
  - Add County and/or KYTC District polygons to map view.
  - Add pivot table functionality for table view users.

## AI Use Disclaimer:
- The current `etl_data.js` script is my own work.  After reading the Code:You AI policy, I felt like I should revert back to the current version which is a better representation of my work.  And when I say my own work: I mean that I had to search for things, piece together examples, iterate through error messages, look through python code and try to translate function into Javascript, and even ask questions of coworkers/developers.
- The `js/etl_data_ai.js` script, which I will deploy after the capstone, reqired the use of GitHub CoPilot.  I was forced to use AI quite a bit to troubleshoot API errors.  My issue was the API and sending records in batches.  I started by trying to feed the entire 10k records to the API but it kept locking up.  I even spoke with the API developer but he doesn't know Javascript and couldn't help me.  I was told that the API should be able to handle a batch of 10k records but it never worked.  So I needed Copilot Agentic mode to get through what is now the `js/etl_data_ai.js` script.  I have not found another way to develop it.  Even after it was developed, I asked different AI bots to optimize the code and they all failed.  Each one makes modifications that throw more errors.  It works in it's current form and I have no desire to change it.
- I used GitHub Copilot again to help with the documentation of `js/etl_data_ai.js`.  Since ETLs aren't something that people modify often, I will need as much documentation as possible for making updates when/if the API changes.  I first documented the script myself but then I prompted GitHub Copilot to "add comments so that others can better understand the ETL process and use this script as a learning tool."
- For the assignment, I have reverted back to one of my original iterations for `etl_data.js` that performs one API call per record.  After the capstone, I will redeploy the AI version since it is more efficient and heavily documented.