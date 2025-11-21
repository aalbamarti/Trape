import { fetchTricks } from "./api.js";
import { filterTricks } from "./filters.js";
import { displayTricks, setupAlphabetBar, setupDifficultyMenu, setupTagsMenu } from "./ui.js";
import { login, register, logout, getToken} from "./auth.js";

console.log("main.js loaded");

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

// -------------------------------------------
// AUTH UI LOGIC
// -------------------------------------------
function setupAuthUI() {
  console.log("setupAuthUI() called");

  const overlay = document.getElementById("auth-overlay");
  const loginBtn = document.getElementById("login-submit");
  const registerBtn = document.getElementById("register-submit");

  // Debug logs
  console.log("overlay =", overlay);
  console.log("loginBtn =", loginBtn);
  console.log("registerBtn =", registerBtn);

  // ---------------------------------------
  // Check that buttons exist
  // ---------------------------------------
  if (!overlay || !loginBtn || !registerBtn) {
    console.error("❌ ERROR: Auth elements not found in HTML.");
    return;
  }

  function showContentAfterLogin() {
    const overlay = document.getElementById("auth-overlay");
    overlay.classList.add("hidden");
    overlay.style.display="none"; // hide modal

    const username = localStorage.getItem("username");
    const userInfo = document.getElementById("user-info");

    if (username) {
      userInfo.textContent = `👤 ${username}`;
      userInfo.classList.remove("hidden");
    }
    init();
  }

  // ---------------------------------------
  // If already logged in → skip modal
  // ---------------------------------------
  console.log("getToken() returned:", getToken());
  if (getToken()) {
    console.log("Token found, skipping login screen.");
    console.log("Token in localStorage:", localStorage.getItem("token"));
    showContentAfterLogin();
    return;
  }

  // ---------------------------------------
  // LOGIN BUTTON
  // ---------------------------------------
  loginBtn.addEventListener("click", async () => {
    console.log("LOGIN clicked");
    const u = document.getElementById("login-username").value;
    const p = document.getElementById("login-password").value;

    try {
      await login(u, p);
      showContentAfterLogin();
    } catch (e) {
      alert(e.message);
    }
  });

  // ---------------------------------------
  // REGISTER BUTTON
  // ---------------------------------------
  registerBtn.addEventListener("click", async () => {
    console.log("REGISTER clicked");
    const u = document.getElementById("register-username").value;
    const p = document.getElementById("register-password").value;

    try {
      await register(u, p);
      await login(u, p);
      showContentAfterLogin();
    } catch (e) {
      alert(e.message);
    }
  });
}

// -------------------------------------------
// MAIN ENTRY POINT
// -------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOMContentLoaded fired — starting setupAuthUI()");
  setupAuthUI();
});


