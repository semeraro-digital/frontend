<script setup>
import { RouterLink, RouterView } from 'vue-router';
import { useRoute } from 'vue-router'; // Importa useRoute per ottenere la rotta attuale


const route = useRoute(); // Ottieni la rotta attuale
</script>

<template>
  <div id="wrapper" v-if="!isBlankLayout">
    <!-- Sidebar -->
    <ul class="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion" id="accordionSidebar">

      <!-- Sidebar - Brand -->
      <a class="sidebar-brand d-flex align-items-center justify-content-center" href="/">
        <div class="sidebar-brand-icon rotate-n-15">
          <i class="bi bi-bus-front-fill" style="color: white;"></i>
        </div>
        <div class="sidebar-brand-text mx-3">La Inmaculada</div>
      </a>

      <!-- Divider -->
      <hr class="sidebar-divider my-0">

      <!-- Nav Item - Dashboard -->
      <li class="nav-item active">
        <RouterLink to="/dashboard">
        <a class="nav-link">
          <i class="fas fa-fw fa-tachometer-alt"></i>
          <span>Dashboard</span></a>
        </RouterLink>
      </li>

      <!-- Divider -->
      <hr class="sidebar-divider">

      <!-- Heading -->
      <div class="sidebar-heading">
        Addons
      </div>

      <!-- Nav Item - Autisti -->
      <li class="nav-item">
        <RouterLink to="/autisti">
          <a class="nav-link">
            <i class="fas fa-fw fa-users"></i>
            <span> {{ $t("autisti") }}</span></a>
        </RouterLink>
      </li>

      <!-- Nav Item - calendar -->
      <li class="nav-item">
        <RouterLink to="/">
          <a class="nav-link">
            <i class="fas fa-fw fa-calendar"></i>
            <span>  {{ $t("calendar") }}</span></a>
        </RouterLink>
      </li>

            <!-- Nav Item - Tratte -->
            <li class="nav-item">
        <RouterLink to="/tratte">
          <a class="nav-link">
            <i class="fas fa-fw fa-route"></i>
            <span> {{ $t("tratte") }}</span></a>
        </RouterLink>
      </li>

      <!-- Nav Item - Autisti -->
      <li class="nav-item">
        <RouterLink to="/veicoli">
          <a class="nav-link">
            <i class="fas fa-fw fa-car"></i>
            <span>{{ $t("veicoli") }}</span></a>
        </RouterLink>
      </li>

      <!-- Nav Item - Tables
      <li class="nav-item">
        <RouterLink to="/">
          <a class="nav-link" href="tables.html">
            <i class="fas fa-fw fa-table"></i>
            <span>Tables</span></a>
        </RouterLink>
      </li>-->

      <!-- Nav Item - Tables -->
      <li class="nav-item">
        <RouterLink to="/corse">
          <a class="nav-link" href="tables.html">
            <i class="fas fa-fw fa-table"></i>
            <span>{{ $t("service") }}</span></a>
        </RouterLink>
      </li>
      <li class="nav-item">
        <RouterLink to="/corseAll">
          <a class="nav-link" href="tables.html">
            <i class="fas fa-fw fa-table"></i>
            <span>{{ $t("serviceAll") }}</span></a>
        </RouterLink>
      </li>
<!--
      <li class="nav-item">
        <RouterLink to="/assegnazioni">
          <a class="nav-link" href="tables.html">
            <i class="fas fa-fw fa-table"></i>
            <span>{{ $t("assegnazioni") }}</span></a>
        </RouterLink>
      </li>
-->
      <!-- Divider -->
      <hr class="sidebar-divider d-none d-md-block">

    </ul>
    <!-- End of Sidebar -->

    <!-- Content Wrapper -->
    <div id="content-wrapper" class="d-flex flex-column">
      <!-- Main Content -->
      <div id="content">
        <!-- Topbar -->
        <nav v-if="!$route.meta.hideTopBar"
          class="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">
          <!-- Sidebar Toggle (Topbar) -->
          <button id="sidebarToggleTop" class="btn btn-link d-md-none rounded-circle mr-3">
            <i class="fa fa-bars"></i>
          </button>


          <!-- Topbar Navbar -->
          <ul class="navbar-nav ml-auto">
            <!-- User Information -->
            <li class="nav-item dropdown no-arrow">
              <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-toggle="dropdown"
                aria-haspopup="true" aria-expanded="false">
                <span class="mr-2 d-none d-lg-inline text-gray-600 small">Admin</span>
                <img class="img-profile rounded-circle" src="/img/undraw_profile.svg">
              </a>
              <div class="dropdown-menu dropdown-menu-right shadow animated--grow-in" aria-labelledby="userDropdown">
                <a class="dropdown-item" href="/profilo">
                  <i class="fas fa-user fa-sm fa-fw mr-2 text-gray-400"></i>
                  Profile
                </a>
                <!--    <a class="dropdown-item" href="#">
                  <i class="fas fa-cogs fa-sm fa-fw mr-2 text-gray-400"></i>
                  Settings
                </a>
                <a class="dropdown-item" href="#">
                  <i class="fas fa-list fa-sm fa-fw mr-2 text-gray-400"></i>
                  Activity Log
                </a> -->
                <div class="dropdown-divider"></div>
                <a class="dropdown-item" href="#" @click="logout">
                  <i class="fas fa-sign-out-alt fa-sm fa-fw mr-2 text-gray-400"></i>
                  Logout
                </a>
              </div>
            </li>
          </ul>
        </nav>
        <!-- End of Topbar -->

        <!-- Begin Page Content -->
        <RouterView />
        <!-- End of Main Content -->
      </div>
    </div>
    <!-- End of Content Wrapper -->
  </div>

  <!-- Layout bianco per login -->
  <div v-if="isBlankLayout">
    <RouterView />
  </div>
</template>

<script>
export default {
  computed: {
    // Determina se si tratta di una pagina con layout vuoto, come il login
    isBlankLayout() {
      return this.$route.meta.layout === 'blank';
    }
  },
  methods: {
    logout() {
      localStorage.removeItem('token');
      this.$router.push('/login');
    }
  }
};
</script>

<style>
/* Stili specifici per la pagina di login o layout bianco */
#content-wrapper {
  background-color: #f8f9fc;
  /* Sfondo bianco per la parte principale */
}

#wrapper {
  display: flex;
  height: 100vh;
}
</style>
