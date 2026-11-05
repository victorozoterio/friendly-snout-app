<h1 align="center" style="font-weight: bold;">Focinho Amigo 🐾</h1>

<p align="center">
 <a href="#technologies">Tecnologias</a> •
 <a href="#description">Descrição</a> •
 <a href="#prerequisites">Pré-requisitos</a> •
 <a href="#installation">Instalação</a> •
 <a href="#commands">Comandos</a>
</p>

<p align="center">
  <img
    alt="Project Preview GIF"
    title="Project Preview GIF"
    src=".github/assets/project-preview.gif"
    width="250"
  />
</p>

<h2 id="technologies">💻 Tecnologias</h2>

![TypeScript](https://img.shields.io/badge/typescript-3178C6?style=for-the-badge&logo=typescript&logoColor=3178C6&color=000000) ![React Native](https://img.shields.io/badge/react%20native-61DAFB?style=for-the-badge&logo=react&logoColor=61DAFB&color=000000) ![Expo](https://img.shields.io/badge/expo-FFFFFF?style=for-the-badge&logo=expo&logoColor=FFFFFF&color=000000) ![Expo Router](https://img.shields.io/badge/expo%20router-FFFFFF?style=for-the-badge&logo=expo&logoColor=FFFFFF&color=000000) ![Tamagui](https://img.shields.io/badge/tamagui-FFFFFF?style=for-the-badge&logo=tamagui&logoColor=FFFFFF&color=000000) ![Zod](https://img.shields.io/badge/zod-3E67B1?style=for-the-badge&logo=zod&logoColor=3E67B1&color=000000) ![Biome](https://img.shields.io/badge/biome-60A5FA?style=for-the-badge&logo=biome&logoColor=60A5FA&color=000000)

<h2 id="description">📚 Descrição</h2>

O **Focinho Amigo** é um aplicativo mobile para a ONG **Focinho Amigo**, que atua na cidade de **Indaiatuba - SP**. Ele permite registrar e acompanhar as informações dos animais assistidos pela organização diretamente pelo celular.

Principais funcionalidades:

- Autenticação com JWT, renovação de sessão e armazenamento seguro dos tokens.
- Cadastro, edição e acompanhamento de animais por estágio.
- Foto principal do animal usando câmera ou galeria.
- Gestão de anexos e documentos, incluindo visualização, download e remoção.
- Cadastro e gerenciamento de marcas e medicamentos.
- Registro de aplicações realizadas e agendamento de próximas aplicações.
- Calendário de aplicações e lembretes por notificações push.
- Interface responsiva para Android e iOS, com componentes Tamagui e tema próprio.

<h2>📱 Recursos nativos</h2>

O aplicativo utiliza recursos do dispositivo para tornar o fluxo de trabalho da ONG mais prático:

- **Câmera e galeria:** seleção ou captura da foto principal e de anexos.
- **Arquivos e mídia:** seleção, abertura e download de documentos e imagens.
- **Notificações push:** lembretes de aplicações de medicamentos e abertura direta da agenda do animal.
- **Armazenamento seguro:** persistência dos tokens de autenticação com `expo-secure-store`.

<h2 id="prerequisites">🧩 Pré-requisitos</h2>

- [Node.js](https://nodejs.org/) (LTS recomendado)
- npm
- Aplicativo Expo Go ou uma Development Build para testar no celular
- Backend do [Focinho Amigo](https://github.com/victorozoterio/friendly-snout-back) em execução e acessível pelo dispositivo

> Para notificações push no Android, utilize uma Development Build configurada com EAS e Firebase. O Expo Go não representa o fluxo completo de notificações remotas do projeto.

<h2 id="installation">⚙️ Instalação</h2>

1. Clone o repositório:

   ```bash
   git clone https://github.com/victorozoterio/friendly-snout-app.git
   ```

2. Acesse a pasta do projeto:

   ```bash
   cd friendly-snout-app
   ```

3. Crie o arquivo de ambiente a partir do exemplo:

   ```bash
   cp .env.example .env
   ```

4. Configure as variáveis no arquivo `.env`:

   ```env
   EXPO_PUBLIC_API_URL=http://SEU_IP_LOCAL:3000
   EXPO_PUBLIC_API_KEY=
   ```

   Use o IP local da máquina que executa o backend quando testar em um celular físico. `localhost` aponta para o próprio dispositivo e não para o computador.

5. Instale as dependências:

   ```bash
   npm install
   ```

6. Inicie o Expo:

   ```bash
   npm start
   ```

<h2 id="commands">⌨️ Comandos</h2>

| Comando | Descrição |
| --- | --- |
| `npm start` | Inicia o servidor de desenvolvimento do Expo. |
| `npm run android` | Abre o projeto no Android disponível. |
| `npx expo start --ios` | Abre o projeto no simulador iOS disponível. |
| `npx expo start --web` | Inicia a versão web para desenvolvimento. |
| `npm run format` | Executa o Biome e aplica formatações seguras. |

<h2>🏗️ Builds com EAS</h2>

Os perfis de build estão configurados em `eas.json`. Para gerar uma Development Build Android, execute:

```bash
npx eas build --platform android --profile development
```

Para uma build interna de demonstração:

```bash
npx eas build --platform android --profile preview
```

<h2>🔗 Projetos relacionados</h2>

- [friendly-snout-back](https://github.com/victorozoterio/friendly-snout-back) — API NestJS, TypeORM e PostgreSQL.
- [friendly-snout-front](https://github.com/victorozoterio/friendly-snout-front) — aplicação web do projeto.
