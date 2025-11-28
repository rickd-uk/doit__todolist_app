<template>
  <div class="todo-list">
    <div v-if="todos.length === 0" class="empty-state">
      <p>No todos yet. Create your first one! 🎯</p>
    </div>

    <draggable
      v-else
      v-model="localTodos"
      item-key="id"
      @end="onDragEnd"
      class="draggable-list"
      handle=".drag-handle"
    >
      <template #item="{ element: todo }">
        <div class="todo-item" :key="todo.id" :class="getDueDateClass(todo)">
          <div class="drag-handle" title="Drag to reorder">
            <span>⋮⋮</span>
          </div>

          <div class="todo-content">
            <div class="todo-header">
              <h3 class="todo-title" @click="viewTodo(todo)">
                {{ todo.title }}
              </h3>
              <div class="todo-actions">
                <button
                  class="btn-icon btn-edit"
                  @click="$emit('editTodo', todo)"
                  title="Edit todo"
                >
                  📝
                </button>
                <button
                  class="btn-icon btn-delete"
                  @click.stop="$emit('deleteTodo', todo.id)"
                  title="Delete todo"
                >
                  🗑️
                </button>
              </div>
            </div>

            <p
              v-if="todo.description"
              class="todo-description-preview"
              @click="viewTodo(todo)"
              title="Click to view full description"
            >
              {{ truncateText(todo.description.split("\n")[0], 60) }}
              <span v-if="todo.description.includes('\n')" class="more-text"
                >...</span
              >
            </p>

            <div class="todo-meta">
              <span
                v-if="todo.category"
                class="todo-category"
                :title="todo.category.name"
              >
                <span
                  class="category-indicator"
                  :style="{ backgroundColor: todo.category.color }"
                ></span>
                <span class="category-name-mobile">{{
                  truncateText(todo.category.name, 15)
                }}</span>
              </span>
              <span v-else class="todo-category" title="Inbox">
                <span
                  class="category-indicator"
                  style="background-color: #808080"
                ></span>
                <span class="category-name-mobile">Inbox</span>
              </span>

              <span
                class="todo-date"
                :title="'Created: ' + formatDate(todo.dateCreated)"
              >
                📅 {{ formatDateShort(todo.dateCreated) }}
              </span>

              <span
                v-if="todo.dateToComplete"
                class="todo-date due-date"
                :title="'Due: ' + formatDate(todo.dateToComplete)"
              >
                ⏰ {{ formatDateShort(todo.dateToComplete) }}
              </span>
            </div>
          </div>
        </div>
      </template>
    </draggable>

    <!-- Todo Detail Modal -->
    <div v-if="viewingTodo" class="modal-overlay" @click.self="closeViewModal">
      <div class="modal-content modal-constrained">
        <button class="modal-close" @click="closeViewModal">×</button>
        <div class="todo-detail">
          <h2>{{ viewingTodo.title }}</h2>

          <div class="detail-section" v-if="viewingTodo.description">
            <h3>📝 Description</h3>
            <p class="detail-description">{{ viewingTodo.description }}</p>
          </div>

          <div class="detail-section">
            <h3>ℹ️ Details</h3>
            <div class="detail-info">
              <div class="detail-row">
                <span class="detail-label">Category:</span>
                <span class="todo-category">
                  <span
                    class="category-indicator"
                    :style="{
                      backgroundColor: viewingTodo.category?.color || '#808080',
                    }"
                  ></span>
                  {{ viewingTodo.category?.name || "Inbox" }}
                </span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Created:</span>
                <span>{{ formatDate(viewingTodo.dateCreated) }}</span>
              </div>
              <div class="detail-row" v-if="viewingTodo.dateToComplete">
                <span class="detail-label">Due:</span>
                <span class="due-date">{{
                  formatDate(viewingTodo.dateToComplete)
                }}</span>
              </div>
            </div>
          </div>

          <div class="detail-actions">
            <button @click="editFromView" class="btn btn-primary">
              📝 Edit
            </button>
            <button @click="closeViewModal" class="btn btn-secondary">
              ✖ Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from "vue";
import draggable from "vuedraggable";

