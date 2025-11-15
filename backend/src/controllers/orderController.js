import { prisma } from "../config/prisma.js";

export const createOrder = async (req, res) => {
  try {
    const { cartItems, shippingAddress, vendorId } = req.body;
    const user_id = req.user.user_id;

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ message: "Cart items are required" });
    }

    if (!shippingAddress || !shippingAddress.trim()) {
      return res.status(400).json({ message: "Shipping address is required" });
    }

    console.log("Creating order for user:", user_id);
    console.log("Cart items received:", JSON.stringify(cartItems, null, 2));
    console.log("Shipping address:", shippingAddress);
    console.log("Request body:", JSON.stringify(req.body, null, 2));

    const result = await prisma.$transaction(async (tx) => {
      let subtotal = 0;
      const orderItemsData = [];

      for (const item of cartItems) {
        // Validate item structure
        if (!item.productId || item.quantity === undefined || item.quantity <= 0) {
          throw new Error(`Invalid cart item: missing productId or invalid quantity`);
        }

        const productId = parseInt(item.productId);
        const quantity = parseInt(item.quantity);

        if (isNaN(productId) || isNaN(quantity)) {
          throw new Error(`Invalid productId or quantity format`);
        }

        const product = await tx.products.findUnique({
          where: { product_id: productId },
        });

        if (!product) {
          throw new Error(`Product ${productId} not found`);
        }

        if (product.stock < quantity) {
          throw new Error(`Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${quantity}`);
        }

        const itemTotal = product.price * quantity;
        subtotal += itemTotal;

        orderItemsData.push({
          product_id: product.product_id,
          quantity: quantity,
          price: product.price,
        });

        await tx.products.update({
          where: { product_id: product.product_id },
          data: { stock: { decrement: quantity } },
        });
      }

      const tax = subtotal * 0.1;
      const shipping = subtotal > 100000 ? 0 : 30000;
      const total = subtotal + tax + shipping;

      const firstProduct = await tx.products.findUnique({
        where: { product_id: parseInt(cartItems[0].productId) },
      });

      const order = await tx.orders.create({
        data: {
          user_id,
          vendor_id: firstProduct.vendor_id,
          subtotal,
          tax,
          shipping,
          total,
          shipping_address: shippingAddress || null,
          status: "pending",
        },
      });

      await tx.order_items.createMany({
        data: orderItemsData.map((item) => ({
          order_id: order.order_id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
        })),
      });

      return order;
    });

    const orderWithDetails = await prisma.orders.findUnique({
      where: { order_id: result.order_id },
      include: {
        order_items: {
          include: {
            products: {
              include: {
                product_images: {
                  where: { is_thumbnail: true },
                },
              },
            },
          },
        },
      },
    });

    console.log("Order created successfully:", orderWithDetails.order_id);
    res.status(201).json(orderWithDetails);
  } catch (err) {
    console.error("Error creating order:", err);
    console.error("Error message:", err.message);
    console.error("Error code:", err.code);
    console.error("Error stack:", err.stack);
    
    // Check for Prisma errors
    if (err.code === "P2003") {
      return res.status(400).json({ message: "Invalid foreign key reference" });
    }
    if (err.code === "P2011") {
      return res.status(400).json({ message: "Null constraint violation: " + err.message });
    }
    if (err.code === "P2012") {
      return res.status(400).json({ message: "Missing required field: " + err.message });
    }
    
    if (err.message.includes("not found") || err.message.includes("Insufficient") || err.message.includes("Invalid")) {
      return res.status(400).json({ message: err.message });
    }
    
    // Check if it's a database column error
    if (err.message.includes("Unknown column") || err.message.includes("shipping_address")) {
      return res.status(500).json({ 
        message: "Database schema error: shipping_address column missing. Please run the migration SQL.",
        error: err.message 
      });
    }
    
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

export const getCustomerOrders = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    console.log("[CUSTOMER ORDERS] Fetching orders for user_id:", user_id);

    const orders = await prisma.orders.findMany({
      where: { user_id },
      include: {
        order_items: {
          include: {
            products: {
              include: {
                product_images: {
                  where: { is_thumbnail: true },
                },
                vendors: {
                  select: {
                    store_name: true,
                  },
                },
              },
            },
          },
        },
        vendors: {
          select: {
            store_name: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    console.log("[CUSTOMER ORDERS] Found", orders.length, "orders");
    res.json(orders);
  } catch (err) {
    console.error("Error fetching customer orders:", err);
    console.error("Error stack:", err.stack);
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

export const getVendorOrders = async (req, res) => {
  try {
    console.log("[VENDOR ORDERS] Request received");
    console.log("[VENDOR ORDERS] req.vendor:", req.vendor);
    console.log("[VENDOR ORDERS] req.user:", req.user);

    if (!req.vendor || !req.vendor.vendor_id) {
      console.log("[VENDOR ORDERS] No vendor found in request");
      return res.status(403).json({ message: "Vendor access required" });
    }

    const vendor_id = req.vendor.vendor_id;
    console.log("[VENDOR ORDERS] Fetching orders for vendor_id:", vendor_id);

    if (!vendor_id || isNaN(vendor_id)) {
      console.error("[VENDOR ORDERS] Invalid vendor_id:", vendor_id);
      return res.status(400).json({ message: "Invalid vendor ID" });
    }

    // Get all order_items that belong to products from this vendor
    console.log("[VENDOR ORDERS] Step 1: Finding order_items...");
    const orderItems = await prisma.order_items.findMany({
      where: {
        products: {
          vendor_id: parseInt(vendor_id),
        },
      },
      select: {
        order_id: true,
      },
    });

    console.log("[VENDOR ORDERS] Found", orderItems.length, "order_items");

    // Get unique order IDs
    const orderIds = [...new Set(orderItems.map(item => item.order_id))];

    if (orderIds.length === 0) {
      console.log("[VENDOR ORDERS] No orders found for vendor");
      return res.json([]);
    }

    console.log("[VENDOR ORDERS] Found order IDs:", orderIds);

    // Fetch orders with all order_items, then filter in code
    console.log("[VENDOR ORDERS] Step 2: Fetching orders...");
    const orders = await prisma.orders.findMany({
      where: {
        order_id: {
          in: orderIds,
        },
      },
      include: {
        order_items: {
          include: {
            products: {
              include: {
                product_images: {
                  where: { is_thumbnail: true },
                },
                vendors: {
                  select: {
                    store_name: true,
                  },
                },
              },
            },
          },
        },
        users: {
          select: {
            user_id: true,
            full_name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    console.log("[VENDOR ORDERS] Fetched", orders.length, "orders");

    // Filter order_items to only include items from this vendor
    const filteredOrders = orders.map(order => ({
      ...order,
      order_items: order.order_items.filter(item => 
        item.products && item.products.vendor_id === parseInt(vendor_id)
      ),
    }));

    console.log("[VENDOR ORDERS] Returning", filteredOrders.length, "filtered orders");
    res.json(filteredOrders);
  } catch (err) {
    console.error("[VENDOR ORDERS] Error:", err);
    console.error("[VENDOR ORDERS] Error message:", err.message);
    console.error("[VENDOR ORDERS] Error code:", err.code);
    console.error("[VENDOR ORDERS] Error stack:", err.stack);
    if (err.meta) {
      console.error("[VENDOR ORDERS] Error meta:", JSON.stringify(err.meta, null, 2));
    }
    res.status(500).json({ 
      message: "Server error: " + err.message,
      code: err.code,
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    if (!req.vendor || !req.vendor.vendor_id) {
      return res.status(403).json({ message: "Vendor access required" });
    }

    const { id } = req.params;
    const { status } = req.body;
    const vendor_id = req.vendor.vendor_id;

    const validStatuses = ["pending", "paid", "shipped", "cancelled", "refunded"];

    if (!status || !validStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Check if order contains products from this vendor
    const orderItems = await prisma.order_items.findMany({
      where: {
        order_id: parseInt(id),
        products: {
          vendor_id: vendor_id,
        },
      },
    });

    if (orderItems.length === 0) {
      return res.status(404).json({ message: "Order not found or unauthorized" });
    }

    const updatedOrder = await prisma.orders.update({
      where: { order_id: parseInt(id) },
      data: { status: status.toLowerCase() },
      include: {
        order_items: {
          include: {
            products: true,
          },
        },
      },
    });

    res.json(updatedOrder);
  } catch (err) {
    console.error("Error updating order status:", err);
    console.error("Error stack:", err.stack);
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

