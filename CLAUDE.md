# CLAUDE.md

Este arquivo fornece orientações ao Claude Code (claude.ai/code) ao trabalhar com o código deste repositório.

## Comandos

```bash
npm run dev       # Servidor de desenvolvimento em http://localhost:3000 (0.0.0.0)
npm run build     # Build de produção (Vite)
npm run preview   # Visualizar o bundle de produção
npm run lint      # Apenas verificação de tipos TypeScript (tsc --noEmit)
npm run clean     # Remove a pasta dist/
```

Não há testes. `npm run lint` é a única validação de código disponível.

## Ambiente

Copie o `.env.example` e configure:
- `GEMINI_API_KEY` — necessário para integração com Gemini AI (configurado, mas ainda não conectado à lógica do jogo)
- `APP_URL` — URL base do deploy

O Vite injeta `GEMINI_API_KEY` via `define` no [vite.config.ts](vite.config.ts).

## Arquitetura

**Aplicação de página única com roteamento por estado de view** — sem React Router. O `App.tsx` mantém um estado `view` (`'landing' | 'dashboard' | 'arena' | 'admin'`) e renderiza condicionalmente o componente ativo. Não há URLs, histórico do navegador ou deep links.

```
App.tsx (estado de view)
├── Hero.tsx          — página inicial (landing)
├── PlayerPanel.tsx   — painel do jogador (stats, rankings, inventário)
├── Arena.tsx         — motor completo do jogo (combate, sistema de turnos, IA)
└── AdminPanel.tsx    — CRUD de cartas com login hardcoded admin/admin
```

**Todo o estado do jogo está em memória React** — sem backend, sem banco de dados, sem localStorage. O Express está instalado, mas não é utilizado.

## Arquivos Principais

### [src/components/Arena.tsx](src/components/Arena.tsx)
O motor principal do jogo (~1100+ linhas). Contém:
- Objeto `CARD_CATALOG` — o banco de dados de cartas (hardcoded). Adicione/edite cartas aqui.
- Estado `Board`: 9 slots por jogador (0–4 combatentes, slot 5 bênção, 6–8 reações)
- Timer de turno de 30 segundos, sickness de invocação, posições ataque/defesa, dano de recuo
- Lógica do oponente IA ("Malakor") usando `useRef` para evitar closures desatualizadas no loop de combate assíncrono — isso é intencional. Ao modificar o comportamento da IA, use sempre as refs (`cardRef`, `boardRef`, etc.) e não snapshots de estado.

### [src/components/PlayerPanel.tsx](src/components/PlayerPanel.tsx)
View do painel. O nome do jogador está hardcoded como `"Adriano_X"`. Stats e rankings são dados estáticos mockados.

### [src/App.tsx](src/App.tsx)
Roteador. Passe `setView` como prop para os componentes filhos para que possam navegar entre views.

## Stack Tecnológico

- **React 19** + **TypeScript 5.8**
- **Vite 6** + **Tailwind CSS v4** (via plugin `@tailwindcss/vite` — sem `tailwind.config.js`)
- **Motion** (sucessor do Framer Motion) para animações
- **Lucide React** para ícones
- Alias de caminho `@/` aponta para a raiz do projeto (configurado em `tsconfig.json` e `vite.config.ts`)

## Observações sobre Tailwind v4

O Tailwind v4 não usa `tailwind.config.js`. Todas as customizações de tema (cores, fontes) são definidas em [src/index.css](src/index.css) usando propriedades CSS customizadas dentro de `@theme`. Adicione novos tokens de design lá.

## Regras do Jogo (Arcane Crusade)

O motor de jogo em `Arena.tsx` implementa **somente** as regras oficiais do Arcane Crusade:

