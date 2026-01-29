import "dotenv/config";
import { eq } from "drizzle-orm";
import { drizzleDb } from "@/server/db";
import {
  categories,
  products,
  productImages,
  banners,
} from "@/server/db/schema";
import { hash } from "bcryptjs";
import { users } from "@/server/db/schema/users";

const sampleCategories = [
  {
    name: "Cotton Fabrics",
    slug: "cotton-fabrics",
    description: "Premium quality cotton fabrics for all occasions",
    imageUrl: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800",
    displayOrder: 1,
  },
  {
    name: "Silk Fabrics",
    slug: "silk-fabrics",
    description: "Luxurious silk fabrics for special occasions",
    imageUrl:
      "https://images.unsplash.com/photo-1528459105426-b9548367069b?w=800",
    displayOrder: 2,
  },
  {
    name: "Linen Fabrics",
    slug: "linen-fabrics",
    description: "Breathable linen fabrics perfect for summer",
    imageUrl:
      "https://images.unsplash.com/photo-1604176354204-9268737828e4?w=800",
    displayOrder: 3,
  },
  {
    name: "Printed Fabrics",
    slug: "printed-fabrics",
    description: "Beautiful printed fabrics with unique patterns",
    imageUrl: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800",
    displayOrder: 4,
  },
  {
    name: "Embroidered Fabrics",
    slug: "embroidered-fabrics",
    description: "Intricate embroidered fabrics for premium garments",
    imageUrl:
      "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=800",
    displayOrder: 5,
  },
  {
    name: "Suit Pieces",
    slug: "suit-pieces",
    description: "Complete suit piece sets for traditional wear",
    imageUrl:
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800",
    displayOrder: 6,
  },
];

