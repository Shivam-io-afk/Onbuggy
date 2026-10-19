// Rewa Hyperlocal Geodata & Geocoding Service for Onbuggy

export interface RewaLocality {
  id: string;
  name: string;
  area: string;
  landmark: string;
  pincode: string;
  lat: number;
  lng: number;
  category: 'commercial' | 'residential' | 'medical' | 'educational' | 'market' | 'hub';
  tags: string[];
}

export const REWA_LOCALITIES: RewaLocality[] = [
  {
    id: 'civil-lines',
    name: 'Civil Lines, Rewa',
    area: 'Civil Lines',
    landmark: 'Near Old Bus Stand & Commissioner Office',
    pincode: '486001',
    lat: 24.5373,
    lng: 81.2986,
    category: 'commercial',
    tags: ['central', 'bus stand', 'court', 'bank', 'office', 'main'],
  },
  {
    id: 'sirmour-chowk',
    name: 'Sirmour Chowk, Rewa',
    area: 'Sirmour Chowk',
    landmark: 'Near Overbridge & Rewa Fort Road',
    pincode: '486001',
    lat: 24.542,
    lng: 81.291,
    category: 'hub',
    tags: ['junction', 'overbridge', 'bazaar', 'chauraha', 'crossing'],
  },
  {
    id: 'college-road',
    name: 'College Road, Rewa',
    area: 'College Road',
    landmark: 'Opposite Model Science College & TRS College',
    pincode: '486001',
    lat: 24.545,
    lng: 81.305,
    category: 'educational',
    tags: ['college', 'trs', 'science college', 'girls college', 'student'],
  },
  {
    id: 'hospital-road',
    name: 'Hospital Road, Rewa',
    area: 'Hospital Road',
    landmark: 'Near Sanjay Gandhi Memorial Hospital (SGMH)',
    pincode: '486001',
    lat: 24.532,
    lng: 81.3025,
    category: 'medical',
    tags: ['sgmh', 'medical college', 'doctor', 'clinic', 'pharmacy', 'emergency'],
  },
  {
    id: 'city-mall',
    name: 'City Mall & Shilpi Plaza, Rewa',
    area: 'Shilpi Plaza',
    landmark: 'Block A & B, Shilpi Plaza Market Complex',
    pincode: '486001',
    lat: 24.536,
    lng: 81.2995,
    category: 'commercial',
    tags: ['mall', 'shilpi plaza', 'shopping', 'electronics', 'fashion'],
  },
  {
    id: 'narendra-nagar',
    name: 'Narendra Nagar, Rewa',
    area: 'Narendra Nagar',
    landmark: 'Near Narendra Nagar Park & Water Tank',
    pincode: '486001',
    lat: 24.529,
    lng: 81.312,
    category: 'residential',
    tags: ['colony', 'housing', 'residential', 'park'],
  },
  {
    id: 'subzi-mandi',
    name: 'Subzi Mandi Complex, Rewa',
    area: 'Ghoda Chauraha / Mandi',
    landmark: 'Wholesale Vegetable & Fruit Market',
    pincode: '486001',
    lat: 24.531,
    lng: 81.294,
    category: 'market',
    tags: ['mandi', 'vegetables', 'fruits', 'wholesale', 'fresh'],
  },
  {
    id: 'pili-kothi',
    name: 'Pili Kothi Chowk, Rewa',
    area: 'Pili Kothi',
    landmark: 'Near Circuit House & Rani Talab Road',
    pincode: '486001',
    lat: 24.539,
    lng: 81.308,
    category: 'hub',
    tags: ['circuit house', 'rani talab', 'chowk', 'temple'],
  },
  {
    id: 'apsu-campus',
    name: 'University Road (APSU Campus), Rewa',
    area: 'Awadhesh Pratap Singh University',
    landmark: 'APSU Main Gate & Stadium',
    pincode: '486003',
    lat: 24.558,
    lng: 81.332,
    category: 'educational',
    tags: ['university', 'apsu', 'hostel', 'campus', 'stadium'],
  },
  {
    id: 'bodabagh',
    name: 'Bodabagh, Rewa',
    area: 'Bodabagh',
    landmark: 'Near Bodabagh Police Station & Market',
    pincode: '486001',
    lat: 24.546,
    lng: 81.318,
    category: 'residential',
    tags: ['residential', 'thana', 'market'],
  },
  {
    id: 'dhekaha',
    name: 'Dhekaha, Rewa',
    area: 'Dhekaha',
    landmark: 'Near Dhekaha Chauraha & NH-30 Link',
    pincode: '486001',
    lat: 24.55,
    lng: 81.295,
    category: 'hub',
    tags: ['dhekaha', 'chauraha', 'highway', 'bypass'],
  },
  {
    id: 'saman-naka',
    name: 'Saman Naka, Rewa',
    area: 'Saman',
    landmark: 'Near Saman Tiraha & Sai Temple',
    pincode: '486001',
    lat: 24.543,
    lng: 81.321,
    category: 'hub',
    tags: ['saman', 'tiraha', 'temple', 'bypass'],
  },
  {
    id: 'kothi-compound',
    name: 'Kothi Compound Road, Rewa',
    area: 'Kothi Compound',
    landmark: 'Near Collectorate & Venkat Bhawan',
    pincode: '486001',
    lat: 24.548,
    lng: 81.288,
    category: 'commercial',
    tags: ['collectorate', 'venkat bhawan', 'government', 'kothi'],
  },
  {
    id: 'padra',
    name: 'Padra, Rewa',
    area: 'Padra',
    landmark: 'Near Padra Chauraha & Flyover',
    pincode: '486001',
    lat: 24.525,
    lng: 81.285,
    category: 'residential',
    tags: ['flyover', 'chauraha', 'highway'],
  },
  {
    id: 'ratahara',
    name: 'Ratahara, Rewa',
    area: 'Ratahara',
    landmark: 'Near Ratahara Patel Nagar & Bypass',
    pincode: '486003',
    lat: 24.554,
    lng: 81.325,
    category: 'residential',
    tags: ['bypass', 'patel nagar', 'highway'],
  },
  {
    id: 'urrahat',
    name: 'Urrahat, Rewa',
    area: 'Urrahat',
    landmark: 'Near Urrahat Petrol Pump & Civil Lines Road',
    pincode: '486001',
    lat: 24.534,
    lng: 81.306,
    category: 'commercial',
    tags: ['petrol pump', 'commercial', 'central'],
  },
  {
    id: 'chiraula',
    name: 'Chirahula Colony, Rewa',
    area: 'Chirahula',
    landmark: 'Near Famous Chirahula Hanuman Temple',
    pincode: '486001',
    lat: 24.518,
    lng: 81.302,
    category: 'residential',
    tags: ['hanuman temple', 'chirahula', 'pilgrim', 'temple'],
  },
  {
    id: 'anantpur',
    name: 'Anantpur, Rewa',
    area: 'Anantpur',
    landmark: 'Near Anantpur University Link Road',
    pincode: '486002',
    lat: 24.549,
    lng: 81.31,
    category: 'residential',
    tags: ['colony', 'link road', 'housing'],
  },
  {
    id: 'bichhiya',
    name: 'Bichhiya, Rewa',
    area: 'Bichhiya',
    landmark: 'Near Bichhiya Bridge & River Front',
    pincode: '486001',
    lat: 24.521,
    lng: 81.318,
    category: 'residential',
    tags: ['bridge', 'river', 'residential'],
  },
  {
    id: 'transport-nagar',
    name: 'Transport Nagar, Rewa',
    area: 'Transport Nagar',
    landmark: 'Near Ring Road & Goods Depot',
    pincode: '486003',
    lat: 24.56,
    lng: 81.34,
    category: 'hub',
    tags: ['transport', 'truck', 'depot', 'ring road'],
  },
];

