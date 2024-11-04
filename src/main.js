import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import './assets/main.css';
import "/vendor/fontawesome-free/css/all.min.css";
import '/css/sb-admin-2.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import i18n from './i18n'; // Importa la configurazione di i18n

const app = createApp(App);

app.use(router);
app.use(i18n); // Aggiungi i18n all'app

app.mount('#app');
