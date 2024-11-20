<script setup>
import { ref, onMounted, reactive, computed } from "vue";
import axios from "axios";
import { Modal } from "bootstrap";
import moment from "moment";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

const route = useRoute();
const router = useRouter();
const id = route.params.id;
const { t } = useI18n(); // Traduzioni
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const successMessage = ref("");

// Variabili per le modali
let modificaAutistaModal = null;
let deleteAutistiModal = null;

// Dati della tratta
const tratta = ref({
  id: "",
  descrizione: "",
  longdescription: "",
  indirizzopartenza: "",
  indirizzoarrivo: "",
  tutor: "",
  ora: "",
  cadenza: {
    MON: false,
    TUE: false,
    WED: false,
    THU: false,
    FRI: false,
    SAT: false,
    SUN: false,
  },
});

const error = ref(null);

// Funzione per inizializzare i dati della modale
const caricaDatiTratta = async () => {
  try {
    console.log("carica");
    const request = { id };
    const response = await axios.post(`${API_BASE_URL}/tratte/tratta`, request);
    const trattaTrovata = response.data;

    if (trattaTrovata) {
      tratta.value = {
        ...trattaTrovata,
        // Converti la cadenza da stringa CSV in oggetto
        cadenza: trattaTrovata.cadenza.split(",").reduce(
          (acc, giorno) => {
            acc[giorno] = true;
            return acc;
          },
          {
            MON: false,
            TUE: false,
            WED: false,
            THU: false,
            FRI: false,
            SAT: false,
            SUN: false,
          }
        ),
        // ora: trattaTrovata.ora || "", // Assicura che l'ora sia inizializzata
        //  ora: formatDateToTime(trattaTrovata.ora),
      };
    } else {
      console.error("Tratta non trovata");
    }
  } catch (err) {
    error.value = err.response ? err.response.data.message : err.message;
    console.error("Errore durante la chiamata API:", err);
  }
};

const formatDateToTime = (date) => {
  if (date instanceof Date) {
    if (!date) return ""; // Se la data è null, ritorna una stringa vuota
    return date.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
  }
};

// Funzione per salvare le modifiche
const salvaModifiche = async () => {
  try {
    console.log("salva");
    // Clona e prepara i dati da inviare
    const request = { ...tratta.value };

    // Converti la cadenza in stringa CSV
    request.cadenza = Object.keys(request.cadenza)
      .filter((giorno) => request.cadenza[giorno])
      .join(",");

    // Verifica e formatta l'ora
    if (request.ora.hours) {
      console.log(request.ora.hours);
      request.ora = `${request.ora.hours}:${request.ora.minutes}`;
    }

    // Effettua la chiamata POST per salvare i dati
    await axios.post(`${API_BASE_URL}/tratte/modifica`, request);
    modificaAutistaModal.hide();
    successMessage.value = t("modificaSuccess"); // "Modifica salvata con successo"
    setTimeout(() => {
      successMessage.value = "";
      modificaAutistaModal.hide();
    }, 2000);
  } catch (err) {
    console.error("Errore durante il salvataggio delle modifiche:", err);
  }
};

// Inizializza le modali al montaggio del componente
onMounted(() => {
  modificaAutistaModal = new Modal(document.getElementById("modificaAutistaModal"));
  deleteAutistiModal = new Modal(document.getElementById("modaleDelete"));

  // Carica i dati della tratta
  caricaDatiTratta();
});

const frequenzaFormattata = computed(() => {
  if (tratta.value.cadenza) {
    return Object.keys(tratta.value.cadenza)
      .filter((giorno) => tratta.value.cadenza[giorno])
      .map((giorno) => t(giorno)) // Usa il metodo `t()` per tradurre i giorni
      .join(", ");
  }
  return "";
});

const resetTratta = () => {
  caricaDatiTratta(); // Ricarica i dati originali dalla API
  modificaAutistaModal.hide();
};
const giorniAttivi = computed(() => {
  return tratta.value.cadenza
    ? Object.keys(tratta.value.cadenza).filter((day) => tratta.value.cadenza[day])
    : [];
});

