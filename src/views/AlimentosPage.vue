<template>
  <div class="alimentos-page">
    <h1>Gerenciamento de Alimentos</h1>
    
    <!-- Seção de importação e ações -->
    <div class="import-section">
      <div class="actions-bar">
        <button @click="abrirModalNovoAlimento" class="btn btn-success">
          <i class="fas fa-plus"></i> Adicionar Alimento
        </button>
        <button @click="importarAlimentos" class="btn btn-primary">
          <i class="fas fa-file-import"></i> Importar da Base
        </button>
        <button @click="confirmarZerarAlimentos" class="btn btn-error">
          <i class="fas fa-trash"></i> Zerar Alimentos
        </button>
      </div>
      <p v-if="mensagemImportacao" class="import-message">{{ mensagemImportacao }}</p>
    </div>
    
    <!-- Modal de Adicionar/Editar Alimento -->
    <div v-if="showModalAlimento" class="modal-overlay" @click="fecharModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ modoEdicao ? 'Editar Alimento' : 'Adicionar Novo Alimento' }}</h2>
          <button @click="fecharModal" class="btn-close">×</button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="salvarAlimento" class="alimento-form">
            <div class="form-row">
              <div class="form-group">
                <label for="nome">Nome do alimento:</label>
                <input type="text" id="nome" v-model="alimento.nome" required />
              </div>
                             <div class="form-group">
                 <label for="tipo">Tipo:</label>
                 <input type="text" id="tipo" v-model="alimento.tipo" required placeholder="Ex: Proteína, Carboidrato, Fruta..." />
               </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="caloria">Calorias (kcal):</label>
                <input type="number" id="caloria" v-model.number="alimento.caloria" min="0" step="any" required />
              </div>
              <div class="form-group">
                <label for="proteina">Proteínas (g):</label>
                <input type="number" id="proteina" v-model.number="alimento.proteina" min="0" step="any" required />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="carboidrato">Carboidratos (g):</label>
                <input type="number" id="carboidrato" v-model.number="alimento.carboidrato" min="0" step="any" required />
              </div>
              <div class="form-group">
                <label for="gordura">Gorduras (g):</label>
                <input type="number" id="gordura" v-model.number="alimento.gordura" min="0" step="any" required />
              </div>
            </div>

            <div class="form-group">
              <label for="porcaoReferencia">Porção de referência (g):</label>
              <input type="number" id="porcaoReferencia" v-model.number="alimento.porcaoReferencia" min="1" step="any" required />
              <small>Porção para a qual os valores nutricionais se referem</small>
            </div>

            <div class="form-group">
              <label>
                <input type="checkbox" v-model="alimento.discreto" />
                Porção mínima
              </label>
              <small>Marque se o alimento deve ser medido em porções mínimas (ex: fatias, unidades, colheres)</small>
            </div>

            <div v-if="alimento.discreto" class="form-group">
              <label for="gramaPorUnidade">Quantidade por porção:</label>
              <div class="flex gap-2 items-center">
                <input type="number" id="gramaPorUnidade" v-model.number="alimento.gramaPorUnidade" min="1" step="any" placeholder="Ex: 50" class="w-32" />
                <select v-model="alimento.rotuloPorcao" class="select select-bordered w-48">
                  <option value="unidade">unidade</option>
                  <option value="fatia">fatia</option>
                  <option value="colher de sopa">colher de sopa</option>
                  <option value="colher de chá">colher de chá</option>
                  <option value="fio">fio</option>
                  <option value="outro">outro</option>
                </select>
              </div>
              <div v-if="alimento.rotuloPorcao === 'outro'" class="mt-2">
                <input type="text" v-model="alimento.rotuloPorcaoCustom" placeholder="Digite o rótulo personalizado" class="input input-bordered w-full" />
              </div>
              <small>Peso de uma porção mínima em gramas</small>
            </div>

            <div class="form-actions">
              <button type="button" @click="fecharModal" class="btn btn-secondary">Cancelar</button>
              <button type="submit" class="btn btn-success">{{ modoEdicao ? 'Salvar Alterações' : 'Adicionar Alimento' }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
    
    <!-- Lista de alimentos -->
    <div class="list-card">
      <h2>Alimentos Cadastrados</h2>
      
      <div class="filter-row">
        <input type="text" v-model="filtro" placeholder="Buscar alimentos..." />
        
        <select v-model="filtroTipo">
          <option value="">Todos os tipos</option>
          <option v-for="tipo in tiposAlimentos" :key="tipo" :value="tipo">{{ tipo }}</option>
        </select>
      </div>
      
      <div class="alimentos-list">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Tipo</th>
              <th>Calorias</th>
              <th>Proteínas</th>
              <th>Carboidratos</th>
              <th>Gorduras</th>
              <th>Porção Mínima</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in alimentosFiltrados" :key="item.id">
              <td>{{ item.nome }}</td>
              <td>{{ item.tipo }}</td>
              <td>{{ item.caloria }} kcal</td>
              <td>{{ item.proteina }}g</td>
              <td>{{ item.carboidrato }}g</td>
              <td>{{ item.gordura }}g</td>
              <td>
                <span v-if="item.discreto" class="discreto-badge">
                  ✓ {{ item.gramaPorUnidade }}g/un
                </span>
                <span v-else class="continuo-badge">-</span>
              </td>
              <td class="actions">
                <button @click="editarAlimento(item.id)" class="btn-edit">Editar</button>
                <button @click="excluirAlimento(item.id)" class="btn-delete">Excluir</button>
              </td>
            </tr>
            <tr v-if="alimentosFiltrados.length === 0">
              <td colspan="8" class="empty-message">Nenhum alimento encontrado</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <div class="navigation">
      <router-link to="/" class="nav-button">
        Voltar para Início
      </router-link>
      <router-link to="/plano-alimentar" class="nav-button">
        Plano Alimentar
      </router-link>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useAlimentosStore } from '../stores/alimentosStore';

