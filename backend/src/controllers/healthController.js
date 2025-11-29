import { prisma } from "../config/prisma.js";

/**
 * Create health record
 * POST /api/health
 */
export const createHealthRecord = async (req, res) => {
  try {
    const { pet_id, record_type, value, vaccination_name, health_note, record_date } = req.body;
    const userId = req.user.user_id;

    // Validate pet ownership
    const pet = await prisma.pet.findFirst({
      where: {
        id: pet_id,
        user_id: userId,
      },
    });

    if (!pet) {
      return res.status(404).json({ message: "Pet not found or you don't have permission" });
    }

    // Validate record type
    const validTypes = ["weight", "vaccination", "health_note"];
    if (!validTypes.includes(record_type)) {
      return res.status(400).json({ message: "Invalid record_type" });
    }

    // Validate based on record type
    if (record_type === "weight") {
      if (!value || parseFloat(value) <= 0) {
        return res.status(400).json({ message: "Weight must be greater than 0" });
      }
    } else if (record_type === "vaccination") {
      if (!vaccination_name || vaccination_name.trim() === "") {
        return res.status(400).json({ message: "Vaccination name is required" });
      }
    } else if (record_type === "health_note") {
      if (!health_note || health_note.trim() === "") {
        return res.status(400).json({ message: "Health note is required" });
      }
    }

    const record = await prisma.healthRecord.create({
      data: {
        pet_id,
        record_type,
        value: record_type === "weight" ? parseFloat(value) : null,
        vaccination_name: record_type === "vaccination" ? vaccination_name.trim() : null,
        health_note: record_type === "health_note" ? health_note.trim() : null,
        record_date: new Date(record_date),
      },
    });

    return res.status(201).json({
      success: true,
      record: record,
    });
  } catch (error) {
    console.error("Error in createHealthRecord:", error);
    return res.status(500).json({
      message: "Error creating health record",
      error: error.message,
    });
  }
};

/**
 * Get health records for a pet
 * GET /api/health/pet/:petId
 */
export const getHealthRecords = async (req, res) => {
  try {
    const { petId } = req.params;
    const { record_type } = req.query;
    const userId = req.user.user_id;

    // Validate pet ownership
    const pet = await prisma.pet.findFirst({
      where: {
        id: petId,
        user_id: userId,
      },
    });

    if (!pet) {
      return res.status(404).json({ message: "Pet not found or you don't have permission" });
    }

    const whereClause = { pet_id: petId };
    if (record_type) {
      whereClause.record_type = record_type;
    }

    const records = await prisma.healthRecord.findMany({
      where: whereClause,
      orderBy: {
        record_date: "desc",
      },
    });

    return res.json({
      success: true,
      records: records,
    });
  } catch (error) {
    console.error("Error in getHealthRecords:", error);
    return res.status(500).json({
      message: "Error fetching health records",
      error: error.message,
    });
  }
};

/**
 * Get weight history
 * GET /api/health/pet/:petId/weight
 */
export const getWeightHistory = async (req, res) => {
  try {
    const { petId } = req.params;
    const userId = req.user.user_id;

    // Validate pet ownership
    const pet = await prisma.pet.findFirst({
      where: {
        id: petId,
        user_id: userId,
      },
    });

    if (!pet) {
      return res.status(404).json({ message: "Pet not found or you don't have permission" });
    }

    const records = await prisma.healthRecord.findMany({
      where: {
        pet_id: petId,
        record_type: "weight",
      },
      orderBy: {
        record_date: "asc",
      },
    });

    return res.json({
      success: true,
      records: records,
    });
  } catch (error) {
    console.error("Error in getWeightHistory:", error);
    return res.status(500).json({
      message: "Error fetching weight history",
      error: error.message,
    });
  }
};

/**
 * Get vaccination history
 * GET /api/health/pet/:petId/vaccination
 */
export const getVaccinationHistory = async (req, res) => {
  try {
    const { petId } = req.params;
    const userId = req.user.user_id;

    // Validate pet ownership
    const pet = await prisma.pet.findFirst({
      where: {
        id: petId,
        user_id: userId,
      },
    });

    if (!pet) {
      return res.status(404).json({ message: "Pet not found or you don't have permission" });
    }

    const records = await prisma.healthRecord.findMany({
      where: {
        pet_id: petId,
        record_type: "vaccination",
      },
      orderBy: {
        record_date: "desc",
      },
    });

    return res.json({
      success: true,
      records: records,
    });
  } catch (error) {
    console.error("Error in getVaccinationHistory:", error);
    return res.status(500).json({
      message: "Error fetching vaccination history",
      error: error.message,
    });
  }
};

/**
 * Update health record
 * PUT /api/health/:recordId
 */
export const updateHealthRecord = async (req, res) => {
  try {
    const { recordId } = req.params;
    const { value, vaccination_name, health_note, record_date } = req.body;
    const userId = req.user.user_id;

    // Check if record exists and user owns the pet
    const record = await prisma.healthRecord.findFirst({
      where: {
        id: recordId,
        pet: {
          user_id: userId,
        },
      },
    });

    if (!record) {
      return res.status(404).json({ message: "Record not found or you don't have permission" });
    }

    const updateData = {};
    if (record.record_type === "weight" && value) {
      updateData.value = parseFloat(value);
    } else if (record.record_type === "vaccination" && vaccination_name) {
      updateData.vaccination_name = vaccination_name.trim();
    } else if (record.record_type === "health_note" && health_note) {
      updateData.health_note = health_note.trim();
    }
    if (record_date) {
      updateData.record_date = new Date(record_date);
    }

    const updatedRecord = await prisma.healthRecord.update({
      where: { id: recordId },
      data: updateData,
    });

    return res.json({
      success: true,
      record: updatedRecord,
    });
  } catch (error) {
    console.error("Error in updateHealthRecord:", error);
    return res.status(500).json({
      message: "Error updating health record",
      error: error.message,
    });
  }
};

/**
 * Delete health record
 * DELETE /api/health/:recordId
 */
export const deleteHealthRecord = async (req, res) => {
  try {
    const { recordId } = req.params;
    const userId = req.user.user_id;

    // Check if record exists and user owns the pet
    const record = await prisma.healthRecord.findFirst({
      where: {
        id: recordId,
        pet: {
          user_id: userId,
        },
      },
    });

    if (!record) {
      return res.status(404).json({ message: "Record not found or you don't have permission" });
    }

    await prisma.healthRecord.delete({
      where: { id: recordId },
    });

    return res.json({
      success: true,
      message: "Health record deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteHealthRecord:", error);
    return res.status(500).json({
      message: "Error deleting health record",
      error: error.message,
    });
  }
};



