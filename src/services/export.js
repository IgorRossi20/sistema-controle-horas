import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { formatDateBR } from '../utils/formatHours'
import { Chart, registerables } from 'chart.js'

// Registrar todos os componentes do Chart.js
Chart.register(...registerables)

// Serviço para exportação de relatórios
export const exportService = {
  // Exportar para PDF
  exportToPDF(data, title, headers, fileName = 'relatorio.pdf') {
    try {
      const doc = new jsPDF()
      
      // Adicionar título
      doc.setFontSize(18)
      doc.text(title, 14, 22)
      
      // Adicionar data de geração
      doc.setFontSize(11)
      doc.setTextColor(100)
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 30)
      
      // Calcular total das horas
      const totalHours = this.calculateTotalHours(data)
      
      // Preparar dados para a tabela
      const tableData = data.map(item => {
        return headers.map(header => item[header.key])
      })
      
      // Adicionar linha de total
      const totalRow = headers.map(header => {
        if (header.key === 'horas') {
          return totalHours
        } else if (header.key === 'data' || header.key === 'atividade') {
          return 'TOTAL GERAL:'
        } else {
          return ''
        }
      })
      tableData.push(totalRow)
      
      // Criar tabela
      doc.autoTable({
        startY: 40,
        head: [headers.map(header => header.label)],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [13, 110, 253],
          textColor: 255,
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 10,
          cellPadding: 3
        },
        columnStyles: {
          0: { cellWidth: 'auto' }
        },
        margin: { top: 40 },
        didParseCell: function(data) {
          // Destacar a linha de total
          if (data.row.index === tableData.length - 1) {
            data.cell.styles.fillColor = [220, 220, 220]
            data.cell.styles.fontStyle = 'bold'
            data.cell.styles.textColor = [0, 0, 0]
          }
        }
      })
      
      // Adicionar assinatura no final da última página
      const finalY = doc.lastAutoTable.finalY || 40
      const pageHeight = doc.internal.pageSize.getHeight()
      
      // Verificar se há espaço suficiente para a assinatura
      if (finalY + 40 > pageHeight - 30) {
        doc.addPage()
      }
      
      // Adicionar linha separadora
      const currentY = doc.lastAutoTable.finalY ? doc.lastAutoTable.finalY + 20 : 60
      doc.setLineWidth(0.5)
      doc.setDrawColor(200, 200, 200)
      doc.line(14, currentY, doc.internal.pageSize.getWidth() - 14, currentY)
      
      // Adicionar assinatura
      doc.setFontSize(12)
      doc.setTextColor(80)
      doc.text(
        'Relatório de horas PJ - Igor Rossi Nunes',
        doc.internal.pageSize.getWidth() / 2,
        currentY + 15,
        { align: 'center' }
      )
      
      // Adicionar rodapé com numeração de páginas
      const pageCount = doc.internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(10)
        doc.setTextColor(150)
        doc.text(
          `Página ${i} de ${pageCount}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        )
      }
      
      // Salvar o PDF
      doc.save(fileName)
      
      return true
    } catch (error) {
      console.error('Erro ao exportar para PDF:', error)
      throw error
    }
  },

  // Exportar relatório detalhado por dia para PDF com formatação especial
  async exportDetailedDailyToPDF(data, title, fileName = 'relatorio-detalhado.pdf', timeEntries = [], projects = []) {
    try {
      const doc = new jsPDF()
      let currentY = 20
      
      // Adicionar título principal
      doc.setFontSize(20)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(13, 110, 253)
      doc.text(title, 14, currentY)
      currentY += 15
      
      // Adicionar data de geração
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100)
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, currentY)
      currentY += 20
      
      // Calcular total geral usando a função existente
      const totalFormatted = this.calculateTotalHours(data.filter(item => item.tipo === 'entrada'))
      
      // Adicionar total geral destacado
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 128, 0)
      doc.text(`TOTAL GERAL: ${totalFormatted}`, 14, currentY)
      currentY += 25
      
      // Armazenar dados do gráfico para adicionar no final
      let chartImage = null
      if (timeEntries && timeEntries.length > 0 && projects && projects.length > 0) {
        chartImage = await this.generatePieChart(timeEntries, projects)
      }
      
      // Processar dados por dia
      let currentDay = null
      let currentProject = null
      
      data.forEach((item, index) => {
        // Verificar se precisa de nova página
        if (currentY > 250) {
          doc.addPage()
          currentY = 20
        }
        
        switch (item.tipo) {
          case 'cabecalho_dia':
            // Cabeçalho do dia
            if (currentDay !== null) {
              currentY += 10 // Espaço entre dias
            }
            
            // Fundo azul para o dia
            doc.setFillColor(13, 110, 253)
            doc.rect(14, currentY - 5, doc.internal.pageSize.getWidth() - 28, 12, 'F')
            
            doc.setFontSize(12)
            doc.setFont('helvetica', 'bold')
            doc.setTextColor(255, 255, 255)
            doc.text(item.data, 16, currentY + 3)
            // Converter horas para formato h min se necessário
            const hours = parseFloat(item.horas || 0)
            const totalHours = Math.floor(hours)
            const totalMinutes = Math.round((hours - totalHours) * 60)
            const hoursText = totalMinutes > 0 ? `${totalHours}h ${totalMinutes}min` : `${totalHours}h`
            const hoursTextWidth = doc.getTextWidth(hoursText)
            doc.text(hoursText, doc.internal.pageSize.getWidth() - hoursTextWidth - 20, currentY + 3)
            currentY += 15
            currentDay = item.data
            break
            
          case 'cabecalho_atividade':
            // Cabeçalho da atividade
            doc.setFillColor(240, 240, 240)
            doc.rect(20, currentY - 3, doc.internal.pageSize.getWidth() - 40, 10, 'F')
            
            doc.setFontSize(11)
            doc.setFont('helvetica', 'bold')
            doc.setTextColor(60, 60, 60)
            doc.text(`${item.atividade}`, 22, currentY + 3)
            // Converter horas para formato h min se necessário
            const projectHours = parseFloat(item.horas || 0)
            const projectTotalHours = Math.floor(projectHours)
            const projectTotalMinutes = Math.round((projectHours - projectTotalHours) * 60)
            const projectHoursText = projectTotalMinutes > 0 ? `${projectTotalHours}h ${projectTotalMinutes}min` : `${projectTotalHours}h`
            const projectHoursTextWidth = doc.getTextWidth(projectHoursText)
            doc.text(projectHoursText, doc.internal.pageSize.getWidth() - projectHoursTextWidth - 20, currentY + 3)
            currentY += 12
            currentProject = item.atividade
            break
            
          case 'entrada':
            // Entrada individual
            doc.setFontSize(10)
            doc.setFont('helvetica', 'normal')
            doc.setTextColor(80, 80, 80)
            
            // Montar texto: "Atividade - Descrição DAS HH:MM AS HH:MM"
            const leftTextBase = `${item.atividade ? item.atividade + ' - ' : ''}${item.descricao || ''}`
            const timeRange = (item.startTime && item.endTime) 
              ? ` DAS ${item.startTime} AS ${item.endTime}` 
              : ''
            const fullLeftText = `${leftTextBase}${timeRange}`.trim()
            
            // Quebrar linhas conforme largura disponível
            const maxWidth = doc.internal.pageSize.getWidth() - 80
            const descricaoLines = doc.splitTextToSize(fullLeftText, maxWidth)
            
            descricaoLines.forEach((line, lineIndex) => {
              if (currentY > 250) {
                doc.addPage()
                currentY = 20
              }
              doc.text(line, 26, currentY + 3)
              if (lineIndex === 0) {
                // Horas na primeira linha
                doc.setFont('helvetica', 'bold')
                const entryHours = parseFloat(item.horas || 0)
                const entryTotalHours = Math.floor(entryHours)
                const entryTotalMinutes = Math.round((entryHours - entryTotalHours) * 60)
                const entryHoursText = entryTotalMinutes > 0 ? `${entryTotalHours}h ${entryTotalMinutes}min` : `${entryTotalHours}h`
                const entryHoursTextWidth = doc.getTextWidth(entryHoursText)
                doc.text(entryHoursText, doc.internal.pageSize.getWidth() - entryHoursTextWidth - 20, currentY + 3)
                doc.setFont('helvetica', 'normal')
              }
              currentY += 8
            })
            break
            
          case 'separador':
            // Espaço entre dias sem linha separadora
            currentY += 15
            break
        }
      })
      
      // Adicionar assinatura no final
      if (currentY > 230) {
        doc.addPage()
        currentY = 20
      }
      
      currentY += 20
      doc.setLineWidth(0.5)
      doc.setDrawColor(200, 200, 200)
      doc.line(14, currentY, doc.internal.pageSize.getWidth() - 14, currentY)
      
      doc.setFontSize(12)
      doc.setFont('helvetica', 'italic')
      doc.setTextColor(80)
      doc.text(
        'Relatório de horas PJ - Igor Rossi Nunes',
        doc.internal.pageSize.getWidth() / 2,
        currentY + 15,
        { align: 'center' }
      )
      
      // Adicionar gráfico na última página
      if (chartImage) {
        doc.addPage()
        currentY = 20
        
        // Adicionar título do gráfico
        doc.setFontSize(16)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(13, 110, 253)
        doc.text('Distribuição por Atividade', 14, currentY)
        currentY += 25
        
        // Adicionar o gráfico (redimensionado para caber na página)
        const imgWidth = 160
        const imgHeight = 160
        const imgX = (doc.internal.pageSize.getWidth() - imgWidth) / 2
        
        doc.addImage(chartImage, 'PNG', imgX, currentY, imgWidth, imgHeight)
      }
      
      // Adicionar numeração de páginas
      const pageCount = doc.internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(10)
        doc.setTextColor(150)
        doc.text(
          `Página ${i} de ${pageCount}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        )
      }
      
      // Salvar o PDF
      doc.save(fileName)
      
      return true
    } catch (error) {
      console.error('Erro ao exportar relatório detalhado para PDF:', error)
      throw error
    }
  },

  // Exportar para Excel
  exportToExcel(data, sheetName = 'Relatório', fileName = 'relatorio.xlsx') {
    try {
      // Calcular total das horas
      const totalHours = this.calculateTotalHours(data)
      
      // Adicionar linha de total aos dados
      const dataWithTotal = [...data]
      
      // Criar linha de total baseada na estrutura dos dados
      const totalRow = {}
      if (data.length > 0) {
        const firstItem = data[0]
        Object.keys(firstItem).forEach(key => {
          if (key === 'horas') {
            totalRow[key] = totalHours
          } else if (key === 'data' || key === 'atividade') {
            totalRow[key] = 'TOTAL GERAL:'
          } else {
            totalRow[key] = ''
          }
        })
        dataWithTotal.push(totalRow)
      }
      
      // Criar uma nova planilha
      const worksheet = XLSX.utils.json_to_sheet(dataWithTotal)
      
      // Criar um novo livro
      const workbook = XLSX.utils.book_new()
      
      // Adicionar a planilha ao livro
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
      
      // Salvar o arquivo
      XLSX.writeFile(workbook, fileName)
      
      return true
    } catch (error) {
      console.error('Erro ao exportar para Excel:', error)
      throw error
    }
  },
  
  // Formatar dados para relatório mensal
  formatMonthlyReport(timeEntries, projects) {
    // Agrupar entradas por atividade
      const groupedEntries = {}
    
    timeEntries.forEach(entry => {
      const projectId = entry.projectId
      
      if (!groupedEntries[projectId]) {
        groupedEntries[projectId] = {
          entries: [],
          totalHours: 0
        }
      }
      
      groupedEntries[projectId].entries.push(entry)
      groupedEntries[projectId].totalHours += parseFloat(entry.hours)
    })
    
    // Formatar dados para relatório
    const reportData = []
    
    Object.keys(groupedEntries).forEach(projectId => {
      const project = projects.find(p => p.id === projectId)
      const projectName = project ? project.name : 'Atividade Desconhecida'
      const { entries, totalHours } = groupedEntries[projectId]
      
      // Adicionar linha de resumo da atividade
      reportData.push({
        atividade: projectName,
        data: '',
        descricao: `Total de horas: ${totalHours.toFixed(2)}`,
        horas: totalHours.toFixed(2),
        tipo: 'resumo'
      })
      
      // Adicionar entradas detalhadas
      entries.forEach(entry => {
        const formattedDate = formatDateBR(entry.date)
        
        reportData.push({
          atividade: projectName,
          data: formattedDate,
          descricao: entry.description,
          horas: parseFloat(entry.hours).toFixed(2),
          tipo: 'detalhe'
        })
      })
    })
    
    return reportData
  },

  // Formatar dados para relatório resumido por dia
  formatDailyReport(timeEntries, projects) {
    // Agrupar entradas por data
    const groupedByDate = {}
    
    timeEntries.forEach(entry => {
      const formattedDate = formatDateBR(entry.date)
      
      if (!groupedByDate[formattedDate]) {
        groupedByDate[formattedDate] = {
          entries: [],
          totalHours: 0,
          projects: new Set()
        }
      }
      
      groupedByDate[formattedDate].entries.push(entry)
      groupedByDate[formattedDate].totalHours += parseFloat(entry.hours)
      groupedByDate[formattedDate].projects.add(entry.projectId)
    })
    
    // Formatar dados para relatório
    const reportData = []
    
    // Ordenar datas
    const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
      const dateA = new Date(a.split('/').reverse().join('-'))
      const dateB = new Date(b.split('/').reverse().join('-'))
      return dateB - dateA
    })
    
    sortedDates.forEach(date => {
      const dayData = groupedByDate[date]
      
      // Obter nomes das atividades únicas do dia
      const projectNames = Array.from(dayData.projects).map(projectId => {
        const project = projects.find(p => p.id === projectId)
        return project ? project.name : 'Atividade Desconhecida'
      }).join(', ')
      
      // Criar descrição resumida das atividades
      const descriptions = dayData.entries.map(entry => entry.description).filter(desc => desc && desc.trim())
      const uniqueDescriptions = [...new Set(descriptions)]
      const resumedDescription = uniqueDescriptions.length > 0 
        ? uniqueDescriptions.slice(0, 3).join('; ') + (uniqueDescriptions.length > 3 ? '...' : '')
        : 'Atividades diversas'
      
      reportData.push({
        data: date,
        atividade: projectNames,
        descricao: resumedDescription,
        horas: dayData.totalHours.toFixed(2),
        quantidade_registros: dayData.entries.length,
        tipo: 'resumo_diario'
      })
    })
    
    return reportData
  },

  // Formatar relatório detalhado por dia
  formatDetailedDailyReport(timeEntries, projects) {
    // Agrupar entradas por data e depois por atividade
    const groupedByDate = {}
    
    timeEntries.forEach(entry => {
      const formattedDate = formatDateBR(entry.date)
      
      if (!groupedByDate[formattedDate]) {
        groupedByDate[formattedDate] = {
          projects: {},
          totalHours: 0
        }
      }
      
      // Agrupar por atividade dentro do dia
      if (!groupedByDate[formattedDate].projects[entry.projectId]) {
        groupedByDate[formattedDate].projects[entry.projectId] = {
          entries: [],
          totalHours: 0
        }
      }
      
      groupedByDate[formattedDate].projects[entry.projectId].entries.push(entry)
      groupedByDate[formattedDate].projects[entry.projectId].totalHours += parseFloat(entry.hours)
      groupedByDate[formattedDate].totalHours += parseFloat(entry.hours)
    })
    
    // Formatar dados para relatório
    const reportData = []
    
    // Ordenar datas
    const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
      const dateA = new Date(a.split('/').reverse().join('-'))
      const dateB = new Date(b.split('/').reverse().join('-'))
      return dateB - dateA
    })
    
    sortedDates.forEach(date => {
      const dayData = groupedByDate[date]
      
      // Adicionar cabeçalho do dia
      reportData.push({
        data: `${date}`,
        atividade: '',
        descricao: 'TOTAL DO DIA',
        horas: dayData.totalHours.toFixed(2),
        tipo: 'cabecalho_dia'
      })
      
      // Adicionar dados de cada atividade do dia
      Object.keys(dayData.projects).forEach(projectId => {
        const projectData = dayData.projects[projectId]
        const project = projects.find(p => p.id === projectId)
        const projectName = project ? project.name : 'Atividade Desconhecida'
        
        // Adicionar cabeçalho da atividade
        reportData.push({
          data: '',
          atividade: projectName,
          descricao: 'TOTAL DA ATIVIDADE',
          horas: projectData.totalHours.toFixed(2),
          tipo: 'cabecalho_atividade'
        })
        
        // Adicionar cada entrada da atividade
        projectData.entries.forEach(entry => {
          reportData.push({
            data: '',
            // Incluir o nome da atividade na entrada para impressão detalhada
            atividade: projectName,
            descricao: entry.description,
            horas: parseFloat(entry.hours).toFixed(2),
            // Incluir intervalo de horário quando disponível
            startTime: entry.startTime || '',
            endTime: entry.endTime || '',
            tipo: 'entrada'
          })
        })
      })

      // Não adicionar linha separadora para evitar linhas com apenas '-' no relatório
    })
    
    return reportData
  },

  // Gerar gráfico de pizza para distribuição de horas por atividade
  async generatePieChart(timeEntries, projects) {
    try {
      // Agrupar dados por atividade
      const projectHours = {}
      
      timeEntries.forEach(entry => {
        const projectId = entry.projectId
        const hours = parseFloat(entry.hours)
        
        if (!projectHours[projectId]) {
          projectHours[projectId] = 0
        }
        projectHours[projectId] += hours
      })
      
      // Calcular total de horas para porcentagens
      const totalHours = Object.values(projectHours).reduce((sum, hours) => sum + hours, 0)
      
      // Preparar dados para o gráfico
      const labels = []
      const data = []
      const percentages = []
      const backgroundColor = [
        '#FF6384',
        '#36A2EB', 
        '#FFCE56',
        '#4BC0C0',
        '#9966FF',
        '#FF9F40',
        '#FF8C69',
        '#C9CBCF',
        '#98D8C8',
        '#F7DC6F'
      ]
      
      // Ordenar atividades por horas (maior para menor)
      const sortedProjects = Object.entries(projectHours)
        .sort(([,a], [,b]) => b - a)
      
      sortedProjects.forEach(([projectId, hours]) => {
        const project = projects.find(p => p.id === projectId)
        const projectName = project ? project.name : 'Atividade Desconhecida'
        const percentage = ((hours / totalHours) * 100).toFixed(1)
        
        labels.push(`${projectName} (${percentage}%)`)
        data.push(hours)
        percentages.push(percentage)
      })
      
      // Criar canvas temporário para gerar o gráfico
      const canvas = document.createElement('canvas')
      canvas.width = 600
      canvas.height = Math.max(400, labels.length * 40 + 100)
      const ctx = canvas.getContext('2d')
      
      // Configurar o gráfico de barras horizontais
      const chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Horas',
            data: data,
            backgroundColor: backgroundColor.slice(0, data.length),
            borderWidth: 1,
            borderColor: '#ffffff'
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: false,
          plugins: {
            legend: {
              display: false
            },
            title: {
              display: true,
              text: 'Distribuição por atividade',
              font: {
                size: 16,
                weight: 'bold'
              },
              padding: {
                top: 10,
                bottom: 20
              }
            }
          },
          scales: {
            x: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Horas'
              }
            },
            y: {
               title: {
                 display: true,
                 text: 'Atividades'
               }
             }
          }
        }
      })
      
      // Aguardar a renderização do gráfico
      await new Promise(resolve => {
        chart.update()
        setTimeout(() => {
          resolve()
        }, 100)
      })
      
      // Converter canvas para imagem base64
      const imageData = canvas.toDataURL('image/png')
      
      // Destruir o gráfico para liberar memória
      chart.destroy()
      
      return imageData
    } catch (error) {
      console.error('Erro ao gerar gráfico de pizza:', error)
      return null
    }
  },

  // Calcular total das horas
  calculateTotalHours(data) {
    if (!data || !Array.isArray(data)) {
      return '0,00'
    }
    
    const total = data.reduce((sum, item) => {
      const hours = parseFloat(item.horas || 0)
      return sum + (isNaN(hours) ? 0 : hours)
    }, 0)
    
    // Converter para horas e minutos
    const totalHours = Math.floor(total)
    const totalMinutes = Math.round((total - totalHours) * 60)
    
    return `${totalHours}h ${totalMinutes.toString().padStart(2, '0')}min`
  }
}