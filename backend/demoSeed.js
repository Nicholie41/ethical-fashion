const crypto = require("crypto");
const bcrypt = require("bcrypt");

const User = require("./models/User");
const Brand = require("./models/Brand");
const Product = require("./models/Product");

function shouldAutoSeed() {
  // Keep production environments clean.
  if (process.env.NODE_ENV === "production") return false;
  // Default: seed on empty for local/dev unless explicitly disabled.
  return process.env.DEMO_SEED_ON_EMPTY !== "false";
}

async function ensureSeedAdmin() {
  const username = process.env.DEMO_SEED_ADMIN_USERNAME || "demo_seed_admin";

  let admin = await User.findOne({ username });
  if (admin) return admin;

  // Random password: we only need the user as an uploader reference for seeded documents.
  const password = crypto.randomBytes(18).toString("base64");
  const passwordHash = await bcrypt.hash(password, 10);

  admin = await User.create({
    username,
    passwordHash,
    role: "admin",
    points: 0,
    level: "New",
    achievements: [],
    streak: { current: 0, longest: 0, lastVisit: new Date() },
    preferences: {
      style: "Casual & Comfortable",
      budget: "Mid-range ($50-150)",
      sustainability: "Somewhat Important",
      colors: [],
      materials: [],
      quizCompleted: false,
    },
  });

  return admin;
}

async function seedBrands(uploaderId) {
  const seedBrands = [
    {
      name: "PACT",
      description: "Sustainable basics made with organic cotton",
      website: "https://wearpact.com",
      approved: true,
    },
    {
      name: "Patagonia",
      description: "Outdoor clothing with environmental responsibility",
      website: "https://patagonia.com",
      approved: true,
    },
    {
      name: "Eileen Fisher",
      description: "Timeless, sustainable women's clothing",
      website: "https://eileenfisher.com",
      approved: true,
    },
    {
      name: "Veja",
      description: "Sustainable sneakers made with organic materials",
      website: "https://veja-store.com",
      approved: true,
    },
    {
      name: "Reformation",
      description: "Sustainable fashion for the modern woman",
      website: "https://reformation.com",
      approved: true,
    },
  ];

  const brandDocs = [];
  for (const b of seedBrands) {
    const doc = await Brand.findOneAndUpdate(
      { name: b.name },
      {
        name: b.name,
        description: b.description,
        website: b.website,
        approved: !!b.approved,
        uploader: uploaderId,
      },
      { upsert: true, new: true }
    );
    brandDocs.push(doc);
  }
  return brandDocs;
}

