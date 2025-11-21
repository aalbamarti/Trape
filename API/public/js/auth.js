// js/auth.js

export async function login(username, password) {
  const res = await fetch("http://localhost:3000/login", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) throw new Error("Credencials incorrectes");
  const data = await res.json();
  //localStorage.setItem("token", data.token);
  return data;
}

export async function register(username, password) {
  const res = await fetch("http://localhost:3000/register", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) throw new Error("Aquest usuari ja existeix o error del servidor");
  const data = await res.json();
  return data;
}

export function logout() {
  localStorage.removeItem("token");
  location.reload();
}

export function getToken() {
  return localStorage.getItem("token");
}




