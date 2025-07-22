# Server-side Docs: Interactive Report for Road Closures

Since the historic data continues to grow, we process the data as a separate and unique ETL pipeline prior to visualization. This pipeline fetches, parses, filters, enriches, and logs the data to support downstream dashboards and reporting.

## ETL Pipeline Steps (as implemented in `etl_data.js`)

1. **Extract:**
   - Pull historic data from the source using the [hosted CSV data source](https://raw.githubusercontent.com/chrislambert-ky/analysis-ky-roadclosures/refs/heads/main/data-reportready/kytc-closures-2021-2025-report_dataset.csv).
   - The script uses `node-fetch` to download the CSV file.

2. **Transform:**
   - Parse the CSV and keep only the fields that cannot be updated/reprocessed:
     - `latitude`
     - `longitude`
     - `Comments`
     - `Reported_On`
     - `End_Date`
     - `Duration_Hours`
   - The script uses `csv-parse/sync` for parsing and mapping fields.

3. **Enrich:**
   - For each record, call the [KYTC API](https://kytc-api-v100-lts-qrntk7e3ra-uc.a.run.app/docs) to get updated roadway attributes (e.g., District, County, Milepoint, Road Name, Route, etc.) using latitude and longitude.
   - The enrichment is performed in batches (default batch size: 500) to avoid overloading the API and to track progress.
   - The script handles API errors and logs them in the output.

4. **Load:**
   - Write the enriched data to `./data/data_v4_final_roadclosures.json` (overwriting any previous output).
   - The script saves progress after each batch, so partial results are not lost if interrupted.

5. **Logging:**
   - Each ETL run is logged to `./log_etl/etl_run_log.csv` with start/end time, record count, elapsed time, and output file for reproducibility and auditing.
   - The log directory is created if it does not exist.

## Additional Notes

- The script is designed for learning and reproducibility, with extensive comments and error handling.
- The KYTC API does not require registration or an API key.
- Example files for API usage:
    - `docs_js/kytc_route_api_keys.csv`
    - `docs_js/kytc_route_api_py_async.py`
    - `docs_js/kytc_route_api_py_sync.py`
- The ETL script is intended for personal/educational use and is not an official KYTC project.

---

**For more details, see the code in `etl_data.js`.**

