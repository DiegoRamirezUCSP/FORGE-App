import { Rank, RankId } from '../types';

export const RANKS: Rank[] = [
  { id: 'hierro', tier: 1, name: 'Hierro', subtitle: 'Metal Crudo', color: '#7A7A7A', onColor: '#FFFFFF' },
  { id: 'bronce', tier: 2, name: 'Bronce', subtitle: 'Al Rojo Vivo', color: '#A86B4A', onColor: '#FFFFFF' },
  { id: 'plata', tier: 3, name: 'Plata', subtitle: 'Primer Pliegue', color: '#B8C0C8', onColor: '#222222' },
  { id: 'oro', tier: 4, name: 'Oro', subtitle: 'Mil Capas', color: '#FFA800', onColor: '#222222' },
  { id: 'platino', tier: 5, name: 'Platino', subtitle: 'Templado', color: '#FF6B00', onColor: '#222222' },
  { id: 'diamante', tier: 6, name: 'Diamante', subtitle: 'Afilado', color: '#C84800', onColor: '#FFFFFF' },
  { id: 'maestro', tier: 7, name: 'Maestro', subtitle: 'Hoja de Damasco', color: '#FFDD66', onColor: '#222222' },
];

export function getRank(id: RankId): Rank {
  return RANKS.find((r) => r.id === id) ?? RANKS[0];
}
