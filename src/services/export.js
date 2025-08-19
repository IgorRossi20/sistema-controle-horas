import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'

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
      
      // Preparar dados para a tabela
      const tableData = data.map(item => {
        return headers.map(header => item[header.key])
      })
      
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
        margin: { top: 40 }
      })
      
      // Adicionar rodapé
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
  
  // Exportar para Excel
  exportToExcel(data, sheetName = 'Relatório', fileName = 'relatorio.xlsx') {
    try {
      // Criar uma nova planilha
      const worksheet = XLSX.utils.json_to_sheet(data)
      
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
    // Agrupar entradas por projeto
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
      const projectName = project ? project.name : 'Projeto Desconhecido'
      const { entries, totalHours } = groupedEntries[projectId]
      
      // Adicionar linha de resumo do projeto
      reportData.push({
        projeto: projectName,
        data: '',
        descricao: `Total de horas: ${totalHours.toFixed(2)}`,
        horas: totalHours.toFixed(2),
        tipo: 'resumo'
      })
      
      // Adicionar entradas detalhadas
      entries.forEach(entry => {
        let formattedDate
        if (entry.date instanceof Date) {
          formattedDate = entry.date.toLocaleDateString('pt-BR')
        } else if (typeof entry.date === 'string') {
          formattedDate = new Date(entry.date).toLocaleDateString('pt-BR')
        } else if (entry.date && entry.date.seconds) {
          formattedDate = new Date(entry.date.seconds * 1000).toLocaleDateString('pt-BR')
        } else {
          const d = new Date(entry.date)
          formattedDate = isNaN(d.getTime()) ? 'Data inválida' : d.toLocaleDateString('pt-BR')
        }
        
        reportData.push({
          projeto: projectName,
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
      let formattedDate
      if (entry.date instanceof Date) {
        formattedDate = entry.date.toLocaleDateString('pt-BR')
      } else if (typeof entry.date === 'string') {
        formattedDate = new Date(entry.date).toLocaleDateString('pt-BR')
      } else if (entry.date && entry.date.seconds) {
        formattedDate = new Date(entry.date.seconds * 1000).toLocaleDateString('pt-BR')
      } else {
        const d = new Date(entry.date)
        formattedDate = isNaN(d.getTime()) ? 'Data inválida' : d.toLocaleDateString('pt-BR')
      }
      
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
      
      // Obter nomes dos projetos únicos do dia
      const projectNames = Array.from(dayData.projects).map(projectId => {
        const project = projects.find(p => p.id === projectId)
        return project ? project.name : 'Projeto Desconhecido'
      }).join(', ')
      
      // Criar descrição resumida das atividades
      const descriptions = dayData.entries.map(entry => entry.description).filter(desc => desc && desc.trim())
      const uniqueDescriptions = [...new Set(descriptions)]
      const resumedDescription = uniqueDescriptions.length > 0 
        ? uniqueDescriptions.slice(0, 3).join('; ') + (uniqueDescriptions.length > 3 ? '...' : '')
        : 'Atividades diversas'
      
      reportData.push({
        data: date,
        projeto: projectNames,
        descricao: resumedDescription,
        horas: dayData.totalHours.toFixed(2),
        quantidade_registros: dayData.entries.length,
        tipo: 'resumo_diario'
      })
    })
    
    return reportData
  }
}