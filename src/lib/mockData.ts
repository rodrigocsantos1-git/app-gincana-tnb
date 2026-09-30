import { Team, Activity, Score } from './types';

export const INITIAL_TEAMS: Team[] = [
  {
    id: 'team-1',
    name: 'Amarela',
    color: '#f59e0b', // Amarelo Ouro
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'team-2',
    name: 'Azul',
    color: '#3b82f6', // Azul Real
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'team-3',
    name: 'Verde',
    color: '#10b981', // Verde Esmeralda
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'team-4',
    name: 'Branco',
    color: '#e2e8f0', // Branco / Prata
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

export const OFFICIAL_ACTIVITIES: Activity[] = [
  {
    id: 'act-prova-1',
    title: 'Prova 1 - Treino da Palavra: "Mapa da Jornada"',
    description: 'A mesma equipe irá pontuar 5 vezes.\n1° lugar: 4 pontos | 2° lugar: 3 pontos | 3° lugar: 2 pontos | 4° lugar: 1 ponto.',
    max_points: 20,
    created_at: new Date(Date.now() - 3600000 * 10).toISOString(),
  },
  {
    id: 'act-prova-2',
    title: 'Prova 2 - Treino da disciplina: "Preparar para correr"',
    description: 'A mesma equipe irá pontuar 5 vezes.\n1° lugar: 4 pontos | 2° lugar: 3 pontos | 3° lugar: 2 pontos | 4° lugar: 1 ponto.\nSerão 2 fases (incluindo Fase 2.1 - Cabo de Guerra).',
    max_points: 20,
    created_at: new Date(Date.now() - 3600000 * 9).toISOString(),
  },
  {
    id: 'act-fase-2-1',
    title: 'Fase 2.1 - Cabo de Guerra',
    description: 'Cada time irá duelar um contra o outro. Quem vencer mais ganhará a pontuação máxima.\n1° lugar: 4 pontos | 2° lugar: 3 pontos | 3° lugar: 2 pontos | 4° lugar: 1 ponto.',
    max_points: 4,
    created_at: new Date(Date.now() - 3600000 * 8.5).toISOString(),
  },
  {
    id: 'act-prova-3',
    title: 'Prova 3 - Treino da união: "Um só corpo"',
    description: 'A mesma equipe irá pontuar 5 vezes.\n1° lugar: 4 pontos | 2° lugar: 3 pontos | 3° lugar: 2 pontos | 4° lugar: 1 ponto.',
    max_points: 20,
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: 'act-prova-4',
    title: 'Prova 4 - Treino da fé: "Ouvir a voz certa"',
    description: 'A mesma equipe irá pontuar 5 vezes.\n1° lugar: 4 pontos | 2° lugar: 3 pontos | 3° lugar: 2 pontos | 4° lugar: 1 ponto.',
    max_points: 20,
    created_at: new Date(Date.now() - 3600000 * 7).toISOString(),
  },
  {
    id: 'act-prova-5',
    title: 'Prova 5 - Treino do amor e serviço: "O jeito de Jesus"',
    description: 'A mesma equipe irá pontuar 5 vezes.\n1° lugar: 4 pontos | 2° lugar: 3 pontos | 3° lugar: 2 pontos | 4° lugar: 1 ponto.',
    max_points: 20,
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: 'act-caca-tesouro',
    title: 'Prova - Caça ao tesouro',
    description: 'Caça ao tesouro do acampamento.\n1° lugar: 10 pontos | 2° lugar: 8 pontos | 3° lugar: 6 pontos | 4° lugar: 4 pontos.',
    max_points: 10,
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'act-grito-guerra',
    title: 'Grito de Guerra',
    description: 'Pontuação fixa: avaliação do grito de guerra, entusiasmo e animação da equipe.',
    max_points: 50,
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'act-melhor-fantasia',
    title: 'Melhor Fantasia',
    description: 'Pontuação fixa: avaliação da caracterização, criatividade e fantasia da equipe.',
    max_points: 50,
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
];

export const INITIAL_ACTIVITIES: Activity[] = OFFICIAL_ACTIVITIES;

export const INITIAL_SCORES: Score[] = [];
