import { prisma } from '../config/prisma.js';

export const vaccineService = {
  async getVaccinesBySpecies(species) {
    try {
      const normalizedSpecies = species ? species.toLowerCase().trim() : '';
      console.log('Fetching vaccines for species:', normalizedSpecies);
      
      const vaccines = await prisma.vaccine.findMany({
        where: {
          species: normalizedSpecies,
          is_active: true,
        },
        orderBy: {
          name: 'asc',
        },
      });
      
      console.log(`Found ${vaccines.length} vaccines for species ${normalizedSpecies}`);
      return vaccines;
    } catch (error) {
      console.error('Error fetching vaccines by species:', error);
      throw error;
    }
  },

  async getVaccineSchedule(vaccineId) {
    try {
      const schedules = await prisma.vaccineDoseSchedule.findMany({
        where: {
          vaccine_id: vaccineId,
        },
        orderBy: {
          dose_number: 'asc',
        },
      });
      return schedules;
    } catch (error) {
      console.error('Error fetching vaccine schedule:', error);
      throw error;
    }
  },

  async getVaccineById(vaccineId) {
    try {
      const vaccine = await prisma.vaccine.findUnique({
        where: {
          vaccine_id: vaccineId,
        },
        include: {
          dose_schedules: {
            orderBy: {
              dose_number: 'asc',
            },
          },
        },
      });
      return vaccine;
    } catch (error) {
      console.error('Error fetching vaccine by ID:', error);
      throw error;
    }
  },

  calculateNextDoseDate(currentDoseNumber, vaccineId, currentDate) {
    return new Promise(async (resolve, reject) => {
      try {
        const schedules = await this.getVaccineSchedule(vaccineId);
        
        if (!schedules || schedules.length === 0) {
          resolve(null);
          return;
        }

        const currentSchedule = schedules.find(s => s.dose_number === currentDoseNumber);
        if (!currentSchedule) {
          resolve(null);
          return;
        }

        const nextSchedule = schedules.find(s => s.dose_number === currentDoseNumber + 1);
        if (!nextSchedule) {
          resolve(null);
          return;
        }

        const currentDateObj = new Date(currentDate);
        const nextDate = new Date(currentDateObj);
        nextDate.setDate(nextDate.getDate() + nextSchedule.days_after_previous);

        resolve({
          doseNumber: nextSchedule.dose_number,
          date: nextDate,
          isBooster: nextSchedule.is_booster,
          notes: nextSchedule.notes,
        });
      } catch (error) {
        console.error('Error calculating next dose date:', error);
        reject(error);
      }
    });
  },

  async getFutureDoses(vaccineId, currentDoseNumber, currentDate) {
    try {
      const schedules = await this.getVaccineSchedule(vaccineId);
      
      if (!schedules || schedules.length === 0) {
        return [];
      }

      const futureDoses = [];
      const currentDateObj = new Date(currentDate);
      let lastDate = currentDateObj;

      for (const schedule of schedules) {
        if (schedule.dose_number > currentDoseNumber) {
          const doseDate = new Date(lastDate);
          doseDate.setDate(doseDate.getDate() + schedule.days_after_previous);
          
          futureDoses.push({
            doseNumber: schedule.dose_number,
            date: doseDate,
            isBooster: schedule.is_booster,
            notes: schedule.notes,
            daysAfterPrevious: schedule.days_after_previous,
          });

          lastDate = doseDate;
        }
      }

      return futureDoses;
    } catch (error) {
      console.error('Error getting future doses:', error);
      throw error;
    }
  },
};

export default vaccineService;