export default {
  name: "TodoList",
  components: {
    draggable,
  },
  props: {
    todos: {
      type: Array,
      required: true,
    },
    activeCategory: {
      type: String,
      required: true,
    },
  },
  emits: ["editTodo", "deleteTodo", "updateTodos"],
  setup(props, { emit }) {
    const localTodos = ref([...props.todos]);
    const viewingTodo = ref(null);

    watch(
      () => props.todos,
      (newTodos) => {
        localTodos.value = newTodos.map((todo) => ({
          ...todo,
          category: todo.category ? { ...todo.category } : null,
        }));
      },
      { deep: true, immediate: true },
    );

    const onDragEnd = () => {
      const reorderedTodos = localTodos.value.map((todo, index) => ({
        id: todo.id,
        order: index,
        categoryId: todo.categoryId,
        title: todo.title,
        description: todo.description,
        dateCreated: todo.dateCreated,
        dateToComplete: todo.dateToComplete,
        completed: todo.completed,
        category: todo.category,
      }));
      emit("updateTodos", reorderedTodos);
    };

    const formatDate = (date) => {
      if (!date) return "Unspecified";
      const d = new Date(date);
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    };

    const formatDateShort = (date) => {
      if (!date) return "N/A";
      const d = new Date(date);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    };

    const truncateText = (text, maxLength) => {
      if (!text) return "";
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + "...";
    };

    const viewTodo = (todo) => {
      viewingTodo.value = { ...todo };
    };

    const closeViewModal = () => {
      viewingTodo.value = null;
    };

    const editFromView = () => {
      emit("editTodo", viewingTodo.value);
      closeViewModal();
    };

    const getDueDateClass = (todo) => {
      if (!todo.dateToComplete) return "";

      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const dueDate = new Date(todo.dateToComplete);
      dueDate.setHours(0, 0, 0, 0);

      const diffTime = dueDate - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) return "due-overdue";
      if (diffDays === 0) return "due-today";
      if (diffDays === 1) return "due-tomorrow";
      if (diffDays === 2) return "due-2days";
      if (diffDays === 3) return "due-3days";
      if (diffDays <= 7) return "due-week";

      return "";
    };

    return {
      localTodos,
      viewingTodo,
      onDragEnd,
      formatDate,
      formatDateShort,
      truncateText,
      viewTodo,
      closeViewModal,
      editFromView,
      getDueDateClass,
    };
  },
};
</script>

<style scoped>
.todo-description-preview {
  color: #4a5568;
  margin: 6px 0;
  line-height: 1.4;
  cursor: pointer;
  font-size: 14px;
}

.todo-description-preview:hover {
  color: #2d3748;
  text-decoration: underline;
}

.more-text {
  color: #a0aec0;
  font-style: italic;
}

.category-name-mobile {
  display: inline;
}

/* Due date color coding */
.due-overdue {
  background: #fee !important;
  border-left: 4px solid #dc2626 !important;
}

.due-today {
  background: #fef2f2 !important;
  border-left: 4px solid #ef4444 !important;
  box-shadow: 0 1px 3px rgba(239, 68, 68, 0.2) !important;
}

.due-tomorrow {
  background: #fff7ed !important;
  border-left: 4px solid #f97316 !important;
}

.due-2days {
  background: #fffbeb !important;
  border-left: 4px solid #f59e0b !important;
}

.due-3days {
  background: #fefce8 !important;
  border-left: 4px solid #eab308 !important;
}

.due-week {
  background: #fefce8 !important;
  border-left: 4px solid #d4d700 !important;
}

.modal-constrained {
  max-width: 700px;
  width: 90%;
}

.todo-detail {
  padding: 20px;
}

.todo-detail h2 {
  color: #2d3748;
  margin-bottom: 20px;
  font-size: 22px;
}

.detail-section {
  margin-bottom: 20px;
}

.detail-section h3 {
  color: #4a5568;
  font-size: 16px;
  margin-bottom: 10px;
  font-weight: 600;
}

.detail-description {
  background: #f7fafc;
  padding: 12px;
  border-radius: 8px;
  line-height: 1.6;
  color: #2d3748;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.detail-info {
  background: #f7fafc;
  padding: 12px;
  border-radius: 8px;
}

.detail-row {
  display: flex;
  align-items: center;
  padding: 6px 0;
  gap: 12px;
}

.detail-label {
  font-weight: 600;
  color: #4a5568;
  min-width: 70px;
}

.detail-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .category-name-mobile {
    max-width: 80px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .todo-meta {
    flex-wrap: wrap;
    gap: 6px !important;
  }

  .todo-date {
    font-size: 11px;
    padding: 3px 8px !important;
  }

  /* Make todo header single line on mobile */
  .todo-header {
    flex-direction: row !important;
    align-items: center !important;
    gap: 8px !important;
  }

  .todo-title {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin: 0 !important;
  }

  .todo-actions {
    flex-shrink: 0;
    margin-left: auto;
  }

  .btn-icon {
    font-size: 18px !important;
    padding: 4px 6px !important;
  }

  .detail-actions {
    flex-direction: column;
  }

  .detail-actions .btn {
    width: 100%;
  }

  .modal-constrained {
    width: 95%;
  }
}
</style>
