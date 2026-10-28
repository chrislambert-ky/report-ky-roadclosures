from __future__ import annotations

import argparse
import logging
import os
import re
from datetime import datetime
from io import BytesIO
from pathlib import Path
from typing import Iterable
from urllib.parse import parse_qs, urlparse
from urllib.request import urlopen

import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIRECTORY = PROJECT_ROOT / "data-reportready"
SOURCE_URL = (
    "https://storage.googleapis.com/kytc-its-2020-openrecords/toc/"
    "KYTC-TOC-Weather-Closures-Historic-{year}.csv"
)
SOURCE_COLUMNS = {
    "District",
    "County",
    "Route",
    "Road_Name",
    "Begin_MP",
    "End_MP",
    "Comments",
    "Reported_On",
    "End_Date",
}
REPORT_COLUMNS = [
    "District",
    "County",
    "Route",
    "Road_Name",
    "Begin_MP",
    "End_MP",
    "Comments",
    "Reported_On",
    "End_Date",
    "latitude",
    "longitude",
    "Duration_Default",
    "Duration_Hours",
]
DEDUPLICATION_COLUMNS = ["latitude", "longitude", "Comments", "Reported_On"]
COORDINATE_PATTERN = re.compile(r"^\s*([-+]?(?:\d+(?:\.\d*)?|\.\d+))")

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s: %(message)s")


def _leading_float(value: str | None) -> float | None:
    if value is None:
        return None
    match = COORDINATE_PATTERN.match(value)
    return float(match.group(1)) if match else None


def extract_coordinates(route_link: object) -> tuple[float, float]:
    if not isinstance(route_link, str) or not route_link.strip():
        return float("nan"), float("nan")

    query = parse_qs(urlparse(route_link).query)
    if "lat" in query and "lng" in query:
        latitude = _leading_float(query["lat"][0])
        longitude = _leading_float(query["lng"][0])
    elif "center" in query:
        center = query["center"][0].split(",")
        if len(center) != 2:
            return float("nan"), float("nan")
        longitude = _leading_float(center[0])
        latitude = _leading_float(center[1])
    else:
        return float("nan"), float("nan")

    if latitude is None or longitude is None:
        return float("nan"), float("nan")
    if not -90 <= latitude <= 90 or not -180 <= longitude <= 180:
        return float("nan"), float("nan")
    return latitude, longitude


def normalize_timestamp(value: object) -> pd.Timestamp:
    timestamp = pd.to_datetime(value, errors="coerce")
    if pd.isna(timestamp):
        return pd.NaT
    if timestamp.tzinfo is not None:
        return timestamp.tz_convert("America/New_York").tz_localize(None)
    return timestamp


def clean_source_dataframe(source: pd.DataFrame) -> pd.DataFrame:
    missing_columns = SOURCE_COLUMNS.difference(source.columns)
    if missing_columns:
        raise ValueError(
            "Source CSV is missing required columns: "
            + ", ".join(sorted(missing_columns))
        )

    dataframe = source.copy()
    if "Route_Link" in dataframe.columns:
        coordinates = dataframe["Route_Link"].map(extract_coordinates)
        coordinate_frame = pd.DataFrame(
            coordinates.tolist(), index=dataframe.index, columns=["latitude", "longitude"]
        )
        dataframe[["latitude", "longitude"]] = coordinate_frame
    elif not {"latitude", "longitude"}.issubset(dataframe.columns):
        raise ValueError("Source CSV must include Route_Link or latitude and longitude.")

    dataframe["latitude"] = pd.to_numeric(dataframe["latitude"], errors="coerce")
    dataframe["longitude"] = pd.to_numeric(dataframe["longitude"], errors="coerce")
    dataframe["District"] = pd.to_numeric(dataframe["District"], errors="coerce").astype(
        "Int64"
    )
    dataframe["Begin_MP"] = pd.to_numeric(dataframe["Begin_MP"], errors="coerce")
    dataframe["End_MP"] = pd.to_numeric(dataframe["End_MP"], errors="coerce")
    dataframe["Reported_On"] = dataframe["Reported_On"].map(normalize_timestamp)
    dataframe["End_Date"] = dataframe["End_Date"].map(normalize_timestamp)
    dataframe["Comments"] = (
        dataframe["Comments"]
        .fillna("")
        .astype(str)
        .str.replace(r"[\r\n]+", " ", regex=True)
        .str.strip()
    )
    dataframe["Duration_Default"] = dataframe["End_Date"] - dataframe["Reported_On"]
    dataframe["Duration_Hours"] = (
        dataframe["Duration_Default"].dt.total_seconds().div(3600).round(4)
    )

    valid_rows = (
        dataframe["Reported_On"].notna()
        & dataframe["End_Date"].notna()
        & dataframe["latitude"].notna()
        & dataframe["longitude"].notna()
        & dataframe["Duration_Hours"].gt(0)
        & dataframe["Reported_On"].ge(pd.Timestamp("2021-01-01"))
    )
    invalid_count = int((~valid_rows).sum())
    if invalid_count:
        logging.warning("Dropped %s rows with invalid dates, coordinates, or duration.", invalid_count)

    return dataframe.loc[valid_rows, REPORT_COLUMNS].copy()


