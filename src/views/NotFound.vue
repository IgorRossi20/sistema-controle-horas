<template>
  <div class="not-found">
    <div class="text-center py-5">
      <h1 class="display-1 mb-4">404</h1>
      <h2 class="mb-4">Página não encontrada</h2>
      <p class="lead mb-5">A página que você está procurando não existe ou foi movida.</p>
      <router-link to="/" class="btn btn-primary btn-lg">
        <i class="bi bi-house-door me-2"></i> Voltar para o Dashboard
      </router-link>
    </div>
  </div>
</template>

<script setup>
// Componente simples para página não encontrada
</script>

<style scoped>
.not-found {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.5s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>