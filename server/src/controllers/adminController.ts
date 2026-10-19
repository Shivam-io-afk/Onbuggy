import { Request, Response } from 'express';
import { Order } from '../models/Order';
import { Shop } from '../models/Shop';
import { User } from '../models/User';
import { emitOrderStatusUpdated, emitShopStatusChanged, emitPlatformBroadcast } from '../socket';

// @desc    Get dashboard executive metrics
// @route   GET /api/admin/stats
// @access  Private (Admin)
export const getAdminStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalOrders = await Order.countDocuments();
    const activeOrders = await Order.countDocuments({
      status: { $in: ['Order Placed', 'Processing', 'Out for Delivery'] },
    });
    const deliveredOrders = await Order.countDocuments({ status: 'Delivered' });
    const cancelledOrders = await Order.countDocuments({ status: 'Cancelled' });

    // Calculate gross platform revenue (excluding cancelled orders)
    const revenueAggregation = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, totalRevenue: { $sum: '$grandTotal' } } },
    ]);
    const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0;

    const totalStores = await Shop.countDocuments();
    const openStores = await Shop.countDocuments({ isOpen: true });

    const totalUsers = await User.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalRiders = await User.countDocuments({ role: 'delivery' });

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        activeOrders,
        deliveredOrders,
        cancelledOrders,
        totalRevenue,
        totalStores,
        openStores,
        totalUsers,
        totalCustomers,
        totalRiders,
        recentOrders,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all orders with optional filtering
// @route   GET /api/admin/orders
// @access  Private (Admin)
export const getAdminOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, search, shopId } = req.query;
    const query: any = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (shopId) {
      query.shopId = shopId;
    }

    if (search) {
      const searchStr = search as string;
      query.$or = [
        { orderNumber: { $regex: searchStr, $options: 'i' } },
        { userName: { $regex: searchStr, $options: 'i' } },
        { userPhone: { $regex: searchStr, $options: 'i' } },
        { shopName: { $regex: searchStr, $options: 'i' } },
        { deliveryPersonnel: { $regex: searchStr, $options: 'i' } },
      ];
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

// @desc    Update order status or assign rider
// @route   PATCH /api/admin/orders/:id/status
// @access  Private (Admin)
export const updateAdminOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, deliveryPersonnel, isPaid } = req.body;
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
        note: `Updated by administrator to ${status}`,
      });
    }

    if (deliveryPersonnel) {
      order.deliveryPersonnel = deliveryPersonnel;
    }

    if (isPaid !== undefined) {
      order.isPaid = isPaid;
    }

    await order.save();

    // Real-time broadcast to user, merchant, rider, and admin
    emitOrderStatusUpdated(order);

    res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      data: order,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all shops for admin management
