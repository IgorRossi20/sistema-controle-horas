<template>
  <div class="not-found">
    <div class="text-center py-5">
      <div class="error-icon mb-4">
        <i class="bi bi-exclamation-triangle"></i>
      </div>
      <h1 class="error-code mb-4">404</h1>
      <h2 class="error-title mb-4">Página não encontrada</h2>
      <p class="error-description mb-5">A página que você está procurando não existe ou foi movida.</p>
      <router-link to="/" class="btn btn-primary btn-modern btn-lg">
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
  animation: fadeIn 0.5s ease;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.error-icon {
  font-size: 4rem;
  color: var(--primary-color);
  opacity: 0.8;
}

.error-code {
  font-size: 8rem;
  font-weight: 900;
  background: var(--brand-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  margin-bottom: 1rem;
}

.error-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--dark-color);
  margin-bottom: 1rem;
}

.error-description {
  font-size: 1.2rem;
  color: var(--secondary-color);
  font-weight: 400;
  max-width: 500px;
  margin: 0 auto 2rem;
  line-height: 1.6;
}

.btn-modern {
  border-radius: 12px;
  font-weight: 600;
  letter-spacing: 0.3px;
  padding: 1rem 2rem;
  box-shadow: 0 4px 15px rgba(74, 144, 226, 0.3);
  transition: all 0.3s ease;
  text-decoration: none;
}

.btn-modern:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(74, 144, 226, 0.4);
  text-decoration: none;
}

@keyframes fadeIn {
  from { 
    opacity: 0;
    transform: translateY(30px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .error-code {
    font-size: 6rem;
  }
  
  .error-title {
    font-size: 2rem;
  }
  
  .error-description {
    font-size: 1.1rem;
    padding: 0 1rem;
  }
  
  .btn-modern {
    padding: 0.875rem 1.5rem;
    font-size: 1rem;
  }
}
</style>