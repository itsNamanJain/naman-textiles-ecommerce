import { createStore } from "@xstate/store";

export type CartItem = {
  productId: string;
  name: string;
  slug: string;
  image?: string;
  price: number;
  quantity: number;
  unit: string;
  sellingMode: "meter" | "piece";
  minOrderQuantity: number;
  quantityStep: number;
  maxOrderQuantity?: number;
  stockQuantity: number;
};

export type CartState = {
  items: CartItem[];
  isOpen: boolean;
  isLoading: boolean;
};

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
    addItem: (context, event: { item: Omit<CartItem, "quantity">; quantity: number }) => {
      const existingIndex = context.items.findIndex(
        (i) => i.productId === event.item.productId
      );

      let newItems: CartItem[];

      if (existingIndex >= 0) {
        // Update existing item quantity
        newItems = context.items.map((item, index) => {
          if (index === existingIndex) {
            const newQuantity = item.quantity + event.quantity;
            // Respect max order quantity if set
            const maxQty = item.maxOrderQuantity ?? Infinity;
            return {
              ...item,
              quantity: Math.min(newQuantity, maxQty, item.stockQuantity),
            };
          }
          return item;
        });
      } else {
        // Add new item
        newItems = [...context.items, { ...event.item, quantity: event.quantity }];
      }

      saveCartToStorage(newItems);
      return { ...context, items: newItems, isOpen: true };
    },

    // Update item quantity
    updateQuantity: (context, event: { productId: string; quantity: number }) => {
      const newItems = context.items.map((item) => {
        if (item.productId === event.productId) {
          // Validate quantity against constraints
          const minQty = item.minOrderQuantity;
          const maxQty = Math.min(item.maxOrderQuantity ?? Infinity, item.stockQuantity);
          const quantity = Math.max(minQty, Math.min(event.quantity, maxQty));
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
          const newQuantity = item.quantity + item.quantityStep;
          const maxQty = Math.min(item.maxOrderQuantity ?? Infinity, item.stockQuantity);
          return { ...item, quantity: Math.min(newQuantity, maxQty) };
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
            const newQuantity = item.quantity - item.quantityStep;
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
