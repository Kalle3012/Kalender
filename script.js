// =========================================
// DayFlow – Funktionen (Schritt 4)
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
// Achtung: Noch gehen sie beim Neuladen verloren (Speichern folgt später).
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
const uhrzeitFeld = document.getElementById("aufgabe-uhrzeit"); // NEU in Schritt 4
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

// NEU in Schritt 4: Datum und (falls vorhanden) Uhrzeit als ein Text
function formatiereTermin(aufgabe) {
  let text = formatiereDatum(aufgabe.faellig);
  if (aufgabe.uhrzeit) {
    text += ", " + aufgabe.uhrzeit + " Uhr";
  }
  return text;
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
    faellig.textContent = "Fällig: " + formatiereTermin(aufgabe);
    info.appendChild(faellig);

    const prioritaet = document.createElement("span");
    prioritaet.className = "etikett prio-" + aufgabe.prioritaet;
    prioritaet.textContent = "Priorität: " + prioritaetTexte[aufgabe.prioritaet];
    info.appendChild(prioritaet);

    eintrag.appendChild(info);
    liste.appendChild(eintrag);
  });
}

// NEU in Schritt 4: Legt eine Aufgabe an. Wird vom Formular UND
// von der Spracheingabe auf der Startseite benutzt.
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
  zeigeAufgaben();
  return neueAufgabe;
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

// ---------- 4. Spracheingabe (NEU in Schritt 3, umgebaut in Schritt 4) ----------

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

// ---------- 5. Sätze verstehen (NEU in Schritt 4) ----------

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

// ---------- 6. Mikrofon im Aufgaben-Formular ----------

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

// ---------- 7. Sprechen auf der Startseite (NEU in Schritt 4) ----------

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

// Fügt der Bestätigung eine Zeile hinzu, z. B. "Wann: Fr., 30. Okt. 2026, 10:00 Uhr"
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
    zeigeAufgaben();
  }
  bestaetigung.hidden = true;
  sprachText.hidden = true;
  sprachStatus.textContent = "Rückgängig gemacht. Tippen zum Sprechen";
});

zuAufgabenButton.addEventListener("click", function () {
  wechsleAnsicht("aufgaben");
});

// ---------- 8. Start ----------

zeigeDatumUndBegruessung();
zeigeAufgaben();

// Jede Minute aktualisieren – so stimmen Gruß und Datum auch,
// wenn die App lange offen bleibt (z. B. über Mitternacht).
setInterval(zeigeDatumUndBegruessung, 60 * 1000);
