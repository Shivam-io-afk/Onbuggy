# Onbuggy REST API Documentation

> Complete API reference for the Onbuggy Hyperlocal Essentials Delivery Platform.  
> **Base URL**: `http://localhost:5000/api` (Development) or `/api` (Production reverse proxy)

---

## 🔒 Authentication & Headers

Protected routes require a JSON Web Token (JWT) provided in the `Authorization` header:

```http
Authorization: Bearer <your_jwt_token_here>
Content-Type: application/json
```

All responses conform to the following JSON structure:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

---

## 1. Authentication Endpoints (`/api/auth`)

### 1.1 Register User
Creates a new customer or vendor account.

* **Method**: `POST`
* **Endpoint**: `/api/auth/register`
* **Access**: Public

**Request Body**:
```json
{
  "name": "Khan Singh",
  "email": "user@onbuggy.com",
  "password": "Password123!",
  "phone": "9102234950",
  "address": {
    "street": "12-B Green Park Road",
    "area": "Civil Lines",
    "city": "Rewa",
    "state": "Madhya Pradesh",
    "pincode": "486001"
  }
}
```

**Response (`201 Created`)**:
```json
{
  "success": true,
  "message": "Account registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "67b43a9b1c2e4f0012a9b3c1",
    "name": "Khan Singh",
    "email": "user@onbuggy.com",
    "phone": "9102234950",
    "role": "customer",
    "avatar": "resorces/other/useravatar.png",
    "address": { ... }
  }
}
```

---

### 1.2 Login User
Authenticates user credentials and issues a JWT token.

* **Method**: `POST`
* **Endpoint**: `/api/auth/login`
* **Access**: Public

**Request Body**:
```json
{
  "email": "user@onbuggy.com",
  "password": "Password123!"
}
```

**Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "Logged in successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

---

### 1.3 Get Current User (`/me`)
Retrieves profile and order stats for the authenticated session.

* **Method**: `GET`
* **Endpoint**: `/api/auth/me`
* **Access**: Private (Bearer Token required)

**Response (`200 OK`)**:
```json
{
  "success": true,
  "user": {
    "id": "67b43a9b1c2e4f0012a9b3c1",
    "name": "Khan Singh",
    "email": "user@onbuggy.com",
    "phone": "9102234950",
    "role": "customer",
    "avatar": "resorces/other/useravatar.png",
    "address": { ... },
    "createdAt": "2026-10-19T08:58:48.000Z"
  },
  "stats": {
    "totalOrders": 3
  }
}
```

---

### 1.4 Update User Profile
Updates contact information and delivery address.

* **Method**: `PUT`
* **Endpoint**: `/api/auth/profile`
* **Access**: Private (Bearer Token required)

**Request Body**:
```json
{
  "name": "Khan Singh Parihar",
  "phone": "9102234950",
  "address": {
    "street": "House 45, Kothi Road",
    "city": "Rewa",
    "state": "Madhya Pradesh",
    "pincode": "486001"
  }
}
```

---

## 2. Store & Shop Endpoints (`/api/shops`)

### 2.1 Get All Stores
Lists registered vendor stores with search, category filtering, and sorting.

* **Method**: `GET`
* **Endpoint**: `/api/shops`
* **Access**: Public
* **Query Parameters**:
  * `category` (`medicine` | `grocery` | `vegetable` | `all`)
  * `search` (Search query for name, description, or category label)
  * `sortBy` (`relevance` | `time` | `rating` | `near`)
  * `isOpen` (`true` | `false`)

**Example Request**:
```http
GET /api/shops?category=medicine&sortBy=rating
```

**Response (`200 OK`)**:
```json
{
  "success": true,
  "count": 4,
  "data": [
    {
      "_id": "67b43a9b1c2e4f0012a9b3c3",
      "name": "Kamal Medical Store",
      "category": "medicine",
      "categoryLabel": "Medicine & Health Care Products • Medical Shop",
      "rating": 4.8,
      "reviewCount": 342,
      "deliveryTimeMin": 23,
      "distanceKm": 1.2,
      "isOpen": true,
      "description": "All kinds of medicine, health devices & drugs are available...",
      "image": "resorces/other/frontImage/8626119.png",
      "address": "Near Old Bus Stand, Civil Lines, Rewa",
      "phone": "+91 9826112233"
    }
  ]
}
```

