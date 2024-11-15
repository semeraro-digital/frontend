<script setup>
import Calendar, { resourceBackgroundColor } from '@event-calendar/core';
import TimeGrid from '@event-calendar/time-grid';
import DayGrid from '@event-calendar/day-grid';
import Interaction from '@event-calendar/interaction';
import { ref, onMounted, onUnmounted } from 'vue';
import moment from 'moment';
import '@event-calendar/core/index.css';
import axios from 'axios'; // Importa Axios

import { useI18n } from 'vue-i18n'; // Importa useI18n
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const { t } = useI18n(); // Ottieni la funzione $t
let ec;
const eventi = [];
const showModal = ref(false); // Controlla se mostrare la modale
const eventDetails = ref(null); // Dettagli dell'evento selezionato

onMounted(async () => {
  try {
    // Effettua la chiamata al servizio per ottenere gli eventi
    const response = await axios.get(`${API_BASE_URL}/assegnazioni`);
    const data = response.data;
    const responseTratte = await axios.get(`${API_BASE_URL}/tratte`); // recupera le tratte non assegnate
    const dataTratte = responseTratte.data;
    const dataTratteFiltrate = filtraTratte(dataTratte);

    // Popola l'array eventi con i dati ricevuti
    data.forEach(event => {
      eventi.push({
        id: event.id || Math.random(), // Assicurati di usare un id unico
        allDay: event.allDay || false,
        start: moment(event.datapartenza).toDate(),
        end: moment(event.dataarrivo).toDate(),
        title: event.descrizionetratta || 'Evento senza titolo',
        backgroundColor: event.backgroundColor || '#36b9cc' // Imposta un colore di default
      });
    });
    // Popola l'array eventi con i dati delle tratte non assegnate
    dataTratteFiltrate.forEach(event => {
      eventi.push({
        id: event.id || Math.random(), // Assicurati di usare un id unico
        allDay: event.allDay || false,
        start: moment(event.start).toDate(),
        end: moment(event.start).toDate(),
        title: event.title || 'Evento senza titolo',
        backgroundColor: event.backgroundColor || '#FFD400' // Imposta un colore di default
      });
    });

    // Inizializza il calendario solo dopo aver popolato gli eventi
    ec = new Calendar({
      target: document.getElementById('ec'),
      props: {
        plugins: [DayGrid, TimeGrid, Interaction],
        options: {
          view: 'dayGridMonth',
          headerToolbar: {
            start: 'prev,next today',
            center: 'title',
            end: 'dayGridMonth,timeGridWeek,timeGridDay'
          },
          events: eventi,
          firstDay: 1,
          locale: t('locale'), // Imposta la locale usando $t
          eventClassNames: 'evento',
          buttonText: {
            close: 'Chiudi',
            dayGridMonth:  t('mese'), 
            listDay: 'Lista',
            listMonth: 'Lista',
            listWeek: 'Lista',
            listYear: 'Lista',
            resourceTimeGridDay: 'Risorse',
            resourceTimeGridWeek: 'Risorse',
            resourceTimelineDay: 'Timeline',
            resourceTimelineMonth: 'Timeline',
            resourceTimelineWeek: 'Timeline',
            timeGridDay:  t('giorno'), 
            timeGridWeek:  t('settimana'), 
            today:  t('oggiCal'), 
          },
          dayMaxEvents: true,
          height: '550px',
          width: '90%',
          dateClick: (ev) => {
            if (ec.getView().type === 'dayGridMonth') {
              ec.setOption('date', moment(ev.dateStr).toDate())
              ec.setOption('view', 'timeGridDay');
            } else {
              addEvent(ev); // Solo se necessario
            } 
          },
          eventClick: (ev) => {
            // Quando clicchi su un evento, raccogli i dettagli e mostra la modale
            const eventoSelezionato = getEventDetails(ev.event);
            eventDetails.value = eventoSelezionato; // Memorizza i dettagli nell'oggetto reactive
            showModal.value = true; // Mostra la modale

             console.log("Modale visibile:", showModal.value); // Aggiungi un log per vedere se viene eseguito
          }
        }
      }
    });
  } catch (error) {
    console.error('Errore durante la chiamata al servizio:', error);
  }
});

