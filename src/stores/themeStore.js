import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    isDarkMode: JSON.parse(localStorage.getItem('darkMode') || 'false')
  }),
  
  actions: {
    toggleTheme() {
      this.isDarkMode = !this.isDarkMode
      localStorage.setItem('darkMode', JSON.stringify(this.isDarkMode))
      this.applyTheme()
    },
    
    applyTheme() {
      // Aplicar classes ao elemento HTML para alternar temas
      if (this.isDarkMode) {
        document.documentElement.classList.add('dark-mode')
      } else {
        document.documentElement.classList.remove('dark-mode')
      }
    },
    
    // Inicializar tema com base nas configurações salvas
    init() {
      this.applyTheme()
      
      // Verificar preferência do sistema se não houver configuração salva
      if (localStorage.getItem('darkMode') === null) {
        // Verificar se o usuário prefere tema escuro no sistema
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        if (prefersDark) {
          this.isDarkMode = true
          localStorage.setItem('darkMode', 'true')
          this.applyTheme()
        }
      }
    }
  }
}) 