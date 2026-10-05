# Charnwood Challenge

Repo for the Charnwood Challenge website, [charnwoodchallenge.me](https://charnwoodchallenge.me). It's a Jekyll site that GitHub Pages builds and publishes from the `master` branch.

## Previewing the site on your computer

You can run the site on your own computer to check changes before you push them. It uses the same version of Jekyll and the same plugins as GitHub Pages, so it looks the same as the live site.

### Windows: set up WSL (first time only)

On Windows the site runs in WSL (Windows Subsystem for Linux), which gives you an Ubuntu terminal. Ruby tools for Jekyll are much less fiddly there than on Windows itself.

1. Open **PowerShell** as Administrator and run:

   ```powershell
   wsl --install
   ```

   Restart when it asks. Then open **Ubuntu** from the Start menu and choose a username and password. You'll use this password for `sudo`.

2. In the Ubuntu terminal, install Ruby and the tools it needs to build gems:

   ```bash
   sudo apt update
   sudo apt install -y ruby-full build-essential zlib1g-dev git
   ```

3. Set up a folder for Ruby gems in your home folder, so they install without `sudo`:

   ```bash
   echo 'export GEM_HOME="$HOME/gems"' >> ~/.bashrc
   echo 'export PATH="$HOME/gems/bin:$PATH"' >> ~/.bashrc
   source ~/.bashrc
   gem install bundler
   ```

4. Clone the repo into your Ubuntu home folder and install Jekyll:

   ```bash
   cd ~
   git clone https://github.com/Charnwood-Challenge/charnwood-challenge.github.io.git
   cd charnwood-challenge.github.io
   bundle install
   ```

   `bundle install` takes a few minutes the first time.

   Clone into the Ubuntu home folder (`~`), not a Windows folder under `/mnt/c/`. From a Windows folder, the site is much slower to build and doesn't notice when you save a file.

To edit the files on Windows, install [VS Code](https://code.visualstudio.com/) with its **WSL** extension, then run `code .` in the repo folder in Ubuntu. You can also open the folder in Windows File Explorer at `\\wsl$\Ubuntu\home\<your username>\charnwood-challenge.github.io`.

### Mac or Linux: set up (first time only)

Install Ruby 3. On Ubuntu or Debian, follow steps 2 and 3 above. On a Mac, run `brew install ruby` with [Homebrew](https://brew.sh/) and follow its instructions for adding Ruby to your `PATH`, then run `gem install bundler`. Then follow step 4.

### Run the site

In the repo folder:

```bash
bundle exec jekyll serve --livereload
```

Open <http://localhost:4000> in your browser. On Windows, any Windows browser works. When you save a file, the site rebuilds and the page refreshes by itself. Changes to `_config.yml` are the exception: stop the server with **Ctrl+C** and start it again.

To check the results data the same way the pull request check does:

```bash
python3 scripts/check_results.py
```

GitHub Pages updates its version of Jekyll from time to time. Run `bundle update` now and then to match it.

### If something goes wrong

- **Warnings about `faraday-retry` or "GitHub Metadata" when the site builds.** These are safe to ignore.
- **`Invalid US-ASCII character` when building the stylesheet.** The terminal isn't set to UTF-8. Run `echo 'export LANG=C.UTF-8' >> ~/.bashrc && source ~/.bashrc` and try again.
- **Saved changes don't show up.** The repo is probably in a Windows folder (`/mnt/c/...`). Clone it into your Ubuntu home folder (step 4), or start the server with `bundle exec jekyll serve --livereload --force_polling`.
- **`Address already in use`.** The server is already running in another terminal. Stop that one, or add `--port 4001` and open <http://localhost:4001>.
- **`bundle: command not found`.** Run `source ~/.bashrc`, or open a new Ubuntu terminal, so step 3's settings take effect.

## Updating the event for a new year

This year's details are in `_data/event.yml`. The homepage and the race information page both read from it, so the date, entry link, start times and fees only need changing there.

1. Set `year` to the new year. Leave `date` blank until the date is confirmed, and the homepage says the date will be announced soon.
2. When the date is confirmed, set `date` (as `YYYY-MM-DD`). The homepage then shows the date and a countdown.
3. When entries open, set `entry_url` to the SI Entries page. The homepage shows an **Enter now** button until race day.
4. Check `start_times`, `registration_opens` and `fees`, and change anything that's different this year.
5. Update the rest of `raceinformation.md` as needed, for example any changes to the route.

You don't need to change anything after race day. The homepage switches to a thank-you message with a link to that year's results, once they're published.

To keep a copy of a year's race information page before rewriting it, copy `raceinformation.md` to a new file such as `raceinformation2026.md` and change its `permalink`. Then replace each `{{ site.data.event... }}` tag and the `{% include event-facts.html ... %}` line with the actual text. Otherwise the copy will show the current year's details.

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
3. Optionally, [preview the site](#run-the-site) and check the new year at `http://localhost:4000/results/<year>/`.
4. Open a pull request. The **Check results** check looks for mistakes, such as duplicate bibs, places or times out of order, and a club spelled two ways, and marks the lines on the pull request.

To run the check yourself: `python3 scripts/check_results.py`

The year's page shows the leading finishers, a table for each race, and filters by name, gender and club. Position within gender and the gap to the winner are worked out when the site is built. The name search on the [results page](https://charnwoodchallenge.me/results/) picks up the new year automatically.

To add a new kind of race, add it to `_data/races.yml`.
