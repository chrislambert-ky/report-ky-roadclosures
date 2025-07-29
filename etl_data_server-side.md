# Server-side (Node.js) ETL Documentation: Interactive Road Closures Report

This document describes the Node.js server-side ETL (Extract, Transform, Load) pipeline that prepares historic Kentucky road closure data for use in dashboards and reporting. The ETL is implemented in [`etl_data.js`](etl_data.js).

---

## Overview

As the historic data set grows, a dedicated ETL pipeline is used to fetch, parse, filter, enrich, and persist the data before it is visualized. This approach ensures:
- Data is up-to-date with the latest roadway attributes
- Processing is efficient and can be resumed if interrupted

---

## ETL Pipeline Steps

### 1. **Extract**
- Downloads the latest historic road closure data from a [hosted CSV source](https://raw.githubusercontent.com/chrislambert-ky/analysis-ky-roadclosures/refs/heads/main/data-reportready/kytc-closures-2021-2025-report_dataset.csv) using `node-fetch`.

### 2. **Transform**
- Parses the CSV using `csv-parse/sync`.
- Retain only the fields that cannot be reprocessed or updated by the enrichment API.

### 3. **Enrich**
- For each record, calls the [KYTC Route API](https://kytc-api-v100-lts-qrntk7e3ra-uc.a.run.app/docs) to obtain updated roadway attributes (District, County, Route, Road Name, Milepoint, etc.) using the latitude and longitude from the source data.
- Source attributes and new attributes are joined to create a full dataset with the most recent roadway values.

### 4. **Store**
- Writes the enriched data to `./data/data_v4_final_roadclosures.json`, overwriting any previous output.
- Saves progress after each batch, so partial results are not lost if the process is interrupted.

---

## Additional Implementation Details

- **Batch Processing:**
  - Future versions will perform batch processing of records against the API.
  - The batch size is set to 200 records per API call group to avoid API timeouts and rate limits.

- **No API Key Required:**
  - The KYTC API is public and does not require registration or authentication.

- **Related Example Files:**
  - `docs_js/kytc_route_api_keys.csv` (example API keys)
  - `docs_js/kytc_route_api_py_async.py` and `docs_js/kytc_route_api_py_sync.py` (Python examples for the same API)

- **Not Official:**
  - This ETL is a personal/educational project and is not an official KYTC product.

---

**For full implementation details, see [`etl_data.js`](etl_data.js).**

