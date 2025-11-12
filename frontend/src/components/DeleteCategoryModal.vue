<template>
  <div class="modal-overlay" @click.self="$emit('cancel')">
    <div class="modal-content modal-compact">
      <button class="modal-close" @click="$emit('cancel')">×</button>
      <div class="delete-modal">
        <div class="modal-icon warning">⚠️</div>
        <h2>Delete Category</h2>
        <p class="modal-message">
          Are you sure you want to delete the category
          <strong>"{{ categoryName }}"</strong>?
        </p>

        <div class="modal-info" v-if="todosCount > 0">
          <span class="info-badge"
            >{{ todosCount }} todo{{ todosCount !== 1 ? "s" : "" }} in this
            category</span
          >
        </div>

        <div class="delete-option">
          <label class="checkbox-label">
            <input
              type="checkbox"
              v-model="deleteTodos"
              class="checkbox-input"
            />
            <span class="checkbox-text">
              Also delete all todos in this category
            </span>
          </label>
          <p class="option-note">
            {{
              deleteTodos
                ? "⚠️ This will permanently delete all todos in this category"
                : "ℹ️ Todos will be moved to Unspecified category"
            }}
          </p>
        </div>

        <div class="modal-actions">
          <button @click="$emit('cancel')" class="btn btn-secondary">
            ✖ Cancel
          </button>
          <button @click="handleConfirm" class="btn btn-danger">
            🗑️ Delete Category{{ deleteTodos ? " & Todos" : "" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";

export default {
  name: "DeleteCategoryModal",
  props: {
    categoryName: {
      type: String,
      required: true,
    },
    todosCount: {
      type: Number,
      default: 0,
    },
  },
  emits: ["confirm", "cancel"],
  setup(props, { emit }) {
    const deleteTodos = ref(false);

    const handleConfirm = () => {
      emit("confirm", deleteTodos.value);
    };

    return {
      deleteTodos,
      handleConfirm,
    };
  },
};
</script>

<style scoped>
.delete-modal {
  padding: 30px;
  text-align: center;
}

.modal-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.modal-icon.warning {
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

.delete-modal h2 {
  color: #2d3748;
  margin-bottom: 15px;
  font-size: 22px;
}

.modal-message {
  color: #4a5568;
  margin-bottom: 20px;
  line-height: 1.5;
}

.modal-message strong {
  color: #2d3748;
  font-weight: 600;
}

.modal-info {
  margin-bottom: 20px;
}

.info-badge {
  display: inline-block;
  background: #edf2f7;
  color: #4a5568;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.delete-option {
  background: #f7fafc;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 25px;
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

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.btn-danger {
  background: #fc8181;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-danger:hover {
  background: #f56565;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(252, 129, 129, 0.3);
}

@media (max-width: 768px) {
  .delete-modal {
    padding: 20px;
  }

  .modal-icon {
    font-size: 40px;
  }

  .delete-modal h2 {
    font-size: 20px;
  }

  .modal-actions {
    flex-direction: column;
  }

  .modal-actions .btn {
    width: 100%;
  }
}
</style>
