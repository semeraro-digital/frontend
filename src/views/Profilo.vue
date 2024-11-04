<template>
    <div class="container-fluid bg-light-gray vh-100">
      <div class="row justify-content-center align-items-center h-100">
        <div class="col-md-8 bg-white shadow p-4 rounded">
          <!-- Sezione Foto Profilo -->
          <div class="text-center mb-5">
            <img :src="profileImage" alt="Profile Image" class="img-thumbnail rounded-circle mb-3" width="150" height="150">
            <button class="btn btn-primary" @click="uploadNewImage">Cambia Foto</button>
          </div>
  
          <!-- Sezione Cambia Password -->
          <div class="mb-5">
            <h3 class="text-center">Cambia Password</h3>
            <form @submit.prevent="changePassword">
              <div class="mb-3">
                <label for="currentPassword" class="form-label">Password Attuale</label>
                <input type="password" class="form-control" id="currentPassword" v-model="currentPassword" required>
              </div>
              <div class="mb-3">
                <label for="newPassword" class="form-label">Nuova Password</label>
                <input type="password" class="form-control" id="newPassword" v-model="newPassword" required>
              </div>
              <div class="mb-3">
                <label for="confirmNewPassword" class="form-label">Conferma Nuova Password</label>
                <input type="password" class="form-control" id="confirmNewPassword" v-model="confirmNewPassword" required>
              </div>
              <div class="text-center">
                <button type="submit" class="btn btn-success w-50">Salva Cambiamenti</button>
              </div>
            </form>
          </div>
  
          <!-- Sezione Informazioni Personali -->
          <div class="mb-5">
            <h3 class="text-center">Informazioni Personali</h3>
            <form>
              <div class="mb-3">
                <label for="fullName" class="form-label">Nome Completo</label>
                <input type="text" class="form-control" id="fullName" v-model="fullName">
              </div>
              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input type="email" class="form-control" id="email" v-model="email">
              </div>
              <div class="mb-3">
                <label for="phone" class="form-label">Telefono</label>
                <input type="tel" class="form-control" id="phone" v-model="phone">
              </div>
              <div class="text-center">
                <button type="button" class="btn btn-secondary w-50">Aggiorna Informazioni</button>
              </div>
            </form>
          </div>
  
          <!-- Alert per gli errori o il successo -->
          <div v-if="error" class="alert alert-danger mt-4 text-center">{{ error }}</div>
          <div v-if="success" class="alert alert-success mt-4 text-center">{{ success }}</div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        profileImage: 'https://via.placeholder.com/150', // Placeholder per l'immagine del profilo
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
        fullName: 'Mario Rossi', // Esempio di nome
        email: 'mario.rossi@example.com',
        phone: '1234567890',
        error: null,
        success: null,
      };
    },
    methods: {
      // Simulazione cambio password
      changePassword() {
        this.error = null;
        this.success = null;
  
        // Verifica se le password coincidono
        if (this.newPassword !== this.confirmNewPassword) {
          this.error = 'Le nuove password non coincidono.';
          return;
        }
  
        // Simulazione richiesta al server
        setTimeout(() => {
          if (this.currentPassword === 'password') {
            this.success = 'Password cambiata con successo!';
            this.currentPassword = '';
            this.newPassword = '';
            this.confirmNewPassword = '';
          } else {
            this.error = 'Password attuale errata.';
          }
        }, 1000);
      },
      // Simulazione cambio immagine
      uploadNewImage() {
        alert('Funzione di caricamento immagine non implementata.');
      },
    },
  };
  </script>
  
  <style scoped>
  .bg-light-gray {
    background-color: #f7f7f7;
  }
  
  .vh-100 {
    height: 100vh;
  }
  
  .img-thumbnail {
    object-fit: cover;
  }
  
  h3 {
    color: #333;
  }
  
  .shadow {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .form-label {
    color: #555;
  }
  
  .btn {
    font-size: 1rem;
  }
  
  .btn-primary {
    background-color: #6c757d;
    border-color: #6c757d;
  }
  
  .btn-secondary {
    background-color: #b3b3b3;
  }
  
  .btn-success {
    background-color: #5cb85c;
  }
  
  .alert {
    font-size: 0.9rem;
  }
  
  .text-center {
    text-align: center;
  }
  </style>
  