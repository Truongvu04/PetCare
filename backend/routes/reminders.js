// PetCare/backend/routes/reminders.js
const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Đảm bảo đường dẫn đúng
const crypto = require('crypto');

// --- Constants ---
const ALLOWED_FREQUENCIES = ['none', 'daily', 'weekly', 'monthly', 'yearly'];
// Đã thêm 'checkup'
const ALLOWED_TYPES = ['vaccination', 'vet_visit', 'feeding', 'grooming', 'medication', 'other', 'checkup'];
const ALLOWED_STATUS = ['pending', 'done'];
// Cập nhật TYPE_MAP
const TYPE_MAP = {
    'vaccination': 'vaccination', 'vaccinate': 'vaccination', 'vaccines': 'vaccination',
    'check-up': 'vet_visit', 'checkup': 'vet_visit', 'check up': 'vet_visit', 'vet_visit': 'vet_visit',
    'feeding': 'feeding', 'grooming': 'grooming', 'medication': 'medication', 'other': 'other'
};

// --- Helpers ---
// Hàm kiểm tra định dạng YYYY-MM-DD
function isValidDateString(dateStr) {
    if (!dateStr) return false;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
    const d = new Date(dateStr + 'T00:00:00Z'); // Coi chuỗi là UTC
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === dateStr;
}

// Hàm kiểm tra định dạng HH:MM hoặc HH:MM:SS
function isValidTimeString(timeStr) {
    if (!timeStr) return false;
    return /^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(timeStr);
}

// Hàm chuyển đổi type từ DB sang dạng hiển thị
function humanizeType(dbType) {
     switch (dbType) {
        case 'vaccination': return 'Vaccination';
        case 'vet_visit': return 'Vet Visit / Check-up';
        case 'feeding': return 'Feeding';
        case 'grooming': return 'Grooming';
        case 'medication': return 'Medication';
        default: return dbType ? dbType.charAt(0).toUpperCase() + dbType.slice(1) : 'Reminder';
    }
}

/**
 * Helper function: Tính toán display_title, subtitle, và is_new_today
 * Giả định reminder_date là chuỗi 'YYYY-MM-DD'. Dùng giờ local của server cho "today".
 * V3 - Dùng so sánh chuỗi ngày để tránh lỗi múi giờ.
 */
