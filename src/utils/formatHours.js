// Função para converter horas decimais para minutos
export function hoursToMinutes(decimalHours) {
  if (!decimalHours) return 0
  const hours = parseFloat(decimalHours)
  return Math.round(hours * 60)
}

// Função para converter minutos para horas decimais
export function minutesToHours(minutes) {
  if (!minutes) return '0.00'
  const hours = minutes / 60
  return hours.toFixed(2)
}

// Função para formatar horas decimais para "X horas e Y minutos"
export function formatHoursToText(decimalHours) {
  if (!decimalHours || decimalHours === 0) {
    return '0 horas'
  }
  
  const totalHours = parseFloat(decimalHours)
  if (isNaN(totalHours)) {
    return '0 horas'
  }
  
  // Converter formato H.MM para minutos totais
  const hours = Math.floor(totalHours)
  const decimalPart = totalHours - hours
  const minutes = Math.round(decimalPart * 60)
  
  if (hours === 0 && minutes === 0) {
    return '0 horas'
  } else if (hours === 0) {
    return `${minutes} minuto${minutes !== 1 ? 's' : ''}`
  } else if (minutes === 0) {
    return `${hours} hora${hours !== 1 ? 's' : ''}`
  } else {
    return `${hours} hora${hours !== 1 ? 's' : ''} e ${minutes} minuto${minutes !== 1 ? 's' : ''}`
  }
}

// Função para formatar horas decimais para "X horas e Y minutos" (versão curta)
export function formatHoursToShortText(decimalHours) {
  if (!decimalHours || decimalHours === 0) {
    return '0h'
  }
  
  const totalHours = parseFloat(decimalHours)
  if (isNaN(totalHours)) {
    return '0h'
  }
  
  // Converter formato H.MM para minutos totais
  const hours = Math.floor(totalHours)
  const decimalPart = totalHours - hours
  const minutes = Math.round(decimalPart * 60)
  
  if (hours === 0 && minutes === 0) {
    return '0h'
  } else if (hours === 0) {
    return `${minutes}min`
  } else if (minutes === 0) {
    return `${hours}h`
  } else {
    return `${hours}h${minutes}min`
  }
}