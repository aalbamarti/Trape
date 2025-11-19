// js/filters.js
export let selectedLetter = null;
export let selectedDifficulties = new Set();
export let selectedTags = new Set();

export function filterTricks(tricks) {
  let filtered = tricks;

  if (selectedLetter && selectedLetter !== "All") {
    filtered = filtered.filter(t => t.Nom && t.Nom.toUpperCase().startsWith(selectedLetter));
  }

  if (selectedDifficulties.size > 0) {
    filtered = filtered.filter(t => selectedDifficulties.has(t.difficulty));
  }

  if (selectedTags.size > 0) {
    filtered = filtered.filter(t => {
      if (!t.tags) return false;
      const trickTags = t.tags.split(/\s+/).map(tag => tag.trim());
      return trickTags.some(tag => selectedTags.has(tag));
    });
  }

  return filtered;
}
