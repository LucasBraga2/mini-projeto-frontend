import React, { useState, useEffect} from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api'; 
import type { Movie } from '../types/movie'; 
import { toast } from 'react-toastify';

const defaultFormState = {
  id: '',
  title: '',
  director: '',
  genre: '',
  releaseYear: '',
};

const DashboardPage = () => {
  const { logout } = useAuth();
  
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false); 
  const [form, setForm] = useState(defaultFormState);
  const [isEditing, setIsEditing] = useState(false);

  const fetchMovies = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.get('/movies');
      setMovies(data);
    } catch (error: any) {
      toast.error(`Erro ao buscar filmes: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);


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
    window.scrollTo(0, 0); 
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

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-8 text-gray-100">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Meus Filmes</h1>
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
            className="bg-slate-800 p-6 rounded-lg shadow-xl space-y-4"
          >
            <h2 className="text-xl font-semibold mb-4 text-white">
              {isEditing ? 'Editar Filme' : 'Adicionar Novo Filme'}
            </h2>
            
            {/* Inputs */}
            <input 
              name="title" 
              value={form.title} 
              onChange={handleInputChange} 
              placeholder="Título (Obrigatório)" 
              required 
              className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
            />
            <input 
              name="director" 
              value={form.director} 
              onChange={handleInputChange} 
              placeholder="Diretor" 
              className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
            />
            <input 
              name="genre" 
              value={form.genre} 
              onChange={handleInputChange} 
              placeholder="Gênero" 
              className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
            />
            <input 
              name="releaseYear" 
              type="number" 
              value={form.releaseYear} 
              onChange={handleInputChange} 
              placeholder="Ano de Lançamento" 
              className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
            />

            <div className="flex space-x-2">
              <button 
                type="submit" 
                disabled={isLoading} 
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-slate-500"
              >
                {isLoading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar')}
              </button>
              {isEditing && (
                <button 
                  type="button" 
                  onClick={clearForm} 
                  className="w-full py-2 px-4 border border-slate-600 rounded-md shadow-sm font-medium text-gray-300 bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Coluna da Lista de Filmes */}
        <div className="md:col-span-2">
          <div className="bg-slate-800 p-6 rounded-lg shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-white">Sua Coleção</h2>
            {isLoading && movies.length === 0 && <p className="text-gray-400">Carregando filmes...</p>}
            {!isLoading && movies.length === 0 && <p className="text-gray-400">Nenhum filme cadastrado ainda.</p>}
            
            <div className="space-y-4">
              {movies.map(movie => (
                <div key={movie.id} className="bg-slate-700 border border-slate-600 p-4 rounded-md shadow-sm">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold text-white">{movie.title} ({movie.releaseYear || 'N/A'})</h3>
                      <p className="text-sm text-gray-400">{movie.director || 'Diretor desconhecido'} | {movie.genre || 'Gênero desconhecido'}</p>
                    </div>
                    {/* Botões de Ação (cores já contrastam bem) */}
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