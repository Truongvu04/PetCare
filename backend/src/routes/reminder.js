import express from 'express';
import { Prisma } from '@prisma/client';
import { verifyToken } from '../middleware/authMiddleware.js';
import { prisma } from '../config/prisma.js'; // <--- THÊM DÒNG NÀY ĐỂ FIX LỖI CRASH

let ReminderTypeEnum = Prisma.ReminderType || Prisma.RemindersType || {};
let ReminderFrequencyEnum = Prisma.ReminderFrequency || Prisma.ReminderFrequencies || {};
let ReminderStatusEnum = Prisma.ReminderStatus || Prisma.ReminderStatuses || {};

const router = express.Router();

let ALLOWED_FREQUENCIES = Object.values(ReminderFrequencyEnum || {});
let ALLOWED_TYPES = Object.values(ReminderTypeEnum || {});
let ALLOWED_STATUS = Object.values(ReminderStatusEnum || {});

// Fallbacks when Prisma enums are not available at runtime
if (!Array.isArray(ALLOWED_TYPES) || ALLOWED_TYPES.length === 0) {
    ALLOWED_TYPES = ['vaccination', 'vet_visit', 'checkup', 'feeding', 'grooming', 'medication', 'other'];
}
if (!Array.isArray(ALLOWED_FREQUENCIES) || ALLOWED_FREQUENCIES.length === 0) {
    ALLOWED_FREQUENCIES = ['none', 'daily', 'weekly', 'monthly', 'yearly'];
}
if (!Array.isArray(ALLOWED_STATUS) || ALLOWED_STATUS.length === 0) {
    ALLOWED_STATUS = ['pending', 'success', 'fail', 'cancelled'];
}
const VIETNAM_OFFSET_HOURS = 7;

// 3. HELPERS 
function isValidDateString(dateStr) {
    if (!dateStr) return false;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
    const d = new Date(dateStr + 'T00:00:00Z'); 
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === dateStr;
}
function isValidTimeString(timeStr) {
    if (!timeStr) return false;
    return /^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(timeStr);
}
function humanizeType(dbType) {
     switch (dbType) {
        case 'vaccination': return 'Vaccination';
        case 'vet_visit': return 'Vet Visit'; 
        case 'checkup': return 'Check-up';
        case 'feeding': return 'Feeding';
        case 'grooming': return 'Grooming';
        case 'medication': return 'Medication';
        default: return dbType ? dbType.charAt(0).toUpperCase() + dbType.slice(1) : 'Reminder';
    }
}

