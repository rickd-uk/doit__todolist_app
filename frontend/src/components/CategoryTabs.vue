<template>
  <div class="category-tabs">
    <div
      class="category-tab"
      :class="{ active: activeCategory === 'all' }"
      @click="$emit('selectCategory', 'all')"
    >
      <span class="tab-label">📋 All</span>
    </div>

    <div
      v-if="hasUnspecifiedTodos"
      class="category-tab"
      :class="{ active: activeCategory === 'unspecified' }"
      @click="$emit('selectCategory', 'unspecified')"
    >
      <span class="tab-color" style="background-color: #808080"></span>
      <span class="tab-label">Inbox</span>
    </div>

    <div
      v-for="category in sortedCategories"
      :key="category.id"
      class="category-tab"
      :class="{ active: activeCategory === category.id }"
      @click="$emit('selectCategory', category.id)"
      :title="category.description || category.name"
    >
      <span
        class="tab-color"
        :style="{ backgroundColor: category.color }"
      ></span>
      <span class="tab-label">{{ category.name }}</span>
      <span v-if="category.description" class="tab-description">{{
        truncateDescription(category.description)
      }}</span>
    </div>

    <!-- Category action buttons - appears only when a category is selected -->
    <div
      v-if="activeCategory !== 'all' && activeCategory !== 'unspecified'"
      class="category-actions"
    >
      <button
        class="btn-action btn-edit-category"
        @click="editCategory(activeCategory)"
        title="Edit category"
      >
        ✏️
      </button>
      <button
        class="btn-action btn-delete-category"
        @click="deleteCategory(activeCategory)"
        title="Delete category"
      >
        🗑️
      </button>
    </div>
  </div>
</template>

<script>
import { computed } from "vue";
import { useStore } from "vuex";

export default {
  name: "CategoryTabs",
  props: {
    categories: {
      type: Array,
      required: true,
    },
    activeCategory: {
      type: String,
      required: true,
    },
    todos: {
      type: Array,
      required: true,
    },
  },
  emits: ["selectCategory", "editCategory", "deleteCategory"],
  setup(props, { emit }) {
    const store = useStore();

    const sortedCategories = computed(() => {
      return [...props.categories]
        .filter((cat) => cat.name !== "Unspecified")
        .sort((a, b) => a.order - b.order);
    });

    const hasUnspecifiedTodos = computed(() => {
      return props.todos.some((todo) => !todo.categoryId);
    });

    const editCategory = (categoryId) => {
      emit("editCategory", categoryId);
    };

    const deleteCategory = (categoryId) => {
      emit("deleteCategory", categoryId);
    };

    const truncateDescription = (description) => {
      if (!description) return "";
      return description.length > 30
        ? description.substring(0, 30) + "..."
        : description;
    };

    return {
      sortedCategories,
      hasUnspecifiedTodos,
      editCategory,
      deleteCategory,
      truncateDescription,
    };
  },
};
</script>

<style scoped>
.category-actions {
  margin-left: auto;
  padding-left: 12px;
  border-left: 2px solid #e2e8f0;
  display: flex;
  gap: 6px;
}

.btn-action {
  padding: 6px 10px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  border: 2px solid #e2e8f0;
}

.btn-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-edit-category:hover {
  background: #667eea;
  border-color: #667eea;
}

.btn-delete-category:hover {
  background: #fc8181;
  border-color: #fc8181;
}

.btn-delete-category:hover {
  background: #fc8181;
  border-color: #fc8181;
}

.tab-description {
  font-size: 11px;
  color: #718096;
  font-weight: 400;
  margin-left: 4px;
  font-style: italic;
}

.category-tab.active .tab-description {
  color: rgba(255, 255, 255, 0.8);
}

@media (max-width: 768px) {
  .category-actions {
    width: auto;
    margin-left: 0;
    padding-left: 0;
    border-left: none;
  }

  .btn-action {
    padding: 8px 12px;
  }

  .tab-description {
    display: none;
  }
}
</style>
