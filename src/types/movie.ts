// Define a aparência de um objeto Movie no frontend
export interface Movie {
  id: string;      // UUID (do Sequelize)
  title: string;
  director?: string;
  genre?: string;
  releaseYear?: number;
  createdAt: string; // O Sequelize envia datas como strings ISO
  updatedAt: string;
}