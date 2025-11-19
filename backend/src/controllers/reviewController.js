import { prisma } from "../config/prisma.js";

export const createReview = async (req, res) => {
  try {
    const { rating, comment, productId, serviceId } = req.body;
    const user_id = req.user.user_id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    if (!comment || comment.trim() === "") {
      return res.status(400).json({ message: "Comment is required" });
    }

    if ((!productId && !serviceId) || (productId && serviceId)) {
      return res.status(400).json({ message: "Either productId or serviceId must be provided, but not both" });
    }

    if (productId) {
      const product = await prisma.products.findUnique({
        where: { product_id: parseInt(productId) },
      });

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
    }

    if (serviceId) {
      const service = await prisma.services.findUnique({
        where: { service_id: parseInt(serviceId) },
      });

      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
    }

    const review = await prisma.reviews.create({
      data: {
        user_id,
        rating: parseInt(rating),
        comment: comment.trim(),
        product_id: productId ? parseInt(productId) : null,
        service_id: serviceId ? parseInt(serviceId) : null,
      },
      include: {
        users: {
          select: {
            full_name: true,
            avatar_url: true,
          },
        },
      },
    });

    res.status(201).json(review);
  } catch (err) {
    console.error("Error creating review:", err);
    if (err.code === "P2002") {
      return res.status(409).json({ message: "You have already reviewed this item" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await prisma.reviews.findMany({
      where: { product_id: parseInt(productId) },
      include: {
        users: {
          select: {
            full_name: true,
            avatar_url: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    res.json(reviews);
  } catch (err) {
    console.error("Error fetching product reviews:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getServiceReviews = async (req, res) => {
  try {
    const { serviceId } = req.params;

    const reviews = await prisma.reviews.findMany({
      where: { service_id: parseInt(serviceId) },
      include: {
        users: {
          select: {
            full_name: true,
            avatar_url: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    res.json(reviews);
  } catch (err) {
    console.error("Error fetching service reviews:", err);
    res.status(500).json({ message: "Server error" });
  }
};

