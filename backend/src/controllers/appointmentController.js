import { prisma } from "../config/prisma.js";

export const createAppointment = async (req, res) => {
  try {
    const { service_id, appointment_date, notes } = req.body;
    const user_id = req.user.user_id;

    if (!service_id || !appointment_date) {
      return res.status(400).json({ message: "Missing required fields: service_id, appointment_date" });
    }

    const service = await prisma.services.findUnique({
      where: { service_id: parseInt(service_id) },
    });

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    const appointment = await prisma.service_appointments.create({
      data: {
        user_id,
        service_id: parseInt(service_id),
        appointment_date: new Date(appointment_date),
        notes: notes || null,
        status: "pending",
      },
      include: {
        services: true,
        users: {
          select: {
            full_name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    res.status(201).json(appointment);
  } catch (err) {
    console.error("Error creating appointment:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getCustomerAppointments = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    const appointments = await prisma.service_appointments.findMany({
      where: { user_id },
      include: {
        services: {
          include: {
            vendors: {
              select: {
                store_name: true,
              },
            },
          },
        },
      },
      orderBy: { appointment_date: "desc" },
    });

    res.json(appointments);
  } catch (err) {
    console.error("Error fetching customer appointments:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getVendorAppointments = async (req, res) => {
  try {
    const vendor_id = req.vendor.vendor_id;

    const appointments = await prisma.service_appointments.findMany({
      where: {
        services: {
          vendor_id,
        },
      },
      include: {
        services: true,
        users: {
          select: {
            full_name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { appointment_date: "desc" },
    });

    res.json(appointments);
  } catch (err) {
    console.error("Error fetching vendor appointments:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const vendor_id = req.vendor.vendor_id;

    const validStatuses = ["pending", "confirmed", "completed", "cancelled"];

    if (!status || !validStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const appointment = await prisma.service_appointments.findFirst({
      where: {
        appointment_id: parseInt(id),
        services: {
          vendor_id,
        },
      },
    });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found or unauthorized" });
    }

    const updatedAppointment = await prisma.service_appointments.update({
      where: { appointment_id: parseInt(id) },
      data: { status: status.toLowerCase() },
      include: {
        services: true,
        users: {
          select: {
            full_name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    res.json(updatedAppointment);
  } catch (err) {
    console.error("Error updating appointment status:", err);
    res.status(500).json({ message: "Server error" });
  }
};

