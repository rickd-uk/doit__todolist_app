<template>
  <div class="form-container">
    <h2>{{ isEditing ? 'Edit Todo' : 'New Todo' }}</h2>
    
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
          class="form-control"
          rows="4"
        ></textarea>
      </div>

      <div class="form-group">
        <label for="category">Category</label>
        <select
          id="category"
          v-model="formData.categoryId"
          class="form-control"
        >
          <option :value="null">Unspecified</option>
          <option
            v-for="category in filteredCategories"
            :key="category.id"
            :value="category.id"
          >
            {{ category.name }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="dateToComplete">Due Date</label>
        <input
          id="dateToComplete"
          v-model="formData.dateToComplete"
          type="date"
          class="form-control"
        />
      </div>

      <div class="form-actions">
        <button type="button" @click="$emit('cancel')" class="btn btn-secondary">
          Cancel
        </button>
        <button type="submit" class="btn btn-primary">
          {{ isEditing ? 'Update' : 'Create' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, computed } from 'vue';

export default {
  name: 'TodoForm',
  props: {
    todo: {
      type: Object,
      default: null,
    },
    categories: {
      type: Array,
      required: true,
    },
  },
  emits: ['submit', 'cancel'],
  setup(props, { emit }) {
    const isEditing = computed(() => !!props.todo);

    const formData = ref({
      title: props.todo?.title || '',
      description: props.todo?.description || '',
      categoryId: props.todo?.categoryId || null,
      dateToComplete: props.todo?.dateToComplete 
        ? new Date(props.todo.dateToComplete).toISOString().split('T')[0]
        : '',
    });

    const filteredCategories = computed(() => {
      return props.categories.filter(cat => cat.name !== 'Unspecified');
    });

    const handleSubmit = () => {
      const submitData = {
        title: formData.value.title,
        description: formData.value.description || null,
        categoryId: formData.value.categoryId || null,
        dateToComplete: formData.value.dateToComplete || null,
      };
      
      emit('submit', submitData);
    };

    return {
      isEditing,
      formData,
      filteredCategories,
      handleSubmit,
    };
  },
};
</script>
