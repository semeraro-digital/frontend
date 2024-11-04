<script setup>
import moment from "moment";
import axios from "axios";
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { Modal } from "bootstrap";

const { t } = useI18n(); // Inizializza l'uso delle traduzioni
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const corse = ref([]);
const tratte = ref([]);
const error = ref(null);
const errorModal = ref(null); // Errore specifico per la funzione aggiungi()
const isLoading = ref(false); // Loading state

const newCorsa = ref({
  idtratta: "",
  datapartenza: "",
  dataarrivo: "",
  ora: "",
});


onMounted(() => {
   isLoading.value = true; // Set loading state to true
  corse.value.splice(0);
  axios
    .get(`${API_BASE_URL}/corse`)
    .then((response) => {
      corse.value.push(...response.data);
    })
    .catch((err) => {
      error.value = err.response ? err.response.data.message : err.message;
      console.error("Errore durante la chiamata API:", err);
    });

  axios
    .get(`${API_BASE_URL}/tratte`)
    .then((response) => {
      tratte.value.push(...response.data);
      console.log(tratte);
    })
    .catch((err) => {
      error.value = err.response ? err.response.data.message : err.message;
      console.error("Errore durante la chiamata API:", err);
    }) .finally(() => {
      isLoading.value = false; // Set loading state to false
    });
});

function formatDate(dateString) {
  return moment(dateString).format("DD/MM/YYYY");
}

// Funzione per eliminare una corsa
const eliminaCorsa = async (id) => {
  const confirmDelete = confirm(t("confirmDelete")); // Aggiungi un messaggio di conferma
  if (confirmDelete) {
    try {
      await axios.delete(`${API_BASE_URL}/corse/${id}`);
      // Rimuovi la corsa dall'array locale
      corse.value = corse.value.filter(corsa => corsa.id !== id);
      console.log("Corsa eliminata con successo");
    } catch (err) {
      console.error("Errore durante l'eliminazione della corsa:", err);
      error.value = err.response ? err.response.data.message : err.message;
    }
  }
};

// Funzione per caricare le assegnazioni
async function loadCorse() {
  try {
     isLoading.value = true; // Set loading state to true
    corse.value.splice(0); // Pulisci l'array esistente
    const response = await axios.get(`${API_BASE_URL}/corse`);
    corse.value.push(...response.data);
  } catch (err) {
    error.value = err.response ? err.response.data.message : err.message;
    console.error("Errore durante la chiamata API:", err);
  }finally {
    isLoading.value = false; // Set loading state to false
  }
}

const aggiungiCorsa = async () => {
  const request = JSON.parse(JSON.stringify(newCorsa.value));
  request.datapartenza = request.data + "T" + request.ora;
  request.dataarrivo = request.datapartenza;
  console.log(request);

  try {
    errorModal.value = null;
    const response = await axios.post(`${API_BASE_URL}/corse`, request);
    console.log("corse aggiunta:", response.data);

    const modalElement = document.getElementById("creaCorsaModal");
    const modal = Modal.getInstance(modalElement);
    if (modal) {
      modal.hide();
    }

    //devo aggiornare perforza
    corse.value.push(JSON.parse(JSON.stringify(newCorsa.value)));
    await loadCorse();

    newCorsa.value = {
      idtratta: "",
      datapartenza: "",
      dataarrivo: "",
      ora: "",
    };

    console.log("corsa inserita con successo");
  } catch (err) {
    errorModal.value = "Inserimento non avvenuto";
    const modalElement = document.getElementById("creaTrattaModal");
    const modal = Modal.getOrCreateInstance(modalElement);
    modal.show();
    console.error("Errore durante l'inserimento dell'assegnazione:", err);
    error.value = err.response ? err.response.data.message : err.message;
  }
};
</script>

<template>

  <div class="container-fluid">
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
    <div class="row">
      <div class="col">
        <div v-if="!error && !isLoading" class="table-responsive">
          <table class="table table-sm custom-table" style="margin-top: 20px">
            <thead class="thead-light">
              <tr>
                <th scope="col">Descrizione</th>
                <th scope="col">Data partenza</th>
                <th scope="col">Partenza</th>
                <th scope="col">Arrivo</th>
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="corse.length === 0">
                <td class="text-center" colspan="5">{{ t("noCoursesAvailable") }}</td>
              </tr>
              <tr v-for="item in corse" :key="item.id">
                <td>{{ item.descrizione }}</td>
                <td>{{ formatDate(item.datapartenza) }}</td>
                <td>{{ item.partenzatratta }}</td>
                <td>{{ item.arrivotratta }}</td>
                <td>
                  <button @click="eliminaCorsa(item.id)" class="btn btn-sm btn-danger">{{ t("delete") }}</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-12 text-right">
        <button
          type="button"
          class="btn btn-secondary"
          data-bs-toggle="modal"
          data-bs-target="#creaCorsaModal"
        >
          {{ t("createCourse") }}
        </button>
      </div>
    </div>

    <!-- Modale per aggiungere una corsa -->

    <div
      class="modal fade"
      id="creaCorsaModal"
      tabindex="-1"
      aria-labelledby="creaCorsaModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <form @submit.prevent="aggiungiCorsa">
            <div class="modal-header">
              <h5 class="modal-title" id="addVehicleModalLabel">
                {{ t("addAssignment") }}
              </h5>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label for="idTratta" class="form-label"> {{ t("selectRoute") }} </label>
                <select
                  class="form-select"
                  id="idTratta"
                  v-model="newCorsa.idtratta"
                  aria-label="Seleziona una tratta"
                >
                  <option v-for="tratta in tratte" :key="tratta.id" :value="tratta.id">
                    {{ tratta.descrizione }} - {{ tratta.indirizzopartenza }} -
                    {{ tratta.indirizzoarrivo }}
                  </option>
                </select>
              </div>
              <div class="mb-3">
                <label for="dataPartenza" class="form-label"
                  >{{ t("departureDate") }}
                </label>
                <input type="date" class="form-control" v-model="newCorsa.data" />
              </div>
              <div class="mb-3">
                <label for="oraPartenza" class="form-label"
                  >{{ t("departureTime") }}
                </label>
                <input type="time" class="form-control" v-model="newCorsa.ora" />
              </div>
            </div>
            <div class="modal-footer">
              <button type="submit" class="btn btn-primary">{{ t("save") }}</button>
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                {{ t("cancel") }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
