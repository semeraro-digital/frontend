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
  scadenzaBollo: '',
  scadenzaAssicurazione: ''
});
const veicoloModifica = ref({
  modello: '',
  capienza: '',
  targa: '',
  scadenzaBollo: '',
  scadenzaAssicurazione: ''
});

// Variabili per la modale di modifica corsa
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
  await loadCorse();
  loadInfoCadenza();
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
const searchVeicoli = ref({});
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

    const response = await axios.post(
      `${API_BASE_URL}/veicoli`,
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
    requestnewVeicolo.scadenzaAssicurazione = moment(requestnewVeicolo.scadenzaAssicurazione).format();
     requestnewVeicolo.scadenzaBollo = moment(requestnewVeicolo.scadenzaBollo).format();
    requestnewVeicolo.targa = requestnewVeicolo.targa;
    requestnewVeicolo.capienza = requestnewVeicolo.capienza;
    requestnewVeicolo.modello = requestnewVeicolo.modello;
    delete requestnewVeicolo.modello;
    delete requestnewVeicolo.capienza;
    delete requestnewVeicolo.targa;
    delete requestnewVeicolo.scadenzaAssicurazione;
     delete requestnewVeicolo.scadenzaBollo;
    request = [requestnewVeicolo];
  }
  if (newVeicoli.value.length) {
    newVeicoli.value.forEach((nc) => {
      const ora = nc.tratta.ora.split(":");
      request.push({

          modello: nc.modello,
  capienza: nc.capienza,
  targa: nc.targa,
  scadenzaBollo: moment(nc.scadenzaBollo) ,
  scadenzaAssicurazione:moment( nc.scadenzaAssicurazione)
      });
    });
  }

  return request;
}

function filtraTratte() {
  const giorno = moment(newVeicolo.value.datapartenza)
    .locale("en")
    .format("ddd")
    .toUpperCase();
  tratteFiltrate.value = _.cloneDeep(tratte.value);

  _.remove(tratteFiltrate.value, (tratta) => {
    console.log(tratta.ora + " " + tratta.cadenza + " " + tratta.descrizione);
    let esiste = false;

    const cadenzaMatch = tratta.cadenza.indexOf(giorno) >= 0;
    if (!tratta.ora) {
      return true;
    }
    const existing = _.some(corse.value, (corsa) => {
      if (!esiste) {
        esiste =
          tratta.id === corsa.idtratta &&
          moment(corsa.datapartenza).isSame(datafiltro.value, "day") &&
          moment(corsa.datapartenza).format("HH:mm") === tratta.ora;
      }
    });
    // console.log("esiste "+esiste+" cadenzaMatch "+cadenzaMatch)
    return !cadenzaMatch || esiste;
  });
}
const nuovoDatoCorse = null;

const loadInfoCadenza = () => {
  filtraTratte();
  // Ciclare su ciascuna tratta filtrata e aggiungere una lista di nuovi oggetti corse
  const corseAggiunte = tratteFiltrate.value.map((tratta) => {
    tratta.datapartenza = datafiltro;
    return {
      tutor: tratta.tutor, // Usa la descrizione della tratta
      tratta: tratta, // Aggiungi il riferimento alla tratta
      autista: {},
      mezzo: {},
    };
  });
  addTratteAnewVeicoli(corseAggiunte);
};

function addTratteAnewVeicoli(corseDaaggiungere) {
  corseDaaggiungere.forEach((cor) => {
    newVeicoli.value.push(cor);
  });
}

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
  searchVeicoli.value = "";
  searchTratte.value = "";
  searchAutisti.value = "";
};

//modale
// Funzione per aprire la modale e caricare i dettagli della corsa
const openEditModal = (corsa) => {
  corsaModifica.value = { ...corsa }; // Cloniamo l'oggetto della corsa selezionata

  console.log(corsaModifica.value);

  isModalOpen.value = true; // Apriamo la modale
  errorMessage.value = "";
  successMessage.value = "";
};

