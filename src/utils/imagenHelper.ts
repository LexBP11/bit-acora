export const getServerBaseUrl = (): string => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  return apiUrl.replace(/\/api\/?$/, '');
};

export const getPortadaUrl = (portadaUrl?: string): string | undefined => {
  if (!portadaUrl) return undefined;
  if (portadaUrl.startsWith('http://') || portadaUrl.startsWith('https://')) {
    return portadaUrl;
  }
  return `${getServerBaseUrl()}${portadaUrl}`;
};

export const getAvatarUrl = (avatarUrl?: string): string | undefined => {
  if (!avatarUrl) return undefined;
  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
    return avatarUrl;
  }
  return `${getServerBaseUrl()}${avatarUrl}`;
};

const genericImages = [
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&fit=crop', // Map/compass/camera
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&fit=crop', // Beach
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&fit=crop', // Roadtrip/desert
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&fit=crop', // Lake/boat
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&fit=crop', // Mountain/lake
  'https://images.unsplash.com/photo-1472214222555-d404758b1c42?w=800&fit=crop', // Scenic field
  'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800&fit=crop', // Snowy mountains
  'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=800&fit=crop', // Travel suitcase/airport
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&fit=crop', // Foggy mountains
  'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&fit=crop', // Forest bridge
  'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=800&fit=crop', // Forest path
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&fit=crop'  // Yosemite Valley
];

export const getImagenesDestino = (destino: string): string[] => {
  if (!destino) {
    return [genericImages[0], genericImages[1], genericImages[2]];
  }

  const destLower = destino.toLowerCase();

  // París, Francia
  if (destLower.includes('paris') || destLower.includes('parís')) {
    return [
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&fit=crop', // Torre Eiffel
      'https://images.unsplash.com/photo-1499856871958-5b9647a6406a?w=800&fit=crop', // Notre Dame / Sena
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&fit=crop'  // Cafetería París
    ];
  }

  // Barcelona, España
  if (destLower.includes('barcelona')) {
    return [
      'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&fit=crop', // Sagrada Familia
      'https://images.unsplash.com/photo-1523531294919-4bea7c65e292?w=800&fit=crop', // Parque Güell
      'https://images.unsplash.com/photo-1511527661048-7fe73d85e9a4?w=800&fit=crop'  // Calles de Barcelona
    ];
  }

  // Tokio, Japón
  if (destLower.includes('tokio') || destLower.includes('tokyo')) {
    return [
      'https://images.unsplash.com/photo-1540959375944-7049f642e9f1?w=800&fit=crop', // Shibuya
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&fit=crop', // Pagoda / Mt Fuji
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&fit=crop'  // Calles tradicionales
    ];
  }

  // Nueva York, USA
  if (destLower.includes('york') || destLower.includes('ny') || destLower.includes('nueva york') || destLower.includes('new york')) {
    return [
      'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&fit=crop', // Times Square
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&fit=crop', // Rascacielos
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&fit=crop'  // Central Park
    ];
  }

  // Machu Picchu, Perú
  if (destLower.includes('machu') || destLower.includes('peru') || destLower.includes('perú')) {
    return [
      'https://images.unsplash.com/photo-1587595431973-160219b90a8f?w=800&fit=crop', // Machu Picchu clásico
      'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&fit=crop', // Alpacas / Andes
      'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&fit=crop'  // Montaña y ruinas
    ];
  }

  // Roma / Italia
  if (destLower.includes('roma') || destLower.includes('rome') || destLower.includes('italia') || destLower.includes('italy')) {
    return [
      'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&fit=crop', // Coliseo
      'https://images.unsplash.com/photo-1529260830199-44552e02202e?w=800&fit=crop', // Fontana di Trevi
      'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=800&fit=crop'  // Calles de Roma
    ];
  }

  // Londres / London
  if (destLower.includes('londres') || destLower.includes('london')) {
    return [
      'https://images.unsplash.com/photo-1513635269975-59663e0ca1ad?w=800&fit=crop', // Big Ben
      'https://images.unsplash.com/photo-1529655683826-aba9b3e21ffd?w=800&fit=crop', // Cabinas telefónicas
      'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?w=800&fit=crop'  // Puente de la Torre
    ];
  }

  // Madrid
  if (destLower.includes('madrid')) {
    return [
      'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=800&fit=crop', // Plaza Mayor
      'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=800&fit=crop', // Gran Vía
      'https://images.unsplash.com/photo-1509840841025-9088ba78a826?w=800&fit=crop'  // Parque del Retiro
    ];
  }

  // Cancún / México
  if (destLower.includes('cancun') || destLower.includes('cancún') || destLower.includes('mexico') || destLower.includes('méxico')) {
    return [
      'https://images.unsplash.com/photo-1512813583145-acaa54ee23f3?w=800&fit=crop', // Playa Cancún
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&fit=crop', // Palmeras / Mar azul
      'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=800&fit=crop'  // Ruinas mayas frente al mar
    ];
  }

  // Río de Janeiro / Brasil
  if (destLower.includes('rio') || destLower.includes('janeiro') || destLower.includes('brasil') || destLower.includes('brazil')) {
    return [
      'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=800&fit=crop', // Cristo Redentor
      'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=800&fit=crop', // Copacabana
      'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=800&fit=crop'  // Vista panorámica
    ];
  }

  // Si no coincide con ninguna ciudad conocida, generamos 3 imágenes deterministas basadas en el nombre del destino
  let sum = 0;
  for (let i = 0; i < destino.length; i++) {
    sum += destino.charCodeAt(i);
  }

  const img1 = genericImages[sum % genericImages.length];
  const img2 = genericImages[(sum + 1) % genericImages.length];
  const img3 = genericImages[(sum + 2) % genericImages.length];

  return [img1, img2, img3];
};

export const getImagenDestino = (destino: string): string => {
  return getImagenesDestino(destino)[0];
};
