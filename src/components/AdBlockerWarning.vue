<template>
  <div v-if="showWarning" class="alert alert-warning alert-dismissible fade show" role="alert">
    <div class="d-flex align-items-center">
      <i class="bi bi-shield-exclamation me-2 fs-4"></i>
      <div class="flex-grow-1">
        <h6 class="alert-heading mb-1">
          <i class="bi bi-exclamation-triangle me-1"></i>
          Adblocker Detectado
        </h6>
        <p class="mb-2">
          Seu bloqueador de anúncios pode estar interferindo no funcionamento da aplicação.
          Para garantir que todas as funcionalidades funcionem corretamente, desabilite o adblocker para este site.
        </p>
        <div class="small">
          <strong>Como desabilitar:</strong>
          <ul class="mb-0 mt-1">
            <li><strong>uBlock Origin:</strong> Clique no ícone → botão power → recarregue</li>
            <li><strong>AdBlock:</strong> Clique no ícone → "Pausar no site" → recarregue</li>
            <li><strong>Brave:</strong> Clique no escudo → desative "Bloquear scripts" → recarregue</li>
          </ul>
        </div>
      </div>
    </div>
    <button 
      type="button" 
      class="btn-close" 
      @click="dismissWarning"
      aria-label="Fechar"
    ></button>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'AdBlockerWarning',
  setup() {
    const showWarning = ref(false)
    const warningDismissed = ref(false)

    const detectAdBlocker = () => {
      return new Promise((resolve) => {
        // Criar elemento de teste
        const testAd = document.createElement('div')
        testAd.innerHTML = '&nbsp;'
        testAd.className = 'adsbox ads ad-banner advertisement'
        testAd.style.cssText = `
          position: absolute !important;
          left: -10000px !important;
          top: -10000px !important;
          width: 1px !important;
          height: 1px !important;
          visibility: hidden !important;
        `
        
        document.body.appendChild(testAd)
        
        setTimeout(() => {
          const isBlocked = testAd.offsetHeight === 0 || 
                           testAd.offsetWidth === 0 || 
                           testAd.style.display === 'none' ||
                           testAd.style.visibility === 'hidden'
          
          document.body.removeChild(testAd)
          resolve(isBlocked)
        }, 100)
      })
    }

    const checkFirebaseErrors = () => {
      // Verificar se há erros do Firebase no console
      const originalError = console.error
      let hasFirebaseError = false
      
      console.error = function(...args) {
        const message = args.join(' ')
        if (message.includes('ERR_BLOCKED_BY_CLIENT') || 
            message.includes('firestore.googleapis.com')) {
          hasFirebaseError = true
        }
        originalError.apply(console, args)
      }
      
      return hasFirebaseError
    }

    const dismissWarning = () => {
      showWarning.value = false
      warningDismissed.value = true
      // Salvar no localStorage para não mostrar novamente nesta sessão
      localStorage.setItem('adBlockerWarningDismissed', 'true')
    }

    const checkShouldShowWarning = async () => {
      // Verificar se o aviso já foi dispensado nesta sessão
      const dismissed = localStorage.getItem('adBlockerWarningDismissed')
      if (dismissed === 'true') {
        return
      }

      // Detectar adblocker
      const adBlockerDetected = await detectAdBlocker()
      
      if (adBlockerDetected && !warningDismissed.value) {
        showWarning.value = true
      }
    }

    onMounted(() => {
      // Aguardar um pouco para a página carregar completamente
      setTimeout(checkShouldShowWarning, 2000)
      
      // Limpar o flag de dismissal quando a página é recarregada
      window.addEventListener('beforeunload', () => {
        localStorage.removeItem('adBlockerWarningDismissed')
      })
    })

    return {
      showWarning,
      dismissWarning
    }
  }
}
</script>

<style scoped>
.alert {
  margin-bottom: 1rem;
  border-left: 4px solid #ffc107;
}

.alert-warning {
  background-color: #fff3cd;
  border-color: #ffc107;
  color: #664d03;
}

.alert ul {
  padding-left: 1.2rem;
}

.alert li {
  margin-bottom: 0.25rem;
}

@media (max-width: 768px) {
  .alert {
    font-size: 0.9rem;
  }
  
  .alert ul {
    padding-left: 1rem;
  }
}
</style>