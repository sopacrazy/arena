export type CardLevel = 'Neutro' | 'Bronze' | 'Prata' | 'Ouro';
export type CardElement = 'Agua' | 'Terra' | 'Luz' | 'Trevas' | 'Vento' | 'Fogo';

export interface CatalogCard {
  index: number;
  name: string;
  level: CardLevel;
  element: CardElement;
  raca: string;
  classe: string;
  atq: number;
  def: number;
  desc: string;
  image: string;
  hasPierce?: boolean;
  revealEffect?: string;
}

// Catálogo espelho do Arena.tsx — índices 0-14 são os IDs estáveis usados no banco
export const CATALOG: CatalogCard[] = [
  // Neutros
  { index: 0,  name: 'Recruta 06',                    level: 'Neutro', element: 'Terra', raca: 'Humano', classe: 'Guerreiro',   atq: 8,  def: 10, desc: 'Soldado recém-recrutado nas fileiras da guarda.',             image: '/RECK 1/NIVEL NEUTRO/06 - Copia - Copia - Copia - Copia - Copia - Copia.webp' },
  { index: 1,  name: 'Patrulheiro 11',                level: 'Neutro', element: 'Vento', raca: 'Humano', classe: 'Arqueiro',    atq: 10, def: 7,  desc: 'Guarda os portões com olhos de falcão.',                    image: '/RECK 1/NIVEL NEUTRO/11 - Copia - Copia - Copia - Copia - Copia - Copia.webp' },
  { index: 2,  name: 'Sentinela 43',                  level: 'Neutro', element: 'Terra', raca: 'Humano', classe: 'Guardião',    atq: 7,  def: 12, desc: 'Defesa inabalável nas muralhas do reino.',                    image: '/RECK 1/NIVEL NEUTRO/43 - Copia - Copia - Copia - Copia - Copia - Copia.webp' },
  { index: 3,  name: 'Aldeão 49',                     level: 'Neutro', element: 'Terra', raca: 'Humano', classe: 'Civil',       atq: 5,  def: 8,  desc: 'Cidadão comum empunhando uma foice.',                        image: '/RECK 1/NIVEL NEUTRO/49 - Copia - Copia - Copia - Copia - Copia - Copia.webp' },
  { index: 4,  name: 'Militante 50',                  level: 'Neutro', element: 'Fogo',  raca: 'Humano', classe: 'Lutador',     atq: 12, def: 6,  desc: 'Combatente agressivo sem treinamento formal.',                image: '/RECK 1/NIVEL NEUTRO/50 - Copia - Copia - Copia - Copia - Copia - Copia.webp' },
  { index: 5,  name: 'Guarda 51',                     level: 'Neutro', element: 'Luz',   raca: 'Humano', classe: 'Guardião',    atq: 9,  def: 11, desc: 'Protetor devotado da coroa.',                                image: '/RECK 1/NIVEL NEUTRO/51 - Copia - Copia - Copia - Copia - Copia - Copia.webp' },
  { index: 6,  name: 'Vigilante 53',                  level: 'Neutro', element: 'Vento', raca: 'Humano', classe: 'Batedor',     atq: 11, def: 8,  desc: 'Olhos nas sombras, espada afiada.',                         image: '/RECK 1/NIVEL NEUTRO/53 - Copia - Copia - Copia.webp' },
  { index: 7,  name: 'Soldado 60',                    level: 'Neutro', element: 'Fogo',  raca: 'Humano', classe: 'Guerreiro',   atq: 13, def: 9,  desc: 'Veterano endurecido das guerras do norte.',                  image: '/RECK 1/NIVEL NEUTRO/60.webp' },
  { index: 8,  name: 'Mercenário 67',                 level: 'Neutro', element: 'Trevas',raca: 'Humano', classe: 'Mercenário',  atq: 14, def: 7,  desc: 'Luta pelo maior pagador.',                                   image: '/RECK 1/NIVEL NEUTRO/67 - Copia - Copia.webp' },
  { index: 9,  name: 'Andarilho',                     level: 'Neutro', element: 'Vento', raca: 'Humano', classe: 'Viajante',    atq: 9,  def: 9,  desc: 'Revelar: compre 1 carta do seu deck.',                      image: '/RECK 1/NIVEL NEUTRO/Design sem nome (10).webp', revealEffect: 'draw' },
  // Bronze
  { index: 10, name: 'Caelan, Lâmina do Juramento',  level: 'Bronze', element: 'Luz',   raca: 'Humano', classe: 'Paladino',    atq: 18, def: 14, desc: 'Revelar: todos os Neutros aliados ganham +3 ATQ.',           image: '/RECK 1/PRATA/Caelan, Lâmina do Juramento.webp', revealEffect: 'buff-neutro-atq' },
  { index: 11, name: 'Fargan, Lâmina do Caminho',    level: 'Bronze', element: 'Trevas',raca: 'Humano', classe: 'Caçador',     atq: 20, def: 12, desc: 'Perseguidor implacável das sombras.',                        image: '/RECK 1/PRATA/Fargan, Lâmina do Caminho Estreito (1).webp' },
  // Prata
  { index: 12, name: 'Raskel, Sangue da Campanha',   level: 'Prata',  element: 'Fogo',  raca: 'Humano', classe: 'Comandante',  atq: 26, def: 20, desc: 'Revelar: cause 5 de dano direto nos PB do oponente.',       image: '/RECK 1/PRATA/_Raskel, Sangue da Campanha.webp', revealEffect: 'direct-damage-5' },
  // Ouro
  { index: 13, name: 'Aldren, Veterano da Fronteira',level: 'Ouro',   element: 'Terra', raca: 'Humano', classe: 'General',     atq: 38, def: 30, desc: 'Perfuração de Bloqueio: diferença causa dano de PB.',       image: '/RECK 1/OURO/Aldren, Veterano da Fronteira Quebrada (5).webp', hasPierce: true },
  { index: 14, name: 'Iskand, Sobrevivente',          level: 'Ouro',   element: 'Trevas',raca: 'Humano', classe: 'Campeão',     atq: 40, def: 28, desc: 'Revelar: destrua 1 combatente inimigo com ATQ ≤ 20.',      image: '/RECK 1/OURO/Iskand, Sobrevivente do Campo Vermelho.webp', revealEffect: 'destroy-weak' },
];

// Índices de cartas elegíveis para o baú inicial (somente Neutros)
export const STARTER_POOL_INDICES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

export function pickRandomCards(poolIndices: number[], count: number): number[] {
  const shuffled = [...poolIndices].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
