<!--#### pagina autisti  -->
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

const newAutista = ref({
  nomecognome: "",
  nickname: "",
  codfiscale: "",
  scadenzapatente: "",
  email: "",
  telefono: "",
  numpatente: "",
});
const autistaModifica = ref({
  nomecognome: "",
  nickname: "",
  codfiscale: "",
  scadenzapatente: "",
  email: "",
  telefono: "",
  numpatente: "",
});
const newAutisti  = ref([]);

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
  loadAutisti(); 
});

const aggiornaDataFiltro = (nuovaData) => {
  datafiltro.value = moment(nuovaData).startOf("day");
  aggiornaPagina();
};

const aggiornaPagina = async (id) => {
  resetnewAutista();
  await loadAutisti();
};


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


// autisti
const autisti = ref([]);


// Funzione per eliminare una corsa
const eliminaAutista = async (id) => {
  if (confirm(t("confirmDelete"))) {
    try {
      await axios.delete(`${API_BASE_URL}/autisti/${id}`);

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
  resetnewAutista();
};

// Aggiungi una nuova corsa
const aggiungiAutista= async () => {
  try {
    const request = createMassiveRequest();
console.log("request "+request);
    const response = await axios.post(
      `${API_BASE_URL}/autisti/aggiungiAll`,
      request
    );

    isAddingRow.value = false; // Nascondi la riga di inserimento
    resetnewAutista(); // Resetta i campi del form
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
    const requestnewAutista = JSON.parse(JSON.stringify(newAutista.value));
    requestnewAutista.nomecognome = requestnewAutista.nomecognome;
    requestnewAutista.nickname = requestnewAutista.nickname;
    requestnewAutista.codfiscale = requestnewAutista.codfiscale;
    requestnewAutista.scadenzapatente = moment(requestnewAutista.scadenzapatente).format();
    requestnewAutista.email = requestnewAutista.email;
    requestnewAutista.telefono = requestnewAutista.telefono;
    requestnewAutista.numpatente = requestnewAutista.numpatente;
    request = [requestnewAutista];
  }
  return request;
}


const nuovoDatoAutista = null;



// Reset dei campi di newAutista
const resetnewAutista = () => {
  newAutisti.value = [];
  newAutista.value = {
  nomecognome: "",
  nickname: "",
  codfiscale: "",
  scadenzapatente: "",
  email: "",
  telefono: "",
  numpatente: "",
  };
};

//modale
// Funzione per aprire la modale e caricare i dettagli della corsa
const openEditModal = (autista) => {
  autistaModifica.value = { ...autista }; // Cloniamo l'oggetto della corsa selezionata

  console.log(autistaModifica.value);

  isModalOpen.value = true; // Apriamo la modale
  errorMessage.value = "";
  successMessage.value = "";
};

// Funzione per salvare le modifiche della corsa
const saveChanges = async () => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/autisti/modifica/`,
      autistaModifica.value
    );
    if (response.status === 200) {
      const index = autista.value.findIndex((c) => c.id === autistaModifica.value.id);
      if (index !== -1) {
        autista.value[index] = { ...autistaModifica.value }; // Aggiorniamo la corsa nella lista
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
  autistaModifica.value = {};
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
                <th scope="col">{{ $t("driverName") }}</th>
                <th scope="col">{{ $t("driverLastName") }}</th>
                <th scope="col">{{ $t("codiceFiscale") }}</th>
                <th scope="col">{{ $t("driverLicenseExpiry") }}</th>
                <th scope="col">{{ $t("numpatente") }}</th>
                <th scope="col">{{ $t("driverEmail") }}</th>
                <th scope="col">{{ $t("enterPhone") }}</th>
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
              <tr v-for="item in autisti" :key="item.id">
                <td>{{ item.nomecognome }}</td>
                <td>{{ item.nickname }}</td>
               
                <td>{{ formatDate(item.scadenzapatente) }}</td>
                 <td>{{ item.numpatente }}</td>
          <td>{{ item.email }}</td>
         <td>{{ item.telefono }}</td>
                <td class="text-right">
                  <button class="btn btn-primary" @click="openEditModal(item)">
                    <i class="fas fa-edit"></i>
                  </button>
                </td>
                <td class="text-left">
                  <button
                    @click="eliminaAutista(item.id)"
                    class="btn btn-sm btn-danger"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
              <tr v-for="(item, index) in newAutisti" :key="'new' + item.id">
          <td>{{ item.nomecognome }}</td>
                <td>{{ item.nickname }}</td>
                <td>{{ item.codfiscale }}</td>
                <td>{{ formatDate(item.scadenzapatente) }}</td>
                 <td>{{ item.numpatente }}</td>
          <td>{{ item.email }}</td>
         <td>{{ item.telefono }}</td>
                

                
                <td class="text-right">
                  <button
                    @click="() => newAutisti.splice(index, 1)"
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
                    v-model="newAutista.nomecognome"
                    class="form-control"
                    placeholder=""
                  />
                </td>
                <td>
                  <input
                    v-model="newAutista.nickname"
                    class="form-control"
                    placeholder=""
                  />
                </td>
                <td>
                  <input
                    v-model="newAutista.codfiscale"
                    class="form-control"
                    placeholder=""
                  />
             
                </td>
               <td>
                  <VueDatePicker
                    id="scadenzapatente"
                    :enable-time-picker="false"
                    auto-apply
                    text-input
                    format="dd/MM/yyyy"
                    v-model="newAutista.scadenzapatente"
                    locale="it"
                  ></VueDatePicker>
                </td>
                <td>
                  <input
                    v-model="newAutista.numpatente"
                    class="form-control"
                    placeholder=""
                  />
                </td>
                <td>
                  <input
                    v-model="newAutista.email"
                    class="form-control"
                    placeholder=""
                  />
                </td>
                <td>
                  <input
                    v-model="newAutista.telefono"
                    class="form-control"
                    placeholder=""
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
        <button @click="aggiungiAutista" class="btn btn-sm btn-success">
          {{ $t("addDriver") }}
        </button>
      </div>
    </div>
  </div>

  <!-- Modale di modifica  -->
  <div v-if="isModalOpen" class="modal">
    <div class="modal-content">
      <h2>{{ $t("modificaCorsa") }}</h2>

     <label for="nomecognome">{{ $t("driverName") }}</label>
      <input type="text" v-model="autistaModifica.nomecognome" placeholder="" />
      <div v-if="errorMessage" class="alert alert-danger">
        {{ errorMessage }}
      </div>
  <label for="nickname">{{ $t("driverLastName") }}</label>
      <input type="text" v-model="autistaModifica.nickname" placeholder="" />
      <div v-if="errorMessage" class="alert alert-danger">
        {{ errorMessage }}
      </div>
        <label for="codfiscale">{{ $t("codiceFiscale") }}</label>
      <input type="text" v-model="autistaModifica.codfiscale" placeholder="" />
      <div v-if="errorMessage" class="alert alert-danger">
        {{ errorMessage }}
      </div>


      <label for="scadenzapatente">{{ $t("driverLicenseExpiry") }}</label>
      <VueDatePicker
        id="b"
        :enable-time-picker="true"
        auto-apply
        text-input
        format="dd/MM/yyyy"
        v-model="autistaModifica.scadenzapatente"
        locale="it"
      ></VueDatePicker>

        <label for="numpatente">{{ $t("enterLicenseNumber") }}</label>
      <input type="text" v-model="autistaModifica.numpatente" placeholder="" />
      <div v-if="errorMessage" class="alert alert-danger">
        {{ errorMessage }}
      </div>
        <label for="email">{{ $t("driverEmail") }}</label>
      <input type="text" v-model="autistaModifica.email" placeholder="" />
      <div v-if="errorMessage" class="alert alert-danger">
        {{ errorMessage }}
      </div>

        <label for="telefono">{{ $t("driverPhone") }}</label>
      <input type="text" v-model="autistaModifica.telefono" placeholder="" />
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
