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

**Requirements:**
- Node.js v18 or newer is recommended
- Internet connection is required to fetch source data and call the KYTC API

**Data Retrieval, Storage, and Integration**
- The ETL pipeline reprocesses historic road closure data using the KYTC API, ensuring all records have the most up-to-date roadway attributes
- The pipeline can be automated (e.g., with GitHub Actions) to keep the dashboard data current


# Under Development

The following items are still being improved or are planned for future releases:

**Frontend Development**
- Continue to enhance dashboard UI/UX and interactivity
- Add more advanced filtering
- All dashboard pages support dynamic dropdown filters (District, County, Route Type, Year, etc.) populated from the data
- Filters update charts and map in real time

**Testing & Feedback**
- Gather and incorporate user feedback

**Documentation**
- Continue to update and expand documentation as features are added