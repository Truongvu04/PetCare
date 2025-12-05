import { vaccineService } from '../services/vaccineService.js';
import { prisma } from '../config/prisma.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { normalizeObjectEncoding } from '../utils/encodingHelper.js';
import crypto from 'crypto';

export const getVaccinesBySpecies = async (req, res) => {
  try {
    const { species } = req.query;
    
    if (!species) {
      return res.status(400).json({ error: 'Species parameter is required' });
    }

    const vaccines = await vaccineService.getVaccinesBySpecies(species);
    const normalizedVaccines = normalizeObjectEncoding(vaccines);
    return res.status(200).json(normalizedVaccines);
  } catch (error) {
    console.error('Error fetching vaccines by species:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getVaccineSchedule = async (req, res) => {
  try {
    const { vaccineId } = req.params;
    
    if (!vaccineId) {
      return res.status(400).json({ error: 'Vaccine ID is required' });
    }

    const schedule = await vaccineService.getVaccineSchedule(vaccineId);
    const normalizedSchedule = normalizeObjectEncoding(schedule);
    return res.status(200).json(normalizedSchedule);
  } catch (error) {
    console.error('Error fetching vaccine schedule:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getVaccineById = async (req, res) => {
  try {
    const { vaccineId } = req.params;
    
    if (!vaccineId) {
      return res.status(400).json({ error: 'Vaccine ID is required' });
    }

    const vaccine = await vaccineService.getVaccineById(vaccineId);
    
    if (!vaccine) {
      return res.status(404).json({ error: 'Vaccine not found' });
    }

    const normalizedVaccine = normalizeObjectEncoding(vaccine);
    return res.status(200).json(normalizedVaccine);
  } catch (error) {
    console.error('Error fetching vaccine:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const createVaccine = async (req, res) => {
  try {
    const user = req.user;
    
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { name, species, description, dose_schedules } = req.body;

    if (!name || !species) {
      return res.status(400).json({ error: 'Name and species are required' });
    }

    const vaccine = await prisma.vaccine.create({
      data: {
        name,
        species: species.toLowerCase(),
        description,
        dose_schedules: {
          create: dose_schedules || [],
        },
      },
      include: {
        dose_schedules: {
          orderBy: {
            dose_number: 'asc',
          },
        },
      },
    });

    return res.status(201).json(vaccine);
  } catch (error) {
    console.error('Error creating vaccine:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllVaccines = async (req, res) => {
  try {
    const user = req.user;
    
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const vaccines = await prisma.vaccine.findMany({
      include: {
        dose_schedules: {
          orderBy: {
            dose_number: 'asc',
          },
        },
      },
      orderBy: [
        { species: 'asc' },
        { name: 'asc' },
      ],
    });

    const normalizedVaccines = normalizeObjectEncoding(vaccines);
    return res.status(200).json(normalizedVaccines);
  } catch (error) {
    console.error('Error fetching all vaccines:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateVaccine = async (req, res) => {
  try {
    const user = req.user;
    
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { vaccineId } = req.params;
    const { name, species, description, is_active, dose_schedules } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (species) updateData.species = species.toLowerCase();
    if (description !== undefined) updateData.description = description;
    if (is_active !== undefined) updateData.is_active = is_active;

    const vaccine = await prisma.vaccine.update({
      where: {
        vaccine_id: vaccineId,
      },
      data: updateData,
      include: {
        dose_schedules: {
          orderBy: {
            dose_number: 'asc',
          },
        },
      },
    });

    if (dose_schedules && Array.isArray(dose_schedules)) {
      await prisma.vaccineDoseSchedule.deleteMany({
        where: { vaccine_id: vaccineId },
      });

      if (dose_schedules.length > 0) {
        await prisma.vaccineDoseSchedule.createMany({
          data: dose_schedules.map((schedule) => ({
            schedule_id: schedule.schedule_id || crypto.randomBytes(12).toString('hex').substring(0, 25),
            vaccine_id: vaccineId,
            dose_number: schedule.dose_number,
            days_after_previous: schedule.days_after_previous || 0,
            is_booster: schedule.is_booster || false,
            notes: schedule.notes || null,
          })),
        });
      }

      const updatedVaccine = await prisma.vaccine.findUnique({
        where: { vaccine_id: vaccineId },
        include: {
          dose_schedules: {
            orderBy: {
              dose_number: 'asc',
            },
          },
        },
      });

      return res.status(200).json(updatedVaccine);
    }

    return res.status(200).json(vaccine);
  } catch (error) {
    console.error('Error updating vaccine:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Vaccine not found' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteVaccine = async (req, res) => {
  try {
    const user = req.user;
    
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { vaccineId } = req.params;

    await prisma.vaccine.delete({
      where: {
        vaccine_id: vaccineId,
      },
    });

    return res.status(200).json({ message: 'Vaccine deleted successfully' });
  } catch (error) {
    console.error('Error deleting vaccine:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Vaccine not found' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};