// Funzione per salvare le modifiche della corsa
const saveChanges = async () => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/assegnazioni/modifica/`,
      corsaModifica.value
    );
    if (response.status === 200) {
      const index = corse.value.findIndex((c) => c.id === corsaModifica.value.id);
      if (index !== -1) {
        corse.value[index] = { ...corsaModifica.value }; // Aggiorniamo la corsa nella lista
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
  corsaModifica.value = {};
  aggiornaPagina();
};
</script>

<template>
  <div class="row mb-3">
    <div class="col-lg-5">
      <label for="dataFiltro">{{ $t("filterDate") }}</label>
      <VueDatePicker
        id="dataFiltro"
        v-model="datafiltro"
        :format="'dd/MM/yyyy'"
        auto-apply
        text-input
        locale="it"
        @update:model-value="aggiornaDataFiltro"
      ></VueDatePicker>
    </div>
  </div>

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
              <tr v-if="corse.length === 0">
                <td class="text-center" colspan="7">{{ t("noCoursesAvailable") }}</td>
              </tr>
              <tr v-for="item in veicoli" :key="item.id">
                <td>{{ item.modello }}</td>
                <td>{{ item.capienza }}</td>
                <td>{{ item.targa }} {{ item.targa }}</td>
                <td>{{ formatDate(item.scadenzaBollo) }}</td>
                <td>{{ formatTime(item.scadenzaAssicurazione) }}</td>
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
                <td>{{ formatDate(item.scadenzaBollo) }}</td>
                <td>{{ formatDate(item.scadenzaAssicurazione) }}</td>
                
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
                    id="scadenzaBollo"
                    :enable-time-picker="false"
                    auto-apply
                    text-input
                    format="dd/MM/yyyy"
                    v-model="newVeicolo.scadenzaBollo"
                    locale="it"
                  ></VueDatePicker>
                </td>
                 <td>
                  <VueDatePicker
                    id="scadenzaAssicurazione"
                    :enable-time-picker="false"
                    auto-apply
                    text-input
                    format="dd/MM/yyyy"
                    v-model="newVeicolo.scadenzaAssicurazione"
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
          {{ $t("aggiungiCorse") }}
        </button>
      </div>
    </div>
  </div>

  <!-- Modale di modifica corsa -->
  <div v-if="isModalOpen" class="modal">
    <div class="modal-content">
      <h2>{{ $t("modificaCorsa") }}</h2>

      <label for="data">{{ $t("departureDate") }}</label>
      <VueDatePicker
        id="data"
        :enable-time-picker="true"
        auto-apply
        text-input
        format="dd/MM/yyyy HH:mm:ss"
        v-model="corsaModifica.datapartenza"
        locale="it"
      ></VueDatePicker>
      <label for="tratta">{{ $t("tratta") }}</label>
      <select id="tratte" v-model="corsaModifica.idtratta" @change="handleTrattaChange">
        <option value="" disabled selected>...</option>
        <option v-for="tratta in tratte" :key="tratta.id" :value="tratta.id">
          {{ tratta.descrizione }}
        </option>
      </select>
      <label for="autista">{{ $t("autista") }}</label>
      <select id="autisti" v-model="corsaModifica.idautista" @change="handleTrattaChange">
        <option value="" disabled selected>...</option>
        <option v-for="autista in autisti" :key="autista.id" :value="autista.id">
          {{ autista.nome }} {{ autista.cognome }}
        </option>
      </select>

      <label for="mezz">{{ $t("mezzo") }}</label>
      <select id="veicoli" v-model="corsaModifica.idmezzo" @change="handleTrattaChange">
        <option value="" disabled selected>Seleziona un autista</option>
        <option v-for="mezzo in veicoli" :key="mezzo.id" :value="mezzo.id">
          {{ mezzo.modello }}
        </option>
      </select>

      <label for="tutor">{{ $t("tutor") }}</label>
      <input type="text" v-model="corsaModifica.tutor" placeholder="Nome Tutor" />
      <div v-if="errorMessage" class="alert alert-danger">
        {{ errorMessage }}
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
