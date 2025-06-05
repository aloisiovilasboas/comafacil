import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './style.css'

// Importar as páginas/componentes
import HomePage from './views/HomePage.vue'
import AlimentosPage from './views/AlimentosPage.vue'
import PlanoAlimentarPage from './views/PlanoAlimentarPage.vue'

// Importar store do tema
import { useThemeStore } from './stores/themeStore'

// Configuração das rotas
const routes = [
  { path: '/', component: HomePage },
  { path: '/alimentos', component: AlimentosPage },
  { path: '/plano-alimentar', component: PlanoAlimentarPage }
]

// Criar instância do router
const router = createRouter({
  history: createWebHistory(),
  routes
})

// Criar instância do Pinia
const pinia = createPinia()

// Criar e montar a aplicação
const app = createApp(App)
app.use(router)
app.use(pinia)
app.mount('#app')

// Inicializar tema
const themeStore = useThemeStore()
themeStore.init()
