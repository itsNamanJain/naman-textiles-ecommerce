"use client";

import { type Readable } from "@xstate/store";
import { useSelector } from "@xstate/store/react";
import equal from "fast-deep-equal";

/**
 * A typed wrapper around useSelector for @xstate/store
 * Provides better type inference and uses fast-deep-equal for comparison by default
 *
 * @example
 * const { items, isOpen } = useXStateSelector(cartStore, ({ context }) => context);
 *
 * @example
 * const items = useXStateSelector(cartStore, ({ context }) => context.items);
 */
 
export const useXStateSelector = <
  TStore extends Readable<any> & { getSnapshot: () => any },
  T,
>(
  store: TStore,
  selector: (snapshot: TStore extends Readable<infer S> ? S : never) => T,
  compare?: (a: T | undefined, b: T) => boolean
): T => {
  // During SSR/static generation, get snapshot directly from store
  // This prevents "undefined" errors during prerendering
  const result = useSelector(store, selector, compare ?? equal);

  // Fallback to store snapshot if useSelector returns undefined (during SSG)
  if (result === undefined) {
    const snapshot = store.getSnapshot();
    return selector(snapshot as TStore extends Readable<infer S> ? S : never);
  }

  return result;
};
