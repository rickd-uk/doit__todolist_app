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
        <label for="category">Category</label>
        <div class="category-input-group">
          <select
            id="category"
            v-model="formData.categoryId"
            class="form-control"
            :disabled="showNewCategoryForm"
          >
            <option :value="null">📥 Inbox</option>
            <option
              v-for="category in filteredCategories"
              :key="category.id"
              :value="category.id"
            >
              {{ category.emoji }} {{ category.name }}
            </option>
          </select>
          <button
            type="button"
            @click="toggleNewCategoryForm"
            class="btn btn-secondary btn-icon-text"
            :class="{ 'btn-active': showNewCategoryForm }"
            :title="showNewCategoryForm ? 'Cancel' : 'New Category'"
          >
            {{ showNewCategoryForm ? "✖" : "➕" }}
          </button>
        </div>

        <!-- Inline New Category Form -->
        <div v-if="showNewCategoryForm" class="new-category-form">
          <div class="form-group">
            <label>Icon *</label>
            <div class="emoji-grid">
              <div
                v-for="emoji in availableEmojis"
                :key="emoji.icon"
                class="emoji-option"
                :class="{ selected: newCategory.emoji === emoji.icon }"
                @click="selectNewCategoryEmoji(emoji)"
                :title="emoji.name"
              >
                {{ emoji.icon }}
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="newCategoryName">Name *</label>
            <input
              id="newCategoryName"
              v-model="newCategory.name"
              @input="checkCategoryNameExists"
              type="text"
              required
              placeholder="Enter category name"
              class="form-control"
              :class="{ 'input-error': categoryNameError }"
            />
            <div v-if="categoryNameError" class="error-message">
              {{ categoryNameError }}
            </div>
          </div>

          <div class="form-group">
            <label for="newCategoryDescription">Description</label>
            <textarea
              id="newCategoryDescription"
              v-model="newCategory.description"
              placeholder="Enter description (optional)"
              class="form-control form-control-textarea"
              rows="3"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="newCategoryColor">Color</label>
            <div class="color-input-group-compact">
              <input
                id="newCategoryColor"
                v-model="newCategory.color"
                type="color"
                class="form-control-color"
              />
              <button
                type="button"
                @click="randomizeNewCategoryColor"
                class="btn btn-secondary"
                title="Random Color"
              >
                🎲
              </button>
            </div>
          </div>

          <button
            type="button"
            @click="createNewCategory"
            class="btn btn-success btn-full"
            :disabled="!newCategory.name || categoryNameError"
          >
            ✅ Create Category
          </button>
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
    const showNewCategoryForm = ref(false);
    const categoryNameError = ref("");

    // All available emojis with their names
    const allEmojis = [
      { icon: "🛒", name: "Shopping" },
      { icon: "💊", name: "Health" },
      { icon: "📚", name: "Teaching" },
      { icon: "💻", name: "Programming" },
      { icon: "👥", name: "People" },
      { icon: "💰", name: "Money" },
      { icon: "💡", name: "Ideas" },
      { icon: "🏃", name: "Exercise" },
      { icon: "🏠", name: "Home" },
      { icon: "📞", name: "Calls" },
      { icon: "✈️", name: "Travel" },
      { icon: "🎯", name: "Goals" },
    ];

    // Filter out emojis whose categories already exist
    const availableEmojis = computed(() => {
      const usedEmojis = props.categories.map((cat) => cat.emoji);
      return allEmojis.filter((emoji) => !usedEmojis.includes(emoji.icon));
    });

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

    const generateRandomColor = () => {
      return (
        "#" +
        Math.floor(Math.random() * 16777215)
          .toString(16)
          .padStart(6, "0")
      );
    };

    // Initialize with first available emoji
    const getInitialEmoji = () => {
      return availableEmojis.value.length > 0
        ? availableEmojis.value[0]
        : allEmojis[0];
    };

    const newCategory = ref({
      emoji: "",
      name: "",
      description: "",
      color: generateRandomColor(),
    });

    const filteredCategories = computed(() => {
      return props.categories.filter((cat) => cat.name !== "Inbox");
    });

    const checkCategoryNameExists = () => {
      const name = newCategory.value.name.trim();
      if (!name) {
        categoryNameError.value = "";
        return;
      }

      const exists = props.categories.some(
        (cat) => cat.name.toLowerCase() === name.toLowerCase(),
      );

      if (exists) {
        categoryNameError.value = `Category "${name}" already exists`;
      } else {
        categoryNameError.value = "";
      }
    };

    const selectNewCategoryEmoji = (emoji) => {
      newCategory.value.emoji = emoji.icon;
      newCategory.value.name = emoji.name;
      checkCategoryNameExists();
    };

    const toggleNewCategoryForm = () => {
      showNewCategoryForm.value = !showNewCategoryForm.value;
      if (showNewCategoryForm.value) {
        const initialEmoji = getInitialEmoji();
        newCategory.value = {
          emoji: initialEmoji.icon,
          name: initialEmoji.name,
          description: "",
          color: generateRandomColor(),
        };
        categoryNameError.value = "";
      }
    };

    const randomizeNewCategoryColor = () => {
      newCategory.value.color = generateRandomColor();
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

    const createNewCategory = async () => {
      if (!newCategory.value.name || categoryNameError.value) return;

      try {
        emit("createCategory", {
          emoji: newCategory.value.emoji,
          name: newCategory.value.name,
          description: newCategory.value.description || null,
          color: newCategory.value.color,
        });

        setTimeout(() => {
          const createdCategory = props.categories.find(
            (cat) => cat.name === newCategory.value.name,
          );
          if (createdCategory) {
            formData.value.categoryId = createdCategory.id;
          }
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
      categoryNameError,
      availableEmojis,
      toggleNewCategoryForm,
      randomizeNewCategoryColor,
      createNewCategory,
      setQuickDate,
      handleSubmit,
      selectNewCategoryEmoji,
      checkCategoryNameExists,
    };
  },
};
</script>

<style scoped>
.category-input-group {
  display: flex;
  gap: 8px;
  align-items: stretch;
}

.category-input-group .form-control {
  flex: 1;
}

.btn-icon-text {
  min-width: 42px;
  font-size: 18px;
  padding: 8px 12px;
}

.btn-active {
  background: #fc8181 !important;
  color: white !important;
}

.btn-active:hover {
  background: #f56565 !important;
}

.new-category-form {
  margin-top: 12px;
  padding: 12px;
  background: #f7fafc;
  border-radius: 8px;
  border: 2px solid #e2e8f0;
}

.new-category-form .form-group {
  margin-bottom: 10px;
}

.new-category-form .form-group:last-of-type {
  margin-bottom: 12px;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(34px, 1fr));
  gap: 5px;
  padding: 6px;
  background: white;
  border-radius: 8px;
  border: 2px solid #e2e8f0;
  max-height: 160px;
  overflow-y: auto;
}

.emoji-option {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  font-size: 18px;
  background: #f7fafc;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.emoji-option:hover {
  background: #edf2f7;
  transform: scale(1.15);
  border-color: #cbd5e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.emoji-option.selected {
  background: #667eea;
  border-color: #5568d3;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.form-control-textarea {
  resize: none;
  font-family: inherit;
}

.input-error {
  border-color: #fc8181 !important;
}

.error-message {
  color: #fc8181;
  font-size: 12px;
  margin-top: 4px;
  font-weight: 500;
}

.color-input-group-compact {
  display: flex;
  gap: 8px;
  align-items: center;
}

.form-control-color {
  width: 50px;
  height: 38px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  flex-shrink: 0;
}

.color-input-group-compact .btn {
  flex: 1;
  font-size: 20px;
}

.btn-full {
  width: 100%;
}

.btn-full:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

  .emoji-grid {
    grid-template-columns: repeat(auto-fill, minmax(32px, 1fr));
    max-height: 140px;
  }

  .emoji-option {
    width: 32px;
    height: 32px;
    font-size: 16px;
  }
}
</style>
