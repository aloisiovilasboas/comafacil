<template>
  <div class="home-page">
    <h1>Bem-vindo ao ComaFacil</h1>
    <p>Seu aplicativo para gerenciar planos alimentares</p>
    
    <div class="user-config">
      <h2>Configure seus dados</h2>
      
      <form @submit.prevent="salvarDados">
        <div class="form-group">
          <label for="peso">Seu peso (kg):</label>
          <input 
            type="number" 
            id="peso" 
            v-model.number="peso" 
            min="30" 
            max="300" 
            step="0.1"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="nivelAtividade">Nível de atividade física:</label>
          <select id="nivelAtividade" v-model="nivelAtividade" required>
            <option value="sedentario">Sedentário</option>
            <option value="moderado">Moderado</option>
            <option value="ativo">Ativo</option>
            <option value="atleta">Atleta</option>
            <option value="customizado">Customizado</option>
          </select>
        </div>
        
        <!-- Campos customizados que aparecem apenas quando "customizado" é selecionado -->
        <div v-if="nivelAtividade === 'customizado'" class="custom-fields">
          <h3>Configurações Customizadas</h3>
          
          <div class="form-group">
            <label for="caloriasPorQuilo">Calorias por quilo de peso:</label>
            <input 
              type="number" 
              id="caloriasPorQuilo" 
              v-model.number="caloriasPorQuilo" 
              min="20" 
              max="50" 
              step="0.1"
              placeholder="32"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="proteinasPorQuilo">Proteínas por quilo de peso (g):</label>
            <input 
              type="number" 
              id="proteinasPorQuilo" 
              v-model.number="proteinasPorQuilo" 
              min="0.5" 
              max="3" 
              step="0.1"
              placeholder="1"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="gorduraPorQuilo">Gorduras por quilo de peso (g):</label>
            <input 
              type="number" 
              id="gorduraPorQuilo" 
              v-model.number="gorduraPorQuilo" 
              min="0.5" 
              max="2" 
              step="0.1"
              placeholder="1"
              required
            />
          </div>
        </div>
        
        <button type="submit">Salvar</button>
      </form>
    </div>
    
    <div class="info-card" v-if="dadosConfigurados">
      <h3>Suas recomendações diárias:</h3>
      <div class="info-row">
        <div class="info-item">
          <h4>Calorias:</h4>
          <p>{{ caloriasDiarias.toFixed(0) }} kcal</p>
        </div>
        <div class="info-item">
          <h4>Proteínas:</h4>
          <p>{{ proteinasDiarias.toFixed(0) }}g</p>
        </div>
        <div class="info-item">
          <h4>Gorduras (máx):</h4>
          <p>{{ gorduraMaxima.toFixed(0) }}g</p>
        </div>
      </div>
    </div>
    
    <div class="navigation">
      <router-link to="/alimentos" class="nav-button">
        Gerenciar Alimentos
      </router-link>
      <router-link to="/plano-alimentar" class="nav-button">
        Plano Alimentar
      </router-link>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { usePlanoAlimentarStore } from '../stores/planoAlimentarStore';

export default {
  name: 'HomePage',
  setup() {
    const planoStore = usePlanoAlimentarStore();
    
    const peso = ref(planoStore.pesoUsuario);
    const nivelAtividade = ref(planoStore.nivelAtividade);
    
    // Valores customizados
    const caloriasPorQuilo = ref(planoStore.caloriasPorQuilo);
    const proteinasPorQuilo = ref(planoStore.proteinasPorQuilo);
    const gorduraPorQuilo = ref(planoStore.gorduraPorQuilo);
    
    const dadosConfigurados = computed(() => {
      return peso.value > 0;
    });
    
    const caloriasDiarias = computed(() => {
      return planoStore.caloriasDiarias;
    });
    
    const proteinasDiarias = computed(() => {
      return planoStore.proteinasDiarias;
    });
    
    const gorduraMaxima = computed(() => {
      return planoStore.gorduraMaxima;
    });
    
    const salvarDados = () => {
      if (nivelAtividade.value === 'customizado') {
        const valoresCustomizados = {
          caloriasPorQuilo: caloriasPorQuilo.value,
          proteinasPorQuilo: proteinasPorQuilo.value,
          gorduraPorQuilo: gorduraPorQuilo.value
        };
        planoStore.configurarUsuario(peso.value, nivelAtividade.value, valoresCustomizados);
      } else {
      planoStore.configurarUsuario(peso.value, nivelAtividade.value);
      }
      alert('Dados salvos com sucesso!');
    };
    
    return {
      peso,
      nivelAtividade,
      caloriasPorQuilo,
      proteinasPorQuilo,
      gorduraPorQuilo,
      dadosConfigurados,
      caloriasDiarias,
      proteinasDiarias,
      gorduraMaxima,
      salvarDados
    };
  }
}
</script>

<style scoped>
.home-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  color: var(--text-color);
}

p {
  text-align: center;
  margin-bottom: 30px;
  color: var(--text-color);
}

.user-config {
  background-color: var(--card-bg);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 2px 4px var(--card-shadow);
  color: var(--text-color-card);
}

.user-config h2 {
  color: var(--text-color-card);
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: var(--label-color);
}

input, select {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 16px;
  background-color: var(--input-bg);
  color: var(--input-text);
}

button {
  display: block;
  width: 100%;
  padding: 12px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 10px;
}

button:hover {
  background-color: var(--primary-hover);
}

.info-card {
  background-color: var(--card-bg);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 2px 4px var(--card-shadow);
  color: var(--text-color-card);
}

.info-card h3 {
  color: var(--text-color-card);
}

.info-row {
  display: flex;
  justify-content: space-between;
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
  color: var(--text-color-card);
}

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

.custom-fields {
  margin-top: 20px;
  padding: 15px;
  background-color: rgba(66, 184, 131, 0.1);
  border-radius: 6px;
  border-left: 4px solid var(--primary-color);
}

.custom-fields h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: var(--primary-color);
  font-size: 18px;
}
</style> 