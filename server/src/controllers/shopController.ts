import { Request, Response } from 'express';
import { Shop } from '../models/Shop';
import { Product } from '../models/Product';

// Helper: Haversine distance calculator
const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};

// Known Rewa coordinate coordinates fallback for shops
const inferShopCoordinates = (address: string, name: string): { lat: number; lng: number } => {
  const text = (address + ' ' + name).toLowerCase();
  if (text.includes('sirmour')) return { lat: 24.542, lng: 81.291 };
  if (text.includes('hospital') || text.includes('sgmh')) return { lat: 24.532, lng: 81.3025 };
  if (text.includes('college') || text.includes('model science')) return { lat: 24.545, lng: 81.305 };
  if (text.includes('mall') || text.includes('shilpi')) return { lat: 24.536, lng: 81.2995 };
  if (text.includes('narendra nagar')) return { lat: 24.529, lng: 81.312 };
  if (text.includes('stadium') || text.includes('nehru')) return { lat: 24.541, lng: 81.314 };
  if (text.includes('mandi')) return { lat: 24.531, lng: 81.294 };
  if (text.includes('pili kothi')) return { lat: 24.539, lng: 81.308 };
  if (text.includes('bichhiya')) return { lat: 24.521, lng: 81.318 };
  if (text.includes('kothi')) return { lat: 24.548, lng: 81.288 };
  if (text.includes('anand nagar')) return { lat: 24.544, lng: 81.304 };
  if (text.includes('apsu') || text.includes('university')) return { lat: 24.558, lng: 81.332 };
  // Default to Civil Lines central hub
  return { lat: 24.5373, lng: 81.2986 };
};

// @desc    Get all shops with filtering, search, and sorting
// @route   GET /api/shops
// @access  Public
export const getShops = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, search, sortBy, isOpen, userLat, userLng } = req.query;

    const query: any = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (isOpen !== undefined) {
      query.isOpen = isOpen === 'true';
    }

    if (search) {
      const searchStr = search as string;
      const matchingProducts = await Product.find({
        $or: [
          { name: { $regex: searchStr, $options: 'i' } },
          { description: { $regex: searchStr, $options: 'i' } },
          { category: { $regex: searchStr, $options: 'i' } },
        ],
      }).select('shopId');

      const productShopIds = matchingProducts.map((p) => p.shopId);

      query.$or = [
        { name: { $regex: searchStr, $options: 'i' } },
        { description: { $regex: searchStr, $options: 'i' } },
        { categoryLabel: { $regex: searchStr, $options: 'i' } },
        { category: { $regex: searchStr, $options: 'i' } },
        { _id: { $in: productShopIds } },
      ];
    }

    let sortOption: any = { rating: -1 };

    if (sortBy === 'time') {
      sortOption = { deliveryTimeMin: 1 };
    } else if (sortBy === 'rating') {
      sortOption = { rating: -1 };
    } else if (sortBy === 'near') {
      sortOption = { distanceKm: 1 };
    } else if (sortBy === 'relevance') {
      sortOption = { featured: -1, rating: -1 };
    }

    const rawShops = await Shop.find(query).sort(sortOption);

    // If user coordinates are provided, compute dynamic distances and delivery times
    let finalShops: any[] = rawShops.map((shop) => shop.toObject());

    const hasUserCoords = userLat && userLng && !isNaN(Number(userLat)) && !isNaN(Number(userLng));
    if (hasUserCoords) {
      const uLat = parseFloat(userLat as string);
      const uLng = parseFloat(userLng as string);

      finalShops = finalShops.map((shop) => {
        const coords =
          shop.lat && shop.lng
            ? { lat: shop.lat, lng: shop.lng }
            : inferShopCoordinates(shop.address, shop.name);

        const dist = calculateDistanceKm(uLat, uLng, coords.lat, coords.lng);
        // Dynamic delivery ETA: base 12 mins + 5 mins per km
        const dynamicEta = Math.max(15, Math.round(12 + dist * 5));

        return {
          ...shop,
          distanceKm: dist,
          deliveryTimeMin: dynamicEta,
          lat: coords.lat,
          lng: coords.lng,
        };
      });

      // If sorted by nearest or default relevance, prioritize closer stores
      if (sortBy === 'near') {
        finalShops.sort((a, b) => a.distanceKm - b.distanceKm);
      } else if (sortBy === 'time') {
        finalShops.sort((a, b) => a.deliveryTimeMin - b.deliveryTimeMin);
      }
    }

    res.status(200).json({
      success: true,
      count: finalShops.length,
      data: finalShops,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single shop by ID with products
// @route   GET /api/shops/:id
// @access  Public
export const getShopById = async (req: Request, res: Response): Promise<void> => {
  try {
    const shop = await Shop.findById(req.params.id);

    if (!shop) {
      res.status(404).json({ success: false, message: 'Shop not found' });
      return;
    }

    const products = await Product.find({ shopId: shop._id });

    res.status(200).json({
      success: true,
      data: shop,
      products,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new shop
// @route   POST /api/shops
// @access  Private/Admin
export const createShop = async (req: Request, res: Response): Promise<void> => {
  try {
    const shop = await Shop.create(req.body);
    res.status(201).json({ success: true, data: shop });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Toggle Shop open/closed status
// @route   PATCH /api/shops/:id/toggle-status
// @access  Private/Admin
export const toggleShopStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) {
      res.status(404).json({ success: false, message: 'Shop not found' });
      return;
    }

    shop.isOpen = !shop.isOpen;
    await shop.save();

    res.status(200).json({
      success: true,
      message: `Shop is now ${shop.isOpen ? 'Open' : 'Closed'}`,
      data: shop,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

