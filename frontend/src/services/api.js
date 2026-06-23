const BASE_URL = import.meta.env.VITE_API_URL || '';
const API_URL = BASE_URL ? BASE_URL.replace(/\/$/, '') : '';

const getHeaders = () => {
  const token = sessionStorage.getItem('scannhelp_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (response) => {
  if (response.status === 401) {
    sessionStorage.removeItem('scannhelp_token');
    sessionStorage.removeItem('scannhelp_user');
    sessionStorage.removeItem('scannhelp_token_expires_at');
    if (typeof window !== 'undefined') {
      const currentPath = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `/login?redirect=${currentPath}`;
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
      let errorMessage = 'Signup failed';
      if (error && error.detail) {
        if (typeof error.detail === 'string') {
          errorMessage = error.detail;
        } else if (Array.isArray(error.detail)) {
          errorMessage = error.detail.map(err => {
            let msg = err.msg || '';
            if (msg.startsWith('Value error, ')) {
              msg = msg.substring('Value error, '.length);
            }
            return msg;
          }).filter(Boolean).join(', ') || 'Validation error';
        }
      }
      throw new Error(errorMessage);
    }
    return response.json();
  },

  async sendSignupCode(email) {
    const response = await fetch(`${API_URL}/signup/send-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) {
      const error = await response.json();
      const err = new Error(error.detail || 'Failed to send verification code');
      err.status = response.status;
      throw err;
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
    sessionStorage.setItem('scannhelp_token', data.access_token);
    sessionStorage.setItem('scannhelp_token_expires_at', (Date.now() + 30 * 60 * 1000).toString());
    return data;
  },

  /**
   * JSON login.
   * Returns: { access_token, token_type } on success.
   */
  async loginJson(email, password) {
    const response = await fetch(`${API_URL}/login/json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      const err = new Error(error.detail || 'Login failed');
      err.status = response.status;
      throw err;
    }

    const data = await response.json();
    sessionStorage.setItem('scannhelp_token', data.access_token);
    sessionStorage.setItem('scannhelp_token_expires_at', (Date.now() + 30 * 60 * 1000).toString());
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
    sessionStorage.setItem('scannhelp_token', data.access_token);
    sessionStorage.setItem('scannhelp_token_expires_at', (Date.now() + 30 * 60 * 1000).toString());
    return data;
  },

  logout() {
    sessionStorage.removeItem('scannhelp_token');
    sessionStorage.removeItem('scannhelp_user');
    sessionStorage.removeItem('scannhelp_token_expires_at');
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

  async verifyScan(t_t, t_id) {
    const response = await fetch(`${API_URL}/scan/verify?t_t=${t_t}&t_id=${t_id}`);
    if (!response.ok) throw new Error('Verification failed');
    return response.json();
  },

  async activateTag(t_t, t_id, details) {
    const response = await fetch(`${API_URL}/activate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ t_t: parseInt(t_t), t_id, details }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Activation failed');
    }
    return response.json();
  },

  async getPublicDetails(id, t_t) {
    const response = await fetch(`${API_URL}/public-details/${id}?t_t=${t_t}`);
    if (!response.ok) {
      if (response.status === 404) throw new Error('NOT_FOUND');
      throw new Error('Failed to fetch details');
    }
    return response.json();
  },

  // Password Reset
  async forgotPassword(email) {
    const response = await fetch(`${API_URL}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) {
      const error = await response.json();
      const err = new Error(error.detail || 'Failed to send reset code');
      err.status = response.status;
      throw err;
    }
    return response.json();
  },

  async verifyResetCode(email, code) {
    const response = await fetch(`${API_URL}/verify-reset-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Invalid or expired code');
    }
    return response.json();
  },

  async resetPassword(email, code, new_password, confirm_password) {
    const response = await fetch(`${API_URL}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, new_password, confirm_password }),
    });
    if (!response.ok) {
      const error = await response.json();
      let errorMessage = 'Failed to reset password';
      if (error && error.detail) {
        if (typeof error.detail === 'string') {
          errorMessage = error.detail;
        } else if (Array.isArray(error.detail)) {
          errorMessage = error.detail.map(err => {
            let msg = err.msg || '';
            if (msg.startsWith('Value error, ')) msg = msg.substring('Value error, '.length);
            return msg;
          }).filter(Boolean).join(', ') || 'Validation error';
        }
      }
      throw new Error(errorMessage);
    }
    return response.json();
  },
};
