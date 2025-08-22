/**
 * Utilitário de debounce para otimizar operações de busca e filtro
 */

/**
 * Função de debounce que atrasa a execução de uma função até que
 * um determinado tempo tenha passado desde a última vez que foi invocada
 * @param {Function} func - Função a ser executada
 * @param {number} delay - Tempo de atraso em milissegundos
 * @returns {Function} - Função com debounce aplicado
 */
export function debounce(func, delay = 300) {
  let timeoutId
  
  return function (...args) {
    // Limpar timeout anterior se existir
    clearTimeout(timeoutId)
    
    // Definir novo timeout
    timeoutId = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}

/**
 * Função de throttle que limita a execução de uma função
 * a uma vez por período especificado
 * @param {Function} func - Função a ser executada
 * @param {number} limit - Tempo limite em milissegundos
 * @returns {Function} - Função com throttle aplicado
 */
export function throttle(func, limit = 100) {
  let inThrottle
  
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * Hook personalizado para Vue 3 que implementa debounce reativo
 * @param {Function} callback - Função callback a ser executada
 * @param {number} delay - Tempo de atraso em milissegundos
 * @returns {Function} - Função com debounce aplicado
 */
export function useDebouncedCallback(callback, delay = 300) {
  const debouncedFn = debounce(callback, delay)
  
  // Cleanup no unmount
  if (typeof window !== 'undefined' && window.Vue) {
    const { onUnmounted } = window.Vue
    onUnmounted(() => {
      // Cancelar qualquer execução pendente
      if (debouncedFn.cancel) {
        debouncedFn.cancel()
      }
    })
  }
  
  return debouncedFn
}

/**
 * Debounce específico para operações de busca
 * @param {Function} searchFunction - Função de busca
 * @param {number} delay - Tempo de atraso (padrão: 300ms)
 * @returns {Function} - Função de busca com debounce
 */
export function debounceSearch(searchFunction, delay = 300) {
  return debounce(searchFunction, delay)
}

/**
 * Debounce específico para filtros
 * @param {Function} filterFunction - Função de filtro
 * @param {number} delay - Tempo de atraso (padrão: 150ms)
 * @returns {Function} - Função de filtro com debounce
 */
export function debounceFilter(filterFunction, delay = 150) {
  return debounce(filterFunction, delay)
}

/**
 * Cache simples para resultados de busca/filtro
 */
export class SearchCache {
  constructor(maxSize = 50, ttl = 5 * 60 * 1000) { // 5 minutos TTL
    this.cache = new Map()
    this.maxSize = maxSize
    this.ttl = ttl
  }
  
  get(key) {
    const item = this.cache.get(key)
    if (!item) return null
    
    // Verificar se expirou
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return item.value
  }
  
  set(key, value) {
    // Remover itens mais antigos se necessário
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
    
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    })
  }
  
  clear() {
    this.cache.clear()
  }
  
  has(key) {
    return this.cache.has(key) && this.get(key) !== null
  }
}

/**
 * Função utilitária para criar um sistema de busca otimizado
 * @param {Function} searchFn - Função de busca original
 * @param {Object} options - Opções de configuração
 * @returns {Object} - Sistema de busca otimizado
 */
export function createOptimizedSearch(searchFn, options = {}) {
  const {
    debounceDelay = 300,
    cacheSize = 50,
    cacheTTL = 5 * 60 * 1000
  } = options
  
  const cache = new SearchCache(cacheSize, cacheTTL)
  const debouncedSearch = debounce(async (query, ...args) => {
    const cacheKey = JSON.stringify({ query, args })
    
    // Verificar cache primeiro
    const cached = cache.get(cacheKey)
    if (cached) {
      return cached
    }
    
    // Executar busca
    const result = await searchFn(query, ...args)
    
    // Armazenar no cache
    cache.set(cacheKey, result)
    
    return result
  }, debounceDelay)
  
  return {
    search: debouncedSearch,
    clearCache: () => cache.clear(),
    cache
  }
}