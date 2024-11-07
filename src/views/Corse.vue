<script setup>
  import moment from "moment";
  import axios from "axios";
  import {onMounted, ref} from "vue";
  import {useI18n} from "vue-i18n";

  const {t} = useI18n();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const corse = ref([]);
  const error = ref(null);

  const isAddingRow = ref(false);
  const isLoading = ref(false);


  // Funzione per ottenere la data odierna in formato YYYY-MM-DD
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // Restituisce la data nel formato corretto
  };

  const newCorsa = ref({
    datapartenza: getTodayDate(),
    orapartenza: "",
    tratta: {},
    autista: {},
    mezzo:  {},
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
    loadVeicoli();
    loadTratte();
    loadAutisti();
  });

// Carica le corse dal server
const loadCorse = async () => {
  try {
    isLoading.value = true;
    const response = await axios.get(`${API_BASE_URL}/assegnazioni`);
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
    autisti.value.forEach(elem => elem.fullName = elem.nome + ' ' + elem.cognome);
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
        await loadCorse();
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
      const request = JSON.parse(JSON.stringify(newCorsa.value));
      request.datapartenza = moment(request.datapartenza).hours(request.orapartenza.hours).minutes(request.orapartenza.minutes).format();
      request.dataarrivo = request.datapartenza;
      request.idAutista = request.autista.id;
      request.idMezzo = request.mezzo.id;
      request.idTratta = request.tratta.id;
      delete request.mezzo;
      delete request.autista;
      delete request.tratta;
      delete request.orapartenza;
      console.log(request);
      // return;
      const response = await axios.post(`${API_BASE_URL}/assegnazioni/aggiungi`, request);

      // request.id = response.data;
      // corse.value.push(request); // Aggiungi la nuova corsa alla tabella
      isAddingRow.value = false; // Nascondi la riga di inserimento
      resetNewCorsa(); // Resetta i campi del form
      // Reload assignments
      await loadCorse();
    } catch (err) {
      console.log(err);
      error.value = err.response ? err.response.data.message : err.message;
    }
  };

  // Reset dei campi di newCorsa
  const resetNewCorsa = () => {
    newCorsa.value = {
      datapartenza: getTodayDate(),
      orapartenza: "",
      tratta: {},
      autista: {},
      mezzo:  {},
      tutor: "",
    };
    searchVeicoli.value = "";
    searchTratte.value = "";
    searchAutisti.value = "";
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
      {{ $t("errorLoadingData", {error}) }}
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
          <table class="table table-striped table-sm custom-table" style="margin-top: 20px">
            <thead class="thead-light">
            <tr>
              <th scope="col">Data partenza</th>
              <th scope="col">Ora partenza</th>
              <th scope="col">Descrizione</th>
              <th scope="col">Tutor</th>
              <th scope="col">{{ $t("driver") }}</th>
              <th scope="col">{{ $t("vehicle") }}</th>
              <th scope="col" class="text-right">
                <!-- Pulsante "+" per aggiungere una nuova riga -->
                <button @click="openAddRowModal" class="btn btn-sm btn-primary">
                  <i class="fa fa-plus"></i>
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
              <td>{{ item.descrizionetratta }}</td>
              <td>{{ item.tutor }}</td>
              <td>{{ item.nomeautista }} {{ item.cognomeautista }}</td>
              <td>{{ item.modelloveicolo }}</td>
              <td class="text-right">
                <button
                    @click="eliminaCorsa(item.idcorsa)"
                    class="btn btn-sm btn-danger"
                >
                  <i class="fas fa-trash"></i>
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
                <button @click="aggiungiCorsa" class="btn btn-sm btn-success">
                  <i class="fas fa-check"></i>
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
