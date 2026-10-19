import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { Shop } from '../models/Shop';
import { Product } from '../models/Product';
import { Order } from '../models/Order';

dotenv.config();

const sampleUsers = [
  {
    name: 'Khan Singh',
    email: 'user@onbuggy.com',
    password: 'Password123!',
    phone: '9102234950',
    role: 'customer' as const,
    avatar: 'resorces/other/useravatar.png',
    address: {
      street: '12-B, Green Park Road',
      area: 'Civil Lines',
      city: 'Rewa',
      state: 'Madhya Pradesh',
      pincode: '486001',
    },
  },
  {
    name: 'Admin Onbuggy',
    email: 'admin@onbuggy.com',
    password: 'AdminPassword123!',
    phone: '9876543210',
    role: 'admin' as const,
    avatar: 'resorces/other/useravatar.png',
  },
  {
    name: 'Sunil Verma',
    email: 'rider@onbuggy.com',
    password: 'RiderPassword123!',
    phone: '9826112233',
    role: 'delivery' as const,
    avatar: 'resorces/other/useravatar.png',
    address: {
      street: '45, Station Road',
      area: 'Civil Lines',
      city: 'Rewa',
      state: 'Madhya Pradesh',
      pincode: '486001',
    },
  },
  {
    name: 'Kamal Kishore',
    email: 'merchant@onbuggy.com',
    password: 'MerchantPassword123!',
    phone: '9826112233',
    role: 'shopkeeper' as const,
    avatar: 'resorces/other/useravatar.png',
    address: {
      street: 'Near Old Bus Stand',
      area: 'Civil Lines',
      city: 'Rewa',
      state: 'Madhya Pradesh',
      pincode: '486001',
    },
  },
];

