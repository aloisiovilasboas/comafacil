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
        
        <!-- Pratos da refeição -->
        <div class="pratos-container">
          <div v-if="refeicaoAtual.pratos && refeicaoAtual.pratos.length > 0">
            <div v-for="(prato, pratoIndex) in refeicaoAtual.pratos" :key="prato.id" class="prato-card">
              <div class="prato-header">
                <div class="prato-titulo-row">
                  <h4>{{ prato.nome || `Prato ${pratoIndex + 1}` }}</h4>
                  <div class="prato-actions">
                    <button class="btn-edit-prato" @click="editarPrato(refeicaoAtual, prato)">✏️</button>
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
                </div>
              </div>
              
              <div class="alimentos-list" v-if="prato.alimentos && prato.alimentos.length > 0">
                <ul>
                  <li v-for="(item, idx) in prato.alimentos" :key="idx">
                    <div class="alimento-item">
                      <div class="alimento-header">
                        <div class="alimento-nome">
                          <strong>{{ item.alimento.nome }}</strong> 
                          <span>({{ item.porcao }}g)</span>
                        </div>
                        <button @click="abrirModalSubstituicao(refeicaoAtual.id, prato.id, idx, item)" 
                                class="btn-substituir" 
                                title="Substituir alimento">
                          🔄
                        </button>
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
    
    <!-- Modal de edição de refeição -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ refeicaoAtual.id ? 'Editar' : 'Nova' }} Refeição</h2>
          <button @click="fecharModal" class="btn-close">&times;</button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="salvarRefeicao">
            <div class="form-group">
              <label for="nomeRefeicao">Nome da Refeição:</label>
              <input type="text" id="nomeRefeicao" v-model="refeicaoAtual.nome" placeholder="Ex: Café da Manhã" />
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="metaCalorias">Meta de Calorias:</label>
                <input type="number" id="metaCalorias" v-model.number="refeicaoAtual.metaCalorias" min="0" placeholder="Ex: 400" />
              </div>
              
              <div class="form-group">
                <label for="metaProteinas">Meta de Proteínas (g):</label>
                <input type="number" id="metaProteinas" v-model.number="refeicaoAtual.metaProteinas" min="0" step="0.1" placeholder="Ex: 25" />
              </div>
            </div>
            
            <div v-if="refeicaoAtual.pratos && refeicaoAtual.pratos.length > 0">
              <h3>Pratos Criados</h3>
              <div v-for="prato in refeicaoAtual.pratos" :key="prato.id" class="prato-preview">
                <div class="prato-info">
                  <strong>{{ prato.nome }}</strong>
                  <span>{{ calcularCaloriasPrato(prato).toFixed(0) }} kcal | {{ calcularProteinasPrato(prato).toFixed(1) }}g prot</span>
                </div>
                <div class="prato-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: `${Math.min(100, (calcularCaloriasPrato(prato) / (refeicaoAtual.metaCalorias || 1)) * 100)}%` }"></div>
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
            <div v-if="substitutosDisponiveis.length > 0" class="substitutos-grid">
                             <div v-for="substituto in substitutosDisponiveis" 
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
            <div v-else class="empty-message">
              Nenhum substituto encontrado para este alimento.
            </div>
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
    const refeicaoAtual = ref({ 
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
    
    // Calorias totais da refeição atual (compatibilidade - nova estrutura usa pratos)
    const caloriasTotalRefeicaoAtual = computed(() => {
      if (!refeicaoAtual.value || !refeicaoAtual.value.alimentos) return 0;
      return refeicaoAtual.value.alimentos.reduce((total, item) => {
        if (!item.alimento) return total;
        return total + (item.alimento.caloria * (item.porcao / item.alimento.porcaoReferencia));
      }, 0);
    });
    
    // Proteínas totais da refeição atual (compatibilidade - nova estrutura usa pratos)
    const proteinasTotalRefeicaoAtual = computed(() => {
      if (!refeicaoAtual.value || !refeicaoAtual.value.alimentos) return 0;
      return refeicaoAtual.value.alimentos.reduce((total, item) => {
        if (!item.alimento) return total;
        return total + (item.alimento.proteina * (item.porcao / item.alimento.porcaoReferencia));
      }, 0);
    });
    
    // Carboidratos totais da refeição atual (compatibilidade - nova estrutura usa pratos)
    const carboidratosTotalRefeicaoAtual = computed(() => {
      if (!refeicaoAtual.value || !refeicaoAtual.value.alimentos) return 0;
      return refeicaoAtual.value.alimentos.reduce((total, item) => {
        if (!item.alimento) return total;
        return total + (item.alimento.carboidrato * (item.porcao / item.alimento.porcaoReferencia));
      }, 0);
    });
    
    // Gorduras totais da refeição atual (compatibilidade - nova estrutura usa pratos)
    const gordurasTotalRefeicaoAtual = computed(() => {
      if (!refeicaoAtual.value || !refeicaoAtual.value.alimentos) return 0;
      return refeicaoAtual.value.alimentos.reduce((total, item) => {
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
      refeicaoAtual.value = {
        nome: '',
        metaCalorias: 0,
        metaProteinas: 0,
        pratos: []
      };
      
      showModal.value = true;
    };
    
    // Editar refeição existente
    const editarRefeicao = (refeicao) => {
      refeicaoAtual.value = JSON.parse(JSON.stringify(refeicao)); // Clone profundo
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

        refeicaoAtual.value.alimentos.push(itemAlimento);
        
        // Limpar seleção
        alimentoSelecionado.value = '';
        porcaoAlimento.value = 100;
      }
    };
    
    // Remover alimento da refeição atual
    const removerAlimentoDaRefeicao = (index) => {
      refeicaoAtual.value.alimentos.splice(index, 1);
    };
    
    // Recalcular calorias quando as porções são alteradas
    const recalcularCalorias = () => {
      // Não precisa fazer nada, pois os computed serão recalculados automaticamente
    };
    
    // Salvar a refeição atual
    const salvarRefeicao = () => {
      if (!refeicaoAtual.value.nome) {
        alert('Informe o nome da refeição.');
        return;
      }
      
      if (!refeicaoAtual.value.metaCalorias || refeicaoAtual.value.metaCalorias <= 0) {
        alert('Informe uma meta de calorias válida.');
        return;
      }
      
      if (!refeicaoAtual.value.metaProteinas || refeicaoAtual.value.metaProteinas <= 0) {
        alert('Informe uma meta de proteínas válida.');
        return;
      }
      
      if (refeicaoAtual.value.id) {
        // Editar refeição existente
        planoStore.atualizarRefeicao(refeicaoAtual.value);
      } else {
        // Adicionar nova refeição
        planoStore.adicionarRefeicao(refeicaoAtual.value);
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
      alimentoOriginal.value = item;
      contextoSubstituicao.value = { refeicaoId, pratoId, index };
      substitutosDisponiveis.value = getSubstitutosPossiveis(item.alimento);
      showSubstituicaoModal.value = true;
    };

    // Fechar modal de substituição
    const fecharModalSubstituicao = () => {
      showSubstituicaoModal.value = false;
      alimentoOriginal.value = null;
      contextoSubstituicao.value = { refeicaoId: null, pratoId: null, index: null };
      substitutosDisponiveis.value = [];
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
       if (!alimentosStore || !alimentosStore.alimentos) {
         return [];
       }
       return alimentosStore.getSubstitutosPossiveis(alimento);
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

    return {
      // Estados
      refeicoes,
      pesoUsuario,
      
      // Modal de refeição
      showModal,
      refeicaoAtual,
      
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
      removerPrato,
      salvarPrato,
      fecharPratoModal,
      adicionarAlimentoAoPrato,
      removerAlimentoDoPrato,
      recalcularCaloriasPrato,
      
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
      abrirModalSubstituicao,
      fecharModalSubstituicao,
      selecionarSubstituto,

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
  justify-content: space-between;
  gap: 20px;
}

.info-item {
  flex: 1;
  text-align: center;
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

.btn-edit-prato, .btn-delete-prato {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
}

.btn-edit-prato:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.btn-delete-prato:hover {
  background-color: rgba(255, 0, 0, 0.1);
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
    max-width: 600px;
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
  </style> 