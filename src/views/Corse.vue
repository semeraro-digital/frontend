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

const newCorsa = ref({
  datapartenza: datafiltro,
  orapartenza: "",
  tratta: {},
  autista: {},
  mezzo: {},
  tutor: "",
});
const corsaModifica = ref({
  datapartenza: datafiltro,
  orapartenza: "",
  tratta: {},
  autista: {},
  mezzo: {},
  tutor: "",
});
const newCorse = ref([]);

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
  await loadCorse(); // Aspetta che loadCorse() finisca prima di proseguire
  await loadTratte();
  loadVeicoli(); // Puoi chiamare questa funzione in parallelo
  loadAutisti();
  loadInfoCadenza(); // Ora chiamato dopo loadCorse()
});

const aggiornaDataFiltro = (nuovaData) => {
  datafiltro.value = moment(nuovaData).startOf("day");
  aggiornaPagina();
};

const aggiornaPagina = async (id) => {
  resetNewCorsa();
  await loadCorse();
  loadInfoCadenza();
};

// Carica le corse dal server
const loadCorse = async () => {
  try {
    isLoading.value = true;
    const startDate = new Date(datafiltro.value.toDate().setHours(0, 0, 0, 0));
    const endDate = new Date(datafiltro.value.toDate().setHours(23, 59, 59, 999));
    const payload = {
      datapartenza: startDate.toISOString(),
      dataarrivo: endDate.toISOString(),
    };
    const response = await axios.post(
      `${API_BASE_URL}/assegnazioni/assegnazioniRange`,
      payload
    );
    corse.value = response.data;
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
    veicoli.value = response.data;
  } catch (err) {
    error.value = err.response ? err.response.data.message : err.message;
  } finally {
    isLoading.value = false;
  }
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
const loadAutisti = async () => {
  try {
    isLoading.value = true;
    const response = await axios.get(`${API_BASE_URL}/autisti`);
    autisti.value = response.data;
    autisti.value.forEach((elem) => (elem.fullName = elem.nome + " " + elem.cognome));
  } catch (err) {
    error.value = err.response ? err.response.data.message : err.message;
  } finally {
    isLoading.value = false;
  }
};

// Veicoli
const searchVeicoli = ref({});
const veicoli = ref([]);

// Tratte
const searchTratte = ref({});
const tratte = ref([]);
const tratteFiltrate = ref({});

// Autisti
const searchAutisti = ref({});
const autisti = ref([]);

// Funzione per eliminare una corsa
const eliminaCorsa = async (id) => {
  if (confirm(t("confirmDelete"))) {
    try {
      await axios.delete(`${API_BASE_URL}/corse/corsaAssegnazione/${id}`);
      //corse.value = corse.value.filter((corsa) => corsa.id !== id);

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
  resetNewCorsa();
};

// Aggiungi una nuova corsa
const aggiungiCorsa = async () => {
  try {
    const request = createMassiveRequest();

    const response = await axios.post(
      `${API_BASE_URL}/assegnazioni/aggiungiAll`,
      request
    );

    // request.id = response.data;
    // corse.value.push(request); // Aggiungi la nuova corsa alla tabella
    isAddingRow.value = false; // Nascondi la riga di inserimento
    resetNewCorsa(); // Resetta i campi del form
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
    const requestNewCorsa = JSON.parse(JSON.stringify(newCorsa.value));
    requestNewCorsa.datapartenza = moment(requestNewCorsa.datapartenza)
      .hours(requestNewCorsa.orapartenza.hours)
      .minutes(requestNewCorsa.orapartenza.minutes)
      .format();
    requestNewCorsa.dataarrivo = requestNewCorsa.datapartenza;
    requestNewCorsa.idAutista = requestNewCorsa.autista.id;
    requestNewCorsa.idMezzo = requestNewCorsa.mezzo.id;
    requestNewCorsa.idTratta = requestNewCorsa.tratta.id;
    delete requestNewCorsa.mezzo;
    delete requestNewCorsa.autista;
    delete requestNewCorsa.tratta;
    delete requestNewCorsa.orapartenza;
    request = [requestNewCorsa];
  }
  if (newCorse.value.length) {
    newCorse.value.forEach((nc) => {
      const ora = nc.tratta.ora.split(":");
      request.push({
        dataarrivo: moment(nc.tratta.datapartenza).hour(ora[0]).minute(ora[1]).format(),
        datapartenza: moment(nc.tratta.datapartenza).hour(ora[0]).minute(ora[1]).format(),
        idAutista: nc.autista.id,
        idMezzo: nc.mezzo.id,
        idTratta: nc.tratta.id,
        tutor: nc.tratta.tutor,
      });
    });
  }

  return request;
}

function filtraTratte() {
  const giorno = moment(newCorsa.value.datapartenza)
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
  addTratteANewCorse(corseAggiunte);
};

function addTratteANewCorse(corseDaaggiungere) {
  corseDaaggiungere.forEach((cor) => {
    newCorse.value.push(cor);
  });
}

// Reset dei campi di newCorsa
const resetNewCorsa = () => {
  newCorse.value = [];
  newCorsa.value = {
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
                <th scope="col">{{ $t("departureDate") }}</th>
                <th scope="col">{{ $t("departureTime") }}</th>
                <th scope="col">{{ $t("tratta") }}</th>
                <th scope="col">{{ $t("tutor") }}</th>
                <th scope="col">{{ $t("driver") }}</th>
                <th scope="col">{{ $t("vehicle") }}</th>
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
              <tr v-for="item in corse" :key="item.id">
                <td>{{ formatDate(item.datapartenza) }}</td>
                <td>{{ formatTime(item.datapartenza) }}</td>
                <td>{{ item.descrizionetratta }}</td>
                <td>{{ item.tutor }}</td>
                <td>{{ item.nomeautista }} {{ item.cognomeautista }}</td>
                <td>{{ item.modelloveicolo }}</td>
                <td class="text-right">
                  <button class="btn btn-primary" @click="openEditModal(item)">
                    <i class="fas fa-edit"></i>
                  </button>
                </td>
                <td class="text-left">
                  <button
                    @click="eliminaCorsa(item.idcorsa)"
                    class="btn btn-sm btn-danger"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
              <tr v-for="(item, index) in newCorse" :key="'new' + item.id">
                <td>{{ formatDate(item.tratta.datapartenza) }}</td>
                <td>{{ item.tratta.ora }}</td>
                <td>{{ item.tratta.descrizione }}</td>
                <td>{{ item.tratta.tutor }}</td>
                <td>
                  <TypeAhead
                    id="autisti"
                    :items="autisti"
                    v-model="item.autista"
                    :itemProjection="(it) => it.fullName"
                    :allow-new="true"
                  />
                </td>
                <td>
                  <TypeAhead
                    id="veicoli"
                    :items="veicoli"
                    v-model="item.mezzo"
                    :itemProjection="(it) => it.modello"
                    :allow-new="true"
                  />
                </td>
                <td class="text-right">
                  <button
                    @click="() => newCorse.splice(index, 1)"
                    class="btn btn-sm btn-secondary mr-1"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </td>
              </tr>
              <!-- Riga per l'inserimento della nuova corsa -->
              <tr v-if="isAddingRow">
                <td>
                  <VueDatePicker
                    id="data"
                    :enable-time-picker="false"
                    auto-apply
                    text-input
                    format="dd/MM/yyyy"
                    v-model="newCorsa.datapartenza"
                    locale="it"
                  ></VueDatePicker>
                </td>
                <td>
                  <VueDatePicker
                    id="ora"
                    time-picker
                    text-input
                    :hours-increment="1"
                    :minutes-increment="5"
                    :minutes-grid-increment="5"
                    format="HH:mm"
                    v-model="newCorsa.orapartenza"
                    locale="it"
                    :select-text="$t('assign')"
                    :cancel-text="$t('cancel')"
                  ></VueDatePicker>
                </td>

                <!-- Autocompletamento Tratte -->
                <td>
                  <TypeAhead
                    id="tratte"
                    :items="tratte"
                    v-model="newCorsa.tratta"
                    :itemProjection="(item) => item.descrizione"
                    :allow-new="true"
                  />
                </td>
                <td>
                  <input
                    v-model="newCorsa.tutor"
                    class="form-control"
                    placeholder="Tutor"
                  />
                </td>
                <td>
                  <TypeAhead
                    id="autisti"
                    :items="autisti"
                    v-model="newCorsa.autista"
                    :itemProjection="(item) => item.fullName"
                    :allow-new="true"
                  />
                </td>
                <!-- Autocompletamento Veicoli -->
                <td>
                  <TypeAhead
                    id="veicoli"
                    :items="veicoli"
                    v-model="newCorsa.mezzo"
                    :itemProjection="(item) => item.modello"
                    :allow-new="true"
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
        <button @click="aggiungiCorsa" class="btn btn-sm btn-success">
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
