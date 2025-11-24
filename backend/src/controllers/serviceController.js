import { prisma } from "../config/prisma.js";

export const createService = async (req, res) => {
  try {
    const { name, description, price, duration, category } = req.body;
    const vendor_id = req.vendor.vendor_id;

    if (!name || !price) {
      return res.status(400).json({ message: "Missing required fields: name, price" });
    }

    const service = await prisma.services.create({
      data: {
        vendor_id,
        name,
        description: description || null,
        price: parseFloat(price),
        duration: duration ? parseInt(duration) : null,
        category: category || null,
      },
    });

    res.status(201).json(service);
  } catch (err) {
    console.error("Error creating service:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const vendor_id = req.vendor.vendor_id;
    const { name, description, price, duration, category } = req.body;

    const existingService = await prisma.services.findFirst({
      where: {
        service_id: parseInt(id),
        vendor_id,
      },
    });

    if (!existingService) {
      return res.status(404).json({ message: "Service not found or unauthorized" });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (duration !== undefined) updateData.duration = duration ? parseInt(duration) : null;
    if (category !== undefined) updateData.category = category;

    const updatedService = await prisma.services.update({
      where: { service_id: parseInt(id) },
      data: updateData,
    });

    res.json(updatedService);
  } catch (err) {
    console.error("Error updating service:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getVendorServices = async (req, res) => {
  try {
    const vendor_id = req.vendor.vendor_id;

    const services = await prisma.services.findMany({
      where: { vendor_id },
      orderBy: { created_at: "desc" },
    });

    res.json(services);
  } catch (err) {
    console.error("Error fetching vendor services:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllServices = async (req, res) => {
  try {
    const services = await prisma.services.findMany({
      include: {
        vendors: {
          select: { store_name: true },
        },
      },
      orderBy: { created_at: "desc" },
    });

    res.json(services);
  } catch (err) {
    console.error("Error fetching services:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await prisma.services.findUnique({
      where: { service_id: parseInt(id) },
      include: {
        vendors: {
          select: {
            vendor_id: true,
            name: true,
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

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.json(service);
  } catch (err) {
    console.error("Error fetching service:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const vendor_id = req.vendor.vendor_id;

    const service = await prisma.services.findFirst({
      where: {
        service_id: parseInt(id),
        vendor_id,
      },
    });

    if (!service) {
      return res.status(404).json({ message: "Service not found or unauthorized" });
    }

    await prisma.services.delete({
      where: { service_id: parseInt(id) },
    });

    res.json({ message: "Service deleted successfully" });
  } catch (err) {
    console.error("Error deleting service:", err);
    res.status(500).json({ message: "Server error" });
  }
};

