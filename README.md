# Project Outline: Interactive Business Intelligence Report for Road Closures

## Introduction

**Goal:**  Develop a responsive web application that visualizes historic road closure data sourced from the Kentucky Department of Highways.  This will be accomplished by pulling road closure data hosted on GitHub, enhance the roadway attributes using a Kentucky Transportation Cabinet spatial API, and then produce an interactive, responsive, website that provides business intelligence capabilities.

**Tools and Technologies:** 
- [Node.js](https://nodejs.org/en)
- [GitHub API](https://docs.github.com/en/rest/using-the-rest-api)
- [Geospatial API provided by KYTC](https://kytc-api-v100-lts-qrntk7e3ra-uc.a.run.app/docs)
- [HTML](https://developer.mozilla.org/en-US/docs/Web/HTML) / [CSS](https://developer.mozilla.org/en-US/docs/Web/CSS) / [Javascript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [Apache eCharts](https://echarts.apache.org/en/index.html) or [Plotly Javascript Library](https://plotly.com/javascript/)
- Based on data from [chrislambert-ky/analysis-ky-roadclosure](https://github.com/chrislambert-ky/analysis-ky-roadclosures)

**Objective:**
  - Reprocess historic road closure data with the latest roadway attributes.
  - Implement a user-friendly, interactive dashboard for business intelligence.
  - Enable dynamic filtering and exploration of closure data by district and year.

### Responsive Design

---

**Implementation**
   * Employ CSS Grid and/or Flexbox for flexible, adaptive layouts.
   * Ensure all dashboard components (charts, dropdowns, maps) are responsive.

### Feature Implementation

**Core Features**
   * Store and manage road closure data using arrays, objects, or appropriate data structures.
   * Visualize data with interactive charts (e.g., closures per district, closures per year, top 10 counties, and a map view).
   * Integrate dropdown filters for district and year selection to update visualizations dynamically.

**Data Integration**
   * Use your existing Python project to fetch and preprocess road closure data.
   * Serve the processed data to the frontend via an API endpoint.

### Data Handling and Analysis

---

**Data Storage and Retrieval**
   * Store closure data in structured formats (JSON, arrays, or objects).
   * Implement efficient data retrieval and update mechanisms for filtering and visualization.

**Data Visualization**
   * Use Apache ECharts to create interactive visualizations:
     * Number of closures per district
     * Number of closures per year
     * Top 10 counties with closures
     * (Optional) Map visualization of closure locations

### Advanced Features (Optional)

---

**User Interaction**
   * Add forms or controls for custom filtering (e.g., by date range or county).

**Data Export/Sharing**
   * Allow users to export filtered data or charts as images or CSV files.

### Project Development

---

**Backend Integration**
   * Implement API to reprocess location information using KYTC Geo API.

**Frontend Development**
   * Build the dashboard interface using modern JavaScript and ECharts.
   * Ensure seamless communication between frontend and backend.

### Review Process

---

**Internal Testing**
   * Test all dashboard features for accuracy, responsiveness, and usability.
   * Validate data filtering and visualization updates.

**External Feedback**
   * Gather feedback from users or stakeholders and iterate on the design and features.

### Documentation and Final Submission

---

**Code Documentation**
   * Comment code for clarity and maintainability.
   * Prepare a comprehensive README.md with:
     * Project overview and objectives
     * Setup and installation instructions
     * Usage guidelines and feature descriptions
     * Data source and API integration details

**Final Submission**
   * Ensure the dashboard is fully functional, well-documented, and ready for presentation or deployment.
