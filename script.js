// =========================================
// DayFlow – Funktionen (Schritt 6)
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

// ---------- 3. Hilfsfunktionen für Datum und Uhrzeit ----------

// Macht aus einem Date-Objekt den Text "2026-10-30" (wie im Datumsfeld).
function alsDatumText(datum) {
  const monat = String(datum.getMonth() + 1).padStart(2, "0");
  const tag = String(datum.getDate()).padStart(2, "0");
  return datum.getFullYear() + "-" + monat + "-" + tag;
}

// Macht aus 9 und 5 den Text "09:05".
function alsUhrzeitText(stunde, minute) {
  return String(stunde).padStart(2, "0") + ":" + String(minute).padStart(2, "0");
}

function plusTage(datum, anzahl) {
  const neu = new Date(datum);
  neu.setDate(neu.getDate() + anzahl);
  return neu;
}

// Macht aus "2026-10-30" wieder ein Date-Objekt (Monate zählen ab 0).
function alsDatum(datumText) {
  const teile = datumText.split("-"); // ["2026", "10", "30"]
  return new Date(teile[0], teile[1] - 1, teile[2]);
}

// NEU in Schritt 5: "Heute", "Morgen", "Gestern" – sonst z. B. "Fr., 30. Okt."
// (die Jahreszahl nur, wenn es nicht dieses Jahr ist)
function formatiereDatum(datumText) {
  const jetzt = new Date();
  if (datumText === alsDatumText(jetzt)) {
    return "Heute";
  }
  if (datumText === alsDatumText(plusTage(jetzt, 1))) {
    return "Morgen";
  }
  if (datumText === alsDatumText(plusTage(jetzt, -1))) {
    return "Gestern";
  }

  const datum = alsDatum(datumText);
  const optionen = { weekday: "short", day: "numeric", month: "short" };
  if (datum.getFullYear() !== jetzt.getFullYear()) {
    optionen.year = "numeric";
  }
  return datum.toLocaleDateString("de-DE", optionen);
}

// Datum und (falls vorhanden) Uhrzeit als ein Text, z. B. "Morgen, 10:00 Uhr"
function formatiereTermin(aufgabe) {
  let text = formatiereDatum(aufgabe.faellig);
  if (aufgabe.uhrzeit) {
    text += ", " + aufgabe.uhrzeit + " Uhr";
  }
  return text;
}

// NEU in Schritt 5: Datum und Uhrzeit einer Aufgabe als Date-Objekt
function zeitpunkt(aufgabe) {
  const datum = alsDatum(aufgabe.faellig);
  const teile = aufgabe.uhrzeit.split(":"); // ["10", "00"]
  datum.setHours(teile[0], teile[1]);
  return datum;
}

// NEU in Schritt 5: Macht aus 135 Minuten den Text "in 2 Std. 15 Min."
function formatiereAbstand(minuten) {
  if (minuten < 1) {
    return "jetzt";
  }
  if (minuten < 60) {
    return "in " + minuten + " Min.";
  }
  const stunden = Math.floor(minuten / 60);
  const restMinuten = minuten % 60;
  return "in " + stunden + " Std." + (restMinuten > 0 ? " " + restMinuten + " Min." : "");
}

// ---------- 4. Meldungs-Leiste unten (NEU in Schritt 5) ----------

const meldung = document.getElementById("meldung");
const meldungText = document.getElementById("meldung-text");
const meldungButton = document.getElementById("meldung-button");

let meldungTimer = null;   // damit die Leiste nach ein paar Sekunden verschwindet
let meldungAktion = null;  // was beim Tippen auf den Button passieren soll

// Zeigt unten eine kurze Meldung. Optional mit Button, z. B. "Rückgängig".
function zeigeMeldung(text, buttonText, aktion) {
  meldungText.textContent = text;
  meldungAktion = aktion || null;
  meldungButton.textContent = buttonText || "";
  meldungButton.hidden = !aktion;
  meldung.hidden = false;

  clearTimeout(meldungTimer); // alten Countdown abbrechen
  meldungTimer = setTimeout(versteckeMeldung, 6000);
}

function versteckeMeldung() {
  meldung.hidden = true;
  meldungAktion = null;
}

meldungButton.addEventListener("click", function () {
  if (meldungAktion) {
    meldungAktion();
  }
  versteckeMeldung();
});

// ---------- 5. Aufgaben: speichern, anzeigen, abhaken, löschen ----------

// Unter diesem Namen liegen die Aufgaben im Speicher des Browsers (NEU in Schritt 5).
const SPEICHER_NAME = "dayflow-aufgaben";

// Hier merken wir uns alle Aufgaben. Jede Aufgabe ist ein Objekt.
// Beim Start werden sie aus dem Speicher geladen (siehe Abschnitt 11).
let aufgaben = [];

// Texte für die Anzeige der Prioritäten
const prioritaetTexte = {
  niedrig: "Niedrig",
  mittel: "Mittel",
  hoch: "Hoch"
};

// Zum Sortieren: hoch kommt vor mittel, mittel vor niedrig
const prioritaetRang = { hoch: 0, mittel: 1, niedrig: 2 };

// Elemente aus dem HTML, die wir öfter brauchen
const formular = document.getElementById("aufgabe-formular");
const titelFeld = document.getElementById("aufgabe-titel");
const beschreibungFeld = document.getElementById("aufgabe-beschreibung");
const faelligFeld = document.getElementById("aufgabe-faellig");
const uhrzeitFeld = document.getElementById("aufgabe-uhrzeit");
const prioritaetFeld = document.getElementById("aufgabe-prioritaet");
const fehlerText = document.getElementById("aufgabe-fehler");
const liste = document.getElementById("aufgaben-liste");
const leerHinweis = document.getElementById("aufgaben-leer");
const anzahlText = document.getElementById("aufgaben-anzahl");

// Mülleimer-Symbol für den Löschen-Button. Das ist fester Text von uns
// (keine Eingabe von außen), deshalb dürfen wir hier innerHTML benutzen.
const MUELLEIMER_SYMBOL =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
  '<polyline points="3 6 5 6 21 6"></polyline>' +
  '<path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>' +
  '<path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>' +
  '</svg>';

// NEU in Schritt 5: Lädt die Aufgaben aus dem localStorage.
function ladeAufgaben() {
  let text = null;
  try {
    text = localStorage.getItem(SPEICHER_NAME);
  } catch (fehler) {
    zeigeMeldung("Dein Browser erlaubt kein Speichern. Aufgaben gehen beim Neuladen verloren.");
    return [];
  }

  if (text === null) {
    return []; // erster Start: noch nichts gespeichert
  }

  try {
    const daten = JSON.parse(text); // Text → JavaScript-Liste
    if (!Array.isArray(daten)) {
      throw new Error("Keine Liste");
    }
    // Nur Einträge behalten, die wie eine Aufgabe aussehen,
    // und fehlende Angaben mit Standardwerten auffüllen.
    return daten
      .filter(function (a) {
        return a && typeof a.titel === "string" && typeof a.faellig === "string";
      })
      .map(function (a, nummer) {
        return {
          id: String(a.id || Date.now() + "-" + nummer),
          titel: a.titel,
          beschreibung: a.beschreibung || "",
          faellig: a.faellig,
          uhrzeit: a.uhrzeit || "",
          prioritaet: prioritaetTexte[a.prioritaet] ? a.prioritaet : "mittel",
          erledigt: a.erledigt === true
        };
      });
  } catch (fehler) {
    // Beschädigte Daten nicht einfach überschreiben, sondern zur Sicherheit aufheben
    try {
      localStorage.setItem(SPEICHER_NAME + "-defekt", text);
    } catch (fehler2) {
      // Wenn auch das nicht geht, können wir nichts mehr tun.
    }
    zeigeMeldung("Deine gespeicherten Aufgaben waren beschädigt und konnten nicht geladen werden.");
    return [];
  }
}

