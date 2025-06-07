import { defineStore } from 'pinia'

export const useAlimentosStore = defineStore('alimentos', {
  state: () => ({
    alimentos: JSON.parse(localStorage.getItem('alimentos') || '[]')
  }),
  
  getters: {
    getAlimentoById: (state) => (id) => {
      return state.alimentos.find(alimento => alimento.id === id)
    },
    
    getAlimentosByTipo: (state) => (tipo) => {
      return state.alimentos.filter(alimento => alimento.tipo === tipo)
    },
    
    getTiposAlimentos: (state) => {
      const tipos = new Set(state.alimentos.map(alimento => alimento.tipo))
      return Array.from(tipos)
    },

    // Obter substitutos possíveis para um alimento (mesmo tipo, exceto ele mesmo)
    getSubstitutosPossiveis: (state) => (alimento) => {
      const substitutos = state.alimentos.filter(a => 
        a.tipo === alimento.tipo && a.id !== alimento.id
      );
      
      // Ordenar por similaridade (distância vetorial) - menor distância = mais similar
      return substitutos.sort((a, b) => {
        const similaridadeA = calcularSimilaridade(alimento, a);
        const similaridadeB = calcularSimilaridade(alimento, b);
        return similaridadeA - similaridadeB;
      });
    }
  },
  
  actions: {
    adicionarAlimento(alimento) {
      const novoAlimento = {
        id: Date.now().toString(),
        nome: alimento.nome,
        tipo: alimento.tipo,
        caloria: alimento.caloria,
        proteina: alimento.proteina,
        carboidrato: alimento.carboidrato,
        gordura: alimento.gordura,
        porcaoReferencia: alimento.porcaoReferencia,
        discreto: alimento.discreto,
        gramaPorUnidade: alimento.gramaPorUnidade,
        rotuloPorcao: alimento.rotuloPorcao || 'unidade',
        rotuloPorcaoCustom: alimento.rotuloPorcaoCustom || ''
      };
      this.alimentos.push(novoAlimento)
      this.salvarNoLocalStorage()
    },
    
    importarAlimentos(alimentos) {
      // Verificar duplicados por nome
      const nomesExistentes = new Set(this.alimentos.map(a => a.nome.toLowerCase().trim()));
      
      let importados = 0;
      let duplicados = 0;
      
      alimentos.forEach(alimento => {
        // Verifica se já existe alimento com mesmo nome
        if (!nomesExistentes.has(alimento.nome.toLowerCase().trim())) {
          alimento.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
          this.alimentos.push(alimento);
          nomesExistentes.add(alimento.nome.toLowerCase().trim());
          importados++;
        } else {
          duplicados++;
        }
      });
      
      this.salvarNoLocalStorage();
      return { importados, duplicados };
    },
    
    atualizarAlimento(alimentoAtualizado) {
      const index = this.alimentos.findIndex(a => a.id === alimentoAtualizado.id)
      if (index !== -1) {
        this.alimentos[index] = alimentoAtualizado
        this.salvarNoLocalStorage()
      }
    },
    
    removerAlimento(id) {
      this.alimentos = this.alimentos.filter(a => a.id !== id)
      this.salvarNoLocalStorage()
    },
    
    salvarNoLocalStorage() {
      localStorage.setItem('alimentos', JSON.stringify(this.alimentos))
    },
    
    carregarDoLocalStorage() {
      // Recarrega os dados do localStorage (útil quando voltando de outras páginas)
      this.alimentos = JSON.parse(localStorage.getItem('alimentos') || '[]')
    },

    // Zerar todos os alimentos
    zerarAlimentos() {
      this.alimentos = []
      this.salvarNoLocalStorage()
    }
  }
})

// Função helper para calcular similaridade entre dois alimentos
function calcularSimilaridade(alimentoOriginal, alimentoSubstituto) {
  // Normalizar os valores para porção de 100g para comparação justa
  const norm1 = normalizarAlimento(alimentoOriginal);
  const norm2 = normalizarAlimento(alimentoSubstituto);
  
  // Calcular distância euclidiana normalizada com pesos ajustados
  const distanciaCalorias = Math.pow((norm1.caloria - norm2.caloria) / 300, 2); // Reduzido para dar mais sensibilidade
  const distanciaProteina = Math.pow((norm1.proteina - norm2.proteina) / 30, 2); // Reduzido
  const distanciaCarboidrato = Math.pow((norm1.carboidrato - norm2.carboidrato) / 50, 2); // Reduzido
  const distanciaGordura = Math.pow((norm1.gordura - norm2.gordura) / 30, 2); // Reduzido
  
  return Math.sqrt(distanciaCalorias + distanciaProteina + distanciaCarboidrato + distanciaGordura);
}

// Função helper para normalizar alimento para 100g
function normalizarAlimento(alimento) {
  const fatorNormalizacao = 100 / alimento.porcaoReferencia;
  
  return {
    caloria: alimento.caloria * fatorNormalizacao,
    proteina: alimento.proteina * fatorNormalizacao,
    carboidrato: alimento.carboidrato * fatorNormalizacao,
    gordura: alimento.gordura * fatorNormalizacao
  };
} 