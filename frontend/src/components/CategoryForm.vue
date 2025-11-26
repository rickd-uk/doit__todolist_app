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
          <option value="🛒">🛒 Shopping</option>
          <option value="💊">💊 Health</option>
          <option value="📚">📚 Teaching</option>
          <option value="💻">💻 Programming</option>
          <option value="👥">👥 People</option>
          <option value="💰">💰 Money</option>
          <option value="💡">💡 Ideas</option>
          <option value="🏃">🏃 Exercise</option>
          <option value="🏠">🏠 Home</option>
          <option value="📞">📞 Calls</option>
          <option value="✈️">✈️ Travel</option>
          <option value="🎯">🎯 Goals</option>
        </select>
      </div>

      <div class="form-group">
        <label for="name">Name *</label>
        <input
          id="name"
          v-model="formData.name"
          type="text"
          required
          placeholder="Enter category name"
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
  name: "CategoryForm",
  props: {
    category: {
      type: Object,
      default: null,
    },
  },
  emits: ["submit", "cancel"],
  setup(props, { emit }) {
    const isEditing = computed(() => !!props.category);

    // Emoji to name mapping
    const emojiNameMap = {
      "🛒": "Shopping",
      "💊": "Health",
      "📚": "Teaching",
      "💻": "Programming",
      "👥": "People",
      "💰": "Money",
      "💡": "Ideas",
      "🏃": "Exercise",
      "🏠": "Home",
      "📞": "Calls",
      "✈️": "Travel",
      "🎯": "Goals",
    };

    const generateRandomColor = () => {
      return (
        "#" +
        Math.floor(Math.random() * 16777215)
          .toString(16)
          .padStart(6, "0")
      );
    };

    const formData = ref({
      emoji: props.category?.emoji || "🛒",
      name: props.category?.name || "Shopping",
      description: props.category?.description || "",
      color: props.category?.color || generateRandomColor(),
    });

    const updateNameFromEmoji = () => {
      // Only update name if we're creating a new category (not editing)
      if (!isEditing.value) {
        const selectedEmoji = formData.value.emoji;
        if (emojiNameMap[selectedEmoji]) {
          formData.value.name = emojiNameMap[selectedEmoji];
        }
      }
    };

    const randomizeColor = () => {
      formData.value.color = generateRandomColor();
    };

    const handleSubmit = () => {
      const submitData = {
        emoji: formData.value.emoji,
        name: formData.value.name,
        description: formData.value.description || null,
        color: formData.value.color,
      };

      emit("submit", submitData);
    };

    return {
      isEditing,
      formData,
      randomizeColor,
      handleSubmit,
      updateNameFromEmoji,
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
</style>
