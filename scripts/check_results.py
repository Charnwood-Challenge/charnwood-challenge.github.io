#!/usr/bin/env python3
"""Check the results data files for mistakes before they're published.

Run from the repository root:

    python3 scripts/check_results.py

Checks every _data/results/<year>/<race>.csv file, and each results/<year>.md
page's list of races. Prints any problems and exits with status 1 if there are
any, so the GitHub Actions check fails on the pull request.
"""

import csv
import glob
import os
import re
import sys
from collections import defaultdict

COLUMNS = {"place", "bib", "time", "name", "gender", "club", "category"}
REQUIRED = {"place", "time"}
GENDERS = {"Male", "Female"}
NO_CLUB = {"0", "-", "n/a", "na", "none", "no club", "no clubs", "unattached"}
TIME = re.compile(r"^(?:(\d{1,2}):)?([0-5]?\d):([0-5]\d)$")

errors = 0


def error(path, line, message):
    global errors
    errors += 1
    # GitHub Actions shows this format as an annotation on the file
    print(f"::error file={path},line={line}::{message}")


def seconds(time):
    match = TIME.match(time)
    if not match:
        return None
    hours, minutes, secs = (int(part or 0) for part in match.groups())
    return hours * 3600 + minutes * 60 + secs


def race_keys():
    # _data/races.yml is a flat list of race keys, each followed by its settings
    with open("_data/races.yml", encoding="utf-8") as f:
        return {m.group(1) for m in re.finditer(r"^([a-z0-9-]+):", f.read(), re.M)}


def check_race(path, known_races, bibs, clubs):
    year, race = path.split(os.sep)[-2], os.path.splitext(os.path.basename(path))[0]
    if race not in known_races:
        error(path, 1, f"'{race}' isn't a race in _data/races.yml")

    with open(path, encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        columns = set(reader.fieldnames or [])
        for column in sorted(columns - COLUMNS):
            error(path, 1, f"Unknown column '{column}'. Columns can be: {', '.join(sorted(COLUMNS))}")
        for column in sorted(REQUIRED - columns):
            error(path, 1, f"Missing the '{column}' column")
        if REQUIRED - columns:
            return

        previous_place, previous_time = None, None
        for index, row in enumerate(reader, start=1):
            line = index + 1  # the header is line 1

            place = row["place"].strip()
            if not place.isdigit():
                error(path, line, f"Place '{place}' isn't a number")
            # Places count up by one, except tied finishers share a place (1, 1, 3)
            elif int(place) not in (index, previous_place):
                error(path, line, f"Place {place} is out of sequence (expected {index})")
            else:
                previous_place = int(place)

            time = seconds(row["time"].strip())
            if time is None:
                error(path, line, f"Time '{row['time']}' isn't in h:mm:ss or mm:ss format")
            elif previous_time is not None and time < previous_time:
                error(path, line, f"Time {row['time']} is faster than the finisher above")
            if time is not None:
                previous_time = time

            if "gender" in row and row["gender"] not in GENDERS:
                error(path, line, f"Gender '{row['gender']}' should be Male or Female")

            bib = (row.get("bib") or "").strip()
            if bib:
                bibs[year][bib].append((path, line, row.get("name") or ""))

            club = (row.get("club") or "").strip()
            if club.lower() in NO_CLUB:
                error(path, line, f"Club '{club}' should be left blank")
            elif club:
                clubs[club.lower()][club].append((path, line))

    return year, race


def main():
    known_races = race_keys()
    bibs = defaultdict(lambda: defaultdict(list))
    clubs = defaultdict(lambda: defaultdict(list))
    files = defaultdict(set)

    for path in sorted(glob.glob(os.path.join("_data", "results", "*", "*.csv"))):
        found = check_race(path, known_races, bibs, clubs)
        if found:
            files[found[0]].add(found[1])

    for year, by_bib in bibs.items():
        for bib, uses in by_bib.items():
            for path, line, name in uses[1:]:
                first_path, first_line, _ = uses[0]
                error(path, line, f"Bib {bib} ({name}) is also listed at {first_path} line {first_line}")

    # Flag the less-used spellings of a club, pointing at the usual one
    for spellings in clubs.values():
        if len(spellings) > 1:
            usual = max(sorted(spellings), key=lambda s: len(spellings[s]))
            for spelling, uses in spellings.items():
                if spelling == usual:
                    continue
                for path, line in uses:
                    error(path, line, f"Club '{spelling}' is spelled '{usual}' elsewhere in the results")

    # Each year's page must list exactly the races that have data files
    pages = {}
    for path in sorted(glob.glob(os.path.join("results", "*.md"))):
        with open(path, encoding="utf-8") as f:
            text = f.read()
        year = re.search(r"^year: *(\d{4})", text, re.M)
        races = re.search(r"^races: *\[(.*)\]", text, re.M)
        if year:
            pages[year.group(1)] = (path, {r.strip() for r in races.group(1).split(",") if r.strip()} if races else set())
    for year, races in files.items():
        if year not in pages:
            error(f"_data/results/{year}", 1, f"No results/{year}.md page for these results")
            continue
        path, listed = pages[year]
        for race in sorted(races - listed):
            error(path, 1, f"'{race}' has a data file but isn't in this page's races list")
    for year, (path, listed) in pages.items():
        for race in sorted(listed - files.get(year, set())):
            error(path, 1, f"'{race}' is listed but _data/results/{year}/{race}.csv doesn't exist")

    if errors:
        print(f"{errors} problem(s) found in the results data.")
        return 1
    print("Results data looks good.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