function calculateDisplayFields(reminder) {
    const petName = reminder.pet_name || 'Pet';
    const humanType = humanizeType(reminder.type);
    let display_title = `${petName}’s ${humanType}`;

    if (reminder.type === 'vaccination' && reminder.vaccination_type) {
        display_title += `: ${reminder.vaccination_type}`;
    }

    let subtitle = 'Date not set';
    let is_new_today = false;

    // --- Tính Subtitle dựa trên reminder_date (chuỗi) vs ngày 'hôm nay' (local của server) ---
    if (reminder.reminder_date && typeof reminder.reminder_date === 'string') {
        const reminderDateStr = reminder.reminder_date.slice(0, 10); // Đảm bảo YYYY-MM-DD

        if (/^\d{4}-\d{2}-\d{2}$/.test(reminderDateStr)) {
            try {
                // Lấy chuỗi ngày hôm nay 'YYYY-MM-DD' theo giờ local server
                const todayLocalStr = new Date().toLocaleDateString('sv');

                // So sánh chuỗi trực tiếp
                if (reminderDateStr === todayLocalStr) {
                    subtitle = 'Due today';
                } else if (reminderDateStr > todayLocalStr) {
                    // Tính số ngày còn lại (dùng Date object chỉ để tính toán)
                    const todayUTCStart = new Date(todayLocalStr + 'T00:00:00Z');
                    const reminderUTCStart = new Date(reminderDateStr + 'T00:00:00Z');

                    if (!isNaN(todayUTCStart.getTime()) && !isNaN(reminderUTCStart.getTime())) {
                        const diffTime = reminderUTCStart.getTime() - todayUTCStart.getTime();
                        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

                        if (diffDays === 1) {
                            subtitle = 'Due tomorrow';
                        } else if (diffDays > 1 && diffDays <= 30) {
                             subtitle = `Due in ${diffDays} days`;
                        } else if (diffDays > 30 && diffDays <= 365) {
                            const diffMonths = Math.floor(diffDays / 30.44);
                            subtitle = `Due in ${diffMonths} month${diffMonths > 1 ? 's' : ''}`;
                        } else if (diffDays > 365) {
                            const diffYears = Math.floor(diffDays / 365.25);
                            subtitle = `Due in ${diffYears} year${diffYears > 1 ? 's' : ''}`;
                        } else {
                             subtitle = `Due on ${reminderDateStr}`;
                        }
                    } else {
                        subtitle = "Error calculating future date diff";
                    }
                } else { // reminderDateStr < todayLocalStr (Quá hạn)
                    const todayUTCStart = new Date(todayLocalStr + 'T00:00:00Z');
                    const reminderUTCStart = new Date(reminderDateStr + 'T00:00:00Z');

                     if (!isNaN(todayUTCStart.getTime()) && !isNaN(reminderUTCStart.getTime())) {
                        const diffTime = todayUTCStart.getTime() - reminderUTCStart.getTime(); // Đảo thứ tự
                        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)); // Số ngày quá hạn

                        // Sửa lỗi hiển thị 0 ngày quá hạn
                        subtitle = `Overdue by ${diffDays || 1} day${(diffDays || 1) > 1 ? 's' : ''}`;
                    } else {
                         subtitle = "Error calculating past date diff";
                    }
                }

            } catch (dateError) {
                console.error(`Error processing reminder_date string "${reminder.reminder_date}" (ID: ${reminder.reminder_id}):`, dateError);
                subtitle = "Error calculating date";
            }
        } else {
             subtitle = "Invalid date format in DB";
        }
    }


    // --- Thêm giờ cho feeding ---
    if (reminder.type === 'feeding' && reminder.feeding_time) {
        const timeParts = String(reminder.feeding_time).split(':');
        const displayTime = timeParts.slice(0, 2).join(':'); // HH:MM
        if (subtitle.startsWith("Due today") || subtitle.startsWith("Feeding at")) {
             subtitle = `Due today at ${displayTime}`;
        } else if (!subtitle.startsWith("Date not set") && !subtitle.startsWith("Error") && !subtitle.startsWith("Invalid")) {
             subtitle += ` at ${displayTime}`;
        } else {
             subtitle = `Feeding at ${displayTime}`;
        }
    }

    // --- Kiểm tra "new today" ---
    if (reminder.created_at) {
        try {
            const createdAtDate = new Date(reminder.created_at);
            const todayDateLocal = new Date();

             if (isNaN(createdAtDate.getTime())) throw new Error("Could not parse created_at");

            const isCreatedTodayLocal = createdAtDate.getFullYear() === todayDateLocal.getFullYear() &&
                                  createdAtDate.getMonth() === todayDateLocal.getMonth() &&
                                  createdAtDate.getDate() === todayDateLocal.getDate();

            const isUnread = reminder.is_read === 0 || reminder.is_read === false || reminder.is_read === '0';

            if (isCreatedTodayLocal && isUnread) {
                is_new_today = true;
            }
        } catch (createDateError) {
            console.error(`Error parsing created_at date "${reminder.created_at}" (ID: ${reminder.reminder_id}):`, createDateError);
        }
    }

    // Chuyển is_read sang boolean
    const is_read_boolean = reminder.is_read === 1 || reminder.is_read === true || reminder.is_read === '1';

    return { display_title, subtitle, is_new_today, is_read: is_read_boolean };
}


// --- API Routes ---

