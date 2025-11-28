<template>
  <div class="form-container">
    <h2>{{ isEditing ? "✏️ Edit Todo" : "➕ New Todo" }}</h2>

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
          class="form-control form-control-textarea"
          rows="4"
        ></textarea>
      </div>

      <div class="form-group">
        <label>Category</label>
        <div class="category-emoji-selector">
          <!-- Inbox option -->
          <div
            class="category-emoji-option"
            :class="{ selected: formData.categoryId === null }"
            @click="selectCategory(null)"
            title="Inbox"
          >
            📥
          </div>

          <!-- Category options -->
          <div
            v-for="category in filteredCategories"
            :key="category.id"
            class="category-emoji-option"
            :class="{ selected: formData.categoryId === category.id }"
            @click="selectCategory(category.id)"
            :title="category.name"
          >
            {{ category.emoji }}
          </div>
        </div>
      </div>

      <div class="form-group">
        <label for="dateToComplete">Due Date</label>
        <div class="date-input-group">
          <input
            id="dateToComplete"
            v-model="formData.dateToComplete"
            type="date"
            class="form-control"
          />
          <button
            type="button"
            @click="setQuickDate('tomorrow')"
            class="btn btn-quick-date"
            title="Tomorrow"
          >
            Tomorrow
          </button>
          <button
            type="button"
            @click="setQuickDate('2days')"
            class="btn btn-quick-date"
            title="In 2 days"
          >
            2 days
          </button>
          <button
            type="button"
            @click="setQuickDate('week')"
            class="btn btn-quick-date"
            title="In 7 days"
          >
            7 days
          </button>
        </div>
      </div>

      <div class="form-actions">
        <button
          type="button"
          @click="$emit('cancel')"
          class="btn btn-secondary"
        >
          ✖ Cancel
        </button>
        <button type="submit" class="btn btn-primary">
          {{ isEditing ? "💾 Update" : "➕ Create" }}
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
        : "",
    });

    const filteredCategories = computed(() => {
      return props.categories.filter((cat) => cat.name !== "Inbox");
    });

    const selectCategory = (categoryId) => {
      formData.value.categoryId = categoryId;
    };

    const setQuickDate = (type) => {
      const today = new Date();
      let targetDate = new Date();

      switch (type) {
        case "tomorrow":
          targetDate.setDate(today.getDate() + 1);
          break;
        case "2days":
          targetDate.setDate(today.getDate() + 2);
          break;
        case "week":
          targetDate.setDate(today.getDate() + 7);
          break;
      }

      formData.value.dateToComplete = targetDate.toISOString().split("T")[0];
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
      selectCategory,
      setQuickDate,
      handleSubmit,
    };
  },
};
</script>

<style scoped>
.category-emoji-selector {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(44px, 1fr));
  gap: 8px;
  padding: 8px;
  background: #f7fafc;
  border-radius: 8px;
  border: 2px solid #e2e8f0;
  max-height: 200px;
  overflow-y: auto;
}

.category-emoji-option {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  font-size: 24px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.category-emoji-option:hover {
  background: #edf2f7;
  transform: scale(1.1);
  border-color: #cbd5e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.category-emoji-option.selected {
  background: #667eea;
  border-color: #5568d3;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.form-control-textarea {
  resize: none;
  font-family: inherit;
}

.date-input-group {
  display: flex;
  gap: 6px;
  align-items: stretch;
  flex-wrap: wrap;
}

.date-input-group .form-control {
  flex: 1;
  min-width: 150px;
}

.btn-quick-date {
  padding: 8px 10px;
  background: #edf2f7;
  color: #4a5568;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-quick-date:hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
  transform: translateY(-1px);
}

@media (max-width: 480px) {
  .date-input-group {
    flex-direction: column;
  }

  .date-input-group .form-control {
    width: 100%;
  }

  .btn-quick-date {
    width: 100%;
  }

  .category-emoji-selector {
    grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
    max-height: 160px;
  }

  .category-emoji-option {
    width: 40px;
    height: 40px;
    font-size: 22px;
  }
}
</style>
