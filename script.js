// =========================================
// DayFlow – Funktionen (Schritt 1)
// =========================================

// ---------- 1. Datum und Begrüßung ----------

// Liefert je nach Uhrzeit den passenden Gruß zurück.
function holeBegruessung(stunde) {
  if (stunde >= 5 && stunde < 11) {
    return "Guten Morgen!";
  } else if (stunde >= 11 && stunde < 18) {
    return "Guten Tag!";
  } else if (stunde >= 18 && stunde < 23) {
    return "Guten Abend!";
  } else {
    return "Gute Nacht!";
  }
}

// Schreibt das heutige Datum und die Begrüßung in die Seite.
function zeigeDatumUndBegruessung() {
  const jetzt = new Date();

  // Datum auf Deutsch, z. B. "Donnerstag, 29. Oktober 2026"
  const datumText = jetzt.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  document.getElementById("datum").textContent = datumText;
  document.getElementById("begruessung").textContent = holeBegruessung(jetzt.getHours());
}

// ---------- 2. Navigation zwischen den Ansichten ----------

const navButtons = document.querySelectorAll(".nav-button");
const ansichten = document.querySelectorAll(".ansicht");

// Zeigt eine Ansicht an und versteckt alle anderen.
function wechsleAnsicht(name) {
  ansichten.forEach(function (ansicht) {
    ansicht.hidden = ansicht.id !== "ansicht-" + name;
  });

  navButtons.forEach(function (button) {
    button.classList.toggle("aktiv", button.dataset.ansicht === name);
  });
}

// Jeder Navigations-Button bekommt einen "Klick-Zuhörer".
navButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    wechsleAnsicht(button.dataset.ansicht);
  });
});

// ---------- 3. Start ----------

zeigeDatumUndBegruessung();

// Jede Minute aktualisieren – so stimmen Gruß und Datum auch,
// wenn die App lange offen bleibt (z. B. über Mitternacht).
setInterval(zeigeDatumUndBegruessung, 60 * 1000);
