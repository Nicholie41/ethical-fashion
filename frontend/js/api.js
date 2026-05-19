const API_URL = 'http://localhost:5000/api';

async function apiRequest(endpoint, method = 'GET', body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const res = await fetch(API_URL + endpoint, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  return res.json();
}