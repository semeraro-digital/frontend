<script setup>
import axios from "axios";
import defaultImage from "@/assets/avatar1.png";
import iconapng from "@/assets/icona.png";
import { Modal } from "bootstrap";
import { onMounted, ref } from "vue";

// Importa la variabile API_BASE_URL dall'ambiente
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // Assicurati che questa variabile sia definita nel file .env

let autisti = ref([]);
let error = ref(null);
let newAutista = ref({
  nome: "",
  cognome: "",
  codFiscale: "",
  scadenzaPatente: "",
  email: "",
  telefono: "",
  numPatente: "",
});

onMounted(() => {
  autisti.value.splice(0);
  axios
    .get(`${API_BASE_URL}/autisti`) // Utilizza la variabile API_BASE_URL
    .then((response) => {
      autisti.value.push(...response.data);
    })
    .catch((err) => {
      error.value = err.response ? err.response.data.message : err.message; // Usa error.value
      console.error("Errore durante la chiamata API:", err);
    });
});

function openAddAutistaModal() {
  try {
    const modalElement = document.getElementById("addAutistaModal");
    if (!modalElement) {
      console.error("Elemento modale non trovato nel DOM");
      return;
    }
    const modal = Modal.getOrCreateInstance(modalElement);
    console.log("Opening 'Add Autista' modal");
    modal.show();
  } catch (error) {
    console.error("Errore nell'apertura della modale:", error);
  }
}

async function saveAutista() {
  try {
    const response = await axios.post(`${API_BASE_URL}/autisti/add`, newAutista.value); // Usa la variabile API_BASE_URL
    console.log("Autista aggiunto:", response.data);

    const modalElement = document.getElementById("addAutistaModal");
    const modal = Modal.getInstance(modalElement);
    if (modal) {
      modal.hide();
    }
    autisti.value.push(JSON.parse(JSON.stringify(newAutista.value)));

    // Reset dei campi dopo il salvataggio
    newAutista.value = {
      nome: "",
      cognome: "",
      codFiscale: "",
      scadenzaPatente: "",
      email: "",
      telefono: "",
      numPatente: "",
    };
  } catch (err) {
    console.error("Errore durante l'aggiunta dell'autista:", err);
    error.value = err.response ? err.response.data.message : err.message; // Usa error.value
  }
}
</script>