// @route   GET /api/admin/shops
// @access  Private (Admin)
export const getAdminShops = async (req: Request, res: Response): Promise<void> => {
  try {
    const shops = await Shop.find().sort({ name: 1 });
    res.status(200).json({
      success: true,
      count: shops.length,
      data: shops,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle shop open/closed status
// @route   PATCH /api/admin/shops/:id/toggle-status
// @access  Private (Admin)
export const toggleAdminShopStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) {
      res.status(404).json({ success: false, message: 'Shop not found' });
      return;
    }

    shop.isOpen = !shop.isOpen;
    await shop.save();

    // Broadcast store status change in real time to customer storefront
    emitShopStatusChanged(shop);

    res.status(200).json({
      success: true,
      message: `Shop marked as ${shop.isOpen ? 'Open' : 'Closed'}`,
      data: shop,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getAdminUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user role
// @route   PATCH /api/admin/users/:id/role
// @access  Private (Admin)
export const updateAdminUserRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role } = req.body;
    if (!['customer', 'admin', 'shopkeeper', 'delivery'].includes(role)) {
      res.status(400).json({ success: false, message: 'Invalid role specified' });
      return;
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get financial reconciliation metrics (COD Cash vs. Digital UPI)
// @route   GET /api/admin/financials
// @access  Private (Admin)
export const getAdminFinancials = async (_req: Request, res: Response): Promise<void> => {
  try {
    const orders = await Order.find({ status: { $ne: 'Cancelled' } });

    let grossRevenue = 0;
    let totalCashCollected = 0;
    let totalUpiCollected = 0;
    let totalPrepaidCollected = 0;
    let totalTaxesCollected = 0;
    let totalCharityCollected = 0;

    const riderLedger: Record<string, { riderName: string; completedCount: number; cashCollected: number; upiCollected: number; lastActive: Date }> = {};

    for (const o of orders) {
      grossRevenue += o.grandTotal || 0;
      totalTaxesCollected += o.taxAmount || 0;
      totalCharityCollected += o.charityAmount || 0;

      const rider = o.deliveryPersonnel || 'Sunil Verma';
      if (!riderLedger[rider]) {
        riderLedger[rider] = {
          riderName: rider,
          completedCount: 0,
          cashCollected: 0,
          upiCollected: 0,
          lastActive: o.updatedAt || o.createdAt,
        };
      }

      if (o.status === 'Delivered') {
        riderLedger[rider].completedCount += 1;
        if (o.paymentDetails?.method === 'CASH') {
          totalCashCollected += o.paymentDetails.amountCollected || o.grandTotal;
          riderLedger[rider].cashCollected += o.paymentDetails.amountCollected || o.grandTotal;
        } else if (o.paymentDetails?.method === 'UPI_QR') {
          totalUpiCollected += o.paymentDetails.amountCollected || o.grandTotal;
          riderLedger[rider].upiCollected += o.paymentDetails.amountCollected || o.grandTotal;
        } else if (o.paymentMethod === 'Pay-on-Delivery (COD)') {
          totalCashCollected += o.grandTotal;
          riderLedger[rider].cashCollected += o.grandTotal;
        } else {
          totalPrepaidCollected += o.grandTotal;
        }
      }
    }

    res.status(200).json({
      success: true,
      data: {
        grossRevenue,
        totalCashCollected,
        totalUpiCollected,
        totalPrepaidCollected,
        totalTaxesCollected,
        totalCharityCollected,
        riderLedger: Object.values(riderLedger),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new store partner from admin panel
// @route   POST /api/admin/shops
// @access  Private (Admin)
export const createAdminShop = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, category, categoryLabel, phone, address, deliveryTimeMin, distanceKm, description, image } = req.body;

    if (!name || !category) {
      res.status(400).json({ success: false, message: 'Store name and category are required' });
      return;
    }

    const defaultImg =
      category === 'medicine'
        ? 'resorces/medicines/1.png'
        : category === 'grocery'
        ? 'resorces/grocery/1.png'
        : 'resorces/veg&Fruits/1.png';

    const newShop = await Shop.create({
      name,
      category,
      categoryLabel: categoryLabel || `${name} • Verified Hyperlocal Store`,
      phone: phone || '+91 9876543210',
      address: address || 'Civil Lines, Rewa, MP',
      deliveryTimeMin: deliveryTimeMin ? Number(deliveryTimeMin) : 25,
      distanceKm: distanceKm ? Number(distanceKm) : 1.5,
      description: description || 'Verified local merchant delivering high quality essentials across Rewa.',
      image: image || defaultImg,
      isOpen: true,
      rating: 4.8,
      reviewCount: 1,
    });

    emitShopStatusChanged(newShop);

    res.status(201).json({
      success: true,
      message: 'New merchant store created successfully!',
      data: newShop,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete or unlist a store partner
// @route   DELETE /api/admin/shops/:id
// @access  Private (Admin)
export const deleteAdminShop = async (req: Request, res: Response): Promise<void> => {
  try {
    const shop = await Shop.findByIdAndDelete(req.params.id);
    if (!shop) {
      res.status(404).json({ success: false, message: 'Shop not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Shop '${shop.name}' removed successfully`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Broadcast a platform-wide flash alert to all users/riders
// @route   POST /api/admin/broadcast
// @access  Private (Admin)
export const broadcastPlatformAlert = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, message, type } = req.body;

    if (!message) {
      res.status(400).json({ success: false, message: 'Broadcast message content is required' });
      return;
    }

    const alertPayload = {
      title: title || '⚡ Platform Announcement from Onbuggy HQ',
      message,
      type: type || 'info', // 'info' | 'warning' | 'emergency'
      timestamp: new Date().toISOString(),
    };

    emitPlatformBroadcast(alertPayload);

    res.status(200).json({
      success: true,
      message: 'Flash announcement broadcasted in real time across the platform',
      data: alertPayload,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};


