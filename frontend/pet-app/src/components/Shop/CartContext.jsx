import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../../api/axiosConfig.js";
import { useAuth } from "../../hooks/useAuth.js";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const { user } = useAuth();

  // Convert backend cart items to frontend format
  const convertCartItems = (backendItems) => {
    if (!backendItems || !Array.isArray(backendItems)) return [];
    return backendItems.map((item) => ({
      id: item.id, // Backend cart_item id
      productId: item.product_id,
      quantity: item.quantity,
      product: {
        product_id: item.products.product_id,
        name: item.products.name,
        price: item.products.price,
        stock: item.products.stock,
        description: item.products.description,
        category: item.products.category,
        product_images: item.products.product_images || [],
        vendors: item.products.vendors,
      },
    }));
  };

  // Fetch cart from backend when user is logged in
  useEffect(() => {
    const fetchCart = async () => {
      if (!user) {
        // If not logged in, load from localStorage
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
          try {
            setCartItems(JSON.parse(savedCart));
          } catch (e) {
            console.error("Error parsing cart from localStorage:", e);
          }
        }
        return;
      }

      setLoading(true);
      try {
        const response = await api.get("/cart");
        const backendItems = convertCartItems(response.data.cart_items || []);
        setCartItems(backendItems);
        
        // Clear localStorage cart when logged in (use backend cart)
        localStorage.removeItem("cart");
      } catch (error) {
        console.error("Error fetching cart:", error);
        // Fallback to localStorage if API fails
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
          try {
            setCartItems(JSON.parse(savedCart));
          } catch (e) {
            console.error("Error parsing cart from localStorage:", e);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [user]);

  // Sync cart items to localStorage for guest users
  useEffect(() => {
    if (!user && cartItems.length > 0) {
      localStorage.setItem("cart", JSON.stringify(cartItems));
    }
  }, [cartItems, user]);

  const addToCart = async (product) => {
    if (!product || !product.product_id) {
      console.error("Invalid product data:", product);
      return;
    }

    // Check stock availability
    if (product.stock !== undefined && product.stock <= 0) {
      alert("Sản phẩm đã hết hàng!");
      return;
    }

    if (user) {
      // Sync with backend if logged in
      setSyncing(true);
      try {
        const response = await api.post("/cart/items", {
          productId: product.product_id,
          quantity: 1,
        });
        
        // Refresh cart from backend
        const cartResponse = await api.get("/cart");
        const backendItems = convertCartItems(cartResponse.data.cart_items || []);
        setCartItems(backendItems);
      } catch (error) {
        console.error("Error adding to cart:", error);
        const errorMessage = error.response?.data?.message || "Lỗi khi thêm vào giỏ hàng";
        alert(errorMessage);
      } finally {
        setSyncing(false);
      }
    } else {
      // Use localStorage for guest users
      setCartItems((prev) => {
        const existing = prev.find((item) => item.productId === product.product_id);
        
        if (existing) {
          // Check if adding more would exceed stock
          if (product.stock !== undefined && existing.quantity + 1 > product.stock) {
            alert(`Chỉ còn ${product.stock} sản phẩm trong kho!`);
            return prev;
          }
          
          return prev.map((item) =>
            item.productId === product.product_id
              ? { ...item, quantity: item.quantity + 1, product: { ...product } }
              : item
          );
        }
        
        return [...prev, { 
          productId: product.product_id, 
          quantity: 1, 
          product: { ...product }
        }];
      });
    }
  };

  const removeFromCart = async (productId) => {
    if (user) {
      // Find cart item id from backend
      const item = cartItems.find((i) => i.productId === productId);
      if (item && item.id) {
        setSyncing(true);
        try {
          await api.delete(`/cart/items/${item.id}`);
          
          // Refresh cart from backend
          const cartResponse = await api.get("/cart");
          const backendItems = convertCartItems(cartResponse.data.cart_items || []);
          setCartItems(backendItems);
        } catch (error) {
          console.error("Error removing from cart:", error);
          alert("Lỗi khi xóa khỏi giỏ hàng");
        } finally {
          setSyncing(false);
        }
      }
    } else {
      // Use localStorage for guest users
      setCartItems((prev) => prev.filter((item) => item.productId !== productId));
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    if (user) {
      // Find cart item id from backend
      const item = cartItems.find((i) => i.productId === productId);
      if (item && item.id) {
        setSyncing(true);
        try {
          await api.patch(`/cart/items/${item.id}`, { quantity });
          
          // Refresh cart from backend
          const cartResponse = await api.get("/cart");
          const backendItems = convertCartItems(cartResponse.data.cart_items || []);
          setCartItems(backendItems);
        } catch (error) {
          console.error("Error updating cart:", error);
          const errorMessage = error.response?.data?.message || "Lỗi khi cập nhật giỏ hàng";
          alert(errorMessage);
        } finally {
          setSyncing(false);
        }
      }
    } else {
      // Use localStorage for guest users
      setCartItems((prev) => {
        const item = prev.find((i) => i.productId === productId);
        if (item && item.product) {
          // Check stock availability
          if (item.product.stock !== undefined && quantity > item.product.stock) {
            alert(`Chỉ còn ${item.product.stock} sản phẩm trong kho!`);
            return prev;
          }
        }

        return prev.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        );
      });
    }
  };

  const clearCart = async () => {
    if (user) {
      setSyncing(true);
      try {
        await api.delete("/cart");
        setCartItems([]);
      } catch (error) {
        console.error("Error clearing cart:", error);
        alert("Lỗi khi xóa giỏ hàng");
      } finally {
        setSyncing(false);
      }
    } else {
      setCartItems([]);
      localStorage.removeItem("cart");
    }
  };

  const getTotal = () => {
    // Returns total in smallest unit (price is already in smallest unit from API)
    return cartItems.reduce(
      (total, item) => total + (item.product?.price || 0) * item.quantity,
      0
    );
  };

  const getTotalDisplay = () => {
    // Returns total in dollars for display
    return getTotal() / 1000;
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotal,
        getTotalDisplay,
        loading,
        syncing,
      }}>
      {children}
    </CartContext.Provider>
  );
};

