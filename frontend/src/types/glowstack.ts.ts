import { Timestamp } from 'firebase/firestore';

// ==========================================
// 1. PRODUTO (Coleção: products)
// ==========================================
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // Armazenado em centavos (ex: 4990 = R$ 49,90)
  stripePriceId: string; // ID do preço gerado no Stripe
  stripeProductId: string; // ID do produto gerado no Stripe
  images: string[]; // URLs das fotos (Firebase Storage)
  category: 'labios' | 'pele' | 'olhos' | 'skincare'; // Categorias restritas
  stock: number;
  rating: number;
  createdAt: Timestamp;
}

// ==========================================
// 2. USUÁRIO (Coleção: users)
// ==========================================
export interface UserProfile {
  uid: string; // ID vindo do Firebase Auth
  name: string;
  email: string;
  stripeCustomerId: string; // ID do cliente criado no Stripe
  createdAt: Timestamp;
}

// ==========================================
// 3. CARRINHO DE COMPRAS / STORECAR (Coleção: carts)
// ==========================================
export interface CartItem {
  productId: string;
  quantity: number;
}

export interface StoreCar {
  userId: string; // ID do documento é o uid do usuário
  items: CartItem[];
  updatedAt: Timestamp;
}

// Interface auxiliar para uso no estado global do React (com dados hydrated)
export interface CartItemDetailed extends CartItem {
  product: Product; // Dados do produto carregados junto com a quantidade
}

// ==========================================
// 4. PEDIDOS (Coleção: orders)
// ==========================================
export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'cancelled';

export interface OrderItemSnapshot {
  productId: string;
  name: string;
  priceAtPurchase: number; // Preço histórico da época da compra
  quantity: number;
  imageThumbnail: string;
}

export interface ShippingAddress {
  city: string;
  country: string;
  line1: string;
  line2: string | null;
  postalCode: string;
  state: string;
}

export interface Order {
  id: string;
  userId: string;
  stripeSessionId: string; // ID da sessão de checkout do Stripe
  items: OrderItemSnapshot[]; // Cópia segura dos itens
  totalAmount: number; // Valor total pago em centavos
  status: OrderStatus;
  shippingAddress: ShippingAddress;
  createdAt: Timestamp;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number; // Porcentagem (ex: 15 para 15%) ou Valor em centavos (ex: 2000 para R$ 20,00)
}
