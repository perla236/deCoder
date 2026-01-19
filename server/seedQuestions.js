// server/seedQuestions.js
import sqlite3 from "sqlite3";
import { open } from "sqlite";

(async () => {
  const db = await open({
    filename: "./db.sqlite",
    driver: sqlite3.Database,
  });

  const questions = [
    {
      question: "Koliko je 2 + 2?",
      type: "text_input",
      options: null,
      answer: "4",
    },
    {
      question: "Glavni grad Hrvatske je?",
      type: "multiple_choice",
      options: JSON.stringify(["Zagreb", "Split", "Rijeka"]),
      answer: "Zagreb",
    },
    {
      question: "Nadopuni: React je ___ library.",
      type: "fill_blank",
      options: null,
      answer: "JavaScript",
    },
    {
      question: "Povuci i spusti: Najveći planet?",
      type: "drag_drop",
      options: JSON.stringify(["Mars", "Zemlja", "Jupiter"]),
      answer: "Jupiter",
    },
    {
      question: "Koliko je 5 * 6?",
      type: "text_input",
      options: null,
      answer: "30",
    },
    {
      question: "Koja boja nastaje miješanjem plave i žute?",
      type: "multiple_choice",
      options: JSON.stringify(["Zelena", "Ljubičasta", "Narančasta"]),
      answer: "Zelena",
    },
    {
      question: "Nadopuni: Sunce je ___ sustav zvijezda.",
      type: "fill_blank",
      options: null,
      answer: "središnji",
    },
    {
      question: "Povuci i spusti: Najmanji kontinent?",
      type: "drag_drop",
      options: JSON.stringify(["Afrika", "Europa", "Australija"]),
      answer: "Australija",
    },
    {
      question: "Koliko je 10 / 2?",
      type: "text_input",
      options: null,
      answer: "5",
    },
    {
      question: "Koji je najveći ocean?",
      type: "multiple_choice",
      options: JSON.stringify(["Atlantski", "Tihi", "Indijski"]),
      answer: "Tihi",
    },
    {
      question: "Nadopuni: Voda je ___ na sobnoj temperaturi.",
      type: "fill_blank",
      options: null,
      answer: "tekućina",
    },
    {
      question: "Povuci i spusti: Najduža rijeka?",
      type: "drag_drop",
      options: JSON.stringify(["Nil", "Amazon", "Dunav"]),
      answer: "Amazon",
    },
    {
      question: "Koliko je 9 - 3?",
      type: "text_input",
      options: null,
      answer: "6",
    },
    {
      question: "Koja životinja je kralj džungle?",
      type: "multiple_choice",
      options: JSON.stringify(["Tigar", "Lav", "Slon"]),
      answer: "Lav",
    },
    {
      question: "Nadopuni: Zemlja ima ___ mjeseca.",
      type: "fill_blank",
      options: null,
      answer: "1",
    },
    {
      question: "Povuci i spusti: Najbrža kopnena životinja?",
      type: "drag_drop",
      options: JSON.stringify(["Cheetah", "Leopard", "Konj"]),
      answer: "Cheetah",
    },
    {
      question: "Koliko je 7 + 8?",
      type: "text_input",
      options: null,
      answer: "15",
    },
    {
      question: "Koja država ima oblik čizme?",
      type: "multiple_choice",
      options: JSON.stringify(["Italija", "Španjolska", "Grčka"]),
      answer: "Italija",
    },
    {
      question: "Nadopuni: Glavni grad Francuske je ___",
      type: "fill_blank",
      options: null,
      answer: "Pariz",
    },
    {
      question: "Povuci i spusti: Najviša planina?",
      type: "drag_drop",
      options: JSON.stringify(["Everest", "Kilimanjaro", "Mont Blanc"]),
      answer: "Everest",
    },
    {
      question: "Koliko je 12 / 4?",
      type: "text_input",
      options: null,
      answer: "3",
    },
    {
      question: "Koji je kemijski simbol za zlato?",
      type: "multiple_choice",
      options: JSON.stringify(["Au", "Ag", "Fe"]),
      answer: "Au",
    },
    {
      question: "Nadopuni: Vjetar se mjeri ___",
      type: "fill_blank",
      options: null,
      answer: "anemometrom",
    },
    {
      question: "Povuci i spusti: Najpoznatiji crtani miš?",
      type: "drag_drop",
      options: JSON.stringify(["Mickey", "Donald", "Goofy"]),
      answer: "Mickey",
    },
    {
      question: "Koliko je 15 - 7?",
      type: "text_input",
      options: null,
      answer: "8",
    },
    {
      question: "Koja planeta je crvena?",
      type: "multiple_choice",
      options: JSON.stringify(["Mars", "Venera", "Jupiter"]),
      answer: "Mars",
    },
    {
      question: "Nadopuni: Pi približno iznosi ___",
      type: "fill_blank",
      options: null,
      answer: "3.14",
    },
    {
      question: "Povuci i spusti: Simbol kemijskog elementa za vodik?",
      type: "drag_drop",
      options: JSON.stringify(["H", "O", "C"]),
      answer: "H",
    },
    {
      question: "Koliko je 20 / 5?",
      type: "text_input",
      options: null,
      answer: "4",
    },
    {
      question: "Koja ptica ne može letjeti?",
      type: "multiple_choice",
      options: JSON.stringify(["Pingvin", "Golub", "Orao"]),
      answer: "Pingvin",
    },
    {
      question: "Nadopuni: Najveći ocean na svijetu je ___",
      type: "fill_blank",
      options: null,
      answer: "Tihi",
    },
    {
      question: "Povuci i spusti: Najpoznatiji čarobnjak iz Hogwartsa?",
      type: "drag_drop",
      options: JSON.stringify(["Harry", "Hermiona", "Ron"]),
      answer: "Harry",
    },
  ];

  for (const q of questions) {
    await db.run(
      "INSERT INTO questions (question, type, options, answer) VALUES (?, ?, ?, ?)",
      [q.question, q.type, q.options, q.answer]
    );
  }

  console.log("30 pitanja dodano u bazu!");
  process.exit(0);
})();
