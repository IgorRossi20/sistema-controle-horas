# Explicação do Cálculo de Horas

## Como funciona o sistema de horas

O sistema usa um formato especial para armazenar horas: **H.MM** onde:
- **H** = horas inteiras
- **MM** = minutos convertidos para centésimos (não são minutos reais!)

## Exemplo prático: "24.90 horas"

### Interpretação CORRETA:
- **24** = 24 horas completas
- **.90** = 90 centésimos = 90% de uma hora = 54 minutos
- **Total**: 24 horas e 54 minutos

### Como é calculado:
```javascript
// Exemplo: 1h30min de trabalho
const totalMinutes = 90; // 1h30min = 90 minutos
const hours = Math.floor(totalMinutes / 60); // 1 hora
const minutes = totalMinutes % 60; // 30 minutos

// Conversão para formato H.MM
const result = hours + (minutes / 100);
// result = 1 + (30/100) = 1 + 0.30 = 1.30
```

## Tabela de Conversão (Minutos → Centésimos)

| Minutos | Centésimos | Formato H.MM |
|---------|------------|-------------|
| 0 min   | .00        | X.00        |
| 6 min   | .10        | X.10        |
| 12 min  | .20        | X.20        |
| 15 min  | .25        | X.25        |
| 18 min  | .30        | X.30        |
| 24 min  | .40        | X.40        |
| 30 min  | .50        | X.50        |
| 36 min  | .60        | X.60        |
| 45 min  | .75        | X.75        |
| 54 min  | .90        | X.90        |
| 60 min  | 1.00       | (X+1).00    |

## Exemplos Reais:

- **8.25 horas** = 8h + 25% de 1h = 8h15min
- **4.50 horas** = 4h + 50% de 1h = 4h30min
- **24.90 horas** = 24h + 90% de 1h = 24h54min
- **1.75 horas** = 1h + 75% de 1h = 1h45min

## Por que esse formato?

Este formato permite:
1. **Cálculos matemáticos simples**: somar 8.25 + 4.50 = 12.75
2. **Armazenamento como decimal**: compatível com bancos de dados
3. **Precisão**: mantém os minutos exatos sem arredondamentos

## Conversão de volta para H:MM

Para exibir no formato tradicional:
```javascript
function formatHoursToHMM(decimalHours) {
  const hours = Math.floor(decimalHours);
  const minutes = Math.round((decimalHours - hours) * 60);
  return `${hours}h${minutes.toString().padStart(2, '0')}min`;
}

// Exemplo:
formatHoursToHMM(24.90); // "24h54min"
formatHoursToHMM(8.25);  // "8h15min"
```

## Resumo

**"24.90 horas" = 24 horas e 54 minutos**

Não são "90 minutos", mas sim 90% de uma hora (54 minutos)!