// NEU in Schritt 5: Schreibt alle Aufgaben in den localStorage.
function speichereAufgaben() {
  try {
    localStorage.setItem(SPEICHER_NAME, JSON.stringify(aufgaben)); // Liste → Text
  } catch (fehler) {
    zeigeMeldung("Speichern hat nicht geklappt. Ist der Speicher voll oder der private Modus aktiv?");
  }
}

// NEU in Schritt 5: Nach JEDER Änderung an "aufgaben" aufrufen:
// erst speichern, dann alles neu anzeigen.
function aufgabenGeaendert() {
  speichereAufgaben();
  zeigeAlles();
}

function zeigeAlles() {
  zeigeAufgaben();
  zeigeTagesUebersicht();
}

// Zeigt eine Fehlermeldung unter dem Formular an.
function zeigeFehler(nachricht) {
  fehlerText.textContent = nachricht;
  fehlerText.hidden = false;
}

function versteckeFehler() {
  fehlerText.textContent = "";
  fehlerText.hidden = true;
}

// NEU in Schritt 5: Überfällig = noch offen und das Datum liegt vor heute.
// Texte wie "2026-10-29" kann man direkt vergleichen: früher ist "kleiner".
function istUeberfaellig(aufgabe) {
  return !aufgabe.erledigt && aufgabe.faellig < alsDatumText(new Date());
}

// NEU in Schritt 5: Reihenfolge der Liste.
// Offene vor erledigten, dann nach Datum, Uhrzeit (ohne Uhrzeit ans Tagesende) und Priorität.
function vergleicheAufgaben(a, b) {
  if (a.erledigt !== b.erledigt) {
    return a.erledigt ? 1 : -1;
  }
  const zeitA = a.faellig + " " + (a.uhrzeit || "99:99");
  const zeitB = b.faellig + " " + (b.uhrzeit || "99:99");
  if (zeitA !== zeitB) {
    return zeitA < zeitB ? -1 : 1;
  }
  return prioritaetRang[a.prioritaet] - prioritaetRang[b.prioritaet];
}

// NEU in Schritt 5: Baut EINEN Listeneintrag mit Haken, Inhalt und Löschen-Button.
// Wird für die Aufgabenliste UND für "Dein Tag" auf der Startseite benutzt.
function erstelleAufgabenEintrag(aufgabe) {
  const eintrag = document.createElement("li");
  eintrag.className = "aufgabe prio-" + aufgabe.prioritaet;
  if (aufgabe.erledigt) {
    eintrag.classList.add("erledigt");
  }

  // Haken zum Abhaken
  const haken = document.createElement("input");
  haken.type = "checkbox";
  haken.className = "haken";
  haken.checked = aufgabe.erledigt;
  haken.setAttribute("aria-label", "Erledigt: " + aufgabe.titel);
  haken.addEventListener("change", function () {
    aufgabe.erledigt = haken.checked;
    aufgabenGeaendert();
  });
  eintrag.appendChild(haken);

  // Inhalt: Titel, Beschreibung, Etiketten
  const inhalt = document.createElement("div");
  inhalt.className = "aufgabe-inhalt";

  const titel = document.createElement("p");
  titel.className = "aufgabe-titel";
  titel.textContent = aufgabe.titel;
  inhalt.appendChild(titel);

  // Beschreibung nur anzeigen, wenn eine eingegeben wurde
  if (aufgabe.beschreibung) {
    const beschreibung = document.createElement("p");
    beschreibung.className = "aufgabe-beschreibung";
    beschreibung.textContent = aufgabe.beschreibung;
    inhalt.appendChild(beschreibung);
  }

  const info = document.createElement("div");
  info.className = "aufgabe-info";

  const faellig = document.createElement("span");
  faellig.className = "etikett";
  faellig.textContent = formatiereTermin(aufgabe);
  info.appendChild(faellig);

  const prioritaet = document.createElement("span");
  prioritaet.className = "etikett prio-" + aufgabe.prioritaet;
  prioritaet.textContent = "Priorität: " + prioritaetTexte[aufgabe.prioritaet];
  info.appendChild(prioritaet);

  if (istUeberfaellig(aufgabe)) {
    const ueberfaellig = document.createElement("span");
    ueberfaellig.className = "etikett ueberfaellig";
    ueberfaellig.textContent = "Überfällig";
    info.appendChild(ueberfaellig);
  }

  inhalt.appendChild(info);
  eintrag.appendChild(inhalt);

  // Löschen-Button
  const loeschen = document.createElement("button");
  loeschen.type = "button";
  loeschen.className = "loeschen-button";
  loeschen.setAttribute("aria-label", "Löschen: " + aufgabe.titel);
  loeschen.innerHTML = MUELLEIMER_SYMBOL;
  loeschen.addEventListener("click", function () {
    loescheAufgabe(aufgabe.id);
  });
  eintrag.appendChild(loeschen);

  return eintrag;
}

// Baut die Aufgabenliste auf der Seite neu auf – passend zum Array "aufgaben".
function zeigeAufgaben() {
  liste.innerHTML = ""; // alte Einträge entfernen

  const anzahlOffen = aufgaben.filter(function (a) {
    return !a.erledigt;
  }).length;

  // Leerer Zustand: Hinweis zeigen, wenn es keine Aufgaben gibt
  leerHinweis.hidden = aufgaben.length > 0;
  anzahlText.textContent = aufgaben.length > 0
    ? "(" + anzahlOffen + " offen, " + (aufgaben.length - anzahlOffen) + " erledigt)"
    : "";

  // slice() macht eine Kopie – so sortieren wir nur die Anzeige, nicht die Daten
  aufgaben.slice().sort(vergleicheAufgaben).forEach(function (aufgabe) {
    liste.appendChild(erstelleAufgabenEintrag(aufgabe));
  });
}

// Legt eine Aufgabe an. Wird vom Formular UND von der Spracheingabe benutzt.
function fuegeAufgabeHinzu(daten) {
  const neueAufgabe = {
    id: Date.now().toString(), // eindeutige Nummer aus der aktuellen Zeit
    titel: daten.titel,
    beschreibung: daten.beschreibung || "",
    faellig: daten.faellig,
    uhrzeit: daten.uhrzeit || "",
    prioritaet: daten.prioritaet,
    erledigt: false
  };

  aufgaben.push(neueAufgabe); // ans Ende der Liste anhängen
  aufgabenGeaendert();
  return neueAufgabe;
}

// NEU in Schritt 5: Löscht eine Aufgabe – mit "Rückgängig" in der Meldungs-Leiste.
function loescheAufgabe(id) {
  const position = aufgaben.findIndex(function (a) {
    return a.id === id;
  });
  if (position === -1) {
    return; // gibt es nicht (mehr)
  }

  const geloescht = aufgaben[position];
  aufgaben.splice(position, 1); // 1 Eintrag an dieser Position entfernen
  aufgabenGeaendert();

  zeigeMeldung("„" + geloescht.titel + "“ gelöscht.", "Rückgängig", function () {
    aufgaben.splice(position, 0, geloescht); // an alter Position wieder einfügen
    aufgabenGeaendert();
  });
}

// Wird ausgeführt, wenn das Formular abgeschickt wird.
formular.addEventListener("submit", function (ereignis) {
  ereignis.preventDefault(); // verhindert, dass die Seite neu lädt

  const titel = titelFeld.value.trim(); // trim() entfernt Leerzeichen am Rand
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

  fuegeAufgabeHinzu({
    titel: titel,
    beschreibung: beschreibungFeld.value.trim(),
    faellig: faellig,
    uhrzeit: uhrzeitFeld.value,
    prioritaet: prioritaetFeld.value
  });

  // Formular leeren für die nächste Aufgabe
  formular.reset();
  zeigeMikroStatus("");
});

// ---------- 6. Tagesüberblick auf der Startseite (NEU in Schritt 5) ----------

