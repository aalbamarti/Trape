// js/ui.js
import { filterTricks, selectedDifficulties, selectedLetter, selectedTags } from "./filters.js";
import { createTrickCard } from "./tricks.js";

export function displayTricks(tricks) {
  const container = document.getElementById("tricks-container");
  container.innerHTML = "";
  tricks.forEach(trick => container.appendChild(createTrickCard(trick)));
}

export function setupAlphabetBar(tricks, refresh) {
  const container = document.getElementById("alphabet-bar");
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const showAll = document.createElement("button");
  showAll.textContent = "Tots";
  showAll.onclick = () => {
    document.querySelectorAll(".line-bar button").forEach(b => b.classList.remove("active"));
    showAll.classList.add("active");
    selectedLetter = "All";
    refresh();
  };
  container.appendChild(showAll);

  letters.forEach(letter => {
    const btn = document.createElement("button");
    btn.textContent = letter;

    btn.onclick = () => {
      document.querySelectorAll(".line-bar button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectedLetter = letter;
      refresh();
    };

    container.appendChild(btn);
  });
}

export function setupDifficultyMenu(tricks, refresh) {
  const container = document.getElementById("difficulty-menu");
  const difficultyOrder = ["Fàcil", "Mitjà", "Difícil"];

  const diffs = [...new Set(tricks.map(t => t.difficulty))].sort(
    (a, b) => difficultyOrder.indexOf(a) - difficultyOrder.indexOf(b)
  );

  diffs.forEach(diff => {
    const btn = document.createElement("button");
    btn.textContent = diff;

    btn.onclick = () => {
      if (selectedDifficulties.has(diff)) {
        selectedDifficulties.delete(diff);
        btn.classList.remove("active");
      } else {
        selectedDifficulties.add(diff);
        btn.classList.add("active");
      }
      refresh();
    };

    container.appendChild(btn);
  });
}

export function setupTagsMenu(tricks, refresh) {
  const container = document.getElementById("tags-menu");

  const allTags = [...new Set(
    tricks.flatMap(t => t.tags ? t.tags.split(/\s+/) : [])
  )];

  allTags.forEach(tag => {
    const btn = document.createElement("button");
    btn.textContent = tag;

    btn.onclick = () => {
      if (selectedTags.has(tag)) {
        selectedTags.delete(tag);
        btn.classList.remove("active");
      } else {
        selectedTags.add(tag);
        btn.classList.add("active");
      }
      refresh();
    };

    container.appendChild(btn);
  });
}
