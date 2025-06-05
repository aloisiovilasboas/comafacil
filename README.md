# ComaFacil - Aplicativo de Planos Alimentares

ComaFacil é um aplicativo web para a criação e gestão de planos alimentares, permitindo aos usuários:
- Cadastrar e gerenciar alimentos com informações nutricionais
- Criar planos alimentares personalizados
- Monitorar o consumo de calorias, proteínas e gorduras

## Tecnologias Utilizadas

- Vue.js 3 com Composition API
- Pinia para gerenciamento de estado
- Vue Router para navegação
- Electron para exportação para desktop
- LocalStorage para persistência de dados

## Instalação

```bash
# Instalar dependências
npm install

# Executar em modo de desenvolvimento
npm run dev

# Compilar para produção
npm run build

# Executar como aplicativo Electron em modo de desenvolvimento
npm run electron:dev

# Compilar para aplicativo desktop (Windows)
npm run electron:build
```

## Uso

1. Na página inicial, configure seu peso e nível de atividade física
2. Na página de Alimentos, cadastre os alimentos com suas informações nutricionais
3. Na página de Plano Alimentar, defina as refeições e adicione os alimentos a cada uma delas

## Funcionalidades

- Cálculo automático das necessidades calóricas baseado no peso e nível de atividade
- Sugestão de quantidade de proteínas com base no peso
- Alerta para consumo excessivo de gorduras
- Gerenciamento completo de alimentos (CRUD)
- Criação de planos alimentares personalizados