// POST /api/reminders (Tạo mới)
router.post('/', async (req, res) => {
    try {
        const {
            pet_id, type, vaccination_type, feeding_time, reminder_date, frequency = 'none',
            end_date
        } = req.body;

        // --- Validation ---
        if (!pet_id || !type || (!reminder_date && type !== 'feeding') || (!feeding_time && type === 'feeding')) {
            return res.status(400).json({ error: 'Missing required fields (pet_id, type, and date/time)' });
        }
        if (type !== 'feeding' && !isValidDateString(reminder_date)) {
            return res.status(400).json({ error: 'reminder_date must be a valid date in YYYY-MM-DD format' });
        }
        if (!ALLOWED_FREQUENCIES.includes(frequency)) {
            return res.status(400).json({ error: `Invalid frequency. Allowed: ${ALLOWED_FREQUENCIES.join(', ')}` });
        }
        const lowerType = String(type).toLowerCase();
        const mappedType = TYPE_MAP[lowerType] || lowerType;
        if (!ALLOWED_TYPES.includes(mappedType)) {
            return res.status(400).json({ error: `Invalid type: ${type}. Allowed: ${ALLOWED_TYPES.join(', ')}` });
        }
        if (mappedType === 'feeding' && !isValidTimeString(feeding_time)) {
            return res.status(400).json({ error: 'Missing or invalid feeding_time (HH:MM or HH:MM:SS format)' });
        }
        const petRows = await db.query('SELECT id, name FROM pets WHERE id = ?', [pet_id]);
        if (!petRows || petRows.length === 0) {
            return res.status(404).json({ error: 'Pet not found (invalid pet_id)' });
        }

        let validEndDate = null;
        const effectiveStartDate = mappedType === 'feeding' ? new Date().toLocaleDateString('sv') : reminder_date;
        if (end_date) {
            if (!isValidDateString(end_date)) {
                return res.status(400).json({ error: 'end_date must be a valid date in YYYY-MM-DD format' });
            }
            if (frequency === 'none') {
                 return res.status(400).json({ error: 'end_date cannot be set for non-repeating reminders' });
            }
            if (end_date < effectiveStartDate) {
                return res.status(400).json({ error: `end_date (${end_date}) must be on or after start date (${effectiveStartDate})` });
            }
            validEndDate = end_date;
        }
        // --- End Validation ---

        const newId = crypto.randomBytes(6).toString('hex');
        const finalReminderDate = mappedType === 'feeding' ? new Date().toLocaleDateString('sv') : reminder_date;

        const insertSql = `
            INSERT INTO reminders (reminder_id, pet_id, type, vaccination_type, feeding_time, reminder_date, frequency, frequency_interval, status, created_at, end_date, is_read)
            VALUES (?, ?, ?, ?, ?, ?, ?, 1, 'pending', NOW(), ?, FALSE)
        `;
        const params = [
            newId, pet_id, mappedType,
            mappedType === 'vaccination' ? (vaccination_type || null) : null,
            mappedType === 'feeding' ? feeding_time : null,
            finalReminderDate,
            frequency,
            validEndDate
        ];
        const insertResult = await db.execute(insertSql, params);

        if (insertResult.affectedRows !== 1) {
             throw new Error('Failed to insert reminder into database.');
        }

        // Lấy lại bản ghi vừa tạo
        const insertedRows = await db.query(
          'SELECT r.*, p.name as pet_name FROM reminders r LEFT JOIN pets p ON r.pet_id = p.id WHERE r.reminder_id = ?',
           [newId]
        );
        if (!insertedRows || insertedRows.length === 0) {
             console.error(`Failed to fetch reminder ${newId} immediately after insert.`);
             return res.status(201).json({ reminder_id: newId, pet_id, type: mappedType, reminder_date: finalReminderDate, message: "Reminder created, but detailed fetch failed." });
        }

        const newReminder = insertedRows[0];
        const displayData = calculateDisplayFields(newReminder);

        return res.status(201).json({ ...newReminder, ...displayData });

    } catch (err) {
        console.error('POST /api/reminders error:', err);
        if (err.code && err.code.startsWith('ER_')) {
             return res.status(500).json({ error: 'Database error while creating reminder.' });
        }
        if (!res.headersSent) {
            return res.status(500).json({ error: 'Internal server error while creating reminder.' });
        }
    }
});


// GET /api/reminders (Lấy tất cả)
router.get('/', async (req, res) => {
     try {
        // Lấy dữ liệu, join pet name, sắp xếp
        const rows = await db.query(
            `SELECT r.*, p.name as pet_name
             FROM reminders r
             LEFT JOIN pets p ON r.pet_id = p.id
             ORDER BY
               CASE
                 WHEN r.reminder_date = CURDATE() THEN 0
                 WHEN r.reminder_date > CURDATE() THEN 1
                 ELSE 2
               END,
               r.reminder_date ASC,
               r.feeding_time ASC,
               r.status DESC,
               r.created_at DESC`
             // ✅ Đã thêm dấu backtick đóng chuỗi SQL
        );
        // Bổ sung trường hiển thị
        const enriched = rows.map(r => ({ ...r, ...calculateDisplayFields(r) }));
        return res.status(200).json(enriched);
    } catch (err) {
        console.error('GET /api/reminders error:', err);
        return res.status(500).json({ error: 'Internal server error while fetching reminders' });
    }
});


// GET /api/reminders/:id (Lấy chi tiết)
router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const rows = await db.query(
           'SELECT r.*, p.name as pet_name FROM reminders r LEFT JOIN pets p ON r.pet_id = p.id WHERE r.reminder_id = ?',
            [id]
        );
        if (!rows || rows.length === 0) {
             return res.status(404).json({ error: 'Reminder not found' });
        }
        const reminder = rows[0];
        const displayData = calculateDisplayFields(reminder); // Tính trường hiển thị
        return res.status(200).json({ ...reminder, ...displayData }); // Trả về kết hợp
    } catch (err) {
        console.error('GET /api/reminders/:id error:', err);
        return res.status(500).json({ error: 'Internal server error while fetching reminder details' });
    }
});

