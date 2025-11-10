<template>
  <div id="app" class="app-container">
    <header class="app-header">
      <h1>📝 Advanced TodoList</h1>
      <button @click="showNewCategoryModal = true" class="btn btn-primary">
        + New Category
      </button>
    </header>

    <div class="app-content">
      <CategoryTabs 
        :categories="categories"
        :activeCategory="activeCategory"
        @selectCategory="selectCategory"
      />

      <div class="main-content">
        <div class="toolbar">
          <button @click="showNewTodoModal = true" class="btn btn-success">
            + Add Todo
          </button>
        </div>

        <TodoList 
          :todos="filteredTodos"
          :activeCategory="activeCategory"
          @editTodo="editTodo"
          @deleteTodo="deleteTodo"
          @updateTodos="updateTodos"
        />
      </div>
    </div>

    <!-- New Todo Modal -->
    <Modal v-if="showNewTodoModal" @close="showNewTodoModal = false">
      <TodoForm 
        @submit="createTodo"
        @cancel="showNewTodoModal = false"
        :categories="categories"
      />
    </Modal>

    <!-- Edit Todo Modal -->
    <Modal v-if="showEditTodoModal" @close="showEditTodoModal = false">
      <TodoForm 
        :todo="editingTodo"
        @submit="updateTodo"
        @cancel="showEditTodoModal = false"
        :categories="categories"
      />
    </Modal>

    <!-- New Category Modal -->
    <Modal v-if="showNewCategoryModal" @close="showNewCategoryModal = false">
      <CategoryForm 
        @submit="createCategory"
        @cancel="showNewCategoryModal = false"
      />
    </Modal>

    <!-- Loading Overlay -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="spinner"></div>
    </div>

    <!-- Error Toast -->
    <div v-if="error" class="error-toast">
      {{ error }}
      <button @click="clearError">×</button>
    </div>
  </div>
</template>

<script>
import { computed, ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import CategoryTabs from './components/CategoryTabs.vue';
import TodoList from './components/TodoList.vue';
import TodoForm from './components/TodoForm.vue';
import CategoryForm from './components/CategoryForm.vue';
import Modal from './components/Modal.vue';

export default {
  name: 'App',
  components: {
    CategoryTabs,
    TodoList,
    TodoForm,
    CategoryForm,
    Modal,
  },
  setup() {
    const store = useStore();
    
    const showNewTodoModal = ref(false);
    const showEditTodoModal = ref(false);
    const showNewCategoryModal = ref(false);
    const editingTodo = ref(null);

    const categories = computed(() => store.getters.allCategories);
    const filteredTodos = computed(() => store.getters.filteredTodos);
    const activeCategory = computed(() => store.getters.activeCategory);
    const isLoading = computed(() => store.getters.isLoading);
    const error = computed(() => store.getters.error);

    onMounted(async () => {
      await store.dispatch('fetchCategories');
      await store.dispatch('fetchTodos');
    });

    const selectCategory = (categoryId) => {
      store.dispatch('setActiveCategory', categoryId);
    };

    const createTodo = async (todoData) => {
      try {
        await store.dispatch('createTodo', todoData);
        showNewTodoModal.value = false;
      } catch (error) {
        console.error('Failed to create todo:', error);
      }
    };

    const editTodo = (todo) => {
      editingTodo.value = { ...todo };
      showEditTodoModal.value = true;
    };

    const updateTodo = async (todoData) => {
      try {
        await store.dispatch('updateTodo', {
          id: editingTodo.value.id,
          data: todoData,
        });
        showEditTodoModal.value = false;
        editingTodo.value = null;
      } catch (error) {
        console.error('Failed to update todo:', error);
      }
    };

    const deleteTodo = async (todoId) => {
      if (confirm('Are you sure you want to delete this todo?')) {
        try {
          await store.dispatch('deleteTodo', todoId);
        } catch (error) {
          console.error('Failed to delete todo:', error);
        }
      }
    };

    const createCategory = async (categoryData) => {
      try {
        await store.dispatch('createCategory', categoryData);
        showNewCategoryModal.value = false;
      } catch (error) {
        console.error('Failed to create category:', error);
      }
    };

    const updateTodos = async (todos) => {
      try {
        const reorderedTodos = todos.map((todo, index) => ({
          id: todo.id,
          order: index,
          categoryId: todo.categoryId,
        }));
        await store.dispatch('reorderTodos', reorderedTodos);
      } catch (error) {
        console.error('Failed to reorder todos:', error);
      }
    };

    const clearError = () => {
      store.commit('SET_ERROR', null);
    };

    return {
      showNewTodoModal,
      showEditTodoModal,
      showNewCategoryModal,
      editingTodo,
      categories,
      filteredTodos,
      activeCategory,
      isLoading,
      error,
      selectCategory,
      createTodo,
      editTodo,
      updateTodo,
      deleteTodo,
      createCategory,
      updateTodos,
      clearError,
    };
  },
};
</script>
