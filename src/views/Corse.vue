<!--#### pagina service  -->
<script setup>
import moment from "moment";
import "moment/locale/it";
import axios from "axios";
import { onMounted, onBeforeUnmount, ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import _ from "lodash";
import * as XLSX from "xlsx";

const isSaving = ref(false);

const { t } = useI18n();
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const corse = ref([]);
const error = ref(null);

const isAddingRow = ref(false);
const isLoading = ref(false);
const datafiltro = ref(moment());

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

// Modale
const isModalOpen = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

// Veicoli
const veicoli = ref([]);
const searchVeicoli = ref({});

// Tratte
const tratte = ref([]);
const tratteFiltrate = ref({});
const searchTratte = ref({});

// Autisti
const autisti = ref([]);
const searchAutisti = ref({});

// --- Upload Excel: refs + stato ---
const excelInput = ref(null);
const isDragging = ref(false);
const lastExcelName = ref("");

// Apri il file picker
function openExcelPicker() {
  excelInput.value?.click();
}

// Gestione drag & drop
const onDragOver = (e) => {
  e.preventDefault();
  isDragging.value = true;
};
const onDragLeave = (e) => {
  e.preventDefault();
  isDragging.value = false;
};
const onDrop = async (e) => {
  e.preventDefault();
  isDragging.value = false;
  const files = e.dataTransfer?.files;
  await handleExcelFiles(files);
};

// Funzione robusta per leggere N blocchi

async function handleExcelFiles(fileList) {
  const file = fileList?.[0];
  if (!file) return;

  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
const jsonDataRaw = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

// 🔧 Normalizza chiavi: tutte minuscole, senza spazi, per compatibilità col parsing
const jsonData = jsonDataRaw.map((row) => {
  const newRow = {};
  Object.entries(row).forEach(([key, value]) => {
    const newKey = key
      .toString()
      .trim()
      .replace(/\s+/g, "") // rimuove spazi
      .toLowerCase();      // converte in minuscolo
    newRow[newKey] = value;
  });
  return newRow;
});


    newCorse.value = [];

    jsonData.forEach((row) => {

const blockPrefixes = Array.from(
  new Set(
    Object.keys(row)
      .filter(k => k.toLowerCase().includes("hora"))
      .map(k => {
        const match = k.toLowerCase().match(/^(\d+)_?hora|hora(\d+)/);
        return match?.[1] || match?.[2] || "";
      })
  )
);

      blockPrefixes.forEach((prefix) => {
        const hora = row[`${prefix}hora`];
        const servicio = row[`${prefix}servicio`];
        const ruta = row[`${prefix}ruta`];
        const monitora = row[`${prefix}monitora`];
        const bus = row[`${prefix}bus`];
        const conductor = row[`${prefix}conductor`];

        if (!hora && !servicio && !ruta) return; // blocco totalmente vuoto

        // parse ora
        const parsedTime = typeof hora === "number"
          ? (() => {
              const totalMinutes = Math.round(hora * 24 * 60);
              const hours = Math.floor(totalMinutes / 60);
              const minutes = totalMinutes % 60;
              return `${hours.toString().padStart(2, "0")}:${minutes
                .toString()
                .padStart(2, "0")}`;
            })()
          : String(hora).trim();

const trattaMatch = tratte.value.find((t) =>
  String(t.indirizzopartenza || "").trim().toLowerCase() === String(servicio || "").trim().toLowerCase() &&
  String(t.indirizzoarrivo || "").trim().toLowerCase() === String(ruta || "").trim().toLowerCase()
);

if (!trattaMatch) {
  console.warn("Tratta non riconosciuta:", servicio, "→", ruta);
}
      const autistaMatch = autisti.value.find((a) =>
        String(a.nickname || "").trim().toLowerCase() === String(conductor || "").trim().toLowerCase()
      );

      const mezzoMatch = veicoli.value.find((v) =>
        String(v.modello || "").trim().toLowerCase() === String(bus || "").trim().toLowerCase()
      );

        const isValid = hora && servicio && ruta;

        newCorse.value.push({
          tratta: trattaMatch || {
            descrizione: servicio+"->"+ruta,
            ora: parsedTime,
            tutor: monitora,
            datapartenza: datafiltro.value,
            indirizzopartenza: String(servicio || "").trim().toLowerCase(),
            indirizzoarrivo: String(ruta || "").trim().toLowerCase()
          },
          tutor: monitora,
          autista: autistaMatch || { nickname: conductor },
          mezzo: mezzoMatch || { modello: bus },
          flags: {
            trattaNonRiconosciuta: !trattaMatch,
            autistaNonRiconosciuto: !autistaMatch,
            mezzoNonRiconosciuto: !mezzoMatch,
            bloccoIncompleto: !isValid,
          },
        });

      });
    });

    lastExcelName.value = file.name;

  } catch (e) {
    error.value = e?.message || String(e);
  }
}

