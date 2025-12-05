import { prisma } from "../config/prisma.js";
import path from "path";
import fs from "fs";
import { normalizeObjectEncoding } from "../utils/encodingHelper.js";

export const createProduct = async (req, res) => {
  try {
    console.log("=== CREATE PRODUCT DEBUG ===");
    console.log("Request body:", req.body);
    console.log("Request files:", req.files ? `${req.files.length} files` : "No files");
    console.log("Vendor:", req.vendor);
    
    if (!req.vendor || !req.vendor.vendor_id) {
      console.error("❌ Vendor not found in request");
      return res.status(403).json({ message: "Vendor access required" });
    }

    const { name, description, price, stock, category } = req.body;
    const vendor_id = req.vendor.vendor_id;

    console.log("Parsed data:", { name, description, price, stock, category, vendor_id });

    if (!name || !price || stock === undefined) {
      return res.status(400).json({ message: "Missing required fields: name, price, stock" });
    }

    const productData = {
      vendor_id,
      name: name.trim(),
      description: description ? description.trim() : null,
      price: parseFloat(price),
      stock: parseInt(stock),
      category: category ? category.trim() : null,
      status: 'PENDING', // Set status PENDING khi tạo mới
    };

    console.log("Creating product with data:", productData);

    const product = await prisma.products.create({
      data: productData,
    });

    console.log("✅ Product created:", product.product_id);

    if (req.files && req.files.length > 0) {
      console.log(`Processing ${req.files.length} images...`);
      const imageData = req.files.map((file, index) => ({
        product_id: product.product_id,
        image_url: `/uploads/${file.filename}`,
        is_thumbnail: index === 0,
      }));

      console.log("Image data to insert:", imageData);

      await prisma.product_images.createMany({
        data: imageData,
      });

      console.log("✅ Images saved to database");
    }

    const createdProduct = await prisma.products.findUnique({
      where: { product_id: product.product_id },
      include: { product_images: true },
    });

    console.log("✅ Product fetch complete");
    res.status(201).json(createdProduct);
  } catch (err) {
    console.error("❌ Error creating product:");
    console.error("Error name:", err.name);
    console.error("Error message:", err.message);
    console.error("Error code:", err.code);
    console.error("Error meta:", err.meta);
    console.error("Full error:", err);
    
    if (err.code === "P2003") {
      return res.status(400).json({ 
        message: "Invalid vendor_id or foreign key constraint violation",
        error: err.meta 
      });
    }
    
    if (err.code === "P2002") {
      return res.status(400).json({ 
        message: "Duplicate entry violation",
        error: err.meta 
      });
    }
    
    res.status(500).json({ 
      message: "Server error: " + err.message,
      error: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const vendor_id = req.vendor.vendor_id;
    const { name, description, price, stock, category } = req.body;

    const existingProduct = await prisma.products.findFirst({
      where: {
        product_id: parseInt(id),
        vendor_id,
      },
    });

    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found or unauthorized" });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (stock !== undefined) updateData.stock = parseInt(stock);
    if (category !== undefined) updateData.category = category;
    
    // Nếu thay đổi thông tin quan trọng (name, price, category), set lại status = PENDING
    const importantFieldsChanged = 
      (name !== undefined && name !== existingProduct.name) ||
      (price !== undefined && parseFloat(price) !== parseFloat(existingProduct.price)) ||
      (category !== undefined && category !== existingProduct.category);
    
    if (importantFieldsChanged && existingProduct.status === 'APPROVED') {
      updateData.status = 'PENDING';
      updateData.rejection_reason = null; // Clear rejection reason if any
    }

    const updatedProduct = await prisma.products.update({
      where: { product_id: parseInt(id) },
      data: updateData,
      include: { product_images: true },
    });

    if (req.files && req.files.length > 0) {
      const imageData = req.files.map((file, index) => ({
        product_id: parseInt(id),
        image_url: `/uploads/${file.filename}`,
        is_thumbnail: index === 0,
      }));

      await prisma.product_images.createMany({
        data: imageData,
      });
    }

    const finalProduct = await prisma.products.findUnique({
      where: { product_id: parseInt(id) },
      include: { product_images: true },
    });

    res.json(finalProduct);
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getVendorProducts = async (req, res) => {
  try {
    const vendor_id = req.vendor.vendor_id;

    const products = await prisma.products.findMany({
      where: { vendor_id },
      include: {
        product_images: true,
      },
      orderBy: { created_at: "desc" },
    });

    const normalizedProducts = normalizeObjectEncoding(products);
    res.json(normalizedProducts);
  } catch (err) {
    console.error("Error fetching vendor products:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const products = await prisma.products.findMany({
      where: {
        stock: { gt: 0 },
        status: 'APPROVED',
      },
      include: {
        product_images: {
          orderBy: [
            { is_thumbnail: "desc" },
            { id: "asc" },
          ],
        },
        vendors: {
          select: { store_name: true },
        },
      },
      orderBy: { created_at: "desc" },
    });

    const normalizedProducts = normalizeObjectEncoding(products);
    res.json(normalizedProducts);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.products.findUnique({
      where: { product_id: parseInt(id) },
      include: {
        product_images: true,
        vendors: {
          select: {
            vendor_id: true,
            store_name: true,
          },
        },
        reviews: {
          include: {
            users: {
              select: {
                full_name: true,
                avatar_url: true,
              },
            },
          },
          orderBy: { created_at: "desc" },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const normalizedProduct = normalizeObjectEncoding(product);
    res.json(normalizedProduct);
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const vendor_id = req.vendor.vendor_id;

    const product = await prisma.products.findFirst({
      where: {
        product_id: parseInt(id),
        vendor_id,
      },
      include: { product_images: true },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found or unauthorized" });
    }

    for (const image of product.product_images) {
      const imagePath = path.join(process.cwd(), image.image_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await prisma.products.delete({
      where: { product_id: parseInt(id) },
    });

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ message: "Server error" });
  }
};

