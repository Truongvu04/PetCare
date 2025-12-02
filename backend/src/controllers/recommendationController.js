import { prisma } from "../config/prisma.js";
import { removeVietnameseAccents, generateSearchPatterns } from "../utils/vietnameseUtils.js";

/**
 * Get product recommendations
 * GET /api/recommendations/products
 */
export const getProductRecommendations = async (req, res) => {
  try {
    const { pet_id } = req.query;
    const userId = req.user.user_id;

    if (!pet_id) {
      return res.status(400).json({ message: "pet_id is required" });
    }

    // Get pet info
    const pet = await prisma.pet.findFirst({
      where: {
        id: pet_id,
        user_id: userId,
      },
    });

    if (!pet) {
      return res.status(404).json({ message: "Pet not found or you don't have permission" });
    }

    // Get all products
    const allProducts = await prisma.products.findMany({
      include: {
        vendor: {
          select: {
            store_name: true,
          },
        },
      },
    });

    // Filter products based on pet species
    const petSpecies = pet.species.toLowerCase();
    const normalizedSpecies = removeVietnameseAccents(petSpecies);
    const searchPatterns = generateSearchPatterns(petSpecies);

    const filteredProducts = allProducts.filter((product) => {
      const category = (product.category || "").toLowerCase();
      const name = (product.name || "").toLowerCase();
      const description = (product.description || "").toLowerCase();

      const normalizedCategory = removeVietnameseAccents(category);
      const normalizedName = removeVietnameseAccents(name);
      const normalizedDescription = removeVietnameseAccents(description);

      // Check if any search pattern matches
      return searchPatterns.some((pattern) => {
        return (
          normalizedCategory.includes(pattern) ||
          normalizedName.includes(pattern) ||
          normalizedDescription.includes(pattern) ||
          category.includes(pattern) ||
          name.includes(pattern) ||
          description.includes(pattern)
        );
      });
    });

    // Limit to top 10
    const recommendations = filteredProducts.slice(0, 10);

    return res.json({
      success: true,
      products: recommendations,
    });
  } catch (error) {
    console.error("Error in getProductRecommendations:", error);
    return res.status(500).json({
      message: "Error fetching product recommendations",
      error: error.message,
    });
  }
};

/**
 * Get service recommendations
 * GET /api/recommendations/services
 */
export const getServiceRecommendations = async (req, res) => {
  try {
    const userId = req.user.user_id;

    // Get all services (no filtering by pet species for now)
    const services = await prisma.services.findMany({
      include: {
        vendor: {
          select: {
            store_name: true,
          },
        },
      },
      take: 10,
    });

    return res.json({
      success: true,
      services: services,
    });
  } catch (error) {
    console.error("Error in getServiceRecommendations:", error);
    return res.status(500).json({
      message: "Error fetching service recommendations",
      error: error.message,
    });
  }
};



