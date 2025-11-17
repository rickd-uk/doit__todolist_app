<template>
  <!-- Desktop: Horizontal Tabs -->
  <div class="category-tabs-desktop">
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

  <!-- Mobile: Dropdown -->
  <div class="category-tabs-mobile">
    <select
      class="category-select"
      :value="activeCategory"
      @change="$emit('selectCategory', $event.target.value)"
    >
      <option value="all">📋 All</option>
      <option v-if="hasUnspecifiedTodos" value="unspecified">📥 Inbox</option>
      <option
        v-for="category in sortedCategories"
        :key="category.id"
        :value="category.id"
      >
        {{ category.emoji || "📌" }} {{ category.name }}
      </option>
    </select>

    <div
      v-if="activeCategory !== 'all' && activeCategory !== 'unspecified'"
      class="category-actions-mobile"
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
import { computed, ref } from "vue";
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
/* Desktop Tabs */
.category-tabs {
  display: flex;
  gap: 8px;
  padding: 15px;
  background: #f7fafc;
  border-bottom: 2px solid #e2e8f0;
  overflow-x: auto;
  align-items: center;
}

.category-tab {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 50px;
  min-height: 50px;
  padding: 8px;
  background: white;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.category-tab:hover {
  background: #edf2f7;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.category-tab.active {
  background: #667eea;
  border-color: #5568d3;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.tab-emoji {
  font-size: 28px;
  line-height: 1;
  user-select: none;
}

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

/* Mobile Dropdown */
.category-tabs-mobile {
  display: none;
  padding: 15px;
  background: #f7fafc;
  border-bottom: 2px solid #e2e8f0;
}

.category-select {
  flex: 1;
  padding: 8px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  font-size: 16px;
  font-weight: 500;
  color: #2d3748;
  cursor: pointer;
}

.category-select:focus {
  outline: none;
  border-color: #667eea;
}

.category-actions-mobile {
  display: flex;
  gap: 6px;
}

/* Description Bar */
.category-description-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 15px;
  background: #f7fafc;
  border-bottom: 1px solid #e2e8f0;
  font-size: 13px;
  color: #4a5568;
}

.description-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.description-icon {
  font-size: 14px;
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
  font-size: 14px;
  padding: 2px 6px;
  transition: color 0.2s;
  flex-shrink: 0;
}

.btn-hide-description:hover {
  color: #718096;
}

.show-description-bar {
  padding: 6px 15px;
  background: #f7fafc;
  border-bottom: 1px solid #e2e8f0;
}

.btn-show-description {
  background: transparent;
  border: 1px solid #e2e8f0;
  color: #718096;
  cursor: pointer;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 6px;
  transition: all 0.2s;
}

.btn-show-description:hover {
  background: #edf2f7;
  color: #4a5568;
  border-color: #cbd5e0;
}

@media (max-width: 768px) {
  .category-tabs-desktop {
    display: none !important;
  }

  .category-tabs-mobile {
    display: flex !important;
    gap: 8px;
    align-items: center;
  }

  .tab-emoji {
    font-size: 32px;
  }

  .btn-action {
    padding: 10px 14px;
    font-size: 20px;
  }
}
</style>
