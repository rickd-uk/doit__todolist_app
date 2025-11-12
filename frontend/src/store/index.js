import { createStore } from "vuex";
import api from "../services/api";

export default createStore({
  state: {
    todos: [],
    categories: [],
    activeCategory: "all",
    loading: false,
    error: null,
  },

  getters: {
    allTodos: (state) => state.todos,

    filteredTodos: (state) => {
      if (state.activeCategory === "all") {
        return state.todos;
      } else if (state.activeCategory === "unspecified") {
        return state.todos.filter((todo) => !todo.categoryId);
      } else {
        return state.todos.filter(
          (todo) => todo.categoryId === state.activeCategory,
        );
      }
    },

    allCategories: (state) => state.categories,

    getCategoryById: (state) => (id) => {
      return state.categories.find((cat) => cat.id === id);
    },

    activeCategory: (state) => state.activeCategory,

    isLoading: (state) => state.loading,

    error: (state) => state.error,
  },

  mutations: {
    SET_TODOS(state, todos) {
      state.todos = todos;
    },

    ADD_TODO(state, todo) {
      state.todos.unshift(todo);
    },

    UPDATE_TODO(state, updatedTodo) {
      const index = state.todos.findIndex((t) => t.id === updatedTodo.id);
      if (index !== -1) {
        state.todos.splice(index, 1, updatedTodo);
      }
    },

    DELETE_TODO(state, todoId) {
      state.todos = state.todos.filter((t) => t.id !== todoId);
    },

    SET_CATEGORIES(state, categories) {
      state.categories = categories;
    },

    ADD_CATEGORY(state, category) {
      state.categories.push(category);
    },

    UPDATE_CATEGORY(state, updatedCategory) {
      const index = state.categories.findIndex(
        (c) => c.id === updatedCategory.id,
      );
      if (index !== -1) {
        state.categories.splice(index, 1, updatedCategory);
      }
    },

    DELETE_CATEGORY(state, categoryId) {
      state.categories = state.categories.filter((c) => c.id !== categoryId);
    },

    SET_ACTIVE_CATEGORY(state, categoryId) {
      state.activeCategory = categoryId;
    },

    SET_LOADING(state, loading) {
      state.loading = loading;
    },

    SET_ERROR(state, error) {
      state.error = error;
    },
  },

  actions: {
    async fetchTodos({ commit }) {
      commit("SET_LOADING", true);
      commit("SET_ERROR", null);
      try {
        const response = await api.getTodos();
        commit("SET_TODOS", response.data);
      } catch (error) {
        commit("SET_ERROR", error.message);
        console.error("Error fetching todos:", error);
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async fetchCategories({ commit }) {
      commit("SET_LOADING", true);
      commit("SET_ERROR", null);
      try {
        const response = await api.getCategories();
        commit("SET_CATEGORIES", response.data);
      } catch (error) {
        commit("SET_ERROR", error.message);
        console.error("Error fetching categories:", error);
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async createTodo({ commit }, todoData) {
      commit("SET_ERROR", null);
      try {
        const response = await api.createTodo(todoData);
        commit("ADD_TODO", response.data);
        return response.data;
      } catch (error) {
        commit("SET_ERROR", error.message);
        console.error("Error creating todo:", error);
        throw error;
      }
    },

    async updateTodo({ commit }, { id, data }) {
      commit("SET_ERROR", null);
      try {
        const response = await api.updateTodo(id, data);
        commit("UPDATE_TODO", response.data);
        return response.data;
      } catch (error) {
        commit("SET_ERROR", error.message);
        console.error("Error updating todo:", error);
        throw error;
      }
    },

    async deleteTodo({ commit }, todoId) {
      commit("SET_ERROR", null);
      try {
        await api.deleteTodo(todoId);
        commit("DELETE_TODO", todoId);
      } catch (error) {
        commit("SET_ERROR", error.message);
        console.error("Error deleting todo:", error);
        throw error;
      }
    },

    async createCategory({ commit }, categoryData) {
      commit("SET_ERROR", null);
      try {
        const response = await api.createCategory(categoryData);
        commit("ADD_CATEGORY", response.data);
        return response.data;
      } catch (error) {
        commit("SET_ERROR", error.message);
        console.error("Error creating category:", error);
        throw error;
      }
    },

    async updateCategory({ commit }, { id, data }) {
      commit("SET_ERROR", null);
      try {
        const response = await api.updateCategory(id, data);
        commit("UPDATE_CATEGORY", response.data);
        return response.data;
      } catch (error) {
        commit("SET_ERROR", error.message);
        console.error("Error updating category:", error);
        throw error;
      }
    },

    async deleteCategory({ commit }, categoryId) {
      commit("SET_ERROR", null);
      try {
        await api.deleteCategory(categoryId);
        commit("DELETE_CATEGORY", categoryId);
      } catch (error) {
        commit("SET_ERROR", error.message);
        console.error("Error deleting category:", error);
        throw error;
      }
    },

    async reorderTodos({ commit }, todos) {
      commit("SET_ERROR", null);
      try {
        await api.reorderTodos(todos);
        commit("SET_TODOS", todos);
      } catch (error) {
        commit("SET_ERROR", error.message);
        console.error("Error reordering todos:", error);
        throw error;
      }
    },

    setActiveCategory({ commit }, categoryId) {
      commit("SET_ACTIVE_CATEGORY", categoryId);
    },
  },
});