const sampleShops = [
  // Medicine Shops
  {
    name: 'Kamal Medical Store',
    category: 'medicine' as const,
    categoryLabel: 'Medicine & Health Care Products • Medical Shop',
    rating: 4.8,
    reviewCount: 342,
    deliveryTimeMin: 23,
    distanceKm: 1.2,
    isOpen: true,
    description: 'All kinds of medicine, health devices & drugs are available with genuine price range and 24/7 delivery.',
    image: 'resorces/other/frontImage/8626119.png',
    address: 'Near Old Bus Stand, Civil Lines, Rewa',
    phone: '+91 9826112233',
    featured: true,
  },
  {
    name: 'Apollo Pharmacy Express',
    category: 'medicine' as const,
    categoryLabel: 'Pharmacy • Prescription & OTC Care',
    rating: 4.6,
    reviewCount: 189,
    deliveryTimeMin: 18,
    distanceKm: 0.8,
    isOpen: true,
    description: 'Certified medicines, baby care products, diabetic accessories, and immunity boosters.',
    image: 'resorces/other/frontImage/8626119.png',
    address: 'Shop 4, Hospital Road, Rewa',
    phone: '+91 9425114455',
  },
  {
    name: 'Sanjeevani Medicos',
    category: 'medicine' as const,
    categoryLabel: 'Ayurvedic & Allopathic Medicines',
    rating: 4.2,
    reviewCount: 95,
    deliveryTimeMin: 35,
    distanceKm: 2.5,
    isOpen: true,
    description: 'Specialized in chronic care medicines, emergency first aid, and surgical goods.',
    image: 'resorces/other/frontImage/8626119.png',
    address: 'Main Market, Sirmour Chowk, Rewa',
    phone: '+91 9755112233',
  },
  {
    name: 'Care & Cure Chemist',
    category: 'medicine' as const,
    categoryLabel: 'Generic & Branded Drugs',
    rating: 3.9,
    reviewCount: 64,
    deliveryTimeMin: 40,
    distanceKm: 3.1,
    isOpen: false, // Closed shop demo
    description: 'Closed for routine inventory restock. Will reopen at 6:00 PM.',
    image: 'resorces/other/frontImage/8626119.png',
    address: 'Kothi Compound Road, Rewa',
    phone: '+91 9111223344',
  },

  // Grocery Shops
  {
    name: 'Fresh Mart Supermarket',
    category: 'grocery' as const,
    categoryLabel: 'Supermarket • Packed Essentials & Dairy',
    rating: 4.7,
    reviewCount: 520,
    deliveryTimeMin: 20,
    distanceKm: 1.0,
    isOpen: true,
    description: 'One stop shop for premium flour, aromatic rice, spices, cold drinks, and dairy essentials.',
    image: 'resorces/other/frontImage/8626119.png',
    address: 'Ground Floor, City Mall, Rewa',
    phone: '+91 9888776655',
    featured: true,
  },
  {
    name: 'Daily Needs Provision Store',
    category: 'grocery' as const,
    categoryLabel: 'Kirana Store • Pulses, Oils & Spices',
    rating: 4.4,
    reviewCount: 210,
    deliveryTimeMin: 28,
    distanceKm: 1.8,
    isOpen: true,
    description: 'High quality pulses, cold pressed mustard oil, basmati rice, and snack items.',
    image: 'resorces/other/frontImage/8626119.png',
    address: 'Shop 12, Narendra Nagar, Rewa',
    phone: '+91 9777665544',
  },
  {
    name: 'Reliance Smart Point Local',
    category: 'grocery' as const,
    categoryLabel: 'Hypermarket • Packaged Foods',
    rating: 4.5,
    reviewCount: 312,
    deliveryTimeMin: 22,
    distanceKm: 1.4,
    isOpen: true,
    description: 'Great discounts on packaged goods, branded tea, detergent, and bakery treats.',
    image: 'resorces/other/frontImage/8626119.png',
    address: 'Near Stadium Ground, Rewa',
    phone: '+91 9666554433',
  },
  {
    name: 'Shree Krishna Traders',
    category: 'grocery' as const,
    categoryLabel: 'Wholesale & Retail Groceries',
    rating: 3.8,
    reviewCount: 45,
    deliveryTimeMin: 45,
    distanceKm: 3.8,
    isOpen: false, // Closed shop demo
    description: 'Closed for Sunday evening. Online orders resume tomorrow 8:00 AM.',
    image: 'resorces/other/frontImage/8626119.png',
    address: 'Anand Nagar, Rewa',
    phone: '+91 9555443322',
  },

  // Vegetable & Fruit Shops
  {
    name: 'Green Valley Farm Fresh',
    category: 'vegetable' as const,
    categoryLabel: 'Direct Farm Produce • Organic Fruits & Veggies',
    rating: 4.9,
    reviewCount: 410,
    deliveryTimeMin: 15,
    distanceKm: 0.7,
    isOpen: true,
    description: 'Crisp farm-picked green leafy vegetables, juicy seasonal fruits, and organic salads.',
    image: 'resorces/other/frontImage/8626119.png',
    address: 'Subzi Mandi Complex, Rewa',
    phone: '+91 9444332211',
    featured: true,
  },
  {
    name: 'Kisan Sabzi Bhandar',
    category: 'vegetable' as const,
    categoryLabel: 'Daily Fresh Vegetables • Wholesale Price',
    rating: 4.3,
    reviewCount: 160,
    deliveryTimeMin: 25,
    distanceKm: 1.6,
    isOpen: true,
    description: 'Potatoes, onions, tomatoes, ginger, garlic, and kitchen combo packages at wholesale rates.',
    image: 'resorces/other/frontImage/8626119.png',
    address: 'Pili Kothi Chowk, Rewa',
    phone: '+91 9333221100',
  },
  {
    name: 'Nature Fresh Organic Greens',
    category: 'vegetable' as const,
    categoryLabel: 'Exotic Vegetables & Fresh Fruit Baskets',
    rating: 4.6,
    reviewCount: 190,
    deliveryTimeMin: 30,
    distanceKm: 2.2,
    isOpen: true,
    description: 'Imported apples, kiwi, dragon fruit, broccoli, zucchini, and organic hydroponic greens.',
    image: 'resorces/other/frontImage/8626119.png',
    address: 'College Road, Rewa',
    phone: '+91 9222110099',
  },
  {
    name: 'Rewa Daily Greens',
    category: 'vegetable' as const,
    categoryLabel: 'Local Fresh Produce',
    rating: 4.1,
    reviewCount: 78,
    deliveryTimeMin: 32,
    distanceKm: 2.9,
    isOpen: true,
    description: 'Fresh local coriander, mint, green chillies, cauliflowers, and seasonal gourd.',
    image: 'resorces/other/frontImage/8626119.png',
    address: 'Bichhiya Road, Rewa',
    phone: '+91 9111009988',
  },
];

