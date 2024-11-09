<script>
import axios from "axios";
import { Modal, Toast } from "bootstrap";
import _ from "lodash";
import moment from "moment";
import { ref } from "vue";


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// Variabile per controllare se il bottone è disabilitato
const isButtonDisabled = ref(false);

export default {
  data() {
    return {
      autisti: [],
      AutistiScadenza: [],
      veicoli: [],
      veicoliScadenza: [],
      assegnazioni: [], // Now reactive and part of the component state
      error: null,
      filteredAssegnazioni: [], // to store filtered results
      turniData: {
        dataInizio: moment().format("YYYY-MM-DDT00:00:00"),
        dataFine: moment().format("YYYY-MM-DDT23:59:59"),
      },
      turniDomani: {
        dataInizio: moment().add(1, "days").startOf("day").format("YYYY-MM-DDTHH:mm:ss"),
        dataFine: moment().add(1, "days").endOf("day").format("YYYY-MM-DDTHH:mm:ss"),
      },
      selectedDate: "today", // To help with filtering
    };
  },
  mounted() {
    this.fetchAutisti();
    this.fetchAutistiScadenza();
    this.fetchVeicoli();
    this.fetchVeicoliScadenza();
    this.fetchAssegnazioni().then(() => {
      // Call filterAssegnazioni after assegnazioni data is fetched
      this.filterAssegnazioni();
    });
  },
  methods: {
    formatData(data) {
      return moment(data).format('DD/yyyy HH:mm');
    },
    fetchAutisti() {
      axios
        .get(`${API_BASE_URL}/autisti`)
        .then((response) => {
          const filterDate = moment();
          this.autisti = _.filter(response.data, (o) => {
            const dataScadenzaAggiornata = moment(o.scadenzapatente).add(60, "days");
            return dataScadenzaAggiornata.isAfter(filterDate);
          });
        })
        .catch((error) => {
          this.error = error.response ? error.response.data.message : error.message;
          console.error("Errore durante la chiamata API:", error);
        });
    },
    fetchAutistiScadenza() {
      axios
        .post(`${API_BASE_URL}/autisti/scadenzaPatente`)
        .then((response) => {
          this.AutistiScadenza = response.data;
        })

        .catch((error) => {
          this.error = error.response ? error.response.data.message : error.message;
          console.error("Errore durante la chiamata API:", error);
        });
    },

    turniAutistaOggi() {
      if (isButtonDisabled.value) return; // Non fare nulla se è disabilitato

      isButtonDisabled.value = true; // Disabilita il bottone
      const toastTrigger = document.getElementById("liveToastBtn");
      const toastLiveExample = document.getElementById("liveToast");
      const toastLiveError = document.getElementById("ToastError");

      // Disabilita il pulsante
      if (toastTrigger) {
        toastTrigger.disabled = true;
      }

      axios
        .post(`${API_BASE_URL}/generate-pdfSendEmail`, this.turniData)
        .then((response) => {
          const toastBootstrap = Toast.getOrCreateInstance(toastLiveExample);
          toastBootstrap.show();

          // Riabilita il pulsante dopo che il toast è stato mostrato
          toastBootstrap._element.addEventListener("hidden.bs.toast", () => {
            if (toastTrigger) {
              toastTrigger.disabled = false;
            }
          });

        })
        .catch((error) => {
          if (toastLiveError) {
            const toastBootstrap = Toast.getOrCreateInstance(toastLiveError);
            toastBootstrap.show();
          }
          this.error = error.response ? error.response.data.message : error.message;
          console.error("Errore durante la chiamata API:", error);

          // Riabilita il pulsante anche in caso di errore
          if (toastTrigger) {
            toastTrigger.disabled = false;
          }
        })
        .finally(() => {
          isButtonDisabled.value = false; // Riabilita il bottone dopo l'operazione
        });
    },
    turniAutistaDomani() {
      if (isButtonDisabled.value) return; // Non fare nulla se è disabilitato
      const toastTrigger = document.getElementById("liveToastBtnDmn");
      const toastLiveExample = document.getElementById("liveToast");
      const toastLiveError = document.getElementById("ToastError");
      isButtonDisabled.value = true; // Disabilita il bottone
      // Disabilita il pulsante
      if (toastTrigger) {
        toastTrigger.disabled = true;
      }

      axios
        .post(`${API_BASE_URL}/generate-pdfSendEmail`, this.turniDomani)
        .then((response) => {
          const toastBootstrap = Toast.getOrCreateInstance(toastLiveExample);
          toastBootstrap.show();

          // Riabilita il pulsante dopo che il toast è stato mostrato
          toastBootstrap._element.addEventListener("hidden.bs.toast", () => {
            if (toastTrigger) {
              toastTrigger.disabled = false;
            }
          });

        })
        .catch((error) => {
          if (toastLiveError) {
            const toastBootstrap = Toast.getOrCreateInstance(toastLiveError);
            toastBootstrap.show();
          }
          this.error = error.response ? error.response.data.message : error.message;
          console.error("Errore durante la chiamata API:", error);

          // Riabilita il pulsante anche in caso di errore
          if (toastTrigger) {
            toastTrigger.disabled = false;
          }
        })
        .finally(() => {
          isButtonDisabled.value = false; // Riabilita il bottone dopo l'operazione
        });
    },

    //whatsapp
    turniAutistaOggiWA() {
      if (isButtonDisabled.value) return; // Non fare nulla se è disabilitato

      isButtonDisabled.value = true; // Disabilita il bottone
      const toastTrigger = document.getElementById("liveToastBtn");
      const toastLiveExample = document.getElementById("liveToast");
      const toastLiveError = document.getElementById("ToastError");

      // Disabilita il pulsante
      if (toastTrigger) {
        toastTrigger.disabled = true;
      }

      axios
        .post(`${API_BASE_URL}/generate-pdfSendWA`, this.turniData)
        .then((response) => {
          const toastBootstrap = Toast.getOrCreateInstance(toastLiveExample);
          toastBootstrap.show();

          // Riabilita il pulsante dopo che il toast è stato mostrato
          toastBootstrap._element.addEventListener("hidden.bs.toast", () => {
            if (toastTrigger) {
              toastTrigger.disabled = false;
            }
          });

        })
        .catch((error) => {
          if (toastLiveError) {
            const toastBootstrap = Toast.getOrCreateInstance(toastLiveError);
            toastBootstrap.show();
          }
          this.error = error.response ? error.response.data.message : error.message;
          console.error("Errore durante la chiamata API:", error);

          // Riabilita il pulsante anche in caso di errore
          if (toastTrigger) {
            toastTrigger.disabled = false;
          }
        })
        .finally(() => {
          isButtonDisabled.value = false; // Riabilita il bottone dopo l'operazione
        });
    },
    turniAutistaDomaniWA() {
      if (isButtonDisabled.value) return; // Non fare nulla se è disabilitato
      const toastTrigger = document.getElementById("liveToastBtnDmn");
      const toastLiveExample = document.getElementById("liveToast");
      const toastLiveError = document.getElementById("ToastError");
      isButtonDisabled.value = true; // Disabilita il bottone
      // Disabilita il pulsante
      if (toastTrigger) {
        toastTrigger.disabled = true;
      }

      axios
        .post(`${API_BASE_URL}/generate-pdfSendWA`, this.turniDomani)
        .then((response) => {
          const toastBootstrap = Toast.getOrCreateInstance(toastLiveExample);
          toastBootstrap.show();

          // Riabilita il pulsante dopo che il toast è stato mostrato
          toastBootstrap._element.addEventListener("hidden.bs.toast", () => {
            if (toastTrigger) {
              toastTrigger.disabled = false;
            }
          });

        })
        .catch((error) => {
          if (toastLiveError) {
            const toastBootstrap = Toast.getOrCreateInstance(toastLiveError);
            toastBootstrap.show();
          }
          this.error = error.response ? error.response.data.message : error.message;
          console.error("Errore durante la chiamata API:", error);

          // Riabilita il pulsante anche in caso di errore
          if (toastTrigger) {
            toastTrigger.disabled = false;
          }
        })
        .finally(() => {
          isButtonDisabled.value = false; // Riabilita il bottone dopo l'operazione
        });
    },
    //fine WA

    turniAutistaConData() {
      axios
        .post(`${API_BASE_URL}/autisti`, this.turniData)
        .then((response) => {
          this.autisti = response.data;
          const modalElement = document.getElementById("exampleModal");
          const modal = Modal.getInstance(modalElement);
          if (modal) {
            modal.hide();
          }
        })
        .catch((error) => {
          this.error = error.response ? error.response.data.message : error.message;
          console.error("Errore durante la chiamata API:", error);
        });
    },
    fetchVeicoli() {
      axios
        .get(`${API_BASE_URL}/veicoli`)
        .then((response) => {
          this.veicoli = response.data;
        })
        .catch((error) => {
          this.error = error.response ? error.response.data.message : error.message;
          console.error("Errore durante la chiamata API:", error);
        });
    },
    fetchVeicoliScadenza() {
      axios
        .post(`${API_BASE_URL}/veicoli/assicurazione/scaduta`)
        .then((response) => {
          this.veicoliScadenza = response.data;
        })
        .catch((error) => {
          this.error = error.response ? error.response.data.message : error.message;
          console.error("Errore durante la chiamata API:", error);
        });
    },

    fetchAssegnazioni() {
      return new Promise((resolve, reject) => {
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1); // Imposta la data di domani
        const startDate = new Date(today.setHours(0, 0, 0, 0)); // Imposta la data di inizio oggi
        const endDate = new Date(tomorrow.setHours(23, 59, 59, 999)); // Imposta la data di fine a domani

        const payload = {
          datapartenza: startDate.toISOString(),
          dataarrivo: endDate.toISOString(),
        };

        axios
          .post(`${API_BASE_URL}/assegnazioni/assegnazionirange`, payload)
          .then((response) => {
            this.assegnazioni = response.data;
            resolve(); // Risolvi la promise quando i dati sono stati caricati
          })
          .catch((error) => {
            this.error = error.response ? error.response.data.message : error.message;
            console.error("Errore durante la chiamata API:", error);
            reject(error); // Rifiuta la promise in caso di errore
          });
      });
    },
    filterAssegnazioni() {
      const today = new Date();
      let startDate, endDate;

      if (!this.selectedDate || this.selectedDate === "today") {
        startDate = new Date(today.setHours(0, 0, 0, 0));
        endDate = new Date(today.setHours(23, 59, 59, 999));
      } else if (this.selectedDate === "tomorrow") {
        today.setDate(today.getDate() + 1);
        startDate = new Date(today.setHours(0, 0, 0, 0));
        endDate = new Date(today.setHours(23, 59, 59, 999));
      }

      // Filtering based on selected date
      this.filteredAssegnazioni = this.assegnazioni.filter((assegnazione) => {
        const dataPartenza = new Date(assegnazione.datapartenza);
        return dataPartenza >= startDate && dataPartenza <= endDate;
      });
    },
  },
};
</script>

