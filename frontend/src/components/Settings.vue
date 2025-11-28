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

      <div class="setting-item">
        <label class="checkbox-label">
          <input
            type="checkbox"
            v-model="localSettings.enableDueDateColors"
            class="checkbox-input"
          />
          <span class="checkbox-text">
            <strong>Enable due date colors</strong> - Uncheck to disable all
            coloring
          </span>
        </label>
      </div>

      <div v-if="localSettings.enableDueDateColors" class="color-settings">
        <div class="color-setting-item">
          <label class="color-label">
            <span class="color-name">Overdue</span>
            <input
              type="color"
              v-model="localSettings.dueDateColors.overdue"
              class="color-picker"
            />
            <button
              type="button"
              @click="clearColor('overdue')"
              class="btn-clear-color"
              title="Remove color"
            >
              ✖
            </button>
            <span class="color-value">{{
              localSettings.dueDateColors.overdue || "None"
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
            <button
              type="button"
              @click="clearColor('today')"
              class="btn-clear-color"
              title="Remove color"
            >
              ✖
            </button>
            <span class="color-value">{{
              localSettings.dueDateColors.today || "None"
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
            <button
              type="button"
              @click="clearColor('tomorrow')"
              class="btn-clear-color"
              title="Remove color"
            >
              ✖
            </button>
            <span class="color-value">{{
              localSettings.dueDateColors.tomorrow || "None"
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
            <button
              type="button"
              @click="clearColor('twoDays')"
              class="btn-clear-color"
              title="Remove color"
            >
              ✖
            </button>
            <span class="color-value">{{
              localSettings.dueDateColors.twoDays || "None"
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
            <button
              type="button"
              @click="clearColor('threeDays')"
              class="btn-clear-color"
              title="Remove color"
            >
              ✖
            </button>
            <span class="color-value">{{
              localSettings.dueDateColors.threeDays || "None"
            }}</span>
          </label>
        </div>

        <div class="color-setting-item">
          <label class="color-label">
            <span class="color-name">Due in 4-7 Days</span>
            <input
              type="color"
              v-model="localSettings.dueDateColors.fourToSeven"
              class="color-picker"
            />
            <button
              type="button"
              @click="clearColor('fourToSeven')"
              class="btn-clear-color"
              title="Remove color"
            >
              ✖
            </button>
            <span class="color-value">{{
              localSettings.dueDateColors.fourToSeven || "None"
            }}</span>
          </label>
        </div>

        <div class="color-setting-item">
          <label class="color-label">
            <span class="color-name">Due in 8-14 Days</span>
            <input
              type="color"
              v-model="localSettings.dueDateColors.eightToFourteen"
              class="color-picker"
            />
            <button
              type="button"
              @click="clearColor('eightToFourteen')"
              class="btn-clear-color"
              title="Remove color"
            >
              ✖
            </button>
            <span class="color-value">{{
              localSettings.dueDateColors.eightToFourteen || "None"
            }}</span>
          </label>
        </div>

        <div class="color-setting-item">
          <label class="color-label">
            <span class="color-name">Due in 15-30 Days</span>
            <input
              type="color"
              v-model="localSettings.dueDateColors.fifteenToThirty"
              class="color-picker"
            />
            <button
              type="button"
              @click="clearColor('fifteenToThirty')"
              class="btn-clear-color"
              title="Remove color"
            >
              ✖
            </button>
            <span class="color-value">{{
              localSettings.dueDateColors.fifteenToThirty || "None"
            }}</span>
          </label>
        </div>

        <div class="color-setting-item">
          <label class="color-label">
            <span class="color-name">Due in 1-2 Months</span>
            <input
              type="color"
              v-model="localSettings.dueDateColors.oneToTwo"
              class="color-picker"
            />
            <button
              type="button"
              @click="clearColor('oneToTwo')"
              class="btn-clear-color"
              title="Remove color"
            >
              ✖
            </button>
            <span class="color-value">{{
              localSettings.dueDateColors.oneToTwo || "None"
            }}</span>
          </label>
        </div>

        <div class="color-setting-item">
          <label class="color-label">
            <span class="color-name">Due in 2-3 Months</span>
            <input
              type="color"
              v-model="localSettings.dueDateColors.twoToThree"
              class="color-picker"
            />
            <button
              type="button"
              @click="clearColor('twoToThree')"
              class="btn-clear-color"
              title="Remove color"
            >
              ✖
            </button>
            <span class="color-value">{{
              localSettings.dueDateColors.twoToThree || "None"
            }}</span>
          </label>
        </div>

        <div class="color-setting-item">
          <label class="color-label">
            <span class="color-name">Due 3+ Months</span>
            <input
              type="color"
              v-model="localSettings.dueDateColors.threePlus"
              class="color-picker"
            />
            <button
              type="button"
              @click="clearColor('threePlus')"
              class="btn-clear-color"
              title="Remove color"
            >
              ✖
            </button>
            <span class="color-value">{{
              localSettings.dueDateColors.threePlus || "None"
            }}</span>
          </label>
        </div>
      </div>

      <div v-if="localSettings.enableDueDateColors" class="color-actions">
        <button @click="resetColors" class="btn btn-secondary btn-reset">
          🔄 Reset to Defaults
        </button>
        <button @click="clearAllColors" class="btn btn-secondary btn-reset">
          ✖ Clear All Colors
        </button>
      </div>
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
  overdue: "#fca5a5",
  today: "#fb923c",
  tomorrow: "#fbbf24",
  twoDays: "#fde047",
  threeDays: "#fef08a",
  fourToSeven: "#d9f99d",
  eightToFourteen: "#a7f3d0",
  fifteenToThirty: "#bfdbfe",
  oneToTwo: "#c7d2fe",
  twoToThree: "#ddd6fe",
  threePlus: "#e9d5ff",
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
      enableDueDateColors:
        props.settings.enableDueDateColors !== undefined
          ? props.settings.enableDueDateColors
          : true,
      dueDateColors: { ...props.settings.dueDateColors },
    });

    const resetColors = () => {
      localSettings.value.dueDateColors = { ...DEFAULT_COLORS };
    };

    const clearColor = (colorKey) => {
      localSettings.value.dueDateColors[colorKey] = "";
    };

    const clearAllColors = () => {
      Object.keys(localSettings.value.dueDateColors).forEach((key) => {
        localSettings.value.dueDateColors[key] = "";
      });
    };

    const saveSettings = () => {
      emit("save", localSettings.value);
    };

    return {
      localSettings,
      resetColors,
      clearColor,
      clearAllColors,
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

.btn-clear-color {
  width: 28px;
  height: 28px;
  background: #fff5f5;
  color: #e53e3e;
  border: 1px solid #feb2b2;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
  flex-shrink: 0;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-clear-color:hover {
  background: #e53e3e;
  color: white;
  border-color: #e53e3e;
}

.color-value {
  font-family: monospace;
  font-size: 11px;
  color: #718096;
  min-width: 70px;
}

.color-actions {
  display: flex;
  gap: 10px;
  margin-top: 16px;
  flex-wrap: wrap;
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