const medicineItemNames = [
  'Dolo 650mg Paracetamol',
  'Amoxicillin 500mg Antibiotic',
  'Cetirizine 10mg Allergy Relief',
  'Azithromycin 500mg Tablets',
  'Benadryl Cough Syrup (100ml)',
  'Vitamin C Zinc Chewable Tablets',
  'Digene Antacid Liquid Gel',
  'Moov Pain Relief Spray',
  'Volini Fast Pain Relief Gel',
  'Digital Thermometer Instant',
  'Band-Aid Waterproof Strips (20s)',
  'Detol Antiseptic Liquid (250ml)',
];

const groceryItemNames = [
  'Aashirvaad Shudh Chakki Atta (5kg)',
  'Fortune Premium Basmati Rice (1kg)',
  'Tata Salt Iodized Vacuum Packed (1kg)',
  'Fortune Sunlite Refined Oil (1L)',
  'Madhur Pure Crystal Sugar (1kg)',
  'Tata Tea Gold Darjeeling Blend (500g)',
  'Nescafe Classic Instant Coffee (50g)',
  'Maggi 2-Minute Masala Noodles (Pack of 4)',
  'Amul Butter Pasteurized (100g)',
  'Kissan Fresh Tomato Ketchup (950g)',
  'Britannia Good Day Butter Cookies',
  'Surf Excel Matic Liquid Detergent (1L)',
];

const vegItemNames = [
  'Fresh Red Farm Tomatoes (1kg)',
  'Desi Pahadi Potatoes (1kg)',
  'Nashik Red Onions (1kg)',
  'Crisp Green Capsicum (500g)',
  'Fresh Green Spinach / Palak (250g)',
  'Cauliflower / Gobhi (1 piece)',
  'Green Peas / Matar (500g)',
  'Fresh Crisp Carrots (500g)',
  'Royal Gala Red Apples (1kg)',
  'Fresh Robust Bananas (1 Dozen)',
  'Sweet Nagpur Oranges (1kg)',
  'Fresh Coriander & Green Chillies Combo',
];