---

### 2.2 Get Single Store by ID
Retrieves store details along with its full product catalog.

* **Method**: `GET`
* **Endpoint**: `/api/shops/:id`
* **Access**: Public

**Response (`200 OK`)**:
```json
{
  "success": true,
  "data": { ... },
  "products": [
    {
      "_id": "67b43a9b1c2e4f0012a9b3cf",
      "name": "Dolo 650mg Paracetamol",
      "category": "medicine",
      "price": 65,
      "originalPrice": 85,
      "unit": "strip",
      "image": "resorces/medicines/1.png",
      "inStock": true
    }
  ]
}
```

---

## 3. Orders & Tracking Endpoints (`/api/orders`)

### 3.1 Upload Prescription / Slip Image
Uploads an image file to the server storage directory before creating an order.

* **Method**: `POST`
* **Endpoint**: `/api/orders/upload-prescription`
* **Access**: Public
* **Content-Type**: `multipart/form-data`
* **Form Field**: `prescription` (File: `.jpg`, `.jpeg`, `.png`, `.webp`, Max 5MB)

**Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "Prescription uploaded successfully",
  "imageUrl": "/uploads/prescription-1739955528-984123456.png",
  "fileName": "my-prescription.png",
  "fileSize": 412030
}
```

---

### 3.2 Place New Order
Calculates subtotal, delivery charges, donation fees, and applies coupon codes.

* **Method**: `POST`
* **Endpoint**: `/api/orders`
* **Access**: Public (Optional Auth: binds to user if logged in)

**Request Body**:
```json
{
  "shopId": "67b43a9b1c2e4f0012a9b3c3",
  "shopName": "Kamal Medical Store",
  "deliveryAddress": "12-B Green Park Road, Civil Lines, Rewa",
  "prescriptionImageUrl": "/uploads/prescription-1739955528-984123456.png",
  "subtotal": 350,
  "couponCode": "FIRSTTIME",
  "paymentMethod": "Pay-on-Delivery (COD)",
  "walletProvider": "",
  "userName": "Khan Singh",
  "userPhone": "9102234950",
  "items": [
    {
      "name": "Prescription Order Bundle",
      "price": 350,
      "quantity": 1,
      "unit": "package"
    }
  ]
}
```

**Response (`201 Created`)**:
```json
{
  "success": true,
  "message": "Order placed successfully!",
  "data": {
    "_id": "67b43a9b1c2e4f0012a9b3d9",
    "orderNumber": "OB-8492",
    "userName": "Khan Singh",
    "userPhone": "9102234950",
    "shopName": "Kamal Medical Store",
    "deliveryAddress": "12-B Green Park Road, Civil Lines, Rewa",
    "subtotal": 350,
    "deliveryFee": 30,
    "donationGstFee": 25,
    "couponCode": "FIRSTTIME",
    "discount": 150,
    "grandTotal": 255,
    "paymentMethod": "Pay-on-Delivery (COD)",
    "status": "Order Placed",
    "deliveryPersonnel": "Anil Kumar (Delivery Partner)",
    "statusHistory": [
      {
        "status": "Order Placed",
        "timestamp": "2026-10-19T09:05:00.000Z",
        "note": "Your order has been received by Onbuggy."
      }
    ],
    "estimatedDeliveryTimeMinutes": 25
  }
}
```

---

### 3.3 Get My Orders
Lists all orders for the current user or by customer email/phone.

* **Method**: `GET`
* **Endpoint**: `/api/orders/my-orders`
* **Access**: Public / Private

---

### 3.4 Advance Order Status (Simulator)
Advances the order through the 4 delivery stages for testing and demonstration.

* **Method**: `PATCH`
* **Endpoint**: `/api/orders/:id/advance-status`
* **Access**: Public

**Lifecycle Transitions**:
$$\text{Order Placed} \longrightarrow \text{Processing} \longrightarrow \text{Out for Delivery} \longrightarrow \text{Delivered}$$

---

### 3.5 Cancel Order
Cancels an order if it has not yet reached the `Delivered` state.

* **Method**: `PATCH`
* **Endpoint**: `/api/orders/:id/cancel`
* **Access**: Public

---

## 4. Contact & Inquiries (`/api/contact`)

### 4.1 Submit Inquiry Message
Saves customer inquiries or vendor registration queries.

* **Method**: `POST`
* **Endpoint**: `/api/contact`
* **Access**: Public

**Request Body**:
```json
{
  "name": "Anand Sharma",
  "email": "anand@example.com",
  "topic": "Business Related",
  "message": "I own a medical store in Rewa and want to onboard as a vendor on Onbuggy."
}
```

---

## 5. Health Check (`/api/health`)

* **Method**: `GET`
* **Endpoint**: `/api/health`
* **Response (`200 OK`)**:
```json
{
  "status": "OK",
  "message": "Onbuggy Delivery API is running smoothly",
  "timestamp": "2026-10-19T09:06:00.000Z"
}
```

---

## 6. Admin & Management Endpoints (`/api/admin`)

> **Authorization Required**: `Bearer <token>` with `role: "admin"`.

### 6.1 Get Executive Platform Stats
Returns gross GMV, order volume, live in-flight orders, store availability, and user distribution.
* **Method**: `GET`
* **Endpoint**: `/api/admin/stats`

### 6.2 Get Admin Orders
Lists platform orders with optional query filters (`status`, `search`, `shopId`).
* **Method**: `GET`
* **Endpoint**: `/api/admin/orders`
* **Query Parameters**:
  * `status`: Filter by status (`Order Placed`, `Processing`, etc.)
  * `search`: Search order number, customer name, or shop name

### 6.3 Update Order Status & Assign Delivery Partner
* **Method**: `PATCH`
* **Endpoint**: `/api/admin/orders/:id/status`
* **Request Body**:
```json
{
  "status": "Processing",
  "deliveryPersonnel": "Sunil Verma",
  "isPaid": false
}
```

### 6.4 Get & Toggle Store Availability
* **Method**: `GET` `/api/admin/shops` — Lists all merchant stores.
* **Method**: `PATCH` `/api/admin/shops/:id/toggle-status` — Toggles store `isOpen` boolean state.

### 6.5 Get Users & Update User Role
* **Method**: `GET` `/api/admin/users` — Lists registered platform users.
* **Method**: `PATCH` `/api/admin/users/:id/role` — Modifies user role (`customer`, `delivery`, `shopkeeper`, `admin`).

---

## 7. Delivery Partner & Rider Endpoints (`/api/delivery`)

> **Authorization Required**: `Bearer <token>` with `role: "delivery"` or `"admin"`.

### 7.1 Get Rider Dashboard Stats
Returns trips assigned, completed runs, cash on delivery (COD) cash in hand, and earned trip payouts.
* **Method**: `GET`
* **Endpoint**: `/api/delivery/stats`

### 7.2 Get Assigned & Active Dispatches
Lists orders ready for merchant pickup or in transit to customer doorstep.
* **Method**: `GET`
* **Endpoint**: `/api/delivery/orders`
* **Query Parameters**:
  * `filter`: `active` (Processing / Out for Delivery) or `delivered`

### 7.3 Advance Dispatch Status (Pickup / Handover)
* **Method**: `PATCH`
* **Endpoint**: `/api/delivery/orders/:id/status`
* **Request Body**:
```json
{
  "status": "Out for Delivery",
  "note": "Package picked up from Green Valley Farm Fresh"
}
```
* Or when completing delivery:
```json
{
  "status": "Delivered",
  "note": "Handed over to customer at doorstep. COD cash collected."
}
```
*(Automatically sets `order.isPaid = true` upon delivery handover).*

### 7.4 Broadcast Real-Time GPS Location
* **Method**: `PATCH`
* **Endpoint**: `/api/delivery/orders/:id/location`
* **Request Body**:
```json
{
  "lat": 24.5388,
  "lng": 81.3002,
  "speed": 28,
  "heading": 305,
  "statusText": "Rider en route near Sirmour Chauraha (1.1 km to destination)",
  "batteryLevel": 86
}
```

### 7.5 Simulate Route Transit Step
Simulates the rider's motion along the polyline path between store and customer.
* **Method**: `POST`
* **Endpoint**: `/api/delivery/orders/:id/simulate-step`
* **Access**: Public / Private

---

## 8. Merchant & Vendor Operations (`/api/merchant`)

> **Authorization Required**: `Bearer <token>` with `role: "shopkeeper"` or `"admin"`.

### 8.1 Get Store Performance Metrics
Returns today's store sales GMV, active incoming orders, completed orders, and product count.
* **Method**: `GET`
* **Endpoint**: `/api/merchant/stats`

### 8.2 Get Store Orders & Live Rider Locations
Returns incoming customer orders for this store with live rider coordinates (`deliveryLocation`), customer contact, and delivery address.
* **Method**: `GET`
* **Endpoint**: `/api/merchant/orders`
* **Query Parameters**:
  * `status`: Optional filter (`Order Placed`, `Processing`, etc.)

### 8.3 Accept & Prepare Order
* **Method**: `PATCH`
* **Endpoint**: `/api/merchant/orders/:id/status`
* **Request Body**:
```json
{
  "status": "Processing",
  "note": "Store accepted order and began packaging"
}
```

### 8.4 Store Catalog & Inventory
* **Method**: `GET` `/api/merchant/products` — Lists all products belonging to this merchant store.
* **Method**: `PATCH` `/api/merchant/products/:id/toggle-stock` — Live toggle item between In-Stock and Out-of-Stock.

### 8.5 Toggle Store Open / Closed Status
* **Method**: `PATCH` `/api/merchant/store/toggle-status` — Instantly toggles the merchant's store availability online/offline.

---

## 9. Real-Time WebSockets Architecture (`ws://localhost:5000`)