const tagesZusammenfassung = document.getElementById("tages-zusammenfassung");
const fortschritt = document.getElementById("fortschritt");
const fortschrittBalken = document.getElementById("fortschritt-balken");
const zahlOffen = document.getElementById("zahl-offen");
const zahlErledigt = document.getElementById("zahl-erledigt");
const zahlUeberfaellig = document.getElementById("zahl-ueberfaellig");
const kachelUeberfaellig = document.getElementById("kachel-ueberfaellig");
const naechsterTermin = document.getElementById("naechster-termin");
const heuteListe = document.getElementById("heute-liste");
const heuteLeer = document.getElementById("heute-leer");

function zeigeTagesUebersicht() {
  const jetzt = new Date();
  const heute = alsDatumText(jetzt);

  // --- Zahlen über alle Aufgaben ---
  const offen = aufgaben.filter(function (a) {
    return !a.erledigt;
  });
  const ueberfaellig = offen.filter(istUeberfaellig);

  zahlOffen.textContent = offen.length;
  zahlErledigt.textContent = aufgaben.length - offen.length;
  zahlUeberfaellig.textContent = ueberfaellig.length;
  kachelUeberfaellig.classList.toggle("warnung", ueberfaellig.length > 0);

  // --- Fortschritt für heute ---
  const fuerHeute = aufgaben.filter(function (a) {
    return a.faellig === heute;
  });
  const heuteErledigt = fuerHeute.filter(function (a) {
    return a.erledigt;
  }).length;
  const prozent = fuerHeute.length > 0 ? Math.round((heuteErledigt / fuerHeute.length) * 100) : 0;

  fortschritt.hidden = fuerHeute.length === 0;
  fortschritt.setAttribute("aria-valuenow", prozent);
  fortschrittBalken.style.width = prozent + "%";

  if (fuerHeute.length === 0) {
    tagesZusammenfassung.textContent = "Für heute ist nichts geplant. Tippe unten auf das Mikrofon, um etwas einzutragen.";
  } else if (heuteErledigt === fuerHeute.length) {
    tagesZusammenfassung.textContent = "Alles für heute erledigt – stark! 🎉";
  } else {
    tagesZusammenfassung.textContent = "Heute: " + heuteErledigt + " von " + fuerHeute.length + " erledigt.";
  }

  // --- Als Nächstes: der nächste offene Termin mit Uhrzeit ---
  const kommende = offen
    .filter(function (a) {
      return a.uhrzeit && zeitpunkt(a) >= jetzt;
    })
    .sort(vergleicheAufgaben);

  if (kommende.length > 0) {
    const naechste = kommende[0];
    const minuten = Math.round((zeitpunkt(naechste) - jetzt) / 60000); // Millisekunden → Minuten
    let text = "Als Nächstes: " + naechste.titel + " – " + formatiereTermin(naechste);
    if (minuten < 24 * 60) {
      text += " (" + formatiereAbstand(minuten) + ")"; // Countdown nur innerhalb von 24 Stunden
    }
    naechsterTermin.textContent = text;
    naechsterTermin.hidden = false;
  } else {
    naechsterTermin.hidden = true;
  }

  // --- Liste "Dein Tag": alles für heute plus Überfälliges ---
  heuteListe.innerHTML = "";
  const tagesAufgaben = aufgaben
    .filter(function (a) {
      return a.faellig === heute || istUeberfaellig(a);
    })
    .sort(vergleicheAufgaben);

  tagesAufgaben.forEach(function (aufgabe) {
    heuteListe.appendChild(erstelleAufgabenEintrag(aufgabe));
  });
  heuteLeer.hidden = tagesAufgaben.length > 0;
}

// ---------- 7. Spracheingabe (NEU in Schritt 3, umgebaut in Schritt 4) ----------

// Safari nennt die Spracherkennung "webkitSpeechRecognition",
// andere Browser "SpeechRecognition". Wir nehmen, was vorhanden ist.
const Spracherkennung = window.SpeechRecognition || window.webkitSpeechRecognition;

let erkennung = null; // die laufende Spracherkennung (null = Mikrofon aus)

// Übersetzt die Fehler-Codes der Spracherkennung in verständliche Sätze.
function spracheFehlerText(code) {
  if (code === "not-allowed" || code === "service-not-allowed") {
    return "Ich darf das Mikrofon nicht benutzen. Erlaube den Zugriff in Safari und prüfe, ob die Diktierfunktion in den iPad-Einstellungen eingeschaltet ist.";
  }
  if (code === "no-speech") {
    return "Ich habe nichts gehört. Tippe noch einmal auf das Mikrofon und sprich etwas lauter.";
  }
  if (code === "audio-capture") {
    return "Es wurde kein Mikrofon gefunden.";
  }
  if (code === "network") {
    return "Für die Spracheingabe wird eine Internetverbindung benötigt.";
  }
  return "Die Spracheingabe hat nicht geklappt (" + code + "). Bitte versuch es noch einmal.";
}

// Hört zu und meldet sich über die übergebenen Funktionen:
//   einstellungen.button    – der Mikrofon-Button (wird rot)
//   einstellungen.beimStart – Mikrofon ist an
//   einstellungen.beiText   – bekommt laufend den bisher erkannten Text
//   einstellungen.beiFertig – bekommt am Ende den ganzen Satz
//   einstellungen.beiFehler – bekommt eine verständliche Fehlermeldung
//   einstellungen.beimEnde  – Mikrofon ist wieder aus
function hoereZu(einstellungen) {
  // Gibt es überhaupt eine Spracherkennung in diesem Browser?
  if (!Spracherkennung) {
    einstellungen.beiFehler("Dein Browser unterstützt leider keine Spracheingabe. Tipp: Nutze im Aufgaben-Formular die Mikrofon-Taste der iPad-Tastatur.");
    return;
  }

  // Läuft schon eine Erkennung? Dann bedeutet der Tipp: aufhören.
  if (erkennung) {
    erkennung.stop();
    return;
  }

  let text = "";
  let fehlerPassiert = false;

  erkennung = new Spracherkennung();
  erkennung.lang = "de-DE";         // Deutsch verstehen
  erkennung.interimResults = true;  // Text schon während des Sprechens zeigen

  // Wird aufgerufen, sobald (neuer) Text erkannt wurde
  erkennung.onresult = function (ereignis) {
    text = "";
    for (let i = 0; i < ereignis.results.length; i++) {
      text += ereignis.results[i][0].transcript;
    }
    einstellungen.beiText(text.trim());
  };

  erkennung.onerror = function (ereignis) {
    if (ereignis.error !== "aborted") {
      fehlerPassiert = true;
      einstellungen.beiFehler(spracheFehlerText(ereignis.error));
    }
  };

  // Wird immer am Ende aufgerufen – egal ob mit Erfolg oder Fehler
  erkennung.onend = function () {
    erkennung = null;
    einstellungen.button.classList.remove("hoert-zu");
    einstellungen.beimEnde();
    if (!fehlerPassiert && text.trim() !== "") {
      einstellungen.beiFertig(text.trim());
    }
  };

  try {
    erkennung.start();
    einstellungen.button.classList.add("hoert-zu");
    einstellungen.beimStart();
  } catch (fehler) {
    erkennung = null;
    einstellungen.beiFehler("Die Spracheingabe konnte nicht gestartet werden. Bitte versuch es noch einmal.");
  }
}

// ---------- 8. Sätze verstehen (NEU in Schritt 4) ----------

const wochentage = ["sonntag", "montag", "dienstag", "mittwoch", "donnerstag", "freitag", "samstag"];
const monate = ["januar", "februar", "märz", "april", "mai", "juni", "juli",
                "august", "september", "oktober", "november", "dezember"];
