<script setup>
// Importações necessárias
import { useThemeStore } from './stores/themeStore';

const themeStore = useThemeStore();

// Função para alternar o tema
const toggleTheme = () => {
  themeStore.toggleTheme();
};
</script>

<template>
  <div id="app">
    <header>
      <h1>ComaFacil</h1>
      <nav>
        <router-link to="/">Início</router-link>
        <router-link to="/alimentos">Alimentos</router-link>
        <router-link to="/plano-alimentar">Plano Alimentar</router-link>
      </nav>
      <button @click="toggleTheme" class="theme-toggle">
        <span v-if="themeStore.isDarkMode" class="icon">☀️</span>
        <span v-else class="icon">🌙</span>
      </button>
    </header>

    <main>
      <router-view />
    </main>

    <footer>
      <p>&copy; {{ new Date().getFullYear() }} - ComaFacil - Seu assistente de planos alimentares</p>
    </footer>
  </div>
</template>

<style>
/* Estilos globais */
:root {
  /* Variáveis do tema claro */
  --background-color: #f5f7fa;
  --text-color: #2c3e50;
  --text-color-card: #333333;
  --header-bg: #42b883;
  --header-text: #ffffff;
  --footer-bg: #2c3e50;
  --footer-text: #ffffff;
  --card-bg: #ffffff;
  --card-shadow: rgba(0, 0, 0, 0.1);
  --primary-color: #42b883;
  --primary-hover: #3aa876;
  --secondary-color: #3498db;
  --secondary-hover: #2980b9;
  --danger-color: #e74c3c;
  --danger-hover: #c0392b;
  --neutral-color: #e7e7e7;
  --neutral-hover: #d7d7d7;
  --border-color: #ddd;
  --table-header: #f1f1f1;
  --table-hover: #f9f9f9;
  --progress-bg: #e0e0e0;
  --progress-primary: #42b883;
  --progress-secondary: #3498db;
  --progress-danger: #e74c3c;
  --warning-bg: #fff3cd;
  --warning-color: #856404;
  --import-btn-bg: #9b59b6;
  --import-btn-hover: #8e44ad;
  --input-bg: #ffffff;
  --input-text: #333333;
  --label-color: #444444;
}

/* Tema escuro */
.dark-mode {
  --background-color: #1a1a2e;
  --text-color: #e6e6e6;
  --text-color-card: #f0f0f0;
  --header-bg: #303f9f;
  --header-text: #ffffff;
  --footer-bg: #121212;
  --footer-text: #a0a0a0;
  --card-bg: #2a2a3a;
  --card-shadow: rgba(0, 0, 0, 0.3);
  --primary-color: #00b894;
  --primary-hover: #00a885;
  --secondary-color: #3498db;
  --secondary-hover: #2980b9;
  --danger-color: #e74c3c;
  --danger-hover: #c0392b;
  --neutral-color: #4a4a5a;
  --neutral-hover: #3a3a4a;
  --border-color: #444;
  --table-header: #2a2a3a;
  --table-hover: #2d2d3d;
  --progress-bg: #444;
  --progress-primary: #00b894;
  --progress-secondary: #3498db;
  --progress-danger: #e74c3c;
  --warning-bg: #553c14;
  --warning-color: #ffd670;
  --import-btn-bg: #8e44ad;
  --import-btn-hover: #6c3483;
  --input-bg: #1f1f2f;
  --input-text: #e6e6e6;
  --label-color: #c0c0c0;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--text-color);
  background-color: var(--background-color);
  line-height: 1.6;
  transition: background-color 0.3s ease, color 0.3s ease;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

header {
  background-color: var(--header-bg);
  color: var(--header-text);
  padding: 0.5rem;
  text-align: center;
  box-shadow: 0 2px 4px var(--card-shadow);
  position: relative;
}

header h1 {
  margin: 0.5rem 0;
}

nav {
  display: flex;
  justify-content: center;
  padding: 0.5rem;
}

nav a {
  color: var(--header-text);
  padding: 0.5rem 1rem;
  text-decoration: none;
  border-radius: 4px;
  margin: 0 0.5rem;
  transition: background-color 0.3s;
}

nav a:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

nav a.router-link-active {
  background-color: rgba(255, 255, 255, 0.3);
  font-weight: bold;
}

main {
  flex: 1;
  padding: 20px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

footer {
  background-color: var(--footer-bg);
  color: var(--footer-text);
  text-align: center;
  padding: 1rem;
  margin-top: auto;
}

button {
  cursor: pointer;
}

h1, h2, h3, h4, h5, h6 {
  color: var(--text-color);
}

/* Botão de troca de tema */
.theme-toggle {
  position: absolute;
  right: 20px;
  top: 20px;
  background: none;
  border: none;
  color: var(--header-text);
  font-size: 24px;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s;
  width: 40px;
  height: 40px;
}

.theme-toggle:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.icon {
  font-size: 20px;
}

/* Classes globais para componentes comuns */
.form-card, .list-card, .import-section, .info-card, .config-card, .user-config, .refeicao-card {
  background-color: var(--card-bg);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 2px 4px var(--card-shadow);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  color: var(--text-color-card);
}

.form-card h1, .form-card h2, .form-card h3, .form-card h4,
.list-card h1, .list-card h2, .list-card h3, .list-card h4,
.import-section h1, .import-section h2, .import-section h3, .import-section h4,
.info-card h1, .info-card h2, .info-card h3, .info-card h4,
.config-card h1, .config-card h2, .config-card h3, .config-card h4,
.user-config h1, .user-config h2, .user-config h3, .user-config h4,
.refeicao-card h1, .refeicao-card h2, .refeicao-card h3, .refeicao-card h4 {
  color: var(--text-color-card);
}

label {
  color: var(--label-color);
  font-weight: bold;
}

input, select, textarea {
  background-color: var(--input-bg);
  color: var(--input-text);
  border: 1px solid var(--border-color);
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
}

table {
  color: var(--text-color);
}

th {
  background-color: var(--table-header);
}

tr:hover {
  background-color: var(--table-hover);
}

th, td {
  border-bottom: 1px solid var(--border-color);
}

.btn-primary, .btn-save, .nav-button {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover, .btn-save:hover, .nav-button:hover {
  background-color: var(--primary-hover);
}

.btn-edit {
  background-color: var(--secondary-color);
  color: white;
}

.btn-edit:hover {
  background-color: var(--secondary-hover);
}

.btn-delete, .btn-delete-sm {
  background-color: var(--danger-color);
  color: white;
}

.btn-delete:hover, .btn-delete-sm:hover {
  background-color: var(--danger-hover);
}

.btn-cancel {
  background-color: var(--neutral-color);
  color: var(--text-color);
}

.btn-cancel:hover {
  background-color: var(--neutral-hover);
}

.btn-import {
  background-color: var(--import-btn-bg);
  color: white;
}

.btn-import:hover {
  background-color: var(--import-btn-hover);
}

.progress-bar {
  background-color: var(--progress-bg);
}

.progress {
  background-color: var(--progress-primary);
}

.progress.blue {
  background-color: var(--progress-secondary);
}

.progress.red {
  background-color: var(--progress-danger);
}

.alert-box {
  background-color: var(--warning-bg);
  color: var(--warning-color);
}
</style>
