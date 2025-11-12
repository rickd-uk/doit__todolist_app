<template>
  <div id="app" class="app-container">
    <header class="app-header">
      <h1>📝 Doit</h1>
      <button @click="showNewCategoryModal = true" class="btn btn-primary">
        ➕ Category
      </button>
    </header>

    <div class="app-content">
      <CategoryTabs
        :categories="categories"
        :activeCategory="activeCategory"
        :todos="allTodos"
        @selectCategory="selectCategory"
        @editCategory="editCategory"
      />

      <div class="main-content">
        <div class="toolbar">
          <button @click="showNewTodoModal = true" class="btn btn-success">
            ➕ Todo
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
        @createCategory="createCategoryFromTodoForm"
        :categories="categories"
        :activeCategory="activeCategory"
      />
    </Modal>

    <!-- Edit Todo Modal -->
    <Modal v-if="showEditTodoModal" @close="showEditTodoModal = false">
      <TodoForm
        :todo="editingTodo"
        @submit="updateTodo"
        @cancel="showEditTodoModal = false"
        @createCategory="createCategoryFromTodoForm"
        :categories="categories"
        :activeCategory="activeCategory"
      />
    </Modal>

    <!-- New Category Modal -->
    <Modal v-if="showNewCategoryModal" @close="showNewCategoryModal = false">
      <CategoryForm
        @submit="createCategory"
        @cancel="showNewCategoryModal = false"
      />
    </Modal>

    <!-- Edit Category Modal -->
    <Modal v-if="showEditCategoryModal" @close="showEditCategoryModal = false">
      <CategoryForm
        :category="editingCategory"
        @submit="updateCategory"
        @cancel="showEditCategoryModal = false"
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
import { computed, ref, onMounted } from "vue";
import { useStore } from "vuex";
import CategoryTabs from "./components/CategoryTabs.vue";
import TodoList from "./components/TodoList.vue";
import TodoForm from "./components/TodoForm.vue";
import CategoryForm from "./components/CategoryForm.vue";
import Modal from "./components/Modal.vue";

export default {
  name: "App",
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
    const showEditCategoryModal = ref(false);
    const editingTodo = ref(null);
    const editingCategory = ref(null);

    const categories = computed(() => store.getters.allCategories);
    const allTodos = computed(() => store.getters.allTodos);
    const filteredTodos = computed(() => store.getters.filteredTodos);
    const activeCategory = computed(() => store.getters.activeCategory);
    const isLoading = computed(() => store.getters.isLoading);
    const error = computed(() => store.getters.error);

    onMounted(async () => {
      await store.dispatch("fetchCategories");
      await store.dispatch("fetchTodos");
    });

    const selectCategory = (categoryId) => {
      store.dispatch("setActiveCategory", categoryId);
    };

    const createTodo = async (todoData) => {
      try {
        await store.dispatch("createTodo", todoData);
        showNewTodoModal.value = false;
      } catch (error) {
        console.error("Failed to create todo:", error);
      }
    };

    const editTodo = (todo) => {
      editingTodo.value = { ...todo };
      showEditTodoModal.value = true;
    };

    const updateTodo = async (todoData) => {
      try {
        await store.dispatch("updateTodo", {
          id: editingTodo.value.id,
          data: todoData,
        });
        showEditTodoModal.value = false;
        editingTodo.value = null;
      } catch (error) {
        console.error("Failed to update todo:", error);
      }
    };

    const deleteTodo = async (todoId) => {
      if (confirm("Are you sure you want to delete this todo?")) {
        try {
          await store.dispatch("deleteTodo", todoId);
        } catch (error) {
          console.error("Failed to delete todo:", error);
        }
      }
    };

    const createCategory = async (categoryData) => {
      try {
        await store.dispatch("createCategory", categoryData);
        showNewCategoryModal.value = false;
      } catch (error) {
        console.error("Failed to create category:", error);
      }
    };

    const editCategory = (categoryId) => {
      const category = categories.value.find((cat) => cat.id === categoryId);
      if (category) {
        editingCategory.value = { ...category };
        showEditCategoryModal.value = true;
      }
    };

    const updateCategory = async (categoryData) => {
      try {
        await store.dispatch("updateCategory", {
          id: editingCategory.value.id,
          data: categoryData,
        });
        showEditCategoryModal.value = false;
        editingCategory.value = null;
      } catch (error) {
        console.error("Failed to update category:", error);
      }
    };

    const createCategoryFromTodoForm = async (categoryData) => {
      try {
        await store.dispatch("createCategory", categoryData);
        await store.dispatch("fetchCategories");
      } catch (error) {
        console.error("Failed to create category from todo form:", error);
      }
    };

    const updateTodos = async (todos) => {
      try {
        const reorderedTodos = todos.map((todo, index) => ({
          id: todo.id,
          order: index,
          categoryId: todo.categoryId,
        }));

        await store.dispatch("reorderTodos", reorderedTodos);
        await store.dispatch("fetchTodos");
      } catch (error) {
        console.error("Failed to reorder todos:", error);
        await store.dispatch("fetchTodos");
      }
    };

    const clearError = () => {
      store.commit("SET_ERROR", null);
    };

    return {
      showNewTodoModal,
      showEditTodoModal,
      showNewCategoryModal,
      showEditCategoryModal,
      editingTodo,
      editingCategory,
      categories,
      allTodos,
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
      editCategory,
      updateCategory,
      createCategoryFromTodoForm,
      updateTodos,
      clearError,
    };
  },
};
</script>
