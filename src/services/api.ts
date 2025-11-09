import { config } from '../config';

// Uma função 'helper' para lidar com o logout automático
function handleUnauthorized() {
  localStorage.removeItem('token');
  // Recarrega a página na rota de login.
  // Isso limpa qualquer estado antigo da aplicação.
  window.location.href = '/login'; 
  // (Poderíamos usar o 'useNavigate' do router, 
  // mas o 'window.location' é mais direto e garantido fora de componentes React)
}

/**
 * Lida com a resposta do fetch.
 * @param response A resposta do fetch
 * @returns O JSON da resposta
 */
async function handleResponse(response: Response) {
  // Se o token expirou ou é inválido
  if (response.status === 401 || response.status === 403) {
    handleUnauthorized();
    throw new Error('Sessão expirada. Faça o login novamente.');
  }

  const data = await response.json();

  if (!response.ok) {
    // Pega a mensagem de erro da API (ex: "Email já existe")
    const error = (data && data.error) || response.statusText;
    throw new Error(error);
  }

  return data;
}

/**
 * Nosso 'wrapper' principal do fetch.
 */
async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  
  // Headers padrão
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Adiciona o token se ele existir
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Monta as opções finais da requisição
  const fetchOptions: RequestInit = {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${config.apiBaseUrl}${endpoint}`, fetchOptions);
    return handleResponse(response);
  } catch (error) {
    console.error('Erro na requisição da API:', error);
    // Re-lança o erro para o componente poder tratar (ex: mostrar toast)
    throw error;
  }
}

// Exporta os métodos HTTP que vamos usar
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