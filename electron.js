const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');

// Mantenha uma referência global do objeto da janela
// Se você não fizer isso, a janela será fechada automaticamente
// quando o objeto JavaScript for coletado pelo Garbage Collector
let mainWindow;

function createWindow() {
  // Criar a janela do navegador
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Em produção, carregue o diretório dist da aplicação
  // Em desenvolvimento, carregue do localhost:5173
  const startUrl = process.env.NODE_ENV === 'development'
    ? 'http://localhost:5173'
    : url.format({
        pathname: path.join(__dirname, 'dist/index.html'),
        protocol: 'file:',
        slashes: true
      });

  mainWindow.loadURL(startUrl);

  // Abra o DevTools em modo de desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Emitido quando a janela é fechada
  mainWindow.on('closed', function () {
    // Desreferencia o objeto da janela
    mainWindow = null;
  });
}

// Este método será chamado quando o Electron terminar a inicialização
// e estiver pronto para criar janelas do navegador
app.whenReady().then(createWindow);

// Sair quando todas as janelas estiverem fechadas
app.on('window-all-closed', function () {
  // No macOS é comum para aplicativos permanecerem
  // ativos até que o usuário explicitamente encerre com Cmd + Q
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  // No macOS é comum recriar uma janela no aplicativo quando o
  // ícone da dock é clicado e não há outras janelas abertas
  if (mainWindow === null) createWindow();
}); 