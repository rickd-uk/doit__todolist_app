<template>
  <div class="form-container">
    <h2>{{ isEditing ? "Edit Todo" : "New Todo" }}</h2>

    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="title">Title *</label>
        <input
          id="title"
          v-model="formData.title"
          type="text"
          required
          placeholder="Enter todo title"
          class="form-control"
        />
      </div>

      <div class="form-group">
        <label for="description">Description</label>
        <textarea
          id="description"
          v-model="formData.description"
          placeholder="Enter description (optional)"
          class="form-control"
          rows="4"
        ></textarea>
      </div>

      <div class="form-group">
        <label for="category">Category</label>
        <div class="category-input-group">
          <select
            id="category"
            v-model="formData.categoryId"
            class="form-control"
            :disabled="showNewCategoryForm"
          >
            <option :value="null">Unspecified</option>
            <option
              v-for="category in filteredCategories"
              :key="category.id"
              :value="category.id"
            >
              {{ category.name }}
            </option>
          </select>
          <button
            type="button"
            @click="toggleNewCategoryForm"
            class="btn btn-secondary"
            :class="{ 'btn-active': showNewCategoryForm }"
          >
            {{ showNewCategoryForm ? "Cancel" : "+ New" }}
          </button>
        </div>

        <!-- Inline New Category Form -->
        <div v-if="showNewCategoryForm" class="new-category-form">
          <div class="form-group">
            <label for="newCategoryName">Category Name *</label>
            <input
              id="newCategoryName"
              v-model="newCategory.name"
              type="text"
              placeholder="Enter category name"
              class="form-control"
              required
            />
          </div>

          <div class="form-group">
            <label for="newCategoryDescription">Description</label>
            <textarea
              id="newCategoryDescription"
              v-model="newCategory.description"
              placeholder="Enter description (optional)"
              class="form-control"
              rows="2"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="newCategoryColor">Color</label>
            <div class="color-input-group">
              <input
                id="newCategoryColor"
                v-model="newCategory.color"
                type="color"
                class="form-control-color"
              />
              <input
                v-model="newCategory.color"
                type="text"
                placeholder="#000000"
                class="form-control"
                pattern="^#[0-9A-Fa-f]{6}$"
              />
              <button
                type="button"
                @click="randomizeNewCategoryColor"
                class="btn btn-secondary"
              >
                Random
              </button>
            </div>
          </div>

          <button
            type="button"
            @click="createNewCategory"
            class="btn btn-success"
            :disabled="!newCategory.name"
          >
            Create Category
          </button>
        </div>
      </div>

      <div class="form-group">
        <label for="dateToComplete">Due Date</label>
        <input
          id="dateToComplete"
          v-model="formData.dateToComplete"
          type="date"
          class="form-control"
        />
      </div>

      <div class="form-actions">
        <button
          type="button"
          @click="$emit('cancel')"
          class="btn btn-secondary"
        >
          Cancel
        </button>
        <button type="submit" class="btn btn-primary">
          {{ isEditing ? "Update" : "Create" }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, computed } from "vue";

export default {
  name: "TodoForm",
  props: {
    todo: {
      type: Object,
      default: null,
    },
    categories: {
      type: Array,
      required: true,
    },
    activeCategory: {
      type: String,
      default: "all",
    },
  },
  emits: ["submit", "cancel", "createCategory"],
  setup(props, { emit }) {
    const isEditing = computed(() => !!props.todo);
    const showNewCategoryForm = ref(false);

    // Generate today's date in YYYY-MM-DD format
    const getTodayDate = () => {
      const today = new Date();
      return today.toISOString().split("T")[0];
    };

    // Determine default category based on active tab
    const getDefaultCategory = () => {
      if (
        props.activeCategory === "all" ||
        props.activeCategory === "unspecified"
      ) {
        return null;
      }
      return props.activeCategory;
    };

    const formData = ref({
      title: props.todo?.title || "",
      description: props.todo?.description || "",
      categoryId: props.todo?.categoryId || getDefaultCategory(),
      dateToComplete: props.todo?.dateToComplete
        ? new Date(props.todo.dateToComplete).toISOString().split("T")[0]
        : getTodayDate(), // Default to today
    });

    const generateRandomColor = () => {
      return (
        "#" +
        Math.floor(Math.random() * 16777215)
          .toString(16)
          .padStart(6, "0")
      );
    };

    const newCategory = ref({
      name: "",
      description: "",
      color: generateRandomColor(),
    });

    const filteredCategories = computed(() => {
      return props.categories.filter((cat) => cat.name !== "Unspecified");
    });

    const toggleNewCategoryForm = () => {
      showNewCategoryForm.value = !showNewCategoryForm.value;
      if (showNewCategoryForm.value) {
        // Reset form when opening
        newCategory.value = {
          name: "",
          description: "",
          color: generateRandomColor(),
        };
      }
    };

    const randomizeNewCategoryColor = () => {
      newCategory.value.color = generateRandomColor();
    };

    const createNewCategory = async () => {
      if (!newCategory.value.name) return;

      try {
        // Emit event to parent to create category
        emit("createCategory", {
          name: newCategory.value.name,
          description: newCategory.value.description || null,
          color: newCategory.value.color,
        });

        // Wait a bit for the category to be created and added to the list
        setTimeout(() => {
          // Find the newly created category by name and select it
          const createdCategory = props.categories.find(
            (cat) => cat.name === newCategory.value.name,
          );
          if (createdCategory) {
            formData.value.categoryId = createdCategory.id;
          }

          // Close the new category form
          showNewCategoryForm.value = false;
        }, 500);
      } catch (error) {
        console.error("Error creating category:", error);
      }
    };

    const handleSubmit = () => {
      const submitData = {
        title: formData.value.title,
        description: formData.value.description || null,
        categoryId: formData.value.categoryId || null,
        dateToComplete: formData.value.dateToComplete || null,
      };

      emit("submit", submitData);
    };

    return {
      isEditing,
      formData,
      filteredCategories,
      showNewCategoryForm,
      newCategory,
      toggleNewCategoryForm,
      randomizeNewCategoryColor,
      createNewCategory,
      handleSubmit,
    };
  },
};
</script>

<style scoped>
.category-input-group {
  display: flex;
  gap: 10px;
  align-items: stretch;
}

.category-input-group .form-control {
  flex: 1;
}

.category-input-group .btn {
  white-space: nowrap;
  min-width: 80px;
}

.btn-active {
  background: #fc8181 !important;
  color: white !important;
}

.btn-active:hover {
  background: #f56565 !important;
}

.new-category-form {
  margin-top: 16px;
  padding: 16px;
  background: #f7fafc;
  border-radius: 8px;
  border: 2px solid #e2e8f0;
}

.new-category-form .form-group {
  margin-bottom: 12px;
}

.new-category-form .form-group:last-of-type {
  margin-bottom: 16px;
}

.new-category-form .btn {
  width: 100%;
}

.color-input-group {
  display: flex;
  gap: 10px;
  align-items: center;
}

.form-control-color {
  width: 60px;
  height: 40px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
}

.color-input-group .form-control {
  flex: 1;
}
</style>
