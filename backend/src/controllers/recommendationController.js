import { prisma } from "../config/prisma.js";
import { removeVietnameseAccents, generateSearchPatterns } from "../utils/vietnameseUtils.js";

// Get recommendations
export const getRecommendations = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { pet_id, type = "products" } = req.query;

    if (!pet_id) {
      return res.status(400).json({ error: "pet_id is required" });
    }

    // Verify pet belongs to user
    const pet = await prisma.pet.findFirst({
      where: { id: pet_id, user_id },
      select: {
        id: true,
        name: true,
        species: true,
      },
    });

    if (!pet) {
      return res.status(404).json({ error: "Pet not found or unauthorized" });
    }

    if (type === "products") {
      // Filter products by pet species: check category, name, or description
      // Support both accented and non-accented Vietnamese text
      const speciesLower = pet.species.toLowerCase();
      const searchPatterns = generateSearchPatterns(pet.species);
      
      // Fetch all products first, then filter in application level for accent-insensitive search
      const allProducts = await prisma.products.findMany({
        include: {
          product_images: {
            where: {
              is_thumbnail: true,
            },
            take: 1,
          },
          vendors: {
            select: {
              store_name: true,
              logo_url: true,
            },
          },
        },
        orderBy: {
          created_at: "desc",
        },
      });

      // Filter products that match pet species (case-insensitive, accent-insensitive)
      const filteredProducts = allProducts.filter(product => {
        const categoryLower = (product.category || "").toLowerCase();
        const categoryNormalized = removeVietnameseAccents(categoryLower);
        const nameLower = (product.name || "").toLowerCase();
        const nameNormalized = removeVietnameseAccents(nameLower);
        const descriptionLower = (product.description || "").toLowerCase();
        const descriptionNormalized = removeVietnameseAccents(descriptionLower);

        // Check if any search pattern matches in category, name, or description
        return searchPatterns.some(pattern => {
          const patternNormalized = removeVietnameseAccents(pattern);
          return (
            categoryLower.includes(pattern) ||
            categoryNormalized.includes(patternNormalized) ||
            nameLower.includes(pattern) ||
            nameNormalized.includes(patternNormalized) ||
            descriptionLower.includes(pattern) ||
            descriptionNormalized.includes(patternNormalized)
          );
        });
      });

      // Limit to 10 products
      const products = filteredProducts.slice(0, 10);

      res.json({
        type: "products",
        pet: pet,
        recommendations: products,
      });
    } else if (type === "services") {
      // Simple filtering: get services (assuming services also have category)
      // For now, return all services since services table doesn't have category
      // You can add category to services table later if needed
      const services = await prisma.services.findMany({
        include: {
          vendors: {
            select: {
              store_name: true,
              logo_url: true,
            },
          },
        },
        take: 10,
        orderBy: {
          created_at: "desc",
        },
      });

      res.json({
        type: "services",
        pet: pet,
        recommendations: services,
      });
    } else {
      return res.status(400).json({ error: "Invalid type. Must be 'products' or 'services'" });
    }
  } catch (err) {
    console.error("Error fetching recommendations:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get product recommendations
export const getProductRecommendations = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { pet_id } = req.query;

    if (!pet_id) {
      return res.status(400).json({ error: "pet_id is required" });
    }

    const pet = await prisma.pet.findFirst({
      where: { id: pet_id, user_id },
      select: {
        id: true,
        name: true,
        species: true,
      },
    });

    if (!pet) {
      return res.status(404).json({ error: "Pet not found or unauthorized" });
    }

    // Filter products by pet species: check category, name, or description
    // Support both accented and non-accented Vietnamese text
    const speciesLower = pet.species.toLowerCase();
    const speciesNormalized = removeVietnameseAccents(speciesLower);
    const searchPatterns = generateSearchPatterns(pet.species);
    
    // Fetch all products first, then filter in application level for accent-insensitive search
    const allProducts = await prisma.products.findMany({
      include: {
        product_images: {
          where: {
            is_thumbnail: true,
          },
          take: 1,
        },
        vendors: {
          select: {
            store_name: true,
            logo_url: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    // Filter products that match pet species (case-insensitive, accent-insensitive)
    const filteredProducts = allProducts.filter(product => {
      const categoryLower = (product.category || "").toLowerCase();
      const categoryNormalized = removeVietnameseAccents(categoryLower);
      const nameLower = (product.name || "").toLowerCase();
      const nameNormalized = removeVietnameseAccents(nameLower);
      const descriptionLower = (product.description || "").toLowerCase();
      const descriptionNormalized = removeVietnameseAccents(descriptionLower);

      // Check if any search pattern matches in category, name, or description
      return searchPatterns.some(pattern => {
        const patternNormalized = removeVietnameseAccents(pattern);
        return (
          categoryLower.includes(pattern) ||
          categoryNormalized.includes(patternNormalized) ||
          nameLower.includes(pattern) ||
          nameNormalized.includes(patternNormalized) ||
          descriptionLower.includes(pattern) ||
          descriptionNormalized.includes(patternNormalized)
        );
      });
    });

    // Limit to 10 products
    const products = filteredProducts.slice(0, 10);

    res.json(products);
  } catch (err) {
    console.error("Error fetching product recommendations:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get service recommendations
export const getServiceRecommendations = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { pet_id } = req.query;

    if (!pet_id) {
      return res.status(400).json({ error: "pet_id is required" });
    }

    const pet = await prisma.pet.findFirst({
      where: { id: pet_id, user_id },
      select: {
        id: true,
        name: true,
        species: true,
      },
    });

    if (!pet) {
      return res.status(404).json({ error: "Pet not found or unauthorized" });
    }

    // For services, return all available services
    // (Services table doesn't have category field, so we return all)
    const services = await prisma.services.findMany({
      include: {
        vendors: {
          select: {
            store_name: true,
            logo_url: true,
          },
        },
      },
      take: 10,
      orderBy: {
        created_at: "desc",
      },
    });

    res.json(services);
  } catch (err) {
    console.error("Error fetching service recommendations:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