async function seedProducts(uploaderId, brandDocs) {
  const brandByName = new Map(brandDocs.map((b) => [b.name, b]));

  const premiumProducts = [
    {
      brandName: "PACT",
      name: "Organic Cotton Crew Neck Sweatshirt",
      description:
        "Made with 100% organic cotton, this ultra-soft crew neck sweatshirt features a relaxed fit and ribbed cuffs and hem. Perfect for everyday wear, it's breathable, comfortable, and sustainably produced without harmful chemicals.",
      price: 45.0,
      material: "Organic Cotton",
      materials: ["Organic Cotton"],
      category: "Sweatshirts",
      sustainabilityScore: 9,
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      colors: ["Heather Gray", "Navy", "Black", "White"],
      imageUrls: [
        "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=1000&fit=crop",
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=1000&fit=crop",
      ],
      approved: true,
      views: 1250,
      rating: 4.8,
    },
    {
      brandName: "Patagonia",
      name: "Hemp Canvas Tote Bag",
      description:
        "This durable tote bag is crafted from premium hemp canvas, featuring reinforced handles and a spacious interior. Hemp is naturally antimicrobial and requires minimal water to grow, making this bag both stylish and eco-friendly.",
      price: 35.0,
      material: "Hemp",
      materials: ["Hemp", "Organic Cotton"],
      category: "Bags",
      sustainabilityScore: 10,
      sizes: ["One Size"],
      colors: ["Natural", "Black", "Olive"],
      imageUrls: [
        "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=1000&fit=crop",
        "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&h=1000&fit=crop",
      ],
      approved: true,
      views: 890,
      rating: 4.9,
    },
    {
      brandName: "Eileen Fisher",
      name: "Bamboo Viscose Blouse",
      description:
        "This elegant blouse is made from bamboo viscose, a silky-soft fabric that's naturally antibacterial and moisture-wicking. The relaxed fit and button-down design make it perfect for both casual and professional settings.",
      price: 65.0,
      material: "Bamboo Viscose",
      materials: ["Bamboo Viscose"],
      category: "Blouses",
      sustainabilityScore: 8,
      sizes: ["XS", "S", "M", "L", "XL"],
      colors: ["White", "Light Blue", "Pink", "Black"],
      imageUrls: [
        "https://images.unsplash.com/photo-1564257631407-3deb25e9c8e0?w=800&h=1000&fit=crop",
        "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&h=1000&fit=crop",
      ],
      approved: true,
      views: 1100,
      rating: 4.7,
    },
    {
      brandName: "Veja",
      name: "Recycled Polyester Active Leggings",
      description:
        "These high-performance leggings are made from recycled polyester, diverting plastic waste from landfills. They feature a high-waisted design, four-way stretch, and moisture-wicking technology for ultimate comfort during workouts.",
      price: 55.0,
      material: "Recycled Polyester",
      materials: ["Recycled Polyester", "Elastane"],
      category: "Activewear",
      sustainabilityScore: 7,
      sizes: ["XS", "S", "M", "L", "XL"],
      colors: ["Black", "Navy", "Charcoal", "Burgundy"],
      imageUrls: [
        "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&h=1000&fit=crop",
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=1000&fit=crop",
      ],
      approved: true,
      views: 1450,
      rating: 4.6,
    },
    {
      brandName: "Reformation",
      name: "Tencel Linen Blend Dress",
      description:
        "This flowy midi dress combines the softness of Tencel with the breathability of linen. The relaxed silhouette and adjustable waist tie create a flattering fit, while the sustainable fabric blend ensures comfort in any weather.",
      price: 85.0,
      material: "Tencel Linen Blend",
      materials: ["Tencel", "Linen"],
      category: "Dresses",
      sustainabilityScore: 9,
      sizes: ["XS", "S", "M", "L", "XL"],
      colors: ["Sage Green", "Terracotta", "Navy", "Cream"],
      imageUrls: [
        "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=1000&fit=crop",
        "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&h=1000&fit=crop",
      ],
      approved: true,
      views: 980,
      rating: 4.9,
    },
    {
      brandName: "Eileen Fisher",
      name: "Organic Wool Sweater",
      description:
        "This cozy sweater is crafted from organic wool, providing natural warmth and breathability. The classic crew neck design and ribbed texture make it a timeless addition to any wardrobe, while the organic certification ensures ethical production.",
      price: 95.0,
      material: "Organic Wool",
      materials: ["Organic Wool"],
      category: "Sweaters",
      sustainabilityScore: 8,
      sizes: ["S", "M", "L", "XL"],
      colors: ["Camel", "Charcoal", "Navy", "Cream"],
      imageUrls: [
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=1000&fit=crop",
        "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=1000&fit=crop",
      ],
      approved: true,
      views: 1200,
      rating: 4.8,
    },
    {
      brandName: "Patagonia",
      name: "Hemp Denim Jeans",
      description:
        "These classic straight-leg jeans are made from a blend of hemp and organic cotton, creating a durable yet comfortable fabric. Hemp requires less water and pesticides than conventional cotton, making these jeans both stylish and sustainable.",
      price: 75.0,
      material: "Hemp Denim",
      materials: ["Hemp", "Organic Cotton"],
      category: "Jeans",
      sustainabilityScore: 9,
      sizes: ["28", "30", "32", "34", "36"],
      colors: ["Medium Wash", "Dark Wash", "Black"],
      imageUrls: [
        "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=1000&fit=crop",
        "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&h=1000&fit=crop",
      ],
      approved: true,
      views: 1350,
      rating: 4.7,
    },
    {
      brandName: "PACT",
      name: "Bamboo Socks Set",
      description:
        "This set of three pairs of socks is made from bamboo fiber, which is naturally antibacterial and moisture-wicking. The soft, breathable fabric keeps feet comfortable and fresh throughout the day, while the sustainable material reduces environmental impact.",
      price: 18.0,
      material: "Bamboo",
      materials: ["Bamboo", "Elastane"],
      category: "Socks",
      sustainabilityScore: 8,
      sizes: ["S", "M", "L"],
      colors: ["Gray", "Black", "Navy"],
      imageUrls: [
        "https://images.unsplash.com/photo-1586350977771-b3d0ae9c7187?w=800&h=1000&fit=crop",
        "https://images.unsplash.com/photo-1586350977771-b3d0ae9c7187?w=800&h=1000&fit=crop",
      ],
      approved: true,
      views: 650,
      rating: 4.5,
    },
    {
      brandName: "Patagonia",
      name: "Recycled Nylon Backpack",
      description:
        "This versatile backpack is crafted from recycled nylon, giving new life to post-consumer waste. It features multiple compartments, padded laptop sleeve, and water-resistant construction, making it perfect for work, travel, or everyday use.",
      price: 65.0,
      material: "Recycled Nylon",
      materials: ["Recycled Nylon"],
      category: "Bags",
      sustainabilityScore: 7,
      sizes: ["One Size"],
      colors: ["Black", "Navy", "Olive"],
      imageUrls: [
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=1000&fit=crop",
        "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=1000&fit=crop",
      ],
      approved: true,
      views: 890,
      rating: 4.6,
    },
    {
      brandName: "Eileen Fisher",
      name: "Silk Blouse",
      description:
        "This elegant silk blouse features a classic button-down design with a relaxed fit. Made from 100% mulberry silk, it's naturally temperature-regulating and hypoallergenic. The timeless style makes it perfect for professional settings or special occasions.",
      price: 120.0,
      material: "Silk",
      materials: ["Silk"],
      category: "Blouses",
      sustainabilityScore: 6,
      sizes: ["XS", "S", "M", "L", "XL"],
      colors: ["White", "Black", "Navy", "Blush"],
      imageUrls: [
        "https://images.unsplash.com/photo-1564257631407-3deb25e9c8e0?w=800&h=1000&fit=crop",
        "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&h=1000&fit=crop",
      ],
      approved: true,
      views: 1100,
      rating: 4.9,
    },
    {
      brandName: "Reformation",
      name: "Linen Pants",
      description:
        "These comfortable linen pants feature a relaxed fit and drawstring waist for easy styling. Made from 100% European flax linen, they're naturally breathable and get softer with each wash. Perfect for warm weather and casual occasions.",
      price: 55.0,
      material: "Linen",
      materials: ["Linen"],
      category: "Pants",
      sustainabilityScore: 8,
      sizes: ["XS", "S", "M", "L", "XL"],
      colors: ["Natural", "White", "Navy", "Olive"],
      imageUrls: [
        "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&h=1000&fit=crop",
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=1000&fit=crop",
      ],
      approved: true,
      views: 950,
      rating: 4.7,
    },
    {
      brandName: "PACT",
      name: "Organic Cotton T-Shirt",
      description:
        "This classic crew neck t-shirt is made from 100% organic cotton, grown without harmful pesticides or synthetic fertilizers. The soft, breathable fabric and relaxed fit make it perfect for everyday wear, while the sustainable production supports environmental health.",
      price: 25.0,
      material: "Organic Cotton",
      materials: ["Organic Cotton"],
      category: "T-Shirts",
      sustainabilityScore: 9,
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      colors: ["White", "Black", "Gray", "Navy", "Olive"],
      imageUrls: [
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=1000&fit=crop",
        "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&h=1000&fit=crop",
      ],
      approved: true,
      views: 1800,
      rating: 4.8,
    },
  ];

  let created = 0;
  for (const p of premiumProducts) {
    const brand = brandByName.get(p.brandName);
    if (!brand) continue;

    await Product.create({
      brand: brand._id,
      name: p.name,
      description: p.description,
      price: p.price,
      material: p.material,
      materials: p.materials,
      category: p.category,
      sustainabilityScore: p.sustainabilityScore,
      imageUrls: p.imageUrls,
      approved: !!p.approved,
      uploader: uploaderId,
      sizes: p.sizes,
      colors: p.colors,
      views: p.views,
      rating: p.rating,
    });
    created += 1;
  }

  return created;
}

async function seedDemoDataIfEmpty() {
  if (!shouldAutoSeed()) return { seeded: false };

  const productCount = await Product.countDocuments();
  if (productCount > 0) return { seeded: false };

  const admin = await ensureSeedAdmin();
  const brands = await seedBrands(admin._id);
  const createdProducts = await seedProducts(admin._id, brands);

  return {
    seeded: true,
    adminUsername: admin.username,
    brandsCount: brands.length,
    productsCount: createdProducts,
  };
}

module.exports = { seedDemoDataIfEmpty };

