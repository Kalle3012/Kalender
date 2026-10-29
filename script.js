// =========================================
// DayFlow – Funktionen (Schritt 2)
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

// ---------- 3. Aufgaben (NEU in Schritt 2) ----------

// Hier merken wir uns alle Aufgaben. Jede Aufgabe ist ein Objekt.
// Achtung: Noch gehen sie beim Neuladen verloren (Speichern folgt in Schritt 3).
let aufgaben = [];

// Texte für die Anzeige der Prioritäten
const prioritaetTexte = {
  niedrig: "Niedrig",
  mittel: "Mittel",
  hoch: "Hoch"
};

// Elemente aus dem HTML, die wir öfter brauchen
const formular = document.getElementById("aufgabe-formular");
const titelFeld = document.getElementById("aufgabe-titel");
const beschreibungFeld = document.getElementById("aufgabe-beschreibung");
const faelligFeld = document.getElementById("aufgabe-faellig");
const prioritaetFeld = document.getElementById("aufgabe-prioritaet");
const fehlerText = document.getElementById("aufgabe-fehler");
const liste = document.getElementById("aufgaben-liste");
const leerHinweis = document.getElementById("aufgaben-leer");
const anzahlText = document.getElementById("aufgaben-anzahl");

// Zeigt eine Fehlermeldung unter dem Formular an.
function zeigeFehler(nachricht) {
  fehlerText.textContent = nachricht;
  fehlerText.hidden = false;
}

function versteckeFehler() {
  fehlerText.textContent = "";
  fehlerText.hidden = true;
}

// Macht aus "2026-10-30" einen deutschen Text wie "Fr., 30. Okt. 2026".
function formatiereDatum(datumText) {
  const teile = datumText.split("-"); // ["2026", "10", "30"]
  const datum = new Date(teile[0], teile[1] - 1, teile[2]); // Monate zählen ab 0
  return datum.toLocaleDateString("de-DE", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

// Baut die Liste auf der Seite neu auf – passend zum Array "aufgaben".
function zeigeAufgaben() {
  liste.innerHTML = ""; // alte Einträge entfernen

  // Leerer Zustand: Hinweis zeigen, wenn es keine Aufgaben gibt
  leerHinweis.hidden = aufgaben.length > 0;
  anzahlText.textContent = aufgaben.length > 0 ? "(" + aufgaben.length + ")" : "";

  aufgaben.forEach(function (aufgabe) {
    const eintrag = document.createElement("li");
    eintrag.className = "aufgabe prio-" + aufgabe.prioritaet;

    const titel = document.createElement("p");
    titel.className = "aufgabe-titel";
    titel.textContent = aufgabe.titel;
    eintrag.appendChild(titel);

    // Beschreibung nur anzeigen, wenn eine eingegeben wurde
    if (aufgabe.beschreibung) {
      const beschreibung = document.createElement("p");
      beschreibung.className = "aufgabe-beschreibung";
      beschreibung.textContent = aufgabe.beschreibung;
      eintrag.appendChild(beschreibung);
    }

    const info = document.createElement("div");
    info.className = "aufgabe-info";

    const faellig = document.createElement("span");
    faellig.className = "etikett";
    faellig.textContent = "Fällig: " + formatiereDatum(aufgabe.faellig);
    info.appendChild(faellig);

    const prioritaet = document.createElement("span");
    prioritaet.className = "etikett prio-" + aufgabe.prioritaet;
    prioritaet.textContent = "Priorität: " + prioritaetTexte[aufgabe.prioritaet];
    info.appendChild(prioritaet);

    eintrag.appendChild(info);
    liste.appendChild(eintrag);
  });
}

// Wird ausgeführt, wenn das Formular abgeschickt wird.
formular.addEventListener("submit", function (ereignis) {
  ereignis.preventDefault(); // verhindert, dass die Seite neu lädt

  const titel = titelFeld.value.trim(); // trim() entfernt Leerzeichen am Rand
  const beschreibung = beschreibungFeld.value.trim();
  const faellig = faelligFeld.value;

  // Eingaben prüfen – mit verständlichen Meldungen
  if (titel === "") {
    zeigeFehler("Bitte gib einen Titel für die Aufgabe ein.");
    titelFeld.focus();
    return; // hier abbrechen, nichts speichern
  }
  if (faellig === "") {
    zeigeFehler("Bitte wähle aus, bis wann die Aufgabe erledigt sein soll.");
    faelligFeld.focus();
    return;
  }

  versteckeFehler();

  // Neue Aufgabe als Objekt anlegen
  const neueAufgabe = {
    id: Date.now().toString(), // eindeutige Nummer aus der aktuellen Zeit
    titel: titel,
    beschreibung: beschreibung,
    faellig: faellig,
    prioritaet: prioritaetFeld.value,
    erledigt: false
  };

  aufgaben.push(neueAufgabe); // ans Ende der Liste anhängen
  zeigeAufgaben();

  // Formular leeren für die nächste Aufgabe
  formular.reset();
});

// ---------- 4. Start ----------

zeigeDatumUndBegruessung();
zeigeAufgaben();

// Jede Minute aktualisieren – so stimmen Gruß und Datum auch,
// wenn die App lange offen bleibt (z. B. über Mitternacht).
setInterval(zeigeDatumUndBegruessung, 60 * 1000);
