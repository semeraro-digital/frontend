<script setup>
import { ref, onMounted, reactive } from "vue";
import axios from "axios";
import defaultImage from "@/assets/avatar1.png";
import { useRoute, useRouter } from "vue-router";
import { Modal } from "bootstrap";
import moment from "moment";

const route = useRoute();
const router = useRouter();
const id = route.params.id;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
//variabili mia modale
let addAssegnazioneModal = null;
let deleteAutistiModal = null;

let assegnazioni = ref([]);
let error = ref(null);
let newAssegnazione = ref({
  datapartenza: "",
  dataarrivo: "",
  idautista: "",
  idmezzo: "",
  idtratta: "",
  stato: "",
  reportid: "",
});
let autista = ref({
  nome: "",
  cognome: "",
  codFiscale: "",
  scadenzaPatente: "",
  email: "",
  telefono: "",
  numPatente: "",
});

onMounted(() => {
  deleteAutistiModal = new Modal("#modaleDelete");
  addAssegnazioneModal = new Modal("#modalAddAss");

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1); // Imposta la data di domani
  const startDate = new Date(today.setHours(0, 0, 0, 0)); // Imposta la data di inizio oggi
  const endDate = new Date(tomorrow.setHours(23, 59, 59, 999)); // Imposta la data di fine a domani

  const payload = {
    idAutista:id,
    dataInizio: startDate.toISOString(),
    dataFine: endDate.toISOString(),
  };
  axios
    .post(`${API_BASE_URL}/assegnazioni/filtrateByAutista`, payload)
    .then((response) => {
      assegnazioni.value = response.data;
    })
    .catch((err) => {
      error.value = err.response ? err.response.data.message : err.message;
      console.error("Errore durante la chiamata API:", err);
    });

  axios
    .get(`${API_BASE_URL}/autisti`, { params: { id: id } })
    .then((response) => {
      const autistaTrovato = response.data.find((item) => item.id === id);
      if (autistaTrovato) {
        autista.value = autistaTrovato;
      } else {
        console.error("Autista non trovato");
      }
    })
    .catch((err) => {
      error.value = err.response ? err.response.data.message : err.message;
      console.error("Errore durante la chiamata API:", err);
    });
});

const saveAssegnazione = async () => {
  try {
    const request = {
      datapartenza: newAssegnazione.value.datapartenza,
      dataarrivo: newAssegnazione.value.dataarrivo,
      idautista: newAssegnazione.value.idautista,
      idmezzo: newAssegnazione.value.idmezzo,
      idtratta: newAssegnazione.value.idtratta,
      stato: newAssegnazione.value.stato,
      reportid: newAssegnazione.value.reportid,
    };
    const response = await axios.post(`${API_BASE_URL}/assegnazioni`, request);
    assegnazioni.value.push(request);
    resetForm();
  } catch (err) {
    console.error("Errore durante l'inserimento dell'assegnazione:", err);
    error.value = err.response ? err.response.data.message : err.message;
  }
};

function formatDateTime(dateTime) {
  const formattedDate = moment.utc(dateTime).format("DD/MM/YYYY");
  //const formattedTime = moment.utc(dateTime).format("HH:mm");
  const formattedTime =  moment(dateTime).format("HH:mm");
  return `${formattedDate} ${formattedTime}`;
}
function formatDate(dateString) {
  return moment(dateString).format("DD/MM/YYYY");
}