function calculateDisplayFields(reminder) {
    const petName = reminder.pet?.name || 'Pet'; 
    const humanType = humanizeType(reminder.type);
    let display_title = `${petName}’s ${humanType}`;

    if (reminder.type === 'vaccination' && reminder.vaccination_type) {
        display_title += `: ${reminder.vaccination_type}`;
    }

    let subtitle = 'Date not set';

    const todayUTC = new Date();
    todayUTC.setUTCHours(0, 0, 0, 0);
    const todayUTCStr = todayUTC.toISOString().slice(0, 10);

    let reminderIsToday = false; 

    if (reminder.reminder_date) {
        const reminderDateStr = reminder.reminder_date.toISOString().slice(0, 10);
        const reminderUTCStart = reminder.reminder_date; 

        if (reminderDateStr === todayUTCStr) {
            subtitle = 'Due today';
            reminderIsToday = true; 
        } else if (reminderUTCStart > todayUTC) {
            const diffTime = reminderUTCStart.getTime() - todayUTC.getTime();
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
            subtitle = `Due in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
        } else { 
            const diffTime = todayUTC.getTime() - reminderUTCStart.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            subtitle = `Overdue by ${diffDays || 1} day${(diffDays || 1) > 1 ? 's' : ''}`;
        }
    }

    if (reminder.type === 'feeding' && reminder.feeding_time) {
        const timeObj = reminder.feeding_time; 
        let displayTime = "??:??";
        if (timeObj && !Number.isNaN(timeObj.getTime())) {
            const localTime = new Date(timeObj.getTime() + (VIETNAM_OFFSET_HOURS * 60 * 60 * 1000));
            const hours = localTime.getUTCHours().toString().padStart(2, '0');
            const minutes = localTime.getUTCMinutes().toString().padStart(2, '0');
            displayTime = `${hours}:${minutes}`;
        }
        
        if (subtitle.startsWith("Due today")) {
             subtitle = `Due today at ${displayTime}`;
        } else if (reminder.frequency === 'daily') {
             subtitle = `Daily at ${displayTime}`;
        }
    }
   
    let reminderWasCreatedToday = false;
    if (reminder.created_at) { 
        const createdDateStr = reminder.created_at.toISOString().slice(0, 10);
        if (createdDateStr === todayUTCStr) {
            reminderWasCreatedToday = true;
        }
    }
    
    const is_new_today = (reminder.is_read === false && (reminderIsToday || reminderWasCreatedToday));

    return { 
        display_title, 
        subtitle, 
        is_new_today, 
        is_read: !!reminder.is_read 
    };
}

// --- API Routes ---

router.post('/', verifyToken, async (req, res) => {
    try {
        const {
            pet_id, type, vaccination_type, feeding_time, reminder_date, frequency = 'none',
            end_date
        } = req.body;
        const user_id = req.user.user_id;

        if (!pet_id || !type) {
            return res.status(400).json({ error: 'Missing required fields (pet_id, type)' });
        }
        const pet = await prisma.pet.findFirst({
            where: { id: pet_id, user_id }
        });
        if (!pet) {
            return res.status(404).json({ error: 'Pet not found or unauthorized' });
        }
        if (!ALLOWED_TYPES.includes(type)) {
            return res.status(400).json({ error: `Invalid type: ${type}.` });
        }
        if (!ALLOWED_FREQUENCIES.includes(frequency)) {
            return res.status(400).json({ error: 'Invalid frequency.' });
        }

        let feedingTimeObj = null;
        let finalReminderDate;
        let finalVaccinationType = null;

        const todayUTC = new Date();
        todayUTC.setUTCHours(0, 0, 0, 0);

        if (type === 'feeding') {
            if (!isValidTimeString(feeding_time)) {
                 return res.status(400).json({ error: 'Missing or invalid feeding_time (HH:MM format)' });
            }
            const [hours, minutes] = feeding_time.split(':');
            const localHours = parseInt(hours);
            const localMinutes = parseInt(minutes);
            const timeObj = new Date(Date.UTC(1970, 0, 1, localHours, localMinutes));
            timeObj.setUTCHours(timeObj.getUTCHours() - VIETNAM_OFFSET_HOURS);
            feedingTimeObj = timeObj; 
            
            if (frequency === 'none' && reminder_date) {
                 if (!isValidDateString(reminder_date)) {
                     return res.status(400).json({ error: 'reminder_date must be a valid date in YYYY-MM-DD format for one-time feeding' });
                 }
                 finalReminderDate = new Date(reminder_date + 'T00:00:00Z');
            } else if (frequency === 'none' && !reminder_date) {
                finalReminderDate = todayUTC;
            } else {
                finalReminderDate = todayUTC;
            }

        } else {
            if (!isValidDateString(reminder_date)) {
                return res.status(400).json({ error: 'reminder_date must be a valid date in YYYY-MM-DD format' });
            }
            finalReminderDate = new Date(reminder_date + 'T00:00:00Z');
            feedingTimeObj = null; 
            if (type === 'vaccination' && vaccination_type) {
                finalVaccinationType = vaccination_type;
            }
        }
        
        let validEndDate = null;
        if (end_date) {
            if (!isValidDateString(end_date)) {
                 return res.status(400).json({ error: 'end_date must be a valid date in YYYY-MM-DD format' });
            }
            if (frequency === 'none') {
                 return res.status(400).json({ error: 'end_date cannot be set for non-repeating reminders' });
            }
            validEndDate = new Date(end_date + 'T00:00:00Z');
            if (validEndDate < finalReminderDate) {
                return res.status(400).json({ error: 'end_date cannot be before the reminder_date' });
            }
        }

        /** @type {import('@prisma/client').ReminderFrequency} */
        const validatedFrequency = frequency;

        const newReminder = await prisma.reminder.create({
            data: {
                pet_id: pet_id,
                type: type,
                vaccination_type: finalVaccinationType,
                feeding_time: feedingTimeObj,
                reminder_date: finalReminderDate,
                frequency: validatedFrequency, 
                status: 'pending', // use literal string to avoid enum runtime issues
                end_date: validEndDate,
                is_read: false, 
                is_instance: false,
                email_sent: false
            },
            include: {
                pet: { select: { name: true } } 
            }
        });

        const displayData = calculateDisplayFields(newReminder);
        res.status(201).json({ ...newReminder, ...displayData });


    } catch (err) {
        console.error('POST /api/reminders error (Prisma):', err);
        if (err.code === 'P2002') {
             return res.status(409).json({ error: 'A similar reminder for this pet already exists.' });
        }
        res.status(500).json({ error: 'Internal server error while creating reminder.' });
    }
});


router.get('/', verifyToken, async (req, res) => {
     try {
        const user_id = req.user.user_id;
        const allReminders = await prisma.reminder.findMany({
            where: {
                pet: { user_id },
                status: 'pending' 
            },
            include: { pet: { select: { name: true } } },
            orderBy: [
                { reminder_date: 'asc' },
                { feeding_time: 'asc' },
                { created_at: 'desc' }
            ]
        });

        const todayUTC = new Date();
        todayUTC.setUTCHours(0, 0, 0, 0);
        const tomorrowUTC = new Date(todayUTC);
        tomorrowUTC.setUTCDate(tomorrowUTC.getUTCDate() + 1);

        const activeInstances = allReminders.filter(r => 
            r.is_instance === true &&
            (
                (r.type === 'feeding' && r.reminder_date.getTime() === todayUTC.getTime()) ||
                (r.type !== 'feeding' && r.created_at >= todayUTC && r.created_at < tomorrowUTC)
            )
        );

        const filteredReminders = allReminders.filter(r => {
            if (r.is_instance === true) { return true; }

            if (r.type === 'feeding' && r.frequency === 'daily') {
                const hasActiveInstance = activeInstances.some(inst => 
                    inst.pet_id === r.pet_id &&
                    inst.type === 'feeding' &&
                    inst.feeding_time?.getTime() === r.feeding_time?.getTime()
                );
                return !hasActiveInstance; 
            }
            
            if (r.type !== 'feeding' && r.frequency !== 'none') { 
                 const hasActiveInstance = activeInstances.some(inst => 
                    inst.pet_id === r.pet_id &&
                    inst.type === r.type &&
                    inst.vaccination_type === r.vaccination_type
                );
                 return !hasActiveInstance;
            }
            
            return true; 
        });
        
        const enriched = filteredReminders.map(r => ({ ...r, ...calculateDisplayFields(r) }));
        
        enriched.sort((a, b) => {
             if (a.is_instance && b.is_instance && a.type !== 'feeding' && b.type !== 'feeding') {
                 return b.created_at.getTime() - a.created_at.getTime();
             }
             if (a.subtitle.startsWith('Overdue') && !b.subtitle.startsWith('Overdue')) return -1;
             if (!a.subtitle.startsWith('Overdue') && b.subtitle.startsWith('Overdue')) return 1;
             if (a.subtitle.startsWith('Due today') && !b.subtitle.startsWith('Due today')) return -1;
             if (!a.subtitle.startsWith('Due today') && b.subtitle.startsWith('Due today')) return 1;
             if (a.feeding_time && b.feeding_time) {
                return a.feeding_time.getTime() - b.feeding_time.getTime();
             }
             return 0; 
        });

        return res.status(200).json(enriched);
    } catch (err) {
        console.error('GET /api/reminders error (Prisma):', err);
        res.status(500).json({ error: 'Internal server error while fetching reminders' });
    }
});


router.put('/:reminderId', verifyToken, async (req, res) => {
    try {
        const reminderId = req.params.reminderId;
        const user_id = req.user.user_id;
        const { vaccination_type, feeding_time, reminder_date, status, frequency, is_read, end_date } = req.body;

        const existingReminder = await prisma.reminder.findFirst({
            where: { reminder_id: reminderId, pet: { user_id } }
        });
        if (!existingReminder) {
            return res.status(404).json({ error: 'Reminder not found or unauthorized' });
        }
        
        const dataToUpdate = {};
        if (vaccination_type !== undefined) { dataToUpdate.vaccination_type = vaccination_type || null; }
        if (feeding_time !== undefined) {
            if (feeding_time === null) { dataToUpdate.feeding_time = null; }
            else if (isValidTimeString(feeding_time)) {
                const [hours, minutes] = feeding_time.split(':');
                const localHours = parseInt(hours); const localMinutes = parseInt(minutes);
                const timeObj = new Date(Date.UTC(1970, 0, 1, localHours, localMinutes));
                timeObj.setUTCHours(timeObj.getUTCHours() - VIETNAM_OFFSET_HOURS);
                dataToUpdate.feeding_time = timeObj;
            } else { return res.status(400).json({ error: 'Invalid feeding_time format' }); }
        }
        if (reminder_date !== undefined) {
            if (!isValidDateString(reminder_date)) { return res.status(400).json({ error: 'reminder_date must be a valid date' }); }
            dataToUpdate.reminder_date = new Date(reminder_date + 'T00:00:00Z');
        }
        if (status !== undefined) {
            if (!ALLOWED_STATUS.includes(status)) { return res.status(400).json({ error: 'Invalid status' }); }
            dataToUpdate.status = status;
        }
        if (frequency !== undefined) {
            if (!ALLOWED_FREQUENCIES.includes(frequency)) { return res.status(400).json({ error: 'Invalid frequency' }); }
            /** @type {import('@prisma/client').ReminderFrequency} */
            const validatedFreqUpdate = frequency;
            dataToUpdate.frequency = validatedFreqUpdate;
        }
        if (is_read !== undefined) {
             if (typeof is_read !== 'boolean') { return res.status(400).json({ error: 'is_read must be a boolean' }); }
            dataToUpdate.is_read = !!is_read;
        }
         if (end_date !== undefined) {
            if(end_date === null) { dataToUpdate.end_date = null; }
            else if (isValidDateString(end_date)) { dataToUpdate.end_date = new Date(end_date + 'T00:00:00Z'); }
            else { return res.status(400).json({ error: 'Invalid end_date format' }); }
        }

        if (Object.keys(dataToUpdate).length === 0) {
            return res.status(400).json({ error: 'No valid fields provided to update' });
        }

        const updatedReminder = await prisma.reminder.update({
            where: { reminder_id: reminderId },
            data: dataToUpdate,
            include: { pet: { select: { name: true } } }
        });

        const displayData = calculateDisplayFields(updatedReminder);
        return res.status(200).json({ ...updatedReminder, ...displayData });

    } catch (err) {
        console.error('PUT /api/reminders/:reminderId error (Prisma):', err);
        return res.status(500).json({ error: 'Internal server error during update.' });
    }
});

router.delete('/:reminderId', verifyToken, async (req, res) => {
    try {
        const reminderId = req.params.reminderId;
        const user_id = req.user.user_id;
        const deleteResult = await prisma.reminder.deleteMany({
            where: { reminder_id: reminderId, pet: { user_id } }
        });
        if (deleteResult.count === 0) {
             return res.status(404).json({ error: 'Reminder not found or unauthorized' });
        }
        return res.status(204).send();
    } catch (err) {
        console.error('DELETE /api/reminders/:reminderId error (Prisma):', err);
        return res.status(500).json({ error: 'Internal server error during deletion.' });
    }
});

router.put('/mark-read/today', verifyToken, async (req, res) => {
    try {
        const user_id = req.user.user_id;
        
        const todayUTC = new Date();
        todayUTC.setUTCHours(0, 0, 0, 0); 
        const tomorrowUTC = new Date(todayUTC);
        tomorrowUTC.setUTCDate(tomorrowUTC.getUTCDate() + 1);
        
        const result = await prisma.reminder.updateMany({
            where: {
                pet: { user_id }, 
                is_read: false,
                status: 'pending', 
                OR: [
                    { reminder_date: todayUTC },
                    { created_at: { gte: todayUTC, lt: tomorrowUTC } }
                ]
            },
            data: {
                is_read: true 
            }
        });

        console.log(`[INFO] User ${user_id} marked ${result.count} new reminders as read.`);
        return res.status(200).json({ message: `Successfully marked ${result.count} new reminders as read.` });

    } catch (err) {
         console.error('PUT /mark-read/today error (Prisma):', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
