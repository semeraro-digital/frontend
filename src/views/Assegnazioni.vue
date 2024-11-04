<script setup>
import { Modal } from "bootstrap";
import moment from "moment";
import axios from "axios";
import { onMounted, ref } from "vue";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Define reactive variables for data and errors
const assegnazioni = ref([]);
const veicoli = ref([]);
const autisti = ref([]);
const corse = ref([]);
const newAssegnazione = ref({
  idAutista: "",
  idMezzo: "",
  idCorsa: "",
  stato: "",
  reportId: "",
});

const error = ref(null); // Global error for loading data
const errorModal = ref(null); // Specific error for the add() function
const isLoading = ref(false); // Loading state

// Function to delete an assignment
async function eliminaAssegnazione(id) {
  if (confirm("Sei sicuro di voler eliminare questa assegnazione?")) {
    try {
      // Send DELETE request to remove the assignment
      await axios.delete(`${API_BASE_URL}/assegnazioni/${id}`);
      console.log('Assegnazione eliminata:', id);
      // Reload assignments to reflect changes
      await loadAssegnazioni();
    } catch (err) {
      console.error('Errore durante l\'eliminazione dell\'assegnazione:', err);
      alert("Errore durante l'eliminazione dell'assegnazione.");
    }
  }
}

// Function to load assignments
async function loadAssegnazioni() {
  try {
    isLoading.value = true; // Set loading state to true
    assegnazioni.value.splice(0); // Clear existing array
    const response = await axios.get(`${API_BASE_URL}/assegnazioni`);
    assegnazioni.value.push(...response.data);
  } catch (err) {
    error.value = err.response ? err.response.data.message : err.message;
    console.error("Errore durante la chiamata API:", err);
  } finally {
    isLoading.value = false; // Set loading state to false
  }
}

// Function to add a new assignment
async function aggiungi() {
  try {
    // Reset error in case of success
    errorModal.value = null;
    // Send request to add the assignment
    const response = await axios.post(
      `${API_BASE_URL}/assegnazioni`,
      newAssegnazione.value
    );
    console.log("Assegnazione aggiunta:", response.data);

    // Hide modal after successful insertion
    const modalElement = document.getElementById("addAssegnazioneModal");
    const modal = Modal.getInstance(modalElement);
    if (modal) {
      modal.hide();
    }

    // Reload assignments
    await loadAssegnazioni();

    // Reset the form
    newAssegnazione.value = {
      idAutista: "",
      idMezzo: "",
      idCorsa: "",
      stato: "",
      reportId: "",
    };
  } catch (err) {
    console.error("Errore durante l'aggiunta dell'assegnazione:", err);
    // Update error message for modal and keep it visible
    errorModal.value = "Inserimento non avvenuto";
    const modalElement = document.getElementById("addAssegnazioneModal");
    const modal = Modal.getOrCreateInstance(modalElement);
    modal.show();
  }
}

// Load data on component mount
onMounted(() => {
  isLoading.value = true; // Set loading state to true
  Promise.all([
    axios.get(`${API_BASE_URL}/assegnazioni`),
    axios.get(`${API_BASE_URL}/veicoli`),
    axios.get(`${API_BASE_URL}/autisti`),
    axios.get(`${API_BASE_URL}/corse`),
  ])
    .then((responses) => {
      assegnazioni.value.push(...responses[0].data);
      veicoli.value.push(...responses[1].data);
      autisti.value.push(...responses[2].data);
      corse.value.push(...responses[3].data);
    })
    .catch((err) => {
      error.value = err.response ? err.response.data.message : err.message;
      console.error("Errore durante la chiamata API:", err);
    })
    .finally(() => {
      isLoading.value = false; // Set loading state to false
    });
});
function formatDate(dateString) {
  return moment(dateString).format('DD/MM/YYYY HH:mm');
}
</script>