// Haversine formula to compute accurate distance in kilometers
export const calculateDistanceKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const dist = R * c;
  return Math.round(dist * 10) / 10;
};

// Search Rewa localities based on query string
export const searchRewaLocalities = (query: string): RewaLocality[] => {
  if (!query || !query.trim()) {
    // Return most popular hubs by default
    return REWA_LOCALITIES.slice(0, 6);
  }

  const cleanQuery = query.toLowerCase().trim();
  return REWA_LOCALITIES.filter((loc) => {
    return (
      loc.name.toLowerCase().includes(cleanQuery) ||
      loc.area.toLowerCase().includes(cleanQuery) ||
      loc.landmark.toLowerCase().includes(cleanQuery) ||
      loc.pincode.includes(cleanQuery) ||
      loc.tags.some((tag) => tag.includes(cleanQuery))
    );
  });
};

// Find the closest known Rewa locality to given GPS coordinates
export const findClosestRewaLocality = (lat: number, lng: number): RewaLocality => {
  let closest = REWA_LOCALITIES[0];
  let minDistance = calculateDistanceKm(lat, lng, closest.lat, closest.lng);

  for (let i = 1; i < REWA_LOCALITIES.length; i++) {
    const loc = REWA_LOCALITIES[i];
    const dist = calculateDistanceKm(lat, lng, loc.lat, loc.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closest = loc;
    }
  }

  return closest;
};

// Reverse geocode via OpenStreetMap with fallback to closest known Rewa hub
export const reverseGeocodeCoordinates = async (
  lat: number,
  lng: number
): Promise<{ address: string; area: string; lat: number; lng: number }> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        signal: controller.signal,
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'Onbuggy-Hyperlocal-Delivery-Platform',
        },
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const neighbourhood =
        addr.neighbourhood ||
        addr.suburb ||
        addr.residential ||
        addr.road ||
        addr.quarter ||
        addr.city_district ||
        '';
      const city = addr.city || addr.town || addr.county || 'Rewa';

      if (neighbourhood) {
        return {
          address: `${neighbourhood}, ${city}, Madhya Pradesh`,
          area: neighbourhood,
          lat,
          lng,
        };
      }
    }
  } catch {
    // If network or timeout occurs, fallback to local database matcher
  }

  const closest = findClosestRewaLocality(lat, lng);
  return {
    address: `${closest.name}, Madhya Pradesh ${closest.pincode}`,
    area: closest.area,
    lat,
    lng,
  };
};

