<template>
  <div class="form-container">
    <h2>{{ isEditing ? "✏️ Edit Category" : "➕ New Category" }}</h2>

    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label>Icon *</label>
        <div class="emoji-grid">
          <div
            v-for="emoji in availableEmojis"
            :key="emoji.icon"
            class="emoji-option"
            :class="{ selected: formData.emoji === emoji.icon }"
            @click="selectEmoji(emoji)"
            :title="emoji.name"
          >
            {{ emoji.icon }}
          </div>
        </div>
      </div>

      <div class="form-group">
        <label for="name">Name *</label>
        <input
          id="name"
          v-model="formData.name"
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
        <label class="checkbox-label">
          <input
            type="checkbox"
            v-model="keepModalOpen"
            class="checkbox-input"
          />
          <span class="checkbox-text"> Keep open to add more categories</span>
        </label>
      </div>

      <div class="form-actions">
        <button
          type="button"
          @click="$emit('cancel')"
          class="btn btn-secondary"
        >
          ✖ Cancel
        </button>
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="!!categoryNameError || !formData.name.trim()"
        >
          {{ isEditing ? "💾 Update" : "➕ Create" }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, computed, watch } from "vue";

export default {
  name: "CategoryForm",
  props: {
    category: {
      type: Object,
      default: null,
    },
    categories: {
      type: Array,
      required: true,
    },
  },
  emits: ["submit", "cancel"],
  setup(props, { emit }) {
    const isEditing = computed(() => !!props.category);
    const categoryNameError = ref("");
    const keepModalOpen = ref(false);

    // All available emojis with their default names
    const allEmojis = [
      { icon: "🛒", name: "Shopping" },
      { icon: "💊", name: "Health" },
      { icon: "📚", name: "Study" },
      { icon: "💻", name: "Work" },
      { icon: "👥", name: "People" },
      { icon: "💰", name: "Money" },
      { icon: "💡", name: "Ideas" },
      { icon: "🏃", name: "Exercise" },
      { icon: "🏠", name: "Home" },
      { icon: "📞", name: "Calls" },
      { icon: "✈️", name: "Travel" },
      { icon: "🎯", name: "Goals" },
      { icon: "🍕", name: "Food" },
      { icon: "🎮", name: "Hobby" },
      { icon: "🔧", name: "Repairs" },
      { icon: "🎁", name: "Events" },
      { icon: "🐕", name: "Pets" },
      { icon: "📝", name: "Writing" },
    ];

    // Filter out emojis already used by other categories
    const availableEmojis = computed(() => {
      const usedEmojis = props.categories
        .filter((cat) => {
          // When editing, exclude current category
          if (isEditing.value && props.category) {
            return cat.id !== props.category.id;
          }
          return true;
        })
        .map((cat) => cat.emoji);

      return allEmojis.filter((emoji) => !usedEmojis.includes(emoji.icon));
    });

    const generateRandomColor = () => {
      return (
        "#" +
        Math.floor(Math.random() * 16777215)
          .toString(16)
          .padStart(6, "0")
      );
    };

    // Get first available emoji for new categories
    const getInitialEmoji = () => {
      if (props.category) {
        return props.category.emoji;
      }
      return availableEmojis.value.length > 0
        ? availableEmojis.value[0].icon
        : "🛒";
    };

    const getInitialName = () => {
      if (props.category) {
        return props.category.name;
      }
      return availableEmojis.value.length > 0
        ? availableEmojis.value[0].name
        : "";
    };

    const formData = ref({
      emoji: getInitialEmoji(),
      name: getInitialName(),
      description: props.category?.description || "",
      color: props.category?.color || generateRandomColor(),
    });

    const checkCategoryNameExists = () => {
      const name = formData.value.name.trim();
      if (!name) {
        categoryNameError.value = "";
        return;
      }

      // When editing, exclude the current category from the check
      const exists = props.categories.some(
        (cat) =>
          cat.name.toLowerCase() === name.toLowerCase() &&
          (!isEditing.value || cat.id !== props.category.id),
      );

      if (exists) {
        categoryNameError.value = `Category "${name}" already exists`;
      } else {
        categoryNameError.value = "";
      }
    };

    const selectEmoji = (emoji) => {
      formData.value.emoji = emoji.icon;

      // Only auto-update name if we're creating a new category (not editing)
      if (!isEditing.value) {
        formData.value.name = emoji.name;
        checkCategoryNameExists();
      }
    };

    watch(
      () => props.categories.length,
      () => {
        // Only update if we're creating and keeping modal open
        if (
          keepModalOpen.value &&
          !isEditing.value &&
          availableEmojis.value.length > 0
        ) {
          const nextEmoji = availableEmojis.value[0];
          formData.value.emoji = nextEmoji.icon;
          formData.value.name = nextEmoji.name;
        }
      },
    );

    const handleSubmit = () => {
      if (categoryNameError.value || !formData.value.name.trim()) {
        return;
      }

      const submitData = {
        emoji: formData.value.emoji,
        name: formData.value.name.trim(),
        description: formData.value.description || null,
        color: formData.value.color,
        keepOpen: keepModalOpen.value && !isEditing.value,
      };

      emit("submit", submitData);

      // If keepModalOpen is checked & we're creating (not editing), reset form
      if (keepModalOpen.value && !isEditing.value) {
        //reset form immediately, watcher will update emoji When
        // categories refresh
        formData.value = {
          emoji: formData.value.emoji,
          name: "",
          description: "",
          color: generateRandomColor(),
        };
        categoryNameError.value = "";
      }
    };

    return {
      isEditing,
      formData,
      categoryNameError,
      availableEmojis,
      keepModalOpen,
      selectEmoji,
      handleSubmit,
      checkCategoryNameExists,
    };
  },
};
</script>

<style scoped>
.emoji-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(36px, 1fr));
  gap: 6px;
  padding: 6px;
  background: #f7fafc;
  border-radius: 8px;
  border: 2px solid #e2e8f0;
  max-height: 200px;
  overflow-y: auto;
}

.emoji-option {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  font-size: 20px;
  background: white;
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

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  padding: 8px 0;
}

.checkbox-input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #667eea;
}

.checkbox-text {
  color: #4a5568;
  font-size: 14px;
}

@media (max-width: 480px) {
  .emoji-grid {
    grid-template-columns: repeat(auto-fill, minmax(34px, 1fr));
    max-height: 180px;
  }

  .emoji-option {
    width: 34px;
    height: 34px;
    font-size: 18px;
  }
}
</style>
