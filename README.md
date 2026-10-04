# Charnwood Challenge

Repo for the Charnwood Challenge website, [charnwoodchallenge.me](https://charnwoodchallenge.me). It's a Jekyll site that GitHub Pages builds and publishes from the `master` branch.

## Publishing a year's results

Each race's results are a CSV file in `_data/results/<year>/`:

| File | Race |
| --- | --- |
| `runners.csv` | 10 mile runners |
| `walkers.csv` | 10 mile walkers |
| `junior-walkers.csv` | Junior walkers |
| `fun-run.csv` | Junior Challenge fun run |

1. Save each race's results as a CSV file in `_data/results/<year>/`. The first row names the columns:
   - `place` and `time` are required. Times are `h:mm:ss`, or `mm:ss` for short races.
   - `bib`, `name`, `gender` (`Male` or `Female`), `club` and `category` are optional.
   - Leave `club` blank for people without a club.
2. Copy last year's page in `results/` (for example `results/2026.md` to `results/2027.md`) and change the year, `race_date`, `permalink` and list of `races`.
3. Open a pull request. The **Check results** check looks for mistakes, such as duplicate bibs, places or times out of order, and a club spelled two ways, and marks the lines on the pull request.

To run the check yourself: `python3 scripts/check_results.py`

The year's page shows the leading finishers, a table for each race, and filters by name, gender and club. Position within gender and the gap to the winner are worked out when the site is built. The name search on the [results page](https://charnwoodchallenge.me/results/) picks up the new year automatically.

To add a new kind of race, add it to `_data/races.yml`.
