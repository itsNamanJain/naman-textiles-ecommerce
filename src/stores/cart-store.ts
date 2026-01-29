import { createStore } from "@xstate/store";
import {
  MAX_METER_ORDER_QUANTITY,
  MAX_PIECE_ORDER_QUANTITY,
} from "@/lib/constants";

export type CartItem = {
  productId: string;
  name: string;
  slug: string;
  image?: string;
  price: number;
  quantity: number;
  sellingMode: "meter" | "piece";
  minOrderQuantity: number;
};

export type CartState = {
  items: CartItem[];
  isOpen: boolean;
  isLoading: boolean;
};

const getMaxQuantity = (item: Pick<CartItem, "sellingMode">) =>
  item.sellingMode === "meter"
    ? MAX_METER_ORDER_QUANTITY
    : MAX_PIECE_ORDER_QUANTITY;

// Helper to load cart from localStorage
const loadCartFromStorage = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem("naman-cart");
    return stored ? (JSON.parse(stored) as CartItem[]) : [];
  } catch {
    return [];
  }
};

// Helper to save cart to localStorage
const saveCartToStorage = (items: CartItem[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("naman-cart", JSON.stringify(items));
  } catch {
    // Handle quota exceeded or other errors
  }
};

export const cartStore = createStore({
  context: {
    items: [] as CartItem[],
    isOpen: false as boolean,
    isLoading: false as boolean,
  },

  on: {
    // Initialize cart from localStorage (call on client mount)
    hydrate: (context) => {
      const items = loadCartFromStorage();
      return { ...context, items };
    },

    // Add item to cart
    addItem: (
      context,
      event: { item: Omit<CartItem, "quantity">; quantity: number }
    ) => {
      const existingIndex = context.items.findIndex(
        (i) => i.productId === event.item.productId
      );

      let newItems: CartItem[];

      if (existingIndex >= 0) {
        // Update existing item quantity
        newItems = context.items.map((item, index) => {
          if (index === existingIndex) {
            const maxQty = getMaxQuantity(item);
            const newQuantity = Math.min(
              item.quantity + event.quantity,
              maxQty
            );
            return { ...item, quantity: newQuantity };
          }
          return item;
        });
      } else {
        // Add new item
        const maxQty = getMaxQuantity(event.item);
        const quantity = Math.min(event.quantity, maxQty);
        newItems = [...context.items, { ...event.item, quantity }];
      }

      saveCartToStorage(newItems);
      return { ...context, items: newItems, isOpen: true };
    },

    // Update item quantity
    updateQuantity: (
      context,
      event: { productId: string; quantity: number }
    ) => {
      const newItems = context.items.map((item) => {
        if (item.productId === event.productId) {
          // Validate quantity against constraints
          const minQty = item.minOrderQuantity;
          const maxQty = getMaxQuantity(item);
          const quantity = Math.min(maxQty, Math.max(minQty, event.quantity));
          return { ...item, quantity };
        }
        return item;
      });

      saveCartToStorage(newItems);
      return { ...context, items: newItems };
    },

    // Increment item quantity by step
    incrementQuantity: (context, event: { productId: string }) => {
      const newItems = context.items.map((item) => {
        if (item.productId === event.productId) {
          const maxQty = getMaxQuantity(item);
          const newQuantity = Math.min(item.quantity + 1, maxQty);
          return { ...item, quantity: newQuantity };
        }
        return item;
      });

      saveCartToStorage(newItems);
      return { ...context, items: newItems };
    },

    // Decrement item quantity by step
    decrementQuantity: (context, event: { productId: string }) => {
      const newItems = context.items
        .map((item) => {
          if (item.productId === event.productId) {
            const newQuantity = item.quantity - 1;
            // Remove item if quantity goes below minimum
            if (newQuantity < item.minOrderQuantity) {
              return null;
            }
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];

      saveCartToStorage(newItems);
      return { ...context, items: newItems };
    },

    // Remove item from cart
    removeItem: (context, event: { productId: string }) => {
      const newItems = context.items.filter(
        (item) => item.productId !== event.productId
      );

      saveCartToStorage(newItems);
      return { ...context, items: newItems };
    },

    // Clear entire cart
    clearCart: (context) => {
      saveCartToStorage([]);
      return { ...context, items: [] as CartItem[] };
    },

    // Toggle cart drawer
    toggleCart: (context) => {
      return { ...context, isOpen: !context.isOpen };
    },

    // Open cart drawer
    openCart: (context) => {
      return { ...context, isOpen: true };
    },

    // Close cart drawer
    closeCart: (context) => {
      return { ...context, isOpen: false };
    },

    // Set loading state
    setLoading: (context, event: { isLoading: boolean }) => {
      return { ...context, isLoading: event.isLoading };
    },
  },
});

// Export store type for use with useXStateSelector
export type CartSnapshot = ReturnType<typeof cartStore.getSnapshot>;
