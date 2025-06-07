<template>
  <div class="plano-page">
    <h1>Plano Alimentar</h1>
    
    <div class="info-cards">
      <div class="info-card" v-if="pesoUsuario > 0">
        <h3>Suas metas diárias:</h3>
        <div class="info-row">
          <div class="info-item">
            <h4>Calorias:</h4>
            <p>{{ caloriasDiarias.toFixed(0) }} kcal</p>
            <div class="progress-bar">
              <div class="progress" :style="{ width: `${Math.min(100, (caloriasAlocadas / caloriasDiarias) * 100)}%` }"></div>
            </div>
            <span class="progress-text">{{ caloriasAlocadas.toFixed(0) }} / {{ caloriasDiarias.toFixed(0) }}</span>
          </div>
          <div class="info-item">
            <h4>Proteínas:</h4>
            <p>{{ proteinasDiarias.toFixed(0) }}g</p>
            <div class="progress-bar">
              <div class="progress blue" :style="{ width: `${Math.min(100, (proteinasAlocadas / proteinasDiarias) * 100)}%` }"></div>
            </div>
            <span class="progress-text">{{ proteinasAlocadas.toFixed(0) }} / {{ proteinasDiarias.toFixed(0) }}</span>
          </div>
          <div class="info-item">
            <h4>Gorduras (máx):</h4>
            <p>{{ gorduraMaxima.toFixed(0) }}g</p>
            <div class="progress-bar">
              <div class="progress" :class="{ 'red': gordurasAlocadas > gorduraMaxima }" 
                  :style="{ width: `${Math.min(100, (gordurasAlocadas / gorduraMaxima) * 100)}%` }"></div>
            </div>
            <span class="progress-text">{{ gordurasAlocadas.toFixed(0) }} / {{ gorduraMaxima.toFixed(0) }}</span>
          </div>
        </div>

        
      </div>
      
      <div class="alert-box" v-else>
        <p>⚠️ Configure seu peso e nível de atividade na página inicial para calcular suas metas!</p>
        <router-link to="/" class="btn-config">Configurar agora</router-link>
      </div>
      
      <!-- Aviso sobre falta de alimentos -->
      <div class="alert-box" v-if="tiposAlimentos.length === 0" style="background-color: #fff3e0; color: #e65100; border: 1px solid #ffb74d;">
        <p>⚠️ Nenhum alimento encontrado! Você precisa cadastrar alimentos antes de criar refeições.</p>
        <router-link to="/alimentos" class="btn-config" style="background-color: #e65100; color: white;">Gerenciar Alimentos</router-link>
      </div>
    </div>
    
    <!-- Configuração do plano -->

    
    <!-- Navegação de refeições -->
    <div class="navegacao-refeicoes">
      <div v-if="refeicoes.length > 0" class="navegacao-controles">
        <button @click="refeicaoAnterior" 
                :disabled="currentRefeicaoIndex === 0" 
                class="btn-navegacao">
          ← Anterior
        </button>
        
        <div class="refeicao-seletor">
          <select v-model="currentRefeicaoIndex" class="select-refeicao">
            <option v-for="(refeicao, index) in refeicoes" 
                    :key="refeicao.id" 
                    :value="index">
              {{ refeicao.nome }}
            </option>
          </select>
          <span class="contador-refeicoes">{{ currentRefeicaoIndex + 1 }} de {{ refeicoes.length }}</span>
      </div>
      
        <button @click="proximaRefeicao" 
                :disabled="currentRefeicaoIndex === refeicoes.length - 1" 
                class="btn-navegacao">
          Próxima →
        </button>
    </div>
    
      <div v-else class="sem-refeicoes">
        <h3>Nenhuma refeição criada ainda</h3>
        <p>Comece criando sua primeira refeição!</p>
      </div>
      
      <div class="nova-refeicao-container">
        <button @click="criarNovaRefeicao" class="btn-nova-refeicao">+ Nova Refeição</button>
      </div>
    </div>

    <!-- Refeição atual -->
    <div v-if="refeicaoAtual" class="refeicoes-container">
      <h2>{{ refeicaoAtual.nome || `Refeição ${currentRefeicaoIndex + 1}` }}</h2>
      
      <div class="refeicao-card">
        <div class="refeicao-header">
          <div>
            <h3>{{ refeicaoAtual.nome || `Refeição ${currentRefeicaoIndex + 1}` }}</h3>
            <div class="metas-refeicao">
              <span class="meta">🎯 {{ refeicaoAtual.metaCalorias || 0 }} kcal</span>
              <span class="meta">🎯 {{ refeicaoAtual.metaProteinas || 0 }}g prot</span>
            </div>
          </div>
          
          <div class="refeicao-actions">
            <button class="btn-edit" @click="editarRefeicao(refeicaoAtual)">Editar</button>
            <button class="btn-delete" @click="removerRefeicao(refeicaoAtual.id)">Remover</button>
          </div>
        </div>
        
        <div class="refeicao-content">
          <div class="pratos-container">
            <div v-if="refeicaoAtual.pratos && refeicaoAtual.pratos.length > 0">
              <div v-for="(prato, pratoIndex) in refeicaoAtual.pratos" :key="prato.id" class="prato-card">
                <div class="prato-header">
                  <div class="prato-titulo-row">
                    <h4>{{ prato.nome || `Prato ${pratoIndex + 1}` }}</h4>
                    <div class="prato-actions">
                      <button class="btn-config-restricoes" @click="abrirConfigRestricoes(prato, refeicaoAtual)" title="Configurar restrições do algoritmo">⚙️</button>
                      <button class="btn-calcular-qtd" @click="executarAlgoritmoComRestricoes(prato, refeicaoAtual)" title="Executar algoritmo genético">🧮</button>
                      <button class="btn-edit-prato" @click="editarPrato(refeicaoAtual, prato)">✏️</button>
                      <button class="btn-duplicar-prato" @click="duplicarPrato(refeicaoAtual, prato)" title="Duplicar prato">📋</button>
                      <button class="btn-delete-prato" @click="removerPrato(refeicaoAtual.id, prato.id)">🗑️</button>
                    </div>
                  </div>
                  <div class="prato-info-row">
                    <div class="prato-macros-inline">
                      <div class="macro-inline">
                        <span class="macro-label">Cal</span>
                        <span class="macro-value">{{ calcularCaloriasPrato(prato).toFixed(0) }}</span>
                      </div>
                      <div class="macro-inline">
                        <span class="macro-label">Prot</span>
                        <span class="macro-value">{{ calcularProteinasPrato(prato).toFixed(1) }}g</span>
                      </div>
                      <div class="macro-inline">
                        <span class="macro-label">Carb</span>
                        <span class="macro-value">{{ calcularCarboidratosPrato(prato).toFixed(1) }}g</span>
                      </div>
                      <div class="macro-inline">
                        <span class="macro-label">Gord</span>
                        <span class="macro-value">{{ calcularGordurasPrato(prato).toFixed(1) }}g</span>
                      </div>
                    </div>
                    <div class="prato-progressos">
                      <div class="progresso-item">
                        <div class="prato-progresso">
                          <div v-for="(item, idx) in prato.alimentos" 
                               :key="`cal-${idx}`" 
                               :class="`progresso-segmento-cal cor-cal-${idx % 10}`"
                               :style="{ 
                                 width: `${Math.max(3, (calcularCaloriasAlimento(item) / Math.max(calcularCaloriasPrato(prato), 1)) * Math.min(100, (calcularCaloriasPrato(prato) / (refeicaoAtual.metaCalorias || 1)) * 100))}%`
                               }"></div>
                        </div>
                        <span class="progresso-diferenca">
                          {{ (calcularCaloriasPrato(prato) - (refeicaoAtual.metaCalorias || 0)) >= 0 ? '+' : '' }}{{ (calcularCaloriasPrato(prato) - (refeicaoAtual.metaCalorias || 0)).toFixed(0) }} cal
                        </span>
                      </div>
                      <div class="progresso-item">
                        <div class="prato-progresso">
                          <div v-for="(item, idx) in prato.alimentos" 
                               :key="`prot-${idx}`" 
                               :class="`progresso-segmento-prot cor-prot-${idx % 10}`"
                               :style="{ 
                                 width: `${Math.max(3, (calcularProteinasAlimento(item) / Math.max(calcularProteinasPrato(prato), 1)) * Math.min(100, (calcularProteinasPrato(prato) / (refeicaoAtual.metaProteinas || 1)) * 100))}%`
                               }"></div>
                        </div>
                        <span class="progresso-diferenca">
                          {{ (calcularProteinasPrato(prato) - (refeicaoAtual.metaProteinas || 0)) >= 0 ? '+' : '' }}{{ (calcularProteinasPrato(prato) - (refeicaoAtual.metaProteinas || 0)).toFixed(1) }}g prot
                        </span>
                      </div>
                    </div>

                    <div class="macronutrientes-chart">
                    <svg viewBox="-13 -13 226 226" class="macronutrientes-svg">
                      <!-- Área dos macronutrientes -->
                      <polygon :points="getMacronutrientesPointsPrato(prato, refeicaoAtual)" 
                               fill="var(--primary-color)" 
                               fill-opacity="0.3" 
                               stroke="white" 
                               stroke-width="2"/>
                      
                      <!-- Marcações das metas (apenas caloria e proteína) -->
                      <line x1="96" y1="20" x2="104" y2="20" stroke="green" stroke-width="4"/>
<line x1="96" y1="180" x2="104" y2="180" stroke="blue" stroke-width="2"/>

                      
                      <!-- Labels reposicionados -->
                      <text x="100" y="15" text-anchor="middle" class="chart-label" fill="white">Cal</text>
                      <text x="190" y="105" text-anchor="start" class="chart-label" fill="white">Carb</text>
                      <text x="100" y="195" text-anchor="middle" class="chart-label" fill="white">Prot</text>
                      <text x="10" y="105" text-anchor="end" class="chart-label" fill="white">Gord</text>
                    </svg>
                  </div>
                  </div>
                </div>
                
                <div class="prato-content">
                  <div class="alimentos-list" v-if="prato.alimentos && prato.alimentos.length > 0">
                    <ul>
                      <li v-for="(item, idx) in prato.alimentos" :key="idx">
              <div class="alimento-item">
                          <div class="alimento-header">
                            <div class="alimento-nome">
                  <strong>{{ item.alimento.nome }}</strong> 
                  <span>({{ item.porcao }}g)</span>
                  <span v-if="item.alimento.discreto" class="text-sm text-gray-500">
                    ({{ Math.round(item.porcao / item.alimento.gramaPorUnidade) }} {{ item.alimento.rotuloPorcao === 'outro' ? item.alimento.rotuloPorcaoCustom : item.alimento.rotuloPorcao }})
                  </span>
                </div>
                            <div class="alimento-actions">
                              <button @click="editarQuantidadeAlimento(refeicaoAtual.id, prato.id, idx, item)" 
                                      class="btn-edit-quantidade" 
                                      title="Editar quantidade">
                                ✏️
                              </button>
                              <button @click="abrirModalSubstituicao(refeicaoAtual.id, prato.id, idx, item)" 
                                      class="btn-substituir" 
                                      title="Substituir alimento">
                                🔄
                              </button>
                              <button @click="removerAlimentoIndividual(refeicaoAtual.id, prato.id, idx)" 
                                      class="btn-delete-alimento" 
                                      title="Remover alimento">
                                🗑️
                              </button>
                            </div>
                          </div>
                          <div class="alimento-info-completa">
                            <div class="alimento-macros-inline">
                              <div class="macro-inline">
                                <span class="macro-label">Cal</span>
                                <span class="macro-value">{{ (item.alimento.caloria * (item.porcao / item.alimento.porcaoReferencia)).toFixed(0) }}</span>
                              </div>
                              <div class="macro-inline">
                                <span class="macro-label">Prot</span>
                                <span class="macro-value">{{ (item.alimento.proteina * (item.porcao / item.alimento.porcaoReferencia)).toFixed(1) }}g</span>
                              </div>
                              <div class="macro-inline">
                                <span class="macro-label">Carb</span>
                                <span class="macro-value">{{ (item.alimento.carboidrato * (item.porcao / item.alimento.porcaoReferencia)).toFixed(1) }}g</span>
                              </div>
                              <div class="macro-inline">
                                <span class="macro-label">Gord</span>
                                <span class="macro-value">{{ (item.alimento.gordura * (item.porcao / item.alimento.porcaoReferencia)).toFixed(1) }}g</span>
                              </div>
                            </div>
                            <div class="alimento-barras">
                              <div class="alimento-barra-item">
                                <div class="alimento-barra-cal" 
                                     :style="{ 
                                       '--progresso-width': `${Math.min(100, (calcularCaloriasAlimento(item) / (refeicaoAtual.metaCalorias || 1)) * 100)}%`,
                                       '--cor-alimento': getCoresAlimento(idx).cal
                                     }"></div>
                                <span class="barra-label">{{ ((calcularCaloriasAlimento(item) / (refeicaoAtual.metaCalorias || 1)) * 100).toFixed(1) }}%</span>
                              </div>
                              <div class="alimento-barra-item">
                                <div class="alimento-barra-prot" 
                                     :style="{ 
                                       '--progresso-width': `${Math.min(100, (calcularProteinasAlimento(item) / (refeicaoAtual.metaProteinas || 1)) * 100)}%`,
                                       '--cor-alimento': getCoresAlimento(idx).prot
                                     }"></div>
                                <span class="barra-label">{{ ((calcularProteinasAlimento(item) / (refeicaoAtual.metaProteinas || 1)) * 100).toFixed(1) }}%</span>
                              </div>
                            </div>
                            
                </div>
              </div>
            </li>
          </ul>
        </div>

        <div v-else class="empty-message">
                    Nenhum alimento adicionado a este prato
        </div>
                  
                  <!-- Botão adicionar novo alimento -->
                  <div class="add-alimento-section">
                    <button @click="adicionarNovoAlimento(refeicaoAtual.id, prato.id)" class="btn-add-alimento">
                      + Novo Alimento
                    </button>
      </div>
      
                  <!-- <div class="macronutrientes-chart">
                    <svg viewBox="-13 -13 226 226" class="macronutrientes-svg">
                      Área dos macronutrientes
                      <polygon :points="getMacronutrientesPointsPrato(prato, refeicaoAtual)" 
                               fill="var(--primary-color)" 
                               fill-opacity="0.3" 
                               stroke="white" 
                               stroke-width="2"/>
                      
                      Marcações das metas (apenas caloria e proteína)
                      <line x1="96" y1="20" x2="104" y2="20" stroke="green" stroke-width="4"/>
