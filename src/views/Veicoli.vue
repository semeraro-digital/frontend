<!--#### pagina veicoli  -->
<script setup>
import moment from "moment";
import "moment/locale/it";
import axios from "axios";
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import _ from "lodash";

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

const newVeicolo = ref({
  modello: '',
  capienza: '',
  targa: '',
  scadenzabollo: '',
  scadenzaassicurazione: ''
});
const veicoloModifica = ref({
  modello: '',
  capienza: '',
  targa: '',
  scadenzabollo: '',
  scadenzassicurazione: ''
});
const newVeicoli  = ref([]);

// Variabili per la modale di modifica VEICOLO
const isModalOpen = ref(false);
//const corsaModifica = ref({});
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
  loadVeicoli(); 
});

const aggiornaDataFiltro = (nuovaData) => {
  datafiltro.value = moment(nuovaData).startOf("day");
  aggiornaPagina();
};

const aggiornaPagina = async (id) => {
  resetnewVeicolo();
  await loadVeicoli();
};


const loadVeicoli = async () => {
  try {
    isLoading.value = true;
    const response = await axios.get(`${API_BASE_URL}/veicoli`);
    veicoli.value = response.data;
  } catch (err) {
    error.value = err.response ? err.response.data.message : err.message;
  } finally {
    isLoading.value = false;
  }
};


// Veicoli
const veicoli = ref([]);