const zahlwoerter = {
  ein: 1, eins: 1, eine: 1, einer: 1, einem: 1, zwei: 2, drei: 3, vier: 4, fünf: 5, sechs: 6,
  sieben: 7, acht: 8, neun: 9, zehn: 10, elf: 11, zwölf: 12
};
// Zahl als Ziffern oder Wort – für die Suchmuster unten
const zahl = "(\\d{1,2}|eins|ein|zwei|drei|vier|fünf|sechs|sieben|acht|neun|zehn|elf|zwölf)";

// Tageszeiten und die Stunde, die wir dafür annehmen
const tageszeiten = {
  früh: 8, morgens: 8, vormittag: 10, vormittags: 10, mittag: 12, mittags: 12,
  nachmittag: 15, nachmittags: 15, abend: 19, abends: 19, nachts: 22
};

// Macht aus "10" oder "zehn" die Zahl 10.
function alsZahl(wort) {
  const klein = wort.toLowerCase();
  if (zahlwoerter[klein] !== undefined) {
    return zahlwoerter[klein];
  }
  return parseInt(klein, 10);
}

// Liegt ein Datum ohne Jahresangabe schon in der Vergangenheit,
// ist wohl das nächste Jahr gemeint.
function naechstesPassendesDatum(tag, monatIndex, jahrText, heute) {
  if (jahrText) {
    return new Date(parseInt(jahrText, 10), monatIndex, tag);
  }
  let datum = new Date(heute.getFullYear(), monatIndex, tag);
  if (datum < heute) {
    datum = new Date(heute.getFullYear() + 1, monatIndex, tag);
  }
  return datum;
}

// Zerlegt einen gesprochenen Satz in Titel, Datum, Uhrzeit und Priorität.
// Beispiel: "Morgen um 10 Uhr Zahnarzt, wichtig"
//   → { titel: "Zahnarzt", faellig: "2026-10-30", uhrzeit: "10:00", prioritaet: "hoch" }
// Jedes erkannte Stück wird aus dem Satz entfernt – was übrig bleibt, ist der Titel.
function versteheSatz(satz, jetzt) {
  const heute = new Date(jetzt.getFullYear(), jetzt.getMonth(), jetzt.getDate());

  // Satzzeichen durch Leerzeichen ersetzen und vorne/hinten ein Leerzeichen
  // anhängen – so können wir einfach nach " wort " suchen.
  let rest = " " + satz.replace(/[,;!?]/g, " ").replace(/\.\s*$/, "") + " ";

  let datum = null;
  let uhrzeit = "";
  let stundeTageszeit = null;
  let prioritaet = "mittel";
  let treffer;

  // Sucht ein Muster im Satz. Wenn gefunden: aus dem Satz entfernen
  // und den Treffer zurückgeben, sonst null.
  function finde(muster) {
    const t = rest.match(muster);
    if (t) {
      rest = rest.replace(t[0], " ");
    }
    return t;
  }

  // --- Priorität ("nicht wichtig" zuerst, weil es "wichtig" enthält) ---
  if (finde(/\s(nicht wichtig|unwichtig|niedrige priorität|keine eile|irgendwann)\s/i)) {
    prioritaet = "niedrig";
  } else if (finde(/\s(sehr wichtig|wichtig|dringend|eilig|hohe priorität)\s/i)) {
    prioritaet = "hoch";
  } else if (finde(/\s(mittlere|normale) priorität\s/i)) {
    prioritaet = "mittel";
  }

  // --- "heute Morgen" muss vor "morgen" (= Tag nach heute) geprüft werden ---
  if (finde(/\sheute (morgen|früh)\s/i)) {
    datum = heute;
    stundeTageszeit = 8;
  }

  // --- Tageszeit, z. B. "abends", "am Nachmittag", "heute Abend" ---
  treffer = finde(/\s(?:am |heute )?(früh|morgens|vormittags?|mittags?|nachmittags?|abends?|nachts)\s/i);
  if (treffer) {
    stundeTageszeit = tageszeiten[treffer[1].toLowerCase()];
    if (/heute/i.test(treffer[0])) {
      datum = heute;
    }
  }

  // --- Uhrzeit ---
  // "14:30", "um 14:30", "um 14.30", "14.30 Uhr"
  treffer = finde(/\s(?:um |gegen |ab )?(\d{1,2}):(\d{2})(?: ?uhr)?\s/i) ||
            finde(/\s(?:um |gegen |ab )(\d{1,2})\.(\d{2})(?: ?uhr)?\s/i) ||
            finde(/\s(\d{1,2})\.(\d{2}) ?uhr\s/i);
  if (treffer) {
    uhrzeit = alsUhrzeitText(parseInt(treffer[1], 10), parseInt(treffer[2], 10));
  }
  // "um 10 Uhr", "10 Uhr 30", "um zehn"
  if (!uhrzeit) {
    treffer = finde(new RegExp("\\s(?:um |gegen |ab )?" + zahl + " ?uhr(?: (\\d{1,2}))?\\s", "i")) ||
              finde(new RegExp("\\s(?:um |gegen )" + zahl + "\\s", "i"));
    if (treffer) {
      uhrzeit = alsUhrzeitText(alsZahl(treffer[1]), treffer[2] ? parseInt(treffer[2], 10) : 0);
    }
  }
  // "um halb drei", "um Viertel nach acht", "um Viertel vor neun"
  if (!uhrzeit) {
    treffer = finde(new RegExp("\\s(?:um |gegen )?(halb|viertel nach|viertel vor) " + zahl + "\\s", "i"));
    if (treffer) {
      const art = treffer[1].toLowerCase();
      const stunde = alsZahl(treffer[2]);
      if (art === "halb") {
        uhrzeit = alsUhrzeitText(stunde - 1, 30);
      } else if (art === "viertel nach") {
        uhrzeit = alsUhrzeitText(stunde, 15);
      } else {
        uhrzeit = alsUhrzeitText(stunde - 1, 45);
      }
    }
  }

  // Tageszeit mit Uhrzeit verrechnen: "abends um 7" → 19:00
  if (uhrzeit && stundeTageszeit !== null && stundeTageszeit >= 12) {
    const stunde = parseInt(uhrzeit.slice(0, 2), 10);
    if (stunde < 12) {
      uhrzeit = alsUhrzeitText(stunde + 12, parseInt(uhrzeit.slice(3), 10));
    }
  }
  // Ohne Tageszeit: "um halb drei" oder "um 4" ist im Alltag fast immer
  // nachmittags gemeint → 1 bis 5 Uhr wird zu 13 bis 17 Uhr.
  if (uhrzeit && stundeTageszeit === null) {
    const stunde = parseInt(uhrzeit.slice(0, 2), 10);
    if (stunde >= 1 && stunde <= 5) {
      uhrzeit = alsUhrzeitText(stunde + 12, parseInt(uhrzeit.slice(3), 10));
    }
  }
  // Nur Tageszeit ohne Uhrzeit: "morgen Abend" → 19:00
  if (!uhrzeit && stundeTageszeit !== null) {
    uhrzeit = alsUhrzeitText(stundeTageszeit, 0);
  }

  // Wörter, die oft vor einem Datum stehen: "bis Freitag", "am 5. November", "bis zum 3.12."
  const vorDatum = "(?:(?:bis|am|ab|spätestens|zum|vor dem)(?: zum| am| den)? )?";

  // --- Datum ---
  if (!datum && finde(/\sübermorgen\s/i)) {
    datum = plusTage(heute, 2);
  }
  if (!datum && finde(/\sheute\s/i)) {
    datum = heute;
  }
  if (!datum && finde(/\smorgen\s/i)) {
    datum = plusTage(heute, 1);
  }

  // "in 3 Tagen", "in einer Woche", "in zwei Wochen"
  if (!datum) {
    treffer = finde(/\sin (\d{1,2}|einem|einer|zwei|drei|vier|fünf|sechs|sieben|acht|neun|zehn) (tag|tagen|woche|wochen)\s/i);
    if (treffer) {
      let anzahl = alsZahl(treffer[1]);
      if (treffer[2].toLowerCase().startsWith("woche")) {
        anzahl = anzahl * 7;
      }
      datum = plusTage(heute, anzahl);
    }
  }

  // "am 5. November", "5. November 2027"
  if (!datum) {
    treffer = finde(new RegExp("\\s" + vorDatum + "(\\d{1,2})\\.? (" + monate.join("|") + ")(?: (\\d{4}))?\\s", "i"));
    if (treffer) {
      datum = naechstesPassendesDatum(parseInt(treffer[1], 10), monate.indexOf(treffer[2].toLowerCase()), treffer[3], heute);
    }
  }

  // "am 5.11.", "5.11.2027"
  if (!datum) {
    treffer = finde(new RegExp("\\s" + vorDatum + "(\\d{1,2})\\.(\\d{1,2})\\.?(\\d{4})?\\s", "i"));
    if (treffer) {
      datum = naechstesPassendesDatum(parseInt(treffer[1], 10), parseInt(treffer[2], 10) - 1, treffer[3], heute);
    }
  }

  // "nächste Woche" → Montag der nächsten Woche
  if (!datum && finde(/\s(?:nächste|kommende) woche\s/i)) {
    const tageBisMontag = (8 - heute.getDay()) % 7 || 7;
    datum = plusTage(heute, tageBisMontag);
  }

  // "am Freitag", "bis nächsten Montag", "Dienstag"
  if (!datum) {
    treffer = finde(new RegExp("\\s" + vorDatum + "(?:nächsten |nächster |kommenden |diesen )?(" + wochentage.join("|") + ")\\s", "i"));
    if (treffer) {
      const ziel = wochentage.indexOf(treffer[1].toLowerCase());
      const abstand = (ziel - heute.getDay() + 7) % 7 || 7; // heutiger Wochentag → nächste Woche
      datum = plusTage(heute, abstand);
    }
  }

  // "am Wochenende" → nächster Samstag (oder heute, wenn heute Samstag ist)
  if (!datum && finde(/\s(?:am |übers |bis zum )?wochenende\s/i)) {
    datum = plusTage(heute, (6 - heute.getDay() + 7) % 7);
  }

  // --- Titel aufräumen ---
  let titel = rest.replace(/\s+/g, " ").trim();
  // Füllwörter am Anfang oder Ende entfernen, z. B. "bis", "ich muss", "erinnere mich an"
  const fuellAnfang = /^(ich muss|ich soll|ich will|ich möchte|erinnere mich( daran)?|erinnerung|bitte|und|am|um|bis|ab|noch|dann|den|die|der|zum|an)\s+/i;
  const fuellEnde = /\s+(am|um|bis|ab|und|uhr|noch|dann|bitte)$/i;
  let vorher;
  do {
    vorher = titel;
    titel = titel.replace(fuellAnfang, "").replace(fuellEnde, "").replace(/^[\s.:\-–]+|[\s.:\-–]+$/g, "");
  } while (titel !== vorher);
  // Erster Buchstabe groß
  titel = titel.charAt(0).toUpperCase() + titel.slice(1);

  // Kein Datum genannt: heute – oder morgen, wenn die Uhrzeit heute schon vorbei ist
  let faellig = datum;
  if (!faellig) {
    faellig = heute;
    if (uhrzeit && uhrzeit < alsUhrzeitText(jetzt.getHours(), jetzt.getMinutes())) {
      faellig = plusTage(heute, 1);
    }
  }

  return {
    titel: titel.slice(0, 100),
    faellig: alsDatumText(faellig),
    datumErkannt: datum !== null,
    uhrzeit: uhrzeit,
    prioritaet: prioritaet
  };
}

