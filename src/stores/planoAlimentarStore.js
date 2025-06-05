import { defineStore } from 'pinia'

export const usePlanoAlimentarStore = defineStore('planoAlimentar', {
  state: () => ({
    planoAtivo: JSON.parse(localStorage.getItem('planoAtivo') || 'null'),
    pesoUsuario: parseFloat(localStorage.getItem('pesoUsuario') || '0'),
    nivelAtividade: localStorage.getItem('nivelAtividade') || 'sedentario',
    refeicoes: JSON.parse(localStorage.getItem('refeicoes') || '[]'),
    // Valores customizados
    caloriasPorQuilo: parseFloat(localStorage.getItem('caloriasPorQuilo') || '32'),
    proteinasPorQuilo: parseFloat(localStorage.getItem('proteinasPorQuilo') || '1'),
    gorduraPorQuilo: parseFloat(localStorage.getItem('gorduraPorQuilo') || '1')
  }),
  
  getters: {
    // Cálculo de calorias diárias baseado no peso e nível de atividade
    caloriasDiarias: (state) => {
      if (state.nivelAtividade === 'customizado') {
        return state.pesoUsuario * state.caloriasPorQuilo
      }
      
      const multiplicadores = {
        sedentario: 30,
        moderado: 32,
        ativo: 35,
        atleta: 38
      }
      return state.pesoUsuario * multiplicadores[state.nivelAtividade]
    },
    
    // Proteínas diárias sugeridas
    proteinasDiarias: (state) => {
      if (state.nivelAtividade === 'customizado') {
        return state.pesoUsuario * state.proteinasPorQuilo
      }
      return state.pesoUsuario // 1g por kg de peso
    },
    
    // Gordura máxima diária
    gorduraMaxima: (state) => {
      if (state.nivelAtividade === 'customizado') {
        return state.pesoUsuario * state.gorduraPorQuilo
      }
      return state.pesoUsuario // 1g por kg de peso
    },
    
    // Total de calorias já alocadas baseado nas METAS das refeições
    caloriasAlocadas: (state) => {
      return state.refeicoes.reduce((total, refeicao) => {
        // Usar as metas planejadas das refeições, não os valores reais dos pratos
        return total + (refeicao.metaCalorias || 0)
      }, 0)
    },
    
    // Calorias restantes a serem alocadas
    caloriasRestantes: (state, getters) => {
      return getters.caloriasDiarias - getters.caloriasAlocadas
    },
    
    // Total de proteínas alocadas baseado nas METAS das refeições
    proteinasAlocadas: (state) => {
      return state.refeicoes.reduce((total, refeicao) => {
        // Usar as metas planejadas das refeições, não os valores reais dos pratos
        return total + (refeicao.metaProteinas || 0)
      }, 0)
    },
    
    // Total de gorduras alocadas - mantém cálculo real pois não há meta de gorduras por refeição
    gordurasAlocadas: (state) => {
      return state.refeicoes.reduce((total, refeicao) => {
        if (refeicao.pratos && refeicao.pratos.length > 0) {
          // Nova estrutura: usar o primeiro prato de cada refeição para o cálculo do total
          const primeiroPrato = refeicao.pratos[0]
          const gordurasRefeicao = primeiroPrato.alimentos.reduce((subtotal, item) => {
            return subtotal + (item.alimento.gordura * (item.porcao / item.alimento.porcaoReferencia))
          }, 0)
          return total + gordurasRefeicao
        } else {
          // Estrutura antiga (compatibilidade)
          const gordurasRefeicao = (refeicao.alimentos || []).reduce((subtotal, item) => {
            return subtotal + (item.alimento.gordura * (item.porcao / item.alimento.porcaoReferencia))
          }, 0)
          return total + gordurasRefeicao
        }
      }, 0)
    }
  },
  
  actions: {
    // Configurar dados do usuário
    configurarUsuario(peso, nivelAtividade, valoresCustomizados = null) {
      this.pesoUsuario = peso
      this.nivelAtividade = nivelAtividade
      localStorage.setItem('pesoUsuario', peso)
      localStorage.setItem('nivelAtividade', nivelAtividade)
      
      // Se são valores customizados, salva também os multiplicadores
      if (nivelAtividade === 'customizado' && valoresCustomizados) {
        this.caloriasPorQuilo = valoresCustomizados.caloriasPorQuilo
        this.proteinasPorQuilo = valoresCustomizados.proteinasPorQuilo
        this.gorduraPorQuilo = valoresCustomizados.gorduraPorQuilo
        localStorage.setItem('caloriasPorQuilo', valoresCustomizados.caloriasPorQuilo)
        localStorage.setItem('proteinasPorQuilo', valoresCustomizados.proteinasPorQuilo)
        localStorage.setItem('gorduraPorQuilo', valoresCustomizados.gorduraPorQuilo)
      }
    },
    
    // Adicionar uma refeição ao plano
    adicionarRefeicao(refeicao) {
      // Gera um ID único
      refeicao.id = Date.now().toString()
      
      // Garantir estrutura correta da refeição
      if (!refeicao.metaCalorias) refeicao.metaCalorias = 0
      if (!refeicao.metaProteinas) refeicao.metaProteinas = 0
      if (!refeicao.pratos) refeicao.pratos = []
      
      this.refeicoes.push(refeicao)
      this.salvarRefeicoes()
    },
    
    // Adicionar prato a uma refeição
    adicionarPrato(refeicaoId, prato) {
      const refeicao = this.refeicoes.find(r => r.id === refeicaoId)
      if (refeicao) {
        prato.id = Date.now().toString() + Math.random().toString(36).substr(2, 5)
        if (!prato.alimentos) prato.alimentos = []
        refeicao.pratos.push(prato)
        this.salvarRefeicoes()
      }
    },
    
    // Remover prato de uma refeição
    removerPrato(refeicaoId, pratoId) {
      const refeicao = this.refeicoes.find(r => r.id === refeicaoId)
      if (refeicao) {
        refeicao.pratos = refeicao.pratos.filter(p => p.id !== pratoId)
        this.salvarRefeicoes()
      }
    },
    
    // Atualizar prato existente
    atualizarPrato(refeicaoId, pratoAtualizado) {
      const refeicao = this.refeicoes.find(r => r.id === refeicaoId)
      if (refeicao) {
        const index = refeicao.pratos.findIndex(p => p.id === pratoAtualizado.id)
        if (index !== -1) {
          refeicao.pratos[index] = pratoAtualizado
          this.salvarRefeicoes()
        }
      }
    },
    
    // Calcular calorias de um prato
    calcularCaloriasPrato(prato) {
      return prato.alimentos.reduce((total, item) => {
        return total + (item.alimento.caloria * (item.porcao / item.alimento.porcaoReferencia))
      }, 0)
    },
    
    // Calcular proteínas de um prato
    calcularProteinasPrato(prato) {
      return prato.alimentos.reduce((total, item) => {
        return total + (item.alimento.proteina * (item.porcao / item.alimento.porcaoReferencia))
      }, 0)
    },
    
    // Atualizar uma refeição existente
    atualizarRefeicao(refeicaoAtualizada) {
      const index = this.refeicoes.findIndex(r => r.id === refeicaoAtualizada.id)
      if (index !== -1) {
        this.refeicoes[index] = refeicaoAtualizada
        this.salvarRefeicoes()
      }
    },
    
    // Remover uma refeição
    removerRefeicao(id) {
      this.refeicoes = this.refeicoes.filter(r => r.id !== id)
      this.salvarRefeicoes()
    },
    
    // Adicionar alimento a uma refeição
    adicionarAlimentoRefeicao(refeicaoId, alimento, porcao) {
      const refeicao = this.refeicoes.find(r => r.id === refeicaoId)
      if (refeicao) {
        refeicao.alimentos.push({
          alimento,
          porcao
        })
        this.salvarRefeicoes()
      }
    },
    
    // Remover alimento de uma refeição
    removerAlimentoRefeicao(refeicaoId, index) {
      const refeicao = this.refeicoes.find(r => r.id === refeicaoId)
      if (refeicao) {
        refeicao.alimentos.splice(index, 1)
        this.salvarRefeicoes()
      }
    },
    
    // Salvar refeições no localStorage
    salvarRefeicoes() {
      localStorage.setItem('refeicoes', JSON.stringify(this.refeicoes))
    },
    
    // Salvar plano ativo no localStorage
    salvarPlanoAtivo() {
      localStorage.setItem('planoAtivo', JSON.stringify(this.planoAtivo))
    },

    // Calcular porção proporcional para manter as mesmas calorias
    calcularPorcaoProporcional(alimentoOriginal, porcaoOriginal, alimentoSubstituto) {
      const caloriasOriginais = (alimentoOriginal.caloria * porcaoOriginal) / alimentoOriginal.porcaoReferencia
      const porcaoSubstituta = (caloriasOriginais * alimentoSubstituto.porcaoReferencia) / alimentoSubstituto.caloria
      return Math.round(porcaoSubstituta * 10) / 10 // Arredondar para 1 casa decimal
    },

    // Substituir alimento em uma refeição mantendo as calorias
    substituirAlimentoRefeicao(refeicaoId, indexAlimento, novoAlimento) {
      const refeicao = this.refeicoes.find(r => r.id === refeicaoId)
      if (refeicao && refeicao.alimentos[indexAlimento]) {
        const alimentoAtual = refeicao.alimentos[indexAlimento]
        const novaPorcao = this.calcularPorcaoProporcional(
          alimentoAtual.alimento, 
          alimentoAtual.porcao, 
          novoAlimento
        )
        
        refeicao.alimentos[indexAlimento] = {
          alimento: novoAlimento,
          porcao: novaPorcao,
          alimentoReferencia: alimentoAtual.alimentoReferencia || alimentoAtual.alimento,
          porcaoReferencia: alimentoAtual.porcaoReferencia || alimentoAtual.porcao,
          substituivel: true
        }
        
        this.salvarRefeicoes()
      }
    },

    // Adicionar alimento substituível a uma refeição
    adicionarAlimentoSubstituivel(refeicaoId, alimento, porcao, substituivel = false) {
      const refeicao = this.refeicoes.find(r => r.id === refeicaoId)
      if (refeicao) {
        const itemAlimento = {
          alimento,
          porcao,
          substituivel
        }

        // Se é substituível, salvar como referência
        if (substituivel) {
          itemAlimento.alimentoReferencia = alimento
          itemAlimento.porcaoReferencia = porcao
        }

        refeicao.alimentos.push(itemAlimento)
        this.salvarRefeicoes()
      }
    }
  }
}) 