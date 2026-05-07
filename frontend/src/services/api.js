const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_URL = BASE_URL.replace(/\/$/, '');

const getHeaders = () => {
  const token = localStorage.getItem('scannhelp_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (response) => {
  if (response.status === 401) {
    localStorage.removeItem('scannhelp_token');
    localStorage.removeItem('scannhelp_user');
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('Session expired. Please login again.');
  }
  return response;
};

export const api = {
  // Auth
  async signup(userData) {
    const response = await fetch(`${API_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Signup failed');
    }
    return response.json();
  },

  async login(email, password) {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }

    const data = await response.json();
    localStorage.setItem('scannhelp_token', data.access_token);
    return data;
  },

  async googleLogin(idToken) {
    const response = await fetch(`${API_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_token: idToken }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Google Login failed');
    }

    const data = await response.json();
    localStorage.setItem('scannhelp_token', data.access_token);
    return data;
  },

  logout() {
    localStorage.removeItem('scannhelp_token');
    localStorage.removeItem('scannhelp_user');
  },

  // Products
  async getProducts() {
    const response = await handleResponse(await fetch(`${API_URL}/products`, {
      headers: getHeaders(),
    }));
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  },

  async getProduct(id) {
    const response = await handleResponse(await fetch(`${API_URL}/products/${id}`, {
      headers: getHeaders(),
    }));
    if (!response.ok) throw new Error('Failed to fetch product');
    return response.json();
  },

  async createProduct(productData) {
    const response = await handleResponse(await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(productData),
    }));
    if (!response.ok) throw new Error('Failed to create product');
    return response.json();
  },

  async updateProduct(id, productData) {
    const response = await handleResponse(await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(productData),
    }));
    if (!response.ok) throw new Error('Failed to update product');
    return response.json();
  },

  // Health Profiles
  async getHealthProfiles() {
    const response = await handleResponse(await fetch(`${API_URL}/health-profiles`, {
      headers: getHeaders(),
    }));
    if (!response.ok) throw new Error('Failed to fetch health profiles');
    return response.json();
  },

  async getHealthProfile(id) {
    const response = await handleResponse(await fetch(`${API_URL}/health-profiles/${id}`, {
      headers: getHeaders(),
    }));
    if (!response.ok) throw new Error('Failed to fetch health profile');
    return response.json();
  },

  async createHealthProfile(profileData) {
    const response = await handleResponse(await fetch(`${API_URL}/health-profiles`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(profileData),
    }));
    if (!response.ok) throw new Error('Failed to create health profile');
    return response.json();
  },

  async updateHealthProfile(id, profileData) {
    const response = await handleResponse(await fetch(`${API_URL}/health-profiles/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(profileData),
    }));
    if (!response.ok) throw new Error('Failed to update health profile');
    return response.json();
  },

  // Public Scan
  async scanId(id) {
    const response = await fetch(`${API_URL}/scan/${id}`);
    if (!response.ok) throw new Error('Tag not found');
    return response.json();
  },
};
