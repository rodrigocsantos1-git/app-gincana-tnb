/**
 * Mapeamento e recuperação de logotipos oficiais das equipes.
 * Suporta identificação pelo nome da equipe ou pelo código hexadecimal da cor configurada.
 *
 * Imagens oficiais disponíveis em /public:
 * - /Time_Azul.jpeg (Escudo Acampamento TNB - Time Azul)
 * - /Time_Verde.jpeg (Escudo Acampamento TNB - Time Verde)
 */
export function getTeamLogo(team?: { name?: string; color?: string } | null): string | null {
  if (!team) return null;
  const name = (team.name || '').toLowerCase().trim();
  const color = (team.color || '').toLowerCase().trim();

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
