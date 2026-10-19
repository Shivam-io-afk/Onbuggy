import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Shop } from '../models/Shop';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { emitOrderStatusUpdated, emitProductStockChanged, emitShopStatusChanged } from '../socket';

// Helper to resolve the merchant's shop
const resolveMerchantShop = async (req: AuthRequest) => {
  if (req.user?.shopId) {
    const shop = await Shop.findById(req.user.shopId);
    if (shop) return shop;
  }
  // Fallback to first shop (Kamal Medical Store) for demo/admin convenience
  return await Shop.findOne().sort({ createdAt: 1 });
};

// @desc    Get merchant dashboard statistics
// @route   GET /api/merchant/stats
// @access  Private (Shopkeeper or Admin)
export const getMerchantStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const shop = await resolveMerchantShop(req);
    if (!shop) {
      res.status(404).json({ success: false, message: 'Store not found' });
      return;
    }

    const shopName = shop.name;
    const allShopOrders = await Order.find({ shopName });

    const totalOrders = allShopOrders.length;
    const activeOrders = allShopOrders.filter((o) =>
      ['Order Placed', 'Processing', 'Out for Delivery'].includes(o.status)
    ).length;
    const completedOrders = allShopOrders.filter((o) => o.status === 'Delivered').length;

    // Gross GMV for this store
    const storeRevenue = allShopOrders
      .filter((o) => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + (o.subtotal || o.grandTotal || 0), 0);

    const totalProducts = await Product.countDocuments({ shopId: shop._id });
    const inStockProducts = await Product.countDocuments({ shopId: shop._id, inStock: true });

    res.status(200).json({
      success: true,
      data: {
        shop,
        storeRevenue,
        totalOrders,
        activeOrders,
        completedOrders,
        totalProducts,
        inStockProducts,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get merchant incoming and historical orders
// @route   GET /api/merchant/orders
// @access  Private (Shopkeeper or Admin)
export const getMerchantOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const shop = await resolveMerchantShop(req);
    if (!shop) {
      res.status(404).json({ success: false, message: 'Store not found' });
      return;
    }

    const { status } = req.query;
    const query: any = { shopName: shop.name };

    if (status && status !== 'all') {
      query.status = status;
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Accept order or advance preparation state
// @route   PATCH /api/merchant/orders/:id/status
// @access  Private (Shopkeeper or Admin)
export const updateMerchantOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    if (status) {
      order.status = status;
      order.statusHistory.push({
        status,
        timestamp: new Date(),
        note: note || `Order status updated to ${status} by merchant store.`,
      });
      await order.save();
      // Broadcast status update in real time
      emitOrderStatusUpdated(order);
    }

    res.status(200).json({
      success: true,
      message: `Order updated to ${order.status}`,
      data: order,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get merchant inventory products
// @route   GET /api/merchant/products
// @access  Private (Shopkeeper or Admin)
export const getMerchantProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const shop = await resolveMerchantShop(req);
    if (!shop) {
      res.status(404).json({ success: false, message: 'Store not found' });
      return;
    }

    const products = await Product.find({ shopId: shop._id }).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle product in-stock availability
// @route   PATCH /api/merchant/products/:id/toggle-stock
// @access  Private (Shopkeeper or Admin)
export const toggleProductStock = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    product.inStock = !product.inStock;
    await product.save();

    // Broadcast stock change in real time to all customers
    emitProductStockChanged(product);

    res.status(200).json({
      success: true,
      message: `Product ${product.name} is now ${product.inStock ? 'In Stock' : 'Out of Stock'}`,
      data: product,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle merchant store open/closed status
// @route   PATCH /api/merchant/store/toggle-status
// @access  Private (Shopkeeper or Admin)
export const toggleMerchantStoreStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const shop = await resolveMerchantShop(req);
    if (!shop) {
      res.status(404).json({ success: false, message: 'Store not found' });
      return;
    }

    shop.isOpen = !shop.isOpen;
    await shop.save();

    // Broadcast store status in real time to all customer storefronts
    emitShopStatusChanged(shop);

    res.status(200).json({
      success: true,
      message: `Store ${shop.name} is now ${shop.isOpen ? 'Open' : 'Closed'}`,
      data: shop,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