// ---------- 9. Mikrofon im Aufgaben-Formular ----------

const mikroButton = document.getElementById("mikro-button");
const mikroStatus = document.getElementById("mikro-status");

function zeigeMikroStatus(text) {
  mikroStatus.textContent = text;
  mikroStatus.hidden = text === "";
}

// Füllt das Formular aus – speichert aber noch nicht, damit du prüfen kannst.
mikroButton.addEventListener("click", function () {
  hoereZu({
    button: mikroButton,
    beimStart: function () {
      versteckeFehler();
      zeigeMikroStatus("Ich höre zu … sprich jetzt deine Aufgabe.");
    },
    beiText: function (text) {
      titelFeld.value = text.slice(0, 100);
    },
    beiFertig: function (text) {
      const erkannt = versteheSatz(text, new Date());
      titelFeld.value = erkannt.titel || text.slice(0, 100);
      if (erkannt.datumErkannt) {
        faelligFeld.value = erkannt.faellig;
      }
      uhrzeitFeld.value = erkannt.uhrzeit;
      prioritaetFeld.value = erkannt.prioritaet;
      zeigeMikroStatus("Prüfe die Angaben und tippe dann auf „Aufgabe hinzufügen“.");
    },
    beiFehler: zeigeFehler,
    beimEnde: function () {
      zeigeMikroStatus("");
    }
  });
});

// ---------- 10. Sprechen auf der Startseite (NEU in Schritt 4) ----------

const sprachButton = document.getElementById("sprach-button");
const sprachStatus = document.getElementById("sprach-status");
const sprachText = document.getElementById("sprach-text");
const sprachFehler = document.getElementById("sprach-fehler");
const bestaetigung = document.getElementById("bestaetigung");
const bestaetigungDetails = document.getElementById("bestaetigung-details");
const rueckgaengigButton = document.getElementById("rueckgaengig-button");
const zuAufgabenButton = document.getElementById("zu-aufgaben-button");

let letzteSprachAufgabe = null; // für "Rückgängig"

function zeigeSprachFehler(nachricht) {
  sprachFehler.textContent = nachricht;
  sprachFehler.hidden = false;
}

// Fügt der Bestätigung eine Zeile hinzu, z. B. "Wann: Morgen, 10:00 Uhr"
function bestaetigungsZeile(beschriftung, wert, hinweis) {
  const zeile = document.createElement("li");
  zeile.textContent = beschriftung + ": " + wert;
  if (hinweis) {
    const leise = document.createElement("span");
    leise.className = "leise";
    leise.textContent = " " + hinweis;
    zeile.appendChild(leise);
  }
  bestaetigungDetails.appendChild(zeile);
}

function zeigeBestaetigung(aufgabe, datumErkannt) {
  bestaetigungDetails.innerHTML = "";
  bestaetigungsZeile("Titel", aufgabe.titel);
  bestaetigungsZeile("Wann", formatiereTermin(aufgabe), datumErkannt ? "" : "(kein Datum genannt)");
  bestaetigungsZeile("Priorität", prioritaetTexte[aufgabe.prioritaet]);
  bestaetigung.hidden = false;
}

sprachButton.addEventListener("click", function () {
  hoereZu({
    button: sprachButton,
    beimStart: function () {
      sprachFehler.hidden = true;
      bestaetigung.hidden = true;
      sprachText.hidden = true;
      sprachStatus.textContent = "Ich höre zu … tippe noch einmal, wenn du fertig bist.";
    },
    beiText: function (text) {
      sprachText.textContent = "„" + text + "“";
      sprachText.hidden = false;
    },
    beiFertig: function (text) {
      const erkannt = versteheSatz(text, new Date());
      if (erkannt.titel === "") {
        zeigeSprachFehler("Ich habe „" + text + "“ verstanden, aber keinen Titel gefunden. Sag zum Beispiel: „Morgen um 10 Uhr Zahnarzt“.");
        return;
      }
      letzteSprachAufgabe = fuegeAufgabeHinzu(erkannt);
      zeigeBestaetigung(letzteSprachAufgabe, erkannt.datumErkannt);
    },
    beiFehler: zeigeSprachFehler,
    beimEnde: function () {
      sprachStatus.textContent = "Tippen zum Sprechen";
    }
  });
});

