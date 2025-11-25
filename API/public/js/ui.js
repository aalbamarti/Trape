// js/ui.js
import { filterTricks, selectedDifficulties, selectedLetter, selectedTags } from "./filters.js";
import { createTrickCard } from "./tricks.js";
import { updateProgress, fetchProgress } from "./api.js";

export function displayTricks(tricks) {
  const container = document.getElementById("tricks-container");
  container.innerHTML = "";
  tricks.forEach(trick => container.appendChild(createTrickCard(trick)));
  //setupProgressListeners();
  setupProgressBar();
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


export async function setupProgressBar() {
  const progressMap = await fetchProgress(); // { [trick_id]: status }

  // Attach listeners and set initial state
  document.querySelectorAll(".progress-bar").forEach(bar => {
    const trick_id = bar.dataset.trickId;
    const options = Array.from(bar.querySelectorAll(".progress-option"));

    // Set initial active state if saved
    const saved = progressMap[trick_id];
    if (saved) {
      options.forEach(o => o.classList.toggle("active", o.dataset.status === saved));
    } else {
      // ensure none active
      options.forEach(o => o.classList.remove("active"));
    }

    // Remove existing listeners (safe if re-run)
    options.forEach(o => {
      const newEl = o.cloneNode(true);
      o.parentNode.replaceChild(newEl, o);
    });

    const freshOptions = Array.from(bar.querySelectorAll(".progress-option"));

    // Click behavior
    freshOptions.forEach(option => {
      option.addEventListener("click", async (e) => {
        const status = option.dataset.status;

        // optimistic UI: update the visuals first
        freshOptions.forEach(o => o.classList.remove("active"));
        option.classList.add("active");

        try {
          await updateProgress(trick_id, status);
        } catch (err) {
          console.error("Failed to update progress:", err);
          // rollback visual change on error
          freshOptions.forEach(o => o.classList.remove("active"));
          const prev = progressMap[trick_id];
          if (prev) {
            const prevEl = bar.querySelector(`.progress-option[data-status="${prev}"]`);
            if (prevEl) prevEl.classList.add("active");
          }
          alert("Error guardant el progrés");
        }
      });
    });
  });
}