Onbuggy uses Socket.IO (v4) for real-time bi-directional events across all 4 stakeholder roles without requiring polling.

### 9.1 Rooms & Channels

| Room Pattern | Audience | Purpose |
|:---|:---|:---|
| `order:{orderId}` | Customer, Merchant, Rider | Real-time GPS movement, status transitions, ETA updates for this specific order |
| `role:admin` | Platform Admin | Live platform-wide feed of new orders, dispatch events, rider movements, and GMV revenue updates |
| `role:merchant` / `merchant:{shopName}` | Merchant Store Partner | Instant alerts when a customer places an order for their store, rider approach tracking |
| `role:delivery` | Fleet Riders | Dispatch queue broadcast whenever a new order is placed and ready for pickup |

### 9.2 Client ➔ Server Socket Events

| Event Name | Payload | Handler / Action |
|:---|:---|:---|
| `join:order` | `orderId: string` | Joins the room `order:{orderId}` to receive live tracking and status updates. |
| `leave:order` | `orderId: string` | Leaves room `order:{orderId}` when leaving the tracking page. |
| `join:role` | `{ role: 'admin' \| 'delivery' \| 'shopkeeper', identifier?: string }` | Joins role-specific rooms for instant dispatch/order notifications. |
| `rider:location_broadcast` | `{ orderId, lat, lng, speed, heading, batteryLevel, statusText }` | Rider device transmits live GPS coordinates to customer, merchant, and admin. |