// Entfernt die zuletzt per Sprache eingetragene Aufgabe wieder.
rueckgaengigButton.addEventListener("click", function () {
  if (letzteSprachAufgabe) {
    aufgaben = aufgaben.filter(function (aufgabe) {
      return aufgabe.id !== letzteSprachAufgabe.id;
    });
    letzteSprachAufgabe = null;
    aufgabenGeaendert(); // NEU in Schritt 5: auch im Speicher entfernen
  }
  bestaetigung.hidden = true;
  sprachText.hidden = true;
  sprachStatus.textContent = "Rückgängig gemacht. Tippen zum Sprechen";
});

zuAufgabenButton.addEventListener("click", function () {
  wechsleAnsicht("aufgaben");
});

// ---------- 11. Fußball und Quoten (NEU in Schritt 6) ----------

// Die Ligen, die DayFlow kennt. "key" ist der Name bei The Odds API.
// "standard: true" = beim ersten Start ausgewählt.
const LIGEN = [
  { key: "soccer_germany_bundesliga", name: "Bundesliga", standard: true },
  { key: "soccer_epl", name: "Premier League", standard: true },
  { key: "soccer_spain_la_liga", name: "La Liga", standard: true },
  { key: "soccer_italy_serie_a", name: "Serie A", standard: true },
  { key: "soccer_france_ligue_one", name: "Ligue 1", standard: true },
  { key: "soccer_uefa_champs_league", name: "Champions League", standard: true },
  { key: "soccer_uefa_europa_league", name: "Europa League", standard: true },
  { key: "soccer_uefa_europa_conference_league", name: "Conference League", standard: false },
  { key: "soccer_germany_bundesliga2", name: "2. Bundesliga", standard: false },
  { key: "soccer_netherlands_eredivisie", name: "Eredivisie", standard: false },
  { key: "soccer_portugal_primeira_liga", name: "Primeira Liga", standard: false }
];

// Deutsche Angebote in der Liste von The Odds API
const DEUTSCHE_ANBIETER = ["tipico_de", "winamax_de"];

// Ab wann eine Quote "interessant" ist: 3 % über dem fairen Wert,
// und mindestens 5 Buchmacher, damit der Durchschnitt aussagekräftig ist.
const MINDEST_VALUE = 0.03;
const MINDEST_ANBIETER = 5;

const FUSSBALL_EINSTELLUNGEN = "dayflow-fussball-einstellungen";
const FUSSBALL_DATEN = "dayflow-fussball-daten";

// Einstellungen: API-Schlüssel, ausgewählte Ligen, nur deutsche Anbieter?
let fussball = {
  schluessel: "",
  ligen: LIGEN.filter(function (liga) {
    return liga.standard;
  }).map(function (liga) {
    return liga.key;
  }),
  nurDeutsche: false
};

// Zuletzt geladene Spiele: { stand, rest, spiele: [...] } – oder null
let fussballDaten = null;

const quotenButton = document.getElementById("quoten-aktualisieren");
const fussballStand = document.getElementById("fussball-stand");
const fussballEinrichtung = document.getElementById("fussball-einrichtung");
const schluesselFeld = document.getElementById("api-schluessel");
const schluesselSpeichern = document.getElementById("schluessel-speichern");
const fussballFehler = document.getElementById("fussball-fehler");
const tippsBereich = document.getElementById("tipps-bereich");
const tippListe = document.getElementById("tipp-liste");
const tippsLeer = document.getElementById("tipps-leer");
const spieleBereich = document.getElementById("spiele-bereich");
const fussballEinstellungen = document.getElementById("fussball-einstellungen");
const ligaAuswahl = document.getElementById("liga-auswahl");
const nurDeutscheFeld = document.getElementById("nur-deutsche");
const schluesselAendern = document.getElementById("schluessel-aendern");

// Liest einen Wert aus dem localStorage (oder gibt "standard" zurück).
function leseSpeicher(name, standard) {
  try {
    const text = localStorage.getItem(name);
    return text === null ? standard : JSON.parse(text);
  } catch (fehler) {
    return standard;
  }
}

function schreibeSpeicher(name, wert) {
  try {
    localStorage.setItem(name, JSON.stringify(wert));
  } catch (fehler) {
    zeigeMeldung("Speichern hat nicht geklappt. Ist der Speicher voll oder der private Modus aktiv?");
  }
}

function zeigeFussballFehler(nachricht) {
  fussballFehler.textContent = nachricht;
  fussballFehler.hidden = false;
}

function ligaName(key) {
  const liga = LIGEN.find(function (l) {
    return l.key === key;
  });
  return liga ? liga.name : key;
}

