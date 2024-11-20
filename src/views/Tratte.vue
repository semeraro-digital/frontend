<script setup>
import axios from "axios";
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { Modal } from "bootstrap";

const { t } = useI18n(); // Inizializza l'uso delle traduzioni
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

let tratte = ref([]);
const newTratta = ref({
  descrizione: "",
  longdescription: "",
  indirizzopartenza: "",
  indirizzoarrivo: "",
  ora: "",
  tutor: "",
  cadenza: [],
});

const error = ref(null);
const errorModal = ref(null);

// Metodo per aggiungere una nuova tratta
const addTratta = async () => {
  try {
    errorModal.value = null;
    const request = JSON.parse(JSON.stringify(newTratta.value));
    request.cadenza = request.cadenza.filter((cad) => !!cad).join(",");

    const response = await axios.post(`${API_BASE_URL}/tratte`, request);
    console.log("Tratta aggiunta:", response.data);

    const modalElement = document.getElementById("creaTrattaModal");
    const modal = Modal.getInstance(modalElement);
    if (modal) {
      modal.hide();
    }
    console.log(response);
    console.log(response.id);
request.id=response.data.id;
    tratte.value.push(JSON.parse(JSON.stringify(request)));
    resetForm();;
  } catch (err) {
    errorModal.value = t("errorInsertionFailed"); // Messaggio di errore tradotto
    const modalElement = document.getElementById("creaTrattaModal");
    const modal = Modal.getOrCreateInstance(modalElement);
    modal.show();

    console.error("Errore durante l'inserimento dell'assegnazione:", err);
    error.value = err.response ? err.response.data.message : err.message;
  }
};

// Metodo per eliminare una tratta
const deleteTratta = async (id) => {
  try {
    await axios.delete(`${API_BASE_URL}/tratte/${id}`);
    tratte.value = tratte.value.filter((tratta) => tratta.id !== id); // Rimuovi la tratta dall'elenco locale
    console.log("Tratta eliminata con successo:", id);
  } catch (err) {
    console.error("Errore durante l'eliminazione della tratta:", err);
    error.value = err.response ? err.response.data.message : err.message;
  }
};

// Reset del form
const resetForm = () => {
  errorModal.value = null;
  newTratta.value = {
    descrizione: "",
    indirizzopartenza: "",
    indirizzoarrivo: "",
    cadenza: [],
  };
};

onMounted(() => {
  tratte.value.splice(0);
  axios
    .get(`${API_BASE_URL}/tratte`)
    .then((response) => {
      tratte.value.push(...response.data);
      console.log(tratte);
    })
    .catch((err) => {
      error.value = err.response ? err.response.data.message : err.message;
      console.error("Errore durante la chiamata API:", err);
    });
});
</script>

