// Utilidad para guardar y recuperar imágenes de itinerarios en localStorage
// Se usa base64 para persistir las imágenes que el usuario sube desde su equipo.

const STORAGE_KEY = 'itinerario_imagenes';

interface ImageStore {
  [itinerarioId: string]: string[]; // array de base64 strings
}

const getStore = (): ImageStore => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveStore = (store: ImageStore) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
};

/**
 * Convierte un File a base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Guarda las imágenes (base64) asociadas a un itinerario
 */
export const guardarImagenes = (itinerarioId: string, imagenes: string[]) => {
  const store = getStore();
  store[itinerarioId] = imagenes;
  saveStore(store);
};

/**
 * Obtiene las imágenes guardadas de un itinerario.
 * Retorna null si no hay imágenes guardadas (para distinguir de array vacío).
 */
export const obtenerImagenes = (itinerarioId: string): string[] | null => {
  const store = getStore();
  const imgs = store[itinerarioId];
  return imgs && imgs.length > 0 ? imgs : null;
};

/**
 * Elimina las imágenes de un itinerario del almacenamiento
 */
export const eliminarImagenes = (itinerarioId: string) => {
  const store = getStore();
  delete store[itinerarioId];
  saveStore(store);
};
