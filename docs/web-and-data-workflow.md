# Website and data workflow

This guide is for contributors working on the hosted report or refreshing its published data. The website itself is static HTML, CSS, and JavaScript; the Node.js ETL is a separate data-preparation step, not a web server.

## Preview the website

From the repository root, run a lightweight local server:

```bash
python -m http.server 8000
```

Open <http://localhost:8000/>. The repository includes the generated JSON used by the site, so previewing HTML, CSS, and browser JavaScript changes does not require running either ETL.

The site is currently published from the repository root. Its pages use relative links to the root `html/`, `css/`, `js/`, `images/`, and `data/` paths; keep those paths aligned if the layout or Pages publishing configuration changes.

## Use the Analysis Dashboard

Open the [Analysis Dashboard](../html/analysis_dashboard.html) to view closure counts or total duration (hours) by year, month, district, and county. The right-side controls provide the measure selector, Year/Month/District/County filters, and chart options for bar labels, district/county ordering, and the number of counties shown.

The geography controls are linked: selecting a district limits the county filter and county chart to that district. Selecting a county automatically selects its district. Selecting a bar in a chart also filters the other charts. The previous [Count](../html/analysis_by_count.html) and [Duration](../html/analysis_by_duration.html) URLs remain available as redirects and open the combined dashboard with the matching measure selected.

## Refresh the published data

The complete refresh requires Python 3.11 or newer, Node.js 20 or newer, and internet access to the source files and KYTC Spatial API. From the repository root:

```bash
python -m pip install -r python/requirements.txt
npm ci
npm run update-data
```

The command runs [`python/etl_pipeline.py`](../python/etl_pipeline.py) first, producing the downloadable report-ready files in [`../data-reportready/`](../data-reportready), then runs [`etl_data.js`](../etl_data.js) to write the enriched website JSON to [`../data/data_v4_final_roadclosures.json`](../data/data_v4_final_roadclosures.json).

The scheduled [GitHub Actions workflow](../.github/workflows/etl_update.yml) runs these same two ETL stages and commits updated datasets. The Node ETL depends on the Python CSV output, so run the stages in that order.

## Tests

Run the Python and JavaScript suites from the repository root:

```bash
python -m unittest discover -s python/tests
npm test
```