def deduplicate_events(dataframe: pd.DataFrame) -> pd.DataFrame:
    return (
        dataframe.sort_values("End_Date", ascending=False, kind="stable")
        .drop_duplicates(subset=DEDUPLICATION_COLUMNS, keep="first")
        .reset_index(drop=True)
    )


def build_report_dataset(source_frames: Iterable[pd.DataFrame]) -> pd.DataFrame:
    cleaned_frames = [clean_source_dataframe(frame) for frame in source_frames]
    if not cleaned_frames:
        raise ValueError("No yearly source datasets were provided.")

    dataframe = deduplicate_events(pd.concat(cleaned_frames, ignore_index=True))
    if dataframe.empty:
        raise ValueError("The source datasets contain no valid road-closure records.")
    return dataframe[REPORT_COLUMNS]


def read_year(year: int, source_directory: Path | None = None) -> pd.DataFrame:
    filename = f"KYTC-TOC-Weather-Closures-Historic-{year}.csv"
    if source_directory is not None:
        source_path = source_directory / filename
        if not source_path.is_file():
            raise FileNotFoundError(f"Missing local source CSV: {source_path}")
        source = pd.read_csv(source_path, dtype=str)
    else:
        url = SOURCE_URL.format(year=year)
        logging.info("Downloading source data for %s from %s", year, url)
        try:
            with urlopen(url, timeout=60) as response:
                content = response.read()
        except OSError as error:
            raise RuntimeError(f"Could not download the {year} source CSV from {url}") from error
        try:
            source = pd.read_csv(BytesIO(content), dtype=str)
        except (pd.errors.EmptyDataError, pd.errors.ParserError, UnicodeDecodeError) as error:
            raise ValueError(f"The {year} source URL did not return a valid CSV.") from error

    if source.empty:
        raise ValueError(f"The {year} source CSV contains no records.")
    return source


def write_report_outputs(dataframe: pd.DataFrame, output_directory: Path) -> None:
    if dataframe.empty:
        raise ValueError("Refusing to export an empty report dataset.")

    output_directory.mkdir(parents=True, exist_ok=True)
    outputs = [
        (output_directory / "kytc-closures-report_dataset.csv", "csv"),
        (output_directory / "kytc-closures-report_dataset.xlsx", "excel"),
        (output_directory / "kytc-closures-report_dataset.parquet", "parquet"),
    ]
    staged_outputs = [
        (path.with_name(f".{path.stem}.tmp{path.suffix}"), path, format_name)
        for path, format_name in outputs
    ]

    try:
        for temporary_path, _, format_name in staged_outputs:
            if format_name == "csv":
                dataframe.to_csv(temporary_path, index=False)
            elif format_name == "excel":
                dataframe.to_excel(temporary_path, index=False)
            else:
                dataframe.to_parquet(temporary_path, index=False)

        for temporary_path, final_path, _ in staged_outputs:
            os.replace(temporary_path, final_path)
    finally:
        for temporary_path, _, _ in staged_outputs:
            if temporary_path.exists():
                temporary_path.unlink()


def run_pipeline(source_directory: Path | None = None, start_year: int = 2021) -> pd.DataFrame:
    current_year = datetime.now().year
    if start_year < 2021 or start_year > current_year:
        raise ValueError(f"Start year must be between 2021 and {current_year}.")

    source_frames = [
        read_year(year, source_directory)
        for year in range(start_year, current_year + 1)
    ]
    dataframe = build_report_dataset(source_frames)
    write_report_outputs(dataframe, OUTPUT_DIRECTORY)
    years = sorted(dataframe["Reported_On"].dt.year.unique().tolist())
    logging.info(
        "Exported %s records across report years %s to %s.",
        len(dataframe),
        ", ".join(map(str, years)),
        OUTPUT_DIRECTORY,
    )
    return dataframe


def main() -> None:
    parser = argparse.ArgumentParser(description="Build the KYTC road-closure report dataset.")
    parser.add_argument(
        "--source-dir",
        type=Path,
        help="Read annual source CSVs from this directory instead of downloading them.",
    )
    parser.add_argument("--start-year", type=int, default=2021)
    arguments = parser.parse_args()
    run_pipeline(arguments.source_dir, arguments.start_year)


if __name__ == "__main__":
    main()