export const seedDatabase = async () => {
  try {
    const connUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/onbuggy';
    await mongoose.connect(connUri);
    console.log('[Seeding]: Connected to MongoDB');

    // Clear existing collections
    await User.deleteMany({});
    await Shop.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    console.log('[Seeding]: Cleared old data');

    // Create Users
    const createdUsers = [];
    for (const u of sampleUsers) {
      const user = await User.create(u);
      createdUsers.push(user);
    }
    console.log(`[Seeding]: Created ${createdUsers.length} users`);

    // Create Shops
    const createdShops = [];
    for (const s of sampleShops) {
      const shop = await Shop.create(s);
      createdShops.push(shop);
    }
    console.log(`[Seeding]: Created ${createdShops.length} shops`);

    // Create Products for shops
    const createdProducts = [];
    for (const shop of createdShops) {
      if (shop.category === 'medicine') {
        for (let i = 1; i <= 12; i++) {
          const product = await Product.create({
            shopId: shop._id,
            name: medicineItemNames[i - 1],
            category: 'medicine',
            price: Math.floor(40 + i * 25),
            originalPrice: Math.floor(55 + i * 30),
            unit: i === 5 || i === 7 || i === 12 ? 'bottle' : 'strip',
            image: `resorces/medicines/${i}.png`,
            description: 'Genuine pharmacy medicine stored under temperature controlled conditions.',
            inStock: true,
          });
          createdProducts.push(product);
        }
      } else if (shop.category === 'grocery') {
        for (let i = 1; i <= 12; i++) {
          const product = await Product.create({
            shopId: shop._id,
            name: groceryItemNames[i - 1],
            category: 'grocery',
            price: Math.floor(35 + i * 30),
            originalPrice: Math.floor(45 + i * 35),
            unit: i === 1 ? '5kg pack' : 'pack',
            image: `resorces/grocery/${i}.png`,
            description: 'Fresh quality branded grocery staple with 100% purity guarantee.',
            inStock: true,
          });
          createdProducts.push(product);
        }
      } else if (shop.category === 'vegetable') {
        for (let i = 1; i <= 12; i++) {
          const product = await Product.create({
            shopId: shop._id,
            name: vegItemNames[i - 1],
            category: 'vegetable',
            price: Math.floor(25 + i * 12),
            originalPrice: Math.floor(35 + i * 15),
            unit: i === 10 ? 'dozen' : 'kg',
            image: `resorces/veg&Fruits/${i}.png`,
            description: 'Handpicked fresh farm produce delivered within hours of harvest.',
            inStock: true,
          });
          createdProducts.push(product);
        }
      }
    }
    console.log(`[Seeding]: Created ${createdProducts.length} products`);

    // Link merchant user to Kamal Medical Store
    await User.updateOne({ email: 'merchant@onbuggy.com' }, { shopId: createdShops[0]._id });

    // Create Sample Orders (matches Order #2732 from original HTML code!)
    const kamalShop = createdShops.find((s) => s.name === 'Kamal Medical Store') || createdShops[0];
    const normalUser = createdUsers[0];

    const order1 = await Order.create({
      orderNumber: '2732',
      userId: normalUser._id,
      userName: normalUser.name,
      userPhone: normalUser.phone,
      userEmail: normalUser.email,
      shopId: kamalShop._id,
      shopName: kamalShop.name,
      shopLocation: { lat: 24.5362, lng: 81.3037 },
      deliveryAddress: '12-B, Green Park Road, Civil Lines, Rewa, MP 486001',
      destinationLocation: { lat: 24.5420, lng: 81.2965 },
      items: [
        {
          name: 'Dolo 650mg Paracetamol',
          price: 65,
          quantity: 2,
          unit: 'strip',
          image: 'resorces/medicines/1.png',
        },
        {
          name: 'Vitamin C Zinc Chewable Tablets',
          price: 180,
          quantity: 1,
          unit: 'bottle',
          image: 'resorces/medicines/6.png',
        },
      ],
      subtotal: 310,
      deliveryFee: 30,
      donationGstFee: 22,
      discount: 0,
      grandTotal: 362,
      paymentMethod: 'Pay-on-Delivery (COD)',
      isPaid: false,
      status: 'Out for Delivery',
      deliveryPersonnel: 'Sunil Verma (Delivery Partner)',
      deliveryLocation: {
        lat: 24.5388,
        lng: 81.3002,
        speed: 26,
        heading: 305,
        statusText: 'Rider Sunil Verma en route near Sirmour Chauraha (1.1 km to destination)',
        batteryLevel: 86,
        lastUpdated: new Date(),
      },
      statusHistory: [
        {
          status: 'Order Placed',
          timestamp: new Date(Date.now() - 45 * 60 * 1000),
          note: 'Order confirmed and sent to Kamal Medical Store',
        },
        {
          status: 'Processing',
          timestamp: new Date(Date.now() - 25 * 60 * 1000),
          note: 'Pharmacist packaged verified medicines. Rider Sunil Verma picked up package.',
        },
        {
          status: 'Out for Delivery',
          timestamp: new Date(Date.now() - 10 * 60 * 1000),
          note: 'Rider Sunil Verma en route to delivery address.',
        },
      ],
      estimatedDeliveryTimeMinutes: 12,
      createdAt: new Date(Date.now() - 45 * 60 * 1000),
    });

    const order2 = await Order.create({
      orderNumber: '4189',
      userId: normalUser._id,
      userName: normalUser.name,
      userPhone: normalUser.phone,
      userEmail: normalUser.email,
      shopId: createdShops[4]._id,
      shopName: createdShops[4].name,
      deliveryAddress: '12-B, Green Park Road, Civil Lines, Rewa, MP 486001',
      items: [
        {
          name: 'Aashirvaad Shudh Chakki Atta (5kg)',
          price: 245,
          quantity: 1,
          unit: '5kg pack',
          image: 'resorces/grocery/1.png',
        },
        {
          name: 'Fortune Premium Basmati Rice (1kg)',
          price: 110,
          quantity: 2,
          unit: 'pack',
          image: 'resorces/grocery/2.png',
        },
      ],
      subtotal: 465,
      deliveryFee: 30,
      donationGstFee: 33,
      discount: 0,
      grandTotal: 528,
      paymentMethod: 'Wallet',
      walletProvider: 'Google Pay',
      isPaid: true,
      status: 'Order Placed',
      deliveryPersonnel: 'Sunil Verma (Delivery Partner)',
      statusHistory: [
        {
          status: 'Order Placed',
          timestamp: new Date(Date.now() - 10 * 60 * 1000),
          note: 'Order placed and prepaid via Google Pay',
        },
      ],
      estimatedDeliveryTimeMinutes: 25,
      createdAt: new Date(Date.now() - 10 * 60 * 1000),
    });

    const order3 = await Order.create({
      orderNumber: '1892',
      userId: normalUser._id,
      userName: normalUser.name,
      userPhone: normalUser.phone,
      userEmail: normalUser.email,
      shopId: createdShops[8]._id,
      shopName: createdShops[8].name,
      deliveryAddress: '12-B, Green Park Road, Civil Lines, Rewa, MP 486001',
      items: [
        {
          name: 'Desi Pahadi Potatoes (1kg)',
          price: 35,
          quantity: 2,
          unit: 'kg',
          image: 'resorces/veg&Fruits/2.png',
        },
        {
          name: 'Royal Gala Red Apples (1kg)',
          price: 160,
          quantity: 1,
          unit: 'kg',
          image: 'resorces/veg&Fruits/9.png',
        },
      ],
      subtotal: 230,
      deliveryFee: 30,
      donationGstFee: 16,
      couponCode: 'FIRSTTIME',
      discount: 115,
      grandTotal: 161,
      paymentMethod: 'Pay-on-Delivery (COD)',
      isPaid: true,
      status: 'Delivered',
      deliveryPersonnel: 'Ramesh Sharma (Delivery Partner)',
      statusHistory: [
        { status: 'Order Placed', timestamp: new Date(Date.now() - 4 * 3600 * 1000) },
        { status: 'Processing', timestamp: new Date(Date.now() - 3.5 * 3600 * 1000) },
        { status: 'Out for Delivery', timestamp: new Date(Date.now() - 3 * 3600 * 1000) },
        { status: 'Delivered', timestamp: new Date(Date.now() - 2.5 * 3600 * 1000), note: 'Delivered directly to customer hand' },
      ],
      estimatedDeliveryTimeMinutes: 0,
      createdAt: new Date(Date.now() - 4 * 3600 * 1000),
    });

    console.log(`[Seeding]: Created sample orders: ${order1.orderNumber}, ${order2.orderNumber}, ${order3.orderNumber}`);
    console.log('[Seeding]: SUCCESS! All database collections populated.');
    process.exit(0);
  } catch (error: any) {
    console.error(`[Seeding Error]: ${error.message}`);
    process.exit(1);
  }
};

// Execute if run directly
if (require.main === module) {
  seedDatabase();
}

