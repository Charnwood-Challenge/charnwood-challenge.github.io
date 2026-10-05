// Results pages. The tables are built when the site is generated, so they work
// without this script; it adds the filters on each year's page and the
// name search on /results/.
(function () {
  // Year pages: filter every race table by a search (name, club or bib),
  // gender and club
  var filter = document.getElementById("results-filter");

  if (filter) {
    var sections = document.querySelectorAll(".results-race");

    var applyFilter = function () {
      var query = filter.elements.q.value.trim().toLowerCase();
      var gender = filter.elements.gender.value;
      var club = filter.elements.club ? filter.elements.club.value : "";
      var filtering = query || gender || club;

      for (var i = 0; i < sections.length; i++) {
        var rows = sections[i].querySelectorAll("tbody tr");
        var count = sections[i].querySelector(".results-count");
        var shown = 0;

        for (var j = 0; j < rows.length; j++) {
          var row = rows[j];
          var match = (!query || row.getAttribute("data-search").indexOf(query) !== -1) &&
            (!gender || row.getAttribute("data-gender") === gender) &&
            (!club || row.getAttribute("data-club") === club);
          row.hidden = !match;
          if (match) shown++;
        }

        var total = count.getAttribute("data-total");
        var noun = total === "1" ? " finisher" : " finishers";
        count.textContent = filtering ? shown + " of " + total + noun : total + noun;
        sections[i].hidden = filtering && shown === 0;
      }
    };

    filter.hidden = false;
    filter.addEventListener("input", applyFilter);
    filter.addEventListener("change", applyFilter);
    filter.addEventListener("submit", function (event) { event.preventDefault(); });
  }

  // /results/: old links to a year on the single results page (/results/#2025)
  // now go to that year's page
  var search = document.getElementById("results-search");

  if (search && /^#\d{4}$/.test(location.hash)) {
    location.replace(search.getAttribute("data-base") + "/results/" + location.hash.slice(1) + "/");
    return;
  }

  // /results/: find someone's results across every year
  if (search) {
    var input = document.getElementById("results-search-input");
    var output = document.getElementById("results-search-results");
    var base = search.getAttribute("data-base");
    var data = null;
    var loading = null;
    var maxPeople = 30;

    var load = function () {
      if (!loading) {
        loading = fetch(search.getAttribute("data-src"))
          .then(function (response) { return response.json(); })
          .then(function (json) { data = json; })
          .catch(function (err) {
            loading = null; // try again on the next keystroke
            throw err;
          });
      }
      return loading;
    };

    var ordinal = function (place) {
      var n = parseInt(place, 10);
      var suffix = (n % 100 >= 11 && n % 100 <= 13) ? "th" : ({ 1: "st", 2: "nd", 3: "rd" }[n % 10] || "th");
      return n + suffix;
    };

    var element = function (tag, className, text) {
      var el = document.createElement(tag);
      if (className) el.className = className;
      if (text !== undefined) el.textContent = text;
      return el;
    };

    var render = function () {
      var query = input.value.trim().toLowerCase();
      output.textContent = "";
      if (query.length < 2 || !data) return;

      // Group each finish under the person's name
      var people = {};
      var order = [];
      for (var i = 0; i < data.rows.length; i++) {
        var row = data.rows[i];
        if (row.n.toLowerCase().indexOf(query) === -1) continue;
        var key = row.n.toLowerCase().replace(/\s+/g, " ");
        if (!people[key]) {
          people[key] = { name: row.n, finishes: [] };
          order.push(key);
        }
        people[key].finishes.push(row);
      }

      if (!order.length) {
        output.appendChild(element("p", "results-search-empty", "No results for “" + input.value.trim() + "”."));
        return;
      }

      order.sort();
      for (var p = 0; p < Math.min(order.length, maxPeople); p++) {
        var person = people[order[p]];
        var card = element("div", "results-person");
        var count = person.finishes.length;
        card.appendChild(element("h3", null, person.name));
        card.appendChild(element("p", "results-person-count", count + (count === 1 ? " result" : " results")));

        var list = element("ul");
        for (var f = 0; f < person.finishes.length; f++) {
          var finish = person.finishes[f];
          var item = element("li");
          var link = element("a", null, String(finish.y));
          link.href = base + "/results/" + finish.y + "/#" + finish.r + "-" + finish.i;
          item.appendChild(link);
          var race = data.races[finish.r] ? data.races[finish.r].title : finish.r;
          item.appendChild(element("span", "results-person-race", race));
          item.appendChild(element("span", "results-person-place", ordinal(finish.p)));
          item.appendChild(element("span", "results-person-time", finish.t));
          if (finish.c) item.appendChild(element("span", "results-person-club", finish.c));
          list.appendChild(item);
        }
        card.appendChild(list);
        output.appendChild(card);
      }

      if (order.length > maxPeople) {
        output.appendChild(element("p", "results-search-more",
          "Showing " + maxPeople + " of " + order.length + " people. Type more of the name to narrow it down."));
      }
    };

    search.hidden = false;
    input.addEventListener("focus", load);
    input.addEventListener("input", function () {
      load().then(render, function () {
        output.textContent = "Sorry, the results couldn\u2019t be loaded. Please try again.";
      });
    });
    search.addEventListener("submit", function (event) { event.preventDefault(); });
  }
})();
