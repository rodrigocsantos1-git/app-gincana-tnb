export interface Team {
  id: string;
  name: string;
  color: string;
  created_at?: string;
}

export interface Activity {
  id: string;
  title: string;
  description?: string | null;
  max_points?: number | null;
  created_at?: string;
}

export interface Score {
  id: string;
  team_id: string;
  activity_id?: string | null;
  points: number;
  notes?: string | null;
  created_at: string;
  // Propriedades unidas para visualização
  team?: Team;
  activity?: Activity;
}

export interface TeamStanding {
  team: Team;
  totalPoints: number;
  rank: number;
  scoresCount: number;
  recentActivity?: string;
}

export interface Profile {
  id: string;
  name: string;
  email: string | null;
  role: 'admin' | 'volunteer';
  approved: boolean;
  created_at?: string;
}
