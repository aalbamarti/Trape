// js/main.js
import { fetchTricks } from "./api.js";
import { filterTricks } from "./filters.js";
import { displayTricks, setupAlphabetBar, setupDifficultyMenu, setupTagsMenu } from "./ui.js";

let allTricks = [];

async function refresh() {
  displayTricks(filterTricks(allTricks));
}

async function init() {
  allTricks = await fetchTricks();

  displayTricks(allTricks);

  setupAlphabetBar(allTricks, refresh);
  setupDifficultyMenu(allTricks, refresh);
  setupTagsMenu(allTricks, refresh);
}

document.addEventListener("DOMContentLoaded", init);

import { openModal, closeModal, login, register, logout, getToken } from "./auth.js";

function setupAuthUI() {
  const loginBtn = document.getElementById("login-btn");
  const userInfo = document.getElementById("user-info");

  // If user is logged in
  const token = getToken();
  if (token) {
    loginBtn.classList.add("hidden");
    userInfo.classList.remove("hidden");
    userInfo.innerHTML = `
      Sessió iniciada
      <button id="logout-btn">Sortir</button>
    `;

    document.getElementById("logout-btn").onclick = () => logout();
    return;
  }

  // If user is NOT logged in
  loginBtn.onclick = () => openModal("login-modal");

  // Close modals
  document.getElementById("close-login").onclick = () => closeModal("login-modal");
  document.getElementById("close-register").onclick = () => closeModal("register-modal");

  // Switch to register
  document.getElementById("open-register").onclick = () => {
    closeModal("login-modal");
    openModal("register-modal");
  };

  // Login submit
  document.getElementById("login-submit").onclick = async () => {
    const u = document.getElementById("login-username").value;
    const p = document.getElementById("login-password").value;
    try {
      await login(u, p);
      closeModal("login-modal");
      location.reload();
    } catch (e) {
      alert(e.message);
    }
  };

  // Register submit
  document.getElementById("register-submit").onclick = async () => {
    const u = document.getElementById("register-username").value;
    const p = document.getElementById("register-password").value;
    try {
      await register(u, p);
      closeModal("register-modal");
      openModal("login-modal");
    } catch (e) {
      alert(e.message);
    }
  };
}

document.addEventListener("DOMContentLoaded", () => {
  init();          // your existing trick loading
  setupAuthUI();   // new auth UI setup
});