<line x1="96" y1="180" x2="104" y2="180" stroke="blue" stroke-width="2"/>

                      
                      Labels reposicionados
                      <text x="100" y="15" text-anchor="middle" class="chart-label" fill="white">Cal</text>
                      <text x="190" y="105" text-anchor="start" class="chart-label" fill="white">Carb</text>
                      <text x="100" y="195" text-anchor="middle" class="chart-label" fill="white">Prot</text>
                      <text x="10" y="105" text-anchor="end" class="chart-label" fill="white">Gord</text>
                    </svg>
                  </div> -->
                </div>
        </div>
      </div>
      
            <!-- Compatibilidade com estrutura antiga -->
            <div v-else-if="refeicaoAtual.alimentos && refeicaoAtual.alimentos.length > 0" class="compatibilidade-antiga">
              <p><em>⚠️ Refeição no formato antigo. Edite para atualizar para o novo formato.</em></p>
            </div>
            
            <div v-else class="empty-message">
              <p>Nenhum prato criado nesta refeição ainda.</p>
              <p><em>Use o botão abaixo para criar seu primeiro prato!</em></p>
            </div>
            
            <!-- Botão sempre visível -->
            <button @click="adicionarNovoPrato(refeicaoAtual)" class="btn-add-prato">
              + Adicionar {{ refeicaoAtual.pratos && refeicaoAtual.pratos.length > 0 ? 'Nova Variação' : 'Primeiro Prato' }}
      </button>
          </div>

          
        </div>
      </div>
    </div>
    
    <!-- Modal de edição de refeição -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ refeicaoModal.id ? 'Editar' : 'Nova' }} Refeição</h2>
          <button @click="fecharModal" class="btn-close">&times;</button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="salvarRefeicao">
            <div class="form-group">
              <label for="nomeRefeicao">Nome da Refeição:</label>
              <input type="text" id="nomeRefeicao" v-model="refeicaoModal.nome" placeholder="Ex: Café da Manhã" />
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="metaCalorias">Meta de Calorias:</label>
                <input type="number" id="metaCalorias" v-model.number="refeicaoModal.metaCalorias" min="0" placeholder="Ex: 400" />
              </div>
              
              <div class="form-group">
                <label for="metaProteinas">Meta de Proteínas (g):</label>
                <input type="number" id="metaProteinas" v-model.number="refeicaoModal.metaProteinas" min="0" step="0.1" placeholder="Ex: 25" />
              </div>
            </div>
            
            <div v-if="refeicaoModal.pratos && refeicaoModal.pratos.length > 0">
              <h3>Pratos Criados</h3>
              <div v-for="prato in refeicaoModal.pratos" :key="prato.id" class="prato-preview">
                <div class="prato-info">
                  <strong>{{ prato.nome }}</strong>
                  <span>{{ calcularCaloriasPrato(prato).toFixed(0) }} kcal | {{ calcularProteinasPrato(prato).toFixed(1) }}g prot</span>
                </div>
                <div class="prato-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: `${Math.min(100, (calcularCaloriasPrato(prato) / (refeicaoModal.metaCalorias || 1)) * 100)}%` }"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="info-message">
              <p>💡 <strong>Como usar:</strong></p>
              <ol>
                <li>Defina o nome da refeição e suas metas nutricionais</li>
                <li>Após salvar, use o botão "Adicionar Variação (Novo Prato)" para criar diferentes combinações de alimentos</li>
                <li>Cada prato é uma variação que deve atingir as mesmas metas da refeição</li>
              </ol>
            </div>
            
            <div class="modal-footer">
              <button type="button" @click="fecharModal" class="btn-cancel">Cancelar</button>
              <button type="submit" class="btn-save">Salvar Refeição</button>
            </div>
          </form>
        </div>
      </div>
    </div>
    
    <!-- Modal de edição de prato -->
    <div v-if="showPratoModal" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h2>Editar Prato</h2>
          <button @click="fecharPratoModal" class="btn-close">&times;</button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="salvarPrato">
            <div class="form-group">
              <label for="pratoNome">Nome do Prato:</label>
              <input type="text" id="pratoNome" v-model="pratoAtual.nome" placeholder="Ex: Prato Principal" />
            </div>
            
            <h3>Alimentos</h3>
            <div v-if="pratoAtual.alimentos && pratoAtual.alimentos.length > 0">
              <div v-for="(item, idx) in pratoAtual.alimentos" :key="idx" class="alimento-row">
                <div class="alimento-info">
                  <div class="alimento-nome">
                  <strong>{{ item.alimento.nome }}</strong>
                  <span>{{ (item.alimento.caloria * (item.porcao / item.alimento.porcaoReferencia)).toFixed(0) }} kcal</span>
                  </div>
                </div>
                <div class="alimento-actions">
                  <input type="number" v-model.number="item.porcao" min="1" @change="recalcularCaloriasPrato" /> g
                  <button type="button" @click="removerAlimentoDoPrato(idx)" class="btn-delete-sm">Remover</button>
                </div>
              </div>
            </div>
            <div v-else class="empty-message">
              Nenhum alimento adicionado
            </div>
            
            <div class="add-alimento-section">
              <h4>Adicionar Alimento</h4>
              <div class="form-row">
                <div class="form-group">
                  <label for="tipoAlimento">Tipo:</label>
                  <select id="tipoAlimento" v-model="tipoAlimentoSelecionadoPrato">
                    <option value="">Selecione o tipo</option>
                    <option v-for="tipo in tiposAlimentos" :key="tipo" :value="tipo">{{ tipo }}</option>
                  </select>
                </div>
                
                <div class="form-group" v-if="tipoAlimentoSelecionadoPrato">
                  <label for="alimentoSelecionado">Alimento:</label>
                  <select id="alimentoSelecionado" v-model="alimentoSelecionadoPrato">
                    <option value="">Selecione o alimento</option>
                    <option v-for="alimento in alimentosPorTipoSelecionadoPrato" :key="alimento.id" :value="alimento.id">
                      {{ alimento.nome }} ({{ alimento.caloria }} kcal/{{ alimento.porcaoReferencia }}g)
                    </option>
                  </select>
                </div>
                
                                  <div class="form-group" v-if="alimentoSelecionadoPrato">
                  <label for="porcaoAlimento">Porção (g):</label>
                    <input type="number" id="porcaoAlimento" v-model.number="porcaoAlimentoPrato" min="1" />
                </div>
              </div>
              
              <button type="button" @click="adicionarAlimentoAoPrato" class="btn-add" 
                      :disabled="!alimentoSelecionadoPrato || !porcaoAlimentoPrato">
                Adicionar Alimento
              </button>
            </div>
            
                         <!-- Informações nutricionais do prato -->
             <div class="nutricional-info">
              <div class="info-item">
                <span>Calorias:</span>
                 <strong>{{ caloriasTotalPrato.toFixed(0) }} kcal</strong>
              </div>
              <div class="info-item">
                <span>Proteínas:</span>
                 <strong>{{ proteinasTotalPrato.toFixed(1) }} g</strong>
              </div>
              <div class="info-item">
                <span>Carboidratos:</span>
                 <strong>{{ carboidratosTotalPrato.toFixed(1) }} g</strong>
              </div>
              <div class="info-item">
                <span>Gorduras:</span>
                 <strong>{{ gordurasTotalPrato.toFixed(1) }} g</strong>
              </div>
            </div>
            
            <div class="modal-footer">
              <button type="button" @click="fecharPratoModal" class="btn-cancel">Cancelar</button>
              <button type="submit" class="btn-save">Salvar Prato</button>
            </div>
          </form>
        </div>
      </div>
    </div>
    
    <!-- Modal de substituição de alimento -->
    <div v-if="showSubstituicaoModal" class="modal-overlay">
      <div class="modal modal-substituicao">
        <div class="modal-header">
          <h2>Substituir Alimento</h2>
          <button @click="fecharModalSubstituicao" class="btn-close">&times;</button>
        </div>
        
        <div class="modal-body">
          <div class="alimento-original">
            <h3>Alimento Atual:</h3>
            <div class="alimento-info-original">
              <div class="alimento-nome-original">
                <strong>{{ alimentoOriginal?.alimento?.nome }}</strong>
                <span>{{ alimentoOriginal?.porcao }}g</span>
              </div>
              <div class="macros-original">
                <div class="macro-item">
                  <span class="macro-label">Calorias:</span>
                  <span class="macro-value">{{ ((alimentoOriginal?.alimento?.caloria || 0) * (alimentoOriginal?.porcao || 0) / (alimentoOriginal?.alimento?.porcaoReferencia || 1)).toFixed(0) }} kcal</span>
                </div>
                <div class="macro-item">
                  <span class="macro-label">Proteínas:</span>
                  <span class="macro-value">{{ ((alimentoOriginal?.alimento?.proteina || 0) * (alimentoOriginal?.porcao || 0) / (alimentoOriginal?.alimento?.porcaoReferencia || 1)).toFixed(1) }}g</span>
                </div>
                <div class="macro-item">
                  <span class="macro-label">Carboidratos:</span>
                  <span class="macro-value">{{ ((alimentoOriginal?.alimento?.carboidrato || 0) * (alimentoOriginal?.porcao || 0) / (alimentoOriginal?.alimento?.porcaoReferencia || 1)).toFixed(1) }}g</span>
                </div>
                <div class="macro-item">
                  <span class="macro-label">Gorduras:</span>
                  <span class="macro-value">{{ ((alimentoOriginal?.alimento?.gordura || 0) * (alimentoOriginal?.porcao || 0) / (alimentoOriginal?.alimento?.porcaoReferencia || 1)).toFixed(1) }}g</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="substitutos-lista">
            <h3>Substitutos Disponíveis:</h3>
            
            <!-- Campo de busca/filtro -->
            <div class="busca-input-group">
              <input type="text" 
                     v-model="buscaSubstituto" 
                     @input="filtrarSubstitutos"
                     placeholder="🔍 Filtrar substitutos por nome..."
                     class="busca-input" />
              <button v-if="buscaSubstituto" 
                      @click="limparBusca" 
                      class="btn-limpar-busca" 
                      type="button">
                ✕
              </button>
            </div>
            
            <div v-if="substitutosFiltrados.length > 0" class="substitutos-grid">
              <div v-for="substituto in substitutosFiltrados" 
                   :key="substituto.id" 
                   @click="selecionarSubstituto(substituto)" 
                   class="substituto-card">
                <div class="substituto-header">
                  <strong>{{ substituto.nome }}</strong>
                  <span class="similaridade">{{ calcularSimilaridadeTexto(alimentoOriginal?.alimento, substituto) }}</span>
                </div>
                <div class="substituto-macros">
                  <div class="porcao-info">
                    <span class="porcao-label">Porção equivalente:</span>
                    <span class="porcao-value">{{ calcularPorcaoSubstituta(alimentoOriginal, substituto) }}g</span>
                  </div>
                  <div class="macros-grid">
                    <div class="macro-item">
                      <span class="macro-label">Cal:</span>
                      <span class="macro-value">{{ ((substituto.caloria * calcularPorcaoSubstituta(alimentoOriginal, substituto)) / substituto.porcaoReferencia).toFixed(0) }}</span>
                    </div>
                    <div class="macro-item">
                      <span class="macro-label">Prot:</span>
                      <span class="macro-value">{{ ((substituto.proteina * calcularPorcaoSubstituta(alimentoOriginal, substituto)) / substituto.porcaoReferencia).toFixed(1) }}g</span>
                    </div>
                    <div class="macro-item">
                      <span class="macro-label">Carb:</span>
                      <span class="macro-value">{{ ((substituto.carboidrato * calcularPorcaoSubstituta(alimentoOriginal, substituto)) / substituto.porcaoReferencia).toFixed(1) }}g</span>
                    </div>
                    <div class="macro-item">
                      <span class="macro-label">Gord:</span>
                      <span class="macro-value">{{ ((substituto.gordura * calcularPorcaoSubstituta(alimentoOriginal, substituto)) / substituto.porcaoReferencia).toFixed(1) }}g</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-else-if="buscaSubstituto && substitutosDisponiveis.length > 0" class="empty-message">
              Nenhum substituto encontrado com o filtro "{{ buscaSubstituto }}".
            </div>
            
            <div v-else-if="substitutosDisponiveis.length === 0" class="empty-message">
              Nenhum substituto encontrado para este alimento.
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal de edição de quantidade -->
    <div v-if="showQuantidadeModal" class="modal-overlay">
      <div class="modal modal-quantidade">
        <div class="modal-header">
          <h2>{{ isNovoAlimento ? 'Novo Alimento' : 'Editar Alimento' }}</h2>
          <button @click="fecharModalQuantidade" class="btn-close">&times;</button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="salvarNovaQuantidade">
            <!-- Seleção de alimento -->
            <div class="form-row">
              <div class="form-group">
                <label for="tipoAlimentoModalQuantidade">Tipo de Alimento:</label>
                <select v-model="tipoAlimentoModalQuantidade" id="tipoAlimentoModalQuantidade" required>
                  <option value="">Selecione um tipo</option>
                  <option v-for="tipo in tiposAlimentos" :key="tipo" :value="tipo">{{ tipo }}</option>
                </select>
              </div>
              
              <div class="form-group">
                <label for="alimentoSelecionadoModalQuantidade">Alimento:</label>
                <select v-model="alimentoSelecionadoModalQuantidade" id="alimentoSelecionadoModalQuantidade" required>
                  <option value="">Selecione um alimento</option>
                  <option v-for="alimento in alimentosPorTipoSelecionadoModalQuantidade" :key="alimento.id" :value="alimento.id">{{ alimento.nome }}</option>
                </select>
              </div>
            </div>
            
            <div class="form-group">
              <label for="novaQuantidadeInput">Quantidade (gramas):</label>
              <input type="number" 
                     id="novaQuantidadeInput" 
                     v-model.number="novaQuantidade" 
                     min="0.1" 
                     step="0.1" 
                     required />
            </div>
            
            <div class="macros-previsao" v-if="novaQuantidade > 0 && alimentoPrevisaoSelecionado">
              <h4>Valores calculados:</h4>
              <div class="macros-grid">
                <span>{{ ((alimentoPrevisaoSelecionado?.caloria || 0) * novaQuantidade / (alimentoPrevisaoSelecionado?.porcaoReferencia || 1)).toFixed(0) }} kcal</span>
                <span>{{ ((alimentoPrevisaoSelecionado?.proteina || 0) * novaQuantidade / (alimentoPrevisaoSelecionado?.porcaoReferencia || 1)).toFixed(1) }}g prot</span>
                <span>{{ ((alimentoPrevisaoSelecionado?.carboidrato || 0) * novaQuantidade / (alimentoPrevisaoSelecionado?.porcaoReferencia || 1)).toFixed(1) }}g carb</span>
                <span>{{ ((alimentoPrevisaoSelecionado?.gordura || 0) * novaQuantidade / (alimentoPrevisaoSelecionado?.porcaoReferencia || 1)).toFixed(1) }}g gord</span>
              </div>
            </div>
            
            <div class="modal-footer">
              <button type="button" @click="fecharModalQuantidade" class="btn-cancel">Cancelar</button>
              <button type="submit" class="btn-save">
                {{ isNovoAlimento ? 'Adicionar Alimento' : 'Salvar Alterações' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal de configuração do algoritmo genético -->
    <div v-if="showConfigAlgoritmoModal" class="modal-overlay">
      <div class="modal modal-config-algoritmo">
        <div class="modal-header">
          <h2>🧮 Configurar Algoritmo Genético</h2>
          <button @click="fecharModalConfigAlgoritmo" class="btn-close">&times;</button>
        </div>
        
        <div class="modal-body">
          <div class="info-algoritmo">
            
            <p>Configure restrições opcionais para cada alimento (deixe em branco para sem limite):</p>
          </div>
          
          <div class="restricoes-lista">
            <div v-for="(restricao, index) in restricoesAlimentos" :key="index" class="restricao-item">
              <div class="alimento-header-config">
                <div class="alimento-info-config">
                  <strong>{{ restricao.alimento.nome }}</strong>
                  <span class="quantidade-atual">Atual: {{ restricao.quantidadeAtual }}g</span>
                </div>
                <label class="checkbox-restricao">
                  <input type="checkbox" v-model="restricao.usarRestricao" />
                  Usar restrições
                </label>
              </div>
              
              <div v-if="restricao.usarRestricao" class="restricoes-inputs">
                <div class="input-group">
                  <label>Mínimo (g):</label>
                  <input type="number" 
                         v-model.number="restricao.minimo" 
                         min="0" 
                         step="0.1" 
                         placeholder="Ex: 50" />
                </div>
                <div class="input-group">
                  <label>Máximo (g):</label>
                  <input type="number" 
                         v-model.number="restricao.maximo" 
                         min="0" 
                         step="0.1" 
                         placeholder="Ex: 200" />
                </div>
              </div>
            </div>
          </div>
          
          <div class="resumo-restricoes" v-if="restricoesAlimentos.some(r => r.usarRestricao)">
            <h4>📋 Resumo das restrições ativas:</h4>
            <ul>
              <li v-for="restricao in restricoesAlimentos.filter(r => r.usarRestricao)" :key="restricao.alimento.id">
                <strong>{{ restricao.alimento.nome }}:</strong>
                <span v-if="restricao.minimo && restricao.maximo">
                  {{ restricao.minimo }}g - {{ restricao.maximo }}g
                </span>
                <span v-else-if="restricao.minimo">
                  Mínimo {{ restricao.minimo }}g
                </span>
                <span v-else-if="restricao.maximo">
                  Máximo {{ restricao.maximo }}g
                </span>
              </li>
            </ul>
          </div>
          
          <div class="modal-footer">
            <button type="button" @click="fecharModalConfigAlgoritmo" class="btn-cancel">Cancelar</button>
            <button type="button" @click="salvarRestricoes" class="btn-save">💾 Salvar Restrições</button>
          </div>
        </div>
      </div>
    </div>
    
    <div class="navigation">
      <router-link to="/" class="nav-button">
        Voltar para Início
      </router-link>
      <router-link to="/alimentos" class="nav-button">
        Gerenciar Alimentos
      </router-link>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { usePlanoAlimentarStore } from '../stores/planoAlimentarStore';
import { useAlimentosStore } from '../stores/alimentosStore';

export default {
  name: 'PlanoAlimentarPage',
  setup() {
    const planoStore = usePlanoAlimentarStore();
    const alimentosStore = useAlimentosStore();
    const route = useRoute();

    // Dados do plano
    const refeicoes = computed(() => planoStore.refeicoes);
    
    // Modal de edição de refeição
    const showModal = ref(false);
    const refeicaoModal = ref({ 
      nome: '', 
      metaCalorias: 0, 
      metaProteinas: 0, 
      pratos: [] 
    });
    
    // Modal de edição de prato
    const showPratoModal = ref(false);
    const pratoAtual = ref({ nome: '', alimentos: [] });
    const refeicaoAtualPrato = ref(null);
    
    // Modal de substituição
    const showSubstituicaoModal = ref(false);
    const alimentoOriginal = ref(null);
    const contextoSubstituicao = ref({ refeicaoId: null, pratoId: null, index: null });
    const substitutosDisponiveis = ref([]);
    const buscaSubstituto = ref('');

    // Modal de edição de quantidade
    const showQuantidadeModal = ref(false);
    const alimentoQuantidade = ref(null);
    const novaQuantidade = ref(0);
    const contextoQuantidade = ref({ refeicaoId: null, pratoId: null, index: null });
    const modoEdicaoCompleta = ref(false); // Se true, permite alterar o alimento também
    const tipoAlimentoModalQuantidade = ref('');
    const alimentoSelecionadoModalQuantidade = ref('');
    const isAdicionandoNovoAlimento = ref(false); // Flag específica para novo alimento

    // Modal de configuração do algoritmo genético
    const showConfigAlgoritmoModal = ref(false);
    const pratoParaCalculo = ref(null);
    const refeicaoParaCalculo = ref(null);
    const restricoesAlimentos = ref([]);

    // Estados para navegação entre refeições
    const currentRefeicaoIndex = ref(0);
    
    const tipoAlimentoSelecionado = ref('');
    const alimentoSelecionado = ref('');
    const porcaoAlimento = ref(100);
    
    // Variáveis para o modal de prato
    const tipoAlimentoSelecionadoPrato = ref('');
    const alimentoSelecionadoPrato = ref('');
    const porcaoAlimentoPrato = ref(100);
    
    // Dados do usuário
    const pesoUsuario = computed(() => planoStore.pesoUsuario);
    const caloriasDiarias = computed(() => planoStore.caloriasDiarias);
    const proteinasDiarias = computed(() => planoStore.proteinasDiarias);
    const gorduraMaxima = computed(() => planoStore.gorduraMaxima);
    
    // Valores alocados
    const caloriasAlocadas = computed(() => planoStore.caloriasAlocadas);
    const proteinasAlocadas = computed(() => planoStore.proteinasAlocadas);
    const gordurasAlocadas = computed(() => planoStore.gordurasAlocadas);
    
    // Calorias totais da refeição modal (compatibilidade - nova estrutura usa pratos)
    const caloriasTotalRefeicaoAtual = computed(() => {
      if (!refeicaoModal.value || !refeicaoModal.value.alimentos) return 0;
      return refeicaoModal.value.alimentos.reduce((total, item) => {
        if (!item.alimento) return total;
        return total + (item.alimento.caloria * (item.porcao / item.alimento.porcaoReferencia));
      }, 0);
    });
    
    // Proteínas totais da refeição modal (compatibilidade - nova estrutura usa pratos)
    const proteinasTotalRefeicaoAtual = computed(() => {
      if (!refeicaoModal.value || !refeicaoModal.value.alimentos) return 0;
      return refeicaoModal.value.alimentos.reduce((total, item) => {
        if (!item.alimento) return total;
        return total + (item.alimento.proteina * (item.porcao / item.alimento.porcaoReferencia));
      }, 0);
    });
    
    // Carboidratos totais da refeição modal (compatibilidade - nova estrutura usa pratos)
    const carboidratosTotalRefeicaoAtual = computed(() => {
      if (!refeicaoModal.value || !refeicaoModal.value.alimentos) return 0;
      return refeicaoModal.value.alimentos.reduce((total, item) => {
        if (!item.alimento) return total;
        return total + (item.alimento.carboidrato * (item.porcao / item.alimento.porcaoReferencia));
      }, 0);
    });
    
    // Gorduras totais da refeição modal (compatibilidade - nova estrutura usa pratos)
    const gordurasTotalRefeicaoAtual = computed(() => {
      if (!refeicaoModal.value || !refeicaoModal.value.alimentos) return 0;
      return refeicaoModal.value.alimentos.reduce((total, item) => {
        if (!item.alimento) return total;
        return total + (item.alimento.gordura * (item.porcao / item.alimento.porcaoReferencia));
      }, 0);
    });
    
    

         // Usar computed diretamente, mas de forma mais simples como na AlimentosPage
    const tiposAlimentos = computed(() => {
       try {
         console.log('Recalculando tipos de alimentos...');
         console.log('alimentosStore:', alimentosStore);
         console.log('alimentosStore.alimentos:', alimentosStore?.alimentos);
         console.log('alimentosStore.alimentos.length:', alimentosStore?.alimentos?.length);
         
         if (!alimentosStore || !alimentosStore.alimentos || alimentosStore.alimentos.length === 0) {
           console.log('Store ou alimentos não disponíveis/vazios');
           return [];
         }
         
         // Acessar como propriedade (getter), não função
         const tipos = alimentosStore.getTiposAlimentos;
         console.log('Tipos calculados:', tipos);
         console.log('Tipos.length:', tipos?.length);
         return tipos || [];
       } catch (error) {
         console.warn('Erro ao obter tipos de alimentos:', error);
         return [];
       }
     });

         // Inicialização e verificação dos dados
     onMounted(() => {
       // Recarregar dados do localStorage quando a página for montada
       if (alimentosStore && typeof alimentosStore.carregarDoLocalStorage === 'function') {
         alimentosStore.carregarDoLocalStorage();
       }
       
       // Verificar se há alimentos cadastrados, se não houver, mostrar aviso
       console.log('Alimentos Store:', alimentosStore);
       console.log('Alimentos disponíveis:', alimentosStore?.alimentos);
       console.log('Total de alimentos:', alimentosStore?.alimentos?.length || 0);
       
       if (!alimentosStore?.alimentos || alimentosStore.alimentos.length === 0) {
         console.warn('Nenhum alimento encontrado. Vá para a página de Alimentos para cadastrar alguns alimentos primeiro.');
       }
     });

     // Watcher para recarregar quando a rota mudar (voltando de outras páginas)
     watch(() => route.path, (newPath) => {
       if (newPath === '/plano-alimentar') {
         console.log('Voltando para página do plano alimentar, recarregando dados...');
         if (alimentosStore && typeof alimentosStore.carregarDoLocalStorage === 'function') {
           alimentosStore.carregarDoLocalStorage();
         }
       }
    });
    
    // Alimentos do tipo selecionado
    const alimentosPorTipoSelecionado = computed(() => {
      if (!tipoAlimentoSelecionado.value) return [];
       try {
         if (!alimentosStore || !alimentosStore.alimentos) {
           return [];
         }
         
         return alimentosStore.getAlimentosByTipo(tipoAlimentoSelecionado.value) || [];
       } catch (error) {
         console.warn('Erro ao obter alimentos por tipo:', error);
         return [];
       }
     });
    
         // Computed para alimentos do prato
     const alimentosPorTipoSelecionadoPrato = computed(() => {
       if (!tipoAlimentoSelecionadoPrato.value) return [];
       try {
         if (!alimentosStore || !alimentosStore.alimentos) {
           return [];
         }
         
         return alimentosStore.getAlimentosByTipo(tipoAlimentoSelecionadoPrato.value) || [];
       } catch (error) {
         console.warn('Erro ao obter alimentos por tipo:', error);
         return [];
       }
     });

     // Computed para alimentos do modal de quantidade
     const alimentosPorTipoSelecionadoModalQuantidade = computed(() => {
       if (!tipoAlimentoModalQuantidade.value) return [];
       try {
         if (!alimentosStore || !alimentosStore.alimentos) {
           return [];
         }
         
         return alimentosStore.getAlimentosByTipo(tipoAlimentoModalQuantidade.value) || [];
       } catch (error) {
         console.warn('Erro ao obter alimentos por tipo:', error);
         return [];
       }
     });

     // Alimento selecionado para previsão
     const alimentoPrevisaoSelecionado = computed(() => {
       if (alimentoSelecionadoModalQuantidade.value) {
         return alimentosStore.alimentos.find(a => a.id === alimentoSelecionadoModalQuantidade.value);
       }
       return null;
     });

     // Substitutos filtrados pela busca
     const substitutosFiltrados = computed(() => {
       if (!buscaSubstituto.value.trim()) {
         return substitutosDisponiveis.value;
       }
       
       const termo = buscaSubstituto.value.trim().toLowerCase();
       return substitutosDisponiveis.value.filter(substituto => 
         substituto.nome.toLowerCase().includes(termo)
       );
     });

     // Verifica se é um novo alimento
     const isNovoAlimento = computed(() => {
       return isAdicionandoNovoAlimento.value;
     });
    
    // Computed para totais nutricionais do prato em edição
    const caloriasTotalPrato = computed(() => {
      if (!pratoAtual.value) return 0;
      return calcularCaloriasPrato(pratoAtual.value);
    });

    const proteinasTotalPrato = computed(() => {
      if (!pratoAtual.value) return 0;
      return calcularProteinasPrato(pratoAtual.value);
    });

    const carboidratosTotalPrato = computed(() => {
      if (!pratoAtual.value || !pratoAtual.value.alimentos) return 0;
      return pratoAtual.value.alimentos.reduce((total, item) => {
        if (!item.alimento) return total;
        return total + (item.alimento.carboidrato * (item.porcao / item.alimento.porcaoReferencia));
      }, 0);
    });

    const gordurasTotalPrato = computed(() => {
      if (!pratoAtual.value || !pratoAtual.value.alimentos) return 0;
      return pratoAtual.value.alimentos.reduce((total, item) => {
        if (!item.alimento) return total;
        return total + (item.alimento.gordura * (item.porcao / item.alimento.porcaoReferencia));
      }, 0);
    });
    
    // Criar uma nova refeição
    const criarNovaRefeicao = () => {
      refeicaoModal.value = {
        nome: '',
        metaCalorias: 0,
        metaProteinas: 0,
        pratos: []
      };
      
      showModal.value = true;
    };
    
    // Editar refeição existente
    const editarRefeicao = (refeicao) => {
      refeicaoModal.value = JSON.parse(JSON.stringify(refeicao)); // Clone profundo
      showModal.value = true;
    };
    
    // Remover uma refeição
    const removerRefeicao = (id) => {
      if (confirm('Tem certeza que deseja remover esta refeição?')) {
        planoStore.removerRefeicao(id);
      }
    };
    
    // Calcular calorias de uma refeição
    const calcularCaloriasRefeicao = (refeicao) => {
      if (!refeicao.alimentos) return 0;
      
      return refeicao.alimentos.reduce((total, item) => {
        return total + (item.alimento.caloria * (item.porcao / item.alimento.porcaoReferencia));
      }, 0);
    };
    
    // Adicionar alimento à refeição atual
    const adicionarAlimentoNaRefeicao = () => {
      const alimento = alimentosStore.getAlimentoById(alimentoSelecionado.value);
      if (alimento && porcaoAlimento.value > 0) {
        const itemAlimento = {
          alimento,
          porcao: porcaoAlimento.value,
          substituivel: true, // Todos os alimentos são sempre substituíveis
          alimentoReferencia: alimento, // Salvar referência para cálculos
          porcaoReferencia: porcaoAlimento.value
        };

        refeicaoModal.value.alimentos.push(itemAlimento);
        
        // Limpar seleção
        alimentoSelecionado.value = '';
        porcaoAlimento.value = 100;
      }
    };
    
    // Remover alimento da refeição atual
    const removerAlimentoDaRefeicao = (index) => {
      refeicaoModal.value.alimentos.splice(index, 1);
    };
    
    // Recalcular calorias quando as porções são alteradas
    const recalcularCalorias = () => {
      // Não precisa fazer nada, pois os computed serão recalculados automaticamente
    };
    
    // Salvar a refeição atual
    const salvarRefeicao = () => {
      if (!refeicaoModal.value.nome) {
        alert('Informe o nome da refeição.');
        return;
      }
      
      if (!refeicaoModal.value.metaCalorias || refeicaoModal.value.metaCalorias <= 0) {
        alert('Informe uma meta de calorias válida.');
        return;
      }
      
      if (!refeicaoModal.value.metaProteinas || refeicaoModal.value.metaProteinas <= 0) {
        alert('Informe uma meta de proteínas válida.');
        return;
      }
      
      if (refeicaoModal.value.id) {
        // Editar refeição existente
        planoStore.atualizarRefeicao(refeicaoModal.value);
      } else {
        // Adicionar nova refeição
        planoStore.adicionarRefeicao(refeicaoModal.value);
      }
      
      fecharModal();
    };
    
    // Fechar o modal
    const fecharModal = () => {
      showModal.value = false;
      tipoAlimentoSelecionado.value = '';
      alimentoSelecionado.value = '';
      porcaoAlimento.value = 100;
    };
    
    // Abrir modal de substituição
    const abrirModalSubstituicao = (refeicaoId, pratoId, index, item) => {
      try {
        alimentoOriginal.value = item;
        contextoSubstituicao.value = { refeicaoId, pratoId, index };
        substitutosDisponiveis.value = getSubstitutosPossiveis(item.alimento);
        showSubstituicaoModal.value = true;
      } catch (error) {
        console.error('Erro ao abrir modal de substituição:', error);
        alert('Erro ao abrir modal de substituição. Tente novamente.');
      }
    };

    // Fechar modal de substituição
    const fecharModalSubstituicao = () => {
      showSubstituicaoModal.value = false;
      alimentoOriginal.value = null;
      contextoSubstituicao.value = { refeicaoId: null, pratoId: null, index: null };
      substitutosDisponiveis.value = [];
      buscaSubstituto.value = '';
    };

    // Filtrar substitutos (não precisa de lógica especial, o computed cuida disso)
    const filtrarSubstitutos = () => {
      // A filtragem é feita automaticamente pelo computed substitutosFiltrados
    };

    // Limpar busca
    const limparBusca = () => {
      buscaSubstituto.value = '';
    };

    // Selecionar substituto
    const selecionarSubstituto = (substituto) => {
      const { refeicaoId, pratoId, index } = contextoSubstituicao.value;
      
      const refeicao = refeicoes.value.find(r => r.id === refeicaoId);
      if (!refeicao) return;

      const prato = refeicao.pratos.find(p => p.id === pratoId);
      if (!prato) return;

      const itemAtual = prato.alimentos[index];
      
      // Calcular nova porção para manter calorias similares
      const novaPorcao = calcularPorcaoSubstituta(itemAtual, substituto);
      
      // Atualizar o item
      prato.alimentos[index] = {
        alimento: substituto,
        porcao: novaPorcao,
        substituivel: true
      };

      // Salvar mudanças
      planoStore.atualizarPrato(refeicaoId, prato);
      
      // Fechar modal
      fecharModalSubstituicao();
    };

    // Função antiga (manter para compatibilidade se necessário)
    const substituirAlimento = (refeicaoId, pratoId, index, event) => {
      const novoAlimentoId = event.target.value;
      if (!novoAlimentoId) return;

      const refeicao = refeicoes.value.find(r => r.id === refeicaoId);
      if (!refeicao) return;

      const prato = refeicao.pratos.find(p => p.id === pratoId);
      if (!prato) return;

      const itemAtual = prato.alimentos[index];
      const novoAlimento = alimentosStore.getAlimentoById(novoAlimentoId);
      
      if (!novoAlimento) return;

      // Calcular nova porção para manter calorias similares
      const novaPorcao = planoStore.calcularPorcaoProporcional(itemAtual, novoAlimento);
      
      // Atualizar o item
      prato.alimentos[index] = {
        alimento: novoAlimento,
        porcao: novaPorcao,
        substituivel: true
      };

      // Salvar mudanças
      planoStore.atualizarPrato(refeicaoId, prato);
      
      // Limpar seleção
      event.target.value = '';
    };
    
    // Calcular a porção de um alimento substituto
    const calcularPorcaoSubstituta = (item, substituto) => {
      const caloriasOriginais = (item.alimento.caloria * item.porcao) / item.alimento.porcaoReferencia;
      const novaPorcao = (caloriasOriginais * substituto.porcaoReferencia) / substituto.caloria;
      return Math.round(novaPorcao * 10) / 10;
    };
    
    // Obter substitutos possíveis para um alimento
         const getSubstitutosPossiveis = (alimento) => {
       try {
         if (!alimentosStore || !alimentosStore.alimentos) {
           console.warn('Store de alimentos não disponível');
           return [];
         }
         
         if (!alimento) {
           console.warn('Alimento não fornecido para busca de substitutos');
           return [];
         }
         
         return alimentosStore.getSubstitutosPossiveis(alimento) || [];
       } catch (error) {
         console.error('Erro ao obter substitutos possíveis:', error);
         return [];
       }
     };
    

    
    // Calcular similaridade textual entre dois alimentos (usando a mesma lógica do store)
    const calcularSimilaridadeTexto = (alimento1, alimento2) => {
      // Usar a mesma função do store para consistência
      const norm1 = normalizarAlimento(alimento1);
      const norm2 = normalizarAlimento(alimento2);
      
      // Calcular distância euclidiana normalizada com pesos ajustados
      const distanciaCalorias = Math.pow((norm1.caloria - norm2.caloria) / 300, 2);
      const distanciaProteina = Math.pow((norm1.proteina - norm2.proteina) / 30, 2);
      const distanciaCarboidrato = Math.pow((norm1.carboidrato - norm2.carboidrato) / 50, 2);
      const distanciaGordura = Math.pow((norm1.gordura - norm2.gordura) / 30, 2);
      
      const distancia = Math.sqrt(distanciaCalorias + distanciaProteina + distanciaCarboidrato + distanciaGordura);
      
      // Converter distância em percentual de similaridade com escala ajustada
      const similaridade = Math.max(0, Math.min(100, Math.exp(-distancia * 2) * 100));
      
      // Classificar em categorias com limites mais intuitivos
      if (similaridade >= 80) return "⭐⭐⭐ Muito Similar";
      if (similaridade >= 60) return "⭐⭐ Similar"; 
      if (similaridade >= 40) return "⭐ Pouco Similar";
      return "❌ Diferente";
    };

    // Normalizar alimento para 100g
    const normalizarAlimento = (alimento) => {
      const fatorNormalizacao = 100 / alimento.porcaoReferencia;
    
    return {
        caloria: alimento.caloria * fatorNormalizacao,
        proteina: alimento.proteina * fatorNormalizacao,
        carboidrato: alimento.carboidrato * fatorNormalizacao,
        gordura: alimento.gordura * fatorNormalizacao
      };
    };
    
    // Obter comparação detalhada entre dois alimentos
    const obterComparacaoDetalhada = (alimento1, alimento2) => {
      const norm1 = normalizarAlimento(alimento1);
      const norm2 = normalizarAlimento(alimento2);
      
      const difCalorias = (norm2.caloria - norm1.caloria).toFixed(1);
      const difProteinas = (norm2.proteina - norm1.proteina).toFixed(1);
      const difCarboidratos = (norm2.carboidrato - norm1.carboidrato).toFixed(1);
      const difGorduras = (norm2.gordura - norm1.gordura).toFixed(1);
      
      return `COMPARAÇÃO NUTRICIONAL (por 100g):
      
${alimento1.nome}:
• ${norm1.caloria.toFixed(0)} kcal
• ${norm1.proteina.toFixed(1)}g proteínas  
• ${norm1.carboidrato.toFixed(1)}g carboidratos
• ${norm1.gordura.toFixed(1)}g gorduras

${alimento2.nome}:
• ${norm2.caloria.toFixed(0)} kcal (${difCalorias > 0 ? '+' : ''}${difCalorias})
• ${norm2.proteina.toFixed(1)}g proteínas (${difProteinas > 0 ? '+' : ''}${difProteinas})
• ${norm2.carboidrato.toFixed(1)}g carboidratos (${difCarboidratos > 0 ? '+' : ''}${difCarboidratos})
• ${norm2.gordura.toFixed(1)}g gorduras (${difGorduras > 0 ? '+' : ''}${difGorduras})`;
    };
    
    // Calcular calorias de um prato
    const calcularCaloriasPrato = (prato) => {
      if (!prato || !prato.alimentos) return 0;
      return prato.alimentos.reduce((total, item) => {
        if (!item.alimento) return total;
        return total + (item.alimento.caloria * (item.porcao / item.alimento.porcaoReferencia));
      }, 0);
    };

    // Calcular proteínas de um prato
    const calcularProteinasPrato = (prato) => {
      if (!prato || !prato.alimentos) return 0;
      return prato.alimentos.reduce((total, item) => {
        if (!item.alimento) return total;
        return total + (item.alimento.proteina * (item.porcao / item.alimento.porcaoReferencia));
      }, 0);
    };

    // Calcular carboidratos de um prato
    const calcularCarboidratosPrato = (prato) => {
      if (!prato || !prato.alimentos) return 0;
      return prato.alimentos.reduce((total, item) => {
        if (!item.alimento) return total;
        return total + (item.alimento.carboidrato * (item.porcao / item.alimento.porcaoReferencia));
      }, 0);
    };

    // Calcular gorduras de um prato
    const calcularGordurasPrato = (prato) => {
      if (!prato || !prato.alimentos) return 0;
      return prato.alimentos.reduce((total, item) => {
        if (!item.alimento) return total;
        return total + (item.alimento.gordura * (item.porcao / item.alimento.porcaoReferencia));
      }, 0);
    };

    // Funções para calcular valores individuais dos alimentos
    const calcularCaloriasAlimento = (item) => {
      if (!item.alimento) return 0;
      const proporcao = item.porcao / item.alimento.porcaoReferencia;
      return item.alimento.caloria * proporcao;
    };

    const calcularProteinasAlimento = (item) => {
      if (!item.alimento) return 0;
      const proporcao = item.porcao / item.alimento.porcaoReferencia;
      return item.alimento.proteina * proporcao;
    };

    // Função para gerar cores diferentes para cada alimento
    const getCoresAlimento = (index) => {
      const coresCalorias = [
        '#0d5016', '#2e7d32', '#4caf50', '#66bb6a', '#81c784',
        '#a5d6a7', '#8bc34a', '#689f38', '#558b2f', '#33691e'
      ];
      
      const coresProteinas = [
        '#0a1f4d', '#1565c0', '#2196f3', '#42a5f5', '#64b5f6',
        '#90caf9', '#03a9f4', '#0288d1', '#0277bd', '#01579b'
      ];

      return {
        cal: coresCalorias[index % coresCalorias.length],
        prot: coresProteinas[index % coresProteinas.length]
      };
    };

    // Adicionar novo prato a uma refeição
    const adicionarNovoPrato = (refeicao) => {
      const novoPrato = {
        nome: `Prato ${(refeicao.pratos?.length || 0) + 1}`,
        alimentos: []
      };
      pratoAtual.value = novoPrato;
      refeicaoAtualPrato.value = refeicao;
      showPratoModal.value = true;
    };

    // Editar prato existente
    const editarPrato = (refeicao, prato) => {
      pratoAtual.value = JSON.parse(JSON.stringify(prato));
      refeicaoAtualPrato.value = refeicao;
      showPratoModal.value = true;
    };

    // Duplicar prato
    const duplicarPrato = (refeicao, prato) => {
      planoStore.duplicarPrato(refeicao.id, prato);
    };

    // Remover prato
    const removerPrato = (refeicaoId, pratoId) => {
      if (confirm('Tem certeza que deseja remover este prato?')) {
        planoStore.removerPrato(refeicaoId, pratoId);
      }
    };

    // Salvar prato
    const salvarPrato = () => {
      if (pratoAtual.value.alimentos.length === 0) {
        alert('Adicione pelo menos um alimento ao prato.');
        return;
      }
      
      // Garantir que o prato tenha a estrutura de restrições
      if (!pratoAtual.value.restricoes) {
        pratoAtual.value.restricoes = [];
      }
      
      if (pratoAtual.value.id) {
        // Atualizar prato existente
        planoStore.atualizarPrato(refeicaoAtualPrato.value.id, pratoAtual.value);
      } else {
        // Adicionar novo prato
        planoStore.adicionarPrato(refeicaoAtualPrato.value.id, pratoAtual.value);
      }
      
      fecharPratoModal();
    };

    // Fechar modal do prato
    const fecharPratoModal = () => {
      showPratoModal.value = false;
      pratoAtual.value = { nome: '', alimentos: [] };
      refeicaoAtualPrato.value = null;
      // Limpar seleções do prato
      tipoAlimentoSelecionadoPrato.value = '';
      alimentoSelecionadoPrato.value = '';
      porcaoAlimentoPrato.value = 100;
    };

    // Adicionar alimento ao prato em edição
    const adicionarAlimentoAoPrato = () => {
      const alimento = alimentosStore.getAlimentoById(alimentoSelecionadoPrato.value);
      if (!alimento) return;
      
      const novoItem = {
        alimento: alimento,
        porcao: porcaoAlimentoPrato.value,
        substituivel: true
      };
      
      pratoAtual.value.alimentos.push(novoItem);
      
      // Limpar seleção
      tipoAlimentoSelecionadoPrato.value = '';
      alimentoSelecionadoPrato.value = '';
      porcaoAlimentoPrato.value = 100;
    };

    // Remover alimento do prato
    const removerAlimentoDoPrato = (index) => {
      pratoAtual.value.alimentos.splice(index, 1);
    };

    // Recalcular calorias do prato (chamado quando porção é alterada)
    const recalcularCaloriasPrato = () => {
      // Esta função é chamada automaticamente pelos computed watchers
      // Mas pode ser usada para forçar atualizações se necessário
    };

    // Algoritmo Genético para calcular quantidades ideais
    /**
 * Calcula as quantidades ideais (em g) de cada alimento de um prato
 * para se aproximar das metas de calorias e proteínas usando
 * um algoritmo genético simples.
 */
const calcularQuantidades = (prato, refeicao) => {
  if (!prato.alimentos?.length) {
    alert('Este prato não possui alimentos para calcular.');
    return;
  }

  // Preparar dados para o modal de configuração
  pratoParaCalculo.value = prato;
  refeicaoParaCalculo.value = refeicao;
  
  // Inicializar restrições, carregando valores salvos se existirem
  restricoesAlimentos.value = prato.alimentos.map((item, index) => {
    // Buscar restrição salva para este alimento
    const restricaoSalva = prato.restricoes?.find(r => r.index === index);
    
    return {
      alimento: item.alimento,
      quantidadeAtual: item.porcao,
      minimo: restricaoSalva?.minimo || null,
      maximo: restricaoSalva?.maximo || null,
      usarRestricao: !!restricaoSalva
    };
  });
  
  showConfigAlgoritmoModal.value = true;
};

// Executar algoritmo genético com restrições
const executarAlgoritmoComRestricoes = (prato, refeicao) => {
  // Verificar se há restrições salvas para este prato
  const restricoesSalvasPrato = prato.restricoes || [];
  
  if (restricoesSalvasPrato.length === 0) {
    if (!confirm('Nenhuma restrição definida para este prato. Deseja executar o algoritmo sem restrições?')) {
      return;
    }
  }

  /* ----------------------- Configurações básicas ----------------------- */
  const META_CAL   = refeicao.metaCalorias   || 500; // kcal
  const META_PROT  = refeicao.metaProteinas  || 40;  // g

  const NUM_INDIVIDUOS = 400;   // população menor → mais rápido
  const NUM_GERACOES   = 400;
  const TAXA_MUTACAO   = 0.10;

  /* ---------------------- Dados normalizados do prato ------------------ */
  const alimentos = prato.alimentos.map(item => ({
    nome      : item.alimento.nome,
    proteina  : item.alimento.proteina,         // p/ porçãoRef
    calorias  : item.alimento.caloria,          // p/ porçãoRef
    porcaoRef : item.alimento.porcaoReferencia  // g
  }));

  /* ---------- Limite de gramas plausível para cada alimento ------------ *
   * Quantidade que, se usada sozinha, atinge exatamente META_CAL.         *
   * gramsMax = META_CAL * porcaoRef / calorias_por_porcao                 */
  const maxGramas = alimentos.map(a => (META_CAL * a.porcaoRef) / a.calorias);

  /* ------------------- Distribuição normal helper ---------------------- */
  function normalRandom(mu = 0, sigma = 1) {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return mu + sigma * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  /* ---------------------- Geração de indivíduos ------------------------ */
  function gerarIndividuo() {
    return maxGramas.map((max, i) => {
      const restricaoSalva = restricoesSalvasPrato.find(r => r.index === i);
      
      let minGrams = 0;
      let maxGrams = max;
      
      if (restricaoSalva && restricaoSalva.usarRestricao) {
        if (restricaoSalva.minimo !== null && restricaoSalva.minimo !== '') {
          minGrams = Math.max(minGrams, parseFloat(restricaoSalva.minimo));
        }
        if (restricaoSalva.maximo !== null && restricaoSalva.maximo !== '') {
          maxGrams = Math.min(maxGrams, parseFloat(restricaoSalva.maximo));
        }
      }
      
      const media  = (minGrams + maxGrams) * 0.5;
      const desvio = (maxGrams - minGrams) * 0.15;
      const g      = normalRandom(media, desvio);
      return Math.max(minGrams, Math.min(maxGrams, g));
    });
  }

  /* --------------------------- Fitness --------------------------------- */
  function calcularFitness(ind) {
    let cal = 0, prot = 0;
    for (let i = 0; i < alimentos.length; i++) {
      // calorias / g  e  proteínas / g
      const calPorG  = alimentos[i].calorias / alimentos[i].porcaoRef;
      const protPorG = alimentos[i].proteina / alimentos[i].porcaoRef;
      cal  += calPorG  * ind[i];
      prot += protPorG * ind[i];
    }
    const erroCal  = (cal  - META_CAL)  ** 2;
    const erroProt = (prot - META_PROT) ** 2;
    return { fitness: erroCal + erroProt, cal, prot };
  }

  /* ----------------------- Operadores GA ------------------------------- */
  const selecionar = (pop, fits) => {
    const a = Math.floor(Math.random() * pop.length);
    const b = Math.floor(Math.random() * pop.length);
    return fits[a].fitness < fits[b].fitness ? pop[a] : pop[b];
  };

  const cruzar = (pai, mae) => pai.map((v, i) => (v + mae[i]) / 2);

  const mutar = ind => ind.map((v, i) => {
    if (Math.random() < TAXA_MUTACAO) {
      const restricaoSalva = restricoesSalvasPrato.find(r => r.index === i);
      
      let minGrams = 0;
      let maxGrams = maxGramas[i];
      
      if (restricaoSalva && restricaoSalva.usarRestricao) {
        if (restricaoSalva.minimo !== null && restricaoSalva.minimo !== '') {
          minGrams = Math.max(minGrams, parseFloat(restricaoSalva.minimo));
        }
        if (restricaoSalva.maximo !== null && restricaoSalva.maximo !== '') {
          maxGrams = Math.min(maxGrams, parseFloat(restricaoSalva.maximo));
        }
      }
      
      const passo = (maxGrams - minGrams) * 0.05;         // ±5% da faixa permitida
      const novo  = v + (Math.random() - 0.5) * 2 * passo;
      return Math.max(minGrams, Math.min(maxGrams, novo));
    }
    return v;
  });

  /* ---------------------- Algoritmo Genético --------------------------- */
  let populacao = Array.from({ length: NUM_INDIVIDUOS }, gerarIndividuo);
  let melhorGlobal = null;

  for (let gen = 0; gen < NUM_GERACOES; gen++) {
    const fits = populacao.map(calcularFitness);

    // elitismo: guarda o melhor da geração
    const [bestIdx] = fits
      .map((f, idx) => [idx, f.fitness])
      .sort((a, b) => a[1] - b[1])[0];
    const elite = populacao[bestIdx];

    if (!melhorGlobal || fits[bestIdx].fitness < melhorGlobal.fitness) {
      melhorGlobal = { ...fits[bestIdx], ind: elite.slice() };
    }

    const novaPop = [elite]; // garante que o melhor permanece
    while (novaPop.length < NUM_INDIVIDUOS) {
      const pai  = selecionar(populacao, fits);
      const mae  = selecionar(populacao, fits);
      const filho = mutar(cruzar(pai, mae));
      novaPop.push(filho);
    }
    populacao = novaPop;
  }

  /* -------------------- Aplica os resultados --------------------------- */
  melhorGlobal.ind.forEach((g, i) => {
    // Arredonda para 1 casa decimal
    prato.alimentos[i].porcao = Math.round(g * 10) / 10;
  });

  /* ------------------------ Feedback ao usuário ------------------------ */
  let msg = `🧮 QUANTIDADES CALCULADAS:\n\n`;
  melhorGlobal.ind.forEach((g, i) => {
    msg += `${alimentos[i].nome}: ${g.toFixed(1)} g\n`;
  });
  msg += `\n📊 TOTAIS CALCULADOS:\n`;
  msg += `• Calorias : ${melhorGlobal.cal.toFixed(1)} kcal (meta: ${META_CAL})\n`;
  msg += `• Proteínas: ${melhorGlobal.prot.toFixed(1)} g   (meta: ${META_PROT})\n`;

  const erroCal  = Math.abs(melhorGlobal.cal  - META_CAL);
  const erroProt = Math.abs(melhorGlobal.prot - META_PROT);

  if (erroCal < 10 && erroProt < 2) {
    msg += `\n✅ Excelente aproximação das metas!`;
  } else if (erroCal < 50 && erroProt < 5) {
    msg += `\n👍 Boa aproximação das metas!`;
  } else {
    msg += `\n⚠️ Pode ser difícil atingir as metas exatas com estes alimentos.`;
  }

  alert(msg);
  planoStore.atualizarPrato(refeicao.id, prato);
};

// Fechar modal de configuração do algoritmo
const fecharModalConfigAlgoritmo = () => {
  showConfigAlgoritmoModal.value = false;
  pratoParaCalculo.value = null;
  refeicaoParaCalculo.value = null;
  restricoesAlimentos.value = [];
};

// Abrir configuração de restrições
const abrirConfigRestricoes = (prato, refeicao) => {
  pratoParaCalculo.value = prato;
  refeicaoParaCalculo.value = refeicao;
  
  // Carregar restrições já salvas para este prato
  const restricoesSalvasPrato = prato.restricoes || [];
  
  // Resetar restrições
  restricoesAlimentos.value = [];
  
  // Criar lista de restrições para o modal
  prato.alimentos.forEach((item, index) => {
    const restricaoExistente = restricoesSalvasPrato.find(r => r.index === index);
    
    restricoesAlimentos.value.push({
      index: index,
      alimento: item.alimento,
      quantidadeAtual: item.porcao,
      usarRestricao: !!restricaoExistente,
      minimo: restricaoExistente?.minimo || item.porcao,
      maximo: restricaoExistente?.maximo || item.porcao
    });
  });
  
  showConfigAlgoritmoModal.value = true;
};

// Salvar restrições
const salvarRestricoes = () => {
  const restricoesAtivas = restricoesAlimentos.value
    .map((r, index) => ({ ...r, index }))
    .filter(r => r.usarRestricao);
  
  // Salvar diretamente no prato
  pratoParaCalculo.value.restricoes = restricoesAtivas;
  
  // Atualizar no store
  const refeicao = refeicoes.value.find(r => r.pratos?.some(p => p.id === pratoParaCalculo.value.id));
  if (refeicao) {
    planoStore.atualizarPrato(refeicao.id, pratoParaCalculo.value);
  }
  
  // Mostrar mensagem de sucesso
  alert(`Restrições salvas com sucesso! ${restricoesAtivas.length} restrições definidas.`);
  
  fecharModalConfigAlgoritmo();
};

// Editar quantidade de um alimento específico
const editarQuantidadeAlimento = (refeicaoId, pratoId, alimentoIndex, item) => {
  try {
    alimentoQuantidade.value = item;
    novaQuantidade.value = item.porcao;
    contextoQuantidade.value = { refeicaoId, pratoId, index: alimentoIndex };
    modoEdicaoCompleta.value = true; // Vai direto para modo completo
    isAdicionandoNovoAlimento.value = false; // Flag para edição
    
    // Pre-selecionar o tipo e alimento atual
    const alimentoAtual = item.alimento;
    
    // Resetar seleções primeiro
    tipoAlimentoModalQuantidade.value = '';
    alimentoSelecionadoModalQuantidade.value = '';
    
    // Verificar se há tipos de alimentos disponíveis
    if (tiposAlimentos.value && tiposAlimentos.value.length > 0) {
      // Tentar encontrar o tipo do alimento atual
      for (const tipo of tiposAlimentos.value) {
        try {
          const alimentosDoTipo = alimentosStore.getAlimentosByTipo(tipo) || [];
          if (alimentosDoTipo.some(a => a.id === alimentoAtual.id)) {
            tipoAlimentoModalQuantidade.value = tipo;
            alimentoSelecionadoModalQuantidade.value = alimentoAtual.id;
            break;
          }
        } catch (error) {
          console.warn('Erro ao buscar alimentos do tipo:', tipo, error);
          continue;
        }
      }
    }
    
    showQuantidadeModal.value = true;
  } catch (error) {
    console.error('Erro ao editar quantidade do alimento:', error);
    alert('Erro ao abrir modal de edição. Tente novamente.');
  }
};

// Salvar nova quantidade
const salvarNovaQuantidade = () => {
  const quantidade = parseFloat(novaQuantidade.value);
  if (isNaN(quantidade) || quantidade <= 0) {
    alert('Por favor, insira uma quantidade válida maior que zero.');
    return;
  }
  
  const { refeicaoId, pratoId, index } = contextoQuantidade.value;
  
  // Encontrar refeição e prato
  const refeicao = refeicoes.value.find(r => r.id === refeicaoId);
  if (!refeicao) return;
  
  const prato = refeicao.pratos.find(p => p.id === pratoId);
  if (!prato) return;
  
  // Verificar se alimento foi selecionado
  if (!alimentoSelecionadoModalQuantidade.value) {
    alert('Por favor, selecione um alimento.');
    return;
  }
  
  // Buscar o alimento selecionado
  const alimentoSelecionado = alimentosStore.alimentos.find(a => a.id === alimentoSelecionadoModalQuantidade.value);
  if (!alimentoSelecionado) {
    alert('Alimento não encontrado.');
    return;
  }
  
  const novoItem = {
    alimento: alimentoSelecionado,
    porcao: quantidade
  };
  
  if (index === -1) {
    // Novo alimento
    prato.alimentos.push(novoItem);
  } else {
    // Substituir alimento existente
    prato.alimentos[index] = novoItem;
  }
  
  // Salvar mudanças
  planoStore.atualizarPrato(refeicaoId, prato);
  
  // Fechar modal
  fecharModalQuantidade();
};

// Fechar modal de quantidade
const fecharModalQuantidade = () => {
  showQuantidadeModal.value = false;
  alimentoQuantidade.value = null;
  novaQuantidade.value = 0;
  modoEdicaoCompleta.value = false;
  isAdicionandoNovoAlimento.value = false; // Resetar flag
  tipoAlimentoModalQuantidade.value = '';
  alimentoSelecionadoModalQuantidade.value = '';
  
  // Limpar contexto por último
  contextoQuantidade.value = { refeicaoId: null, pratoId: null, index: null };
};

// Adicionar novo alimento ao prato
const adicionarNovoAlimento = (refeicaoId, pratoId) => {
  try {
    // Preparar para novo alimento
    alimentoQuantidade.value = null;
    novaQuantidade.value = 100; // Quantidade padrão
    modoEdicaoCompleta.value = true;
    isAdicionandoNovoAlimento.value = true; // Flag para novo alimento
    
    // Resetar seleções
    tipoAlimentoModalQuantidade.value = '';
    alimentoSelecionadoModalQuantidade.value = '';
    
    // Definir contexto
    contextoQuantidade.value = { refeicaoId, pratoId, index: -1 }; // index -1 indica novo alimento
    
    showQuantidadeModal.value = true;
  } catch (error) {
    console.error('Erro ao adicionar novo alimento:', error);
    alert('Erro ao abrir modal de novo alimento. Tente novamente.');
  }
};



// Remover alimento específico do prato (sobrescrevendo a função do modal)
const removerAlimentoIndividual = (refeicaoId, pratoId, alimentoIndex) => {
  if (!confirm('Tem certeza que deseja remover este alimento?')) return;
  
  // Encontrar refeição e prato
  const refeicao = refeicoes.value.find(r => r.id === refeicaoId);
  if (!refeicao) return;
  
  const prato = refeicao.pratos.find(p => p.id === pratoId);
  if (!prato || !prato.alimentos[alimentoIndex]) return;
  
  // Remover alimento
  prato.alimentos.splice(alimentoIndex, 1);
  
  // Salvar mudanças
  planoStore.atualizarPrato(refeicaoId, prato);
};

    return {
      // Estados
      refeicoes,
      pesoUsuario,
      
      // Modal de refeição
      showModal,
      refeicaoModal,
      
      // Modal de prato
      showPratoModal,
      pratoAtual,
      refeicaoAtualPrato,
      
      // Seleção de alimentos (refeição)
      tipoAlimentoSelecionado,
      alimentoSelecionado,
      porcaoAlimento,
      
      // Seleção de alimentos (prato)
      tipoAlimentoSelecionadoPrato,
      alimentoSelecionadoPrato,
      porcaoAlimentoPrato,
      alimentosPorTipoSelecionadoPrato,
      
      // Dados disponíveis
      tiposAlimentos,
      alimentosPorTipoSelecionado,
      
      // Metas e totais diários
      caloriasDiarias,
      proteinasDiarias,
      gorduraMaxima,
      caloriasAlocadas,
      proteinasAlocadas,
      gordurasAlocadas,
      
      // Totais da refeição atual
      caloriasTotalRefeicaoAtual,
      proteinasTotalRefeicaoAtual,
      carboidratosTotalRefeicaoAtual,
      gordurasTotalRefeicaoAtual,
      
      // Totais do prato atual
      caloriasTotalPrato,
      proteinasTotalPrato,
      carboidratosTotalPrato,
      gordurasTotalPrato,
      
      // Funções de refeição
      criarNovaRefeicao,
      editarRefeicao,
      removerRefeicao,
      calcularCaloriasRefeicao,
      salvarRefeicao,
      fecharModal,
      
      // Funções de prato
      calcularCaloriasPrato,
      calcularProteinasPrato,
      calcularCarboidratosPrato,
      calcularGordurasPrato,
      calcularCaloriasAlimento,
      calcularProteinasAlimento,
      getCoresAlimento,
      adicionarNovoPrato,
      editarPrato,
      duplicarPrato,
      removerPrato,
      salvarPrato,
      fecharPratoModal,
      adicionarAlimentoAoPrato,
      removerAlimentoDoPrato,
      recalcularCaloriasPrato,
      calcularQuantidades,
      editarQuantidadeAlimento,
      removerAlimentoIndividual,
      
      // Funções de alimento (compatibilidade)
      adicionarAlimentoNaRefeicao,
      removerAlimentoDaRefeicao,
      recalcularCalorias,
      substituirAlimento,
      
      // Funções de substituição
      calcularPorcaoSubstituta,
      getSubstitutosPossiveis,
      calcularSimilaridadeTexto,
      normalizarAlimento,
      obterComparacaoDetalhada,
      
      // Modal de substituição
      showSubstituicaoModal,
      alimentoOriginal,
      substitutosDisponiveis,
      substitutosFiltrados,
      abrirModalSubstituicao,
      fecharModalSubstituicao,
      selecionarSubstituto,
      buscaSubstituto,
      filtrarSubstitutos,
      limparBusca,

      // Modal de quantidade
      showQuantidadeModal,
      alimentoQuantidade,
      novaQuantidade,
      salvarNovaQuantidade,
      fecharModalQuantidade,
      adicionarNovoAlimento,
      modoEdicaoCompleta,
      tipoAlimentoModalQuantidade,
      alimentoSelecionadoModalQuantidade,
      alimentosPorTipoSelecionadoModalQuantidade,
      alimentoPrevisaoSelecionado,
      isNovoAlimento,
      isAdicionandoNovoAlimento,

      // Modal de configuração do algoritmo
      showConfigAlgoritmoModal,
      restricoesAlimentos,
      executarAlgoritmoComRestricoes,
      fecharModalConfigAlgoritmo,
      abrirConfigRestricoes,
      salvarRestricoes,

      // Navegação entre refeições
      currentRefeicaoIndex,
      refeicaoAtual: computed(() => refeicoes.value[currentRefeicaoIndex.value] || null),
      proximaRefeicao: () => {
        if (currentRefeicaoIndex.value < refeicoes.value.length - 1) {
          currentRefeicaoIndex.value++;
        }
      },
      refeicaoAnterior: () => {
        if (currentRefeicaoIndex.value > 0) {
          currentRefeicaoIndex.value--;
        }
      },
      irParaRefeicao: (index) => {
        if (index >= 0 && index < refeicoes.value.length) {
          currentRefeicaoIndex.value = index;
        }
      }
    };
  },
  methods: {
    getMacronutrientesPoints() {
      const center = 100;
      const maxDistance = 80;
      
      // Calcula as proporções (limitadas a 100%)
      const caloriaRatio = Math.min(this.caloriasAlocadas / this.caloriasDiarias, 1);
      const proteinaRatio = Math.min(this.proteinasAlocadas / this.proteinasDiarias, 1);
      const carboidratoRatio = Math.min(this.carboidratosAlocados / this.carboidratosDiarios, 1);
      const gorduraRatio = Math.min(this.gordurasAlocadas / this.gorduraMaxima, 1);
      
      // Calcula os pontos do quadrilátero
      const top = center - (maxDistance * caloriaRatio);
      const right = center + (maxDistance * proteinaRatio);
      const bottom = center + (maxDistance * carboidratoRatio);
      const left = center - (maxDistance * gorduraRatio);
      
      return `${center},${top} ${right},${center} ${center},${bottom} ${left},${center}`;
    },
    getMacronutrientesPointsRefeicao(refeicao) {
      const center = 100;
      const maxDistance = 80;
      
      // Calcula totais da refeição
      const totalCalorias = refeicao.pratos.reduce((sum, prato) => sum + this.calcularCaloriasPrato(prato), 0);
      const totalProteinas = refeicao.pratos.reduce((sum, prato) => sum + this.calcularProteinasPrato(prato), 0);
      const totalCarboidratos = refeicao.pratos.reduce((sum, prato) => sum + this.calcularCarboidratosPrato(prato), 0);
      const totalGorduras = refeicao.pratos.reduce((sum, prato) => sum + this.calcularGordurasPrato(prato), 0);
      
      // Calcula as proporções (limitadas a 100%)
      const caloriaRatio = Math.min(totalCalorias / (refeicao.metaCalorias || 1), 1);
      const proteinaRatio = Math.min(totalProteinas / (refeicao.metaProteinas || 1), 1);
      const carboidratoRatio = Math.min(totalCarboidratos / (refeicao.metaCarboidratos || 1), 1);
      const gorduraRatio = Math.min(totalGorduras / (refeicao.metaGorduras || 1), 1);
      
      // Calcula os pontos do quadrilátero
      const top = center - (maxDistance * caloriaRatio);
      const right = center + (maxDistance * proteinaRatio);
      const bottom = center + (maxDistance * carboidratoRatio);
      const left = center - (maxDistance * gorduraRatio);
      
      return `${center},${top} ${right},${center} ${center},${bottom} ${left},${center}`;
    },
    getMacronutrientesPointsPrato(prato, refeicao) {
      const center = 100;
      const maxDistance = 80;
      
      // Calcula valores específicos do prato
      const totalCalorias = this.calcularCaloriasPrato(prato);
      const totalProteinas = this.calcularProteinasPrato(prato);
      const totalCarboidratos = this.calcularCarboidratosPrato(prato);
      const totalGorduras = this.calcularGordurasPrato(prato);
      
      // Calcula as proporções
      // Caloria e proteína: baseadas nas metas da refeição
      const caloriaRatio = totalCalorias / (refeicao.metaCalorias || 1);
const proteinaRatio = totalProteinas / (refeicao.metaProteinas || 1);

      
      // Carboidrato e gordura: baseadas nas calorias do próprio prato
      const carboidratoRatio = Math.min(totalCarboidratos * 4 / (totalCalorias || 1), 1); // 4 kcal/g carb
      const gorduraRatio = Math.min(totalGorduras * 9 / (totalCalorias || 1), 1); // 9 kcal/g gord
      
      // Calcula os pontos do quadrilátero (reposicionados)
      // Topo: Calorias, Baixo: Proteínas, Direita: Carboidratos, Esquerda: Gorduras
      const top = center - (maxDistance * caloriaRatio);
      const bottom = center + (maxDistance * proteinaRatio);
      const right = center + (maxDistance * carboidratoRatio);
      const left = center - (maxDistance * gorduraRatio);
      
      return `${center},${top} ${right},${center} ${center},${bottom} ${left},${center}`;
    }
  }
}
</script>

<style scoped>
.plano-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  color: var(--text-color);
  margin-bottom: 20px;
}

.info-cards {
  margin-bottom: 30px;
}

.info-card {
  background-color: var(--card-bg);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px var(--card-shadow);
}

.info-row {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  margin-bottom: 20px;
}

.info-item {
  flex: 1;
}

.info-item h4 {
  margin-bottom: 5px;
  color: var(--primary-color);
}

.info-item p {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
  color: var(--text-color-card);
}

.progress-bar {
  width: 100%;
  height: 10px;
  background-color: var(--progress-bg);
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 5px;
}

.progress {
  height: 100%;
  background-color: var(--progress-primary);
  transition: width 0.3s ease;
}

.progress.blue {
  background-color: var(--progress-secondary);
}

.progress.red {
  background-color: var(--progress-danger);
}

.progress-text {
  font-size: 12px;
  color: var(--text-color-card);
}

.alert-box {
  background-color: var(--warning-bg);
  color: var(--warning-color);
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.btn-config {
  background-color: var(--warning-color);
  color: var(--warning-bg);
  padding: 8px 15px;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
}



.form-group {
  margin-bottom: 15px;
}

.form-row {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.form-row .form-group {
  flex: 1;
  margin-bottom: 0;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: var(--label-color);
}

input, select, textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 16px;
  background-color: var(--input-bg);
  color: var(--input-text);
}

button {
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
  width: 100%;
  padding: 12px;
  font-size: 16px;
  margin-top: 10px;
}

.btn-primary:hover {
  background-color: var(--primary-hover);
}



.navegacao-refeicoes {
  margin-bottom: 20px;
  padding: 15px;
  background-color: var(--card-bg);
  border-radius: 8px;
  box-shadow: 0 2px 4px var(--card-shadow);
}

.navegacao-controles {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.btn-navegacao {
  padding: 6px 12px;
  background-color: transparent;
  color: var(--text-color-card);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
  font-weight: 400;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.btn-navegacao:hover:not(:disabled) {
  background-color: var(--hover-bg);
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.btn-navegacao:disabled {
  background-color: transparent;
  border-color: var(--border-color);
  color: var(--text-secondary);
  cursor: not-allowed;
  opacity: 0.5;
}

.refeicao-seletor {
  display: flex;
  align-items: center;
  gap: 15px;
}

.select-refeicao {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--input-bg);
  color: var(--text-color-card);
  font-size: 1rem;
  min-width: 200px;
}

.contador-refeicoes {
  font-size: 0.9em;
  color: var(--text-secondary);
  font-weight: 500;
  white-space: nowrap;
}

.sem-refeicoes {
  text-align: center;
  padding: 20px;
  color: var(--text-color-card);
}

.sem-refeicoes h3 {
  margin: 0 0 10px 0;
  color: var(--text-color-card);
}

.sem-refeicoes p {
  margin: 0;
  color: var(--text-secondary);
  font-style: italic;
}

.nova-refeicao-container {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid var(--border-color);
  text-align: center;
}

.btn-nova-refeicao {
  padding: 8px 16px;
  background: transparent;
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
  border-radius: 4px;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-nova-refeicao:hover {
  background: var(--primary-color);
  color: white;
}

.refeicoes-container {
  margin-top: 30px;
}

.refeicao-card {
  background-color: var(--card-bg);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px var(--card-shadow);
  position: relative;
  color: var(--text-color-card);
}

.refeicao-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.refeicao-actions {
  display: flex;
  gap: 10px;
}

.refeicao-header h3 {
  margin: 0;
  color: var(--text-color-card);
}

.refeicao-header p {
  margin: 5px 0 0;
  color: var(--text-color-card);
  font-style: italic;
}

.refeicao-calorias {
  font-size: 18px;
  font-weight: bold;
  color: var(--primary-color);
}

.btn-edit, .btn-delete {
  font-size: 12px;
  padding: 6px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-edit {
  background-color: var(--secondary-color);
  color: white;
}

.btn-edit:hover {
  background-color: var(--secondary-hover);
}

.btn-delete {
  background-color: var(--danger-color);
  color: white;
}

.btn-delete:hover {
  background-color: var(--danger-hover);
}

.alimentos-list {
  margin-top: 20px;
}

.alimentos-list h4 {
  margin-bottom: 10px;
  color: var(--text-color-card);
}

.alimentos-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.alimento-item {
  padding: 8px 0;
  border-bottom: 1px solid var(--border-color);
}

.alimento-item:last-child {
  border-bottom: none;
}

.alimento-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.alimento-nome {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 5px;
}

.alimento-macros-inline {
  display: flex;
  gap: 6px;
}

.alimento-macros-inline .macro-inline {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 3px 6px;
  background-color: rgba(0, 0, 0, 0.03);
  border-radius: 3px;
  font-size: 0.8em;
}

.alimento-macros-inline .macro-label {
  font-size: 0.7em;
  opacity: 0.8;
  color: var(--text-color-card);
}

.alimento-macros-inline .macro-value {
  font-weight: 600;
  font-size: 0.85em;
  color: var(--primary-color);
  margin-top: 1px;
}

.alimento-info-completa {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
}

.alimento-barras {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 100px;
}

.alimento-barra-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.alimento-barra-cal,
.alimento-barra-prot {
  width: 80px;
  height: 4px;
  background-color: var(--progress-bg);
  border-radius: 2px;
  overflow: hidden;
  position: relative;
}

.alimento-barra-cal::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: var(--progresso-width, 0%);
  background-color: var(--cor-alimento);
  transition: width 0.3s ease;
}

.alimento-barra-prot::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: var(--progresso-width, 0%);
  background-color: var(--cor-alimento);
  transition: width 0.3s ease;
}

.barra-label {
  font-size: 0.7em;
  color: var(--text-color-card);
  opacity: 0.8;
  min-width: 35px;
  font-weight: 500;
  text-align: right;
}

.btn-substituir {
  background: none;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 4px 6px;
  font-size: 12px;
  cursor: pointer;
  color: var(--text-color-card);
  transition: all 0.2s ease;
}

.btn-substituir:hover {
  border-color: var(--primary-color);
  background-color: var(--primary-color);
  color: white;
  transform: scale(1.1);
}

.select-substituto option {
  padding: 5px;
}

/* Estilo visual para diferentes níveis de similaridade */
.similaridade-info {
  margin-top: 5px;
  font-size: 12px;
  font-style: italic;
  color: var(--text-color-card);
}

.empty-message {
  color: var(--text-color-card);
  font-style: italic;
  text-align: center;
  padding: 20px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal {
  background-color: var(--card-bg);
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px var(--card-shadow);
  color: var(--text-color-card);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h2 {
  margin: 0;
  color: var(--text-color-card);
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--text-color-card);
  padding: 0;
}

.modal-body {
  padding: 20px;
}

.alimento-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: var(--table-header);
  border-radius: 4px;
  margin-bottom: 10px;
}

.alimento-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.alimento-actions input {
  width: 70px;
}

.btn-delete-sm {
  background-color: var(--danger-color);
  color: white;
  padding: 5px 10px;
  font-size: 12px;
}

.btn-delete-sm:hover {
  background-color: var(--danger-hover);
}

.add-alimento-section {
  margin-top: 20px;
  padding: 15px;
  background-color: var(--table-header);
  border-radius: 8px;
}

.add-alimento-section h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: var(--text-color-card);
}

.btn-add {
  background-color: var(--primary-color);
  color: white;
  display: block;
  width: 100%;
  margin-top: 15px;
}

.btn-add:hover {
  background-color: var(--primary-hover);
}

.btn-add:disabled {
  background-color: var(--neutral-color);
  cursor: not-allowed;
}

.refeicao-info {
  margin-top: 20px;
  background-color: var(--table-header);
  padding: 15px;
  border-radius: 8px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  color: var(--text-color-card);
}

.refeicao-info .info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-footer {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 15px;
}

.btn-save {
  background-color: var(--primary-color);
  color: white;
  padding: 10px 25px;
}

.btn-save:hover {
  background-color: var(--primary-hover);
}

.btn-cancel {
  background-color: var(--neutral-color);
  color: var(--text-color);
  padding: 10px 25px;
}

.btn-cancel:hover {
  background-color: var(--neutral-hover);
}

.navigation {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-top: 30px;
}

.nav-button {
  flex: 1;
  display: block;
  padding: 15px;
  background-color: var(--primary-color);
  color: white;
  text-align: center;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.2s;
}

.nav-button:hover {
  background-color: var(--primary-hover);
}

/* Estilos adicionais para refeições */

.metas-refeicao {
  display: flex;
  gap: 20px;
  margin-top: 8px;
}

.meta {
  background-color: #e3f2fd;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.9em;
  color: #1976d2;
  font-weight: 500;
}

.pratos-container {
  margin-top: 20px;
}

.prato-card {
  border: 1px solid var(--border-color);
  border-radius: 6px;
  margin-bottom: 15px;
  padding: 15px;
  background-color: var(--card-bg);
  box-shadow: 0 2px 4px var(--card-shadow);
}

.prato-header {
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-color);
}

.prato-titulo-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.prato-titulo-row h4 {
  margin: 0;
  color: var(--text-color-card);
  font-size: 1.1em;
}

.prato-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
}

.prato-macros-inline {
  display: flex;
  gap: 8px;
  flex: 1;
}

.macro-inline {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 4px 8px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.macro-inline .macro-label {
  font-size: 0.75em;
  opacity: 0.8;
  color: var(--text-color-card);
}

.macro-inline .macro-value {
  font-weight: 600;
  font-size: 0.9em;
  color: var(--primary-color);
  margin-top: 2px;
}

.prato-actions {
  display: flex;
  gap: 5px;
}

.prato-progressos {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 150px;
}

.progresso-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.prato-progresso {
  width: 80px;
  height: 6px;
  background-color: var(--progress-bg);
  border-radius: 3px;
  overflow: hidden;
  display: flex;
}

.progresso-segmento-cal,
.progresso-segmento-prot {
  height: 100%;
  min-width: 3px;
  transition: width 0.3s ease;
  border-right: 1px solid rgba(255, 255, 255, 0.4);
  flex-shrink: 0;
}

.progresso-segmento-cal:last-child,
.progresso-segmento-prot:last-child {
  border-right: none;
}

/* Classes de cores para calorias - Tons de Verde com maior variação */
.cor-cal-0 { background-color: #0d5016 !important; } /* Verde muito escuro */
.cor-cal-1 { background-color: #2e7d32 !important; } /* Verde escuro */
.cor-cal-2 { background-color: #4caf50 !important; } /* Verde padrão */
.cor-cal-3 { background-color: #66bb6a !important; } /* Verde médio */
.cor-cal-4 { background-color: #81c784 !important; } /* Verde claro */
.cor-cal-5 { background-color: #a5d6a7 !important; } /* Verde muito claro */
.cor-cal-6 { background-color: #8bc34a !important; } /* Verde lima */
.cor-cal-7 { background-color: #689f38 !important; } /* Verde oliva */
.cor-cal-8 { background-color: #558b2f !important; } /* Verde musgo */
.cor-cal-9 { background-color: #33691e !important; } /* Verde floresta */

/* Classes de cores para proteínas - Tons de Azul com maior variação */
.cor-prot-0 { background-color: #0a1f4d !important; } /* Azul muito escuro */
.cor-prot-1 { background-color: #1565c0 !important; } /* Azul escuro */
.cor-prot-2 { background-color: #2196f3 !important; } /* Azul padrão */
.cor-prot-3 { background-color: #42a5f5 !important; } /* Azul médio */
.cor-prot-4 { background-color: #64b5f6 !important; } /* Azul claro */
.cor-prot-5 { background-color: #90caf9 !important; } /* Azul muito claro */
.cor-prot-6 { background-color: #03a9f4 !important; } /* Azul ciano */
.cor-prot-7 { background-color: #0288d1 !important; } /* Azul oceano */
.cor-prot-8 { background-color: #0277bd !important; } /* Azul profundo */
.cor-prot-9 { background-color: #01579b !important; } /* Azul marinho */

.progresso-diferenca {
  font-size: 0.75em;
  font-weight: 500;
  color: var(--text-color-card);
  white-space: nowrap;
  min-width: 60px;
}

.btn-config-restricoes, .btn-calcular-qtd, .btn-edit-prato, .btn-delete-prato, .btn-edit-quantidade, .btn-substituir, .btn-delete-alimento {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
}

.btn-config-restricoes:hover {
  background-color: rgba(255, 152, 0, 0.1);
}

.btn-calcular-qtd:hover {
  background-color: rgba(33, 150, 243, 0.1);
}

.btn-edit-prato:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.btn-delete-prato:hover {
  background-color: rgba(255, 0, 0, 0.1);
}

.btn-edit-quantidade:hover {
  background-color: rgba(76, 175, 80, 0.1);
}

.btn-substituir:hover {
  background-color: rgba(255, 152, 0, 0.1);
}

.btn-delete-alimento:hover {
  background-color: rgba(244, 67, 54, 0.1);
}

.alimento-actions {
  display: flex;
  gap: 4px;
  align-items: center;
}

.btn-add-prato {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #2196f3, #1976d2);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  margin-top: 15px;
  transition: all 0.3s ease;
}

.btn-add-prato:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
}

.add-alimento-section {
  margin-top: 15px;
  text-align: center;
}

.btn-add-alimento {
  padding: 8px 16px;
  background: linear-gradient(135deg, #4caf50, #388e3c);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.btn-add-alimento:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.compatibilidade-antiga {
  padding: 15px;
  background-color: #fff3e0;
  border: 1px solid #ffb74d;
  border-radius: 6px;
  color: #e65100;
}

.form-row {
  display: flex;
  gap: 20px;
}

.form-row .form-group {
  flex: 1;
}

.prato-preview {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

  .prato-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .prato-info span {
    font-size: 0.9em;
    color: #666;
  }

  .prato-progress {
    width: 120px;
  }

  .progress-bar {
    width: 100%;
    height: 8px;
    background-color: #e0e0e0;
    border-radius: 4px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #4caf50, #8bc34a);
    transition: width 0.3s ease;
  }

  .nutricional-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    background-color: #f5f5f5;
    border-radius: 6px;
    margin: 20px 0;
  }

  .info-message {
    background-color: #e3f2fd;
    border: 1px solid #2196f3;
    border-radius: 6px;
    padding: 15px;
    margin: 20px 0;
  }

  .info-message p {
    margin: 0 0 10px 0;
    color: #1976d2;
  }

  .info-message ol {
    margin: 0;
    padding-left: 20px;
    color: #555;
  }

  .info-message li {
    margin-bottom: 5px;
  }

  .info-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .info-item span {
    font-size: 0.9em;
    color: #666;
  }

  .info-item strong {
    font-size: 1.1em;
    color: #333;
  }

  /* Modal de substituição */
  .modal-substituicao {
    max-width: 700px;
  }

  .busca-input-group {
    position: relative;
    margin-bottom: 20px;
  }

  .busca-input {
    width: 100%;
    padding: 12px 40px 12px 15px;
    border: 2px solid var(--border-color);
    border-radius: 8px;
    font-size: 16px;
    background: var(--input-bg);
    color: var(--text-color-card);
    transition: border-color 0.3s ease;
  }

  .busca-input:focus {
    outline: none;
    border-color: var(--primary-color);
  }

  .btn-limpar-busca {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    font-size: 18px;
    color: #999;
    cursor: pointer;
    padding: 5px;
    border-radius: 3px;
    transition: background-color 0.3s ease;
  }

  .btn-limpar-busca:hover {
    background-color: rgba(255, 0, 0, 0.1);
    color: #ff4444;
  }



  /* Modal de quantidade */
  .modal-quantidade {
    max-width: 450px;
  }

  .alimento-info {
    background-color: var(--table-header);
    padding: 15px;
    border-radius: 6px;
    margin-bottom: 20px;
    text-align: center;
  }

  .alimento-info h3 {
    margin: 0 0 10px 0;
    color: var(--text-color-card);
  }

  .alimento-info p {
    margin: 5px 0;
    color: var(--text-color-card);
  }

  .macros-atuais {
    display: flex;
    gap: 15px;
    justify-content: center;
    margin-top: 10px;
  }

  .macros-atuais span {
    background-color: rgba(0, 0, 0, 0.1);
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.9em;
    color: var(--text-color-card);
  }

  .macros-previsao {
    background-color: #e8f5e8;
    padding: 15px;
    border-radius: 6px;
    margin: 15px 0;
    border: 1px solid #4caf50;
  }

  .macros-previsao h4 {
    margin: 0 0 10px 0;
    color: #2e7d32;
  }

  .macros-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .macros-grid span {
    background-color: rgba(76, 175, 80, 0.1);
    padding: 6px 10px;
    border-radius: 4px;
    text-align: center;
    font-weight: 500;
    color: #2e7d32;
  }

  /* Modal de configuração do algoritmo genético */
  .modal-config-algoritmo {
    max-width: 700px;
    max-height: 80vh;
    overflow-y: auto;
  }

  .info-algoritmo {
    background-color: var(--primary-color);
    color: white;
    padding: 15px;
    border-radius: 6px;
    margin-bottom: 20px;
    text-align: center;
  }

  .info-algoritmo p {
    margin: 5px 0;
  }

  .restricoes-lista {
    max-height: 400px;
    overflow-y: auto;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    padding: 10px;
    margin-bottom: 20px;
  }

  .restricao-item {
    border: 1px solid var(--border-color);
    border-radius: 6px;
    padding: 15px;
    margin-bottom: 15px;
    background-color: var(--card-bg);
    color: var(--text-color-card);
  }

  .restricao-item:last-child {
    margin-bottom: 0;
  }

  .alimento-header-config {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .alimento-info-config {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .alimento-info-config strong {
    color: var(--text-color-card);
  }

  .quantidade-atual {
    font-size: 0.9em;
    color: var(--text-color-card);
    opacity: 0.7;
    font-style: italic;
  }

  .checkbox-restricao {
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    color: var(--primary-color);
    font-weight: 500;
  }

  .checkbox-restricao input[type="checkbox"] {
    width: auto;
    margin: 0;
  }

  .restricoes-inputs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
    margin-top: 15px;
    padding-top: 15px;
    border-top: 1px solid var(--border-color);
  }

  .input-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .input-group label {
    font-size: 0.9em;
    font-weight: 500;
    color: var(--label-color);
  }

  .input-group input {
    padding: 8px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    font-size: 14px;
    background-color: var(--input-bg);
    color: var(--input-text);
  }

  .resumo-restricoes {
    background-color: #e8f5e8;
    border: 1px solid #4caf50;
    border-radius: 6px;
    padding: 15px;
    margin-bottom: 20px;
  }

  .resumo-restricoes h4 {
    margin: 0 0 10px 0;
    color: #2e7d32;
  }

  .resumo-restricoes ul {
    margin: 0;
    padding-left: 20px;
  }

  .resumo-restricoes li {
    margin-bottom: 8px;
    color: #2e7d32;
  }

  .alimento-original {
    background-color: var(--table-header);
    padding: 15px;
    border-radius: 6px;
    margin-bottom: 20px;
  }

  .alimento-original h3 {
    margin-top: 0;
    color: var(--text-color-card);
  }

  .alimento-info-original {
    display: flex;
    flex-direction: column;
    gap: 12px;
    color: var(--text-color-card);
  }

  .alimento-nome-original {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 1.1em;
  }

  .macros-original {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .macro-item {
    display: flex;
    justify-content: space-between;
    padding: 4px 8px;
    background-color: rgba(0, 0, 0, 0.05);
    border-radius: 4px;
  }

  .macro-label {
    font-weight: 500;
    color: var(--text-color-card);
  }

  .macro-value {
    font-weight: 600;
    color: var(--primary-color);
  }

  .substitutos-lista h3 {
    color: var(--text-color-card);
    margin-bottom: 15px;
  }

  .substitutos-grid {
    display: grid;
    gap: 10px;
    max-height: 400px;
    overflow-y: auto;
  }

  .substituto-card {
    border: 1px solid var(--border-color);
    border-radius: 6px;
    padding: 12px;
    background-color: var(--card-bg);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .substituto-card:hover {
    border-color: var(--primary-color);
    box-shadow: 0 2px 8px rgba(33, 150, 243, 0.2);
    transform: translateY(-1px);
  }

  .substituto-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--border-color);
  }

  .substituto-header strong {
    color: var(--text-color-card);
    font-size: 1.05em;
  }

  .similaridade {
    font-size: 0.85em;
    color: var(--primary-color);
    font-weight: 500;
  }

  .substituto-macros {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .porcao-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.9em;
  }

  .porcao-label {
    color: var(--text-color-card);
    opacity: 0.8;
  }

  .porcao-value {
    font-weight: 600;
    color: var(--text-color-card);
  }

  .macros-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 6px;
  }

  .macros-grid .macro-item {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 6px 4px;
    font-size: 0.85em;
  }

  .macros-grid .macro-label {
    font-size: 0.75em;
    opacity: 0.8;
  }

  .macros-grid .macro-value {
    font-size: 0.9em;
    margin-top: 2px;
  }

  .progresso-container {
    display: flex;
    gap: 20px;
    align-items: center;
    margin-bottom: 20px;
  }

  .barras-progresso {
    flex: 1;
  }

  .macronutrientes-chart {
    width: 150px;
    height: 150px;
    flex-shrink: 0;
    border-left: 1px solid var(--border-color);
    padding-left: 15px;
    background-color: #2c3e50;
    border-radius: 8px;
    padding: 10px;
  }

  .macronutrientes-svg {
    width: 100%;
    height: 100%;
  }

  .chart-label {
    font-size: 10px;
    fill: var(--text-secondary);
  }

  .refeicao-content {
    display: flex;
    gap: 20px;
    margin-top: 20px;
  }

  .pratos-container {
    flex: 1;
  }

  .macronutrientes-chart {
    width: 200px;
    height: 200px;
    flex-shrink: 0;
    border-left: 1px solid var(--border-color);
    padding-left: 20px;
  }

  .macronutrientes-svg {
    width: 100%;
    height: 100%;
  }

  .chart-label {
    font-size: 10px;
    fill: var(--text-secondary);
  }

  .prato-content {
    display: flex;
    gap: 20px;
    margin-top: 15px;
  }

  .alimentos-list {
    flex: 1;
  }

  .macronutrientes-chart {
    width: 150px;
    height: 150px;
    flex-shrink: 0;
    border-left: 1px solid var(--border-color);
    padding-left: 15px;
}

.btn-delete-prato {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2em;
  color: var(--error-color);
  padding: 0.2em;
  transition: transform 0.2s;
}

.btn-duplicar-prato {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2em;
  color: var(--info-color);
  padding: 0.2em;
  transition: transform 0.2s;
}

.btn-duplicar-prato:hover {
  transform: scale(1.2);
}

.btn-delete-prato:hover {
  background-color: rgba(255, 0, 0, 0.1);
}
</style> 