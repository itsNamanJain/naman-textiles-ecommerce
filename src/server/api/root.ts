import { postRouter } from "@/server/api/routers/post";
import { authRouter } from "@/server/api/routers/auth";
import { categoryRouter } from "@/server/api/routers/category";
import { productRouter } from "@/server/api/routers/product";
import { orderRouter } from "@/server/api/routers/order";
import { adminRouter } from "@/server/api/routers/admin";
import { wishlistRouter } from "@/server/api/routers/wishlist";
import { settingsRouter } from "@/server/api/routers/settings";
import { addressRouter } from "@/server/api/routers/address";
import { couponRouter } from "@/server/api/routers/coupon";
import { bannerRouter } from "@/server/api/routers/banner";
import { reviewRouter } from "@/server/api/routers/review";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  auth: authRouter,
  category: categoryRouter,
  product: productRouter,
  order: orderRouter,
  admin: adminRouter,
  wishlist: wishlistRouter,
  settings: settingsRouter,
  address: addressRouter,
  coupon: couponRouter,
  banner: bannerRouter,
  review: reviewRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
