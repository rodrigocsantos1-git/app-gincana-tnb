import { Team, Activity, Score } from './types';

export const INITIAL_TEAMS: Team[] = [
  {
    id: 'team-1',
    name: 'Leão de Judá',
    color: '#ef4444', // Vermelho Vibrante
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'team-2',
    name: 'Guerreiros da Fé',
    color: '#3b82f6', // Azul Real
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'team-3',
    name: 'Águias do Reino',
    color: '#f59e0b', // Amarelo Ouro
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'team-4',
    name: 'Tocha Viva',
    color: '#10b981', // Verde Esmeralda
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

export const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: 'act-1',
    title: 'Circuito Radical do Acampa',
    description: 'Corrida de obstáculos com trabalho em equipe e cooperação',
    max_points: 100,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'act-2',
    title: 'Grito de Guerra & Animação',
    description: 'Apresentação animada, coreografia e grito com respeito e entusiasmo',
    max_points: 50,
    created_at: new Date(Date.now() - 3600000 * 10).toISOString(),
  },
  {
    id: 'act-3',
    title: 'Quiz Bíblico & Versículos',
    description: 'Perguntas bíblicas rápidas e memorização de versículos da Palavra',
    max_points: 80,
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: 'act-4',
    title: 'Caça ao Tesouro do Reino',
    description: 'Decifrar pistas estratégicas espalhadas pelo acampamento',
    max_points: 120,
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: 'act-5',
    title: 'Torta na Cara Bíblica',
    description: 'Rodadas eletrizantes de perguntas e respostas bíblicas',
    max_points: 100,
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
];

export const INITIAL_SCORES: Score[] = [
  {
    id: 'score-1',
    team_id: 'team-1',
    activity_id: 'act-1',
    points: 100,
    notes: '1º Lugar no Circuito de Obstáculos',
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'score-2',
    team_id: 'team-2',
    activity_id: 'act-1',
    points: 70,
    notes: '2º Lugar no Circuito de Obstáculos',
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'score-3',
    team_id: 'team-3',
    activity_id: 'act-1',
    points: 50,
    notes: '3º Lugar no Circuito de Obstáculos',
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'score-4',
    team_id: 'team-4',
    activity_id: 'act-1',
    points: 40,
    notes: '4º Lugar no Circuito de Obstáculos',
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'score-5',
    team_id: 'team-2',
    activity_id: 'act-2',
    points: 50,
    notes: 'Melhor grito de guerra e união',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'score-6',
    team_id: 'team-3',
    activity_id: 'act-2',
    points: 45,
    notes: 'Ótima criatividade no grito',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'score-7',
    team_id: 'team-1',
    activity_id: 'act-3',
    points: 60,
    notes: 'Acertos no Quiz Bíblico',
    created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
  {
    id: 'score-8',
    team_id: 'team-4',
    activity_id: 'act-3',
    points: 80,
    notes: 'Gabaritou todas as perguntas bíblicas',
    created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
];
