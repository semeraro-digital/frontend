<script setup>
import moment from "moment";
import axios from "axios";
import { onMounted, ref, computed } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const corse = ref([]); // Inizializziamo `corse` come array vuoto
const error = ref(null);
const isLoading = ref(false);

// Campi di filtro per range di date
const filtroDataInizio = ref("");
const filtroDataFine = ref("");
const filtroTutor = ref("");
const filtroAutista = ref("");
const filtroVeicolo = ref("");

// Variabili di stato per la paginazione
const corsePerPagina = 10;
const paginaCorrente = ref(1);

// Funzione per ottenere la data odierna in formato YYYY-MM-DD
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

function formatDate(dateString) {
  return moment(dateString).format("DD/MM/YYYY");
}

function formatTime(dateString) {
  return moment(dateString).format("HH:mm");
}

onMounted(() => {
  loadCorse();
});

const loadCorse = async () => {
  try {
    isLoading.value = true;
    const response = await axios.get(`${API_BASE_URL}/assegnazioni`);
    corse.value = response.data || []; // Impostiamo `corse` come array vuoto se `data` è `undefined`
  } catch (err) {
    error.value = err.response ? err.response.data.message : err.message;
  } finally {
    isLoading.value = false;
  }
};

const eliminaCorsa = async (id) => {
  if (confirm(t("confirmDelete"))) {
    try {
      await axios.delete(`${API_BASE_URL}/corse/corsaAssegnazione/${id}`);
      await loadCorse();
    } catch (err) {
      error.value = err.response ? err.response.data.message : err.message;
    }
  }
};

// Funzione di filtro
const filtraCorse = () => {
  return (corse.value || []).filter((corsa) => { // Assicuriamoci che `corse.value` sia un array
    const corsaData = moment(corsa.datapartenza);

    // Filtraggio per range di date
    const matchDataPartenza = (!filtroDataInizio.value || corsaData.isSameOrAfter(filtroDataInizio.value)) &&
                              (!filtroDataFine.value || corsaData.isSameOrBefore(filtroDataFine.value));
console.log(matchDataPartenza);
    const matchTutor = !filtroTutor.value || (corsa.tutor && corsa.tutor.toLowerCase().includes(filtroTutor.value.toLowerCase()));
    const matchAutista = !filtroAutista.value || `${corsa.nomeautista} ${corsa.cognomeautista}`.toLowerCase().includes(filtroAutista.value.toLowerCase());
    const matchVeicolo = !filtroVeicolo.value || (corsa.modelloveicolo && corsa.modelloveicolo.toLowerCase().includes(filtroVeicolo.value.toLowerCase()));

    return matchDataPartenza && matchTutor && matchAutista && matchVeicolo;
  });
};

// Funzione per calcolare il totale delle pagine
const totalePagine = computed(() => {
  return Math.ceil(filtraCorse().length / corsePerPagina);
});

// Funzione per ottenere le corse della pagina corrente
const corsePaginazione = computed(() => {
  console.log("corsePaginazione");
  const inizio = (paginaCorrente.value - 1) * corsePerPagina;
  const fine = inizio + corsePerPagina;
const returnObj =filtraCorse().slice(inizio, fine);
console.log("ret "+returnObj.length);
  return returnObj;
});

// Funzioni per cambiare pagina
const vaiAllaPagina = (pagina) => {
  if (pagina >= 1 && pagina <= totalePagine.value) {
    paginaCorrente.value = pagina;
  }
};
</script>


<template>
  <div class="container-fluid">
    <!-- Messaggio di errore globale -->
    <div v-if="error" class="alert alert-danger text-center" role="alert" style="margin-top: 20px">
      {{ $t("errorLoadingData", { error }) }}
    </div>

    <!-- Spinner di caricamento -->
    <div v-if="isLoading" class="text-center" style="margin-top: 20px">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p>{{ $t("loadingData") }}</p>
    </div>

    <!-- Filtri di ricerca -->
    <div class="row mb-3">
      <div class="col-md-3">
        <label for="filtroDataInizio">{{ $t("dataInizio") }}</label>
        <input v-model="filtroDataInizio" type="date" class="form-control" placeholder="Data Inizio" />
      </div>
      <div class="col-md-3">
        <label for="filtroDataFine">{{ $t("dataFine") }}</label>
        <input v-model="filtroDataFine" type="date" class="form-control" placeholder="Data Fine" />
      </div>
      <div class="col-md-2">
        <label for="filtroTutor">{{ $t("tutor") }}</label>
        <input v-model="filtroTutor" type="text" class="form-control" placeholder="" />
      </div>
      <div class="col-md-2">
        <label for="filtroAutista">{{ $t("driver") }}</label>
        <input v-model="filtroAutista" type="text" class="form-control" placeholder="" />
      </div>
      <div class="col-md-2">
        <label for="filtroVeicolo">{{ $t("vehicle") }}</label>
        <input v-model="filtroVeicolo" type="text" class="form-control" placeholder="" />
      </div>
    </div>

    <!-- Tabella dei risultati -->
    <div class="row">
      <div class="col">
        <div v-if="!error && !isLoading">
          <table class="table table-striped table-sm custom-table" style="margin-top: 20px">
            <thead class="thead-light">
              <tr>
                <th scope="col">{{ $t("departureDate") }}</th>
                <th scope="col">{{ $t("departureTime") }}</th>
                <th scope="col">{{ $t("tratta") }}</th>
                <th scope="col">{{ $t("tutor") }}</th>
                <th scope="col">{{ $t("driver") }}</th>
                <th scope="col">{{ $t("vehicle") }}</th>
                <th scope="col" class="text-right">
             
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!corsePaginazione || corsePaginazione.length === 0">
                <td class="text-center" colspan="7">{{ t("noCoursesAvailable") }}</td>
              </tr>
              <tr v-for="item in corsePaginazione" :key="item.id">
                <td>{{ formatDate(item.datapartenza) }}</td>
                <td>{{ formatTime(item.datapartenza) }}</td>
                <td>{{ item.descrizionetratta }}</td>
                <td>{{ item.tutor }}</td>
                <td>{{ item.nomeautista }} {{ item.cognomeautista }}</td>
                <td>{{ item.modelloveicolo }}</td>
                <td class="text-right">
                  <button @click="eliminaCorsa(item.idcorsa)" class="btn btn-sm btn-danger">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Navigazione Paginazione -->
    <div class="row">
      <div class="col text-center">
        <nav v-if="totalePagine > 1" aria-label="Page navigation">
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: paginaCorrente === 1 }">
              <a class="page-link" href="#" @click.prevent="vaiAllaPagina(paginaCorrente - 1)">«</a>
            </li>
            <li v-for="pagina in totalePagine" :key="pagina" class="page-item" :class="{ active: paginaCorrente === pagina }">
              <a class="page-link" href="#" @click.prevent="vaiAllaPagina(pagina)">{{ pagina }}</a>
            </li>
            <li class="page-item" :class="{ disabled: paginaCorrente === totalePagine }">
              <a class="page-link" href="#" @click.prevent="vaiAllaPagina(paginaCorrente + 1)">»</a>
            </li>
          </ul>
        </nav>
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
</style>
