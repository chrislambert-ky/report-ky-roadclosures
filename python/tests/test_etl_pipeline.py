import tempfile
import unittest
from pathlib import Path

import pandas as pd

from python.etl_pipeline import (
    build_report_dataset,
    clean_source_dataframe,
    extract_coordinates,
    write_report_outputs,
)


def source_row(reported_on, end_date, route_link, comments="Flooding"):
    return {
        "District": "1",
        "County": "Ballard",
        "Route": "KY-123",
        "Road_Name": "KY-123",
        "Begin_MP": "1.0",
        "End_MP": "2.0",
        "Comments": comments,
        "Reported_On": reported_on,
        "End_Date": end_date,
        "Route_Link": route_link,
    }


class EtlPipelineTests(unittest.TestCase):
    def test_extracts_esri_and_goky_coordinates(self):
        esri = (
            "https://kytc.maps.arcgis.com/apps/webappviewer/index.html?"
            "zoom=14&center=-88.979133,37.005148"
        )
        goky = "https://goky.ky.gov/?lat=36.907913&lng=-88.917011&zoom=14KY-310"

        self.assertEqual(extract_coordinates(esri), (37.005148, -88.979133))
        self.assertEqual(extract_coordinates(goky), (36.907913, -88.917011))
        self.assertTrue(pd.isna(extract_coordinates("not-a-location")[0]))

    def test_normalizes_timezone_and_computes_positive_duration(self):
        source = pd.DataFrame(
            [
                source_row(
                    "2021-07-28 00:05:00",
                    "2021-07-28 04:14:01+00:00",
                    "https://kytc.maps.arcgis.com/?zoom=14&center=-88.979133,37.005148",
                ),
                source_row(
                    "2022-04-12 08:56:00",
                    "2022-04-12 10:04:00",
                    "https://goky.ky.gov/?lat=36.907913&lng=-88.917011&zoom=14",
                    "Flooding\r\nreported",
                ),
            ]
        )

        cleaned = clean_source_dataframe(source)

        self.assertEqual(len(cleaned), 2)
        self.assertAlmostEqual(cleaned.iloc[0]["Duration_Hours"], 0.1503)
        self.assertEqual(cleaned.iloc[0]["End_Date"], pd.Timestamp("2021-07-28 00:14:01"))
        self.assertEqual(cleaned.iloc[1]["Comments"], "Flooding reported")
        self.assertAlmostEqual(cleaned.iloc[1]["Duration_Hours"], 1.1333)

    def test_deduplicates_snapshots_keeping_latest_end_date(self):
        link = "https://goky.ky.gov/?lat=36.9&lng=-88.9&zoom=14"
        first = pd.DataFrame(
            [source_row("2022-04-12 08:56:00", "2022-04-12 10:04:00", link)]
        )
        later = pd.DataFrame(
            [source_row("2022-04-12 08:56:00", "2022-04-12 11:04:00", link)]
        )

        report = build_report_dataset([first, later])

        self.assertEqual(len(report), 1)
        self.assertEqual(report.iloc[0]["End_Date"], pd.Timestamp("2022-04-12 11:04:00"))

    def test_rejects_missing_source_columns(self):
        with self.assertRaisesRegex(ValueError, "missing required columns"):
            clean_source_dataframe(pd.DataFrame([{"District": "1"}]))

    def test_writes_all_required_report_formats(self):
        link = "https://goky.ky.gov/?lat=36.9&lng=-88.9&zoom=14"
        report = build_report_dataset(
            [pd.DataFrame([source_row("2022-04-12 08:56:00", "2022-04-12 10:04:00", link)])]
        )
        with tempfile.TemporaryDirectory() as temporary_directory:
            output_directory = Path(temporary_directory)
            write_report_outputs(report, output_directory)

            expected_files = [
                "kytc-closures-report_dataset.csv",
                "kytc-closures-report_dataset.xlsx",
                "kytc-closures-report_dataset.parquet",
            ]
            for filename in expected_files:
                self.assertGreater((output_directory / filename).stat().st_size, 0)
            self.assertEqual(len(pd.read_csv(output_directory / expected_files[0])), 1)
            self.assertEqual(len(pd.read_excel(output_directory / expected_files[1])), 1)
            self.assertEqual(len(pd.read_parquet(output_directory / expected_files[2])), 1)


if __name__ == "__main__":
    unittest.main()
