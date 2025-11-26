<template>
  <div class="form-container">
    <h2>{{ isEditing ? "✏️ Edit Category" : "➕ New Category" }}</h2>

    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="emoji">Icon *</label>
        <select
          id="emoji"
          v-model="formData.emoji"
          @change="updateNameFromEmoji"
          required
          class="form-control emoji-select"
        >
          <option
            v-for="emoji in availableEmojis"
            :key="emoji.icon"
            :value="emoji.icon"
          >
            {{ emoji.icon }} {{ emoji.name }}
          </option>
        </select>
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
        <label for="color">Color</label>
        <div class="color-input-group">
          <input
            id="color"
            v-model="formData.color"
            type="color"
            class="form-control-color"
          />
          <input
            v-model="formData.color"
            type="text"
            placeholder="#000000"
            class="form-control"
            pattern="^#[0-9A-Fa-f]{6}$"
          />
          <button
            type="button"
            @click="randomizeColor"
            class="btn btn-secondary"
            title="Random Color"
          >
            🎲 Random
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
import { ref, computed } from "vue";

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

    // All available emojis with their default names
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

    const updateNameFromEmoji = () => {
      // Only auto-update name if we're creating a new category (not editing)
      // and only suggest the default name - user can still change it
      if (!isEditing.value) {
        const selectedEmoji = formData.value.emoji;
        const emojiData = allEmojis.find((e) => e.icon === selectedEmoji);
        if (emojiData) {
          formData.value.name = emojiData.name;
          checkCategoryNameExists();
        }
      }
    };

    const randomizeColor = () => {
      formData.value.color = generateRandomColor();
    };

    const handleSubmit = () => {
      if (categoryNameError.value || !formData.value.name.trim()) {
        return;
      }

      const submitData = {
        emoji: formData.value.emoji,
        name: formData.value.name.trim(),
        description: formData.value.description || null,
        color: formData.value.color,
      };

      emit("submit", submitData);
    };

    return {
      isEditing,
      formData,
      categoryNameError,
      availableEmojis,
      randomizeColor,
      handleSubmit,
      updateNameFromEmoji,
      checkCategoryNameExists,
    };
  },
};
</script>

<style scoped>
.emoji-select {
  font-size: 18px;
  padding: 12px 14px;
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
  flex-shrink: 0;
}

.color-input-group .form-control {
  flex: 1;
}

.color-input-group .btn {
  white-space: nowrap;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
``` Key changes: 1. **Filter out used emojis**: The `availableEmojis` computed
property now filters based on emoji icon (not name), so already-used emojis
won't appear in the dropdown 2. **Allow custom names**: Users can now type any
name they want - the auto-fill from emoji is just a suggestion that can be
changed 3. **Better validation**: Button is disabled only when there's a
duplicate name error OR the name field is empty Save to: ```
/home/claude/frontend/src/components/CategoryForm.vue
