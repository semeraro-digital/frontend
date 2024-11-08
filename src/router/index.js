import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import MonthView from "../views/MonthView.vue";
import Login from '../views/Login.vue'; // Importa il nuovo componente Login

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [

        {
            path: '/',
            name: 'calendar',
            component: () => import('../views/Calendar.vue')
        },
        {
            path: '/dashboard',
            name: 'dashboard',
            component: () => import('../views/Dashboard.vue')
        },

        {
            path: '/tratte',
            name: 'tratte',
            component: () => import('../views/Tratte.vue')
        },
        {
            path: '/month',
            name: 'month',
            component: MonthView,
            meta: { hideTopBar: true }
        },
        {
            path: '/about',
            name: 'about',
            component: () => import('../views/AboutView.vue')
        },
        {
            path: '/autisti',
            name: 'autisti',
            component: () => import('../views/Autisti.vue')
        },
        {
            path: '/veicoli',
            name: 'veicoli',
            component: () => import('../views/Veicoli.vue')
        },
        {
            path: '/login',
            name: 'login',
            component: Login,
            meta: { layout: 'blank' }
        },

        {
            path: '/assegnazioni',
            name: 'assegnazioni',
            component: () => import('../views/Assegnazioni.vue')
        },

        {
            path: '/autisti/:id',
            name: 'dettaglio',
            component: () => import('../views/DettaglioAutisti.vue'),
            beforeEnter:(to,from) => {
                console.log(to.params.id)
            }

        },
        {
            path: '/dashboard',
            name: 'dashboard',
            component: () => import('../views/Dashboard.vue')
        },
        {
            path: '/corse',
            name: 'corse',
            component: () => import('../views/Corse.vue')
        },
        {
            path: '/profilo',
            name: 'profilo',
            component: () => import('../views/Profilo.vue')
        },
        {
            path: '/corseAll',
            name: 'corseAll',
            component: () => import('../views/corseAll.vue')
        },
    ]
});

// Controllo token per l'accesso protetto
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token');

    if (to.name !== 'login' && !token) {
      next({ name: 'login' });
    } else {
      next();
    }
    next();
});

export default router;
// Aggiun