const isAddTrattaModalOpen = ref(false);
const newTrattaFromExcel = ref({
  descrizione: "",
  indirizzopartenza: "",
  indirizzoarrivo: "",
  tutor: "",
  ora: "",
  cadenza: [],
});
function apriModaleNuovaTratta(item) {
  const [partenza, arrivo] = (item.tratta.descrizione || "").split("->");
  newTrattaFromExcel.value = {
    descrizione: item.tratta.descrizione,
    indirizzopartenza: partenza?.trim(),
    indirizzoarrivo: arrivo?.trim(),
    tutor: item.tutor,
    ora: item.tratta.ora,
    cadenza: [],
  };
  isAddTrattaModalOpen.value = true;
}

async function salvaNuovaTratta() {
  try {
    const request = {
      ...newTrattaFromExcel.value,
      cadenza: newTrattaFromExcel.value.cadenza.filter(Boolean).join(","),
      ora: newTrattaFromExcel.value.ora,
    };
    await axios.post(`${API_BASE_URL}/tratte/aggiungiAll`, [request]);
    await loadTratte(); // Ricarica tratte
    isAddTrattaModalOpen.value = false;
  } catch (err) {
    console.error("Errore salvataggio tratta:", err);
  }
}

// Upload da input
const handleFileUpload = async (event) => {
  const input = event.target;
  const files = input?.files;
  await handleExcelFiles(files);
  // reset per permettere di ricaricare lo stesso file
  input.value = "";
};

// Formattazione date/ore
function formatDate(dateString) {
  return moment(dateString).format("dddd DD/MM/YYYY");
}
function formatTime(dateString) {
  return moment(dateString).format("HH:mm");
}

// Caricamento iniziale dati
onMounted(async () => {
  await loadCorse();
  await loadTratte();
  loadVeicoli();
  loadAutisti();
  loadInfoCadenza();
  window.addEventListener("keydown", onKey);
});
onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKey);
});

const aggiornaDataFiltro = (nuovaData) => {
  datafiltro.value = moment(nuovaData).startOf("day");
  console.log(datafiltro.value);
  aggiornaPagina();
};
const aggiornaPagina = async () => {
  resetNewCorsa();
  await loadCorse();
  loadInfoCadenza();
};

// ===== Toggle + Range =====
const activeDay = ref("hoy"); // 'ayer' | 'hoy' | 'mañana'
const isRangeMode = ref(false);
const dateRange = ref({
  start: moment().startOf("day"),
  end: moment().endOf("day"),
});

const formattedDate = computed(() => {
  try {
    if (isRangeMode.value && dateRange.value?.start && dateRange.value?.end) {
      const s = dateRange.value.start.format("ddd DD MMM");
      const e = dateRange.value.end.format("ddd DD MMM");
      return s === e ? s : `${s} → ${e}`;
    }
    return datafiltro.value ? datafiltro.value.format("dddd DD MMMM YYYY") : "";
  } catch {
    return "";
  }
});

const setDay = (which) => {
  activeDay.value = which;
  if (which === "ayer") aggiornaDataFiltro(moment().subtract(1, "day"));
  if (which === "hoy") aggiornaDataFiltro(moment());
  if (which === "mañana") aggiornaDataFiltro(moment().add(1, "day"));
};