<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col">
        <h1 class="h3 mb-0 text-gray-800">{{ $t("drivers") }}</h1>
        <!-- Aggiungi l'internazionalizzazione -->
      </div>
    </div>
  </div>
  <div class="container-fluid">
    <div
      v-if="error"
      class="alert alert-danger text-center"
      role="alert"
      style="margin-top: 20px"
    >
      {{ $t("errorLoadingDrivers", { error }) }}
      <!-- Aggiungi l'internazionalizzazione -->
    </div>

    <div
      v-if="!error"
      class="row row-cols-1 row-cols-lg-2 row-cols-xl-4"
      style="margin-top: 20px"
    >
      <div v-if="autisti.length === 0" class="col-12 text-center">
        <p>{{ $t("noDriversAvailable") }}</p>
        <!-- Aggiungi l'internazionalizzazione -->
      </div>

      <div v-for="item in autisti" :key="item.id" class="col mb-4">
        <RouterLink :to="`/autisti/${item.id}`">
          <div :class="['card', 'radius-15', 'bg-secondary-light', 'autisti']">
            <div class="card-body text-center">
              <div class="radius-15">
                <img
                  :src="defaultImage"
                  width="110"
                  height="110"
                  class="rounded-circle shadow p-1 bg-white float-left mr-2"
                  alt="Immagine Autista"
                />
                <h5 class="mb-0">{{ item.nome }} {{ item.cognome }}</h5>
                <p class="mb-3">{{ $t("driver") }}</p>
                <!-- Aggiungi l'internazionalizzazione -->
              </div>
            </div>
          </div>
        </RouterLink>
      </div>

      <!-- Card per aggiungere un autista -->
      <div class="col mb-4">
        <div :class="['card', 'radius-15', 'autisti']" @click="openAddAutistaModal">
          <div class="card-body text-center">
            <div class="radius-15">
              <img
                :src="iconapng"
                width="110"
                height="110"
                class="rounded-circle shadow p-1 bg-white float-left mr-2"
                alt="Aggiungi Autista"
              />
              <h5 class="mb-0 text-white">{{ $t("addDriver") }}</h5>
              <!-- Aggiungi l'internazionalizzazione -->
              <p class="mb-3">{{ $t("createNewDriver") }}</p>
              <!-- Aggiungi l'internazionalizzazione -->
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modale per aggiungere un autista -->
    <div
      class="modal fade"
      id="addAutistaModal"
      tabindex="-1"
      aria-labelledby="addAutistaModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <form @submit.prevent="saveAutista">
            <div class="modal-header">
              <h5 class="modal-title" id="addAutistaModalLabel">{{ $t("addDriver") }}</h5>
              <!-- Aggiungi l'internazionalizzazione -->
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body">
              <div class="row">
                <div class="col-6">
                  <div class="mb-3">
                    <label for="nome" class="form-label">{{ $t("driverName") }}</label>
                    <input
                      type="text"
                      id="nome"
                      v-model="newAutista.nome"
                      class="form-control"
                      :placeholder="$t('enterName')"
                      required
                    />
                  </div>
                  <div class="mb-3">
                    <label for="cognome" class="form-label">{{
                      $t("driverLastName")
                    }}</label>
                    <input
                      type="text"
                      id="cognome"
                      v-model="newAutista.cognome"
                      class="form-control"
                      :placeholder="$t('enterLastName')"
                      required
                    />
                  </div>
                  <div class="mb-3">
                    <label for="codFiscale" class="form-label">{{
                      $t("codiceFiscale")
                    }}</label>
                    <input
                      type="text"
                      id="codFiscale"
                      v-model="newAutista.codFiscale"
                      class="form-control"
                      :placeholder="$t('entercodiceFiscale')"
                      required
                    />
                  </div>
                  <div class="mb-3">
                    <label for="scadenzaPatente" class="form-label">{{
                      $t("driverLicenseExpiry")
                    }}</label>
                    <input
                      type="date"
                      id="scadenzaPatente"
                      v-model="newAutista.scadenzaPatente"
                      class="form-control"
                      required
                    />
                  </div>
                </div>
                <div class="col-6">
                  <div class="mb-3">
                    <label for="numPatente" class="form-label">{{
                      $t("driverLicense")
                    }}</label>
                    <input
                      type="text"
                      id="numPatente"
                      v-model="newAutista.numPatente"
                      class="form-control"
                      :placeholder="$t('enterLicenseNumber')"
                      required
                    />
                  </div>
                  <div class="mb-3">
                    <label for="email" class="form-label">{{ $t("driverEmail") }}</label>
                    <input
                      type="text"
                      id="email"
                      v-model="newAutista.email"
                      class="form-control"
                      :placeholder="$t('enterEmail')"
                      required
                    />
                  </div>
                  <div class="mb-3">
                    <label for="telefono" class="form-label">{{
                      $t("driverPhone")
                    }}</label>
                    <input
                      type="text"
                      id="telefono"
                      v-model="newAutista.telefono"
                      class="form-control"
                      :placeholder="$t('enterPhone')"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                {{ $t("close") }}
              </button>
              <!-- Aggiungi l'internazionalizzazione -->
              <button type="submit" class="btn btn-primary">{{ $t("save") }}</button>
              <!-- Aggiungi l'internazionalizzazione -->
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-title {
  font-size: 1.25rem;
  margin-bottom: 0;
}

.autisti-img-profile {
  float: left;
}

.d-flex {
  display: flex;
  align-items: center;
}

.ms-3 {
  margin-left: 1rem;
}

.container {
  margin-top: 20px;
}

.card {
  border: 1px solid #ccc;
  border-radius: 8px;
}

.custom-card {
  width: 250px;
}

.bg-secondary-light {
  background-color: #dfe6e9;
}

.card.autisti:hover {
  border: solid 1px;
}
</style>
