import React, { useState, useEffect} from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api'; // Nosso fetch wrapper
import type { Movie } from '../types/movie'; // Nosso tipo
import { toast } from 'react-toastify';

// O "estado" do formulário. Começa vazio.
const defaultFormState = {
  id: '',
  title: '',
  director: '',
  genre: '',
  releaseYear: '', // Usamos string no form para facilitar
};

const DashboardPage = () => {
  const { logout } = useAuth();
  
  // --- Estados do Componente ---
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false); // Loading geral da página
  const [form, setForm] = useState(defaultFormState);
  const [isEditing, setIsEditing] = useState(false); // Estamos criando ou editando?

  // --- 1. Efeito para Buscar Filmes (READ) ---
  const fetchMovies = async () => {
    setIsLoading(true);
    try {
      // Nosso apiService já envia o token
      const data = await apiService.get('/movies');
      setMovies(data);
    } catch (error: any) {
      toast.error(`Erro ao buscar filmes: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Roda o fetchMovies() assim que o componente é montado
  useEffect(() => {
    fetchMovies();
  }, []); // O array vazio garante que isso rode só uma vez

  // --- 2. Lógica do Formulário e Submissão (CREATE / UPDATE) ---

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const movieData = {
      title: form.title,
      director: form.director || undefined,
      genre: form.genre || undefined,
      releaseYear: form.releaseYear ? parseInt(form.releaseYear, 10) : undefined,
    };

    try {
      if (isEditing) {
        // --- UPDATE (PUT) ---
        await apiService.put(`/movies/${form.id}`, movieData);
        toast.success('Filme atualizado com sucesso!');
      } else {
        // --- CREATE (POST) ---
        await apiService.post('/movies', movieData);
        toast.success('Filme criado com sucesso!');
      }
      
      clearForm(); // Limpa o formulário
      fetchMovies(); // Recarrega a lista de filmes

    } catch (error: any) {
      toast.error(`Falha: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // --- 3. Ações da Lista (DELETE / Preencher Edição) ---

  // Prepara o formulário para edição
  const handleEdit = (movie: Movie) => {
    setIsEditing(true);
    setForm({
      id: movie.id,
      title: movie.title,
      director: movie.director || '',
      genre: movie.genre || '',
      releaseYear: movie.releaseYear ? String(movie.releaseYear) : '',
    });
    window.scrollTo(0, 0); // Rola para o topo (onde o form está)
  };

  // Limpa o formulário
  const clearForm = () => {
    setForm(defaultFormState);
    setIsEditing(false);
  };

  // --- DELETE ---
  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja deletar este filme?')) {
      return;
    }

    try {
      await apiService.delete(`/movies/${id}`);
      toast.success('Filme deletado com sucesso!');
      fetchMovies(); // Recarrega a lista
    } catch (error: any) {
      toast.error(`Falha ao deletar: ${error.message}`);
    }
  };

  // --- 4. Renderização (JSX com Tailwind) ---
  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Meus Filmes</h1>
        <button
          onClick={logout}
          className="py-2 px-4 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition"
        >
          Sair (Logout)
        </button>
      </header>

      {/* Container Principal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Coluna do Formulário */}
        <div className="md:col-span-1">
          <form 
            onSubmit={handleSubmit} 
            className="bg-white p-6 rounded-lg shadow-md space-y-4"
          >
            <h2 className="text-xl font-semibold mb-4">
              {isEditing ? 'Editar Filme' : 'Adicionar Novo Filme'}
            </h2>
            
            <input 
              name="title" 
              value={form.title} 
              onChange={handleInputChange} 
              placeholder="Título (Obrigatório)" 
              required 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <input 
              name="director" 
              value={form.director} 
              onChange={handleInputChange} 
              placeholder="Diretor" 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <input 
              name="genre" 
              value={form.genre} 
              onChange={handleInputChange} 
              placeholder="Gênero" 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <input 
              name="releaseYear" 
              type="number" 
              value={form.releaseYear} 
              onChange={handleInputChange} 
              placeholder="Ano de Lançamento" 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />

            <div className="flex space-x-2">
              <button 
                type="submit" 
                disabled={isLoading} 
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
              >
                {isLoading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar')}
              </button>
              {isEditing && (
                <button 
                  type="button" 
                  onClick={clearForm} 
                  className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Coluna da Lista de Filmes */}
        <div className="md:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Sua Coleção</h2>
            {isLoading && movies.length === 0 && <p>Carregando filmes...</p>}
            {!isLoading && movies.length === 0 && <p>Nenhum filme cadastrado ainda.</p>}
            
            <div className="space-y-4">
              {movies.map(movie => (
                <div key={movie.id} className="border p-4 rounded-md shadow-sm">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold">{movie.title} ({movie.releaseYear || 'N/A'})</h3>
                      <p className="text-sm text-gray-600">{movie.director || 'Diretor desconhecido'} | {movie.genre || 'Gênero desconhecido'}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEdit(movie)}
                        className="py-1 px-3 bg-yellow-500 text-white text-xs font-medium rounded-md hover:bg-yellow-600"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => handleDelete(movie.id)}
                        className="py-1 px-3 bg-red-600 text-white text-xs font-medium rounded-md hover:bg-red-700"
                      >
                        Deletar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;