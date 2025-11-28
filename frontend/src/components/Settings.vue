<template>
  <div class="settings-container">
    <h2>⚙️ Settings</h2>

    <!-- Date Format Settings -->
    <div class="settings-section">
      <div class="section-header">
        <h3>📅 Date Display</h3>
        <p class="section-description">Choose how dates are displayed</p>
      </div>

      <div class="setting-item">
        <label class="radio-label">
          <input
            type="radio"
            name="dateFormat"
            value="relative"
            v-model="localSettings.dateFormat"
            class="radio-input"
          />
          <span class="radio-text">
            <strong>Relative</strong> - "Tomorrow", "In 2 days", etc.
          </span>
        </label>
      </div>

      <div class="setting-item">
        <label class="radio-label">
          <input
            type="radio"
            name="dateFormat"
            value="explicit"
            v-model="localSettings.dateFormat"
            class="radio-input"
          />
          <span class="radio-text">
            <strong>Explicit</strong> - "Jan 15, 2024", "Dec 3, 2024", etc.
          </span>
        </label>
      </div>
    </div>

    <!-- Due Date Colors Settings -->
    <div class="settings-section">
      <div class="section-header">
        <h3>🎨 Due Date Colors</h3>
        <p class="section-description">
          Customize background colors for todos based on due dates
        </p>
      </div>

      <div class="color-settings">
        <div class="color-setting-item">
          <label class="color-label">
            <span class="color-name">Overdue</span>
            <input
              type="color"
              v-model="localSettings.dueDateColors.overdue"
              class="color-picker"
            />
            <span class="color-value">{{
              localSettings.dueDateColors.overdue
            }}</span>
          </label>
        </div>

        <div class="color-setting-item">
          <label class="color-label">
            <span class="color-name">Due Today</span>
            <input
              type="color"
              v-model="localSettings.dueDateColors.today"
              class="color-picker"
            />
            <span class="color-value">{{
              localSettings.dueDateColors.today
            }}</span>
          </label>
        </div>

        <div class="color-setting-item">
          <label class="color-label">
            <span class="color-name">Due Tomorrow</span>
            <input
              type="color"
              v-model="localSettings.dueDateColors.tomorrow"
              class="color-picker"
            />
            <span class="color-value">{{
              localSettings.dueDateColors.tomorrow
            }}</span>
          </label>
        </div>

        <div class="color-setting-item">
          <label class="color-label">
            <span class="color-name">Due in 2 Days</span>
            <input
              type="color"
              v-model="localSettings.dueDateColors.twoDays"
              class="color-picker"
            />
            <span class="color-value">{{
              localSettings.dueDateColors.twoDays
            }}</span>
          </label>
        </div>

        <div class="color-setting-item">
          <label class="color-label">
            <span class="color-name">Due in 3 Days</span>
            <input
              type="color"
              v-model="localSettings.dueDateColors.threeDays"
              class="color-picker"
            />
            <span class="color-value">{{
              localSettings.dueDateColors.threeDays
            }}</span>
          </label>
        </div>

        <div class="color-setting-item">
          <label class="color-label">
            <span class="color-name">Due in 4-7 Days</span>
            <input
              type="color"
              v-model="localSettings.dueDateColors.week"
              class="color-picker"
            />
            <span class="color-value">{{
              localSettings.dueDateColors.week
            }}</span>
          </label>
        </div>
      </div>

      <button @click="resetColors" class="btn btn-secondary btn-reset">
        🔄 Reset to Defaults
      </button>
    </div>

    <div class="settings-actions">
      <button @click="$emit('cancel')" class="btn btn-secondary">
        ✖ Cancel
      </button>
      <button @click="saveSettings" class="btn btn-primary">💾 Save</button>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";

const DEFAULT_COLORS = {
  overdue: "#fee2e2",
  today: "#fef2f2",
  tomorrow: "#fff7ed",
  twoDays: "#fffbeb",
  threeDays: "#fefce8",
  week: "#fefce8",
};

export default {
  name: "Settings",
  props: {
    settings: {
      type: Object,
      required: true,
    },
  },
  emits: ["save", "cancel"],
  setup(props, { emit }) {
    const localSettings = ref({
      dateFormat: props.settings.dateFormat || "relative",
      dueDateColors: { ...props.settings.dueDateColors },
    });

    const resetColors = () => {
      localSettings.value.dueDateColors = { ...DEFAULT_COLORS };
    };

    const saveSettings = () => {
      emit("save", localSettings.value);
    };

    return {
      localSettings,
      resetColors,
      saveSettings,
    };
  },
};
</script>

<style scoped>
.settings-container {
  padding: 24px;
  max-width: 700px;
}

.settings-container h2 {
  margin-bottom: 24px;
  color: #2d3748;
  font-size: 22px;
}

.settings-section {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e2e8f0;
}

.settings-section:last-of-type {
  border-bottom: none;
}

.section-header {
  margin-bottom: 16px;
}

.section-header h3 {
  color: #2d3748;
  font-size: 18px;
  margin-bottom: 4px;
  font-weight: 600;
}

.section-description {
  color: #718096;
  font-size: 13px;
}

.setting-item {
  padding: 12px;
  background: #f7fafc;
  border-radius: 8px;
  margin-bottom: 8px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  user-select: none;
}

.radio-input {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #667eea;
  flex-shrink: 0;
}

.radio-text {
  color: #2d3748;
  font-size: 14px;
  line-height: 1.5;
}

.radio-text strong {
  font-weight: 600;
  color: #1a202c;
}

.color-settings {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.color-setting-item {
  background: #f7fafc;
  border-radius: 8px;
  padding: 12px;
}

.color-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.color-name {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: #2d3748;
}

.color-picker {
  width: 40px;
  height: 40px;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  flex-shrink: 0;
}

.color-picker::-webkit-color-swatch-wrapper {
  padding: 2px;
}

.color-picker::-webkit-color-swatch {
  border: none;
  border-radius: 4px;
}

.color-value {
  font-family: monospace;
  font-size: 12px;
  color: #718096;
  min-width: 70px;
}

.btn-reset {
  margin-top: 8px;
}

.settings-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
}

@media (max-width: 768px) {
  .settings-container {
    padding: 20px;
  }

  .color-settings {
    grid-template-columns: 1fr;
  }

  .settings-actions {
    flex-direction: column;
  }

  .settings-actions .btn {
    width: 100%;
  }
}
</style>
