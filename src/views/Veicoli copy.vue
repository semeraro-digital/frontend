<script setup>
import axios from 'axios';
import { Modal } from 'bootstrap';
import defaultImage from '@/assets/autobus.png';
import aggiungiveicolo from '@/assets/iconaaggiungi.png';
import moment from 'moment';
import { onMounted, ref } from "vue";
import { useI18n } from 'vue-i18n'; // Importa useI18n

const { t } = useI18n(); // Destruttura t per le traduzioni
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const veicoli = ref([]);
const error = ref(null);
const selectedAutista = ref(null);
const newVeicolo = ref({
  modello: '',
  capienza: '',
  targa: '',
  scadenzaBollo: '',
  scadenzaAssicurazione: ''
});
let addVehicleModal;
let detailModal;

onMounted(() => {
  addVehicleModal = new Modal('#addVehicleModal');
  detailModal = new Modal('#myModal');

  veicoli.value.splice(0);
  
  axios.get(`${API_BASE_URL}/veicoli`)
      .then(response => {
        veicoli.value.push(...response.data);
      })
      .catch(error => {
        error.value = error.response ? t('errorLoadingVehicles', { error: error.response.data.message }) : error.message;
        console.error('Errore durante la chiamata API:', error);
      });

  const addVehicleModalElement = document.getElementById('addVehicleModal');
  addVehicleModalElement.addEventListener('shown.bs.modal', () => {
    const modelloInput = document.getElementById('modello');
    if (modelloInput) {
      modelloInput.focus();
    }
  });
});

function openAddVehicleModal() {
  try {
    addVehicleModal.show();
  } catch (err) {
    console.error("Errore nell'apertura della modale:", err);
  }
}

async function saveVehicle() {
  try {
    const response = await axios.post(`${API_BASE_URL}/veicoli`, newVeicolo.value);
    console.log('Veicolo aggiunto:', response.data);

    // Aggiorna la lista dei veicoli dopo l'aggiunta
    veicoli.value.push(JSON.parse(JSON.stringify(newVeicolo.value)));

    newVeicolo.value = {
      modello: '',
      capienza: '',
      targa: '',
      scadenzaBollo: '',
      scadenzaAssicurazione: ''
    };
    if (addVehicleModal) {
      addVehicleModal.hide();
    }

  } catch (error) {
    console.error('Errore durante l\'aggiunta del veicolo:', error);
    error.value = error.response ? error.response.data.message : error.message;
  }
}

function openDetailModal(item) {
  selectedAutista.value = item;
  detailModal.show();
}

function formatDate(dateString) {
  return moment(dateString).format('DD/MM/YYYY');
}

// Funzione per eliminare un veicolo
async function eliminaVeicolo(id) {
  const conferma = confirm(t('confirmDelete'));
  if (!conferma) return;

  try {
    await axios.delete(`${API_BASE_URL}/veicoli/${id}`);
    // Rimuovi il veicolo dall'array locale dopo l'eliminazione
    veicoli.value = veicoli.value.filter(veicolo => veicolo.id !== id);
    console.log(`Veicolo con ID ${id} eliminato con successo.`);
  } catch (error) {
    console.error('Errore durante l\'eliminazione del veicolo:', error);
    error.value = error.response ? error.response.data.message : error.message;
  }
}
</script>

<template>
  <div class="container-fluid">
    <div v-if="error" class="alert alert-danger text-center" role="alert" style="margin-top: 20px;">
      {{ error }}
    </div>

    <div v-if="!error" class="row" style="margin-top: 20px;">
      <div v-if="veicoli.length === 0" class="col-12 text-center">
        <p>{{ t('noVehicles') }}</p>
      </div>

      <div v-for="item in veicoli" :key="item.id" class="col mb-3">
        <div class="text-center">
          <div class="radius-15">
            <button type="button" class="bg-transparent border-0" @click="openDetailModal(item)">
              <img :src="defaultImage" width="150" class="rounded-circle shadow p-1 bg-white" alt="Immagine Autista">
            </button>
            <h5 class="mb-0 mt-3">{{ item.modello }}</h5>
          </div>
        </div>
      </div>

      <!-- Card per aggiungere un veicolo -->
      <div class="col mb-3">
        <div class="text-center">
          <div class="radius-15">
            <button type="button" class="bg-transparent border-0" @click="openAddVehicleModal">
              <img :src="aggiungiveicolo" width="150" class="rounded-circle shadow p-1 bg-white" alt="Aggiungi Veicolo">
            </button>
            <h5 class="mb-0 mt-3">{{ t('addVehicle') }}</h5>
          </div>
        </div>
      </div>
    </div>

    <!-- Modale per aggiungere un veicolo -->
    <div class="modal fade" id="addVehicleModal" tabindex="-1" aria-labelledby="addVehicleModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <form @submit.prevent="saveVehicle">
            <div class="modal-header">
              <h5 class="modal-title" id="addVehicleModalLabel">{{ t('addVehicle') }}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label for="modello" class="form-label">{{ t('model') }}</label>
                <input type="text" id="modello" v-model="newVeicolo.modello" class="form-control"  required/>
              </div>
              <div class="mb-3">
                <label for="capienza" class="form-label">{{ t('capacity') }}</label>
                <input type="number" id="capienza" v-model="newVeicolo.capienza" class="form-control" required/>
              </div>
              <div class="mb-3">
                <label for="targa" class="form-label">{{ t('licensePlate') }}</label>
                <input type="text" id="targa" v-model="newVeicolo.targa" class="form-control"  required/>
              </div>
              <div class="mb-3">
                <label for="scadenzaBollo" class="form-label">{{ t('taxDeadline') }}</label>
                <VueDatePicker
                    id="scadenzaBollo"
                    :enable-time-picker="false"
                    auto-apply
                    text-input
                    format="dd/MM/yyyy"
                    v-model="newVeicolo.scadenzaBollo"
                    locale="it"
                ></VueDatePicker>
              </div>
              <div class="mb-3">
                <label for="scadenzaAssicurazione" class="form-label">{{ t('insuranceDeadline') }}</label>
                <VueDatePicker
                    id="scadenzaAssicurazione"
                    :enable-time-picker="false"
                    auto-apply
                    text-input
                    format="dd/MM/yyyy"
                    v-model="newVeicolo.scadenzaAssicurazione"
                    locale="it"
                ></VueDatePicker>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">{{ t('close') }}</button>
              <button type="submit" class="btn btn-primary">{{ t('save') }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal per dettagli veicolo -->
    <div class="modal fade" id="myModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5" id="exampleModalLabel">{{ t('details') }}</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p><strong>{{ t('model') }}:</strong> {{ selectedAutista?.modello }}</p>
            <p><strong>{{ t('capacity') }}:</strong> {{ selectedAutista?.capienza }}</p>
            <p><strong>{{ t('licensePlate') }}:</strong> {{ selectedAutista?.targa }}</p>
            <p><strong>{{ t('taxDeadline') }}:</strong> {{ formatDate(selectedAutista?.scadenzaBollo) }}</p>
            <p><strong>{{ t('insuranceDeadline') }}:</strong> {{ formatDate(selectedAutista?.scadenzaAssicurazione) }}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-danger" @click="eliminaVeicolo(selectedAutista?.id)">{{ t('delete') }}</button>
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">{{ t('close') }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
