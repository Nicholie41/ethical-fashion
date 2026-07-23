const API_URL = 'http://localhost:5000/api';

// Helper to parse JSON safely
async function safeParseJSON(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { error: 'Invalid server response', status: res.status, raw: text };
  }
}

// --- AUTH ---
export async function googleLogin(credential, role) {
  const res = await fetch(`${API_URL}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential, role })
  });
  const data = await safeParseJSON(res);
  if (!res.ok) {
    return { error: data.error || `Google sign-in failed with status ${res.status}` };
  }
  if (data.token && data.token !== "undefined" && data.token !== null) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role);
  }
  return data;
}

export async function login(username, password, role, adminId) {
  // Add role/adminId support for your login endpoint (if needed)
  const payload = { username, password };
  if (role) payload.role = role;
  if (role === "admin" && adminId) payload.adminId = adminId;

  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await safeParseJSON(res);
  if (!res.ok) {
    return { error: data.error || `Login failed with status ${res.status}` };
  }
  // Only set token if it's valid (not null/undefined/"undefined")
  if (data.token && data.token !== "undefined" && data.token !== null) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role);
  }
  return data;
}

export async function signup(username, password, role) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, role })
  });
  return safeParseJSON(res);
}

// --- PRODUCTS ---
export async function fetchProducts(filters = {}) {
  const params = new URLSearchParams(filters).toString();
  const res = await fetch(`${API_URL}/products?${params}`);
  return safeParseJSON(res);
}

export async function fetchProductById(id) {
  const res = await fetch(`${API_URL}/products/${id}`);
  return safeParseJSON(res);
}

export async function addProduct(productData) {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  Object.entries(productData).forEach(([k, v]) => {
    if (v !== undefined && v !== null) formData.append(k, v);
  });
  const res = await fetch(`${API_URL}/products`, {
    method: 'POST',
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: formData,
  });
  return safeParseJSON(res);
}

export async function updateProduct(id, productData) {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  Object.entries(productData).forEach(([k, v]) => {
    if (v !== undefined && v !== null) formData.append(k, v);
  });
  const res = await fetch(`${API_URL}/products/${id}`, {
    method: 'PUT',
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: formData,
  });
  return safeParseJSON(res);
}

export async function deleteProduct(id) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/products/${id}`, {
    method: 'DELETE',
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
  });
  return safeParseJSON(res);
}

// --- BRANDS ---
export async function fetchBrands(filters = {}) {
  const params = new URLSearchParams(filters).toString();
  const res = await fetch(`${API_URL}/brands?${params}`);
  return safeParseJSON(res);
}

export async function fetchBrandById(id) {
  const res = await fetch(`${API_URL}/brands/${id}`);
  return safeParseJSON(res);
}

export async function addBrand(brandData) {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  Object.entries(brandData).forEach(([k, v]) => {
    if (v !== undefined && v !== null) formData.append(k, v);
  });
  const res = await fetch(`${API_URL}/brands`, {
    method: 'POST',
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: formData,
  });
  return safeParseJSON(res);
}

export async function updateBrand(id, brandData) {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  Object.entries(brandData).forEach(([k, v]) => {
    if (v !== undefined && v !== null) formData.append(k, v);
  });
  const res = await fetch(`${API_URL}/brands/${id}`, {
    method: 'PUT',
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: formData,
  });
  return safeParseJSON(res);
}

export async function deleteBrand(id) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/brands/${id}`, {
    method: 'DELETE',
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
  });
  return safeParseJSON(res);
}

// --- ADMIN: Pending/Approve ---
export async function fetchPendingBrands() {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/admin/brands/pending`, {
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
  });
  return safeParseJSON(res);
}

export async function fetchPendingProducts() {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/admin/products/pending`, {
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
  });
  return safeParseJSON(res);
}

export async function approveBrand(brandId) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/admin/brands/${brandId}/approve`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ approve: true }),
  });
  return safeParseJSON(res);
}

export async function approveProduct(productId) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/admin/products/${productId}/approve`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ approve: true }),
  });
  return safeParseJSON(res);
}

export async function rejectBrand(brandId) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/admin/brands/${brandId}/approve`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ approve: false }),
  });
  return safeParseJSON(res);
}

export async function rejectProduct(productId) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/admin/products/${productId}/approve`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ approve: false }),
  });
  return safeParseJSON(res);
}

// Gamification API functions
export const getGamificationProfile = async () => {
  const response = await fetch(`${API_URL}/api/gamification/profile`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  if (!response.ok) throw new Error('Failed to fetch gamification profile');
  return response.json();
};

export const updatePreferences = async (preferences) => {
  const response = await fetch(`${API_URL}/api/gamification/preferences`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(preferences)
  });
  if (!response.ok) throw new Error('Failed to update preferences');
  return response.json();
};

export const awardPoints = async (activity, points, badgeId, achievementId) => {
  const response = await fetch(`${API_URL}/api/gamification/award-points`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({ activity, points, badgeId, achievementId })
  });
  if (!response.ok) throw new Error('Failed to award points');
  return response.json();
};

export const updateStreak = async () => {
  const response = await fetch(`${API_URL}/api/gamification/update-streak`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  if (!response.ok) throw new Error('Failed to update streak');
  return response.json();
};

export const trackActivity = async (activity, data) => {
  const response = await fetch(`${API_URL}/api/gamification/track-activity`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({ activity, data })
  });
  if (!response.ok) throw new Error('Failed to track activity');
  return response.json();
};

export const getLeaderboard = async () => {
  const response = await fetch(`${API_URL}/api/gamification/leaderboard`);
  if (!response.ok) throw new Error('Failed to fetch leaderboard');
  return response.json();
};

// Personalization API functions
export const getPersonalizedRecommendations = async () => {
  const response = await fetch(`${API_URL}/api/personalization/recommendations`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  if (!response.ok) throw new Error('Failed to fetch recommendations');
  return response.json();
};

export const getPersonalizationProfile = async () => {
  const response = await fetch(`${API_URL}/api/personalization/profile`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  if (!response.ok) throw new Error('Failed to fetch personalization profile');
  return response.json();
};

export const updateUserPreferences = async (preferences) => {
  const response = await fetch(`${API_URL}/api/personalization/preferences`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(preferences)
  });
  if (!response.ok) throw new Error('Failed to update preferences');
  return response.json();
};

export const getTrendingProducts = async () => {
  const response = await fetch(`${API_URL}/api/personalization/trending`);
  if (!response.ok) throw new Error('Failed to fetch trending products');
  return response.json();
};

export const getCommunityStats = async () => {
  const response = await fetch(`${API_URL}/api/personalization/community-stats`);
  if (!response.ok) throw new Error('Failed to fetch community stats');
  return response.json();
};