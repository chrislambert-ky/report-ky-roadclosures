# Server-side Docs:  Interactive Business Intelligence Report for Road Closures

1. Pull historic data from the source by perform a fetch using the GitHub API:
- [Hosted CSV Data Source](https://raw.githubusercontent.com/chrislambert-ky/analysis-ky-roadclosures/refs/heads/main/data-reportready/kytc-closures-2021-2025-report_dataset.csv)

2. Parse through the data and keep only the fields that cannot be updated/reprocessed:
    - latitude
    - longitude
    - Comments
    - Reported_On
    - End_Date
    - Duration_Hours

3. Reprocess data and add updated attributes.  Since roadway information changes over time, this API allows people to pass GPS coordinates to the API and return the most recent roadway attributes.  This will update the roadway attributes listed in the CSV Source Data Dictionary.  The API was developed for Python but we will use the examples as a guide 

- API information
    - https://kytc-api-v100-lts-qrntk7e3ra-uc.a.run.app/openapi.json
    - https://kytc-api-v100-lts-qrntk7e3ra-uc.a.run.app/api/
    - No registration or key is required.

- The following files can be used as examples:
    - docs_js/kytc_api_async_example.py
    - docs_js/kytc_api_sync_example.py
    - docs_js/kytc_route_api_keys.csv
