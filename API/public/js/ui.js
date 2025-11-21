// js/ui.js
import { filterTricks, selectedDifficulties, selectedLetter, selectedTags } from "./filters.js";
import { createTrickCard } from "./tricks.js";

export function displayTricks(tricks) {
  const container = document.getElementById("tricks-container");
  container.innerHTML = "";
  tricks.forEach(trick => container.appendChild(createTrickCard(trick)));
  setupProgressListeners();
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

export function setupProgressListeners() {
  document.querySelectorAll(".progress-status").forEach(container => {
    const trickId = container.dataset.trickId;
    const icon = container.querySelector(".status-icon");

    // 1. Create the horizontal menu dynamically
    const menu = document.createElement("div");
    menu.className = "status-menu";
    menu.innerHTML = `
      <span data-status="objective" title="Objectiu">🎯</span>
      <span data-status="learning" title="Procés">🟡</span>
      <span data-status="mastered" title="Aconseguit">🟢</span>
    `;
    container.appendChild(menu);

    // 2. Toggle menu on click of the emoji icon
    icon.addEventListener("click", () => {
      menu.classList.toggle("show"); // <-- your first snippet goes here
    });

    // 3. Select an option
    menu.querySelectorAll("span").forEach(option => {
      option.addEventListener("click", async (e) => {
        const newStatus = e.target.dataset.status;

        try {
          await updateProgress(trickId, newStatus); // API call
          icon.textContent = e.target.textContent;   // update emoji
          menu.classList.remove("show");             // hide menu after click
        } catch (err) {
          alert("Error guardant el progrés");
        }
      });
    });

    // 4. Close the menu if user clicks outside
    document.addEventListener("click", e => {      // <-- second snippet goes here
      if (!container.contains(e.target)) {
        menu.classList.remove("show");
      }
    });
  });
}
