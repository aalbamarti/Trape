// js/auth.js

export function openModal(id) {
  document.getElementById(id).classList.remove("hidden");
}

export function closeModal(id) {
  document.getElementById(id).classList.add("hidden");
}

// --- LOGIN ---
export async function login(username, password) {
  const res = await fetch("http://localhost:3000/login", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ username, password })
  });

  if (!res.ok) throw new Error("Credencials incorrectes");

  const data = await res.json();
  localStorage.setItem("token", data.token);
  return data;
}

// --- REGISTER ---
export async function register(username, password) {
  const res = await fetch("http://localhost:3000/register", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ username, password })
  });

  if (!res.ok) throw new Error("No s'ha pogut registrar");

  return await res.json();
}

export function logout() {
  localStorage.removeItem("token");
  location.reload();
}

export function getToken() {
  return localStorage.getItem("token");
}
