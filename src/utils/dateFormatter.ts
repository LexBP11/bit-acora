/**
 * Formatea un objeto Date de JS a formato 'YYYY-MM-DD'
 */
export const formatDateToBack = (date: Date): string => {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split('T')[0];
};

/**
 * Formatea un objeto Date de JS a formato 'YYYY-MM-DD HH:MM'
 */
export const formatDateTimeToBack = (date: Date): string => {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  const iso = d.toISOString();
  const datePart = iso.split('T')[0];
  const timePart = iso.split('T')[1].substring(0, 5); // Toma solo HH:MM
  return `${datePart} ${timePart}`;
};
