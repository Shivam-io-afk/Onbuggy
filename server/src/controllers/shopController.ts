import { Request, Response } from 'express';
import { Shop } from '../models/Shop';
import { Product } from '../models/Product';

// @desc    Get all shops with filtering, search, and sorting
// @route   GET /api/shops
// @access  Public
export const getShops = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, search, sortBy, isOpen } = req.query;

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

    const shops = await Shop.find(query).sort(sortOption);

    res.status(200).json({
      success: true,
      count: shops.length,
      data: shops,
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

