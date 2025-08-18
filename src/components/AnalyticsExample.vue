<template>
  <div class="analytics-example">
    <h3>Exemplo de uso do Firebase Analytics</h3>
    <button @click="logEvent('button_click', { button_name: 'exemplo' })" class="btn btn-primary">
      Registrar Evento de Clique
    </button>
    <button @click="logPageView('pagina_exemplo')" class="btn btn-secondary ms-2">
      Registrar Visualização de Página
    </button>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'AnalyticsExample',
  setup() {
    onMounted(() => {
      // Componente montado - analytics local
      console.log('Componente AnalyticsExample montado')
    })

    // Função para simular eventos personalizados
    const logCustomEvent = (eventName, eventParams = {}) => {
      console.log(`Evento simulado: ${eventName}`, eventParams)
    }

    // Função específica para simular visualizações de página
    const logPageView = (pageName) => {
      logCustomEvent('page_view', {
        page_title: pageName,
        page_location: window.location.href,
        page_path: window.location.pathname
      })
    }

    return {
      logEvent: logCustomEvent,
      logPageView
    }
  }
}
</script>

<style scoped>
.analytics-example {
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin: 20px 0;
  background-color: #f9f9f9;
}
</style>