const onRangeChange = (val) => {
  // supporta sia array [start, end] che oggetto { start, end }
  let start, end;
  if (Array.isArray(val)) {
    [start, end] = val;
  } else if (val && (val.start || val.end)) {
    ({ start, end } = val);
  }
  if (!start) return;

  const s = moment(start);
  const e = end ? moment(end) : moment(start);

  dateRange.value = { start: s, end: e };
  aggiornaPagina();
};
const enableRange = (v) => {
  isRangeMode.value = v;
  if (!v) {
    // uscita dal range: riallinea a “hoy”
    setDay("hoy");
  }
};

// Navigazione giorno singolo
const goToday = () => {
  aggiornaDataFiltro(new Date());
};
const goPrevDay = () => {
  const d = datafiltro.value
    ? datafiltro.value.clone().subtract(1, "day")
    : moment().subtract(1, "day");
  aggiornaDataFiltro(d);
};
const goNextDay = () => {
  const d = datafiltro.value
    ? datafiltro.value.clone().add(1, "day")
    : moment().add(1, "day");
  aggiornaDataFiltro(d);
};

// scorciatoie tastiera ← → e T
const onKey = (e) => {
  if (e.target && ["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;
  if (!isRangeMode.value && e.key === "ArrowLeft") {
    e.preventDefault();
    goPrevDay();
  }
  if (!isRangeMode.value && e.key === "ArrowRight") {
    e.preventDefault();
    goNextDay();
  }
  if (e.key?.toLowerCase() === "t") {
    e.preventDefault();
    goToday();
  }
};

// API load
const loadCorse = async () => {
  try {
    isLoading.value = true;

    let startDate, endDate;
    if (isRangeMode.value && dateRange.value?.start && dateRange.value?.end) {
      startDate = dateRange.value.start.clone().startOf("day").toDate();
      endDate = dateRange.value.end.clone().endOf("day").toDate();
    } else {
      startDate = new Date(datafiltro.value.toDate().setHours(0, 0, 0, 0));
      endDate = new Date(datafiltro.value.toDate().setHours(23, 59, 59, 999));
    }

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
    tratte.value.forEach((a) => {
      a.descrizionetratta = String(a.descrizione || "")
        .replace(/\s*->\s*/g, " ") // togli "->" e gli spazi intorno
        .replace(/\s{2,}/g, " ") // compatta spazi doppi
        .trim();
    });
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
    autisti.value.forEach((a) => (a.fullName = a.nickname));
  } catch (err) {
    error.value = err.response ? err.response.data.message : err.message;
  } finally {
    isLoading.value = false;
  }
};

// Funzioni gestione corse
const eliminaCorsa = async (id) => {
  if (confirm(t("confirmDelete"))) {
    try {
      await axios.delete(`${API_BASE_URL}/corse/corsaAssegnazione/${id}`);
      await aggiornaPagina();
    } catch (err) {
      error.value = err.response ? err.response.data.message : err.message;
    }
  }
};

const openAddRowModal = () => {
  isAddingRow.value = true;
};

const cancelAddRow = () => {
  isAddingRow.value = false;
  //resetNewCorsa();
};

const aggiungiCorsa = async () => {
  if (isSaving.value) return; // evita doppi invii
  isSaving.value = true;
  try {
    const request = createMassiveRequest();
    if (!request.length) {
      // Alert invece dell'errore in pagina
      // window.alert("Nessuna riga valida: seleziona almeno l'autista.");
      // oppure in spagnolo:
      window.alert("Ninguna fila válida: selecciona al menos al conductor.");
      return;
    }
    await axios.post(`${API_BASE_URL}/assegnazioni/aggiungiAll`, request);
    isAddingRow.value = false;
    resetNewCorsa();
    await aggiornaPagina();
  } catch (err) {
    error.value = err.response ? err.response.data.message : err.message;
  } finally {
    isSaving.value = false; // 🔑 sblocca sempre il bottone
  }
};

function createMassiveRequest() {
  let request = [];

  if (isAddingRow.value) {
    const r = JSON.parse(JSON.stringify(newCorsa.value));
    // serve idAutista valorizzato
    const idAutista = r.autista?.id;
    console.log("r.tratta.id" + r.tratta.id);
    if (idAutista) {
      if (r.orapartenza) {
        r.datapartenza = moment(r.datapartenza)
          .hours(r.orapartenza.hours || 0)
          .minutes(r.orapartenza.minutes || 0)
          .format();
      }
      r.dataarrivo = r.datapartenza;
      r.idAutista = r.autista.id;
      r.idMezzo = r.mezzo.id;
      r.idTratta = r.tratta.id;
      delete r.mezzo;
      delete r.autista;
      delete r.tratta;
      delete r.orapartenza;
      request.push(r);
    }
  }
  if (newCorse.value.length) {
    newCorse.value.forEach((nc) => {
      const idAutista = nc.autista?.id;
      if (idAutista) {
        const ora = nc.tratta.ora ? nc.tratta.ora.split(":") : ["0", "0"];
        console.log("r.tratta.id" + nc.tratta.id);
        request.push({
          datapartenza: moment(nc.tratta.datapartenza)
            .hour(ora[0])
            .minute(ora[1])
            .format(),
          dataarrivo: moment(nc.tratta.datapartenza).hour(ora[0]).minute(ora[1]).format(),
          idAutista: nc.autista.id,
          idMezzo: nc.mezzo.id,
          idTratta: nc.tratta.id,
          tutor: nc.tratta.tutor,
        });
      }
    });
  }

  return request;
}

function filtraTratte() {
  const selected = datafiltro.value;
  const giorno = selected.clone().locale("en").format("ddd").toUpperCase();

  tratteFiltrate.value = _.cloneDeep(tratte.value);
  _.remove(tratteFiltrate.value, (tratta) => {
    const cadenzaMatch = tratta.cadenza.indexOf(giorno) >= 0;
    const esiste = _.some(corse.value, (c) => {
      return (
        tratta.id === c.idtratta &&
        moment(c.datapartenza).isSame(datafiltro.value, "day") &&
        moment(c.datapartenza).format("HH:mm") === tratta.ora
      );
    });

    return !cadenzaMatch || esiste;
  });
}

const loadInfoCadenza = () => {
  filtraTratte();
  // reset bozze
  newCorse.value = [];
  const selected = datafiltro.value;

  const corseAggiunte = tratteFiltrate.value.map((tr) => ({
    tutor: tr.tutor,
    tratta: { ...tr, datapartenza: selected.clone() }, // imposta la data selezionata
    autista: {},
    mezzo: {},
  }));
  addTratteANewCorse(corseAggiunte);
};

function addTratteANewCorse(corseDaaggiungere) {
  corseDaaggiungere.forEach((c) => newCorse.value.push(c));
}

const resetNewCorsa = () => {
  newCorse.value = [];
  newCorsa.value = {
    datapartenza: datafiltro.value.clone(),
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

// Modale
const openEditModal = (corsa) => {
  corsaModifica.value = { ...corsa };
  isModalOpen.value = true;
  errorMessage.value = "";
  successMessage.value = "";
};

const saveChanges = async () => {
  if (isSaving.value) return; // evita doppi invii
  isSaving.value = true;
  try {
    const response = await axios.post(
      `${API_BASE_URL}/assegnazioni/modifica/`,
      corsaModifica.value
    );
    if (response.status === 200) {
      const index = corse.value.findIndex(
        (c) =>
          (c.idcorsa || c.id) === (corsaModifica.value.idcorsa || corsaModifica.value.id)
      );
      if (index !== -1) corse.value[index] = { ...corsaModifica.value };
      successMessage.value = "Corsa aggiornata con successo!";
    }
    closeModal();
  } catch (err) {
    errorMessage.value = "Errore durante l'aggiornamento della corsa.";
  } finally {
    isSaving.value = false; // 🔑 sblocca sempre il bottone
  }
};
const closeModal = () => {
  isModalOpen.value = false;
  corsaModifica.value = {};
  aggiornaPagina();
};

function getRowTooltip(flags) {
  const messages = [];
  if (flags?.bloccoIncompleto) messages.push("Blocco incompleto: manca ora o tratta.");
  if (flags?.trattaNonRiconosciuta) messages.push("Tratta non riconosciuta.");
  if (flags?.autistaNonRiconosciuto) messages.push("Autista non riconosciuto.");
  if (flags?.mezzoNonRiconosciuto) messages.push("Mezzo non riconosciuto.");
  return messages.join(" ");
}

</script>

<template>
  <!-- ====== NUOVO HEADER APP-BAR ====== -->
  <div class="appbar">
    <div class="day-controls">
      <!-- Toggle 3 stati -->
      <div class="toggle3" v-if="!isRangeMode">
        <button
          :class="['tg', { active: activeDay === 'ayer' }]"
          @click="setDay('ayer')"
          :disabled="isLoading"
        >
          ayer
        </button>
        <button
          :class="['tg', { active: activeDay === 'hoy' }]"
          @click="setDay('hoy')"
          :disabled="isLoading"
        >
          hoy
        </button>
        <button
          :class="['tg', { active: activeDay === 'mañana' }]"
          @click="setDay('mañana')"
          :disabled="isLoading"
        >
          mañana
        </button>
      </div>
      <!-- Singolo giorno -->
      <template v-if="!isRangeMode">
        <button
          class="btn-icon"
          @click="goPrevDay"
          :disabled="isLoading"
          title="Giorno precedente (←)"
        >
          <i class="fas fa-chevron-left" />
        </button>

        <VueDatePicker
          v-model="datafiltro"
          :format="'dd/MM/yyyy'"
          auto-apply
          text-input
          locale="it"
          @update:model-value="aggiornaDataFiltro"
          class="date-input"
        />

        <button
          class="btn-icon"
          @click="goNextDay"
          :disabled="isLoading"
          title="Giorno successivo (→)"
        >
          <i class="fas fa-chevron-right" />
        </button>
      </template>

      <!-- Range date -->
      <template v-else>
        <VueDatePicker
          v-model="dateRange"
          range
          :format="'dd/MM/yyyy'"
          auto-apply
          text-input
          locale="it"
          @update:model-value="onRangeChange"
          class="date-input range"
        />
      </template>

      <!-- switch modalità 
      <label class="mode-switch">
        <input
          type="checkbox"
          :checked="isRangeMode"
          @change="enableRange($event.target.checked)"
        />
        <span>intervalo</span>
      </label>
-->
      <!-- chip data/range -->
      <span class="date-chip">
        <i class="far fa-calendar-alt me-1" />{{ formattedDate }}
      </span>
    </div>

    <div class="upload-area">
      <!-- input file nascosto -->
      <input
        ref="excelInput"
        type="file"
        accept=".xlsx,.xls"
        class="d-none"
        @change="handleFileUpload"
      />
      <!-- bottone upload compatto -->
      <button
        type="button"
        class="btn-primary-solid"
        @click="openExcelPicker"
        :disabled="isLoading"
      >
        <i class="fas fa-upload me-2"></i>{{ $t("sfoglia") || "Carica Excel" }}
      </button>

      <span v-if="lastExcelName" class="file-name" :title="lastExcelName">
        <i class="far fa-file-excel me-1" />{{ lastExcelName }}
      </span>
    </div>
  </div>

  <!-- Dropzone inline/leggera visibile solo mentre trascini -->
  <transition name="fade">
    <div
      v-show="isDragging"
      class="dropzone-inline"
      @drop="onDrop"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
    >
      <div class="dz-content">
        <i class="fas fa-cloud-upload-alt" />
        <span>{{ $t("trascinaQui") || "Rilascia qui il file per importare" }}</span>
      </div>
    </div>
  </transition>

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
            style="margin-top: 10px"
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
                  <button @click="openAddRowModal" class="btn btn-sm btn-primary">
                    <i class="fa fa-plus"></i>
                  </button>
                </th>
                <th scope="col" class="text-right"></th>
              </tr>
            </thead>
            <tbody class="small">
              <!-- 🔝 Riga per l'inserimento della nuova corsa: PRIMA di tutto -->
              <tr v-if="isAddingRow" key="add-row-top">
                <td>
                  <VueDatePicker
                    id="data"
                    :enable-time-picker="false"
                    auto-apply
                    text-input
                    format="dd/MM/yyyy"
                    v-model="newCorsa.datapartenza"
                    locale="it"
                  />
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
                  />
                </td>
                <td>
                  <TypeAhead
                    id="tratte"
                    :items="tratte"
                    v-model="newCorsa.tratta"
                    :itemProjection="(item) => item.descrizionetratta"
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
                <td>
                  <TypeAhead
                    id="veicoli"
                    :items="veicoli"
                    v-model="newCorsa.mezzo"
                    :itemProjection="(item) => item.modello"
                    :allow-new="true"
                  />
                </td>
                <td class="text-right" style="width: 100px">
                  <button @click="cancelAddRow" class="btn btn-sm btn-secondary mr-1">
                    <i class="fas fa-times"></i>
                  </button>
                </td>
              </tr>

              <!-- Nessun dato -->
              <tr v-if="corse.length === 0 && newCorse.length === 0 && !isAddingRow">
                <td class="text-center" colspan="7">{{ t("noCoursesAvailable") }}</td>
              </tr>

              <!-- Corse esistenti -->
              <tr v-for="item in corse" :key="item.idcorsa || item.id">
                <td>{{ formatDate(item.datapartenza) }}</td>
                <td>{{ formatTime(item.datapartenza) }}</td>
                <td>{{ item.descrizionetratta }}</td>
                <td>{{ item.tutor }}</td>
                <td>{{ item.nickname }}</td>
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

              <!-- Bozze da Excel -->
              <tr
                v-for="(item, index) in newCorse"
                :key="`new-${index}-${item.tratta?.descrizione || ''}-${item.tratta?.ora || ''}`"
                :class="{
                  'table-danger': item.flags?.bloccoIncompleto,
                  'table-warning': item.flags?.trattaNonRiconosciuta,
                  'table-info': (item.flags?.autistaNonRiconosciuto || item.flags?.mezzoNonRiconosciuto) && !item.flags?.trattaNonRiconosciuta
                }"
                :title="getRowTooltip(item.flags)"
              >
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
                <td v-if="item.flags?.trattaNonRiconosciuta">
                  <button class="btn btn-sm btn-outline-primary" @click="apriModaleNuovaTratta(item)">
                    ➕
                  </button>
                </td>
              </tr>

        <!--fine -->
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col text-right">
        <button
          @click="aggiungiCorsa"
          class="btn btn-sm btn-success"
          :disabled="isSaving || isLoading"
        >
          <span
            v-if="isSaving"
            class="spinner-border spinner-border-sm me-2"
            role="status"
            aria-hidden="true"
          ></span>
          <span>
            {{
              isSaving
                ? $t("saving") || "Salvataggio..."
                : $t("aggiungiCorse") || "Aggiungi corse"
            }}
          </span>
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
          {{ autista.nickname }}
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
         

                <span
            v-if="isSaving"
            class="spinner-border spinner-border-sm me-2"
            role="status"
            aria-hidden="true"
          ></span>
          <span>
           {{ $t("save") }}
          </span>
        </button>
        <button @click="closeModal" class="btn btn-sm btn-secondary">
          {{ $t("close") }}
        </button>
      </div>
    </div>
  </div>

  <!-- MODALE AGGIUNGI TRATTA -->
  <div v-if="isAddTrattaModalOpen" class="modal">
    <div class="modal-content">
      <h2>Nuova Tratta da Excel</h2>

      <label>Partenza</label>
      <input type="text" v-model="newTrattaFromExcel.indirizzopartenza" class="form-control" />

      <label>Arrivo</label>
      <input type="text" v-model="newTrattaFromExcel.indirizzoarrivo" class="form-control" />

      <label>Ora</label>
      <input type="text" v-model="newTrattaFromExcel.ora" class="form-control" />

      <label>Tutor</label>
      <input type="text" v-model="newTrattaFromExcel.tutor" class="form-control" />

      <label>Cadenza</label>
      <Multiselect
        v-model="newTrattaFromExcel.cadenza"
        :options="[
          { value: 'MON', text: 'Lunedì' },
          { value: 'TUE', text: 'Martedì' },
          { value: 'WED', text: 'Mercoledì' },
          { value: 'THU', text: 'Giovedì' },
          { value: 'FRI', text: 'Venerdì' },
          { value: 'SAT', text: 'Sabato' },
          { value: 'SUN', text: 'Domenica' }
        ]"
        mode="tags"
        label="text"
        track-by="value"
        class="w-100"
      />

      <div class="d-flex justify-content-end gap-2 mt-3">
        <button class="btn btn-secondary" @click="isAddTrattaModalOpen = false">Annulla</button>
        <button class="btn btn-success" @click="salvaNuovaTratta">Salva</button>
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

/* ====== NUOVO HEADER / APP-BAR ====== */
.appbar {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  background: #ffffffcc; /* leggero blur */
  backdrop-filter: saturate(1.2) blur(6px);
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
  margin-bottom: 12px;
}
.day-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-icon {
  display: inline-grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: #fff;
  cursor: pointer;
}
.btn-icon:hover {
  background: #f8fafc;
}
.btn-icon:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-text {
  height: 36px;
  padding: 0 10px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: #fff;
  font-weight: 600;
  cursor: pointer;
}
.btn-text:hover {
  background: #f8fafc;
}

.date-input :deep(.dp__input) {
  height: 36px;
  border-radius: 10px;
  border-color: #e5e7eb;
}

.date-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px; /* 🔹 aumenta il padding orizzontale */
  min-width: 240px; /* 🔹 garantisce una larghezza minima */
  justify-content: center;
  background: #f3f4f6; /* grigio chiaro */
  border-radius: 16px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #374151;
}
.date-chip i {
  font-size: 1rem;
  color: #6b7280;
}

.upload-area {
  display: flex;
  align-items: center;
  gap: 10px;
}
.btn-primary-solid {
  height: 36px;
  padding: 0 14px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  color: #fff;
  background: #0d6efd;
  box-shadow: 0 6px 14px rgba(13, 110, 253, 0.18);
}
.btn-primary-solid:hover {
  filter: brightness(0.98);
}
.file-name {
  max-width: 260px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #6b7280;
}

/* Dropzone leggera quando si trascina */
.dropzone-inline {
  border: 2px dashed #0d6efd55;
  border-radius: 14px;
  padding: 16px;
  margin-top: 8px;
  background: #f8fbff;
}
.dz-content {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #0d6efd;
  font-weight: 600;
}

/* Transizione fade per la dropzone */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Toggle 3 stati */
.toggle3 {
  display: inline-flex;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  margin-right: 6px;
}
.toggle3 .tg {
  padding: 6px 10px;
  background: #fff;
  border: 0;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
}
.toggle3 .tg + .tg {
  border-left: 1px solid #e5e7eb;
}
.toggle3 .tg.active {
  background: #0d6efd;
  color: #fff;
}

/* switch modalità */
.mode-switch {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-left: 8px;
  font-size: 13px;
  color: #374151;
}
.mode-switch input {
  cursor: pointer;
}

/* range picker un filo più largo */
.date-input.range :deep(.dp__input) {
  min-width: 230px;
}

/* (facoltativo) Stili dropzone “vecchia” se riutilizzata altrove */
.dropzone-vue {
  border: 2px dashed #e5e7eb;
  border-radius: 14px;
  padding: 14px 16px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  transition: border-color 0.15s ease, background-color 0.15s ease;
}
.dropzone-vue.dragging {
  border-color: #0d6efd33;
  background: #f8fbff;
}
.drop-start {
  display: flex;
  align-items: center;
  gap: 12px;
}
.drop-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: #e7f1ff;
}
.drop-icon svg {
  width: 18px;
  height: 18px;
}
.drop-text {
  display: flex;
  flex-direction: column;
}
.drop-title {
  font-weight: 600;
  font-size: 14px;
}
.drop-hint {
  font-size: 12px;
  color: #6b7280;
}
</style>
