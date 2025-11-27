<template>
  <div class="manage-container">
    <h2>⚙️ Manage Categories</h2>

    <div class="manage-section">
      <div class="section-header">
        <h3>🗑️ Danger Zone</h3>
        <p class="section-description">
          Irreversible actions - use with caution
        </p>
      </div>

      <div class="danger-actions">
        <button
          @click="showDeleteAllConfirm = true"
          class="btn btn-danger-outline"
        >
          🗑️ Delete All Categories
        </button>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <div
      v-if="showDeleteAllConfirm"
      class="confirm-overlay"
      @click.self="showDeleteAllConfirm = false"
    >
      <div class="confirm-dialog">
        <div class="confirm-icon">⚠️</div>
        <h3>Delete All Categories?</h3>
        <p class="confirm-message">
          This will delete <strong>all {{ categoryCount }} categories</strong>.
        </p>

        <div class="delete-option">
          <label class="checkbox-label">
            <input
              type="checkbox"
              v-model="alsoDeleteTodos"
              class="checkbox-input"
            />
            <span class="checkbox-text">
              Also delete all todos in these categories ({{ todoCount }} todos)
            </span>
          </label>
          <p class="option-note">
            {{
              alsoDeleteTodos
                ? "⚠️ All categories AND their todos will be permanently deleted"
                : "ℹ️ Todos will be moved to Inbox"
            }}
          </p>
        </div>

        <div class="type-to-confirm">
          <label for="confirmText">
            Type <strong>DELETE ALL</strong> to confirm:
          </label>
          <input
            id="confirmText"
            v-model="confirmationText"
            type="text"
            placeholder="Type here..."
            class="confirm-input"
          />
        </div>

        <div class="confirm-actions">
          <button
            @click="showDeleteAllConfirm = false"
            class="btn btn-secondary"
          >
            ✖ Cancel
          </button>
          <button
            @click="handleDeleteAll"
            class="btn btn-danger"
            :disabled="confirmationText !== 'DELETE ALL'"
          >
            🗑️ Delete All Categories
          </button>
        </div>
      </div>
    </div>

    <div class="manage-actions">
      <button @click="$emit('close')" class="btn btn-secondary">
        ✖ Close
      </button>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";

export default {
  name: "ManageCategories",
  props: {
    categories: {
      type: Array,
      required: true,
    },
    todos: {
      type: Array,
      required: true,
    },
  },
  emits: ["close", "deleteAll"],
  setup(props, { emit }) {
    const showDeleteAllConfirm = ref(false);
    const alsoDeleteTodos = ref(false);
    const confirmationText = ref("");

    const categoryCount = props.categories.filter(
      (cat) => cat.name !== "Inbox",
    ).length;

    const todoCount = props.todos.filter(
      (todo) => todo.categoryId !== null,
    ).length;

    const handleDeleteAll = () => {
      if (confirmationText.value !== "DELETE ALL") {
        return;
      }

      emit("deleteAll", alsoDeleteTodos.value);
      showDeleteAllConfirm.value = false;
      confirmationText.value = "";
      emit("close");
    };

    return {
      showDeleteAllConfirm,
      alsoDeleteTodos,
      confirmationText,
      categoryCount,
      todoCount,
      handleDeleteAll,
    };
  },
};
</script>

<style scoped>
.manage-container {
  padding: 24px;
  max-width: 600px;
}

.manage-container h2 {
  margin-bottom: 24px;
  color: #2d3748;
  font-size: 22px;
}

.manage-section {
  margin-bottom: 24px;
}

.section-header {
  margin-bottom: 16px;
}

.section-header h3 {
  color: #e53e3e;
  font-size: 18px;
  margin-bottom: 4px;
}

.section-description {
  color: #718096;
  font-size: 13px;
}

.danger-actions {
  padding: 16px;
  background: #fff5f5;
  border: 2px solid #feb2b2;
  border-radius: 8px;
}

.btn-danger-outline {
  background: white;
  color: #e53e3e;
  border: 2px solid #e53e3e;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-danger-outline:hover {
  background: #e53e3e;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(229, 62, 62, 0.3);
}

.confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.confirm-dialog {
  background: white;
  border-radius: 12px;
  padding: 30px;
  max-width: 500px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
}

.confirm-icon {
  font-size: 60px;
  margin-bottom: 16px;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.confirm-dialog h3 {
  color: #2d3748;
  margin-bottom: 12px;
  font-size: 20px;
}

.confirm-message {
  color: #4a5568;
  margin-bottom: 20px;
  line-height: 1.5;
}

.confirm-message strong {
  color: #e53e3e;
  font-weight: 600;
}

.delete-option {
  background: #f7fafc;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 20px;
  text-align: left;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}

.checkbox-input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #fc8181;
}

.checkbox-text {
  color: #2d3748;
  font-weight: 500;
  font-size: 14px;
}

.option-note {
  margin-top: 10px;
  font-size: 13px;
  color: #718096;
  padding-left: 28px;
  line-height: 1.4;
}

.type-to-confirm {
  margin-bottom: 20px;
  text-align: left;
}

.type-to-confirm label {
  display: block;
  margin-bottom: 8px;
  color: #2d3748;
  font-size: 14px;
  font-weight: 500;
}

.type-to-confirm strong {
  color: #e53e3e;
  font-weight: 700;
}

.confirm-input {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  font-family: monospace;
  transition: border-color 0.2s ease;
}

.confirm-input:focus {
  outline: none;
  border-color: #e53e3e;
}

.confirm-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn-danger {
  background: #e53e3e;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-danger:hover:not(:disabled) {
  background: #c53030;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(229, 62, 62, 0.3);
}

.btn-danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.manage-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
}

@media (max-width: 768px) {
  .confirm-dialog {
    padding: 20px;
  }

  .confirm-icon {
    font-size: 48px;
  }

  .confirm-actions {
    flex-direction: column;
  }

  .confirm-actions .btn {
    width: 100%;
  }
}
</style>