const sampleProducts = [
  {
    name: "Premium Pure Cotton Fabric - White",
    slug: "premium-pure-cotton-fabric-white",
    description:
      "High-quality pure cotton fabric, perfect for summer wear. Soft, breathable, and comfortable. Ideal for shirts, kurtas, and dresses.",
    shortDescription: "Pure cotton fabric - soft and breathable",
    price: "299",
    compareAtPrice: "399",
    categorySlug: "cotton-fabrics",
    sellingMode: "meter" as const,
    unit: "meter" as const,
    minOrderQuantity: "1",
    quantityStep: "0.5",
    maxOrderQuantity: "50",
    stockQuantity: "1000",
    fabricType: "Cotton",
    material: "100% Pure Cotton",
    width: "44 inches",
    weight: "120 GSM",
    color: "White",
    pattern: "Plain",
    isFeatured: true,
    isActive: true,
    images: [
      "https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=800",
      "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800",
    ],
  },
  {
    name: "Banarasi Silk Fabric - Royal Blue",
    slug: "banarasi-silk-fabric-royal-blue",
    description:
      "Authentic Banarasi silk fabric with traditional weaving. Perfect for sarees, lehengas, and bridal wear. Rich texture and lustrous finish.",
    shortDescription: "Authentic Banarasi silk with traditional weaving",
    price: "1299",
    compareAtPrice: "1599",
    categorySlug: "silk-fabrics",
    sellingMode: "meter" as const,
    unit: "meter" as const,
    minOrderQuantity: "2",
    quantityStep: "0.5",
    maxOrderQuantity: "20",
    stockQuantity: "200",
    fabricType: "Silk",
    material: "Pure Banarasi Silk",
    width: "45 inches",
    weight: "250 GSM",
    color: "Royal Blue",
    pattern: "Jacquard Weave",
    isFeatured: true,
    isActive: true,
    images: [
      "https://images.unsplash.com/photo-1528459105426-b9548367069b?w=800",
    ],
  },
  {
    name: "Pure Linen Fabric - Natural Beige",
    slug: "pure-linen-fabric-natural-beige",
    description:
      "Premium quality pure linen fabric. Lightweight, breathable, and perfect for summer clothing. Gets softer with every wash.",
    shortDescription: "Premium pure linen - perfect for summer",
    price: "599",
    compareAtPrice: "799",
    categorySlug: "linen-fabrics",
    sellingMode: "meter" as const,
    unit: "meter" as const,
    minOrderQuantity: "1",
    quantityStep: "0.5",
    maxOrderQuantity: "30",
    stockQuantity: "500",
    fabricType: "Linen",
    material: "100% Pure Linen",
    width: "58 inches",
    weight: "180 GSM",
    color: "Natural Beige",
    pattern: "Plain",
    isFeatured: true,
    isActive: true,
    images: [
      "https://images.unsplash.com/photo-1604176354204-9268737828e4?w=800",
    ],
  },
  {
    name: "Floral Print Cotton - Pink Rose",
    slug: "floral-print-cotton-pink-rose",
    description:
      "Beautiful floral printed cotton fabric with elegant rose patterns. Perfect for dresses, skirts, and summer wear.",
    shortDescription: "Elegant floral print on soft cotton",
    price: "349",
    compareAtPrice: "449",
    categorySlug: "printed-fabrics",
    sellingMode: "meter" as const,
    unit: "meter" as const,
    minOrderQuantity: "1",
    quantityStep: "0.5",
    maxOrderQuantity: "40",
    stockQuantity: "800",
    fabricType: "Cotton",
    material: "100% Cotton",
    width: "44 inches",
    weight: "130 GSM",
    color: "Pink",
    pattern: "Floral Print",
    isFeatured: false,
    isActive: true,
    images: ["https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800"],
  },
  {
    name: "Chikankari Embroidered Fabric - White",
    slug: "chikankari-embroidered-fabric-white",
    description:
      "Traditional Lucknowi Chikankari embroidered fabric. Handcrafted with intricate patterns. Perfect for kurtas and ethnic wear.",
    shortDescription: "Traditional Lucknowi Chikankari embroidery",
    price: "899",
    compareAtPrice: "1199",
    categorySlug: "embroidered-fabrics",
    sellingMode: "meter" as const,
    unit: "meter" as const,
    minOrderQuantity: "2",
    quantityStep: "0.5",
    maxOrderQuantity: "15",
    stockQuantity: "150",
    fabricType: "Cotton",
    material: "100% Cotton with Hand Embroidery",
    width: "44 inches",
    weight: "140 GSM",
    color: "White",
    pattern: "Chikankari Embroidery",
    isFeatured: true,
    isActive: true,
    images: [
      "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=800",
    ],
  },
  {
    name: "Unstitched Suit Piece Set - Maroon Gold",
    slug: "unstitched-suit-piece-set-maroon-gold",
    description:
      "Complete unstitched suit piece set with kurta fabric, bottom fabric, and dupatta. Perfect for festivals and special occasions.",
    shortDescription: "Complete 3-piece suit set",
    price: "2499",
    compareAtPrice: "3499",
    categorySlug: "suit-pieces",
    sellingMode: "piece" as const,
    unit: "set" as const,
    minOrderQuantity: "1",
    quantityStep: "1",
    maxOrderQuantity: "10",
    stockQuantity: "50",
    fabricType: "Silk Blend",
    material: "Silk Cotton Blend with Zari Work",
    width: "44 inches",
    weight: "200 GSM",
    color: "Maroon with Gold",
    pattern: "Jacquard with Zari Border",
    isFeatured: true,
    isActive: true,
    images: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800",
    ],
  },
  {
    name: "Cotton Cambric Fabric - Sky Blue",
    slug: "cotton-cambric-fabric-sky-blue",
    description:
      "Fine quality cotton cambric fabric. Lightweight and soft, perfect for formal shirts and summer wear.",
    shortDescription: "Fine cotton cambric for formal wear",
    price: "249",
    compareAtPrice: "349",
    categorySlug: "cotton-fabrics",
    sellingMode: "meter" as const,
    unit: "meter" as const,
    minOrderQuantity: "1",
    quantityStep: "0.5",
    maxOrderQuantity: "50",
    stockQuantity: "1200",
    fabricType: "Cotton Cambric",
    material: "100% Cotton Cambric",
    width: "44 inches",
    weight: "90 GSM",
    color: "Sky Blue",
    pattern: "Plain",
    isFeatured: false,
    isActive: true,
    images: [
      "https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=800",
    ],
  },
  {
    name: "Raw Silk Fabric - Mustard Yellow",
    slug: "raw-silk-fabric-mustard-yellow",
    description:
      "Natural raw silk fabric with beautiful texture. Perfect for ethnic wear, blouses, and festive clothing.",
    shortDescription: "Natural raw silk with beautiful texture",
    price: "799",
    compareAtPrice: "999",
    categorySlug: "silk-fabrics",
    sellingMode: "meter" as const,
    unit: "meter" as const,
    minOrderQuantity: "1",
    quantityStep: "0.5",
    maxOrderQuantity: "25",
    stockQuantity: "300",
    fabricType: "Raw Silk",
    material: "100% Natural Raw Silk",
    width: "45 inches",
    weight: "180 GSM",
    color: "Mustard Yellow",
    pattern: "Plain with Natural Texture",
    isFeatured: false,
    isActive: true,
    images: [
      "https://images.unsplash.com/photo-1528459105426-b9548367069b?w=800",
    ],
  },
];