const cancellaAutista = async () => {
  try {
    await axios.delete(`${API_BASE_URL}/tratte/${id}`);
    deleteAutistiModal.hide();
    await router.replace({ path: "/tratte" });
  } catch (err) {
    console.error("Errore durante la cancellazione dell'autista:", err);
    error.value = err.response ? err.response.data.message : err.message;
  } finally {
  }
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
                    <i class="fas fa-route fa-2x text-gray-200"></i>
                  </div>
                </div>
                <div class="col">
                  <div>
                    <h4
                      class="text-center font-weight-bold text-warning text-uppercase mb-1"
                    >
                      {{ tratta.descrizione }}
                    </h4>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-sm-2 text-right">
              <button class="btn btn-danger" @click="deleteAutistiModal.show()">
                <i class="fas fa-fw fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-10">
        <div class="card">
          <div class="card-body">
            <button
              class="btn btn-primary float-end"
              @click="modificaAutistaModal.show()"
            >
              <i class="fas fa-edit"></i>
            </button>
            <h4 class="header-title mt-0 mb-3">{{ $t("tratta") }}</h4>
            <hr />
            <div class="text-start">
              <p class="text-muted">
                <strong>{{ $t("departureAddress") }} :</strong>
                <span class="ms-2">{{ tratta.indirizzopartenza }}</span>
              </p>
              <p class="text-muted">
                <strong>{{ $t("arrivalAddress") }}:</strong>
                <span class="ms-2">{{ tratta.indirizzoarrivo }}</span>
              </p>
              <p class="text-muted">
                <strong>{{ $t("tutor") }} :</strong>
                <span class="ms-2">{{ tratta.tutor }}</span>
              </p>
              <p class="text-muted">
                <strong>{{ $t("frequency") }} :</strong>
                <span class="ms-2">{{ frequenzaFormattata }}</span>
              </p>
              <p class="text-muted">
                <strong>{{ $t("ora") }} :</strong>{{ tratta.ora }}
              </p>
              <p class="text-muted">
  <strong>{{ $t("description") }}:</strong>
  <span class="ms-2" style="white-space: pre-line;">{{ tratta.longdescription }}</span>
</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="container-fluid">
    <div class="container-fluid">
      <div
        v-if="error"
        class="alert alert-danger text-center"
        role="alert"
        style="margin-top: 20px"
      >
        Errore durante il caricamento: {{ error }}
      </div>
    </div>

    <!-- Modale di Modifica -->
    <div
      class="modal fade"
      id="modificaAutistaModal"
      tabindex="-1"
      aria-labelledby="modificaAutistaLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="modificaAutistaModalLabel">Modifica</h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="salvaModifiche">
              <div class="row">
                <div class="col-12">
                  <label for="descrizione" class="form-label">{{
                    t("description")
                  }}</label>
                  <input
                    type="text"
                    class="form-control"
                    id="descrizione"
                    v-model="tratta.descrizione"
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
                    v-model="tratta.indirizzopartenza"
                    :placeholder="t('departurePlaceholder')"
                  />
                </div>
              </div>
              <div class="row mt-4">
                <div class="col-12">
                  <label for="arrivo" class="form-label">{{ t("arrivalAddress") }}</label>
                  <input
                    type="text"
                    class="form-control"
                    id="arrivo"
                    v-model="tratta.indirizzoarrivo"
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
                    v-model="tratta.tutor"
                  />
                </div>
              </div>
              <div class="row mt-4">
                <div class="col-12">
                  <label class="form-label">{{ t("frequency") }}</label
                  ><br />
                  <div class="form-check form-check-inline">
                    <template
                      v-for="day in ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']"
                      :key="day"
                    >
                      <input
                        class="form-check-input"
                        type="checkbox"
                        :id="'inlineCheck' + day"
                        v-model="tratta.cadenza[day]"
                      />
                      <label class="form-check-label mr-2" :for="'inlineCheck' + day">
                        {{ t(day) }}
                      </label>
                    </template>
                  </div>
                </div>
              </div>

              <div class="row mt-4">
                <div class="col-12">
                  <label for="ora" class="form-label">{{ t("ora") }}</label>
                  <input
                    id="ora"
                    type="time"
                    class="form-control"
                    v-model="tratta.ora"
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
                    v-model="tratta.longdescription"
                    rows="3"
                  ></textarea>
                </div>
              </div>


              <div v-if="successMessage" class="alert alert-success">
                {{ successMessage }}
              </div>
              <div style="height: 20px"></div>

              <div class="d-flex justify-content-end gap-2">
                <button type="submit" class="btn btn-success btn-sm">
                  {{ $t("save") }}
                </button>
              </div>
            </form>
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
    aria-labelledby="modaleDeleteLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="modaleDeleteLabel">Cancellare?</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">Sei sicuro di voler cancellare?</div>
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