<template>
  <div class="container-fluid">
    <div class="row">
      <div v-for="(tratta, index) in tratte" :key="tratta.id" class="col-md-4">
        <RouterLink :to="`/tratta/${tratta.id}`">
          <div
            :class="['card', 'radius-15', 'bg-secondary-light', 'tratte', 'card-hover']"
          >
            <div class="card-body">
              <div class="row no-gutters align-items-center">
                <div class="col-auto">
                  <i class="fas fa-route fa-2x text-gray-300"></i>
                </div>
                <div class="col ml-2">
                  <div
                    class="text-center font-weight-bold text-warning text-uppercase mb-1"
                  >
                    {{ tratta.descrizione }}
                  </div>
                  <div class="text-center text-xs h5 mb-0 font-weight-bold text-gray-800">
                    {{ tratta.indirizzopartenza }} - {{ tratta.indirizzoarrivo }}
                  </div>
                  <div class="text-center text-xs h5 mb-0 font-weight-bold text-gray-800">
                    <span v-text="tratta.cadenza || '-'"></span>
                  </div>
                  <div class="text-center text-xs h5 mb-0 font-weight-bold text-gray-800">
                    <span v-text="tratta.ora || '-'"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </RouterLink>
      </div>
    </div>

    <div class="row">
      <div class="col-12 text-right">
        <button
          type="button"
          class="btn btn-secondary"
          data-bs-toggle="modal"
          data-bs-target="#creaTrattaModal"
        >
          {{ t("createRoute") }}
        </button>
      </div>
    </div>
    <!-- modale aggiungi -->
    <div class="row">
      <div
        class="modal fade"
        id="creaTrattaModal"
        tabindex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog">
          <div class="modal-content">
            <form @submit.prevent="addTratta">
              <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">
                  <i class="fas fa-route mr-3 text-gray-300"></i
                  >{{ t("createRouteTitle") }}
                </h5>
                <button
                  type="button"
                  class="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>

              <div
                v-if="errorModal"
                class="alert alert-danger text-center"
                role="alert"
                style="margin-top: 10px"
              >
                {{ errorModal }}
              </div>

              <div class="modal-body">
                <div class="row">
                  <div class="col-12">
                    <label for="descrizione" class="form-label">{{
                      t("description")
                    }}</label>
                    <input
                      type="text"
                      class="form-control"
                      id="descrizione"
                      v-model="newTratta.descrizione"
                      :placeholder="t('routePlaceholder')"
                    />
                  </div>
                </div>
                <div class="row mt-4">
                  <div class="col-12">
                    <label for="partenza" class="form-label">{{
                      t("departureAddress")
                    }}</label>
                    <input
                      type="text"
                      class="form-control"
                      id="partenza"
                      v-model="newTratta.indirizzopartenza"
                      :placeholder="t('departurePlaceholder')"
                    />
                  </div>
                </div>
                <div class="row mt-4">
                  <div class="col-12">
                    <label for="arrivo" class="form-label">{{
                      t("arrivalAddress")
                    }}</label>
                    <input
                      type="text"
                      class="form-control"
                      id="arrivo"
                      v-model="newTratta.indirizzoarrivo"
                      :placeholder="t('arrivalPlaceholder')"
                    />
                  </div>
                </div>
                <div class="row mt-4">
                  <div class="col-12">
                    <label for="arrivo" class="form-label">{{ t("tutor") }}</label>
                    <input
                      type="text"
                      class="form-control"
                      id="tutor"
                      v-model="newTratta.tutor"
                    />
                  </div>
                </div>
                <div class="row mt-4">
                  <div class="col-12">
                    <label class="form-label">{{ t("frequency") }}</label
                    ><br />
                    <div class="form-check form-check-inline">
                      <template
                        v-for="(day, index) in [
                          'MON',
                          'TUE',
                          'WED',
                          'THU',
                          'FRI',
                          'SAT',
                          'SUN',
                        ]"
                      >
                        <input
                          class="form-check-input"
                          type="checkbox"
                          :id="'inlineCheck' + index"
                          :true-value="day"
                          :value="day"
                          v-model="newTratta.cadenza[index]"
                        />
                        <label
                          class="form-check-label mr-2"
                          :for="'inlineCheck' + index"
                          >{{ t(day) }}</label
                        >
                      </template>
                    </div>
                  </div>
                </div>

                <div class="row mt-4">
                  <div class="col-12">
                    <label for="arrivo" class="form-label">{{ t("ora") }}</label>
                    <input
                    id="ora"
                    type="time"
                    class="form-control"
                    v-model="newTratta.ora"
                    @input="handleTimeInput"
                  />
                  </div>
                </div>

                        <div class="row mt-4">
                <div class="col-12">
                  <label for="longdescription" class="form-label">{{
                    t("longdescription")
                  }}</label>
                  <textarea
                    class="form-control"
                    id="longdescription"
                    v-model="newTratta.longdescription"
                    rows="3"
                  ></textarea>
                </div>
              </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                  {{ t("close") }}
                </button>
                <button type="submit" class="btn btn-primary">{{ t("create") }}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-hover {
  transition: border 0.3s, box-shadow 0.3s; /* Per un'animazione fluida */
}

.card-hover:hover {
  border: 2px solid #ffc107; /* Colore del bordo al passaggio del mouse */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Aggiunge un'ombra leggera */
}
</style>