<template>
  <div class="container-fluid">
    <!--    <div class="row">-->
    <!--      <div class="col-auto">-->
    <!--        &lt;!&ndash;  <button type="button" class="btn btn-secondary mb-4" data-bs-toggle="modal" data-bs-target="#exampleModal">-->
    <!--           Invia turni con data</button> &ndash;&gt;-->
    <!--      </div>-->
    <!--<div class="col-auto">
      <button
        id="liveToastBtn"
        type="button"
        class="btn btn-secondary mb-4"
        @click="turniAutistaOggi"
      >
        {{ $t("inviaTurniOggi") }}
      </button>
    </div>
    <div class="col-auto">
      <button
        id="liveToastBtnDmn"
        type="button"
        class="btn btn-secondary mb-4"
        @click="turniAutistaDomani"
      >
        {{ $t("inviaTurniDomani") }}
      </button>
    </div>-->
    <!--    </div>-->

    <!--    <div class="row">-->
    <!--      <div class="col-4"></div>-->
    <!--    </div>-->

    <div class="row">
      <div class="col-lg-3">
        <div class="card border-left-primary shadow py-2 mb-4">
          <div class="card-body">
            <div class="row no-gutters align-items-center">
              <div class="col mr-2">
                <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">
                  Le corse del ultimo mese
                </div>
                <div class="h5 mb-0 font-weight-bold text-gray-800">146</div>
              </div>
              <div class="col-auto">
                <i class="fas fa-route fa-2x text-gray-300"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-9">
        <div class="card border-left-primary shadow py-2 mb-4">
          <div class="card-body">
            <div class="row no-gutters align-items-center">
              <div class="col mr-2">
                <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">
                  {{ $t("inviaTurni") }}
                </div>
                <div class="h5 mb-0 font-weight-bold text-gray-800"><br /></div>
              </div>
              <div class="col-auto">
                <div class="d-grid gap-2 d-md-block">
                  <button
                    class="btn btn-danger btn-sm me-md-2"
                    @click="turniAutistaOggi"
                    @keydown.enter="turniAutistaOggi"
                  >
                    <i class="fas fa-envelope mr-2"></i>{{ $t("oggi") }} via email
                  </button>
                  <button
                    class="btn btn-danger btn-sm me-md-2"
                    @click="turniAutistaDomani"
                    @keydown.enter="turniAutistaDomani"
                  >
                    <i class="fas fa-envelope mr-2"></i>{{ $t("domani") }} via email
                  </button>
                  <button
                    class="btn btn-success btn-sm me-md-2"
                    @click="turniAutistaOggiWA"
                    @keydown.enter="turniAutistaOggiWA"
                  >
                    <i class="fab fa-whatsapp mr-2"></i>{{ $t("oggi") }} via whatsapp
                  </button>
                  <button
                    class="btn btn-success btn-sm"
                    @click="turniAutistaDomaniWA"
                    @keydown.enter="turniAutistaDomaniWA"
                  >
                    <i class="fab fa-whatsapp mr-2"></i>{{ $t("domani") }} via whatsapp
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <!--      <div class="col-2">-->
      <!--        <div-->
      <!--            class="card border-left-primary shadow py-2 mb-4"-->
      <!--            role="button"-->
      <!--            tabindex="0"-->
      <!--            @click="turniAutistaOggi"-->
      <!--            @keydown.enter="turniAutistaOggi"-->
      <!--            style="cursor: pointer"-->
      <!--            :class="{ 'disabled-card': isButtonDisabled }"-->
      <!--        >-->
      <!--          <div class="card-body">-->
      <!--            <div class="row no-gutters align-items-center">-->
      <!--              <div class="col mr-2">-->
      <!--                <div class="text-m font-weight-bold text-primary text-uppercase mb-1">-->
      <!--                  {{ $t("inviaTurni") }}-->
      <!--                </div>-->
      <!--                <div class="text-s text-muted">{{ $t("oggi") }}</div>-->
      <!--              </div>-->
      <!--              <div class="col-auto">-->
      <!--                <i class="fas fa-envelope fa-3x text-gray-300"></i>-->
      <!--              </div>-->
      <!--            </div>-->
      <!--          </div>-->
      <!--        </div>-->

      <!--        <div-->
      <!--            class="card border-left-primary shadow py-2 mb-4"-->
      <!--            role="button"-->
      <!--            tabindex="0"-->
      <!--            @click="turniAutistaDomani"-->
      <!--            @keydown.enter="turniAutistaDomani"-->
      <!--            style="cursor: pointer"-->
      <!--            :class="{ 'disabled-card': isButtonDisabled }"-->
      <!--        >-->
      <!--          <div class="card-body">-->
      <!--            <div class="row no-gutters align-items-center">-->
      <!--              <div class="col mr-2">-->
      <!--                <div class="text-m font-weight-bold text-primary text-uppercase mb-1">-->
      <!--                  {{ $t("inviaTurni") }}-->
      <!--                </div>-->
      <!--                <div class="text-s text-muted">{{ $t("domani") }}</div>-->
      <!--              </div>-->
      <!--              <div class="col-auto">-->
      <!--                <i class="fas fa-envelope fa-3x text-gray-300"></i>-->
      <!--              </div>-->
      <!--            </div>-->
      <!--          </div>-->
      <!--        </div>-->
      <!--      </div>-->
      <!--      <div class="col-2">-->
      <!--        <div-->
      <!--            class="card border-left-primary shadow py-2 mb-4"-->
      <!--            role="button"-->
      <!--            tabindex="0"-->
      <!--            @click="turniAutistaOggiWA"-->
      <!--            @keydown.enter="turniAutistaOggiWA"-->
      <!--            style="cursor: pointer"-->
      <!--            :class="{ 'disabled-card': isButtonDisabled }"-->
      <!--        >-->
      <!--          <div class="card-body">-->
      <!--            <div class="row no-gutters align-items-center">-->
      <!--              <div class="col mr-2">-->
      <!--                <div class="text-m font-weight-bold text-primary text-uppercase mb-1">-->
      <!--                  {{ $t("inviaTurni") }}-->
      <!--                </div>-->
      <!--                <div class="text-s text-muted">{{ $t("oggi") }}</div>-->
      <!--              </div>-->
      <!--              <div class="col-auto">-->
      <!--                <i class="fab fa-whatsapp fa-3x text-gray-300"></i>-->
      <!--              </div>-->
      <!--            </div>-->
      <!--          </div>-->
      <!--        </div>-->

      <!--        <div-->
      <!--            class="card border-left-primary shadow py-2 mb-4"-->
      <!--            role="button"-->
      <!--            tabindex="0"-->
      <!--            @click="turniAutistaDomaniWA"-->
      <!--            @keydown.enter="turniAutistaDomaniWA"-->
      <!--            style="cursor: pointer"-->
      <!--            :class="{ 'disabled-card': isButtonDisabled }"-->
      <!--        >-->
      <!--          <div class="card-body">-->
      <!--            <div class="row no-gutters align-items-center">-->
      <!--              <div class="col mr-2">-->
      <!--                <div class="text-m font-weight-bold text-primary text-uppercase mb-1">-->
      <!--                  {{ $t("inviaTurni") }}-->
      <!--                </div>-->
      <!--                <div class="text-s text-muted">{{ $t("domani") }}</div>-->
      <!--              </div>-->
      <!--              <div class="col-auto">-->
      <!--                <i class="fab fa-whatsapp fa-3x text-gray-300"></i>-->
      <!--              </div>-->
      <!--            </div>-->
      <!--          </div>-->
      <!--        </div>-->

      <!--        <div class="card border-left-primary shadow py-2 mb-4">-->
      <!--          <div class="card-body">-->
      <!--            <div class="row no-gutters align-items-center">-->
      <!--              <div class="col mr-2">-->
      <!--                <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">-->
      <!--                  Le corse del ultimo mese-->
      <!--                </div>-->
      <!--                <div class="h5 mb-0 font-weight-bold text-gray-800">146</div>-->
      <!--              </div>-->
      <!--              <div class="col-auto">-->
      <!--                <i class="fas fa-route fa-2x text-gray-300"></i>-->
      <!--              </div>-->
      <!--            </div>-->
      <!--          </div>-->
      <!--        </div>-->
      <!--      </div>-->

      <div class="col-12">
      <!--turni oggi-->
      <div class="dashboard-section">
          <h2 class="section-header">{{ $t("turnioggi") }}</h2>

          <label for="dataFilter">{{ $t("FiltraData") }}</label>
          <select v-model="selectedDate" id="dataFilter" @change="filterAssegnazioni">
            <option value="today">{{ $t("oggi") }}</option>
            <option value="tomorrow">{{ $t("domani") }}</option>
          </select>

          <div v-if="error" class="alert alert-danger">{{ error }}</div>
          <div class="table-responsive">
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>{{ $t("vehicle") }}</th>
                  <th>{{ $t("departureDate") }}</th>
                  <th>{{ $t("autista") }}</th>
                  <th>{{ $t("tratta") }}</th>
                  <th>{{ $t("tutor") }}</th>
                  <th>{{ $t("email") }}</th>
                  <th>{{ $t("sendEmail") }}</th>
                 
                </tr>
              </thead>
              <tbody>
                <tr v-for="assegnazione in filteredAssegnazioni" :key="assegnazione.id">
                  <td>{{ assegnazione.modelloveicolo }}</td>
                 <td>{{ formatData(assegnazione.datapartenza) }}</td>
                  <td>{{ assegnazione.nomeautista }} {{ assegnazione.cognomeautista }}</td>
                  <td>{{ assegnazione.descrizionetratta }}</td>
                  <td>{{ assegnazione.tutor }}</td>
                  <td>{{ assegnazione.email }}</td>
                  <td>{{ assegnazione.sendEmail }}</td>
                
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      <!--scadenza assicurazione  -->
        <div class="dashboard-section">
          <h2 class="section-header">{{ $t("VeicoliScadenza") }}</h2>
          <div v-if="error" class="alert alert-danger">{{ error }}</div>
          <table class="table">
            <thead>
              <tr class="table-primary">
                <th scope="col">{{ $t("modello") }}</th>
                <th scope="col">{{ $t("targa") }}</th>
                <th scope="col">{{ $t("scadenzaAssicurazione") }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="veicoloScad in veicoliScadenza"
                :key="veicoloScad.id"
                v-bind:class="{
                  'table-danger':
                    new Date(veicoloScad.scadenzaassicurazione) < new Date(),
                  'table-warning':
                    new Date(veicoloScad.scadenzaassicurazione) >= new Date(),
                }"
              >
                <td>{{ veicoloScad.modello }}</td>
                <td>{{ veicoloScad.targa }}</td>
                <td>
                  {{
                    new Date(veicoloScad.scadenzaassicurazione).toLocaleDateString(
                      "it-IT"
                    )
                  }}
                </td>
              </tr>
              <tr v-if="!veicoliScadenza || veicoliScadenza.length === 0">
                <td colspan="3" class="text-center">
                  {{ $t("NessunVeicoliScadenza") }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- scadenza patenti -->
        <div class="dashboard-section">
          <h2 class="section-header">{{ $t("AutistiScadenza") }}</h2>
          <div v-if="error" class="alert alert-danger">{{ error }}</div>
          <div class="table-responsive">
            <table class="table table-striped table-smaller">
              <thead>
                <tr class="table-primary">
                  <th>{{ $t("nomeCognome") }}</th>

                  <th>{{ $t("driverLicense") }}</th>
                  <th>{{ $t("driverLicenseExpiry") }}</th>
                  <th>{{ $t("driverEmail") }}</th>
                  <th>{{ $t("driverPhone") }}</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-if="AutistiScadenza && AutistiScadenza.length > 0"
                  v-for="autista in AutistiScadenza"
                  :key="autista.id"
                  v-bind:class="{
                    'table-danger': new Date(autista.scadenzapatente) < new Date(),
                    'table-warning': new Date(autista.scadenzapatente) >= new Date(),
                  }"
                >
                  <td>{{ autista.nome }} {{ autista.cognome }}</td>
                  <td>{{ autista.numpatente }}</td>
                  <td>
                    {{ new Date(autista.scadenzapatente).toLocaleDateString("it-IT") }}
                  </td>
                  <td>{{ autista.email }}</td>
                  <td>{{ autista.telefono }}</td>
                </tr>
                <tr v-else>
                  <td colspan="5" class="text-center">
                    {{ $t("NessunScadenzaPatente") }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div
    class="modal fade"
    id="exampleModal"
    tabindex="-1"
    aria-labelledby="exampleModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <form @submit.prevent="turniAutistaConData">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">Modal title</h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label for="modello" class="form-label">Data inizio turno</label>
              <input
                type="date"
                id="modello"
                v-model="turniData.dataInizio"
                class="form-control"
                placeholder="Inserisci data inizio turno"
                required
              />
            </div>
            <div class="mb-3">
              <label for="capienza" class="form-label">Data fine turno</label>
              <input
                type="date"
                id="capienza"
                v-model="turniData.dataFine"
                class="form-control"
                placeholder="Inserisci data fine turno"
                required
              />
            </div>
          </div>
          <div class="modal-footer">
            <button type="submit" class="btn btn-primary">Invia turno</button>
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <div
    class="toast-container position-fixed top-50 start-50 translate-middle p-3"
    style="z-index: 1050"
  >
    <div
      id="liveToast"
      class="toast bg-success text-white"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      style="width: 400px"
    >
      <div class="toast-header">
        <strong class="me-auto">SUCCESSO</strong>
        <small>ORA</small>
        <button
          type="button"
          class="btn-close btn-close-white"
          data-bs-dismiss="toast"
          aria-label="Close"
        ></button>
      </div>
      <div class="toast-body" style="font-size: 1.25rem">TURNI INVIATI CON SUCCESSO</div>
    </div>
  </div>

  <div
    class="toast-container position-fixed top-50 start-50 translate-middle p-3"
    style="z-index: 1050"
  >
    <div
      id="ToastError"
      class="toast"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      style="width: 400px"
    >
      <!-- Aumenta la larghezza -->
      <div class="toast-header">
        <strong class="me-auto text-danger">ERRORE</strong>
        <small>NOW</small>
        <button
          type="button"
          class="btn-close"
          data-bs-dismiss="toast"
          aria-label="Close"
        ></button>
      </div>
      <div class="toast-body" style="font-size: 1.25rem">
        <!-- Aumenta la dimensione del testo -->
        ERRORE INVIO TURNI
      </div>
    </div>
  </div>
</template>

<style scoped>
.center-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  flex-direction: column;
  text-align: center;
}

.welcome-text {
  margin-bottom: 20px;
  font-size: 2rem;
}

.dashboard-section {
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 10px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 20px;
}

.section-header {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 15px;
}

.disabled-card {
  background-color: #007bff; /* Colore blu Bootstrap */
  opacity: 0.8; /* Rendi la card più trasparente */
  pointer-events: none; /* Disabilita gli eventi del mouse */
}

.table-blue {
  background-color: #007bff; /* Colore blu Bootstrap */
  color: white; /* Colore del testo */
  padding-top: 12px; /* Padding superiore */
  padding-bottom: 12px; /* Padding inferiore */
  text-align: left; /* Allineamento del testo */
}
</style>
