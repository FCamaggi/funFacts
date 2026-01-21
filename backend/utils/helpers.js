import { nanoid } from 'nanoid';

export const generateLobbyCode = () => {
  // Genera un código de 6 caracteres alfanuméricos en mayúsculas
  return nanoid(6).toUpperCase();
};

export const PLAYER_COLORS = [
  '#FF6B6B', // Rojo
  '#4ECDC4', // Turquesa
  '#45B7D1', // Azul
  '#FFA07A', // Naranja claro
  '#98D8C8', // Verde menta
  '#F7DC6F', // Amarillo
  '#BB8FCE', // Morado
  '#85C1E2'  // Azul claro
];

export const getNextColor = (usedColors) => {
  const availableColors = PLAYER_COLORS.filter(c => !usedColors.includes(c));
  if (availableColors.length === 0) {
    return PLAYER_COLORS[Math.floor(Math.random() * PLAYER_COLORS.length)];
  }
  return availableColors[0];
};