// 1.5 → "1,50"
function alsQuote(zahl) {
  return zahl.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Uhrzeit eines Spiels, z. B. "20:45"
function anstossZeit(spiel) {
  return new Date(spiel.start).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
}

// Die API möchte Zeiten wie "2026-11-03T00:00:00Z" – ohne Millisekunden.
function alsApiZeit(datum) {
  return datum.toISOString().slice(0, 19) + "Z";
}

// Macht aus der großen Antwort der API ein kleines Objekt pro Spiel:
// für jeden Buchmacher nur die drei Quoten Heim / Unentschieden / Gast.
function vereinfacheSpiel(ereignis, liga) {
  const quoten = [];
  (ereignis.bookmakers || []).forEach(function (anbieter) {
    const markt = (anbieter.markets || []).find(function (m) {
      return m.key === "h2h"; // h2h = "head to head" = Sieg/Unentschieden/Sieg
    });
    if (!markt) {
      return;
    }
    const eintrag = { key: anbieter.key, name: anbieter.title, heim: 0, unentschieden: 0, gast: 0 };
    markt.outcomes.forEach(function (ausgang) {
      if (ausgang.name === ereignis.home_team) {
        eintrag.heim = ausgang.price;
      } else if (ausgang.name === ereignis.away_team) {
        eintrag.gast = ausgang.price;
      } else {
        eintrag.unentschieden = ausgang.price; // alles andere ist das Unentschieden
      }
    });
    quoten.push(eintrag);
  });

  return {
    id: ereignis.id,
    liga: liga,
    start: ereignis.commence_time,
    heim: ereignis.home_team,
    gast: ereignis.away_team,
    quoten: quoten
  };
}

// Die Analyse eines Spiels:
// 1. Bei jedem Buchmacher die Gewinnspanne herausrechnen → faire Wahrscheinlichkeiten.
// 2. Den Durchschnitt aller Buchmacher bilden (die "Meinung des Marktes").
// 3. Die beste Quote suchen und vergleichen: Value = beste Quote × Wahrscheinlichkeit − 1.
function analysiereSpiel(spiel) {
  const vollstaendig = spiel.quoten.filter(function (q) {
    return q.heim > 1 && q.unentschieden > 1 && q.gast > 1;
  });
  const summe = { heim: 0, unentschieden: 0, gast: 0 };

  vollstaendig.forEach(function (q) {
    const heim = 1 / q.heim;
    const unentschieden = 1 / q.unentschieden;
    const gast = 1 / q.gast;
    const gesamt = heim + unentschieden + gast; // > 1, der Rest ist die Spanne des Buchmachers
    summe.heim += heim / gesamt;
    summe.unentschieden += unentschieden / gesamt;
    summe.gast += gast / gesamt;
  });

  const analyse = { anzahlAnbieter: vollstaendig.length };
  ["heim", "unentschieden", "gast"].forEach(function (tipp) {
    const wahrscheinlichkeit = vollstaendig.length > 0 ? summe[tipp] / vollstaendig.length : null;

    let beste = null;
    vollstaendig.forEach(function (q) {
      if (fussball.nurDeutsche && !DEUTSCHE_ANBIETER.includes(q.key)) {
        return;
      }
      if (!beste || q[tipp] > beste.quote) {
        beste = { quote: q[tipp], anbieter: q.name };
      }
    });

    analyse[tipp] = {
      wahrscheinlichkeit: wahrscheinlichkeit,
      beste: beste,
      value: wahrscheinlichkeit !== null && beste ? beste.quote * wahrscheinlichkeit - 1 : null
    };
  });
  return analyse;
}

function istInteressant(analyse, tipp) {
  return analyse.anzahlAnbieter >= MINDEST_ANBIETER &&
    analyse[tipp].value !== null && analyse[tipp].value >= MINDEST_VALUE;
}

function hatBegonnen(spiel) {
  return new Date(spiel.start) <= new Date();
}

// Text für einen Tipp, z. B. "Sieg Bayern Munich" oder "Unentschieden"
function tippName(spiel, tipp) {
  if (tipp === "heim") {
    return "Sieg " + spiel.heim;
  }
  if (tipp === "gast") {
    return "Sieg " + spiel.gast;
  }
  return "Unentschieden";
}

// Eine der drei Quoten-Boxen (1 / X / 2) eines Spiels
function erstelleQuotenBox(spiel, analyse, tipp, zeichen) {
  const box = document.createElement("div");
  box.className = "quote";
  const daten = analyse[tipp];

  const kopf = document.createElement("span");
  kopf.className = "quote-tipp";
  kopf.textContent = zeichen;
  box.appendChild(kopf);

  const wert = document.createElement("span");
  wert.className = "quote-wert";
  wert.textContent = daten.beste ? alsQuote(daten.beste.quote) : "–";
  box.appendChild(wert);

  const prozent = document.createElement("span");
  prozent.className = "quote-prozent";
  prozent.textContent = daten.wahrscheinlichkeit !== null ? Math.round(daten.wahrscheinlichkeit * 100) + " %" : "";
  box.appendChild(prozent);

  if (daten.beste) {
    box.title = tippName(spiel, tipp) + ": " + alsQuote(daten.beste.quote) + " bei " + daten.beste.anbieter;
  }
  if (!hatBegonnen(spiel) && istInteressant(analyse, tipp)) {
    box.classList.add("value");
  }
  return box;
}

function erstelleSpielEintrag(spiel) {
  const analyse = analysiereSpiel(spiel);
  const eintrag = document.createElement("li");
  eintrag.className = "spiel";
  if (hatBegonnen(spiel)) {
    eintrag.classList.add("begonnen");
  }

  const info = document.createElement("div");
  info.className = "spiel-info";
  const zeit = document.createElement("span");
  zeit.className = "spiel-zeit";
  zeit.textContent = hatBegonnen(spiel) ? "Begonnen" : anstossZeit(spiel) + " Uhr";
  info.appendChild(zeit);
  const teams = document.createElement("p");
  teams.className = "spiel-teams";
  teams.textContent = spiel.heim + " – " + spiel.gast; // Text von außen: immer textContent!
  info.appendChild(teams);
  eintrag.appendChild(info);

  const quoten = document.createElement("div");
  quoten.className = "quoten";
  quoten.appendChild(erstelleQuotenBox(spiel, analyse, "heim", "1"));
  quoten.appendChild(erstelleQuotenBox(spiel, analyse, "unentschieden", "X"));
  quoten.appendChild(erstelleQuotenBox(spiel, analyse, "gast", "2"));
  eintrag.appendChild(quoten);

  return eintrag;
}

// Baut die komplette Fußball-Karte neu auf.
function zeigeFussball() {
  const hatSchluessel = fussball.schluessel !== "";
  fussballEinrichtung.hidden = hatSchluessel;
  quotenButton.hidden = !hatSchluessel;
  fussballEinstellungen.hidden = !hatSchluessel;
  zeigeLigaAuswahl();

  tippsBereich.hidden = true;
  spieleBereich.innerHTML = "";
  fussballStand.hidden = true;

  if (!hatSchluessel || !fussballDaten) {
    return;
  }

  // Nur Spiele der ausgewählten Ligen
  const spiele = fussballDaten.spiele.filter(function (spiel) {
    return fussball.ligen.includes(spiel.liga);
  });

  // Welcher Tag wird gezeigt? Heute – oder der nächste Tag mit Spielen.
  const heute = alsDatumText(new Date());
  const tage = spiele.map(function (spiel) {
    return alsDatumText(new Date(spiel.start));
  }).sort();
  const tag = tage.includes(heute) ? heute : tage.find(function (t) {
    return t > heute;
  });

  // Zeile "Stand"
  const stand = new Date(fussballDaten.stand);
  let standText = "Stand: " + formatiereDatum(alsDatumText(stand)) + ", " +
    stand.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) + " Uhr";
  if (fussballDaten.rest !== null) {
    standText += " · noch " + fussballDaten.rest + " Abrufe übrig";
  }
  fussballStand.textContent = standText;
  fussballStand.hidden = false;

  if (!tag) {
    const leer = document.createElement("p");
    leer.className = "leer-text";
    leer.textContent = "In deinen Ligen sind in den nächsten Tagen keine Spiele angesetzt.";
    spieleBereich.appendChild(leer);
    return;
  }

  const spieleDesTages = spiele
    .filter(function (spiel) {
      return alsDatumText(new Date(spiel.start)) === tag;
    })
    .sort(function (a, b) {
      return a.start < b.start ? -1 : 1;
    });

  // --- Interessante Quoten: die 5 mit dem höchsten Value ---
  const tipps = [];
  spieleDesTages.forEach(function (spiel) {
    if (hatBegonnen(spiel)) {
      return; // laufende Spiele haben Live-Quoten – nicht vergleichbar
    }
    const analyse = analysiereSpiel(spiel);
    ["heim", "unentschieden", "gast"].forEach(function (tipp) {
      if (istInteressant(analyse, tipp)) {
        tipps.push({ spiel: spiel, tipp: tipp, daten: analyse[tipp] });
      }
    });
  });
  tipps.sort(function (a, b) {
    return b.daten.value - a.daten.value;
  });

  tippListe.innerHTML = "";
  tipps.slice(0, 5).forEach(function (t) {
    tippListe.appendChild(erstelleTippEintrag(t));
  });
  tippsLeer.hidden = tipps.length > 0;
  tippsBereich.hidden = false;

  // --- Überschrift: heute oder nächster Spieltag ---
  const ueberschrift = document.createElement("p");
  ueberschrift.className = "unter-titel";
  ueberschrift.textContent = tag === heute
    ? "Spiele heute"
    : "Heute keine Spiele – nächste Spiele: " + formatiereDatum(tag);
  spieleBereich.appendChild(ueberschrift);

  // --- Spiele nach Ligen, aufklappbar ---
  LIGEN.forEach(function (liga) {
    const ligaSpiele = spieleDesTages.filter(function (spiel) {
      return spiel.liga === liga.key;
    });
    if (ligaSpiele.length === 0) {
      return;
    }

    const bereich = document.createElement("details");
    bereich.className = "liga";
    bereich.open = spieleDesTages.length <= 6; // wenige Spiele: gleich aufgeklappt

    const titel = document.createElement("summary");
    titel.textContent = liga.name + " ";
    const anzahl = document.createElement("span");
    anzahl.className = "liga-anzahl";
    anzahl.textContent = "· " + ligaSpiele.length + (ligaSpiele.length === 1 ? " Spiel" : " Spiele");
    titel.appendChild(anzahl);
    bereich.appendChild(titel);

    const liste = document.createElement("ul");
    liste.className = "spiel-liste";
    ligaSpiele.forEach(function (spiel) {
      liste.appendChild(erstelleSpielEintrag(spiel));
    });
    bereich.appendChild(liste);
    spieleBereich.appendChild(bereich);
  });
}