// Dados do seeds.txt com informações de porção mínima
const seedsData = `Nome	Porção (g)	Gordura	Carbo	Proteína	Kcal	Discreto	GramaPorUnidade	RotuloPorcao
Melão	1,00	0,00	0,08	0,01	0,34	true	150	fatia
Batata doce	1,00	0,00	0,20	0,02	0,86	true	200	unidade
Ovo	1,00	0,11	0,01	0,13	1,55	true	50	unidade
Clara de ovo	1,00	0,00	0,01	0,11	0,52	true	30	unidade
Queijo mussarela light Tirolez	1,00	0,18	0,00	0,28	2,74	true	20	fatia
Queijo mussarela light zero lactose Tirolez	100,00	18,00	0,40	28,00	274,00	true	20	fatia
Hipercalórico Growth Chocolate	1,00	0,03	0,60	0,30	3,90	false	100	unidade
Whey Vitafor Isolado	1,00	0,00	0,00	0,90	3,76	true	30	colher de sopa
Arroz integral cozido	1,00	0,01	0,26	0,03	1,24	true	50	colher de sopa
Feijão Carioca cozido	100,00	0,50	13,60	4,80	76,00	true	50	colher de sopa
Filé de frango cozido	100,00	2,50	2,80	19,00	110,00	true	100	unidade
Top Whey 3W Max Titanium Morango	1,00	0,07	0,11	0,80	4,25	true	30	colher de sopa
Top Whey 3W Max Titanium Chocolate	40,00	2,600	4,600	31,0000	166,0000	true	30	colher de sopa
Uva passa	1,00	0,005	0,792	0,0031	2,9900	true	10	colher de sopa
Batata inglesa cozida	1,00	0,001	0,201	0,0171	0,8600	true	150	unidade
Salmão cru	1,00	0,097	0,000	0,1900	1,7000	true	120	unidade
Azeite de oliva extravirgem (ml)	1,00	0,920	0,000	0,0000	8,2800	true	5	fio
Tapioca	1,00	0,000	0,570	0,0000	2,2800	true	50	unidade
Requeijão Nestlé Light	1,00	0,073	0,043	0,1200	1,3100	true	10	colher de chá
Pão de forma integral plusvita	1,00	0,046	0,390	0,1400	2,5100	true	25	fatia
Cuscuz cozido flocão coringa	1,00	0,006	0,390	0,0410	1,7300	true	50	colher de sopa
Cuscuz cru flocão coringa	1,00	0,010	0,760	0,0800	3,4000	true	50	colher de sopa
Pão de cachorro quente	1,00	0,042	0,740	0,0900	3,7200	true	50	unidade
Salsicha vegana	1,00	0,055	0,110	0,2100	1,8000	true	80	unidade
Molho de tomate	240,00	0,000	7,900	1,3000	44,0000	true	15	colher de sopa
Batata palha	1,00	0,440	0,400	0,0600	4,9200	true	10	colher de sopa
Salsicha tipo viena	1,00	0,160	0,040	0,1200	2,0800	true	50	unidade
Milho verde em conserva	1,00	0,006	0,285	0,0620	1,3700	true	15	colher de sopa
maçã	1,00	0,002	0,140	0,0030	0,5200	true	150	unidade
Mamão	1,00	0,003	0,110	0,0050	0,4300	true	100	fatia
Abacaxi	1,00	0,001	0,130	0,0050	0,5000	true	80	fatia
Banana	1,00	0,003	0,230	0,0110	0,8900	true	100	unidade
Abacate	1,00	0,150	0,090	0,0200	1,6000
Melancia	1,00	0,002	0,080	0,0060	0,3000
Miolo de alcatra cru	1,00	0,078	0,000	0,2160	1,6300
Atum sólido ao natural	1,00	0,027	0,000	0,2800	1,3500
Kiwi	1,00	0,005	0,150	0,0110	0,6100
Inhame	100,00	0,200	28,000	1,5	118
Macaxeira	100,00	0,30	30	1,4	125
Banana da terra	100,00	0,20	34	1,4	128
Presunto Cru - Vito Balducci	100,00	14,00	0	28	238
Patinho moído cru	100,00	4,50	0	21,7	133
Rap10 Fibras	100,00	7,70	43	7,4	272
Massa de sêmola com ovos cozida	100,00	2,50	28	6,8	166
Sumo de limão	100,00	0,20	7	0,4	22
Morango	100,00	0,30	8	0,7	33
Queijo coalho	100,00	30,28	0,68	24,48	373
Queijo Minas Padrão Light Tirolez	100,00	20,00	0	25	280
Açúcar demerara	100,00	0,00	100	0	387
Tilápia cozida	100,00	2,70	0	26	129
Lagarto cozido	100,00	9,10	0	32,9	222
Merluza cozida	100,00	0,90	0	23,64	108
Atum cozido	75,00	0,55	3,2	15,77	82,19
Leite Ninho Adulto Semidesnatado	25,00	3,80	11	7,4	108
Laranja	100,00	0,30	11	1,3	63
Pipoca	25,00	1,00	16	2,3	82
Oléo de soja	10,00	9,23	0	1,54	83
Manteiga com sal Aviação	10,00	8,20	0	0	75
Pão de hambúrguer	50,00	1,60	26	5,4	141
Arroz cozido	100,00	1,59	29,1	2,4	138
Filé mignon grelhado	100,00	8,80	0	32,8	220
Castanha de caju	100,00	47,20	26,4	19,6	609
Iogurte Natural Nestlé Integral	100,00	4,10	4	4	69
Lentilha cozida	100,00	0,40	20	9	116
Grão de bico cozido	100,00	2,59	27,42	8,86	164
Camarão cru	100,00	0,50	0	10	47
Presunto Cru Espanhol - Ceratti	100,00	12,00	0	33	240
Whey Growth Natural	30,00	2,00	3,1	24	126
Tilápia crua	100,00	1,70	0	20,08	96
Bacon	100,00	39,00	0,5	18	425
Ervilha com Wasabi	100,00	13,00	68	13	432
Manga	100,00	0,40	15	0,8	60
Caju	100,00	0,30	10	1	43
Picanha bovina crua	100,00	13,00	0	21	206
Chocotone Bauduco Chocolate - Mousse	100,00	18,00	54	6,7	405
Wrap Jasmine Sem Glúten	100,00	2,60	48	4	232
Pão de queijo coquetel	100,00	11,00	33	2,2	237
Isowhey Vitafor	30,00	0,00	0,7	27	110
Miolo de alcatra grelhado	100,00	11,60	0	31,9	241
Goji Berry	30,00	1,50	20	3,6	110
Quinoa cozida	100,00	1,92	21,3	4,4	120
Couscous marroquino cru	100,00	1,60	70	13	353
Torradas leves Schär	28,00	0,00	24	1,7	106
Filé mignon cru	100,00	5,60	0	21,6	143
Creme de Leite Leve Itambé	15,00	2,60	0,7	0	26
Queijo Parmesão Cilindro Faixa Azul	30,00	6,30	0	9,3	127
Ovo de páscoa Cacau Show (chocolate ao leite)	100,00	37,00	49	8,4	563
Pernil de porco assado	100,00	13,90	0	32,1	262
Acém cozido	100,00	10,90	0	27,3	215
Sobrecoxa de frango assada	100,00	12,00	0	29,2	233
Coxa de frango assada	100,00	5,66	0	28,3	172
Coxão mole cru	100,00	8,70	0	21,2	169
Contrafilé cru	100,00	4,60	0	21,5	131
Filé de sardinha Gomes da Costa	100,00	10,00	0	25	194
Lombo suíno temperado sadia	100,00	7,10	0,4	16	130
Pizza de frango com Catupiry original	82,00	2,10	25	8,2	150
Torta caipira de frango Sadia	100,00	16,00	17	7,2	241
Lobo de Saithe Dessalgado Congelado Riberalves	100,00	0,00	0	19	76
Feijão fradinho cozido	100,00	0,6	14	5,1	65,00
Tripa de porco cozida	100,00	20,32	0	12,49	233
Semente de chia	15,00	4,60	0,8	2,3	54
Gergelim	100,00	50,40	21,6	21,2	584
Castanha do pará	100,00	63,50	15,1	14,5	643
Camarão cozido	100,00	1,00	0	19	90
Iogurte Natural Danone  Integral	160,00	5,70	10	7,5	121
Maminha crua	100,00	7,00	0	20,9	153
Feijão Branco Cozido	100,00	0,62	26,04	8,23	140
Lasanha de frango seara	300,00	17,00	62	16	468
Lasanha bolonhesa sadia	100,00	5,60	10	8,6	125
Ervilha em conserva Quero	130,00	0,80	19	7,8	114
Chips de macaxeira	25,00	5,80	17	0,5	120
Fava cozida	100,00	0,40	14,25	7,6	110
Iorgurte grego desnatado zero lactose Yorgus	200,00	0,00	6	23	116
Croissant	100,00	21,00	45	21	406
Pão de forma tradicional Panco	100,00	3,00	48	7,8	250
Presunto Serrano Haciendas Reserva	100,00	11,00	0	35	242
Leite integral Leitíssimo (ml)	200,00	8,00	9,1	6,9	136
Queijo brie - Ile de France	100,00	22,00	0	17	268
Truffetes de France sabor framboesa	100,00	45,00	42	4,3	600
Iogurte desnatado Nesté	160,00	0,00	6,6	5,8	50
Copa fatiada Sadia	100,00	25,00	0,9	32	357
Doce de leite San Ignacio	100,00	7,00	60	6	327
Massa de arroz Urbano crua	80,00	1,50	61	6,5	283
Massa de arroz Urbano cozida	100,00	0,80	38	3,2	173
Queijo mussarela light Davaca	100,00	17,00	0	29	269
Quejo gouda Président	100,00	32,00	0	27	393
Iogurte natural mais proteínas Danone	160,00	1,60	8,7	10	89
Pão de Alho picante Zinho	100,00	18,00	33	4,9	338
Tâmara seca	100,00	0,00	73	2,3	305
Linhaça dourada	15,00	6,00	1	3	70
Creme de queijo parmesão - Faixa Azul	100,00	24,00	1,4	10	262
Iogurte grego tradicional - Danone	90,00	5,20	13	4,7	118
Requeijão cremoso cheddar - Catupiry	100,00	29,00	0	11	304
Geleia de framboesa - La Vieja Fábrica	20,00	0,00	50	0,6	206
Rice cracker cheese - Kalassi	100,00	9,20	80	7,5	435
Omega 3 EPA DHA	4,50	3,00	0	0,6	29
Presunto cozido 100% Pernil - Seara	100,00	1,00	1,7	15	76
Crepe Francês - Òze Congelados	240,00	18,00	36	29	432
Mussarela - Président	100,00	24,00	2	24	320
Filé de peito de frango em cubos cozido - Sadia	100,00	1,80	1,7	21	107
Atum sólido ao natural - Member's Mark	120,00	0,70	0	29	124
Peito de frango defumado - Ceratti	100,00	1,90	2,3	18	99
Queijo provolone - Président	100,00	27,00	0	27	347`;

