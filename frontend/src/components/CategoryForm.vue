<template>
  <div class="form-container">
    <h2>{{ isEditing ? 'Edit Category' : 'New Category' }}</h2>
    
    <form @submit.prevent="handleSubmit">
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
          class="form-control"
          rows="3"
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
          >
            Random
          </button>
        </div>
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
  name: 'CategoryForm',
  props: {
    category: {
      type: Object,
      default: null,
    },
  },
  emits: ['submit', 'cancel'],
  setup(props, { emit }) {
    const isEditing = computed(() => !!props.category);

    const generateRandomColor = () => {
      return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    };

    const formData = ref({
      name: props.category?.name || '',
      description: props.category?.description || '',
      color: props.category?.color || generateRandomColor(),
    });

    const randomizeColor = () => {
      formData.value.color = generateRandomColor();
    };

    const handleSubmit = () => {
      const submitData = {
        name: formData.value.name,
        description: formData.value.description || null,
        color: formData.value.color,
      };
      
      emit('submit', submitData);
    };

    return {
      isEditing,
      formData,
      randomizeColor,
      handleSubmit,
    };
  },
};
</script>