function erstelleTippEintrag(t) {
  const eintrag = document.createElement("li");
  eintrag.className = "tipp";

  const text = document.createElement("div");
  text.className = "tipp-text";

  const wette = document.createElement("p");
  wette.className = "tipp-wette";
  wette.textContent = tippName(t.spiel, t.tipp) + " · " + alsQuote(t.daten.beste.quote) + " bei " + t.daten.beste.anbieter;
  text.appendChild(wette);

  const spiel = document.createElement("p");
  spiel.className = "tipp-spiel";
  spiel.textContent = t.spiel.heim + " – " + t.spiel.gast + " · " + anstossZeit(t.spiel) + " Uhr · " +
    ligaName(t.spiel.liga) + " · fairer Wert " + alsQuote(1 / t.daten.wahrscheinlichkeit);
  text.appendChild(spiel);

  // Sehr große Abweichungen sind oft veraltete oder fehlerhafte Quoten
  if (t.daten.value > 0.15) {
    const warnung = document.createElement("p");
    warnung.className = "tipp-warnung";
    warnung.textContent = "Ungewöhnlich hoch – vielleicht veraltet. Prüfe die Quote direkt beim Anbieter.";
    text.appendChild(warnung);
  }
  eintrag.appendChild(text);

  const abzeichen = document.createElement("span");
  abzeichen.className = "value-abzeichen";
  abzeichen.textContent = "+" + Math.round(t.daten.value * 100) + " %";
  eintrag.appendChild(abzeichen);

  return eintrag;
}

// Häkchen für jede Liga in den Einstellungen
function zeigeLigaAuswahl() {
  ligaAuswahl.innerHTML = "";
  LIGEN.forEach(function (liga) {
    const beschriftung = document.createElement("label");
    beschriftung.className = "liga-option";
    const feld = document.createElement("input");
    feld.type = "checkbox";
    feld.checked = fussball.ligen.includes(liga.key);
    feld.addEventListener("change", function () {
      if (feld.checked) {
        fussball.ligen.push(liga.key);
      } else {
        fussball.ligen = fussball.ligen.filter(function (key) {
          return key !== liga.key;
        });
      }
      schreibeSpeicher(FUSSBALL_EINSTELLUNGEN, fussball);
      zeigeFussball();
    });
    beschriftung.appendChild(feld);
    beschriftung.appendChild(document.createTextNode(liga.name));
    ligaAuswahl.appendChild(beschriftung);
  });
  nurDeutscheFeld.checked = fussball.nurDeutsche;
}

// Macht aus einer Fehler-Antwort der API einen verständlichen Satz.
async function quotenFehlerText(antwort) {
  let info = {};
  try {
    info = await antwort.json();
  } catch (fehler) {
    // keine lesbare Antwort – dann bleibt "info" leer
  }
  if (info.error_code === "INVALID_KEY") {
    return "Dein API-Schlüssel ist ungültig. Tippe in den Einstellungen auf „API-Schlüssel ändern“.";
  }
  if (antwort.status === 401 || antwort.status === 429) {
    return "Der Quoten-Dienst hat den Abruf abgelehnt – vermutlich sind deine Abrufe für diesen Monat aufgebraucht. (" +
      (info.message || "Fehler " + antwort.status) + ")";
  }
  return "Die Quoten konnten nicht geladen werden (Fehler " + antwort.status + "). Versuch es später noch einmal.";
}

// Holt die aktuellen Quoten für alle ausgewählten Ligen.
// "async" bedeutet: Diese Funktion darf auf Antworten aus dem Internet warten ("await").
async function ladeQuoten() {
  if (fussball.ligen.length === 0) {
    zeigeFussballFehler("Wähle in den Einstellungen mindestens eine Liga aus.");
    return;
  }

  fussballFehler.hidden = true;
  quotenButton.disabled = true;
  quotenButton.textContent = "Lädt …";

  // Spiele von heute 0 Uhr bis in 8 Tagen
  const heute = new Date();
  heute.setHours(0, 0, 0, 0);
  const von = alsApiZeit(heute);
  const bis = alsApiZeit(plusTage(heute, 8));

  const neueSpiele = [];
  let rest = null;

  try {
    for (let i = 0; i < fussball.ligen.length; i++) {
      const liga = fussball.ligen[i];
      const adresse = "https://api.the-odds-api.com/v4/sports/" + liga + "/odds/" +
        "?apiKey=" + encodeURIComponent(fussball.schluessel) +
        "&regions=eu&markets=h2h&oddsFormat=decimal&dateFormat=iso" +
        "&commenceTimeFrom=" + von + "&commenceTimeTo=" + bis;

      const antwort = await fetch(adresse); // warten, bis die Antwort da ist
      if (!antwort.ok) {
        throw new Error(await quotenFehlerText(antwort));
      }
      const ereignisse = await antwort.json();
      rest = antwort.headers.get("x-requests-remaining") || rest;

      ereignisse.forEach(function (ereignis) {
        neueSpiele.push(vereinfacheSpiel(ereignis, liga));
      });
    }

    fussballDaten = { stand: new Date().toISOString(), rest: rest, spiele: neueSpiele };
    schreibeSpeicher(FUSSBALL_DATEN, fussballDaten);
  } catch (fehler) {
    // TypeError bedeutet hier: Es kam gar keine Antwort (z. B. kein Internet)
    if (fehler instanceof TypeError) {
      zeigeFussballFehler("Keine Verbindung zum Quoten-Dienst. Bist du online?");
    } else {
      zeigeFussballFehler(fehler.message);
    }
  }

  quotenButton.disabled = false;
  quotenButton.textContent = "Aktualisieren";
  zeigeFussball();
}

quotenButton.addEventListener("click", ladeQuoten);

schluesselSpeichern.addEventListener("click", function () {
  const schluessel = schluesselFeld.value.trim();
  if (schluessel === "" || schluessel.includes(" ")) {
    zeigeFussballFehler("Bitte füge deinen API-Schlüssel aus der E-Mail ein (ohne Leerzeichen).");
    return;
  }
  fussball.schluessel = schluessel;
  schreibeSpeicher(FUSSBALL_EINSTELLUNGEN, fussball);
  zeigeFussball();
  ladeQuoten();
});

schluesselAendern.addEventListener("click", function () {
  schluesselFeld.value = fussball.schluessel;
  fussballEinrichtung.hidden = false;
  fussballEinstellungen.open = false;
});

nurDeutscheFeld.addEventListener("change", function () {
  fussball.nurDeutsche = nurDeutscheFeld.checked;
  schreibeSpeicher(FUSSBALL_EINSTELLUNGEN, fussball);
  zeigeFussball();
});

// Beim Start: Einstellungen und letzte Quoten laden.
// Automatisch neu abrufen nur, wenn die Quoten nicht von heute sind –
// so reichen die 500 kostenlosen Abrufe für den ganzen Monat.
function starteFussball() {
  const gespeichert = leseSpeicher(FUSSBALL_EINSTELLUNGEN, null);
  if (gespeichert) {
    fussball.schluessel = gespeichert.schluessel || "";
    fussball.ligen = Array.isArray(gespeichert.ligen) ? gespeichert.ligen : fussball.ligen;
    fussball.nurDeutsche = gespeichert.nurDeutsche === true;
  }
  fussballDaten = leseSpeicher(FUSSBALL_DATEN, null);
  if (fussballDaten && !Array.isArray(fussballDaten.spiele)) {
    fussballDaten = null; // unbrauchbare Daten ignorieren
  }

  zeigeFussball();

  const vonHeute = fussballDaten && alsDatumText(new Date(fussballDaten.stand)) === alsDatumText(new Date());
  if (fussball.schluessel && !vonHeute) {
    ladeQuoten();
  }
}

// ---------- 12. Start ----------

aufgaben = ladeAufgaben(); // NEU in Schritt 5: gespeicherte Aufgaben holen
zeigeDatumUndBegruessung();
zeigeAlles();
starteFussball(); // NEU in Schritt 6

// Jede Minute aktualisieren – so stimmen Gruß, Datum, "Als Nächstes"
// und "Überfällig" auch, wenn die App lange offen bleibt.
setInterval(function () {
  zeigeDatumUndBegruessung();
  zeigeAlles();
}, 60 * 1000);
