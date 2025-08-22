<template>
  <div class="app-container">
    <header class="app-header">
      <nav class="navbar navbar-expand-lg navbar-dark" style="background: var(--bg-gradient);">
        <div class="container">
          <router-link class="navbar-brand d-flex align-items-center" to="/">
            <div class="brand-text">
              <div class="brand-title">IRN Tecnologia</div>
              <div class="brand-subtitle">Controle de Horas</div>
            </div>
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
                <router-link class="nav-link" to="/projects">Projetos</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/reports">Relatórios</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/test">🧪 Teste</router-link>
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
        <p class="mb-1">Controle de Horas PJ &copy; {{ currentYear }}</p>
        <p class="mb-0 text-muted small">
          <i class="bi bi-code-slash me-1"></i>
          Criado por <strong>Igor Rossi Nunes</strong> para controle das horas trabalhadas em regime PJ
        </p>
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

/* Header Styles */
.navbar {
  box-shadow: 0 4px 20px rgba(30, 58, 95, 0.15);
  backdrop-filter: blur(10px);
}

.navbar-brand {
  font-weight: 600;
  text-decoration: none !important;
  transition: all 0.3s ease;
}

.navbar-brand:hover {
  transform: translateY(-2px);
}



.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.brand-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: white;
  letter-spacing: 0.5px;
}

.brand-subtitle {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 400;
  letter-spacing: 1px;
}

.nav-link {
  font-weight: 500;
  letter-spacing: 0.3px;
  transition: all 0.3s ease;
  position: relative;
}

.nav-link:hover {
  color: rgba(255, 255, 255, 0.9) !important;
  transform: translateY(-1px);
}

.nav-link.router-link-active {
  color: white !important;
  font-weight: 600;
}

.nav-link.router-link-active::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 30px;
  height: 3px;
  background: linear-gradient(90deg, #4A90E2, #6BA3E8);
  border-radius: 2px;
}

/* Footer Styles */
.app-footer {
  background: var(--bg-secondary) !important;
  border-top: 1px solid rgba(74, 144, 226, 0.1);
  color: var(--dark-color);
}

/* Responsive */
@media (max-width: 768px) {
  .brand-title {
    font-size: 1.2rem;
  }
  
  .brand-subtitle {
    font-size: 0.75rem;
  }
}
</style>