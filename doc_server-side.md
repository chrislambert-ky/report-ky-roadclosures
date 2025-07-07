# Server-side Docs:  Interactive Report for Road Closures
Since the historic data continues to grow, we will process the data as a separate and unique process prior to visualization.  We will accomplish this by pulling data from the source, parsing through it, and then reprocessing the data to include the required fields for our reports.

1. Pull historic data from the source using [GitHub API](https://docs.github.com/en/rest/using-the-rest-api):
- [Hosted CSV Data Source](https://raw.githubusercontent.com/chrislambert-ky/analysis-ky-roadclosures/refs/heads/main/data-reportready/kytc-closures-2021-2025-report_dataset.csv)

2. Parse through the data and keep only the fields that cannot be updated/reprocessed:
    - latitude
    - longitude
    - Comments
    - Reported_On
    - End_Date
    - Duration_Hours

3. Reprocess data using [KYTC API](https://kytc-api-v100-lts-qrntk7e3ra-uc.a.run.app/docs)<br>
(Since roadway information changes over time, this API allows developers to pass GPS coordinates and receive updated roadway attributes).

- KYTC API information
    - No registration or key is required.
    - https://kytc-api-v100-lts-qrntk7e3ra-uc.a.run.app/openapi.json
    - https://kytc-api-v100-lts-qrntk7e3ra-uc.a.run.app/api/

- The following files can be used as examples:
    - docs_js/kytc_route_api_keys.csv
    - docs_js/kytc_route_api_py_async.py
    - docs_js/kytc_route_api_py_sync.py

