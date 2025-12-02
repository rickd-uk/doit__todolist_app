<template>
  <div id="app" class="app-container">
    <!-- Login/Signup Screen -->
    <div v-if="!isAuthenticated" class="auth-container">
      <Login
        v-if="showLogin"
        @success="handleAuthSuccess"
        @switchToSignup="showLogin = false"
      />
      <Signup
        v-else
        @success="handleAuthSuccess"
        @switchToLogin="showLogin = true"
      />
    </div>

    <!-- Main App -->
    <div v-else class="app-content">
      <div class="compact-header">
        <div class="compact-header-row">
          <div class="header-left">
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
            <button
              @click="showManageModal = true"
              class="btn btn-manage btn-compact"
              title="Manage categories"
            >
              ⚙️
            </button>
          </div>

          <div class="header-right">
            <button
              @click="showSettingsModal = true"
              class="btn btn-settings btn-compact"
              title="Settings"
            >
              🔧
            </button>
            <button
              @click="handleLogout"
              class="btn btn-logout btn-compact"
              title="Logout"
            >
              🚪
            </button>
          </div>
        </div>

        <div class="header-center">
          <span class="current-date">{{ currentDate }}</span>
        </div>
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
          :dateFormat="dateFormat"
          :enableDueDateColors="enableDueDateColors"
          :dueDateColors="dueDateColors"
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

    <!-- Manage Categories Modal -->
    <Modal v-if="showManageModal" @close="showManageModal = false">
      <ManageCategories
        :categories="categories"
        :todos="allTodos"
        @close="showManageModal = false"
        @deleteAll="handleDeleteAllCategories"
      />
    </Modal>

    <!-- Settings Modal -->
    <Modal v-if="showSettingsModal" @close="showSettingsModal = false">
      <Settings
        :settings="settings"
        @save="handleSaveSettings"
        @cancel="showSettingsModal = false"
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
import { computed, ref, onMounted, onUnmounted } from "vue";
import { useStore } from "vuex";
import Login from "./components/Login.vue";
import Signup from "./components/Signup.vue";
import CategoryTabs from "./components/CategoryTabs.vue";
import TodoList from "./components/TodoList.vue";
import TodoForm from "./components/TodoForm.vue";
import CategoryForm from "./components/CategoryForm.vue";
import DeleteCategoryModal from "./components/DeleteCategoryModal.vue";
import Modal from "./components/Modal.vue";
import ManageCategories from "./components/ManageCategories.vue";
import Settings from "./components/Settings.vue";

