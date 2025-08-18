<template>
  <div class="app-container">
    <header class="app-header">
      <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
        <div class="container">
          <router-link class="navbar-brand" to="/">
            <i class="bi bi-clock me-2"></i>
            Controle de horas - Igor Rossi Nunes
          </router-link>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav me-auto">
              <li class="nav-item">
                <router-link class="nav-link" to="/dashboard">Dashboard</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/time-entries">Registros</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/clients">Clientes</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/projects">Projetos</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/reports">Relatórios</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/google-calendar">
                  <i class="fab fa-google me-1"></i>
                  Google Calendar
                </router-link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>

    <main class="app-main">
      <div class="container py-4">
        <router-view />
      </div>
    </main>

    <footer class="app-footer bg-light py-3 mt-auto">
      <div class="container text-center">
        <p class="mb-0">Controle de Horas PJ &copy; {{ currentYear }}</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const currentYear = new Date().getFullYear()
</script>

<style>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-main {
  flex: 1;
}
</style>