import { prisma } from "../config/prisma.js";
import { sendReminderEmail } from "../utils/mailer.js";

export const createOrder = async (req, res) => {
  try {
    const { cartItems, shippingAddress, vendorId, couponCode, paymentMethod } = req.body;
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
    console.log("Payment method:", paymentMethod);
    console.log("Request body:", JSON.stringify(req.body, null, 2));

    // Validate payment method - must match Prisma enum exactly
    const validPaymentMethods = ['momo', 'vnpay', 'zalopay', 'cod'];
    let finalPaymentMethod = null;
    
    if (paymentMethod && typeof paymentMethod === 'string') {
      const normalizedMethod = paymentMethod.toLowerCase().trim();
      if (validPaymentMethods.includes(normalizedMethod)) {
        finalPaymentMethod = normalizedMethod;
      } else {
        console.warn("⚠️ Invalid payment method:", paymentMethod, "- setting to null");
        finalPaymentMethod = null; // Set to null if invalid (schema allows null)
      }
    } else {
      console.warn("⚠️ No payment method provided - setting to null");
      finalPaymentMethod = null; // Set to null if missing (schema allows null)
    }

    console.log("Final payment method:", finalPaymentMethod, "Original:", paymentMethod);

    const result = await prisma.$transaction(async (tx) => {
      // Group cart items by vendor_id
      const itemsByVendor = new Map();

      // First, fetch all products to get vendor_id
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

        // Group by vendor_id
        const vendorId = product.vendor_id;
        if (!itemsByVendor.has(vendorId)) {
          itemsByVendor.set(vendorId, []);
        }

        itemsByVendor.get(vendorId).push({
          product_id: product.product_id,
          quantity: quantity,
          price: product.price,
          product: product,
        });

        // Update stock
        await tx.products.update({
          where: { product_id: product.product_id },
          data: { stock: { decrement: quantity } },
        });
      }

      // Create separate order for each vendor
      const createdOrders = [];

      for (const [vendorId, vendorItems] of itemsByVendor.entries()) {
        // Calculate totals for this vendor's items
        let vendorSubtotal = 0;
        const orderItemsData = [];

        for (const item of vendorItems) {
          const itemTotal = item.price * item.quantity;
          vendorSubtotal += itemTotal;
          orderItemsData.push({
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price,
          });
        }

        // Apply coupon discount if provided (only for vendor-specific coupons)
        let discountAmount = 0;
        let appliedCoupon = null;
        
        if (couponCode) {
          const coupon = await tx.coupons.findUnique({
            where: { code: couponCode.toUpperCase() },
          });

          if (coupon) {
            // Check if coupon applies to this vendor (vendor_id is null for admin coupons, or matches vendor_id)
            const couponApplies = coupon.vendor_id === null || coupon.vendor_id === vendorId;
            
            if (couponApplies) {
              const now = new Date();
              const isValidDate = (!coupon.start_date || new Date(coupon.start_date) <= now) &&
                                  (!coupon.end_date || new Date(coupon.end_date) >= now);
              
              if (isValidDate) {
                if (coupon.discount_percent) {
                  discountAmount = (vendorSubtotal * coupon.discount_percent) / 100;
                } else if (coupon.discount_amount) {
                  discountAmount = coupon.discount_amount;
                }
                appliedCoupon = coupon;
              }
            }
          }
        }

        const subtotalAfterDiscount = Math.max(0, vendorSubtotal - discountAmount);
        const tax = subtotalAfterDiscount * 0.1;
        const shipping = subtotalAfterDiscount > 100000 ? 0 : 30000;
        const total = subtotalAfterDiscount + tax + shipping;

        // Create order for this vendor
        // Ensure payment_method is either a valid enum value or null
        const orderData = {
          user_id,
          vendor_id: vendorId,
          subtotal: subtotalAfterDiscount,
          tax,
          shipping,
          total,
          shipping_address: shippingAddress || null,
          status: "pending",
        };
        
        // Only include payment_method if it's valid, otherwise set to null
        if (finalPaymentMethod && ['momo', 'vnpay', 'zalopay', 'cod'].includes(finalPaymentMethod)) {
          orderData.payment_method = finalPaymentMethod;
        } else {
          orderData.payment_method = null; // Schema allows null
        }
        
        console.log("📦 Creating order for vendor_id:", vendorId, "payment_method:", orderData.payment_method);
        
        const order = await tx.orders.create({
          data: orderData,
        });

        // Create order items
        await tx.order_items.createMany({
          data: orderItemsData.map((item) => ({
            order_id: order.order_id,
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price,
          })),
        });

        // Record coupon usage if applied
        if (appliedCoupon) {
          await tx.coupon_usages.create({
            data: {
              coupon_id: appliedCoupon.coupon_id,
              order_id: order.order_id,
            },
          });
        }

        createdOrders.push(order);
      }

      // Return the first order (for backward compatibility with frontend)
      // Frontend can be updated later to handle multiple orders
      return createdOrders;
    });

    // Fetch all order details for response and email notifications
    const ordersWithDetails = await Promise.all(
      result.map(order => 
        prisma.orders.findUnique({
          where: { order_id: order.order_id },
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
                        vendor_id: true,
                        store_name: true,
                      }
                    }
                  },
                },
              },
            },
            users: true, // Include customer info
          },
        })
      )
    );

    console.log("Orders created successfully:", ordersWithDetails.map(o => o.order_id));
    
    // Get customer info once (same for all orders)
    const customer = await prisma.users.findUnique({
      where: { user_id },
      include: {
        notification_preferences: true
      }
    });

    // Send email notification to customer (order confirmation)
    if (customer && customer.email) {
      try {
        // Check customer notification preferences
        const customerShouldReceiveEmail = !customer.notification_preferences || 
          customer.notification_preferences.account_activity_alerts !== false;

        if (customerShouldReceiveEmail) {
          // Group orders by vendor for better email formatting
          const ordersByVendor = {};
          ordersWithDetails.forEach(order => {
            const vendorName = order.order_items[0]?.products?.vendors?.store_name || 'Nhà cung cấp';
            if (!ordersByVendor[vendorName]) {
              ordersByVendor[vendorName] = [];
            }
            ordersByVendor[vendorName].push(order);
          });

          let orderSummaryHtml = '';
          let totalAmount = 0;

          for (const [vendorName, vendorOrders] of Object.entries(ordersByVendor)) {
            vendorOrders.forEach(order => {
              totalAmount += Number(order.total);
              const orderTotal = new Intl.NumberFormat('vi-VN', { 
                style: 'currency', 
                currency: 'VND' 
              }).format(Number(order.total));
              
              const orderItemsList = order.order_items.map(item => {
                const itemTotal = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(item.price) * item.quantity);
                return `<li style="margin: 8px 0; padding: 8px; background: #f9fafb; border-radius: 4px;">
                  <strong>${item.products.name}</strong> x${item.quantity} - ${itemTotal}
                </li>`;
              }).join('');

              orderSummaryHtml += `
                <div style="margin-bottom: 20px; padding: 15px; background: #f3f4f6; border-radius: 8px;">
                  <h3 style="color: #4CAF50; margin-top: 0;">Đơn hàng #${order.order_id} từ ${vendorName}</h3>
                  <p><strong>Ngày đặt:</strong> ${new Date(order.created_at).toLocaleDateString('vi-VN')}</p>
                  <p><strong>Tổng tiền:</strong> ${orderTotal}</p>
                  <p><strong>Phương thức thanh toán:</strong> ${order.payment_method?.toUpperCase() || 'Không rõ'}</p>
                  <p><strong>Địa chỉ giao hàng:</strong> ${order.shipping_address || 'Chưa cung cấp'}</p>
                  <p><strong>Trạng thái:</strong> ${order.status === 'pending' ? 'Chờ xử lý' : order.status}</p>
                  <h4 style="margin-top: 15px; margin-bottom: 10px;">Sản phẩm:</h4>
                  <ul style="list-style-type: none; padding: 0; margin: 0;">
                    ${orderItemsList}
                  </ul>
                </div>
              `;
            });
          }

          const grandTotal = new Intl.NumberFormat('vi-VN', { 
            style: 'currency', 
            currency: 'VND' 
          }).format(totalAmount);

          const customerName = customer.full_name || customer.email;
          const emailSubject = `✅ Đơn hàng của bạn đã được đặt thành công - PetCare+`;
          const emailHtml = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
              <div style="background-color: #10B981; color: white; padding: 20px; text-align: center;">
                <h2>🎉 Đặt hàng thành công!</h2>
              </div>
              <div style="padding: 20px;">
                <p>Xin chào <b>${customerName}</b>,</p>
                <p>Cảm ơn bạn đã đặt hàng tại PetCare+! Đơn hàng của bạn đã được tiếp nhận và đang được xử lý.</p>
                
                <div style="background: #F0FDF4; border-left: 4px solid #10B981; padding: 15px; margin: 20px 0;">
                  <p style="margin: 0;"><strong>Tổng số đơn hàng:</strong> ${ordersWithDetails.length}</p>
                  <p style="margin: 5px 0 0 0;"><strong>Tổng tiền:</strong> ${grandTotal}</p>
                </div>

                <h3 style="color: #4CAF50; margin-top: 30px;">Chi tiết đơn hàng:</h3>
                ${orderSummaryHtml}
                
                <p style="margin-top: 30px;">Bạn có thể theo dõi trạng thái đơn hàng tại:</p>
                <p style="text-align: center; margin-top: 20px;">
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:9000'}/orders" style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Xem đơn hàng của tôi</a>
                </p>
                
                <p style="margin-top: 30px; color: #6B7280; font-size: 14px;">
                  Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua email hoặc hotline.
                </p>
                <p>Cảm ơn bạn đã tin tưởng PetCare+!</p>
              </div>
              <div style="background-color: #f4f4f4; color: #888; padding: 15px; text-align: center; font-size: 0.8em;">
                <p>&copy; 2025 PetCare+. All rights reserved.</p>
              </div>
            </div>
          `;

          await sendReminderEmail(customer.email, emailSubject, emailHtml);
          console.log(`✅ Order confirmation email sent to customer: ${customer.email}`);
        } else {
          console.log(`ℹ️ Customer email notification disabled for user_id: ${user_id} (account_activity_alerts: ${customer.notification_preferences?.account_activity_alerts})`);
        }
      } catch (customerEmailError) {
        // Don't fail the order creation if customer email fails
        console.error(`⚠️ Failed to send order confirmation email to customer (non-critical):`, customerEmailError);
      }
    }

    // Send email notification to each vendor for their orders
    for (const orderWithDetails of ordersWithDetails) {
      try {
        const vendor = await prisma.vendors.findUnique({
          where: { vendor_id: orderWithDetails.vendor_id },
          include: { users: true }
        });

        if (vendor && vendor.users && vendor.users.email) {
          // Check notification preferences (if exists)
          // FIX: Use vendor.users.user_id instead of vendor.user_id
          const notificationPrefs = await prisma.notification_preferences.findUnique({
            where: { user_id: vendor.users.user_id }
          });

          console.log("🔍 Email notification check:", {
            vendor_id: vendor.vendor_id,
            user_id: vendor.users.user_id,
            email: vendor.users.email,
            hasPrefs: !!notificationPrefs,
            new_products_services: notificationPrefs?.new_products_services
          });

          // Send email if preferences allow or if no preferences exist (default: send)
          // new_products_services = true means send email, false means don't send
          const shouldSendEmail = !notificationPrefs || notificationPrefs.new_products_services === true;

          if (shouldSendEmail) {
            const orderTotal = new Intl.NumberFormat('vi-VN', { 
              style: 'currency', 
              currency: 'VND' 
            }).format(Number(orderWithDetails.total));
            
            const orderItemsList = orderWithDetails.order_items.map(item => 
              `<li style="margin: 5px 0;">${item.products.name} x${item.quantity} - ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(item.price) * item.quantity)}</li>`
            ).join('');

            const customerName = orderWithDetails.users?.full_name || orderWithDetails.users?.email || 'Khách hàng';
            const emailSubject = `🎉 Đơn hàng mới #${orderWithDetails.order_id} từ PetCare+!`;
            const emailHtml = `
              <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center;">
                  <h2>Đơn hàng mới từ PetCare+!</h2>
                </div>
                <div style="padding: 20px;">
                  <p>Xin chào,</p>
                  <p>Bạn có một đơn hàng mới từ <b>${customerName}</b>.</p>
                  <p><b>Mã đơn hàng:</b> #${orderWithDetails.order_id}</p>
                  <p><b>Ngày đặt:</b> ${new Date(orderWithDetails.created_at).toLocaleDateString('vi-VN')}</p>
                  <p><b>Tổng tiền:</b> ${orderTotal}</p>
                  <p><b>Địa chỉ giao hàng:</b> ${orderWithDetails.shipping_address || 'Không cung cấp'}</p>
                  <p><b>Phương thức thanh toán:</b> ${orderWithDetails.payment_method?.toUpperCase() || 'Không rõ'}</p>
                  
                  <h3>Chi tiết sản phẩm:</h3>
                  <ul style="list-style-type: none; padding: 0;">
                    ${orderItemsList}
                  </ul>
                  
                  <p>Vui lòng kiểm tra bảng điều khiển của bạn để xử lý đơn hàng này.</p>
                  <p style="text-align: center; margin-top: 30px;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:9000'}/vendor/orders" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Xem đơn hàng</a>
                  </p>
                  <p>Cảm ơn bạn đã sử dụng PetCare+!</p>
                </div>
                <div style="background-color: #f4f4f4; color: #888; padding: 15px; text-align: center; font-size: 0.8em;">
                  <p>&copy; 2025 PetCare+. All rights reserved.</p>
                </div>
              </div>
            `;

            await sendReminderEmail(vendor.users.email, emailSubject, emailHtml);
            console.log(`✅ Order notification email sent to vendor: ${vendor.users.email} for order #${orderWithDetails.order_id}`);
          } else {
            console.log(`ℹ️ Email notification disabled for vendor user_id: ${vendor.users.user_id} (new_products_services: ${notificationPrefs?.new_products_services})`);
          }
        } else {
          console.warn(`⚠️ Vendor or user email not found for vendor_id: ${orderWithDetails.vendor_id}`);
        }
      } catch (emailError) {
        // Don't fail the order creation if email fails
        console.error(`⚠️ Failed to send order notification email for order #${orderWithDetails.order_id} (non-critical):`, emailError);
      }
    }
    
    // Return first order for backward compatibility
    res.status(201).json(ordersWithDetails[0]);
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

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.user_id;

    const order = await prisma.orders.findFirst({
      where: {
        order_id: parseInt(id),
        user_id: user_id, // Ensure user can only access their own orders
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
        vendors: {
          select: {
            store_name: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (err) {
    console.error("Error fetching order by ID:", err);
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

    const validStatuses = ["pending", "paid", "shipped", "delivered", "cancelled", "refunded"];

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

// Mark order as received by customer
export const markOrderAsReceived = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.user_id;

    // Verify that the order belongs to this customer
    const order = await prisma.orders.findUnique({
      where: { order_id: parseInt(id) },
      include: {
        users: {
          select: { user_id: true }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user_id !== user_id) {
      return res.status(403).json({ message: "You can only mark your own orders as received" });
    }

    // Only allow marking as received if order is shipped
    if (order.status !== "shipped") {
      return res.status(400).json({ 
        message: `Cannot mark order as received. Current status: ${order.status}. Order must be shipped first.` 
      });
    }

    // Update order status to delivered and update timestamp
    const updatedOrder = await prisma.orders.update({
      where: { order_id: parseInt(id) },
      data: { 
        status: "delivered",
        updated_at: new Date() // Ensure updated_at is set to current time
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
        vendors: {
          select: {
            store_name: true,
            address: true,
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
    });

    console.log(`[MARK AS RECEIVED] Order #${id} marked as delivered by user ${user_id}`);
    res.json({ message: "Order marked as received successfully", order: updatedOrder });
  } catch (err) {
    console.error("[MARK AS RECEIVED] Error:", err);
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    console.log(`[CANCEL ORDER] Request to cancel order ${id} by user ${user_id}`);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Find the order and verify ownership
      const order = await tx.orders.findUnique({
        where: { order_id: parseInt(id) },
        include: { order_items: true },
      });

      if (!order) {
        throw new Error("Order not found");
      }

      if (order.user_id !== user_id) {
        throw new Error("Unauthorized to cancel this order");
      }

      if (order.status !== "pending") {
        throw new Error("Only pending orders can be cancelled");
      }

      // 2. Restore stock for each item
      for (const item of order.order_items) {
        await tx.products.update({
          where: { product_id: item.product_id },
          data: { stock: { increment: item.quantity } },
        });
      }

      // 3. Update order status
      const updatedOrder = await tx.orders.update({
        where: { order_id: parseInt(id) },
        data: { status: "cancelled" },
      });

      return updatedOrder;
    });

    console.log(`[CANCEL ORDER] Order ${id} cancelled successfully`);
    res.json(result);
  } catch (err) {
    console.error("[CANCEL ORDER] Error:", err);
    if (err.message === "Order not found" || err.message === "Unauthorized to cancel this order" || err.message === "Only pending orders can be cancelled") {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: "Server error: " + err.message });
  }
};
