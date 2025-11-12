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
        <div class="todo-item" :key="todo.id">
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
                  ✏️
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
              {{ truncateText(todo.description, 60) }}
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
              <span v-else class="todo-category" title="Unspecified">
                <span
                  class="category-indicator"
                  style="background-color: #808080"
                ></span>
                <span class="category-name-mobile">Unspecified</span>
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
      <div class="modal-content modal-compact">
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
                  {{ viewingTodo.category?.name || "Unspecified" }}
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
              ✏️ Edit
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

.category-name-mobile {
  display: inline;
}

.modal-compact {
  max-width: 500px;
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

  .detail-actions {
    flex-direction: column;
  }

  .detail-actions .btn {
    width: 100%;
  }
}
</style>
