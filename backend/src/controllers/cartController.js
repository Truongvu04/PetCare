import { prisma } from "../config/prisma.js";
import { normalizeObjectEncoding } from "../utils/encodingHelper.js";

// Get or create cart for user
export const getCart = async (req, res) => {
  try {
    console.log("[CART] getCart called, user_id:", req.user?.user_id);
    const user_id = req.user.user_id;

    // Find existing cart or create new one
    let cart = await prisma.carts.findFirst({
      where: { user_id },
      include: {
        cart_items: {
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
                  },
                },
              },
            },
          },
          orderBy: { added_at: "desc" },
        },
      },
    });

    if (!cart) {
      // Create new cart if doesn't exist
      cart = await prisma.carts.create({
        data: { user_id },
        include: {
          cart_items: {
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
                    },
                  },
                },
              },
            },
            orderBy: { added_at: "desc" },
          },
        },
      });
    }

    // Debug: Log vendor_id from products
    if (cart && cart.cart_items && cart.cart_items.length > 0) {
      console.log("🔍 Cart items debug:", cart.cart_items.map(item => ({
        product_id: item.products?.product_id,
        product_name: item.products?.name,
        vendor_id_direct: item.products?.vendor_id,
        vendors_object: item.products?.vendors,
        vendors_vendor_id: item.products?.vendors?.vendor_id
      })));
    }
    
    const normalizedCart = normalizeObjectEncoding(cart);
    res.json(normalizedCart);
  } catch (err) {
    console.error("Error fetching cart:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Add item to cart
export const addToCart = async (req, res) => {
  try {
    console.log("[CART] addToCart called, user_id:", req.user?.user_id, "body:", req.body);
    const user_id = req.user.user_id;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    // Get or create cart
    let cart = await prisma.carts.findFirst({
      where: { user_id },
    });

    if (!cart) {
      cart = await prisma.carts.create({
        data: { user_id },
      });
    }

    // Check if product exists and get current price
    const product = await prisma.products.findUnique({
      where: { product_id: parseInt(productId) },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check stock
    if (product.stock < quantity) {
      return res.status(400).json({
        message: `Insufficient stock. Available: ${product.stock}, Requested: ${quantity}`,
      });
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cart_items.findFirst({
      where: {
        cart_id: cart.cart_id,
        product_id: parseInt(productId),
      },
    });

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + parseInt(quantity);
      
      if (product.stock < newQuantity) {
        return res.status(400).json({
          message: `Insufficient stock. Available: ${product.stock}, Requested: ${newQuantity}`,
        });
      }

      const updatedItem = await prisma.cart_items.update({
        where: { id: existingItem.id },
        data: {
          quantity: newQuantity,
          price: product.price, // Update price to current price
        },
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
                },
              },
            },
          },
        },
      });

      // Update cart updated_at
      await prisma.carts.update({
        where: { cart_id: cart.cart_id },
        data: { updated_at: new Date() },
      });

      const normalizedItem = normalizeObjectEncoding(updatedItem);
      return res.json(normalizedItem);
    } else {
      // Create new cart item
      const newItem = await prisma.cart_items.create({
        data: {
          cart_id: cart.cart_id,
          product_id: parseInt(productId),
          quantity: parseInt(quantity),
          price: product.price,
        },
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
                },
              },
            },
          },
        },
      });

      // Update cart updated_at
      await prisma.carts.update({
        where: { cart_id: cart.cart_id },
        data: { updated_at: new Date() },
      });

      const normalizedItem = normalizeObjectEncoding(newItem);
      return res.status(201).json(normalizedItem);
    }
  } catch (err) {
    console.error("Error adding to cart:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update cart item quantity
export const updateCartItem = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    // Find cart item and verify ownership
    const cartItem = await prisma.cart_items.findUnique({
      where: { id: parseInt(itemId) },
      include: {
        carts: true,
        products: true,
      },
    });

    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    if (cartItem.carts.user_id !== user_id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Check stock
    if (cartItem.products.stock < quantity) {
      return res.status(400).json({
        message: `Insufficient stock. Available: ${cartItem.products.stock}, Requested: ${quantity}`,
      });
    }

    // Update item
    const updatedItem = await prisma.cart_items.update({
      where: { id: parseInt(itemId) },
      data: {
        quantity: parseInt(quantity),
        price: cartItem.products.price, // Update to current price
      },
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
    });

    // Update cart updated_at
    await prisma.carts.update({
      where: { cart_id: cartItem.cart_id },
      data: { updated_at: new Date() },
    });

    const normalizedItem = normalizeObjectEncoding(updatedItem);
    res.json(normalizedItem);
  } catch (err) {
    console.error("Error updating cart item:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { itemId } = req.params;

    // Find cart item and verify ownership
    const cartItem = await prisma.cart_items.findUnique({
      where: { id: parseInt(itemId) },
      include: {
        carts: true,
      },
    });

    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    if (cartItem.carts.user_id !== user_id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await prisma.cart_items.delete({
      where: { id: parseInt(itemId) },
    });

    // Update cart updated_at
    await prisma.carts.update({
      where: { cart_id: cartItem.cart_id },
      data: { updated_at: new Date() },
    });

    res.json({ message: "Item removed from cart" });
  } catch (err) {
    console.error("Error removing from cart:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Clear cart
export const clearCart = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    const cart = await prisma.carts.findFirst({
      where: { user_id },
    });

    if (!cart) {
      return res.json({ message: "Cart is already empty" });
    }

    await prisma.cart_items.deleteMany({
      where: { cart_id: cart.cart_id },
    });

    await prisma.carts.update({
      where: { cart_id: cart.cart_id },
      data: { updated_at: new Date() },
    });

    res.json({ message: "Cart cleared" });
  } catch (err) {
    console.error("Error clearing cart:", err);
    res.status(500).json({ message: "Server error" });
  }
};

