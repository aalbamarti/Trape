// js/api.js
export const apiUrl = "http://localhost:3000/tricks";

export async function fetchTricks() {
  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error("Failed to fetch tricks from backend");
  }
  return await response.json();
}

export async function updateProgress(trickId, status) {
  const token = getToken(); // your existing function

  const res = await fetch("http://localhost:3000/progress", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({ trickId, status })
  });

  if (!res.ok) throw new Error("Error updating progress");
  return await res.json();
}