export default {
  name: "App",
  components: {
    Login,
    Signup,
    CategoryTabs,
    TodoList,
    TodoForm,
    CategoryForm,
    DeleteCategoryModal,
    ManageCategories,
    Settings,
    Modal,
  },
  setup() {
    const store = useStore();

    const isAuthenticated = ref(false);
    const showLogin = ref(true);
    const showNewTodoModal = ref(false);
    const showEditTodoModal = ref(false);
    const showNewCategoryModal = ref(false);
    const showEditCategoryModal = ref(false);
    const showDeleteCategoryModal = ref(false);
    const showManageModal = ref(false);
    const showSettingsModal = ref(false);

    const editingTodo = ref(null);
    const editingCategory = ref(null);
    const deletingCategory = ref(null);
    const currentDate = ref("");

    const categories = computed(() => store.getters.allCategories);
    const allTodos = computed(() => store.getters.allTodos);
    const filteredTodos = computed(() => store.getters.filteredTodos);
    const activeCategory = computed(() => store.getters.activeCategory);
    const isLoading = computed(() => store.getters.isLoading);
    const error = computed(() => store.getters.error);
    const settings = computed(() => store.getters.settings);
    const dateFormat = computed(() => store.getters.dateFormat);
    const enableDueDateColors = computed(
      () => store.getters.enableDueDateColors,
    );
    const dueDateColors = computed(() => store.getters.dueDateColors);

    const updateCurrentDate = () => {
      const now = new Date();
      const options = {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      };
      currentDate.value = now.toLocaleDateString("en-US", options);
    };

    let dateInterval;

    onMounted(() => {
      const token = localStorage.getItem("doit_token");
      if (token) {
        isAuthenticated.value = true;
        loadUserData();
      }

      updateCurrentDate();
      dateInterval = setInterval(updateCurrentDate, 60000);
    });

    onUnmounted(() => {
      if (dateInterval) {
        clearInterval(dateInterval);
      }
    });

    const loadUserData = async () => {
      await store.dispatch("fetchCategories");
      await store.dispatch("fetchTodos");
    };

    const handleAuthSuccess = (data) => {
      isAuthenticated.value = true;
      // Force reload to ensure all data loads fresh
      window.location.reload();
      //loadUserData();
    };

    const handleLogout = () => {
      localStorage.removeItem("doit_token");
      localStorage.removeItem("doit_user");
      isAuthenticated.value = false;
      showLogin.value = true;

      store.commit("SET_TODOS", []);
      store.commit("SET_CATEGORIES", []);
    };

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
        const keepOpen = categoryData.keepOpen;
        delete categoryData.keepOpen;

        await store.dispatch("createCategory", categoryData);
        await store.dispatch("fetchCategories");

        if (!keepOpen) {
          showNewCategoryModal.value = false;
        }
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

    const handleDeleteAllCategories = async (alsoDeleteTodos) => {
      try {
        const categoriesToDelete = categories.value.filter(
          (cat) => cat.name !== "Inbox",
        );

        if (alsoDeleteTodos) {
          const todosToDelete = allTodos.value.filter(
            (todo) => todo.categoryId !== null,
          );
          for (const todo of todosToDelete) {
            await store.dispatch("deleteTodo", todo.id);
          }
        }

        for (const category of categoriesToDelete) {
          await store.dispatch("deleteCategory", category.id);
        }

        showManageModal.value = false;
      } catch (error) {
        console.error("Failed to delete all categories:", error);
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

    const handleSaveSettings = (newSettings) => {
      store.dispatch("updateSettings", newSettings);
      showSettingsModal.value = false;
    };

    const clearError = () => {
      store.commit("SET_ERROR", null);
    };

    return {
      isAuthenticated,
      showLogin,
      showNewTodoModal,
      showEditTodoModal,
      showNewCategoryModal,
      showEditCategoryModal,
      showDeleteCategoryModal,
      showManageModal,
      showSettingsModal,
      editingTodo,
      editingCategory,
      deletingCategory,
      categories,
      allTodos,
      filteredTodos,
      activeCategory,
      isLoading,
      error,
      settings,
      dateFormat,
      enableDueDateColors,
      dueDateColors,
      currentDate,
      handleAuthSuccess,
      handleLogout,
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
      handleDeleteAllCategories,
      createCategoryFromTodoForm,
      updateTodos,
      handleSaveSettings,
      clearError,
    };
  },
};
</script>

<style scoped>
.compact-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: #f7fafc;
  border-bottom: 1px solid #e2e8f0;
}

.compact-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.header-left {
  display: flex;
  gap: 8px;
}

.header-right {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.header-center {
  width: 100%;
  text-align: center;
  padding: 4px 0;
}

.current-date {
  font-size: 13px;
  font-weight: 600;
  color: #4a5568;
}

.btn-logout {
  background: #e53e3e;
  color: white;
}

.btn-logout:hover {
  background: #c53030;
}

@media (max-width: 768px) {
  .compact-header {
    flex-wrap: wrap;
  }

  .header-left,
  .header-right {
    flex: 0 0 auto;
  }

  .header-center {
    order: 3;
    flex-basis: 100%;
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid #e2e8f0;
  }

  .current-date {
    font-size: 12px;
  }
}
</style>
