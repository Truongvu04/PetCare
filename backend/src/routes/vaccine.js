import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import {
  getVaccinesBySpecies,
  getVaccineSchedule,
  getVaccineById,
  getAllVaccines,
  createVaccine,
  updateVaccine,
  deleteVaccine,
} from '../controllers/vaccineController.js';

const router = express.Router();

// Public route: Get vaccines by species (for users selecting vaccines)
// Admin route: Get all vaccines (requires authentication)
router.get('/', (req, res, next) => {
  if (req.query.species) {
    // Public route - no auth required
    return getVaccinesBySpecies(req, res, next);
  }
  // Admin route - requires authentication
  // Apply verifyToken middleware first
  verifyToken(req, res, (err) => {
    if (err) {
      return next(err);
    }
    // After authentication, call getAllVaccines
    return getAllVaccines(req, res, next);
  });
});

router.get('/:vaccineId', getVaccineById);
router.get('/:vaccineId/schedule', getVaccineSchedule);
router.post('/', verifyToken, createVaccine);
router.put('/:vaccineId', verifyToken, updateVaccine);
router.delete('/:vaccineId', verifyToken, deleteVaccine);

export default router;

