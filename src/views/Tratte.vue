<!--#### pagina tratte  -->
<script setup>
import Multiselect from "@vueform/multiselect";
import "@vueform/multiselect/themes/default.css";
import moment from "moment";
import "moment/locale/it";
import axios from "axios";
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import _ from "lodash";
const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const daysOptions = [
  { value: "MON", text: "Lunedì" },
  { value: "TUE", text: "Martedì" },
  { value: "WED", text: "Mercoledì" },
  { value: "THU", text: "Giovedì" },
  { value: "FRI", text: "Venerdì" },
  { value: "SAT", text: "Sabato" },
  { value: "SUN", text: "Domenica" },
];

const { t } = useI18n();
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const corse = ref([]);
const error = ref(null);

const isAddingRow = ref(false);
const isLoading = ref(false);
const datafiltro = ref(moment());

// Funzione per ottenere la data odierna in formato YYYY-MM-DD
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split("T")[0]; // Restituisce la data nel formato corretto
};

let tratte = ref([]);
const newTratta = ref({
  descrizione: "",
  indirizzopartenza: "",
  indirizzoarrivo: "",
  tutor: "",
  cadenza: [],
});

const trattaModifica = ref({
  descrizione: "",
  indirizzopartenza: "",
  indirizzoarrivo: "",
  tutor: "",
  cadenza: [],
});
const newTratte = ref([]);

// Variabili per la modale di modifica VEICOLO
const isModalOpen = ref(false);
//const trattaModifica = ref({});
const errorMessage = ref("");
const successMessage = ref("");

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
onMounted(async () => {
  loadTratte();
});

const aggiornaDataFiltro = (nuovaData) => {
  datafiltro.value = moment(nuovaData).startOf("day");
  aggiornaPagina();
};

const aggiornaPagina = async (id) => {
  resetnewTratta();
  await loadTratte();
};

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