const cancellaAutista = async () => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/autisti/${id}`);
    console.log("Autista cancellato con successo:", response.data);
    // COMMENTO qui devi fare attenzione a usare push poi ti spiego perché ricordamelo
    // router.push('/nuova-url');
    deleteAutistiModal.hide();
    await router.replace({ path: "/autisti" });
  } catch (err) {
    console.error("Errore durante la cancellazione dell'autista:", err);
    error.value = err.response ? err.response.data.message : err.message;
  } finally {
  }
};

const resetForm = () => {
  newAssegnazione.value = {
    datapartenza: "",
    dataarrivo: "",
    idautista: "",
    idmezzo: "",
    idtratta: "",
    stato: "",
    reportid: "",
  };
};
</script>
<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col">
        <div class="card bg-secondary-light p-4">
          <div class="row">
            <div class="col-sm-10">
              <div class="row align-items-center">
                <div class="col-auto">
                  <div class="avatar-lg">
                    <img
                      :src="defaultImage"
                      alt=""
                      class="rounded-circle img-thumbnail custom-avatar"
                    />
                  </div>
                </div>
                <div class="col">
                  <div>
                    <h4 class="mt-1 mb-1 text-white">
                      {{ autista.nome }} {{ autista.cognome }}
                    </h4>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-sm-2 text-right">
              <button class="btn btn-danger" @click="() => deleteAutistiModal.show()">
                <i class="fas fa-fw fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-4">
        <div class="card">
          <div class="card-body">
            <h4 class="header-title mt-0 mb-3">{{ $t("informazioniPers") }}</h4>
            <p class="text-muted font-13">{{ $t("autista") }}</p>
            <hr />
            <div class="text-start">
              <p class="text-muted">
                <strong>{{ $t("nomeCognome") }}:</strong>
                <span class="ms-2">{{ autista.nome }} {{ autista.cognome }}</span>
              </p>
              <p class="text-muted">
                <strong>{{ $t("driverPhone") }} :</strong>
                <span class="ms-2">{{ autista.telefono }}</span>
              </p>
              <p class="text-muted">
                <strong>{{ $t("driverEmail") }}:</strong>
                <span class="ms-2">{{ autista.email }}</span>
              </p>
              <p class="text-muted">
                <strong>{{ $t("codiceFiscale") }} :</strong>
                <span class="ms-2">{{ autista.codfiscale }}</span>
              </p>
              <p class="text-muted">
                <strong>{{ $t("driverLicense") }} :</strong>
                <span class="ms-2"> {{ autista.numpatente }}</span>
              </p>
              <p class="text-muted">
                <strong>{{ $t("driverLicenseExpiry") }}</strong>
                <span class="ms-2">{{ formatDate(autista.scadenzapatente) }}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
      <div class="col-8">
        <div class="card">
          <div class="card-body">
            <h4 class="header-title mb-3">{{ $t("service") }}</h4>
            <div class="table-responsive">
              <table class="table table-hover table-centered mb-0">
                <thead>
                  <tr>
                    <th>{{ $t("departureDate") }}</th>
                    <th>{{ $t("tratta") }}</th>
                    <th>{{ $t("vehicle") }}</th>
                    <th>{{ $t("sendEmail") }}</th>
                     <th>{{ $t("sendWA") }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="assegnazioni.length === 0">
                    <td colspan="8">Nessuna corsa disponibile</td>
                  </tr>
                  <tr v-for="(item, index) in assegnazioni" :key="item.id">
                    <td>{{ formatDateTime(item.datapartenza) }}</td>
                    <td>{{ item.descrizionetratta }}</td>
                    <td>{{ item.modelloveicolo }}</td>
                    <td>{{ item.reportsendemail }}</td>
                     <td>{{ item.reportsendwa }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <!--  <button type="button" class="btn btn-secondary mt-3 float-right" data-bs-toggle="modal"
                    data-bs-target="#addAssegnazioneModal"> Aggiungi
            </button> -->
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="container-fluid">
    <!-- Tabella delle assegnazioni -->
    <div class="container-fluid">
      <div
        v-if="error"
        class="alert alert-danger text-center"
        role="alert"
        style="margin-top: 20px"
      >
        Errore durante il caricamento delle corse: {{ error }}
      </div>
    </div>

    <!-- Modale per aggiungere un'assegnazione -->

    <div
      class="modal fade"
      id="modalAddAss"
      tabindex="-1"
      aria-labelledby="modalAddAssLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="modalAddAssLabel">Aggiungi Assegnazione</h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveAssegnazione">
              <div class="mb-3">
                <label for="datapartenza" class="form-label">Data Partenza</label>
                <input
                  type="date"
                  id="datapartenza"
                  v-model="newAssegnazione.datapartenza"
                  class="form-control"
                  required
                />
              </div>
              <div class="mb-3">
                <label for="dataarrivo" class="form-label">Data Arrivo</label>
                <input
                  type="date"
                  id="dataarrivo"
                  v-model="newAssegnazione.dataarrivo"
                  class="form-control"
                  required
                />
              </div>
              <div class="mb-3">
                <label for="idautista" class="form-label">Id Autista</label>
                <input
                  type="text"
                  id="idautista"
                  v-model="newAssegnazione.idautista"
                  class="form-control"
                  required
                />
              </div>
              <div class="mb-3">
                <label for="idmezzo" class="form-label">Id Mezzo</label>
                <input
                  type="text"
                  id="idmezzo"
                  v-model="newAssegnazione.idmezzo"
                  class="form-control"
                  required
                />
              </div>
              <div class="mb-3">
                <label for="idtratta" class="form-label">Id Tratta</label>
                <input
                  type="text"
                  id="idtratta"
                  v-model="newAssegnazione.idtratta"
                  class="form-control"
                  required
                />
              </div>
              <div class="mb-3">
                <label for="stato" class="form-label">Stato</label>
                <input
                  type="text"
                  id="stato"
                  v-model="newAssegnazione.stato"
                  class="form-control"
                  required
                />
              </div>
              <div class="mb-3">
                <label for="reportid" class="form-label">Report ID</label>
                <input
                  type="text"
                  id="reportid"
                  v-model="newAssegnazione.reportid"
                  class="form-control"
                  required
                />
              </div>
              <button type="submit" class="btn btn-primary">Salva</button>
            </form>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- modale cancellazione -->
  <div
    class="modal fade"
    id="modaleDelete"
    tabindex="-1"
    aria-labelledby="modaleDeletelLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="modaleDeleteLabel">Cancellare autista?</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">Sei sicuro di voler cancellare l'autista?</div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
            Close
          </button>
          <!-- Pulsante per confermare la cancellazione -->
          <button type="button" class="btn btn-primary" @click="cancellaAutista">
            Conferma
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.bg-secondary-light {
  background-color: #bdc0c9;
}

.custom-avatar {
  margin-left: 20px;
  width: 120px;
  height: 120px;
}
</style>
