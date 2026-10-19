import { Request, Response } from 'express';
import { Order, OrderStatus } from '../models/Order';
import { AuthRequest } from '../middleware/auth';
import { emitOrderPlaced, emitOrderStatusUpdated } from '../socket';

// Helper to calculate pricing
const calculateOrderPricing = (
  subtotal: number,
  couponCode?: string,
  optInCharity = false
): { deliveryFee: number; taxAmount: number; charityAmount: number; donationGstFee: number; discount: number; grandTotal: number } => {
  const deliveryFee = 30;
  // 5% standard GST
  const taxAmount = subtotal > 0 ? Math.round((subtotal * 5) / 100) : 0;
  // Optional opt-in ₹10 donation for Feeding India
  const charityAmount = optInCharity ? 10 : 0;
  const donationGstFee = taxAmount + charityAmount;

  let discount = 0;
  if (couponCode) {
    const code = couponCode.trim().toUpperCase();
    if (code === 'FIRSTTIME') {
      if (subtotal >= 200) {
        discount = Math.min(Math.round(subtotal * 0.5), 150);
      }
    } else if (code === 'BAPPA20') {
      if (subtotal >= 150) {
        discount = Math.min(Math.round(subtotal * 0.2), 100);
      }
    }
  }

  const grandTotal = Math.max(0, subtotal + deliveryFee + taxAmount + charityAmount - discount);

  return { deliveryFee, taxAmount, charityAmount, donationGstFee, discount, grandTotal };
};

// @desc    Upload prescription or order image
// @route   POST /api/orders/upload-prescription
// @access  Public
export const uploadPrescriptionImage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'Please upload an image file' });
      return;
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    res.status(200).json({
      success: true,
      message: 'Prescription uploaded successfully',
      imageUrl: fileUrl,
      fileName: req.file.originalname,
      fileSize: req.file.size,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new order
// @route   POST /api/orders
// @access  Public (Optional Auth)
export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      shopId,
      shopName,
      deliveryAddress,
      items,
      prescriptionImageUrl,
      subtotal: providedSubtotal,
      couponCode,
      optInCharity,
      paymentMethod,
      walletProvider,
      userName,
      userPhone,
      userEmail,
    } = req.body;

    if (!deliveryAddress) {
      res.status(400).json({ success: false, message: 'Delivery address is required' });
      return;
    }

    // Calculate subtotal from items if present, else use providedSubtotal
    let subtotal = 0;
    if (items && Array.isArray(items) && items.length > 0) {
      subtotal = items.reduce(
        (sum: number, item: any) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
        0
      );
    } else if (providedSubtotal) {
      subtotal = Math.round(Number(providedSubtotal));
    } else {
      subtotal = 350;
    }

    // Enforce budget limits: minimum ₹50, maximum ₹50,000
    if (subtotal < 50 || subtotal > 50000 || isNaN(subtotal)) {
      res.status(400).json({
        success: false,
        message: 'Order budget must be between ₹50 and ₹50,000',
      });
      return;
    }

    const { deliveryFee, taxAmount, charityAmount, donationGstFee, discount, grandTotal } = calculateOrderPricing(
      subtotal,
      couponCode,
      Boolean(optInCharity)
    );

    const orderNumber = `OB-${Math.floor(1000 + Math.random() * 9000)}`;

    const effectiveName = userName || req.user?.name || 'Guest User';
    const effectivePhone = userPhone || req.user?.phone || '9876543210';
    const effectiveEmail = userEmail || req.user?.email || '';

    const newOrder = await Order.create({
      orderNumber,
      userId: req.user?._id,
      userName: effectiveName,
      userPhone: effectivePhone,
      userEmail: effectiveEmail,
      shopId,
      shopName: shopName || 'Kamal Medical Store',
      deliveryAddress,
      items: items || [],
      prescriptionImageUrl: prescriptionImageUrl || '',
      subtotal,
      deliveryFee,
      taxAmount,
      charityAmount,
      donationGstFee,
      couponCode: couponCode || '',
      discount,
      grandTotal,
      paymentMethod: paymentMethod || 'Pay-on-Delivery (COD)',
      walletProvider: walletProvider || '',
      isPaid: paymentMethod !== 'Pay-on-Delivery (COD)',
      status: 'Order Placed',
      deliveryPersonnel: 'Sunil Verma (Delivery Partner)',
      statusHistory: [
        {
          status: 'Order Placed',
          timestamp: new Date(),
          note: 'Your order has been received by Onbuggy.',
        },
      ],
      estimatedDeliveryTimeMinutes: 25,
    });

    // Real-time broadcast to Admin, Merchant, and Delivery fleet
    emitOrderPlaced(newOrder);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      data: newOrder,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's orders
// @route   GET /api/orders/my-orders
// @access  Public (matches user token or email/phone query)
export const getMyOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, phone } = req.query;

    let query: any = {};

    if (req.user) {
      query.$or = [{ userId: req.user._id }, { userEmail: req.user.email }];
    } else if (email) {
      query.userEmail = email;
    } else if (phone) {
      query.userPhone = phone;
    } else {
      // If no auth or query, return the most recent active demo orders
      query = {};
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

// @desc    Get order by ID or orderNumber
// @route   GET /api/orders/:id
// @access  Public
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    let order = null;
    if (id.startsWith('OB-')) {
      order = await Order.findOne({ orderNumber: id });
    } else {
      order = await Order.findById(id);
    }

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Advance order status (Simulator for testing delivery workflow)
// @route   PATCH /api/orders/:id/advance-status
// @access  Public
export const advanceOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    if (order.status === 'Delivered') {
      res.status(400).json({ success: false, message: 'Order has already been delivered' });
      return;
    }

    if (order.status === 'Cancelled') {
      res.status(400).json({ success: false, message: 'Order was cancelled' });
      return;
    }

    const stages: OrderStatus[] = [
      'Order Placed',
      'Processing',
      'Out for Delivery',
      'Delivered',
    ];

    const currentIndex = stages.indexOf(order.status);
    const nextStatus = stages[currentIndex + 1] || 'Delivered';

    order.status = nextStatus;
    order.statusHistory.push({
      status: nextStatus,
      timestamp: new Date(),
      note: `Status updated to ${nextStatus}`,
    });

    await order.save();

    // Broadcast status change in real time
    emitOrderStatusUpdated(order);

    res.status(200).json({
      success: true,
      message: `Order status advanced to '${nextStatus}'`,
      data: order,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel an order
// @route   PATCH /api/orders/:id/cancel
// @access  Public
export const cancelOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    if (order.status === 'Delivered') {
      res.status(400).json({
        success: false,
        message: 'Delivered orders cannot be cancelled.',
      });
      return;
    }

    order.status = 'Cancelled';
    order.statusHistory.push({
      status: 'Cancelled',
      timestamp: new Date(),
      note: 'Order was cancelled by the user.',
    });

    await order.save();

    // Broadcast status change in real time
    emitOrderStatusUpdated(order);

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

