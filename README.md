# Project Outline: Interactive Report for Road Closures
This document started as a project outline but I'm updating the document as a I complete work on the project.

## Introduction

**Goal:**  Develop a responsive web application that visualizes historic road closure data sourced from the Kentucky Transportation Cabinet.  This will be accomplished by pulling road closure data hosted on GitHub, enhance the roadway attributes using a Kentucky Transportation Cabinet spatial API, and then produce an interactive, responsive, website that provides business intelligence capabilities.

**Objective:**
  - **(complete)** Retrieve historic road closure data. 
  - **(complete)** Reprocess historic data with updated roadway attributes.
  - **(complete)** Develop user-friendly, interactive dashboard(s) to quantify closures.
  - **(complete)** Develop filtering for users to focus and explore closure data.

**Tools and Technologies:** 
- [Node.js](https://nodejs.org/en)
- [GitHub API](https://docs.github.com/en/rest/using-the-rest-api)
- [Geospatial API provided by KYTC](https://kytc-api-v100-lts-qrntk7e3ra-uc.a.run.app/docs)
- [HTML](https://developer.mozilla.org/en-US/docs/Web/HTML) / [CSS](https://developer.mozilla.org/en-US/docs/Web/CSS) / [Javascript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [Apache eCharts](https://echarts.apache.org/en/index.html) and/or [Plotly Javascript Library](https://plotly.com/javascript/)
- [Leaflet](https://leafletjs.com/)


### Core Features

#### Back-End / Server-Side ETL & Data Processing
- **(complete)** Fetch historic CSV data from GitHub (direct download, not via GitHub API)
- **(complete)** Parse CSV and store as JSON
- **(complete)** Filter dataset to retain only fields not available from the enrichment API:
  - Latitude
  - Longitude
  - Comments
  - Reported_On
  - End_Date
  - Duration_Hours
- **(complete)** Reprocess (enrich) filtered dataset using the **KYTC Route API** to add updated attributes:
  - District
  - County
  - Route
  - Road Name
  - Milepoint
  - Route Label
  - Route Prefix
  - Snap Status
- **(complete)** Batch processing (100 records per batch) to avoid API overload and allow for progress saving
- **(complete)** Error handling: API errors and missing data are logged in the output
- **(complete)** Output written to `./data/data_v4_final_roadclosures.json` after each batch

#### Web Design: Interactive Dashboards
- **(complete)** Responsive site design using CSS Grid and Flexbox
- **(complete)** Consistent, modern CSS across all pages
- **(complete)** Data visualizations with Apache ECharts
- **(complete)** Export options for filtered data and charts (CSV, image)

- **Map page:**
  - **(complete)** Interactive Leaflet map with marker clustering
  - Filter dropdowns for District, County, Route Type, and Year
  - Map markers update instantly based on filter selections
- **Table page:**
  - **(complete)** AG Grid for interactive, filterable data tables
- **Social links:**
  - **(complete)** Social/contact links with SVG icons in About and other pages
- **Documentation:**
  - **(complete)** ETL and UI workflow documented in About and server-side docs
  - **(complete)** Icons downloaded from https://www.freeicons.org/


## Getting Started

**Requirements:**
- Node.js v18 or newer is recommended
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
   - To fetch, process, enrich, and export road closure data, use:
     ```bash
     npm start
     ```
   - This will execute `etl_data.js` and generate a `./data/data_v4_final_roadclosures.json` file containing the fully processed and enriched dataset.

**Data Retrieval, Storage, and Integration**
- The ETL pipeline reprocesses historic road closure data using the KYTC API, ensuring all records have the most up-to-date roadway attributes
- The pipeline can be automated (e.g., with GitHub Actions) to keep the dashboard data current

**AI Use:  etl_data.js**
- The 'etl_data.js' script reqired the use of GitHub CoPilot.  I started development by using the default autocomplete feature(s) of VS Code but was forced to use AI quite a bit to troubleshoot API errors.  I started by trying to feed the entire 10k records to the API but it kept locking up.  I spoke with the API developer but they didn't know Javascript and couldn't help me.  I was told that the API should be able to handle a batch of 10k records but it never worked.  So I needed Copilot Agentic mode to get through the 'etl_data.js' script.  I have not found another way to develop the 'etl_data.js' script.  Even after it was developed, I asked different AI bots to optomize the code and they all failed.  Each one makes modifications that throw more errors.  Once I got it working, I wasn't going to change it.
- I used GitHub Copilot again to help with the documentation of 'etl_data.js'.  Since ETLs aren't something that people modify often, I will need as much documentation as possible for making updates when/if the API changes.  I first documented the script and then I prompted GitHub Copilot to add comments so that others can better understand the ETL process and use this script as a learning tool.

# Under Development

The following items are still being improved or are planned for future releases:

**Frontend Development**
- Continue to enhance dashboard UI/UX and interactivity
- Add more advanced filtering
- All dashboard pages support dynamic dropdown filters (District, County, Route Type, Year, etc.) populated from the data
- Filters update charts and map in real time
