# Voice Modulator

[English](#english) · [Português](#português-brasil)

---

## English

A free, open-source desktop voice changer for Windows. It processes your microphone in real time, so you can sound like a robot, a squirrel or a demon in Discord, WhatsApp Web, games and more.

<!-- TODO: add a screenshot, e.g. ![Voice Modulator](docs/screenshot.png) -->

### Download

1. Go to the [latest release](https://github.com/Eduardo-Macedo07/voice-modulator/releases/latest).
2. Download `voice-modulator_x.y.z_x64-setup.exe` and run it.

The installer is not code-signed yet, so Windows may warn or block it:

- **SmartScreen warning**: click **More info → Run anyway**.
- **"Smart App Control blocked this app"** (Windows 11): this protection has no "run anyway" option. Either turn it off in *Windows Security → App & browser control → Smart App Control settings → Off* (on some Windows 11 versions this cannot be undone without reinstalling Windows, so read the warning on screen first), or skip the installer and [run the app from source](#development).

### Features

- **Presets**: Normal, Robot, Squirrel, Deep, Radio, Cave, Demon, Alien.
- **Effects**: pitch shift, robot (ring modulation), distortion, bitcrusher, echo, reverb and a bass/treble equalizer, each with its own controls.
- **Live visualizer**: waveform and spectrum of the processed voice.
- **Monitoring**: hear yourself in your headphones, on a device separate from the output sent to other apps.

### Using your voice in other apps

Windows apps can only use microphones that Windows lists, and creating one needs a driver. Voice Modulator sends its sound to a free virtual cable:

1. Install [VB-Cable](https://vb-audio.com/Cable/) (run the installer as administrator).
2. Open Voice Modulator and press **Start**. It detects the cable and selects **CABLE Input** as the output.
3. In Discord, WhatsApp Web, your game, etc., choose **CABLE Output** as the microphone.

Use headphones if you turn on monitoring, otherwise your speakers will feed back into the microphone.

### Development

Requirements: Node.js LTS, Rust (`stable-msvc`), Visual Studio 2022 Build Tools (C++).

```
npm install
npm run tauri dev     # run the app with hot reload
npm test              # unit tests (Vitest)
npm run tauri build   # build the installer
```

Built with Tauri 2, React, TypeScript and the Web Audio API. All audio processing happens in the frontend; custom DSP runs in AudioWorklets.

New releases are built by GitHub Actions when a `v*` tag is pushed.

Planned: recording and export (WebM and WAV).

### License

[MIT](LICENSE) · [Code of conduct](CODE_OF_CONDUCT.md) · [Code signing policy (draft)](docs/code-signing-policy.md)

---

## Português (Brasil)

Um modulador de voz para desktop (Windows), gratuito e de código aberto. Ele processa o seu microfone em tempo real, e você pode soar como um robô, um esquilo ou um demônio no Discord, no WhatsApp Web, em jogos e em outros programas.

### Download

1. Abra a [última versão (release)](https://github.com/Eduardo-Macedo07/voice-modulator/releases/latest).
2. Baixe o arquivo `voice-modulator_x.y.z_x64-setup.exe` e execute.

O instalador ainda não tem assinatura de código, então o Windows pode avisar ou bloquear:

- **Aviso do SmartScreen**: clique em **Mais informações → Executar assim mesmo**.
- **"O Controle Inteligente de Aplicativos bloqueou este app"** (Windows 11): essa proteção não tem a opção "executar assim mesmo". Ou você a desativa em *Segurança do Windows → Controle de aplicativos e navegador → Configurações do Controle Inteligente de Aplicativos → Desativado* (em algumas versões do Windows 11 isso não pode ser desfeito sem reinstalar o Windows, então leia o aviso na tela antes), ou ignora o instalador e [roda o app pelo código-fonte](#desenvolvimento).

### Recursos

- **Presets**: Normal, Robot, Squirrel, Deep, Radio, Cave, Demon, Alien.
- **Efeitos**: pitch, robô (modulação em anel), distorção, bitcrusher, eco, reverb e equalizador de graves e agudos, cada um com seus controles.
- **Visualizador ao vivo**: forma de onda e espectro da voz já processada.
- **Monitoramento**: você se ouve no fone, em um dispositivo separado da saída enviada para os outros programas.

### Usando a voz em outros programas

Os programas do Windows só usam microfones que o Windows lista, e criar um exige um driver. O Voice Modulator envia o som para um cabo virtual gratuito:

1. Instale o [VB-Cable](https://vb-audio.com/Cable/) (execute o instalador como administrador).
2. Abra o Voice Modulator e clique em **Start**. Ele detecta o cabo e seleciona o **CABLE Input** como saída.
3. No Discord, no WhatsApp Web, no jogo etc., escolha **CABLE Output** como microfone.

Use fones de ouvido se ligar o monitoramento. Sem eles, o som do alto-falante volta para o microfone.

### Desenvolvimento

Requisitos: Node.js LTS, Rust (`stable-msvc`), Visual Studio 2022 Build Tools (C++).

```
npm install
npm run tauri dev     # roda o app com hot reload
npm test              # testes unitários (Vitest)
npm run tauri build   # gera o instalador
```

Feito com Tauri 2, React, TypeScript e Web Audio API. Todo o processamento de áudio acontece no frontend; o DSP próprio roda em AudioWorklets.

As novas versões são geradas pelo GitHub Actions quando uma tag `v*` é enviada.

Planejado: gravação e exportação (WebM e WAV).

### Licença

[MIT](LICENSE) · [Código de conduta](CODE_OF_CONDUCT.md) · [Política de assinatura de código (rascunho)](docs/code-signing-policy.md)
