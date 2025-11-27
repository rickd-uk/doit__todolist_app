<template>
  <!-- Desktop: Horizontal Tabs -->
  <div>
    <div class="category-tabs">
      <div
        class="category-tab"
        :class="{ active: activeCategory === 'all' }"
        @click="$emit('selectCategory', 'all')"
        title="All"
      >
        <span class="tab-emoji">📋</span>
      </div>

      <div
        v-if="hasUnspecifiedTodos"
        class="category-tab"
        :class="{ active: activeCategory === 'unspecified' }"
        @click="$emit('selectCategory', 'unspecified')"
        title="Inbox"
      >
        <span class="tab-emoji">📥</span>
      </div>

      <div
        v-for="category in sortedCategories"
        :key="category.id"
        class="category-tab"
        :class="{ active: activeCategory === category.id }"
        @click="$emit('selectCategory', category.id)"
        :title="category.name"
      >
        <span class="tab-emoji">{{ category.emoji || "📌" }}</span>
      </div>

      <!-- Action buttons for selected category -->
      <div
        v-if="activeCategory !== 'all' && activeCategory !== 'unspecified'"
        class="category-actions"
      >
        <button
          class="btn-action btn-edit-category"
          @click="editCategory(activeCategory)"
          title="Edit category"
        >
          ⚙️
        </button>
        <button
          class="btn-action btn-delete-category"
          @click="deleteCategory(activeCategory)"
          title="Delete category"
        >
          ❌
        </button>
      </div>
    </div>

    <!-- Category Description Bar -->
    <div
      v-if="showDescriptionBar && activeCategoryDescription"
      class="category-description-bar"
    >
      <div class="description-content">
        <span class="description-icon">ℹ️</span>
        <span class="description-text">{{ activeCategoryDescription }}</span>
      </div>
      <button
        class="btn-hide-description"
        @click="toggleDescriptionBar"
        title="Hide description"
      >
        ✖
      </button>
    </div>
    <div
      v-else-if="!showDescriptionBar && activeCategoryDescription"
      class="show-description-bar"
    >
      <button class="btn-show-description" @click="toggleDescriptionBar">
        ℹ️ Show Description
      </button>
    </div>
  </div>
</template>

<script>
import { computed, ref } from "vue";

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
    const showDescriptionBar = ref(true);

    const sortedCategories = computed(() => {
      return [...props.categories]
        .filter((cat) => cat.name !== "Inbox")
        .sort((a, b) => a.order - b.order);
    });

    const hasUnspecifiedTodos = computed(() => {
      return props.todos.some((todo) => !todo.categoryId);
    });

    const activeCategoryDescription = computed(() => {
      if (
        props.activeCategory === "all" ||
        props.activeCategory === "unspecified"
      ) {
        return "";
      }
      const category = props.categories.find(
        (cat) => cat.id === props.activeCategory,
      );
      return category?.description || "";
    });

    const editCategory = (categoryId) => {
      emit("editCategory", categoryId);
    };

    const deleteCategory = (categoryId) => {
      emit("deleteCategory", categoryId);
    };

    const toggleDescriptionBar = () => {
      showDescriptionBar.value = !showDescriptionBar.value;
    };

    return {
      sortedCategories,
      hasUnspecifiedTodos,
      activeCategoryDescription,
      showDescriptionBar,
      editCategory,
      deleteCategory,
      toggleDescriptionBar,
    };
  },
};
</script>

<style scoped>
/* Desktop Tabs - Compact */
.category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px 12px;
  background: #f7fafc;
  border-bottom: 1px solid #e2e8f0;
  overflow-x: auto;
  align-items: center;
}

.category-tab {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  min-height: 40px;
  padding: 6px;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.category-tab:hover {
  background: #edf2f7;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.category-tab.active {
  background: #667eea;
  border-color: #5568d3;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.tab-emoji {
  font-size: 22px;
  line-height: 1;
  user-select: none;
}

.category-actions {
  margin-left: auto;
  padding-left: 8px;
  border-left: 2px solid #cbd5e0;
  display: flex;
  gap: 6px;
}

.btn-action {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border: none;
  border-radius: 6px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
  border: 2px solid #e2e8f0;
  color: #4a5568;
}

.btn-action:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.btn-edit-category:hover {
  background: #667eea;
  border-color: #667eea;
  color: white;
}

.btn-delete-category:hover {
  background: #fc8181;
  border-color: #fc8181;
  color: white;
}

/* Description Bar - Compact */
.category-description-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 6px 12px;
  background: #f7fafc;
  border-bottom: 1px solid #e2e8f0;
  font-size: 12px;
  color: #4a5568;
}

.description-content {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.description-icon {
  font-size: 13px;
  flex-shrink: 0;
}

.description-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-style: italic;
}

.btn-hide-description {
  background: transparent;
  border: none;
  color: #a0aec0;
  cursor: pointer;
  font-size: 13px;
  padding: 2px 4px;
  transition: color 0.2s;
  flex-shrink: 0;
}

.btn-hide-description:hover {
  color: #718096;
}

.show-description-bar {
  padding: 4px 12px;
  background: #f7fafc;
  border-bottom: 1px solid #e2e8f0;
}

.btn-show-description {
  background: transparent;
  border: 1px solid #e2e8f0;
  color: #718096;
  cursor: pointer;
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 5px;
  transition: all 0.2s;
}

.btn-show-description:hover {
  background: #edf2f7;
  color: #4a5568;
  border-color: #cbd5e0;
}

@media (max-width: 768px) {
  .category-tabs {
    gap: 8px;
    padding: 10px;
  }

  .category-tab {
    min-width: 44px;
    min-height: 44px;
  }

  .tab-emoji {
    font-size: 26px;
  }

  .category-actions {
    width: 100%;
    margin-left: 0;
    padding-left: 0;
    padding-top: 8px;
    border-left: none;
    border-top: 2px solid #cbd5e0;
    justify-content: center;
  }

  .btn-action {
    flex: 1;
    justify-content: center;
    padding: 10px 12px;
    font-size: 14px;
    min-height: 44px;
    border-width: 2px;
  }

  .action-icon {
    font-size: 18px;
  }

  .action-label {
    display: inline;
    font-weight: 600;
  }
}
</style>