- **Pontos de Batalha:** 30 PB por jogador (partidas casuais). Chegar a 0 = derrota.
- **Derrota por deck vazio:** tentar comprar com deck esgotado = derrota imediata.
- **Estrutura de turno (ordem obrigatória):** Fase de Compra (automática) → Fase de Organização → Fase de Confronto → Fim do Turno.
- **Regra do primeiro turno:** quem inicia não pode atacar no turno 1.
- **1 combatente por turno** na Fase de Organização.
- **Mudança de posição:** máximo 1 vez por combatente por turno (rastreado em `positionChangedThisTurn`).

### Substituição (invocar Bronze/Prata/Ouro)

| Método | Como funciona |
|--------|---------------|
| **Escala** | Clique no slot do campo que contém a carta do nível anterior |
| **Poder (Sacrifício)** | Bronze=1 Neutro, Prata=2, Ouro=3 — sacrificados vão ao Exílio |

Neutros são invocados livremente em slots vazios.

### Posições de Combate

| Posição | Visual | Pode Atacar | Atributos visíveis |
|---------|--------|-------------|-------------------|
| `attack` | ring vermelho, vertical | Sim | Sim |
| `defense-open` | ring azul, rotacionado 90° | Não | Sim |
| `defense-closed` | ring cinza, costas da carta | Não | Não |

### Resolução de Combate

- **ATQ vs ATQ:** maior vence; diferença = dano PB ao controlador perdedor. Empate = ambos destruídos, sem dano.
- **ATQ vs DEF (Bloqueio):** bloqueadores NÃO sofrem dano de PB. Se DEF > ATQ: diferença = dano ao atacante (atacante não é destruído). Se ATQ > DEF: bloqueador destruído, sem dano (salvo Perfuração).
- **Perfuração de Bloqueio** (`hasPierce`): bloqueador destruído + diferença causa dano de PB.
- **Revelação:** combatente `defense-closed` atacado é revelado. Se `cardType === 'Especial'`, ativa `revealEffect`.
- **Ataque Direto:** só permitido se não há combatentes no campo inimigo.

### Zonas do Campo

- Área de Combatentes: 5 slots por jogador
- Área de Bênção: 1 slot — carta vai ao Exílio no fim do turno
- Área de Reações: 3 slots — carta vai ao Descarte ao ativar
- Exílio: cartas destruídas em batalha, sacrificadas ou bênçãos expiradas
- Banimento: permanente (zona visual presente, sem mecânica ativa ainda)

## Dados das Cartas

As cartas seguem a interface `Card` definida em Arena.tsx:

```typescript
type CardLevel   = 'Neutro' | 'Bronze' | 'Prata' | 'Ouro';
type CardType    = 'Normal' | 'Especial' | 'Bencao' | 'Reacao';
type Position    = 'attack' | 'defense-open' | 'defense-closed';

interface Card {
  id: string; name: string;
  level: CardLevel; cardType: CardType;
  element: 'Agua' | 'Terra' | 'Luz' | 'Trevas' | 'Vento' | 'Fogo';
  raca: string; classe: string;
  atq: number; def: number; desc: string; image?: string;
  hasPierce?: boolean;    // Perfuração de Bloqueio
  revealEffect?: string;  // efeito ao ser revelado (Especiais)
  // Estado de runtime (por turno):
  position: Position;
  positionChangedThisTurn: boolean;
  attackedThisTurn: boolean;
}
```

O catálogo de cartas (`CATALOG`) está hardcoded em Arena.tsx com stats fixos. O pool de deck é construído por `buildDeckPool()` — Neutros/Bronze têm 3 cópias, Prata 2, Ouro 1. Imagens ficam em `public/RECK 1/` (subdiretórios `NIVEL NEUTRO/`, `PRATA/`, `OURO/`). Todos os assets são WebP.

### Efeitos de Revelação disponíveis

| `revealEffect` | Efeito |
|----------------|--------|
| `'draw'` | Controlador compra 1 carta |
| `'buff-neutro-atq'` | Neutros aliados +3 ATQ até fim do turno |
| `'direct-damage-5'` | 5 de dano direto nos PB do oponente |
| `'destroy-weak'` | Destrói 1 combatente inimigo com ATQ ≤ 20 |
