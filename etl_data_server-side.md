# Server-side (Node.js) ETL Documentation: Interactive Road Closures Report

This document describes the Node.js server-side ETL (Extract, Transform, Load) pipeline that prepares historic Kentucky road closure data for use in dashboards and reporting. The ETL is implemented in [`etl_data.js`](etl_data.js).

---

## Overview

As the historic data set grows, a dedicated ETL pipeline is used to fetch, parse, filter, enrich, and persist the data before it is visualized. This approach ensures:
- Data is up-to-date with the latest roadway attributes
- Processing is efficient and can be resumed if interrupted
- The workflow is transparent and well-documented for learning and auditing

---

## ETL Pipeline Steps (as implemented in `etl_data.js`)

### 1. **Extract**
- Downloads the latest historic road closure data from a [hosted CSV source](https://raw.githubusercontent.com/chrislambert-ky/analysis-ky-roadclosures/refs/heads/main/data-reportready/kytc-closures-2021-2025-report_dataset.csv) using `node-fetch`.

### 2. **Transform**
- Parses the CSV using `csv-parse/sync`.
- Retains only the fields that cannot be reprocessed or updated by the enrichment API:
  - `latitude`, `longitude`, `Comments`, `Reported_On`, `End_Date`, `Duration_Hours`

### 3. **Enrich**
- For each record, calls the [KYTC Route API](https://kytc-api-v100-lts-qrntk7e3ra-uc.a.run.app/docs) to obtain updated roadway attributes (District, County, Milepoint, Road Name, Route, etc.) using latitude and longitude.
- Enrichment is performed in batches (default batch size: **100** as set in the script) to avoid overloading the API and to allow for progress tracking and partial saves.
- Handles API errors gracefully, logging any issues in the output data for transparency.

### 4. **Load**
- Writes the enriched data to `./data/data_v4_final_roadclosures.json`, overwriting any previous output.
- Saves progress after each batch, so partial results are not lost if the process is interrupted.

### 5. **Logging & Error Handling**
- The script logs progress and errors to the console for real-time monitoring.
- Each row in the output includes any API errors encountered (e.g., missing coordinates, failed requests).
- (Planned/Optional) ETL run logs can be written to a log file for reproducibility and auditing (see comments in the script for details).

---

## Additional Implementation Details

- **Batch Processing:**
  - The batch size is set to 100 records per API call group to avoid API timeouts and rate limits.
  - After each batch, the output file is updated, so progress is not lost.
- **Error Handling:**
  - Rows missing coordinates are skipped and flagged with an error in the output.
  - API errors are caught and included in the output for review.
- **No API Key Required:**
  - The KYTC API is public and does not require registration or authentication.
- **Related Example Files:**
  - `docs_js/kytc_route_api_keys.csv` (example API keys, not required for this ETL)
  - `docs_js/kytc_route_api_py_async.py` and `docs_js/kytc_route_api_py_sync.py` (Python examples for the same API)
- **Not Official:**
  - This ETL is a personal/educational project and is not an official KYTC product.

---

**For full implementation details, see [`etl_data.js`](etl_data.js).**

