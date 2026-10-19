import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Order } from '../models/Order';
import { emitOrderStatusUpdated, emitDeliveryLocation, emitPaymentCollected } from '../socket';

// @desc    Get delivery rider dashboard metrics
// @route   GET /api/delivery/stats
// @access  Private (Delivery Rider or Admin)
export const getDeliveryStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const riderName = req.user?.name || 'Sunil Verma';

    const activeTrips = await Order.countDocuments({
      status: { $in: ['Processing', 'Out for Delivery'] },
    });

    const completedTrips = await Order.countDocuments({
      status: 'Delivered',
      deliveryPersonnel: { $regex: riderName.split(' ')[0], $options: 'i' },
    });

    // Calculate Cash vs. UPI collections for this rider
    const deliveredOrders = await Order.find({
      status: 'Delivered',
      deliveryPersonnel: { $regex: riderName.split(' ')[0], $options: 'i' },
    });

    let cashCollected = 0;
    let upiCollected = 0;

    for (const o of deliveredOrders) {
      if (o.paymentDetails?.method === 'CASH') {
        cashCollected += o.paymentDetails.amountCollected || o.grandTotal || 0;
      } else if (o.paymentDetails?.method === 'UPI_QR') {
        upiCollected += o.paymentDetails.amountCollected || o.grandTotal || 0;
      } else if (o.paymentMethod === 'Pay-on-Delivery (COD)') {
        cashCollected += o.grandTotal || 0;
      }
    }

    // Delivery fee earned (e.g. ₹30 flat fee per completed delivery)
    const earnedPayout = completedTrips * 30;

    res.status(200).json({
      success: true,
      data: {
        riderName,
        activeTrips,
        completedTrips,
        cashCollected,
        upiCollected,
        totalCollected: cashCollected + upiCollected,
        earnedPayout,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get delivery orders assigned or available
// @route   GET /api/delivery/orders
// @access  Private (Delivery Rider or Admin)
export const getDeliveryOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { filter } = req.query; // 'active', 'delivered', 'all'
    const query: any = {};

    if (filter === 'delivered') {
      query.status = 'Delivered';
    } else if (filter === 'active' || !filter) {
      query.status = { $in: ['Processing', 'Out for Delivery'] };
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

// @desc    Update delivery status (Pickup from store / Handover to customer)
// @route   PATCH /api/delivery/orders/:id/status
// @access  Private (Delivery Rider or Admin)
export const updateDeliveryStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    const riderName = req.user?.name || order.deliveryPersonnel || 'Sunil Verma';

    if (status === 'Out for Delivery') {
      order.status = 'Out for Delivery';
      order.deliveryPersonnel = riderName;
      order.statusHistory.push({
        status: 'Out for Delivery',
        timestamp: new Date(),
        note: note || `Picked up from ${order.shopName} by ${riderName}. On the way to delivery address.`,
      });
    } else if (status === 'Delivered') {
      const { paymentData, deliveryOtp } = req.body;
      order.status = 'Delivered';
      order.deliveryPersonnel = riderName;
      order.isPaid = true; // Payment collected upon successful delivery
      
      if (paymentData) {
        order.paymentDetails = {
          method: paymentData.method || (order.paymentMethod?.includes('COD') ? 'CASH' : 'ONLINE_PREPAID'),
          collectedAt: new Date(),
          amountCollected: paymentData.amount || order.grandTotal,
          cashTendered: paymentData.cashTendered,
          changeReturned: paymentData.changeReturned,
          upiTransactionRef: paymentData.upiTransactionRef,
          deliveryOtpVerified: Boolean(deliveryOtp),
          collectedBy: riderName,
          note: paymentData.note,
        };
      }

      order.statusHistory.push({
        status: 'Delivered',
        timestamp: new Date(),
        note: note || `Safely delivered to customer doorstep by ${riderName}.`,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Invalid status transition. Allowed values: 'Out for Delivery', 'Delivered'.",
      });
      return;
    }

    await order.save();

    // Real-time broadcast to user, merchant, and admin
    emitOrderStatusUpdated(order);
    if (order.paymentDetails) {
      emitPaymentCollected(order, order.paymentDetails);
    }

    res.status(200).json({
      success: true,
      message: `Order status updated to ${order.status}`,
      data: order,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Collect payment at doorstep and deliver order
// @route   POST /api/delivery/orders/:id/collect-payment
// @access  Private (Delivery Rider or Admin)
export const collectDeliveryPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      paymentMethod, // 'UPI_QR' | 'CASH' | 'ONLINE_PREPAID' | 'PAYMENT_LINK'
      amount,
      cashTendered,
      changeReturned,
      upiTransactionRef,
      deliveryOtp,
      note,
    } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    // Verify delivery OTP if provided and set on order
    if (order.deliveryOtp && deliveryOtp) {
      if (order.deliveryOtp.trim() !== String(deliveryOtp).trim()) {
        res.status(400).json({
          success: false,
          message: `Incorrect Delivery OTP '${deliveryOtp}'. Please verify the 4-digit code shown on customer's screen.`,
        });
        return;
      }
    }

    const riderName = req.user?.name || order.deliveryPersonnel || 'Sunil Verma';
    const finalAmount = amount !== undefined ? Number(amount) : order.grandTotal;

    order.isPaid = true;
    order.status = 'Delivered';
    order.deliveryPersonnel = riderName;

    const refNumber = upiTransactionRef || (paymentMethod === 'UPI_QR' ? `UPI/${Math.floor(100000000000 + Math.random() * 900000000000)}` : undefined);

    const paymentDetails = {
      method: paymentMethod || 'UPI_QR',
      collectedAt: new Date(),
      amountCollected: finalAmount,
      cashTendered: cashTendered ? Number(cashTendered) : undefined,
      changeReturned: changeReturned ? Number(changeReturned) : undefined,
      upiTransactionRef: refNumber,
      deliveryOtpVerified: Boolean(deliveryOtp),
      collectedBy: riderName,
      note: note || (paymentMethod === 'UPI_QR' ? `Paid ₹${finalAmount} via UPI BharatQR scan (Ref: ${refNumber})` : `Collected ₹${finalAmount} physical cash at doorstep.`),
    };

    order.paymentDetails = paymentDetails;

    order.statusHistory.push({
      status: 'Delivered',
      timestamp: new Date(),
      note: note || `Handed over to customer and payment of ₹${finalAmount} collected via ${paymentMethod === 'UPI_QR' ? 'UPI QR code' : paymentMethod === 'CASH' ? 'Cash' : 'Online'} by ${riderName}.`,
    });

    await order.save();

    // Broadcast both status update and payment collected event
    emitOrderStatusUpdated(order);
    emitPaymentCollected(order, paymentDetails);

    res.status(200).json({
      success: true,
      message: `Payment of ₹${finalAmount} successfully recorded and order marked as Delivered`,
      data: order,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update live GPS coordinates of rider for an order
// @route   PATCH /api/delivery/orders/:id/location
// @access  Private (Delivery Rider or Admin)
export const updateDeliveryLocation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { lat, lng, speed, heading, statusText, batteryLevel } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    if (!lat || !lng) {
      res.status(400).json({ success: false, message: 'Latitude and Longitude are required' });
      return;
    }

    order.deliveryLocation = {
      lat: Number(lat),
      lng: Number(lng),
      speed: speed !== undefined ? Number(speed) : (order.deliveryLocation?.speed ?? 26),
      heading: heading !== undefined ? Number(heading) : (order.deliveryLocation?.heading ?? 0),
      statusText: statusText || (order.status === 'Out for Delivery' ? 'En route to customer doorstep' : 'Arriving at store for pickup'),
      batteryLevel: batteryLevel !== undefined ? Number(batteryLevel) : (order.deliveryLocation?.batteryLevel ?? 84),
      lastUpdated: new Date(),
    };

    await order.save();

    // Broadcast live coordinates to customer and merchant
    emitDeliveryLocation(order._id.toString(), order.deliveryLocation);

    res.status(200).json({
      success: true,
      message: 'Delivery location updated successfully',
      data: order.deliveryLocation,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Simulate next GPS step along route in Rewa
// @route   POST /api/delivery/orders/:id/simulate-step
// @access  Private (Delivery Rider or Admin or Customer simulator)
export const simulateDeliveryStep = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    const shopLoc = order.shopLocation || { lat: 24.5362, lng: 81.3037 };
    const destLoc = order.destinationLocation || { lat: 24.5420, lng: 81.2965 };
    const currentLoc = order.deliveryLocation || {
      lat: shopLoc.lat,
      lng: shopLoc.lng,
      speed: 25,
      heading: 0,
      statusText: 'Rider en route',
      batteryLevel: 85,
    };

    // Calculate step towards destination
    const deltaLat = destLoc.lat - currentLoc.lat;
    const deltaLng = destLoc.lng - currentLoc.lng;
    const dist = Math.sqrt(deltaLat * deltaLat + deltaLng * deltaLng);

    let nextLat = currentLoc.lat;
    let nextLng = currentLoc.lng;
    let statusText = 'En route to customer in Rewa';
    let speed = Math.floor(Math.random() * 15) + 20; // 20-35 km/h

    if (dist > 0.0003) {
      // Step ~12% closer per tick
      const stepRatio = 0.12;
      nextLat = currentLoc.lat + deltaLat * stepRatio;
      nextLng = currentLoc.lng + deltaLng * stepRatio;
      statusText = `Moving towards ${order.deliveryAddress.split(',')[0]} (${(dist * 111).toFixed(1)} km left)`;
    } else {
      nextLat = destLoc.lat;
      nextLng = destLoc.lng;
      speed = 0;
      statusText = 'Rider has arrived at customer delivery doorstep!';
    }

    // Calculate heading angle
    const heading = Math.round((Math.atan2(deltaLng, deltaLat) * 180) / Math.PI + 360) % 360;

    order.deliveryLocation = {
      lat: Number(nextLat.toFixed(6)),
      lng: Number(nextLng.toFixed(6)),
      heading,
      speed,
      statusText,
      batteryLevel: Math.max(15, (currentLoc.batteryLevel || 85) - 1),
      lastUpdated: new Date(),
    };

    await order.save();

    // Broadcast simulated coordinates in real time
    emitDeliveryLocation(order._id.toString(), order.deliveryLocation);

    res.status(200).json({
      success: true,
      data: {
        orderId: order._id,
        deliveryLocation: order.deliveryLocation,
        shopLocation: shopLoc,
        destinationLocation: destLoc,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};