// Função para parsear dados e identificar tipos de alimentos
function determinarTipoAlimento(proteina, carboidrato, gordura) {
  // A proporção de macronutrientes determina o tipo
  if (proteina > 0.3 && proteina > carboidrato && proteina > gordura) {
    return 'Proteína';
  } else if (carboidrato > 0.5 && carboidrato > proteina && carboidrato > gordura) {
    return 'Carboidrato';
  } else if (gordura > 0.4 && gordura > proteina && gordura > carboidrato) {
    return 'Gordura';
  } else if (carboidrato > 0.3 && proteina < 0.15) {
    return 'Fruta/Vegetal';
  } else {
    return 'Diversos';
  }
}

export default {
  name: 'AlimentosPage',
  setup() {
    const store = useAlimentosStore();
    
    const alimento = ref({
      id: null,
      nome: '',
      caloria: 0,
      porcaoReferencia: 100,
      proteina: 0,
      carboidrato: 0,
      gordura: 0,
      tipo: '',
      discreto: false,
      gramaPorUnidade: 100,
      rotuloPorcao: 'unidade',
      rotuloPorcaoCustom: ''
    });
    
    const filtro = ref('');
    const filtroTipo = ref('');
    const modoEdicao = ref(false);
    const mensagemImportacao = ref('');
    const showModalAlimento = ref(false);
    
    // Lista filtrada de alimentos
    const alimentosFiltrados = computed(() => {
      return store.alimentos
        .filter(a => {
          // Filtro por texto
          const matchText = filtro.value === '' || 
            a.nome.toLowerCase().includes(filtro.value.toLowerCase()) || 
            a.descricao.toLowerCase().includes(filtro.value.toLowerCase());
          
          // Filtro por tipo
          const matchTipo = filtroTipo.value === '' || a.tipo === filtroTipo.value;
          
          return matchText && matchTipo;
        })
        .sort((a, b) => a.nome.localeCompare(b.nome));
    });
    
    // Lista de tipos únicos de alimentos
    const tiposAlimentos = computed(() => {
      return store.getTiposAlimentos;
    });
    
    // Salvar alimento (adicionar ou editar)
    const salvarAlimento = () => {
      if (modoEdicao.value) {
        // Editar alimento existente
        store.editarAlimento(alimento.value);
      } else {
        // Adicionar novo alimento
        store.adicionarAlimento(alimento.value);
      }
      
      // Fechar modal e limpar formulário
      fecharModal();
      limparFormulario();
    };
    
    // Editar alimento
    const editarAlimento = (id) => {
      const alimentoParaEditar = store.alimentos.find(a => a.id === id);
      if (alimentoParaEditar) {
        alimento.value = { ...alimentoParaEditar };
        modoEdicao.value = true;
        showModalAlimento.value = true;
      }
    };
    
    // Excluir alimento
    const excluirAlimento = (id) => {
      if (confirm('Tem certeza que deseja excluir este alimento?')) {
        store.removerAlimento(id);
      }
    };
    
    // Limpar formulário
    const limparFormulario = () => {
      alimento.value = {
        id: null,
        nome: '',
        caloria: 0,
        porcaoReferencia: 100,
        proteina: 0,
        carboidrato: 0,
        gordura: 0,
        tipo: '',
        discreto: false,
        gramaPorUnidade: 100,
        rotuloPorcao: 'unidade',
        rotuloPorcaoCustom: ''
      };
      modoEdicao.value = false;
    };
    
    // Importar alimentos de seeds.txt
    const importarAlimentosSeeds = () => {
      try {
        // Transformar dados do seeds.txt em um array de objetos
        const linhas = seedsData.split('\n').slice(1); // Remove cabeçalho
        const alimentos = [];
        
        linhas.forEach(linha => {
          const partes = linha.split('\t');
          if (partes.length >= 5) {
            const nome = partes[0].trim();
            const porcaoReferencia = parseFloat(partes[1].replace(',', '.'));
            const gordura = parseFloat(partes[2].replace(',', '.'));
            const carboidrato = parseFloat(partes[3].replace(',', '.'));
            const proteina = parseFloat(partes[4].replace(',', '.'));
            const caloria = parseFloat(partes[5]?.replace(',', '.') || 0);
            
            // Calcular macros para determinar o tipo
            const totalMacros = gordura + carboidrato + proteina || 1;
            const propGordura = gordura / totalMacros;
            const propCarboidrato = carboidrato / totalMacros;
            const propProteina = proteina / totalMacros;
            
            const tipo = determinarTipoAlimento(propProteina, propCarboidrato, propGordura);
            
            alimentos.push({
              nome,
              descricao: `Importado da base de dados.`,
              gordura,
              carboidrato,
              proteina,
              caloria,
              porcaoReferencia,
              tipo,
              discreto: false,
              gramaPorUnidade: 100
            });
          }
        });
        
        // Importar para a store
        if (alimentos.length > 0) {
          const resultado = store.importarAlimentos(alimentos);
          mensagemImportacao.value = `${resultado.importados} alimentos importados. ${resultado.duplicados} alimentos ignorados (duplicados).`;
        }
      } catch (error) {
        console.error('Erro ao importar alimentos:', error);
        mensagemImportacao.value = 'Erro ao importar alimentos: ' + error.message;
      }
    };

    const importarAlimentosSeeds2 = () => {
      try {
        // Transformar dados do seeds.txt em um array de objetos
        const linhas = seedsData.split('\n').slice(1); // Remove cabeçalho
        const alimentos = [];
        
        linhas.forEach(linha => {
          const partes = linha.split('\t');
          if (partes.length >= 6) {
            const nome = partes[0].trim();
            const porcaoReferencia = parseFloat(partes[1].replace(',', '.'));
            const gordura = parseFloat(partes[2].replace(',', '.'));
            const carboidrato = parseFloat(partes[3].replace(',', '.'));
            const proteina = parseFloat(partes[4].replace(',', '.'));
            const caloria = parseFloat(partes[5]?.replace(',', '.') || 0);
            
            // Informações de porção mínima (se disponíveis)
            const discreto = partes[6] === 'true';
            const gramaPorUnidade = partes[7] ? parseFloat(partes[7].replace(',', '.')) : 100;
            const rotuloPorcao = partes[8] ? partes[8].trim() : 'unidade';
            
            // Calcular macros para determinar o tipo
            const totalMacros = gordura + carboidrato + proteina || 1;
            const propGordura = gordura / totalMacros;
            const propCarboidrato = carboidrato / totalMacros;
            const propProteina = proteina / totalMacros;
            
            const tipo = determinarTipoAlimento(propProteina, propCarboidrato, propGordura);
            
            alimentos.push({
              nome,
              gordura,
              carboidrato,
              proteina,
              caloria,
              porcaoReferencia,
              tipo,
              discreto,
              gramaPorUnidade,
              rotuloPorcao,
              rotuloPorcaoCustom: ''
            });
          }
        });
        
        // Importar para a store
        if (alimentos.length > 0) {
          alimentos.forEach(alimento => {
            store.adicionarAlimento(alimento);
          });
          mensagemImportacao.value = `${alimentos.length} alimentos importados com informações de porção mínima.`;
        }
      } catch (error) {
        console.error('Erro ao importar alimentos:', error);
        mensagemImportacao.value = 'Erro ao importar alimentos: ' + error.message;
      }
    };
    
         // Importar alimentos da base
     const importarAlimentos = () => {
       if (confirm('Deseja importar os alimentos da base de dados? Isso irá adicionar novos alimentos sem remover os existentes.')) {
         importarAlimentosSeeds2()
       }
     }

    // Confirmar e zerar alimentos
    const confirmarZerarAlimentos = () => {
      if (confirm('⚠️ ATENÇÃO: Esta ação irá remover TODOS os alimentos cadastrados. Esta ação não pode ser desfeita. Deseja continuar?')) {
        if (confirm('Tem certeza? Todos os alimentos serão perdidos permanentemente.')) {
          store.zerarAlimentos()
        }
      }
    }

    // Abrir modal de adicionar novo alimento
    const abrirModalNovoAlimento = () => {
      alimento.value = {
        id: null,
        nome: '',
        caloria: 0,
        porcaoReferencia: 100,
        proteina: 0,
        carboidrato: 0,
        gordura: 0,
        tipo: '',
        discreto: false,
        gramaPorUnidade: 100,
        rotuloPorcao: 'unidade',
        rotuloPorcaoCustom: ''
      };
      modoEdicao.value = false;
      showModalAlimento.value = true;
    };

    // Fechar modal
    const fecharModal = () => {
      showModalAlimento.value = false;
    };
    
    return {
      alimento,
      filtro,
      filtroTipo,
      modoEdicao,
      mensagemImportacao,
      showModalAlimento,
      alimentosFiltrados,
      tiposAlimentos,
      salvarAlimento,
      editarAlimento,
      excluirAlimento,
      limparFormulario,
      importarAlimentosSeeds,
      importarAlimentos,
      confirmarZerarAlimentos,
      abrirModalNovoAlimento,
      fecharModal
    };
  }
}
</script>

