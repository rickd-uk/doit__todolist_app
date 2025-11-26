<template>
  <div id="app" class="app-container">
    <div class="app-content">
      <div class="compact-header">
        <button
          @click="showNewCategoryModal = true"
          class="btn btn-primary btn-compact"
        >
          ➕ 📂
        </button>
        <button
          @click="showNewTodoModal = true"
          class="btn btn-success btn-compact"
        >
          ➕ ✓
        </button>
      </div>

      <CategoryTabs
        :categories="categories"
        :activeCategory="activeCategory"
        :todos="allTodos"
        @selectCategory="selectCategory"
        @editCategory="editCategory"
        @deleteCategory="showDeleteCategoryDialog"
      />

      <div class="main-content">
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
        :categories="categories"
      />
    </Modal>

    <!-- Edit Category Modal -->
    <Modal v-if="showEditCategoryModal" @close="showEditCategoryModal = false">
      <CategoryForm
        :category="editingCategory"
        @submit="updateCategory"
        @cancel="showEditCategoryModal = false"
        :categories="categories"
      />
    </Modal>

    <!-- Delete Category Modal -->
    <DeleteCategoryModal
      v-if="showDeleteCategoryModal && deletingCategory"
      :categoryName="deletingCategory.name"
      :todosCount="
        allTodos.filter((t) => t.categoryId === deletingCategory.id).length
      "
      @confirm="handleDeleteCategory"
      @cancel="cancelDeleteCategory"
    />

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
import DeleteCategoryModal from "./components/DeleteCategoryModal.vue";
import Modal from "./components/Modal.vue";

export default {
  name: "App",
  components: {
    CategoryTabs,
    TodoList,
    TodoForm,
    CategoryForm,
    DeleteCategoryModal,
    Modal,
  },
  setup() {
    const store = useStore();

    const showNewTodoModal = ref(false);
    const showEditTodoModal = ref(false);
    const showNewCategoryModal = ref(false);
    const showEditCategoryModal = ref(false);
    const showDeleteCategoryModal = ref(false);
    const editingTodo = ref(null);
    const editingCategory = ref(null);
    const deletingCategory = ref(null);

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
      try {
        await store.dispatch("deleteTodo", todoId);
      } catch (error) {
        console.error("Failed to delete todo:", error);
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

    const showDeleteCategoryDialog = (categoryId) => {
      const category = categories.value.find((cat) => cat.id === categoryId);
      if (category) {
        deletingCategory.value = category;
        showDeleteCategoryModal.value = true;
      }
    };

    const handleDeleteCategory = async (alsoDeleteTodos) => {
      if (!deletingCategory.value) return;

      try {
        if (alsoDeleteTodos) {
          const todosInCategory = allTodos.value.filter(
            (todo) => todo.categoryId === deletingCategory.value.id,
          );

          for (const todo of todosInCategory) {
            await store.dispatch("deleteTodo", todo.id);
          }
        }

        await store.dispatch("deleteCategory", deletingCategory.value.id);

        showDeleteCategoryModal.value = false;
        deletingCategory.value = null;
      } catch (error) {
        console.error("Failed to delete category:", error);
      }
    };

    const cancelDeleteCategory = () => {
      showDeleteCategoryModal.value = false;
      deletingCategory.value = null;
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
      showDeleteCategoryModal,
      editingTodo,
      editingCategory,
      deletingCategory,
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
      showDeleteCategoryDialog,
      handleDeleteCategory,
      cancelDeleteCategory,
      createCategoryFromTodoForm,
      updateTodos,
      clearError,
    };
  },
};
</script>

<style scoped>
.compact-header {
  display: flex;
  gap: 8px;
  padding: 8px 12px;
  background: #f7fafc;
  border-bottom: 1px solid #e2e8f0;
}

.btn-compact {
  padding: 6px 12px;
  font-size: 16px;
  min-height: 32px;
}
</style>