async function seed() {
  console.log("🌱 Starting database seed...\n");

  try {
    // Create or update admin user
    console.log("Creating admin user...");
    const hashedPassword = await hash("admin123", 12);

    // Check if admin exists
    const existingAdmin = await drizzleDb.query.users.findFirst({
      where: eq(users.email, "admin@namantextiles.com"),
    });

    if (existingAdmin) {
      // Update password if admin exists
      await drizzleDb
        .update(users)
        .set({ password: hashedPassword, role: "admin" })
        .where(eq(users.email, "admin@namantextiles.com"));
      console.log(
        "✅ Admin user updated (admin@namantextiles.com / admin123)\n"
      );
    } else {
      await drizzleDb.insert(users).values({
        name: "Admin User",
        email: "admin@namantextiles.com",
        password: hashedPassword,
        role: "admin",
        emailVerified: new Date(),
      });
      console.log(
        "✅ Admin user created (admin@namantextiles.com / admin123)\n"
      );
    }

    // Create categories
    console.log("Creating categories...");
    const insertedCategories = await Promise.all(
      sampleCategories.map(async (category) => {
        const [inserted] = await drizzleDb
          .insert(categories)
          .values(category)
          .onConflictDoNothing()
          .returning();
        return inserted;
      })
    );
    console.log(
      `✅ Created ${insertedCategories.filter(Boolean).length} categories\n`
    );

    // Get category ID mapping
    const categoryMap = new Map<string, string>();
    const allCategories = await drizzleDb.query.categories.findMany();
    allCategories.forEach((cat) => {
      categoryMap.set(cat.slug, cat.id);
    });

    // Create products
    console.log("Creating products...");
    for (const product of sampleProducts) {
      const categoryId = categoryMap.get(product.categorySlug);
      if (!categoryId) {
        console.log(`⚠️ Category not found for ${product.name}, skipping...`);
        continue;
      }

      const { images, categorySlug, ...productData } = product;

      const [insertedProduct] = await drizzleDb
        .insert(products)
        .values({
          ...productData,
          categoryId,
        })
        .onConflictDoNothing()
        .returning();

      if (insertedProduct && images.length > 0) {
        // Insert product images
        await Promise.all(
          images.map((url, index) =>
            drizzleDb
              .insert(productImages)
              .values({
                productId: insertedProduct.id,
                url,
                alt: `${product.name} - Image ${index + 1}`,
                position: index,
              })
              .onConflictDoNothing()
          )
        );
      }

      console.log(`  ✅ ${product.name}`);
    }

    // Create banners
    console.log("\nCreating banners...");
    const sampleBanners = [
      {
        title: "Premium Cotton Collection",
        subtitle:
          "Discover our finest quality cotton fabrics - soft, breathable, and perfect for all seasons",
        image:
          "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1600&h=900&fit=crop",
        link: "/category/cotton-fabrics",
        position: 1,
        isActive: true,
      },
      {
        title: "Luxurious Silk Fabrics",
        subtitle:
          "Experience the elegance of pure silk - perfect for special occasions and festive wear",
        image:
          "https://images.unsplash.com/photo-1528459105426-b9548367069b?w=1600&h=900&fit=crop",
        link: "/category/silk-fabrics",
        position: 2,
        isActive: true,
      },
      {
        title: "New Arrivals",
        subtitle:
          "Explore our latest collection of premium fabrics - fresh designs added weekly",
        image:
          "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=1600&h=900&fit=crop",
        link: "/new-arrivals",
        position: 3,
        isActive: true,
      },
    ];

    for (const banner of sampleBanners) {
      await drizzleDb.insert(banners).values(banner).onConflictDoNothing();
      console.log(`  ✅ ${banner.title}`);
    }

    console.log("\n🎉 Database seed completed successfully!");
    console.log("\nYou can now:");
    console.log("  1. Run 'pnpm dev' to start the development server");
    console.log("  2. Visit http://localhost:3000 to see the website");
    console.log(
      "  3. Sign in as admin with: admin@namantextiles.com / admin123"
    );
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }

  process.exit(0);
}

seed();
