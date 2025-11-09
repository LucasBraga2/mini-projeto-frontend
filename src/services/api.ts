import { config } from '../config';

// Função helper para deslogar (igual)
function handleUnauthorized() {
  localStorage.removeItem('token');
  window.location.href = '/login'; 
}

/**
 * Lida com a resposta do fetch.
 * AGORA SÓ LIDA COM O CORPO DA RESPOSTA.
 */
async function handleResponse(response: Response) {
  // Pega a resposta JSON, mesmo se for um erro (para lermos a msg da API)
  const data = await response.json();

  if (!response.ok) {
    // Se a resposta não for 2xx, joga um erro com a msg da API
    const error = (data && data.error) || response.statusText;
    throw new Error(error);
  }

  // Se for 2xx, retorna os dados
  return data;
}

/**
 * Nosso 'wrapper' principal do fetch (COM LÓGICA CORRIGIDA)
 */
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

    // --- ESTA É A NOVA LÓGICA CRÍTICA ---
    // Verificamos o "Token Expirado" ANTES de lidar com a resposta.
    // Isso SÓ é disparado se:
    // 1. O status for 401 (Unauthorized) ou 403 (Forbidden)
    // 2. Um 'token' JÁ EXISTIA (o usuário estava logado)
    // 3. Não estamos tentando fazer login (evita loops)
    if (
      (response.status === 401 || response.status === 403) &&
      token && // <- A chave: só desloga se um token foi enviado
      !endpoint.includes('/login') 
    ) {
      handleUnauthorized(); // Desloga e recarrega a página
      // Joga um erro que será silenciado, pois a página vai recarregar
      throw new Error('Sessão expirada.');
    }
    // --- FIM DA NOVA LÓGICA ---

    // Se não for um erro de token expirado, 
    // deixamos o handleResponse lidar com a resposta.
    // Se for um 401 do login (sem token), ele vai cair no 'throw' do handleResponse.
    return handleResponse(response);

  } catch (error) {
    console.error('Erro na requisição da API:', error);
    // Re-lança o erro para o AuthContext (que vai mostrar o toast)
    throw error;
  }
}

// Exporta os métodos (sem mudança aqui)
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