// Funzione per eliminare una tratta
const eliminaTratta = async (id) => {
  if (confirm(t("confirmDelete"))) {
    try {
      await axios.delete(`${API_BASE_URL}/tratte/${id}`);

      // Reload assignments
      await aggiornaPagina();
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
  resetnewTratta();
};

// Aggiungi una nuova tratta
const aggiungiTratta = async () => {
  try {
    const request = createMassiveRequest();
    console.log("request " + request);
    const response = await axios.post(`${API_BASE_URL}/tratte/aggiungiAll`, request);

    isAddingRow.value = false; // Nascondi la riga di inserimento
    resetnewTratta(); // Resetta i campi del form
    // Reload assignments
    await aggiornaPagina();
  } catch (err) {
    console.log(err);
    error.value = err.response ? err.response.data.message : err.message;
  }
};

function createMassiveRequest() {
  let request = [];
  if (isAddingRow.value) {
    const requestnewTratta = JSON.parse(JSON.stringify(newTratta.value));
    requestnewTratta.descrizione = requestnewTratta.descrizione;
    requestnewTratta.indirizzopartenza = requestnewTratta.indirizzopartenza;
    requestnewTratta.indirizzoarrivo = requestnewTratta.indirizzoarrivo;
    requestnewTratta.tutor = requestnewTratta.tutor;
    const cad = Array.isArray(requestnewTratta.cadenza) ? requestnewTratta.cadenza : [];
    requestnewTratta.cadenza = cad.filter(Boolean).join(","); // es. "MON,WED,SAT"
    if (requestnewTratta.ora) {
      requestnewTratta.ora =
        requestnewTratta.ora.hours + ":" + requestnewTratta.ora.minutes;
    }
    request = [requestnewTratta];
  }
  return request;
}

const nuovoDatoTratta = null;

// Reset dei campi di newTratta
const resetnewTratta = () => {
  newTratte.value = [];
  newTratta.value = {
    descrizione: "",
    indirizzopartenza: "",
    indirizzoarrivo: "",
    cadenza: [],
  };
};

function toHHmm(val) {
  if (!val) return null;
  if (typeof val === 'string') return val; // già "HH:mm"
  if (val.hours != null && val.minutes != null) {
    const h = String(val.hours).padStart(2,'0');
    const m = String(val.minutes).padStart(2,'0');
   // return `${h}:${m}`;
   return h+":"+m;
  }
  const d = val instanceof Date ? val : new Date(val);
  const h = String(d.getHours()).padStart(2,'0');
  const m = String(d.getMinutes()).padStart(2,'0');
  //return `${h}:${m}`;
  return h+":"+m;
}



//modale
// Funzione per aprire la modale e caricare i dettagli della tratta
const openEditModal = (tratta) => {
  trattaModifica.value = { ...tratta }; // Cloniamo l'oggetto della tratta selezionata

    if (trattaModifica.value.ora instanceof Date) {
    const h = String(trattaModifica.value.ora.getHours()).padStart(2,'0');
    const m = String(trattaModifica.value.ora.getMinutes()).padStart(2,'0');
    trattaModifica.value.ora = `${h}:${m}`;
  }
  if (typeof trattaModifica.value.cadenza === 'string') {
    trattaModifica.value.cadenza = trattaModifica.value.cadenza.split(',').filter(Boolean);
  }

  isModalOpen.value = true; // Apriamo la modale
  errorMessage.value = "";
  successMessage.value = "";
};

// Funzione per salvare le modifiche della tratta
const saveChanges = async () => {
  try {
const request=JSON.parse(JSON.stringify(trattaModifica.value));
      

   request.cadenza=request.cadenza.filter(cad=>!!cad).join(',');
    if (request.ora ) {
    request.ora=request.ora.hours + ':' + request.ora.minutes ;
    }

    const response = await axios.post(
      `${API_BASE_URL}/tratte/modifica/`,
      request
    );
    if (response.status === 200) {
      const index = tratte.value.findIndex((c) => c.id === trattaModifica.value.id);
      if (index !== -1) {
        tratte.value[index] = { ...trattaModifica.value }; // Aggiorniamo la tratta nella lista
      }
      successMessage.value = "Tratta aggiornata con successo!";
    }
    closeModal();
  } catch (error) {
    console.error("Errore durante l'aggiornamento della tratta:", error);
    errorMessage.value =
      "Si è verificato un errore durante l'aggiornamento della tratta.";
  }
};

// Funzione per chiudere la modale senza salvare
const closeModal = () => {
  isModalOpen.value = false;
  trattaModifica.value = {};
  aggiornaPagina();
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
        <div v-if="!error && !isLoading">
          <table
            class="table table-striped table-sm custom-table"
            style="margin-top: 20px"
          >
            <thead class="thead-light">
              <tr>
                <th scope="col">{{ $t("departureTime") }}</th>
                <th scope="col">{{ $t("departureAddress") }}</th>
                <th scope="col">{{ $t("arrivalAddress") }}</th>
                <th scope="col">{{ $t("tutor") }}</th>
                <th scope="col">{{ $t("frequency") }}</th>
                <th scope="col" class="text-right">
                  <!-- Pulsante "+" per aggiungere una nuova riga -->
                  <button @click="openAddRowModal" class="btn btn-sm btn-primary">
                    <i class="fa fa-plus"></i>
                  </button>
                </th>
                <th scope="col" class="text-right"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in tratte" :key="item.id">
                <td>{{ item.ora }}</td>
                <td>{{ item.indirizzopartenza }}</td>
                <td>{{ item.indirizzoarrivo }}</td>
                <td>{{ item.tutor }}</td>
                <td>{{ item.cadenza }}</td>
                <td class="text-right">
                  <button class="btn btn-primary" @click="openEditModal(item)">
                    <i class="fas fa-edit"></i>
                  </button>
                </td>
                <td class="text-left">
                  <button @click="eliminaTratta(item.id)" class="btn btn-sm btn-danger">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
              <tr v-for="(item, index) in newTratte" :key="'new' + item.id">
                <td>{{ item.departureTime }}</td>
                <td>{{ item.indirizzopartenza }}</td>
                <td>{{ item.indirizzoarrivo }}</td>
                <td>{{ item.tutor }}</td>
                <td>{{ item.cadenza }}</td>

                <td class="text-right">
                  <button
                    @click="() => newTratte.splice(index, 1)"
                    class="btn btn-sm btn-secondary mr-1"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </td>
              </tr>
              <!-- Riga per l'inserimento della nuova tratta -->
              <tr v-if="isAddingRow">
                <td>
                  <VueDatePicker
                    id="ora"
                    time-picker
                    text-input
                    :hours-increment="1"
                    :minutes-increment="5"
                    :minutes-grid-increment="5"
                    format="HH:mm"
                    v-model="newTratta.ora"
                    locale="it"
                    :select-text="$t('assign')"
                    :cancel-text="$t('cancel')"
                  ></VueDatePicker>
                </td>
                <td>
                  <input
                    v-model="newTratta.indirizzopartenza"
                    class="form-control"
                    placeholder=""
                  />
                </td>
                <td>
                  <input
                    v-model="newTratta.indirizzoarrivo"
                    class="form-control"
                    placeholder=""
                  />
                </td>

                <td>
                  <input v-model="newTratta.tutor" class="form-control" placeholder="" />
                </td>
                <td>
                  <Multiselect
                    v-model="newTratta.cadenza"
                    :options="daysOptions"
                    mode="tags"
                    :close-on-select="false"
                    placeholder="Seleziona giorni"
                    label="text"
                    track-by="value"
                    class="w-100"
                  />
                </td>

                <td style="width: 100px" class="text-right">
                  <button @click="cancelAddRow" class="btn btn-sm btn-secondary mr-1">
                    <i class="fas fa-times"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col text-right">
        <button @click="aggiungiTratta" class="btn btn-sm btn-success">
          {{ $t("addDriver") }}
        </button>
      </div>
    </div>
  </div>

  <!-- Modale di modifica  -->
  <div v-if="isModalOpen" class="modal">
    <div class="modal-content">
      <h2>{{ $t("modificaTratta") }}</h2>
      <div v-if="errorMessage" class="alert alert-danger">
        {{ errorMessage }}
      </div>
      <label for="ora-edit">{{ $t("ora") }}</label>
      <VueDatePicker
        :key="'dp-edit-' + (trattaModifica?.id ?? '')"
        id="ora-edit"
        time-picker
        text-input
        :hours-increment="1"
        :minutes-increment="5"
        :minutes-grid-increment="5"
        format="HH:mm"
        v-model="trattaModifica.ora"
        locale="it"
        :select-text="$t('assign')"
        :cancel-text="$t('cancel')"
      />

      <label for="descrizione">{{ $t("description") }}</label>
      <input type="text" v-model="trattaModifica.descrizione" placeholder="" />

      <label for="indirizzopartenza">{{ $t("departureAddress") }}</label>
      <input type="text" v-model="trattaModifica.indirizzopartenza" placeholder="" />

      <label for="indirizzoarrivo">{{ $t("arrivalAddress") }}</label>
      <input type="text" v-model="trattaModifica.indirizzoarrivo" placeholder="" />

      <label for="tutor">{{ $t("tutor") }}</label>
      <input type="text" v-model="trattaModifica.tutor" placeholder="" />

      <label class="form-label">{{ t("frequency") }}</label
      ><br />
      <div class="form-check form-check-inline">
        <Multiselect
          v-model="trattaModifica.cadenza"
          :options="daysOptions"
          mode="tags"
          :close-on-select="false"
          placeholder="Seleziona giorni"
          label="text"
          track-by="value"
          class="w-100"
        />
      </div>

      <div v-if="successMessage" class="alert alert-success">
        {{ successMessage }}
      </div>
      <div style="height: 20px"></div>

      <div class="d-flex justify-content-end gap-2">
        <button @click="saveChanges" class="btn btn-sm btn-primary">
          {{ $t("save") }}
        </button>
        <button @click="closeModal" class="btn btn-sm btn-secondary">
          {{ $t("close") }}
        </button>
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
/* Modale */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  width: 300px;
}

.modal-buttons {
  display: flex;
  justify-content: space-between;
}

button {
  padding: 10px;
  cursor: pointer;
}

button:hover {
  background-color: #f0f0f0;
}

/* Messaggi di errore */
.error-message {
  color: red;
  font-size: 14px;
  margin-top: 10px;
}

/* Messaggi di successo */
.success-message {
  color: green;
  font-size: 14px;
  margin-top: 10px;
}
</style>
