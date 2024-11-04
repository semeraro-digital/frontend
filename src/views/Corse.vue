<script setup>
import moment from "moment";
import axios from "axios";
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const corse = ref([]);
const error = ref(null);
const isLoading = ref(false);
const isAddingRow = ref(false);
const autisti = ref([]);
const tratte = ref([]);
const mezzi = ref([]);

// Funzione per ottenere la data odierna in formato YYYY-MM-DD
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split("T")[0]; // Restituisce la data nel formato corretto
};

const newCorsa = ref({
  datapartenza: getTodayDate(), // Precompila con la data di oggi
  orapartenza: "",
  idtratta: "",
  idAutista: "",
  idMezzo: "",
  tutor: "",
});

// Funzione per formattare la data
function formatDate(dateString) {
  return moment(dateString).format("DD/MM/YYYY");
}
// Funzione per gestire il cambio della data

// Funzione per formattare l'ora
function formatTime(dateString) {
  return moment(dateString).format("HH:mm");
}

// Funzione per caricare le corse all'avvio
onMounted(() => {
  loadCorse();
  loadAutisti();
  loadTratte();
  loadVeicoli();
});

// Carica le corse dal server
const loadCorse = async () => {
  try {
    isLoading.value = true;
    const response = await axios.get(`${API_BASE_URL}/corse`);
    corse.value = response.data;
  } catch (err) {
    error.value = err.response ? err.response.data.message : err.message;
  } finally {
    isLoading.value = false;
  }
};

//AUTISTI
// Variabili per la ricerca con autocompletamento
const searchAutista = ref(""); 
const filteredAutisti = ref([]);
const showAutistiOptions = ref(false);
// Filtra gli autisti in base al testo di ricerca
const filterAutisti = () => {
  filteredAutisti.value = autisti.value.filter((autista) =>
    `${autista.nome} ${autista.cognome}`
      .toLowerCase()
      .includes(searchAutista.value.toLowerCase())
  );
};

// Seleziona un autista e chiudi le opzioni
const selectAutista = (autista) => {
  newCorsa.value.idAutista = autista.id;
  searchAutista.value = `${autista.nome} ${autista.cognome}`;
  showAutistiOptions.value = false;
};

// Carica gli autisti dal server
const loadAutisti = async () => {
  try {
    isLoading.value = true;
    const response = await axios.get(`${API_BASE_URL}/autisti`);
    autisti.value = response.data;
  } catch (err) {
    error.value = err.response ? err.response.data.message : err.message;
  } finally {
    isLoading.value = false;
  }
};

// Carica le tratte dal server
const loadTratte = async () => {
  try {
    isLoading.value = true;
    const response = await axios.get(`${API_BASE_URL}/tratte`);
    tratte.value = response.data;
  } catch (err) {
    error.value = err.response ? err.response.data.message : err.message;
  } finally {
    isLoading.value = false;
  }
};
const loadVeicoli = async () => {
  try {
    isLoading.value = true;
    const response = await axios.get(`${API_BASE_URL}/veicoli`);
    mezzi.value = response.data;
  } catch (err) {
    error.value = err.response ? err.response.data.message : err.message;
  } finally {
    isLoading.value = false;
  }
};

// Funzione per eliminare una corsa
const eliminaCorsa = async (id) => {
  if (confirm(t("confirmDelete"))) {
    try {
      await axios.delete(`${API_BASE_URL}/corse/${id}`);
      corse.value = corse.value.filter((corsa) => corsa.id !== id);
    } catch (err) {
      error.value = err.response ? err.response.data.message : err.message;
    }
  }
};

// Mostra la riga di inserimento
const openAddRowModal = () => {
  isAddingRow.value = true;
};

// Nascondi la riga di inserimento
const cancelAddRow = () => {
  isAddingRow.value = false;
  resetNewCorsa();
};

// Aggiungi una nuova corsa
const aggiungiCorsa = async () => {
  try {
    const response = await axios.post(`${API_BASE_URL}/corse`, newCorsa.value);
    corse.value.push(response.data); // Aggiungi la nuova corsa alla tabella
    isAddingRow.value = false; // Nascondi la riga di inserimento
    resetNewCorsa(); // Resetta i campi del form
  } catch (err) {
    error.value = err.response ? err.response.data.message : err.message;
  }
};

// Reset dei campi di newCorsa
const resetNewCorsa = () => {
  newCorsa.value = {
    descrizione: "",
    datapartenza: getTodayDate(), // Reimposta la data a oggi
    orapartenza: "", // Resetta anche l'ora di partenza
    idtratta: "",
    idAutista: "",
    tutor: "",
    idMezzo: "",
  };
};
</script>

