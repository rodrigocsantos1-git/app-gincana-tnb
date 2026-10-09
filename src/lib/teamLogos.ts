/**
 * Mapeamento e recuperação de logotipos oficiais das equipes.
 * Suporta identificação pelo nome da equipe ou pelo código hexadecimal da cor configurada.
 *
 * Imagens oficiais disponíveis em /public:
 * - /Time_Amarelo.jpeg (Escudo Acampamento TNB - Time Amarelo / Estrelas de Jesus)
 * - /Time_Azul.jpeg (Escudo Acampamento TNB - Time Azul)
 * - /Time_Branco.jpeg (Escudo Acampamento TNB - Time Branco)
 * - /Time_Verde.jpeg (Escudo Acampamento TNB - Time Verde)
 */
export function getTeamLogo(team?: { name?: string; color?: string } | null): string | null {
  if (!team) return null;
  const name = (team.name || '').toLowerCase().trim();
  const color = (team.color || '').toLowerCase().trim();

  // Equipe Amarela (Time Amarelo)
  if (
    name.includes('amar') ||
    name.includes('yellow') ||
    color === '#f59e0b' ||
    color === '#eab308' ||
    color === '#fbbf24' ||
    color === '#facc15'
  ) {
    return '/Time_Amarelo.jpeg';
  }

  // Equipe Branca (Time Branco)
  if (
    name.includes('branc') ||
    name.includes('white') ||
    color === '#ffffff' ||
    color === '#fff' ||
    color === '#e2e8f0' ||
    color === '#f8fafc' ||
    color === '#cbd5e1' ||
    color === '#f1f5f9'
  ) {
    return '/Time_Branco.jpeg';
  }

  // Equipe Azul (Time Azul)
  if (
    name.includes('azul') ||
    name.includes('blue') ||
    color === '#3b82f6' ||
    color === '#0284c7' ||
    color === '#2563eb' ||
    color === '#1d4ed8' ||
    color === '#38bdf8'
  ) {
    return '/Time_Azul.jpeg';
  }

  // Equipe Verde (Time Verde)
  if (
    name.includes('verd') ||
    name.includes('green') ||
    color === '#10b981' ||
    color === '#059669' ||
    color === '#22c55e' ||
    color === '#16a34a'
  ) {
    return '/Time_Verde.jpeg';
  }

  return null;
}
