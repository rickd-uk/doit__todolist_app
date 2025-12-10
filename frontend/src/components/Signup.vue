<template>
  <div class="auth-container">
    <div class="auth-box">
      <div class="auth-header">
        <h1>🎯 Doit</h1>
        <p>Create your account</p>
      </div>

      <form @submit.prevent="handleSignup" class="auth-form">
        <div class="form-group">
          <label for="name">Name (Optional)</label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            placeholder="Enter your name"
            class="form-control"
            :disabled="loading"
          />
        </div>

        <div class="form-group">
          <label for="username">Username</label>
          <input
            id="username"
            v-model="formData.username"
            type="text"
            required
            placeholder="Enter your username"
            class="form-control"
            :disabled="loading"
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="formData.password"
            type="password"
            required
            placeholder="At least 6 characters"
            class="form-control"
            :disabled="loading"
          />
          <small class="form-hint">Minimum 6 characters</small>
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            v-model="formData.confirmPassword"
            type="password"
            required
            placeholder="Re-enter your password"
            class="form-control"
            :disabled="loading"
          />
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button
          type="submit"
          class="btn btn-primary btn-full"
          :disabled="loading"
        >
          {{ loading ? "🔄 Creating account..." : "✨ Sign Up" }}
        </button>
      </form>

      <div class="auth-footer">
        <p>
          Already have an account?
          <a href="#" @click.prevent="$emit('switchToLogin')">Sign in</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";

export default {
  name: "Signup",
  emits: ["signupSuccess", "switchToLogin"],
  setup(props, { emit }) {
    const formData = ref({
      name: "",
      username: "",
      password: "",
      confirmPassword: "",
    });
    const loading = ref(false);
    const error = ref("");

    const handleSignup = async () => {
      loading.value = true;
      error.value = "";

      // Validation
      if (formData.value.password.length < 6) {
        error.value = "Password must be at least 6 characters";
        loading.value = false;
        return;
      }

      if (formData.value.password !== formData.value.confirmPassword) {
        error.value = "Passwords do not match";
        loading.value = false;
        return;
      }

      try {
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: formData.value.username,
            password: formData.value.password,
            name: formData.value.name || null,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Signup failed");
        }

        // Store token
        localStorage.setItem("doit_token", data.token);
        localStorage.setItem("doit_user", JSON.stringify(data.user));

        emit("signupSuccess", data);
      } catch (err) {
        error.value = err.message;
      } finally {
        loading.value = false;
      }
    };

    return {
      formData,
      loading,
      error,
      handleSignup,
    };
  },
};
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.auth-box {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  padding: 40px;
  width: 100%;
  max-width: 420px;
}

.auth-header {
  text-align: center;
  margin-bottom: 30px;
}

.auth-header h1 {
  font-size: 32px;
  color: #2d3748;
  margin-bottom: 8px;
}

.auth-header p {
  color: #718096;
  font-size: 15px;
}

.auth-form .form-group {
  margin-bottom: 20px;
}

.auth-form label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #4a5568;
  font-size: 14px;
}

.auth-form .form-control {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 15px;
  transition: border-color 0.2s ease;
}

.auth-form .form-control:focus {
  outline: none;
  border-color: #667eea;
}

.auth-form .form-control:disabled {
  background: #f7fafc;
  cursor: not-allowed;
}

.form-hint {
  display: block;
  margin-top: 6px;
  color: #a0aec0;
  font-size: 12px;
}

.error-message {
  background: #fff5f5;
  color: #e53e3e;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  border: 1px solid #feb2b2;
}

.btn-full {
  width: 100%;
  padding: 14px;
  font-size: 16px;
  font-weight: 600;
}

.btn-primary {
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover:not(:disabled) {
  background: #5568d3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.auth-footer {
  text-align: center;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
}

.auth-footer p {
  color: #718096;
  font-size: 14px;
}

.auth-footer a {
  color: #667eea;
  font-weight: 600;
  text-decoration: none;
}

.auth-footer a:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .auth-box {
    padding: 30px 24px;
  }

  .auth-header h1 {
    font-size: 28px;
  }
}
</style>
