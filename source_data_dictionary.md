# Data Dictionary

- The following files have been included to help explore and explain the data:
    - docs_js/github_csv_source_schema.json
    - docs_js/github_csv_source_schema.csv
    - docs_js/github_csv_local_copy_kytc-closures-2021-2025-report_dataset.csv

# Source Data Dictionary

| Field Name       | Data Type | Description                                                                                       | Examples                   |
|------------------|-----------|---------------------------------------------------------------------------------------------------|----------------------------|
| District         | Integer   | KYTC divides the state into 12 geographic regions. Those areas start with District 1 in the far West and end with District 12 in the far East. | 1, 2, 3, etc.              |
| County           | Object    | The name of the county where the event occurred. County names are all proper case.                | Fayette, Frankfort, Jefferson, etc. |
| Route            | Object    | The route name associated with the incident.                                                     | KY-80, US-60, I-69        |
| Road_Name        | Object    | The name of the road associated with the transportation records.                                  | DONALDSON CREEK RD, BRIDGE ST, I-69, I-69 NC |
| Begin_MP         | Float     | The milepost where the event or condition begins on the road.                                     | 0.5, 10.2, 50.0, etc.    |
| End_MP           | Float     | The milepost where the event or condition ends on the road.                                       | 0.5, 10.2, 50.0, etc.    |
| Comments         | Object    | Additional comments or information related to the transportation event.                           | This road is closed due to construction. |
| Reported_On      | Datetime  | The date and time when the transportation event was reported. All reports are in Eastern Standard Time. | 2022-01-01 08:00:00, 2022-02-15 14:30:00, etc. |
| End_Date         | Datetime  | The date and time when the transportation event concluded or was resolved. All reports are in Eastern Standard Time. | 2022-01-02 12:00:00, 2022-02-16 10:45:00, etc. |
| latitude         | Float     | The latitude coordinate associated with the location of the transportation event.                | 37.1234, 38.5678, etc.    |
| longitude        | Float     | The longitude coordinate associated with the location of the transportation event.               | -84.5678, -85.1234, etc.  |
| Duration_Default | Timedelta | The default duration of the transportation event. This duration value is the default output of Pandas when calculating the difference between two datetimes. | 1 day 2 hours 30 minutes, 3 hours 45 minutes, etc. |
| Duration_Hours   | Float     | The duration of the transportation event in hours. This duration is used for reporting.           | 2.5, 1.75, 0.5, etc.      |

