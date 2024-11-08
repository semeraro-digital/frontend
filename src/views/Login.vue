<template>
  <section class="vh-100">
    <div class="container-fluid h-custom">
      <div class="row d-flex justify-content-center align-items-center h-100">
        <div class="col-md-9 col-lg-6 col-xl-5">
          <img src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.webp"
            class="img-fluid" alt="Sample image" />
        </div>
        <div class="col-md-8 col-lg-6 col-xl-4 offset-xl-1">
          <form @submit.prevent="handleLogin">
  
         

            <!-- Username input -->
            <div class="form-outline mb-4">
              <input
                type="text"
                id="username"
                v-model="username"
                class="form-control form-control-lg"
                placeholder="Enter your username"
                required
              />
              <label class="form-label" for="username">Username</label>
            </div>

            <!-- Password input -->
            <div class="form-outline mb-3">
              <input
                type="password"
                id="password"
                v-model="password"
                class="form-control form-control-lg"
                placeholder="Enter password"
                required
              />
              <label class="form-label" for="password">Password</label>
            </div>

            <div class="d-flex justify-content-between align-items-center">
              <div class="form-check mb-0">
                <input class="form-check-input me-2" type="checkbox" id="rememberMe" />
                <label class="form-check-label" for="rememberMe">Remember me</label>
              </div>
              <a href="#!" class="text-body">Forgot password?</a>
            </div>

            <div class="text-center text-lg-start mt-4 pt-2">
              <button type="submit" class="btn btn-primary btn-lg" :disabled="loading"
                style="padding-left: 2.5rem; padding-right: 2.5rem;">
                Login
              </button>
              <p class="small fw-bold mt-2 pt-1 mb-0">
                Don't have an account? <a href="#!" class="link-danger">Register</a>
              </p>
            </div>

            <div v-if="error" class="alert alert-danger mt-3" role="alert">
              {{ error }}
            </div>
            <div v-if="loading" class="mt-3">Caricamento...</div>
          </form>
        </div>
      </div>
    </div>

    <div class="d-flex flex-column flex-md-row text-center text-md-start justify-content-between py-4 px-4 px-xl-5 bg-primary">
      <div class="text-white mb-3 mb-md-0">Copyright © 2020. All rights reserved.</div>
      <div>
        <a href="#!" class="text-white me-4"><i class="fab fa-facebook-f"></i></a>
        <a href="#!" class="text-white me-4"><i class="fab fa-twitter"></i></a>
        <a href="#!" class="text-white me-4"><i class="fab fa-google"></i></a>
        <a href="#!" class="text-white"><i class="fab fa-linkedin-in"></i></a>
      </div>
    </div>
  </section>
</template>

<script>
import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export default {
  data() {
    return {
      username: '',
      password: '',
      error: null,
      loading: false,
    };
  },
  methods: {
    async handleLogin() {
      this.error = null;
      this.loading = true;

      try {
        const response = await axios.post(`${API_BASE_URL}/login`, {
          username: this.username,
          password: this.password,
        });

        const token = response.data.token; 
        localStorage.setItem('token', token); 
        this.$router.push('/'); 
      } catch (err) {
        this.error = err.response ? err.response.data.message : 'Login fallito. Riprova.';
        console.error('Login error:', err);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
/* Applica stile per una migliore estetica, ispirata al template */
.vh-100 {
  height: 100vh;
}
.h-custom {
  height: calc(100% - 73px);
}
.form-outline input {
  border-radius: 8px;
  padding: 1rem;
}
.form-outline .form-label {
  font-weight: bold;
}
.btn-floating i {
  font-size: 1.25rem;
}
.divider {
  border-bottom: 1px solid #ccc;
  width: 100%;
}
.alert {
  margin-top: 10px;
}
</style>
