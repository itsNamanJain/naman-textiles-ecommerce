import { createStore } from "@xstate/store";

export type UIState = {
  isMobileMenuOpen: boolean;
  isSearchOpen: boolean;
  isFilterDrawerOpen: boolean;
  activeModal: string | null;
};

const initialUIContext: UIState = {
  isMobileMenuOpen: false,
  isSearchOpen: false,
  isFilterDrawerOpen: false,
  activeModal: null,
};

export const uiStore = createStore({
  context: initialUIContext,

  on: {
    // Mobile menu
    toggleMobileMenu: (context) => ({
      ...context,
      isMobileMenuOpen: !context.isMobileMenuOpen,
    }),
    openMobileMenu: (context) => ({
      ...context,
      isMobileMenuOpen: true,
    }),
    closeMobileMenu: (context) => ({
      ...context,
      isMobileMenuOpen: false,
    }),

    // Search
    toggleSearch: (context) => ({
      ...context,
      isSearchOpen: !context.isSearchOpen,
    }),
    openSearch: (context) => ({
      ...context,
      isSearchOpen: true,
    }),
    closeSearch: (context) => ({
      ...context,
      isSearchOpen: false,
    }),

    // Filter drawer (for mobile product listing)
    toggleFilterDrawer: (context) => ({
      ...context,
      isFilterDrawerOpen: !context.isFilterDrawerOpen,
    }),
    openFilterDrawer: (context) => ({
      ...context,
      isFilterDrawerOpen: true,
    }),
    closeFilterDrawer: (context) => ({
      ...context,
      isFilterDrawerOpen: false,
    }),

    // Generic modal
    openModal: (context, event: { modalId: string }) => ({
      ...context,
      activeModal: event.modalId as string | null,
    }),
    closeModal: (context) => ({
      ...context,
      activeModal: null as string | null,
    }),

    // Close all overlays
    closeAll: (): UIState => ({
      isMobileMenuOpen: false,
      isSearchOpen: false,
      isFilterDrawerOpen: false,
      activeModal: null,
    }),
  },
});

// Export store type for use with useXStateSelector
export type UISnapshot = ReturnType<typeof uiStore.getSnapshot>;
