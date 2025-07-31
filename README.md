# Interactive Report for Road Closures

### Personal Disclaimer:
- _While I am an employee of the Kentucky Transportation Cabinet, this analysis of road closure data is not an official KYTC analysis.  This project exists for me to learn and grow my skills in web development (HTML, CSS, Javascript)._
- _My background is in:_
  - IT Project Manager / Data Analyst
  - SQL (Google BigQuery, Oracle)
  - BI Tools (Looker Studio, Tableau, PowerBI).
  - Python ETLs
### Data Disclaimer:
- _There are many factors that contribute to road closures that are not disclosed in this dataset. This dataset is not a complete or comprehensive list of all road closures and/or damaged roadways.  These are only the reports that were verified by the Transportatioin Operatations Center in real-time and displayed on the GoKY website. As an employee of KYTC, I want to promote safety and mobility for everyone and I would encourage you to please utilize the following resources:_<br>
- **_"Know before you go" Real-Time Traveler Information can be found at [GoKY](https://goky.ky.gov)_**
- **_KYTC also shares real-time data with [Waze](https://www.waze.com/en/live-map/)._**

**-_Chris Lambert_**

### Project Outline:

- This document started as a project outline for [Code:You](https://code-you.org/) but I have updating the document as a I complete work on the project.<br>
- In addition to the GitHub Repo [report-ky-roadclosures](https://github.com/chrislambert-ky/report-ky-roadclosures), I've also setup a [GitHub Page](https://pages.github.com/) site called [report-ky-roadclosures](https://chrislambert-ky.github.io/report-ky-roadclosures/).  The data displayed on this site will update each night at 12:30am using [GitHub Actions](https://github.com/features/actions)<br>

## Introduction

**Goal:**  Develop a responsive web application that visualizes historic road closure data sourced from the [Kentucky Transportation Cabinet](https://transportation.ky.gov/Pages/Home.aspx).  This will be accomplished by pulling road closure data hosted on GitHub, enhance the roadway attributes using a Kentucky Transportation Cabinet [Spatial API](https://kytc-api-v100-lts-qrntk7e3ra-uc.a.run.app/docs), and then produce an interactive, responsive, website that provides business intelligence capabilities.

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


## [Code:You](https://code-you.org/) Capstone Requirements Covered in This Project ##

- **Complete (Rating: Easy)** Analyze data that is stored in arrays, objects, sets or maps and display information about it in your app.<br>
**Demonstrated in:**
  - [Analysis by Count](./html/analysis_by_count.html)
  - [Analysis by Duration](./html/analysis_by_duration.html)
  - [Map View](./html/analysis_by_map.html)
  - [Table View](./html/analysis_by_table.html)
- **Complete (Rating:Easy)** Create a function that accepts two or more input parameters and returns a value that is calculated or determined by the inputs.  Basic math functions don’t count (e.g. addition, etc).<br>
**Demonstrated in:**
  - [`etl_data.js`](./etl_data.js)
  - [Analysis by Count](./html/analysis_by_count.html)
  - [Analysis by Duration](./html/analysis_by_duration.html)
- **Complete (Rating: Easy/Intermediate)** Visualize data in a user friendly way. (e.g. graph, chart, etc).  This can include using libraries like ChartJS<br>
**Demonstrated in:**
  - [Analysis by Count](./html/analysis_by_count.html)
  - [Analysis by Duration](./html/analysis_by_duration.html)
  - [Map View](./html/analysis_by_map.html)
  - [Table View](./html/analysis_by_table.html)
- **Complete (Intermediate)** Calculate and display data based on an external factor (ex: get the current date, and display how many days remaining until some event)<br>
**Demonstrated in:**
  - [`etl_data.js`](./etl_data.js)
- **Complete (Intermediate/Hard)** Persist data to an internal API and make the stored data accessible in your app. (including after reload/refresh).  This can be achieved either by using local storage or building your own API that stores data into a JSON file.<br>
**Demonstrated in:**
  - [`etl_data.js`](./etl_data.js)
- **Comlpete (Rating: Easy/Intermediate)** Implement modern interactive UI features (e.g. table/data sorting, autocomplete, drag-and-drop, calendar-date-picker, etc).<br>
**Demonstrated in:**
  - [Map View](./html/analysis_by_map.html)
  - [Table View](./html/analysis_by_table.html)



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
   - This will execute [`etl_data.js`](/etl_data.js) and generate a [`./data/data_v4_final_roadclosures.json`](./data/data_v4_final_roadclosures.json) file containing the fully processed and enriched dataset.

**Notes: Data Retrieval, Storage, and Integration**
- The current version will take quite some time to run since it processes one record per call.  To help with this, I setup a github action that runs each night so you should receive a working dataeet as part of the clone process.
- The ETL pipeline reprocesses historic road closure data using the KYTC API, ensuring all records have the most up-to-date roadway attributes

## Core Features

#### Back-End / Server-Side ETL & Data Processing
- Fetch [CSV formatted data](https://raw.githubusercontent.com/chrislambert-ky/analysis-ky-roadclosures/refs/heads/main/data-reportready/kytc-closures-2021-2025-report_dataset.csv) from my Python based [Road Closure Analysis](https://github.com/chrislambert-ky/analysis-ky-roadclosures) GitHub repo.
- Parses source dataset to retain only unique fields
  - Latitude
  - Longitude
  - Comments
  - Reported_On
  - End_Date
  - Duration_Hours
- Reprocess unique values using (lat, long) using the **[KYTC Route API](https://kytc-api-v100-lts-qrntk7e3ra-uc.a.run.app/docs)** to add updated values for the following items:
  - District
  - County
  - Route
  - Route Label
  - Route Prefix
  - Road Name
  - Milepoint
  - Snap Status
- Output written to [`./data/data_v4_final_roadclosures.json`](./data/data_v4_final_roadclosures.json) after each batch

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
-- **Deploy [`etl_data_ai.js`](etl_data_ai.js)** for more efficient API calls.
  - Batch processing (100 records per batch) to avoid API overload
  - Error handling: API errors and missing data are logged in the output
- Continue to enhance dashboard UI/UX and interactivity
  - Add more advanced filtering for apache echart graphs.
  - Add multiple graphs per page, aligning more closely with BI solutions.
  - Add County and/or KYTC District polygons to map view.
  - Add pivot table functionality for table view users.

## AI Use Disclaimer:
- The current [`etl_data.js`](/etl_data.js) script is my work.  After reading the [Code:You](https://code-you.org/) AI policy, I felt like I should revert back to that version to better represent what I've learned.  Lol... and when I say **my** work: I mean that I had to search for things, piece together examples, iterate through error messages, look through python code and try to translate functions into Javascript, and even ask questions of coworkers/developers.
-- The [`etl_data_ai.js`](etl_data_ai.js) script, which I will deploy after the capstone, reqired GitHub CoPilot.  I used AI quite a bit to troubleshoot API errors.  My issue occurred when I tried sending batches of records to the API.  I started by trying to feed the entire 10k records to the API but it kept locking up.  I even spoke with the API developer but he couldn't help me.  I was told that the API should be able to handle a batch of 10k records but it never worked.  So I needed Copilot Agentic mode to get through what is now the [`etl_data_ai.js`](etl_data_ai.js) script.  I have not found another way to develop it.  Even after it was developed, I asked different AI bots to optimize the code and they all failed.  Each one makes modifications that throw more errors.  It works in it's current form and I have no desire to change it.
- I used GitHub Copilot again to help with the documentation of [`etl_data_ai.js`](etl_data_ai.js).  Since ETLs aren't something that people modify often, I will need as much documentation as possible for making updates when/if the API changes.  I first documented the script myself but then I prompted GitHub Copilot to "add comments so that others can better understand the ETL process and use this script as a learning tool."

