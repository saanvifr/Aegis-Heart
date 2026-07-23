/**
 * useApi.ts — Production API client with JWT refresh token rotation.
 * 
 * Features:
 * - Automatic token refresh on 401
 * - Request queuing during refresh (prevents race conditions)
 * - Logout on refresh failure
 * - Typed responses
 */

// Use environment variable for cloud deployment, fallback to empty string (relative) for Nginx
const BASE_URL = import.meta.env.VITE_API_URL || '';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface ApiResponse<T = any> {
  data: T | null;
  error: string | null;
  status: number;
}

// ── Token storage helpers ─────────────────────────────────────────────
const getAccessToken  = () => localStorage.getItem('aegis_token');
const getRefreshToken = () => localStorage.getItem('aegis_refresh_token');
const setTokens = (access: string, refresh: string) => {
  localStorage.setItem('aegis_token', access);
  localStorage.setItem('aegis_refresh_token', refresh);
};
const clearTokens = () => {
  localStorage.removeItem('aegis_token');
  localStorage.removeItem('aegis_refresh_token');
};

// ── Refresh token lock (prevent parallel refresh calls) ───────────────
let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

async function doRefresh(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  try {
    const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refresh }),
    });
    if (!res.ok) { clearTokens(); return null; }
    const data = await res.json();
    setTokens(data.access_token, data.refresh_token);
    return data.access_token;
  } catch {
    clearTokens();
    return null;
  }
}

async function refreshWithQueue(): Promise<string | null> {
  if (isRefreshing) {
    return new Promise((resolve) => { refreshQueue.push(resolve); });
  }
  isRefreshing = true;
  const newToken = await doRefresh();
  refreshQueue.forEach(cb => cb(newToken));
  refreshQueue = [];
  isRefreshing = false;
  return newToken;
}

// ── Core request function ─────────────────────────────────────────────
async function request<T = any>(
  method: HttpMethod,
  endpoint: string,
  body?: any,
  isRetry = false,
): Promise<ApiResponse<T>> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body != null ? JSON.stringify(body) : undefined,
    });

    // Auto-refresh on 401
    if (res.status === 401 && !isRetry) {
      const newToken = await refreshWithQueue();
      if (newToken) {
        return request<T>(method, endpoint, body, true);
      }
      // Refresh failed — trigger logout
      window.dispatchEvent(new Event('aegis:logout'));
      return { data: null, error: 'Session expired. Please log in again.', status: 401 };
    }

    if (!res.ok) {
      let errorMsg = `Request failed (${res.status})`;
      try {
        const errData = await res.json();
        errorMsg = errData.detail || errData.message || errorMsg;
      } catch { /* ignore */ }
      return { data: null, error: errorMsg, status: res.status };
    }

    // 204 No Content
    if (res.status === 204) return { data: null, error: null, status: 204 };

    const data: T = await res.json();
    return { data, error: null, status: res.status };
  } catch (err) {
    return { data: null, error: 'Network error — is the backend running?', status: 0 };
  }
}

// ── File download ─────────────────────────────────────────────────────
async function downloadFile(endpoint: string, filename: string): Promise<void> {
  const token = getAccessToken();
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Download failed');
  const blob = await res.blob();
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Public API surface ────────────────────────────────────────────────
export const api = {
  get:    <T = any>(endpoint: string)                => request<T>('GET',    endpoint),
  post:   <T = any>(endpoint: string, body?: any)    => request<T>('POST',   endpoint, body),
  put:    <T = any>(endpoint: string, body?: any)    => request<T>('PUT',    endpoint, body),
  patch:  <T = any>(endpoint: string, body?: any)    => request<T>('PATCH',  endpoint, body),
  delete: <T = any>(endpoint: string)                => request<T>('DELETE', endpoint),
  download: downloadFile,
  setTokens,
  clearTokens,
  getAccessToken,
  getRefreshToken,
};

// ── React hook ────────────────────────────────────────────────────────
export function useApi() {
  return api;
}

export default api;
