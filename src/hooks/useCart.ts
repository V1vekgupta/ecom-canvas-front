import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { Cart, CartItem, cartApi, cartItemApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  addToCart: (productId: number, quantity: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalItems: () => number;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Get or create cart ID
  const getCartId = () => {
    let cartId = localStorage.getItem('cartId');
    if (!cartId) {
      cartId = Date.now().toString(); // Simple cart ID generation
      localStorage.setItem('cartId', cartId);
    }
    return parseInt(cartId);
  };

  const refreshCart = async () => {
    try {
      setLoading(true);
      const cartId = getCartId();
      const cartData = await cartApi.getCart(cartId);
      setCart(cartData);
    } catch (error) {
      // If cart doesn't exist, create an empty one
      setCart({
        id: getCartId(),
        totalAmount: 0,
        cartItems: [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, []);

  const addToCart = async (productId: number, quantity: number) => {
    try {
      setLoading(true);
      const cartId = getCartId();
      await cartItemApi.addItem(cartId, productId, quantity);
      await refreshCart();
      
      toast({
        title: 'Added to cart',
        description: `${quantity} item(s) added to your cart`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Could not add item to cart',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    try {
      setLoading(true);
      const cartId = getCartId();
      await cartItemApi.updateItem(cartId, itemId, quantity);
      await refreshCart();
      
      toast({
        title: 'Cart updated',
        description: 'Item quantity updated',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Could not update item',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId: number) => {
    try {
      setLoading(true);
      const cartId = getCartId();
      await cartItemApi.removeItem(cartId, itemId);
      await refreshCart();
      
      toast({
        title: 'Item removed',
        description: 'Item removed from cart',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Could not remove item',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      const cartId = getCartId();
      await cartApi.clearCart(cartId);
      await refreshCart();
      
      toast({
        title: 'Cart cleared',
        description: 'All items removed from cart',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Could not clear cart',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getTotalItems = () => {
    return cart?.cartItems.reduce((total, item) => total + item.quantity, 0) || 0;
  };

  const value = {
    cart,
    loading,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    getTotalItems,
    refreshCart,
  };

  return React.createElement(CartContext.Provider, { value }, children);
};