export interface Movie {
  id: string;     
  title: string;
  director?: string;
  genre?: string;
  releaseYear?: number;
  createdAt: string;
  updatedAt: string;
}