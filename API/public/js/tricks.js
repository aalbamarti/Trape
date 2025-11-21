// js/tricks.js

export function getEmbedLink(url) {
  if (!url) return "";
  if (url.includes("watch?v=")) return url.replace("watch?v=", "embed/");
  if (url.includes("youtu.be/")) return url.replace("youtu.be/", "www.youtube.com/embed/");
  if (url.includes("/shorts/")) return url.replace("/shorts/", "/embed/");
  return url;
}

export function getDriveDownloadLink(url) {
  if (!url) return "";
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  return match ? `https://drive.google.com/uc?export=download&id=${match[1]}` : "";
}

export function createTrickCard(trick) {
  const card = document.createElement("div");
  const driveDownload = getDriveDownloadLink(trick.drive_link);
  card.className = "trick-card";

  const tagsArray = trick.tags
    ? trick.tags.split(' ').map(tag => tag.trim()).filter(tag => tag.length > 0)
    : [];

  card.innerHTML = `
    <div class="trick-header">
      <h2>${trick.name}</h2>
      <span class="tag-badge difficulty">${trick.difficulty}</span>
    </div>
    <p>${tagsArray.map(tag => `<span class="tag-badge">${tag}</span>`).join(' ')}</p>
    <iframe src="${getEmbedLink(trick.youtube_link)}" allowfullscreen></iframe> 
    <div class="progress-status" data-trick-id="${trick.id}"> <span class="status-icon" title="Sense progrés">⚪</span> </div>
    ${driveDownload ? `
    <div class="download-container">
      <a href="${driveDownload}" class="download-btn" download>📥 Descarrega el vídeo</a>
    </div>` : ""}
  `;

  return card;
}
