import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default {
  // Categories
  getCategories() {
    return apiClient.get('/categories');
  },
  
  getCategory(id) {
    return apiClient.get(`/categories/${id}`);
  },
  
  createCategory(category) {
    return apiClient.post('/categories', category);
  },
  
  updateCategory(id, category) {
    return apiClient.put(`/categories/${id}`, category);
  },
  
  deleteCategory(id) {
    return apiClient.delete(`/categories/${id}`);
  },
  
  reorderCategories(categories) {
    return apiClient.post('/categories/reorder', { categories });
  },
  
  // Todos
  getTodos() {
    return apiClient.get('/todos');
  },
  
  getTodosByCategory(categoryId) {
    return apiClient.get(`/todos/category/${categoryId}`);
  },
  
  getTodo(id) {
    return apiClient.get(`/todos/${id}`);
  },
  
  createTodo(todo) {
    return apiClient.post('/todos', todo);
  },
  
  updateTodo(id, todo) {
    return apiClient.put(`/todos/${id}`, todo);
  },
  
  deleteTodo(id) {
    return apiClient.delete(`/todos/${id}`);
  },
  
  reorderTodos(todos) {
    return apiClient.post('/todos/reorder', { todos });
  },
};
