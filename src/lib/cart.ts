"use client";

import { useCallback, useEffect, useState } from "react";

export interface CartItem {
  productId: string;
  quantity: number;
}

const CART_KEY = "eb-cart";

function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("eb-cart-updated"));
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(readCart());
    const handler = () => setItems(readCart());
    window.addEventListener("eb-cart-updated", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("eb-cart-updated", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const addItem = useCallback((productId: string, quantity: number) => {
    const current = readCart();
    const existing = current.find((i) => i.productId === productId);
    const next = existing
      ? current.map((i) => (i.productId === productId ? { ...i, quantity: i.quantity + quantity } : i))
      : [...current, { productId, quantity }];
    writeCart(next);
    setItems(next);
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    const current = readCart();
    const next = quantity <= 0 ? current.filter((i) => i.productId !== productId) : current.map((i) => (i.productId === productId ? { ...i, quantity } : i));
    writeCart(next);
    setItems(next);
  }, []);

  const removeItem = useCallback((productId: string) => {
    const next = readCart().filter((i) => i.productId !== productId);
    writeCart(next);
    setItems(next);
  }, []);

  const clearCart = useCallback(() => {
    writeCart([]);
    setItems([]);
  }, []);

  return { items, addItem, updateQuantity, removeItem, clearCart };
}