### 9.3 Server ➔ Client Socket Events

| Event Name | Rooms Broadcast To | Payload | Client Action |
|:---|:---|:---|:---|
| `order:new` | `role:admin` | `{ order: Order }` | Increments total orders, updates GMV revenue counter, displays alert banner. |
| `merchant:new_order` | `merchant:{shopName}`, `role:merchant` | `{ order: Order }` | Prepends order to merchant incoming queue, plays sound / displays alert badge. |
| `order:new_dispatch` | `role:delivery` | `{ order: Order }` | Adds order to dispatch queue for riders awaiting pickup. |
| `order:status_updated` | `order:{id}`, `role:admin`, `role:merchant`, `role:delivery` | `{ order: Order }` | Updates order state in real time (Order Placed ➔ Processing ➔ Out for Delivery ➔ Delivered). |
| `delivery:location_updated` | `order:{id}`, `role:admin`, `role:merchant` | `{ orderId, deliveryLocation }` | Smoothly moves pulsing bike marker on Leaflet map along polyline path. |
| `shop:status_toggled` | Global / All | `{ shop: Shop }` | Updates store open/closed chip in real time on homepage and checkout store dropdown. |
| `product:stock_toggled` | Global / All | `{ product: Product }` | Updates in-stock / out-of-stock badge on merchant catalog and store menus. |