<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-12">
    <!-- Global error message -->
        <div v-if="error" class="alert alert-danger text-center" role="alert" style="margin-top: 20px">
          {{ $t("errorLoadingData", { error }) }}
        </div>

        <!-- Loading spinner -->
        <div v-if="isLoading" class="text-center" style="margin-top: 20px;">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p>{{ $t("loadingData") }}</p>
        </div>

        <!-- Assignments table -->
        <div v-if="!error && !isLoading" class="table-responsive">
          <table class="table table-sm custom-table" style="margin-top: 20px">
            <thead class="thead-light">
              <tr>
                <th scope="col">{{ $t("route") }}</th>
                <th scope="col">{{ $t("departureDate") }}</th>
                <th scope="col">{{ $t("driver") }}</th>
                <th scope="col">{{ $t("vehicle") }}</th>
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="assegnazioni.length === 0">
                <td colspan="4">{{ $t("noAssignmentsAvailable") }}</td>
              </tr>
              <tr v-for="(item, index) in assegnazioni" :key="item.id">
                <th scope="row">{{ item.descrizionetratta }}</th>
                <td>{{ formatDate(item.datapartenza) }}</td>
                <td>{{ item.nomeautista }} {{ item.cognomeautista }}</td>
                <td>{{ item.modelloveicolo }} {{ item.targaveicolo }}</td>
                <td>
                  <button class="btn btn-danger btn-sm" @click="eliminaAssegnazione(item.id)">
                    {{ $t("delete") }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Button to open modal -->
    <div class="row">
      <div class="col">
        <button
          type="button"
          class="btn btn-secondary mt-3 float-right"
          data-bs-toggle="modal"
          data-bs-target="#addAssegnazioneModal"
        >
          {{ $t("addAssignment") }}
        </button>
      </div>
    </div>
  </div>

  <!-- Modale per aggiungere un'assegnazione -->
  <div
    class="modal fade"
    id="addAssegnazioneModal"
    tabindex="-1"
    aria-labelledby="addVehicleModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <form @submit.prevent="aggiungi">
          <div class="modal-header">
            <h5 class="modal-title" id="addVehicleModalLabel">
              {{ $t("addAssignment") }}
            </h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>

          <!-- Messaggio di errore specifico per la modale -->
          <div
            v-if="errorModal"
            class="alert alert-danger text-center"
            role="alert"
            style="margin-top: 10px"
          >
            Errore durante l'aggiunta dell'assegnazione: {{ errorModal }}
          </div>

          <div class="modal-body">
            <!-- Campi del form per l'assegnazione -->
            <div class="mb-3">
              <label for="idCorsa" class="form-label">{{ $t("course") }}</label>
              <select
                class="form-select"
                id="idCorsa"
                v-model="newAssegnazione.idCorsa"
                aria-label="Default select example"
              >
                <option v-for="corsa in corse" :key="corsa.id" :value="corsa.id">
                  {{ corsa.partenzatratta }} - {{ corsa.arrivotratta }} ({{
                    moment(corsa.datapartenza).format("DD/MM/YYYY HH:mm")
                  }})
                </option>
              </select>
            </div>
            <div class="mb-3">
              <label for="idautista" class="form-label">{{ $t("driver") }}</label>
              <select
                class="form-select"
                id="idautista"
                v-model="newAssegnazione.idAutista"
                aria-label="Default select example"
              >
                <option
                  v-for="autista in autisti"
                  :key="autista.nome"
                  :value="autista.id"
                >
                  {{ autista.nome }} {{ autista.cognome }}
                </option>
              </select>
            </div>
            <div class="mb-3">
              <label for="idMezzo" class="form-label">{{ $t("vehicle") }}</label>
              <select
                class="form-select"
                id="idMezzo"
                v-model="newAssegnazione.idMezzo"
                aria-label="Default select example"
              >
                <option v-for="veicolo in veicoli" :key="veicolo.id" :value="veicolo.id">
                  {{ veicolo.modello }} {{ veicolo.targa }}
                </option>
              </select>
            </div>
            <div class="mb-3">
              <label for="stato" class="form-label">{{ $t("status") }}</label>
              <select
                class="form-select"
                id="tratta"
                v-model="newAssegnazione.stato"
                aria-label="Default select example"
              >
                <option value="Da effettuare">{{ $t("toBeDone") }}</option>
                <option value="Effettuata">{{ $t("done") }}</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button type="submit" class="btn btn-primary">{{ $t("save") }}</button>
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              {{ $t("close") }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>

.table {
  width: 100%;
  margin-top: 20px;
}

.table-responsive {
  padding-left: 5px;
  padding-right: 5px;
}

/* Customizzazione della tabella */
.custom-table {
  border: 1px solid #ddd;
}
</style>
