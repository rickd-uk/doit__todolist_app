<template>
  <div class="category-tabs">
    <div
      class="category-tab"
      :class="{ active: activeCategory === 'all' }"
      @click="$emit('selectCategory', 'all')"
    >
      <span class="tab-label">All</span>
    </div>

    <div
      v-if="hasUnspecifiedTodos"
      class="category-tab"
      :class="{ active: activeCategory === 'unspecified' }"
      @click="$emit('selectCategory', 'unspecified')"
    >
      <span class="tab-color" style="background-color: #808080"></span>
      <span class="tab-label">Unspecified</span>
    </div>

    <div
      v-for="category in sortedCategories"
      :key="category.id"
      class="category-tab"
      :class="{ active: activeCategory === category.id }"
      @click="$emit('selectCategory', category.id)"
    >
      <span
        class="tab-color"
        :style="{ backgroundColor: category.color }"
      ></span>
      <span class="tab-label">{{ category.name }}</span>
    </div>

    <!-- Delete category buttons section - appears only when a category is selected -->
    <div
      v-if="activeCategory !== 'all' && activeCategory !== 'unspecified'"
      class="category-actions"
    >
      <button
        class="btn-delete-category"
        @click="deleteCategory(activeCategory)"
        title="Delete this category"
      >
        🗑️ Delete Category
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
  emits: ["selectCategory"],
  setup(props) {
    const store = useStore();

    const sortedCategories = computed(() => {
      return [...props.categories]
        .filter((cat) => cat.name !== "Unspecified")
        .sort((a, b) => a.order - b.order);
    });

    const hasUnspecifiedTodos = computed(() => {
      return props.todos.some((todo) => !todo.categoryId);
    });

    const deleteCategory = async (categoryId) => {
      if (
        confirm(
          "Are you sure you want to delete this category? Todos will be moved to Unspecified.",
        )
      ) {
        try {
          await store.dispatch("deleteCategory", categoryId);
        } catch (error) {
          console.error("Failed to delete category:", error);
        }
      }
    };

    return {
      sortedCategories,
      hasUnspecifiedTodos,
      deleteCategory,
    };
  },
};
</script>
