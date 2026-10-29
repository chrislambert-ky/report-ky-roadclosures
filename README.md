# Interactive Report for Road Closures

**Hosted version:** [https://chrislambert-ky.github.io/report-ky-roadclosures/](https://chrislambert-ky.github.io/report-ky-roadclosures/)

## Choose your path

- **Just exploring the analysis?** Open the [hosted report](https://chrislambert-ky.github.io/report-ky-roadclosures/). No clone or setup is needed.
- **Using the Python tools or notebook?** Start with the [Python workflow guide](./python/README.md).
- **Developing the website or refreshing its data?** Follow the [web and data workflow guide](./docs/web-and-data-workflow.md).

## Repository map

- `python/` contains the Python ETL, analysis notebook, tests, and data dictionary.
- `index.html`, `html/`, `css/`, `js/`, and `images/` make up the static website currently published from the repository root.
- `etl_data.js` enriches the Python output for the website.
- `data-reportready/` contains the CSV, Excel, and Parquet report datasets; `data/` contains JSON used by the website and earlier pipeline outputs.
- `.github/workflows/etl_update.yml` runs the full data refresh nightly.
- `docs_js/` contains reference examples and experiments, not the current website entry point.

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

- This project combines the original Python analysis and ETL with the interactive web report. The live site remains a static [GitHub Pages](https://pages.github.com/) site and continues to update nightly through [GitHub Actions](https://github.com/features/actions).

## Introduction

**Goal:** Build a responsive analysis project around historic road-closure data from the [Kentucky Transportation Cabinet](https://transportation.ky.gov/Pages/Home.aspx). A Python ETL cleans the annual source files and publishes CSV, Excel, and Parquet datasets. A Node.js ETL enriches the records through the KYTC [Spatial API](https://kytc-api-v100-lts-qrntk7e3ra-uc.a.run.app/docs) for the interactive static website.

**Objective:**
  - Retrieve and clean yearly CSV road-closure data.
  - Export a consistent report dataset and reprocess locations with current roadway attributes.
  - Develop user-friendly, interactive dashboard(s) to quantify closures.
  - Develop filtering for users to focus and explore closure data.

**Tools and Technologies:** 
- [Node.js](https://nodejs.org/en)
- Python, pandas, and Jupyter
- [GitHub API](https://docs.github.com/en/rest/using-the-rest-api)
- [Geospatial API provided by KYTC](https://kytc-api-v100-lts-qrntk7e3ra-uc.a.run.app/docs)
- [HTML](https://developer.mozilla.org/en-US/docs/Web/HTML) / [CSS](https://developer.mozilla.org/en-US/docs/Web/CSS) / [Javascript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [Apache eCharts](https://echarts.apache.org/en/index.html)
- [Plotly Javascript Library](https://plotly.com/javascript/) (optional)
- [Leaflet](https://leafletjs.com/) and [Leaflet.markercluster](https://github.com/Leaflet/Leaflet.markercluster)
- [Tabulator](https://tabulator.info/) for compact interactive tables
- [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) for client-side data caching and refresh
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
- **Complete (Rating: Easy/Intermediate)** Implement modern interactive UI features (e.g. table/data sorting, autocomplete, drag-and-drop, calendar-date-picker, etc).<br>
**Demonstrated in:**
  - [Map View](./html/analysis_by_map.html)
  - [Table View](./html/analysis_by_table.html)



## Local development and data refresh

### Preview the website

The site is static and the generated JSON is already included, so you do not need to install Node.js or run the ETL just to browse it locally. From the repository root, run:

```bash
python -m http.server 8000
```

Then open <http://localhost:8000/>.

### Run the Python workflow

See the [Python workflow guide](./python/README.md) for installing its dependencies, running the ETL or notebook, and finding the generated report datasets. This path does not require Node.js.

### Refresh all datasets

This is the contributor path for regenerating both the downloadable report datasets and the website JSON. It requires Python 3.11 or newer, Node.js 20 or newer, and internet access to fetch source data and call the KYTC API.

```bash
python -m pip install -r python/requirements.txt
npm ci
python -m unittest discover -s python/tests
npm test
npm run update-data
```

The refresh runs the Python source-data pipeline followed by Node.js spatial enrichment. The report-ready CSV, Excel, and Parquet files are written to [`data-reportready/`](./data-reportready), and the site JSON is written to [`data/data_v4_final_roadclosures.json`](./data/data_v4_final_roadclosures.json). See the [web and data workflow guide](./docs/web-and-data-workflow.md) for details.

The original Python repository remains available for its raw/clean archives, legacy notebook, and Power BI files: [analysis-ky-roadclosures](https://github.com/chrislambert-ky/analysis-ky-roadclosures).

## Core Features

#### Back-End / Server-Side ETL & Data Processing
- Downloads annual CSV files directly from the KYTC source and combines them into a normalized report-ready dataset.
- Publishes the report-ready dataset as CSV, Excel, and Parquet files in [`data-reportready/`](./data-reportready).
- Reads the local Python output and enriches it with the KYTC Spatial API; the site ETL no longer depends on a second repository.
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
- Analysis by Count: Apache ECharts with closure counts
- Analysis by Duration: Apache ECharts with total closure hours
- Map View: Interactive Leaflet map with marker clustering and detailed pop-ups
- Table View: Compact Tabulator tables with pagination, column filtering, CSV export, and a stable layout for narrower browser widths
- Map + Table View: Row selection and multi-selection that update the visible map markers and show the current record count
- Grid.js comparison page: Global search plus per-column filters for side-by-side testing
- PowerBI Dashboard: Embedded PowerBI using iframe
- About page with background information about the project and the author

## Under Development
The following items are still being improved or are planned for future releases:
- Continue to enhance dashboard UI/UX and interactivity
  - Add more advanced filtering for apache echart graphs.
  - Add multiple graphs per page, aligning more closely with BI solutions.
  - Add County and/or KYTC District polygons to map view.
  - Add pivot table functionality for table view users.

## AI Use Disclaimer:
- The current [`etl_data.js`](./etl_data.js) script is my work.  After reading the [Code:You](https://code-you.org/) AI policy, I felt like I should revert back to that version to better represent what I've learned.  Lol... and when I say **my** work: I mean that I had to search for things, piece together examples, iterate through error messages, look through python code and try to translate functions into Javascript, and even ask questions of coworkers/developers.
- The AI-assisted script is retained as [`js/etl_data_ai_copy.js`](./js/etl_data_ai_copy.js) for reference; the current update workflow runs [`etl_data.js`](./etl_data.js), not that copy. The retained script documents the API batch-processing experiments and the AI-assisted troubleshooting that helped resolve them.
