import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { fetchUserOrders } from "../services/ordersService";
import type { Order } from "../types/glowstack.ts";

export const useOrders = () => {
  const { currentUser, isLoggedIn } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState<boolean>(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    if (!isLoggedIn || !currentUser) {
      setOrders([]);
      setLoadingOrders(false);
      return;
    }

    setLoadingOrders(true);
    setOrdersError(null);

    try {
      const data = await fetchUserOrders(currentUser.uid);
      setOrders(data);
    } catch (err) {
      if (err instanceof Error) {
        setOrdersError(err.message);
      } else {
        setOrdersError("Ocorreu um erro inesperado ao carregar seus pedidos.");
      }
    } finally {
      setLoadingOrders(false);
    }
  }, [currentUser, isLoggedIn]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  return { orders, loadingOrders, ordersError, refreshOrders: loadOrders };
};
