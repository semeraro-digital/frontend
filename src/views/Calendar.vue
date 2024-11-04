<script setup>
import Calendar, { resourceBackgroundColor } from '@event-calendar/core';
import TimeGrid from '@event-calendar/time-grid';
import DayGrid from '@event-calendar/day-grid';
import Interaction from '@event-calendar/interaction';
import { onMounted, onUnmounted } from 'vue';
import moment from 'moment';
import '@event-calendar/core/index.css';
import axios from 'axios'; // Importa Axios

import { useI18n } from 'vue-i18n'; // Importa useI18n
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const { t } = useI18n(); // Ottieni la funzione $t
let ec;
const eventi = [];

onMounted(async () => {
  try {
    // Effettua la chiamata al servizio per ottenere gli eventi
    const response = await axios.get(`${API_BASE_URL}/assegnazioni`); // Sostituisci con il tuo URL
    const data = response.data;

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
            /* 
            if (ec.getView().type === 'dayGridMonth') {
              ec.setOption('date', moment(ev.dateStr).toDate())
              ec.setOption('view', 'timeGridDay');
            } else {
              addEvent(ev);
            } 
            */
          },
          eventClick: (ev) => {
            /* removeEvent(ev); */
          }
        }
      }
    });
  } catch (error) {
    console.error('Errore durante la chiamata al servizio:', error);
  }
});

onUnmounted(() => {
  ec.destroy();
});

function addEvent(ev) {
  ec.addEvent({
    id: Math.random(),
    allDay: ev.allDay,
    start: moment(ev.dateStr).toDate(),
    end: moment(ev.dateStr).add(2, 'hours').toDate(),
    title: 'provaaa' + Math.random()
  });
}

function removeEvent(ev) {
  ec.removeEventById(ev.event.id);
}
</script>

<template>
  <div class="container-fluid mt-5">
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <div id="ec"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
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
</style>
