// Published Google Sheet CSV link
console.log("main.js is loaded!");
const sheetCsvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSe_o01hyzHRGRPjeXlPNTdtYLyHr7JVLOh21fd40NUVJgkWcHNVjHNoilj3rzKMZj7B2J6453J_otO/pub?gid=0&single=true&output=csv";
let allTricks = [];
    

// Function to convert YouTube links (regular, shorts, youtu.be) to embed format
function getEmbedLink(url) {
    if (!url) return "";
    if (url.includes("watch?v=")) return url.replace("watch?v=", "embed/");
    if (url.includes("youtu.be/")) return url.replace("youtu.be/", "www.youtube.com/embed/");
    if (url.includes("/shorts/")) return url.replace("/shorts/", "/embed/");
    return url;
}
//Function to convert Google Drive links to direct download format
function getDriveDownloadLink(url) {
  if (!url) return "";
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  return match ? `https://drive.google.com/uc?export=download&id=${match[1]}` : "";
}

// Function to fetch CSV and convert to JSON
async function fetchTricks() {
  const response = await fetch(sheetCsvUrl);
  const csvText = await response.text();

  return new Promise(resolve => {
    Papa.parse(csvText, {
      header: true,        // first row is headers
      skipEmptyLines: true,
      complete: function(results) {
        // trim all values
        const tricks = results.data.map(row => {
          Object.keys(row).forEach(key => {
            if (row[key]) row[key] = row[key].trim();
            else row[key] = ""; // ensure empty cells are empty strings
          });
          return row;
        });
        resolve(tricks);
      }
    });
  });
}

function createTrickCard(trick) {
  //const container = document.getElementById("tricks-container");
  const card = document.createElement("div");
  const driveDownload = getDriveDownloadLink(trick.DriveLink);
  card.className = "trick-card";
  const tagsArray = trick.Etiquetes
    ? trick.Etiquetes.split(' ').map(tag => tag.trim()).filter(tag => tag.length > 0)
    : [];


  card.innerHTML = `
    <div class="trick-header">
      <h2>${trick.Nom}</h2>
      <span class="tag-badge difficulty">${trick.Dificultat}</span>
    </div>
    <p></strong> ${tagsArray.map(tag => `<span class="tag-badge">${tag}</span>`).join(' ')}
    </p>
    <p><em>${trick.Notes}</em></p>
    <iframe src="${getEmbedLink(trick.link)}" allowfullscreen></iframe> 
    ${driveDownload ? `
    <div class="download-container">
    <a href="${driveDownload}" class="download-btn" download>📥 Descarrega el vídeo</a></div>` : ""}
    `;

  return card;
}
function displayTricks(tricks) {
  const container = document.getElementById("tricks-container");
  container.innerHTML = ""; // Clear previous cards

  tricks.forEach(trick => {
    const card = createTrickCard(trick);
    container.appendChild(card);
  });
}
function createAlphabetBar(tricks) {
  const alphabetBar = document.getElementById("alphabet-bar");
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const showAllBtn = document.createElement("button");
  showAllBtn.textContent = "Tots";
  showAllBtn.addEventListener("click", () => {
    document.querySelectorAll(".line-button").forEach(b => b.classList.remove("active"));
    showAllBtn.classList.add("active");
    //displayTricks(allTricks);
    selectedLetter = "All";           // special case
    filterAndDisplay();
  });
  alphabetBar.appendChild(showAllBtn);
  letters.forEach(letter => {
    const btn = document.createElement("button");
    btn.textContent = letter;
    btn.addEventListener("click", () => {
      document.querySelectorAll(".line-button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      // Filter tricks by first letter of 'Nom'
      //const filtered = tricks.filter(t => t.Nom && t.Nom.toUpperCase().startsWith(letter));
      //displayTricks(filtered);
      selectedLetter = btn.textContent; // store selected letter
      filterAndDisplay();    
    });
    alphabetBar.appendChild(btn);
  });
}

// Keep track of selected difficulties
let selectedDifficulties = new Set();
let selectedLetter = null;
let selectedTags = new Set();

function filterAndDisplay() {
  let filtered = allTricks;

  // Filter by letter if one is selected
  if (selectedLetter && selectedLetter !== "All") {
    filtered = filtered.filter(t => t.Nom && t.Nom.toUpperCase().startsWith(selectedLetter));
  }

  // Filter by selected difficulties
  if (selectedDifficulties.size > 0) {
    filtered = filtered.filter(t => selectedDifficulties.has(t.Dificultat));
  }
if (selectedTags.size > 0) {
  filtered = filtered.filter(t => {
    if (!t.Etiquetes) return false;
    const trickTags = t.Etiquetes.split(/\s+/).map(tag => tag.trim()).filter(Boolean);
    return trickTags.some(tag => selectedTags.has(tag));
  });
}

  displayTricks(filtered);
}
function createDifficultyMenu(tricks) {
  const container = document.getElementById("difficulty-menu");

  // Get all unique difficulties from your sheet
  const difficultyOrder = ["Fàcil", "Mitjà", "Difícil"];
  const difficulties = Array.from(new Set(tricks.map(t => t.Dificultat).filter(Boolean)))
                          .sort((a, b) => difficultyOrder.indexOf(a) - difficultyOrder.indexOf(b));

  difficulties.forEach(diff => {
    const btn = document.createElement("button");
    btn.textContent = diff;
    
    btn.addEventListener("click", () => {
      // Toggle selection
      if (selectedDifficulties.has(diff)) {
        selectedDifficulties.delete(diff);
        btn.classList.remove("active");
      } else {
        selectedDifficulties.add(diff);
        btn.classList.add("active");
      }
      filterAndDisplay();
    });

    container.appendChild(btn);
  });
}

function createTagMenu(tricks) {
  const container = document.getElementById("tags-menu");
  container.innerHTML = "";

  // Get all unique single-word tags
  const allTags = Array.from(new Set(
    tricks.flatMap(t => t.Etiquetes 
      ? t.Etiquetes.split(/\s+/).map(tag => tag.trim()).filter(Boolean)
      : []
  )));

  allTags.forEach(tag => {
    const btn = document.createElement("button");
    btn.textContent = tag;

    btn.addEventListener("click", () => {
      if (selectedTags.has(tag)) {
        selectedTags.delete(tag);
        btn.classList.remove("active");
      } else {
        selectedTags.add(tag);
        btn.classList.add("active");
      }
      filterAndDisplay();
    });

    container.appendChild(btn);
  });
}


async function init() {
  const tricks = await fetchTricks();
  console.log(tricks); // <-- check all objects, especially Etiquetes
  allTricks = tricks;
  displayTricks(tricks);
  createAlphabetBar(tricks);
  createDifficultyMenu(tricks);
  createTagMenu(tricks);
  console.log(tricks);

}


document.addEventListener("DOMContentLoaded", () => {
init();
});