<template>
  <div class="container-fluid">
    <!-- Messaggio di errore globale -->
    <div
      v-if="error"
      class="alert alert-danger text-center"
      role="alert"
      style="margin-top: 20px"
    >
      {{ $t("errorLoadingData", { error }) }}
    </div>

    <!-- Spinner di caricamento -->
    <div v-if="isLoading" class="text-center" style="margin-top: 20px">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p>{{ $t("loadingData") }}</p>
    </div>

    <div class="row">
      <div class="col">
        <div v-if="!error && !isLoading" class="table-responsive">
          <table class="table table-sm custom-table" style="margin-top: 20px">
            <thead class="thead-light">
              <tr>
                <th scope="col">Data partenza</th>
                <th scope="col">Ora partenza</th>
                <th scope="col">Descrizione</th>
                <th scope="col">Tutor</th>
                <th scope="col">{{ $t("driver") }}</th>
                <th scope="col">{{ $t("vehicle") }}</th>
                <th scope="col">
                  <!-- Pulsante "+" per aggiungere una nuova riga -->
                  <button @click="openAddRowModal" class="btn btn-sm btn-primary">
                    +
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="corse.length === 0">
                <td class="text-center" colspan="6">{{ t("noCoursesAvailable") }}</td>
              </tr>
              <tr v-for="item in corse" :key="item.id">
                <td>{{ formatDate(item.datapartenza) }}</td>
                <td>{{ formatTime(item.datapartenza) }}</td>
                <td>{{ item.descrizione }}</td>
                <td>{{ item.tutor }}</td>
                <td>{{ item.nome }} {{ item.cognome }}</td>
                <td>{{ item.idMezzo }}</td>
                <td>
                  <button @click="eliminaCorsa(item.id)" class="btn btn-sm btn-danger">
                    {{ t("delete") }}
                  </button>
                </td>
              </tr>
              <!-- Riga per l'inserimento della nuova corsa -->
              <tr v-if="isAddingRow">
                <td>
                  <input
                    v-model="newCorsa.datapartenza"
                    type="date"
                    class="form-control"
                  />
                </td>
                <td>
                  <input
                    v-model="newCorsa.orapartenza"
                    type="time"
                    class="form-control"
                  />
                </td>
                <td>
                  <select
                    class="form-select"
                    id="idTratta"
                    v-model="newCorsa.idtratta"
                    aria-label="Seleziona una tratta"
                  >
                    <option v-for="tratta in tratte" :key="tratta.id" :value="tratta.id">
                      {{ tratta.descrizione }}
                    </option>
                  </select>
                </td>
                <td>
                  <input
                    v-model="newCorsa.tutor"
                    class="form-control"
                    placeholder="Tutor"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    v-model="searchAutista"
                    @focus="showAutistiOptions = true"
                    @input="filterAutisti"
                    placeholder="Seleziona un autista"
                    class="form-control"
                  />
                  <!-- Opzioni di autocompletamento -->
                  <ul v-if="showAutistiOptions" class="autocomplete-options">
                    <li
                      v-for="autista in filteredAutisti"
                      :key="autista.id"
                      @click="selectAutista(autista)"
                      class="autocomplete-item"
                    >
                      {{ autista.nome }} {{ autista.cognome }}
                    </li>
                  </ul>
                </td>
                <td>
                  <select
                    class="form-select"
                    id="idmezzo"
                    v-model="newCorsa.idMezzo"
                    aria-label="Seleziona un mezzo"
                  >
                    <option v-for="mezzo in mezzi" :key="mezzo.id" :value="mezzo.id">
                      {{ mezzo.modello }}
                    </option>
                  </select>
                </td>
                <td>
                  <button @click="aggiungiCorsa" class="btn btn-sm btn-success">✔</button>
                  <button @click="cancelAddRow" class="btn btn-sm btn-secondary">
                    ✖
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container-fluid {
  margin-top: 20px;
}
.custom-table {
  margin-top: 20px;
}
.autocomplete-options {
  position: absolute;
  background-color: white;
  border: 1px solid #ddd;
  max-height: 150px;
  overflow-y: auto;
  z-index: 1000;
  width: 100%;
}

.autocomplete-item {
  padding: 8px;
  cursor: pointer;
}

.autocomplete-item:hover {
  background-color: #f0f0f0;
}
</style>
