// Homepage: the site only rebuilds when something is pushed, so check the race
// date in the visitor's browser. Before race day, show a countdown; after it,
// switch to the "thank you" message and results link.
(function () {
  var hero = document.querySelector("[data-event-date]");
  if (!hero) return;

  var parts = hero.getAttribute("data-event-date").split("-");
  var raceDay = new Date(parts[0], parts[1] - 1, parts[2]);
  var now = new Date();
  var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  var days = Math.round((raceDay - today) / 86400000);
  var raceOver = days < 0;

  var phases = document.querySelectorAll("[data-phase]");
  for (var i = 0; i < phases.length; i++) {
    var phase = phases[i].getAttribute("data-phase");
    phases[i].hidden = raceOver ? phase !== "past" : phase !== "upcoming";
  }

  var countdown = hero.querySelector("[data-countdown]");
  if (countdown && !raceOver) {
    countdown.textContent = days === 0 ? "Race day is today!" :
      days === 1 ? "Tomorrow!" : days + " days to go";
    countdown.hidden = false;
  }
})();