// Funzione per eliminare una corsa
const eliminaVeicolo = async (id) => {
  if (confirm(t("confirmDelete"))) {
    try {
      await axios.delete(`${API_BASE_URL}/veicoli/${id}`);

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
  resetnewVeicolo();
};

// Aggiungi una nuova corsa
const aggiungiVeicolo= async () => {
  try {
    const request = createMassiveRequest();
console.log("request "+request);
    const response = await axios.post(
      `${API_BASE_URL}/veicoli/aggiungiAll`,
      request
    );

    isAddingRow.value = false; // Nascondi la riga di inserimento
    resetnewVeicolo(); // Resetta i campi del form
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
    const requestnewVeicolo = JSON.parse(JSON.stringify(newVeicolo.value));
    requestnewVeicolo.scadenzaassicurazione = moment(requestnewVeicolo.scadenzaassicurazione).format();
     requestnewVeicolo.scadenzabollo = moment(requestnewVeicolo.scadenzabollo).format();
    requestnewVeicolo.targa = requestnewVeicolo.targa;
    requestnewVeicolo.capienza = requestnewVeicolo.capienza;
    requestnewVeicolo.modello = requestnewVeicolo.modello;
    request = [requestnewVeicolo];
  }
  return request;
}


const nuovoDatoCorse = null;



// Reset dei campi di newVeicolo
const resetnewVeicolo = () => {
  newVeicoli.value = [];
  newVeicolo.value = {
    datapartenza: datafiltro,
    orapartenza: "",
    tratta: {},
    autista: {},
    mezzo: {},
    tutor: "",
  };
};

//modale
// Funzione per aprire la modale e caricare i dettagli della corsa
const openEditModal = (veicolo) => {
  veicoloModifica.value = { ...veicolo }; // Cloniamo l'oggetto della corsa selezionata

  console.log(veicoloModifica.value);

  isModalOpen.value = true; // Apriamo la modale
  errorMessage.value = "";
  successMessage.value = "";
};

// Funzione per salvare le modifiche della corsa
const saveChanges = async () => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/veicoli/modifica/`,
      veicoloModifica.value
    );
    if (response.status === 200) {
      const index = corse.value.findIndex((c) => c.id === veicoloModifica.value.id);
      if (index !== -1) {
        corse.value[index] = { ...veicoloModifica.value }; // Aggiorniamo la corsa nella lista
      }
      successMessage.value = "Corsa aggiornata con successo!";
    }
    closeModal();
  } catch (error) {
    console.error("Errore durante l'aggiornamento della corsa:", error);
    errorMessage.value = "Si è verificato un errore durante l'aggiornamento della corsa.";
  }
};

// Funzione per chiudere la modale senza salvare
const closeModal = () => {
  isModalOpen.value = false;
  veicoloModifica.value = {};
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
                <th scope="col">{{ $t("model") }}</th>
                <th scope="col">{{ $t("capacity") }}</th>
                <th scope="col">{{ $t("licensePlate") }}</th>
                <th scope="col">{{ $t("taxDeadline") }}</th>
                <th scope="col">{{ $t("insuranceDeadline") }}</th>
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
        <!--      <tr v-if="corse.length === 0">
                <td class="text-center" colspan="7">{{ t("noCoursesAvailable") }}</td>
              </tr>-->
              <tr v-for="item in veicoli" :key="item.id">
                <td>{{ item.modello }}</td>
                <td>{{ item.capienza }}</td>
                <td>{{ item.targa }} {{ item.targa }}</td>
                <td>{{ formatDate(item.scadenzabollo) }}</td>
                <td>{{ formatDate(item.scadenzaassicurazione) }}</td>
                <td class="text-right">
                  <button class="btn btn-primary" @click="openEditModal(item)">
                    <i class="fas fa-edit"></i>
                  </button>
                </td>
                <td class="text-left">
                  <button
                    @click="eliminaVeicolo(item.id)"
                    class="btn btn-sm btn-danger"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
              <tr v-for="(item, index) in newVeicoli" :key="'new' + item.id">
                <td>{{ item.modello }}</td>
                <td>{{ item.capienza }}</td>
                <td>{{ item.targa }}</td>
                <td>{{ formatDate(item.scadenzabollo) }}</td>
                <td>{{ formatDate(item.scadenzaassicurazione) }}</td>
                
                <td class="text-right">
                  <button
                    @click="() => newVeicoli.splice(index, 1)"
                    class="btn btn-sm btn-secondary mr-1"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </td>
              </tr>
              <!-- Riga per l'inserimento della nuova corsa -->
              <tr v-if="isAddingRow">
                <td>
             <input
                    v-model="newVeicolo.modello"
                    class="form-control"
                    placeholder="Modello"
                  />
                </td>
                <td>
                  <input
                    v-model="newVeicolo.capienza"
                    class="form-control"
                    placeholder="Capienza"
                  />
                </td>
                <td>
                  <input
                    v-model="newVeicolo.targa"
                    class="form-control"
                    placeholder="Targa"
                  />
             
                </td>
               <td>
                  <VueDatePicker
                    id="scadenzabollo"
                    :enable-time-picker="false"
                    auto-apply
                    text-input
                    format="dd/MM/yyyy"
                    v-model="newVeicolo.scadenzabollo"
                    locale="it"
                  ></VueDatePicker>
                </td>
                 <td>
                  <VueDatePicker
                    id="scadenzaassicurazione"
                    :enable-time-picker="false"
                    auto-apply
                    text-input
                    format="dd/MM/yyyy"
                    v-model="newVeicolo.scadenzaassicurazione"
                    locale="it"
                  ></VueDatePicker>
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
        <button @click="aggiungiVeicolo" class="btn btn-sm btn-success">
          {{ $t("addVehicle") }}
        </button>
      </div>
    </div>
  </div>

  <!-- Modale di modifica corsa -->
  <div v-if="isModalOpen" class="modal">
    <div class="modal-content">
      <h2>{{ $t("modificaCorsa") }}</h2>

     <label for="modello">{{ $t("model") }}</label>
      <input type="text" v-model="veicoloModifica.modello" placeholder="" />
      <div v-if="errorMessage" class="alert alert-danger">
        {{ errorMessage }}
      </div>
  <label for="capienza">{{ $t("capacity") }}</label>
      <input type="number" v-model="veicoloModifica.capienza" placeholder="" />
      <div v-if="errorMessage" class="alert alert-danger">
        {{ errorMessage }}
      </div>
  <label for="targa">{{ $t("licensePlate") }}</label>
      <input type="targa" v-model="veicoloModifica.targa" placeholder="" />
      <div v-if="errorMessage" class="alert alert-danger">
        {{ errorMessage }}
      </div>

      <label for="scadenzabollo">{{ $t("taxDeadline") }}</label>
      <VueDatePicker
        id="b"
        :enable-time-picker="true"
        auto-apply
        text-input
        format="dd/MM/yyyy"
        v-model="veicoloModifica.scadenzabollo"
        locale="it"
      ></VueDatePicker>
      <label for="scadenzabollo">{{ $t("insuranceDeadline") }}</label>
      <VueDatePicker
        id="scadenzaassicurazione"
        :enable-time-picker="true"
        auto-apply
        text-input
        format="dd/MM/yyyy"
        v-model="veicoloModifica.scadenzaassicurazione"
        locale="it"
      ></VueDatePicker>


 
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