<style scoped>
.alimentos-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  color: var(--text-color);
  margin-bottom: 20px;
}

.form-card, .list-card, .import-section {
  background-color: var(--card-bg);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 2px 4px var(--card-shadow);
}

.import-section {
  text-align: center;
}

.btn-import {
  background-color: var(--import-btn-bg);
  color: white;
  padding: 12px 20px;
  font-size: 16px;
}

.btn-import:hover {
  background-color: var(--import-btn-hover);
}

.import-message {
  margin-top: 10px;
  font-style: italic;
  color: var(--text-color-card);
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
  color: var(--label-color);
  font-weight: bold;
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

.form-buttons {
  display: flex;
  gap: 10px;
}

button {
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.btn-save {
  background-color: var(--primary-color);
  color: white;
  flex: 3;
}

.btn-save:hover {
  background-color: var(--primary-hover);
}

.btn-cancel {
  background-color: var(--neutral-color);
  color: var(--text-color);
  flex: 1;
}

.btn-cancel:hover {
  background-color: var(--neutral-hover);
}

.filter-row {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.filter-row input {
  flex: 2;
}

.filter-row select {
  flex: 1;
}

/* Tabela de alimentos */
.alimentos-list {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  color: var(--text-color-card);
}

th, td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

th {
  background-color: var(--table-header);
  font-weight: bold;
}

tr:hover {
  background-color: var(--table-hover);
}

.actions {
  display: flex;
  gap: 5px;
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

.empty-message {
  text-align: center;
  padding: 20px;
  color: var(--text-color-card);
}

/* Navegação */
.navigation {
  display: flex;
  justify-content: space-between;
  gap: 20px;
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

h2, h3, h4 {
  color: var(--text-color-card);
}

.discreto-badge {
  background-color: var(--success-color);
  color: white;
  padding: 2px 5px;
  border-radius: 4px;
}

.continuo-badge {
  background-color: var(--neutral-color);
  color: var(--text-color-card);
  padding: 2px 5px;
  border-radius: 4px;
}

.actions-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background-color: var(--primary-hover);
}

.btn-error {
  background-color: var(--danger-color);
  color: white;
}

.btn-error:hover {
  background-color: var(--danger-hover);
}

.btn-success {
  background-color: var(--success-color);
  color: white;
}

.btn-success:hover {
  background-color: var(--success-hover);
}

.btn-secondary {
  background-color: var(--neutral-color);
  color: var(--text-color);
}

.btn-secondary:hover {
  background-color: var(--neutral-hover);
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-color);
  cursor: pointer;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: var(--card-bg);
  padding: 20px;
  border-radius: 8px;
  width: 80%;
  max-width: 600px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-body {
  /* Add any additional styles for the modal body */
}

.alimento-form {
  /* Add any additional styles for the form inside the modal */
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
</style> 