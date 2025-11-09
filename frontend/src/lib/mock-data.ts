export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string;
  brand: string;
  sku: string;
  images: string[];
  stock: number;
  rating: number;
  reviewCount: number;
  features: string[];
  specifications: Record<string, string>;
  isFeatured: boolean;
  isNew: boolean;
  isTrending: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
}

export const categories: Category[] = [
  { id: "1", name: "Electronics", slug: "electronics", image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400", description: "Latest gadgets, smartphones, laptops, and electronic accessories for modern living" },
  { id: "2", name: "Fashion", slug: "fashion", image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400", description: "Trendy clothing, footwear, and fashion accessories for all styles" },
  { id: "3", name: "Home & Living", slug: "home-living", image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400", description: "Beautiful furniture, decor, and essentials to make your house a home" },
  { id: "4", name: "Sports", slug: "sports", image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400", description: "Equipment, apparel, and accessories for active and healthy lifestyles" },
  { id: "5", name: "Books", slug: "books", image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400", description: "Wide collection of books, magazines, and educational content" },
  { id: "6", name: "Beauty", slug: "beauty", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400", description: "Skincare, makeup, fragrances, and personal care products" },
];

export const products: Product[] = [
  {
    id: "1",
    name: "Premium Wireless Headphones",
    description: "High-quality wireless headphones with active noise cancellation, premium sound quality, and 30-hour battery life. Perfect for music lovers and professionals.",
    price: 299,
    discountPrice: 249,
    category: "Electronics",
    brand: "AudioPro",
    sku: "APH-001",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800",
      "https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=800",
    ],
    stock: 45,
    rating: 4.8,
    reviewCount: 324,
    features: [
      "Active Noise Cancellation",
      "30-hour battery life",
      "Premium leather cushions",
      "Bluetooth 5.0",
      "Built-in microphone"
    ],
    specifications: {
      "Battery Life": "30 hours",
      "Connectivity": "Bluetooth 5.0, 3.5mm jack",
      "Weight": "250g",
      "Warranty": "2 years",
    },
    isFeatured: true,
    isNew: false,
    isTrending: true,
  },
  {
    id: "2",
    name: "Smart Watch Pro",
    description: "Advanced smartwatch with fitness tracking, heart rate monitoring, GPS, and 7-day battery life. Stay connected and healthy.",
    price: 399,
    discountPrice: 349,
    category: "Electronics",
    brand: "TechGear",
    sku: "TGW-002",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800",
    ],
    stock: 78,
    rating: 4.6,
    reviewCount: 892,
    features: [
      "Heart rate monitoring",
      "GPS tracking",
      "Water resistant",
      "Sleep tracking",
      "Notifications"
    ],
    specifications: {
      "Battery Life": "7 days",
      "Display": "1.4\" AMOLED",
      "Water Resistance": "5 ATM",
      "Compatibility": "iOS & Android",
    },
    isFeatured: true,
    isNew: true,
    isTrending: true,
  },
  {
    id: "3",
    name: "Designer Leather Jacket",
    description: "Premium genuine leather jacket with modern fit. Timeless style that never goes out of fashion. Handcrafted with attention to detail.",
    price: 599,
    discountPrice: 499,
    category: "Fashion",
    brand: "UrbanStyle",
    sku: "USJ-003",
    images: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800",
      "https://images.unsplash.com/photo-1520975867597-0af37a22e31e?w=800",
    ],
    stock: 23,
    rating: 4.9,
    reviewCount: 156,
    features: [
      "Genuine leather",
      "Multiple pockets",
      "Removable lining",
      "Modern slim fit",
      "Durable zippers"
    ],
    specifications: {
      "Material": "100% Genuine Leather",
      "Lining": "Polyester",
      "Care": "Professional cleaning",
      "Sizes": "S, M, L, XL, XXL",
    },
    isFeatured: true,
    isNew: false,
    isTrending: false,
  },
  {
    id: "4",
    name: "Minimalist Desk Lamp",
    description: "Modern LED desk lamp with adjustable brightness and color temperature. Perfect for any workspace with sleek Scandinavian design.",
    price: 89,
    discountPrice: 69,
    category: "Home & Living",
    brand: "LightSpace",
    sku: "LSL-004",
    images: [
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800",
      "https://images.unsplash.com/photo-1565689157206-0fddef7589a2?w=800",
    ],
    stock: 156,
    rating: 4.5,
    reviewCount: 421,
    features: [
      "Adjustable brightness",
      "Touch controls",
      "USB charging port",
      "Energy efficient LED",
      "Flexible arm"
    ],
    specifications: {
      "Power": "12W LED",
      "Color Temperature": "3000K-6000K",
      "Brightness": "5 levels",
      "USB Port": "5V 1A",
    },
    isFeatured: true,
    isNew: true,
    isTrending: true,
  },
  {
    id: "5",
    name: "Running Shoes Pro",
    description: "Professional running shoes with advanced cushioning technology. Lightweight, breathable, and designed for maximum performance.",
    price: 159,
    category: "Sports",
    brand: "RunFast",
    sku: "RFS-005",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800",
    ],
    stock: 234,
    rating: 4.7,
    reviewCount: 678,
    features: [
      "Advanced cushioning",
      "Breathable mesh",
      "Anti-slip sole",
      "Lightweight design",
      "Arch support"
    ],
    specifications: {
      "Weight": "280g (per shoe)",
      "Material": "Mesh + Synthetic",
      "Sole": "Rubber",
      "Sizes": "US 6-13",
    },
    isFeatured: true,
    isNew: false,
    isTrending: true,
  },
  {
    id: "6",
    name: "Organic Skincare Set",
    description: "Complete organic skincare routine with natural ingredients. Includes cleanser, toner, serum, and moisturizer for healthy, glowing skin.",
    price: 129,
    discountPrice: 99,
    category: "Beauty",
    brand: "NaturalGlow",
    sku: "NGS-006",
    images: [
      "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800",
      "https://images.unsplash.com/photo-1570554886111-e80fcca6a029?w=800",
    ],
    stock: 89,
    rating: 4.8,
    reviewCount: 543,
    features: [
      "100% organic",
      "Cruelty-free",
      "Suitable for all skin types",
      "Dermatologically tested",
      "Complete routine"
    ],
    specifications: {
      "Set Includes": "Cleanser, Toner, Serum, Moisturizer",
      "Size": "50ml each",
      "Shelf Life": "12 months",
      "Ingredients": "Natural & Organic",
    },
    isFeatured: true,
    isNew: true,
    isTrending: false,
  },
  {
    id: "7",
    name: "Mechanical Keyboard RGB",
    description: "Professional mechanical keyboard with RGB lighting, hot-swappable switches, and premium build quality. Perfect for gaming and typing.",
    price: 179,
    discountPrice: 149,
    category: "Electronics",
    brand: "KeyMaster",
    sku: "KMK-007",
    images: [
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800",
    ],
    stock: 67,
    rating: 4.9,
    reviewCount: 234,
    features: [
      "Hot-swappable switches",
      "RGB per-key lighting",
      "Aluminum frame",
      "Detachable cable",
      "N-key rollover"
    ],
    specifications: {
      "Layout": "Full-size 104 keys",
      "Switches": "Mechanical (Hot-swap)",
      "Connection": "USB-C",
      "Backlighting": "RGB per-key",
    },
    isFeatured: false,
    isNew: true,
    isTrending: true,
  },
  {
    id: "8",
    name: "Portable Bluetooth Speaker",
    description: "Waterproof portable speaker with 360° sound, 20-hour battery, and premium audio quality. Perfect for outdoor adventures.",
    price: 129,
    discountPrice: 99,
    category: "Electronics",
    brand: "SoundWave",
    sku: "SWS-008",
    images: [
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800",
    ],
    stock: 145,
    rating: 4.6,
    reviewCount: 567,
    features: [
      "IPX7 waterproof",
      "360° sound",
      "20-hour battery",
      "Bluetooth 5.0",
      "Built-in microphone"
    ],
    specifications: {
      "Battery": "20 hours",
      "Water Resistance": "IPX7",
      "Connectivity": "Bluetooth 5.0",
      "Output": "20W",
    },
    isFeatured: false,
    isNew: false,
    isTrending: true,
  },
];
