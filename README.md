# Project Outline: Interactive Report for Road Closures
This document started as a project outline but I'm updating the document as a I complete work on the project.

## Introduction

**Goal:**  Develop a responsive web application that visualizes historic road closure data sourced from the Kentucky Transportation Cabinet.  This will be accomplished by pulling road closure data hosted on GitHub, enhance the roadway attributes using a Kentucky Transportation Cabinet spatial API, and then produce an interactive, responsive, website that provides business intelligence capabilities.

**Objective:**
  - Retrieve historic road closure data. (complete)
  - Reprocess historic data with updated roadway attributes.
  - Develop user-friendly, interactive dashboard(s) to quantify closures.
  - Develop filtering for users to focus and explore closure data.

**Tools and Technologies:** 
- [Node.js](https://nodejs.org/en)
- [GitHub API](https://docs.github.com/en/rest/using-the-rest-api)
- [Geospatial API provided by KYTC](https://kytc-api-v100-lts-qrntk7e3ra-uc.a.run.app/docs)
- [HTML](https://developer.mozilla.org/en-US/docs/Web/HTML) / [CSS](https://developer.mozilla.org/en-US/docs/Web/CSS) / 
- [Javascript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [Apache eCharts](https://echarts.apache.org/en/index.html) and/or [Plotly Javascript Library](https://plotly.com/javascript/)

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

3. **Run Backend Data Scripts**
   - To fetch, process, and export road closure data, use:
     ```bash
     node csv_to_json.js
     ```
   - This will generate a `csv_based_data.json` file which contains the base data to be reprocessed in an upcoming step.

# Under Development
All of the following items are under development.

## Server-side 
   - Extend current script to include re-processing road closures with updated roadway attributes.

## Responsive Design

**Implementation**
   * Employ CSS Grid and/or Flexbox for flexible, adaptive layouts.
   * Ensure all dashboard components (charts, dropdowns, maps) are responsive.

## Feature Implementation

**Core Features**
   * Store and manage road closure data using arrays, objects, or appropriate data structures.
   * Visualize data with interactive charts (e.g., closures per district, closures per year, top 10 counties, and a map view).
   * Integrate dropdown filters for district and year selection to update visualizations dynamically.

**Data Integration**
   * Use your existing Python project to fetch and preprocess road closure data.
   * Serve the processed data to the frontend via an API endpoint.

## Data Handling and Analysis

**Data Storage and Retrieval**
   * Store closure data in structured formats (JSON, arrays, or objects).
   * Implement efficient data retrieval and update mechanisms for filtering and visualization.

**Data Visualization**
   * Use Apache ECharts to create interactive visualizations:
     * Number of closures per district
     * Number of closures per year
     * Top 10 counties with closures
     * (Optional) Map visualization of closure locations

## Advanced Features (Optional)

**User Interaction**
   * Add forms or controls for custom filtering (e.g., by date range or county).

**Data Export/Sharing**
   * Allow users to export filtered data or charts as images or CSV files.

## Project Development

**Backend Integration**
   * Implement API to reprocess location information using KYTC Geo API.

**Frontend Development**
   * Build the dashboard interface using modern JavaScript and ECharts.
   * Ensure seamless communication between frontend and backend.

## Review Process

**Internal Testing**
   * Test all dashboard features for accuracy, responsiveness, and usability.
   * Validate data filtering and visualization updates.

**External Feedback**
   * Gather feedback from users or stakeholders and iterate on the design and features.

## Documentation and Final Submission

**Code Documentation**
   * Comment code for clarity and maintainability.
   * Prepare a comprehensive README.md with:
     * Project overview and objectives
     * Setup and installation instructions
     * Usage guidelines and feature descriptions
     * Data source and API integration details

**Final Submission**
   * Ensure the dashboard is fully functional, well-documented, and ready for presentation or deployment.
