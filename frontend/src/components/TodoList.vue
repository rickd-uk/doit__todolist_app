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
        <div class="todo-item">
          <div class="drag-handle">
            <span>⋮⋮</span>
          </div>

          <div class="todo-content">
            <div class="todo-header">
              <h3 class="todo-title">{{ todo.title }}</h3>
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
                  @click="$emit('deleteTodo', todo.id)"
                  title="Delete todo"
                >
                  🗑️
                </button>
              </div>
            </div>

            <p v-if="todo.description" class="todo-description">
              {{ todo.description }}
            </p>

            <div class="todo-meta">
              <span v-if="todo.category" class="todo-category">
                <span 
                  class="category-indicator"
                  :style="{ backgroundColor: todo.category.color }"
                ></span>
                {{ todo.category.name }}
              </span>
              <span v-else class="todo-category">
                <span 
                  class="category-indicator"
                  style="background-color: #808080;"
                ></span>
                Unspecified
              </span>

              <span class="todo-date">
                Created: {{ formatDate(todo.dateCreated) }}
              </span>

              <span v-if="todo.dateToComplete" class="todo-date due-date">
                Due: {{ formatDate(todo.dateToComplete) }}
              </span>
            </div>
          </div>
        </div>
      </template>
    </draggable>
  </div>
</template>

<script>
import { ref, watch } from 'vue';
import draggable from 'vuedraggable';

export default {
  name: 'TodoList',
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
  emits: ['editTodo', 'deleteTodo', 'updateTodos'],
  setup(props, { emit }) {
    const localTodos = ref([...props.todos]);

    watch(() => props.todos, (newTodos) => {
      localTodos.value = [...newTodos];
    }, { deep: true });

    const onDragEnd = () => {
      emit('updateTodos', localTodos.value);
    };

    const formatDate = (date) => {
      if (!date) return 'Unspecified';
      const d = new Date(date);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    };

    return {
      localTodos,
      onDragEnd,
      formatDate,
    };
  },
};
</script>
