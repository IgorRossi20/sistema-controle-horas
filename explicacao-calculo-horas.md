# Explicação do Cálculo de Horas

## Como funciona o sistema de horas

O sistema usa **horas decimais** para armazenar e calcular tempo:
- **Formato**: Horas decimais (ex: 1.5 = 1h30min)
- **Cálculo**: totalMinutos ÷ 60 = horas decimais

## Exemplo prático: "1.5 horas"

### Interpretação CORRETA:
- **1.5** = 1 hora e meia
- **Total**: 1 hora e 30 minutos

### Como é calculado:
```javascript
// Exemplo: 1h30min de trabalho
const totalMinutes = 90; // 1h30min = 90 minutos

// Conversão para horas decimais
const hoursDecimal = totalMinutes / 60;
// hoursDecimal = 90 / 60 = 1.5
```

## Tabela de Conversão (Minutos → Horas Decimais)

| Minutos | Horas Decimais | Explicação |
|---------|----------------|------------|
| 0 min   | 0.00          | 0 ÷ 60 = 0.00 |
| 15 min  | 0.25          | 15 ÷ 60 = 0.25 |
| 30 min  | 0.50          | 30 ÷ 60 = 0.50 |
| 45 min  | 0.75          | 45 ÷ 60 = 0.75 |
| 60 min  | 1.00          | 60 ÷ 60 = 1.00 |
| 90 min  | 1.50          | 90 ÷ 60 = 1.50 |
| 120 min | 2.00          | 120 ÷ 60 = 2.00 |
| 150 min | 2.50          | 150 ÷ 60 = 2.50 |

## Exemplos Reais:

- **0.50 horas** = 30 minutos
- **1.00 horas** = 1 hora
- **1.50 horas** = 1 hora e 30 minutos
- **2.25 horas** = 2 horas e 15 minutos
- **8.75 horas** = 8 horas e 45 minutos

## Fórmulas de Conversão:

```javascript
// Minutos para horas decimais
function minutesToHours(minutes) {
  return (minutes / 60).toFixed(2);
}

// Horas decimais para minutos
function hoursToMinutes(hoursDecimal) {
  return parseFloat(hoursDecimal) * 60;
}
```

## Por que esse formato?

Este formato permite:
1. **Cálculos matemáticos simples**: somar 1.50 + 2.25 = 3.75 horas
2. **Armazenamento como decimal**: compatível com bancos de dados
3. **Precisão**: mantém os minutos exatos sem arredondamentos
4. **Padrão internacional**: amplamente usado em sistemas de controle de horas

## Conversão para exibição H:MM

Para exibir no formato tradicional:
```javascript
function formatHoursToHMM(decimalHours) {
  const hours = Math.floor(decimalHours);
  const minutes = Math.round((decimalHours - hours) * 60);
  return `${hours}h${minutes.toString().padStart(2, '0')}min`;
}

// Exemplos:
// formatHoursToHMM(1.50) = "1h30min"
// formatHoursToHMM(2.25) = "2h15min"
// formatHoursToHMM(0.75) = "0h45min"
// formatHoursToHMM(8.50) = "8h30min"
```

## Resumo

O sistema agora usa **horas decimais** para todos os cálculos:
- **1.50 horas** = 1 hora e 30 minutos
- **2.25 horas** = 2 horas e 15 minutos
- **0.75 horas** = 45 minutos

Fórmula simples: **minutos ÷ 60 = horas decimais**