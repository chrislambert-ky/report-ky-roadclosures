# Python workflows

This guide is for people who want to run the Python ETL or explore the analysis notebook. You do not need Node.js for these workflows.

## Set up

Use Python 3.11 or newer from the repository root:

```bash
python -m venv .venv
```

Activate the virtual environment, then install the Python dependencies:

```powershell
# Windows PowerShell
.\.venv\Scripts\Activate.ps1
```

```bash
# macOS or Linux
source .venv/bin/activate
```

```bash
python -m pip install -r python/requirements.txt
```

The requirements include the ETL and notebook/visualization dependencies.

## Build the report-ready dataset

```bash
python python/etl_pipeline.py
```

The pipeline downloads the annual source CSV files, cleans and combines them, and writes CSV, Excel, and Parquet outputs to [`../data-reportready/`](../data-reportready). Internet access is required.

Run the Python tests from the repository root:

```bash
python -m unittest discover -s python/tests
```

## Explore the notebook

Open [`road_closure_analysis.ipynb`](./road_closure_analysis.ipynb) in a Jupyter-enabled editor after building the report-ready dataset. The notebook has separate count and duration sections, plus county and point maps. It is a Python companion to—not the implementation of—the hosted [Analysis Dashboard](../html/analysis_dashboard.html), which combines both measures and links county selections to their KYTC district.

Field definitions and timestamp handling are documented in [`data_dictionary.md`](./data_dictionary.md).

The original Python project, with its raw/clean archives and Power BI materials, remains available at [analysis-ky-roadclosures](https://github.com/chrislambert-ky/analysis-ky-roadclosures).

To regenerate the website's enriched JSON as well, use the [web and data workflow guide](../docs/web-and-data-workflow.md); that combined path also requires Node.js.
