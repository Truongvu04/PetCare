import { prisma } from "../config/prisma.js";
import crypto from "crypto";

// Create health record
export const createHealthRecord = async (req, res) => {
  try {
    const { pet_id, record_type, value, vaccination_name, health_note, record_date } = req.body;
    const user_id = req.user.user_id;

    if (!pet_id || !record_type) {
      return res.status(400).json({ error: "Missing required fields: pet_id, record_type" });
    }

    // Validate record_type
    const validTypes = ["weight", "vaccination", "health_note"];
    if (!validTypes.includes(record_type)) {
      return res.status(400).json({ error: "Invalid record_type. Must be: weight, vaccination, or health_note" });
    }

    // Verify pet belongs to user
    const pet = await prisma.pet.findFirst({
      where: { id: pet_id, user_id },
    });

    if (!pet) {
      return res.status(404).json({ error: "Pet not found or unauthorized" });
    }

    // Validate based on record_type
    if (record_type === "weight") {
      if (!value || parseFloat(value) <= 0) {
        return res.status(400).json({ error: "Weight value must be greater than 0" });
      }
    } else if (record_type === "vaccination") {
      if (!vaccination_name || vaccination_name.trim() === "") {
        return res.status(400).json({ error: "vaccination_name is required for vaccination records" });
      }
    } else if (record_type === "health_note") {
      if (!health_note || health_note.trim() === "") {
        return res.status(400).json({ error: "health_note is required for health note records" });
      }
    }

    // Validate date
    const recordDate = record_date ? new Date(record_date) : new Date();
    if (isNaN(recordDate.getTime())) {
      return res.status(400).json({ error: "Invalid record_date format" });
    }

    const healthRecord = await prisma.healthRecord.create({
      data: {
        id: crypto.randomBytes(12).toString("hex"),
        pet_id,
        record_type,
        value: record_type === "weight" ? parseFloat(value) : null,
        vaccination_name: record_type === "vaccination" ? vaccination_name : null,
        health_note: record_type === "health_note" ? health_note : null,
        record_date: recordDate,
      },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
          },
        },
      },
    });

    res.status(201).json(healthRecord);
  } catch (err) {
    console.error("Error creating health record:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all health records for a pet
export const getHealthRecords = async (req, res) => {
  try {
    const { petId } = req.params;
    const { record_type } = req.query;
    const user_id = req.user.user_id;

    // Verify pet belongs to user
    const pet = await prisma.pet.findFirst({
      where: { id: petId, user_id },
    });

    if (!pet) {
      return res.status(404).json({ error: "Pet not found or unauthorized" });
    }

    const where = {
      pet_id: petId,
    };

    if (record_type) {
      const validTypes = ["weight", "vaccination", "health_note"];
      if (!validTypes.includes(record_type)) {
        return res.status(400).json({ error: "Invalid record_type" });
      }
      where.record_type = record_type;
    }

    const records = await prisma.healthRecord.findMany({
      where,
      orderBy: {
        record_date: "desc",
      },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
          },
        },
      },
    });

    res.json(records);
  } catch (err) {
    console.error("Error fetching health records:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get weight history
export const getWeightHistory = async (req, res) => {
  try {
    const { petId } = req.params;
    const user_id = req.user.user_id;

    const pet = await prisma.pet.findFirst({
      where: { id: petId, user_id },
    });

    if (!pet) {
      return res.status(404).json({ error: "Pet not found or unauthorized" });
    }

    const records = await prisma.healthRecord.findMany({
      where: {
        pet_id: petId,
        record_type: "weight",
      },
      orderBy: {
        record_date: "asc",
      },
      select: {
        id: true,
        value: true,
        record_date: true,
        created_at: true,
      },
    });

    res.json(records);
  } catch (err) {
    console.error("Error fetching weight history:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get vaccination history
export const getVaccinationHistory = async (req, res) => {
  try {
    const { petId } = req.params;
    const user_id = req.user.user_id;

    const pet = await prisma.pet.findFirst({
      where: { id: petId, user_id },
    });

    if (!pet) {
      return res.status(404).json({ error: "Pet not found or unauthorized" });
    }

    const records = await prisma.healthRecord.findMany({
      where: {
        pet_id: petId,
        record_type: "vaccination",
      },
      orderBy: {
        record_date: "desc",
      },
      select: {
        id: true,
        vaccination_name: true,
        record_date: true,
        created_at: true,
      },
    });

    res.json(records);
  } catch (err) {
    console.error("Error fetching vaccination history:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update health record
export const updateHealthRecord = async (req, res) => {
  try {
    const { recordId } = req.params;
    const { value, vaccination_name, health_note, record_date } = req.body;
    const user_id = req.user.user_id;

    // Find record and verify ownership
    const existingRecord = await prisma.healthRecord.findFirst({
      where: { id: recordId },
      include: {
        pet: {
          select: {
            user_id: true,
          },
        },
      },
    });

    if (!existingRecord) {
      return res.status(404).json({ error: "Health record not found" });
    }

    if (existingRecord.pet.user_id !== user_id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const updateData = {};
    if (existingRecord.record_type === "weight" && value !== undefined) {
      if (parseFloat(value) <= 0) {
        return res.status(400).json({ error: "Weight value must be greater than 0" });
      }
      updateData.value = parseFloat(value);
    } else if (existingRecord.record_type === "vaccination" && vaccination_name !== undefined) {
      updateData.vaccination_name = vaccination_name;
    } else if (existingRecord.record_type === "health_note" && health_note !== undefined) {
      updateData.health_note = health_note;
    }

    if (record_date !== undefined) {
      const recordDate = new Date(record_date);
      if (isNaN(recordDate.getTime())) {
        return res.status(400).json({ error: "Invalid record_date format" });
      }
      updateData.record_date = recordDate;
    }

    const updatedRecord = await prisma.healthRecord.update({
      where: { id: recordId },
      data: updateData,
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
          },
        },
      },
    });

    res.json(updatedRecord);
  } catch (err) {
    console.error("Error updating health record:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete health record
export const deleteHealthRecord = async (req, res) => {
  try {
    const { recordId } = req.params;
    const user_id = req.user.user_id;

    const existingRecord = await prisma.healthRecord.findFirst({
      where: { id: recordId },
      include: {
        pet: {
          select: {
            user_id: true,
          },
        },
      },
    });

    if (!existingRecord) {
      return res.status(404).json({ error: "Health record not found" });
    }

    if (existingRecord.pet.user_id !== user_id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await prisma.healthRecord.delete({
      where: { id: recordId },
    });

    res.status(204).send();
  } catch (err) {
    console.error("Error deleting health record:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

