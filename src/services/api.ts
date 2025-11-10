import { config } from '../config';

function handleUnauthorized() {
  localStorage.removeItem('token');
  window.location.href = '/login'; 
}


async function handleResponse(response: Response) {
  const data = await response.json();

  if (!response.ok) {
    const error = (data && data.error) || response.statusText;
    throw new Error(error);
  }

  return data;
}

async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${config.apiBaseUrl}${endpoint}`, fetchOptions);

    if (
      (response.status === 401 || response.status === 403) &&
      token && 
      !endpoint.includes('/login') 
    ) {
      handleUnauthorized(); 
      throw new Error('Sessão expirada.');
    }

    return handleResponse(response);

  } catch (error) {
    console.error('Erro na requisição da API:', error);
    throw error;
  }
}

export const apiService = {
  get: (endpoint: string) => apiFetch(endpoint, { method: 'GET' }),
  post: (endpoint: string, body: unknown) => apiFetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  }),
  put: (endpoint: string, body: unknown) => apiFetch(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  }),
  delete: (endpoint: string) => apiFetch(endpoint, { method: 'DELETE' }),
};