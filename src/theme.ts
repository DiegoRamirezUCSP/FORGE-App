// Paleta tomada del deck de Forge: carbón + metal al rojo vivo.
export const colors = {
  bg: '#222222',
  surface: '#2B2B2B',
  surfaceDeep: '#1A1A1A',
  border: '#3F3F3F',
  text: '#FFFFFF',
  textMuted: '#B8B8B8',
  textDim: '#7C7C7C',
  red: '#C00000',
  burnt: '#C84800',
  orange: '#FF6B00',
  amber: '#FFA800',
  yellow: '#FFDD66',
} as const;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;

export const radius = { sm: 8, md: 14, lg: 20, pill: 999 } as const;

export const font = {
  title: { fontSize: 28, fontWeight: '800' as const, letterSpacing: 1 },
  heading: { fontSize: 20, fontWeight: '700' as const },
  body: { fontSize: 16, fontWeight: '500' as const },
  small: { fontSize: 13, fontWeight: '500' as const },
  stat: { fontSize: 22, fontWeight: '800' as const },
};