// PUT /api/reminders/:reminderId (Cập nhật)
router.put('/:reminderId', async (req, res) => {
    try {
        const reminderId = req.params.reminderId;
        const { vaccination_type, feeding_time, reminder_date, status, frequency, is_read } = req.body;
        const updates = [];
        const params = [];

        // --- Validation và xây dựng query ---
        if (vaccination_type !== undefined) {
             updates.push('vaccination_type = ?');
             params.push(vaccination_type || null);
        }
        if (feeding_time !== undefined) {
            if (feeding_time !== null && !isValidTimeString(feeding_time)) {
                return res.status(400).json({ error: 'Invalid feeding_time format (HH:MM or HH:MM:SS)' });
            }
            updates.push('feeding_time = ?');
            params.push(feeding_time);
        }
        if (reminder_date !== undefined) {
            if (!isValidDateString(reminder_date)) {
                 return res.status(400).json({ error: 'reminder_date must be a valid date in YYYY-MM-DD format' });
            }
            updates.push('reminder_date = ?');
            params.push(reminder_date);
        }
        if (status !== undefined) {
            if (!ALLOWED_STATUS.includes(status)) {
                 return res.status(400).json({ error: `status must be one of: ${ALLOWED_STATUS.join(', ')}` });
            }
            updates.push('status = ?');
            params.push(status);
        }
        if (frequency !== undefined) {
            if (!ALLOWED_FREQUENCIES.includes(frequency)) {
                 return res.status(400).json({ error: `Invalid frequency. Allowed: ${ALLOWED_FREQUENCIES.join(', ')}` });
            }
            updates.push('frequency = ?');
            params.push(frequency);
        }
        if (is_read !== undefined) {
            if (typeof is_read !== 'boolean') {
                 return res.status(400).json({ error: 'is_read must be a boolean (true or false)' });
            }
            updates.push('is_read = ?');
            params.push(is_read);
        }
        // --- Kết thúc validation ---

        if (updates.length === 0) {
             return res.status(400).json({ error: 'No valid fields provided to update' });
        }

        params.push(reminderId); // ID cho WHERE
        const sql = `UPDATE reminders SET ${updates.join(', ')} WHERE reminder_id = ?`;

        const result = await db.execute(sql, params); // Dùng execute

        if (result.affectedRows === 0) {
             return res.status(404).json({ error: 'Reminder not found or no changes made' });
        }

        // Lấy lại dữ liệu đã cập nhật
        const updatedRows = await db.query(
          'SELECT r.*, p.name as pet_name FROM reminders r LEFT JOIN pets p ON r.pet_id = p.id WHERE r.reminder_id = ?',
           [reminderId]
        );
        if (!updatedRows || updatedRows.length === 0) {
             console.error(`Failed to fetch reminder ${reminderId} after successful update.`);
             return res.status(404).json({ error: 'Reminder not found after update attempt.'});
        }
        const updatedReminder = updatedRows[0];
        const displayData = calculateDisplayFields(updatedReminder);
        return res.status(200).json({ ...updatedReminder, ...displayData });

    } catch (err) {
        console.error('PUT /api/reminders/:reminderId error:', err);
        if (err.code && err.code.startsWith('ER_')) {
             return res.status(500).json({ error: 'Database error during update.' });
        }
        if (!res.headersSent) {
            return res.status(500).json({ error: 'Internal server error during update.' });
        }
    }
});

// DELETE /api/reminders/:reminderId (Xóa)
router.delete('/:reminderId', async (req, res) => {
    try {
        const reminderId = req.params.reminderId;
        const result = await db.execute('DELETE FROM reminders WHERE reminder_id = ?', [reminderId]); // Dùng execute
        if (result.affectedRows === 0) {
             return res.status(404).json({ error: 'Reminder not found' });
        }
        return res.status(204).send(); // Thành công
    } catch (err) {
        console.error('DELETE /api/reminders/:reminderId error:', err);
         if (err.code && err.code.startsWith('ER_')) {
             return res.status(500).json({ error: 'Database error during deletion.' });
         }
        return res.status(500).json({ error: 'Internal server error during deletion.' });
    }
});

// PUT /api/reminders/mark-read/today (Đánh dấu đã đọc)
router.put('/mark-read/today', async (req, res) => {
    try {
        // ✅ SỬA ĐỔI SQL: Sử dụng DATE(created_at) và CURDATE()
        // Điều này đảm bảo so sánh ngày dựa trên múi giờ của DB,
        // không phụ thuộc vào việc tạo chuỗi ngày từ server Node.js.
        const sql = `
            UPDATE reminders
            SET is_read = TRUE
            WHERE DATE(created_at) = CURDATE() -- So sánh phần ngày của created_at với ngày hiện tại của DB
              AND is_read = FALSE
        `;

        // Không cần truyền tham số ngày nữa
        const result = await db.execute(sql);

        console.log(`[INFO] Attempted to mark reminders created today (DB date) as read. Rows affected: ${result.affectedRows}`);
        return res.status(200).json({ message: `Successfully marked ${result.affectedRows} new reminders as read.` });

    } catch (err) {
         console.error('PUT /api/reminders/mark-read/today error:', err);
         if (err.code && err.code.startsWith('ER_')) {
             return res.status(500).json({ error: 'Database error while marking reminders read' });
         }
        return res.status(500).json({ error: 'Internal server error while marking reminders as read' });
    }
});


module.exports = router; // Đảm bảo export cuối file