// Modifica: Aggiunto il controllo per verificare se ec è definito
onUnmounted(() => {
  if (ec) {
    ec.destroy(); // Distruggi solo se ec è definito
  }
});

// Funzione per ottenere i dettagli dell'evento
function getEventDetails(event) {
  return {
    title: event.title,
    start: moment(event.start).format('YYYY-MM-DD HH:mm'),
    description: event.extendedProps.description || 'Nessuna descrizione disponibile',
  };
}

function filtraTratte(tratte) {
  console.log("tratte "+tratte);
  // Crea un array per memorizzare i nuovi oggetti con le informazioni richieste
  const nuoveTratte = [];

  // Imposta la data di partenza come oggi
  const dataInizio = moment();

  // Cicla per ogni giorno da oggi fino a un mese avanti (30 giorni)
  for (let i = 0; i < 30; i++) {
    const giorno = dataInizio.clone().add(i, 'days').locale("en").format("ddd").toUpperCase();

    // Filtra le tratte e aggiungi gli oggetti richiesti
    tratte.forEach((tratta) => {
      console.log(tratta.ora + " " + tratta.cadenza + " " + tratta.descrizione);

      // Verifica se la cadenza della tratta corrisponde al giorno ciclato
      const cadenzaMatch = tratta.cadenza.indexOf(giorno) >= 0;
      if (!tratta.ora) {
        return; // Se non c'è ora, salta la tratta
      }

      // Crea l'oggetto solo se la cadenza corrisponde al giorno e la tratta non è già presente
      if (cadenzaMatch) {
        const nuovaTratta = {
          start: moment(dataInizio).add(i, 'days').format('YYYY-MM-DD') + ' ' + tratta.ora,
          title: tratta.descrizione
        };

        // Aggiungi l'oggetto nuovo all'array
        nuoveTratte.push(nuovaTratta);
      }
    });
  }

  // Restituisci l'array con le nuove tratte
  return nuoveTratte;
}

// Funzione per aggiungere un nuovo evento (forse non necessaria)
function addEvent(ev) {
  ec.addEvent({
    id: Math.random(),
    allDay: ev.allDay,
    start: moment(ev.dateStr).toDate(),
    end: moment(ev.dateStr).add(2, 'hours').toDate(),
    title: 'provaaa' + Math.random()
  });
}

// Funzione per rimuovere un evento (non usato nel codice ma presente)
function removeEvent(ev) {
  ec.removeEventById(ev.event.id);
}

// Modifica: Aggiunta la funzione closeModal per chiudere la modale
function closeModal() {
  showModal.value = false; // Chiude la modale
}
</script>
<template>
  <div v-if="showModal" class="modal">
    <div class="modal-content">
      <h4>Dettagli Evento</h4>
      <p><strong>Titolo:</strong> {{ eventDetails.title }}</p>
      <p><strong>Data e ora:</strong> {{ eventDetails.start }}</p>
      <p><strong>Descrizione:</strong> {{ eventDetails.description }}</p>
      <button @click="closeModal">Chiudi</button>
    </div>
  </div>
  <div id="ec"></div>
</template>


<style>
.evento {
  background-color: #2c3e50;
}

.evento .ec-event-body {
  font-size: 14px;
}

.evento .ec-event-time {
  font-size: 14px;
}

.evento .ec-event-title {
  font-size: 14px;
  line-height: 21px;
}
.modal {
  position: fixed;
  top: 50%; /* Posiziona al 50% della altezza */
  left: 50%; /* Posiziona al 50% della larghezza */
  transform: translate(-50%, -50%); /* Sposta la modale indietro di metà della sua altezza e larghezza per centrarla */
  width: 50%; /* Larghezza della modale */
  height: 50%; /* Altezza della modale */
  background-color: rgba(0, 0, 0, 0.5); /* Overlay scuro */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%; /* Occupa tutta la larghezza disponibile della modale */
  height: 100%; /* Occupa tutta l'altezza disponibile della modale */
  overflow-y: auto; /* Se il contenuto è troppo grande, abilita lo scroll */
}

</style>
