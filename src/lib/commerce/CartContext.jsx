import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  addCartLines,
  createCart,
  getCart,
  isShopifyConfigured,
  removeCartLines,
  updateCartLines,
} from './shopifyStorefront.js';
import { CartContext } from './cartContext.js';

const CART_STORAGE_KEY = 'aura_shopify_cart_id';

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    const cartId = localStorage.getItem(CART_STORAGE_KEY);
    if (!cartId || !isShopifyConfigured) return null;
    setLoading(true);
    try {
      const fresh = await getCart(cartId);
      setCart(fresh);
      if (!fresh) localStorage.removeItem(CART_STORAGE_KEY);
      return fresh;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addVariant = useCallback(async ({ variantId, quantity = 1 }) => {
    setError('');
    setLoading(true);
    try {
      const existingId = localStorage.getItem(CART_STORAGE_KEY);
      const nextCart = existingId
        ? await addCartLines(existingId, [{ merchandiseId: variantId, quantity }])
        : await createCart([{ merchandiseId: variantId, quantity }]);
      localStorage.setItem(CART_STORAGE_KEY, nextCart.id);
      setCart(nextCart);
      return nextCart;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateLine = useCallback(async ({ lineId, quantity }) => {
    const cartId = cart?.id || localStorage.getItem(CART_STORAGE_KEY);
    if (!cartId) return null;
    const nextCart = await updateCartLines(cartId, [{ id: lineId, quantity }]);
    setCart(nextCart);
    return nextCart;
  }, [cart?.id]);

  const removeLine = useCallback(async (lineId) => {
    const cartId = cart?.id || localStorage.getItem(CART_STORAGE_KEY);
    if (!cartId) return null;
    const nextCart = await removeCartLines(cartId, [lineId]);
    setCart(nextCart);
    return nextCart;
  }, [cart?.id]);

  const value = useMemo(() => ({
    cart,
    error,
    loading,
    configured: isShopifyConfigured,
    addVariant,
    updateLine,
    removeLine,
    refreshCart,
  }), [addVariant, cart, error, loading, refreshCart, removeLine, updateLine]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
