# Project Outline: Interactive Report for Road Closures
This document started as a project outline but I'm updating the document as a I complete work on the project.

## Introduction

**Goal:**  Develop a responsive web application that visualizes historic road closure data sourced from the Kentucky Transportation Cabinet.  This will be accomplished by pulling road closure data hosted on GitHub, enhance the roadway attributes using a Kentucky Transportation Cabinet spatial API, and then produce an interactive, responsive, website that provides business intelligence capabilities.

**Objective:**
  - Retrieve historic road closure data. 
  - Reprocess historic data with updated roadway attributes.
  - Develop user-friendly, interactive dashboard(s) to quantify closures.
  - Develop filtering for users to focus and explore closure data.

**Tools and Technologies:** 
- [Node.js](https://nodejs.org/en)
- [GitHub API](https://docs.github.com/en/rest/using-the-rest-api)
- [Geospatial API provided by KYTC](https://kytc-api-v100-lts-qrntk7e3ra-uc.a.run.app/docs)
- [HTML](https://developer.mozilla.org/en-US/docs/Web/HTML) / [CSS](https://developer.mozilla.org/en-US/docs/Web/CSS) / [Javascript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [Apache eCharts](https://echarts.apache.org/en/index.html) and/or [Plotly Javascript Library](https://plotly.com/javascript/)
- [Leaflet](https://leafletjs.com/)

### Core Features:

   **Back-End / server-side processes:**
   - **(complete)** Fetch historic CSV formatted data using **GitHub API**
   - **(complete)** Parse CSV and store the dataset as JSON.
   - **(complete)** Filter dataset for unique values:
      - Latitude
      - Longitude
      - Comment
      - Reported On
      - Duration
   - **(complete)** Reprocess filtered dataset using **KYTC API** and add the following updated attributes:
      - District
      - County
      - Route
      - Road Name
      - Mile Point

   **Web Design: Interactive Dashboards:**
   - Develop site for responsive design.
   - Utilize standard CSS throughout development.
   - Visualize data with Apache ECHARTS
      - By Count Page:
         - Provide dynamic filter for District
         - Provide dynamic filter for Year
         - Count of Closures per District
         - Count of Closures per Year
         - Count of Closures per County
         - Count of Closures per Route
      - By Duration Page:
         - Provide dynamic filter for District
         - Provide dynamic filter for Year
         - Total Duration of Closures (hours) per District
         - Total Duration of Closures (hours) per Year
         - Total Duration of Closures (hours) per County
         - Total Duration of Closures (hours) per Route
      - **(Optional)** Map of Closures

**Getting Started**

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
- Node.js v18 or newer is recommended.
- Internet connection is required to fetch source data and call the KYTC API.

**Data Retrieval, Storage, and Integration**
   - Add reprocessing to the ETL pipeline process by leveraging the KYTC API.  This allows people to analyze historic road closure data using the most recent road names and mile points.
   - Automate and schedule the data pipeline using GitHub Actions so the report is always displaying current data.  This is redundant if the user runs clones the repo and runs the bash command but it will be needed for the hosted version.

# Under Development
All of the following items are still under development.

**Implementation**
   - Employ CSS Grid and/or Flexbox for flexible, adaptive layouts.
   - Utilize Apache eCharts for visualizations.
   - Ensure all dashboard components (charts, dropdowns, maps) are responsive.

**Data Visualization**
   - Use Apache ECharts to create interactive visualizations:
     - Number of closures per district
     - Number of closures per year
     - Top 10 counties with closures
     - (Optional) Map visualization of closure locations

## Advanced Features (Optional)

**User Interaction**
   - Add forms or controls for custom filtering (e.g., by date range or county).

**Data Export/Sharing**
   - Allow users to export filtered data or charts as images or CSV files.

**Backend Integration**
   - Implement API to reprocess location information using KYTC Geo API.

**Frontend Development**
   - Build the dashboard interface using modern JavaScript and ECharts.
   - Ensure seamless communication between frontend and backend.

**Internal Testing**
   - Test all dashboard features for accuracy, responsiveness, and usability.
   - Validate data filtering and visualization updates.

**External Feedback**
   - Gather feedback from users or stakeholders and iterate on the design and features.

**Code Documentation**
   - Comment code for clarity and maintainability.
   - Prepare a comprehensive README.md with:
     - Project overview and objectives
     - Setup and installation instructions
     - Usage guidelines and feature descriptions
     - Data source and API integration details

**Final Submission**
   - Ensure the dashboard is fully functional, well-documented, and ready for presentation or deployment.
