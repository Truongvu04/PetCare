// PetCare/backend/scheduler/reminderJob.js
const cron = require('node-cron');
const db = require('../config/db'); // Đảm bảo đường dẫn đúng
const crypto = require('crypto');
const { sendReminderEmail } = require('../utils/mailer');

// --- Helper Functions ---

// Tính ngày tiếp theo dựa trên tần suất (xử lý ngày cuối tháng)
function calculateNextReminderDate(lastDate, frequency) {
    if (!lastDate) return null;
    const next = new Date(lastDate);
    next.setUTCHours(0, 0, 0, 0);

    switch (frequency) {
        case 'daily':
            next.setUTCDate(next.getUTCDate() + 1);
            break;
        case 'weekly':
            next.setUTCDate(next.getUTCDate() + 7);
            break;
        case 'monthly':
            const currentDay = next.getUTCDate();
            next.setUTCMonth(next.getUTCMonth() + 1);
            if (next.getUTCDate() !== currentDay) {
                next.setUTCDate(0); // Đặt về ngày cuối của tháng trước
            }
            break;
        case 'yearly':
            next.setUTCFullYear(next.getUTCFullYear() + 1);
            break;
        default: // 'none' hoặc tần suất không hợp lệ
            return null;
    }
    return next; // Trả về đối tượng Date là nửa đêm UTC của lần tiếp theo
}

// Định dạng đối tượng Date thành chuỗi 'YYYY-MM-DD'
function formatDate(date) {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
        console.error("Invalid date passed to formatDate:", date);
        return null; // Trả về null nếu ngày không hợp lệ
    }
    try {
        const year = date.getUTCFullYear();
        const month = (date.getUTCMonth() + 1).toString().padStart(2, '0'); // Tháng từ 0-11
        const day = date.getUTCDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch (e) {
        console.error("Error formatting date:", date, e);
        return null;
    }
}

// --- Cron Job Logic ---

/**
 * Xử lý reminder lặp lại (không phải feeding).
 * Tạo lần nhắc nhở tiếp theo nếu cần và đánh dấu lần cũ là 'done'.
 */
async function processRepeatingReminders() {
    // ====> KHAI BÁO BIẾN TRONG HÀM <====
    const jobStartTime = new Date();
    const todayLocalStr = jobStartTime.toLocaleDateString('sv'); // Lấy ngày hiện tại khi job chạy
    // ====> KẾT THÚC KHAI BÁO <====

    console.log(`[${jobStartTime.toISOString()}] Running processRepeatingReminders...`);

    try {
        // Lấy các reminder cần xử lý, join thêm email user
        const repeatingReminders = await db.query(
            `SELECT r.*, p.name as pet_name, u.email as user_email
             FROM reminders r
             JOIN pets p ON r.pet_id = p.id
             JOIN Users u ON p.user_id = u.user_id
             WHERE r.type != 'feeding'
               AND r.frequency != 'none'
               AND r.status = 'pending'
               AND r.reminder_date <= ?  -- Ngày hẹn là hôm nay hoặc đã qua
               AND (r.end_date IS NULL OR r.reminder_date <= r.end_date)`, // Chưa qua ngày kết thúc (nếu có)
            [todayLocalStr] // Sử dụng ngày hiện tại của job
        );

        if (!repeatingReminders || repeatingReminders.length === 0) {
            console.log("   -> No non-feeding repeating reminders due for processing.");
            console.log(`      (Checked against date: ${todayLocalStr})`); // Log ngày đã kiểm tra
            return;
        }

        console.log(`   -> Found ${repeatingReminders.length} potential non-feeding reminders to process.`);

        for (const reminder of repeatingReminders) {
             let reminderDateForCalc = null;
             // Chuyển đổi reminder_date hiện tại sang Date object (UTC midnight) để tính toán
             if (reminder.reminder_date) {
                try {
                     const dateStr = String(reminder.reminder_date).slice(0, 10);
                     if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                          reminderDateForCalc = new Date(dateStr + 'T00:00:00Z');
                     }
                } catch (e) { console.error(`Error parsing reminder_date ${reminder.reminder_date} for calc:`, e); }
             }

             // Bỏ qua nếu ngày không hợp lệ
             if (!reminderDateForCalc || isNaN(reminderDateForCalc.getTime())) {
                 console.warn(`   -> Skipping reminder ${reminder.reminder_id}: Invalid reminder_date "${reminder.reminder_date}".`);
                 continue;
             }

            // Tính ngày hẹn tiếp theo
            const nextDateUTC = calculateNextReminderDate(reminderDateForCalc, reminder.frequency);
            if (!nextDateUTC) continue; // Bỏ qua nếu không tính được (ví dụ freq='none' bị lọt vào)

            const nextDateLocalStr = formatDate(nextDateUTC); // Format ngày tiếp theo thành YYYY-MM-DD
            if (!nextDateLocalStr) {
                 console.warn(`   -> Skipping reminder ${reminder.reminder_id}: Could not format next date.`);
                 continue;
            }

            // Kiểm tra end_date
            let stopRepeating = false;
            if (reminder.end_date) {
                const endDateStr = String(reminder.end_date).slice(0, 10);
                if (/^\d{4}-\d{2}-\d{2}$/.test(endDateStr)) {
                    // So sánh chuỗi YYYY-MM-DD
                    if (nextDateLocalStr > endDateStr) {
                        stopRepeating = true;
                        console.log(`   -> Stopping repeat for reminder ${reminder.reminder_id}. Next date ${nextDateLocalStr} is after end date ${endDateStr}.`);
                    }
                } else {
                     console.warn(`   -> Reminder ${reminder.reminder_id} has invalid end_date format: ${reminder.end_date}. Ignoring end_date.`);
                }
            }

            // Chỉ tạo mới nếu không dừng lặp lại
            if (!stopRepeating) {
                // Kiểm tra xem reminder cho lần tiếp theo đã tồn tại chưa
                const existingNext = await db.query(
                    `SELECT reminder_id FROM reminders
                     WHERE pet_id = ? AND type = ? AND reminder_date = ? AND frequency = ? AND status = 'pending'`,
                    [reminder.pet_id, reminder.type, nextDateLocalStr, reminder.frequency]
                );

                // Nếu chưa tồn tại -> Tạo mới
                if (existingNext.length === 0) {
                    const newId = crypto.randomBytes(6).toString('hex');
                    const insertResult = await db.execute(
                        `INSERT INTO reminders (reminder_id, pet_id, type, vaccination_type, reminder_date, frequency, status, is_read, created_at, end_date)
                         VALUES (?, ?, ?, ?, ?, ?, 'pending', FALSE, NOW(), ?)`,
                        [newId, reminder.pet_id, reminder.type, reminder.vaccination_type, nextDateLocalStr, reminder.frequency, reminder.end_date] // Giữ lại end_date gốc
                    );

                    // Nếu tạo thành công -> Gửi email
                    if (insertResult.affectedRows > 0) {
                        console.log(`   -> Created next reminder ${newId} for original ${reminder.reminder_id} on ${nextDateLocalStr}`);
                        if (reminder.user_email) {
                             const subject = `PetCare+ Reminder: ${reminder.pet_name}'s ${reminder.type} due on ${nextDateLocalStr}`;
                             const htmlContent = `
                             <!DOCTYPE html>
                             <html lang="en">
                             <head>
                                 <meta charset="UTF-8">
                                 <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                 <title>PetCare+ Reminder</title>
                                 <style>
                                     body { font-family: 'Arial', sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
                                     .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
                                     .header { background-color: #20df6c; color: #ffffff; padding: 20px; text-align: center; }
                                     .header h1 { margin: 0; font-size: 24px; }
                                     .content { padding: 30px; line-height: 1.6; color: #333333; }
                                     .content strong { color: #1a9c56; }
                                     .info-box { background-color: #e8f7f0; border-left: 5px solid #20df6c; padding: 15px; margin: 20px 0; border-radius: 4px; }
                                     .info-box p { margin: 5px 0; }
                                     .footer { text-align: center; padding: 20px; font-size: 12px; color: #888888; background-color: #f4f4f4; }
                                     .footer em { color: #666666;}
                                 </style>
                             </head>
                             <body>
                                 <div class="container">
                                     <div class="header">
                                         <h1>PetCare+ Reminder</h1>
                                     </div>
                                     <div class="content">
                                         <p>Hi Owner,</p>
                                         <p>This is an automated reminder for your pet, <strong>${reminder.pet_name}</strong>:</p>
                                         <div class="info-box">
                                             <p><strong>Reminder Type:</strong> ${reminder.type} ${reminder.vaccination_type ? `(${reminder.vaccination_type})` : ''}</p>
                                             <p><strong>Due Date:</strong> ${nextDateLocalStr}</p>
                                         </div>
                                         <p>Please remember to take care of your furry friend!</p>
                                     </div>
                                     <div class="footer">
                                         <em>(This reminder was automatically generated for the upcoming cycle.)</em>
                                         <p>&copy; ${new Date().getFullYear()} PetCare+. All rights reserved.</p>
                                     </div>
                                 </div>
                             </body>
                             </html>
                             `;
                             sendReminderEmail(reminder.user_email, subject, htmlContent)
                                 .catch(err => console.error(`   -> Failed to send repeating reminder email for ${newId}:`, err));
                         } else {
                             console.warn(`   -> Cannot send email for new reminder ${newId}: User email not found.`);
                         }
                    } else {
                        console.error(`   -> FAILED to create next reminder for ${reminder.reminder_id}`);
                    }
                } else {
                     console.log(`   -> Skipping creation for ${reminder.reminder_id}, next reminder on ${nextDateLocalStr} already exists.`);
                }
            } // Kết thúc if (!stopRepeating)

            // Đánh dấu reminder hiện tại/quá khứ là done/read
            const updateOldResult = await db.execute(
                'UPDATE reminders SET status = ?, is_read = TRUE WHERE reminder_id = ? AND status = ?',
                ['done', reminder.reminder_id, 'pending']
            );
            if (updateOldResult.affectedRows > 0) {
               console.log(`   -> Marked current/past reminder ${reminder.reminder_id} as done/read.`);
            }
        } // Kết thúc vòng lặp for
        console.log(`[${jobStartTime.toISOString()}] Finished processRepeatingReminders.`);
    } catch (error) {
        console.error('❌ Error processing non-feeding repeating reminders:', error);
    }
}

/**
 * Xử lý reminder 'none' (không phải feeding) đã quá hạn.
 * Xóa chúng nếu reminder_date trước ngày hôm nay (local).
 */
async function processExpiredNoneReminders() {
    // ====> KHAI BÁO BIẾN TRONG HÀM <====
    const jobStartTime = new Date();
    const todayLocalStr = jobStartTime.toLocaleDateString('sv');
    // ====> KẾT THÚC KHAI BÁO <====

    console.log(`[${jobStartTime.toISOString()}] Running processExpiredNoneReminders...`);

    try {
        // Xóa reminder không lặp lại, không phải feeding, có ngày trước hôm nay
        const result = await db.execute(
            `DELETE FROM reminders
             WHERE frequency = 'none' AND type != 'feeding' AND reminder_date < ?`,
            [todayLocalStr] // Dùng chuỗi ngày local
        );

        if (result.affectedRows > 0) {
            console.log(`   -> Deleted ${result.affectedRows} expired 'none' (non-feeding) reminders.`);
        }
        console.log(`[${jobStartTime.toISOString()}] Finished processExpiredNoneReminders.`);
    } catch (error) {
        console.error('❌ Error processing expired "none" (non-feeding) reminders:', error);
    }
}

/**
 * Xử lý feeding reminders.
 */
async function processFeedingReminders() {
    // ====> KHAI BÁO BIẾN TRONG HÀM <====
    const jobStartTime = new Date();
    const nowLocal = jobStartTime; // Dùng jobStartTime làm thời điểm gốc
    const todayLocalStr = nowLocal.toLocaleDateString('sv'); // 'YYYY-MM-DD'
    const currentTimeLocalStr = nowLocal.toLocaleTimeString('sv', { hour12: false }); // 'HH:MM:SS'
    // ====> KẾT THÚC KHAI BÁO <====

    // --- KHAI BÁO BIẾN ĐẾM Ở ĐÂY (NGOÀI TRY) ---
    let createdCount = 0;
    let deletedSpecificTodayCount = 0;
    let deletedYesterdayNoneCount = 0;
    let setReadCount = 0;
    let setUnreadCount = 0;
    // --- KẾT THÚC KHAI BÁO BIẾN ĐẾM ---

    console.log(`[${jobStartTime.toISOString()}] --- processFeedingReminders JOB START (Logic: Manage is_read + Send Email) ---`);

    try {
        // --- 0. QUẢN LÝ is_read VÀ GỬI EMAIL CHO FEEDING INSTANCES HÔM NAY ---
        const pendingFeedingsToday = await db.query(
             `SELECT r.reminder_id, r.feeding_time, r.is_read, p.name as pet_name, u.email as user_email
              FROM reminders r
              JOIN pets p ON r.pet_id = p.id
              JOIN Users u ON p.user_id = u.user_id
              WHERE r.type = 'feeding'
                AND r.frequency = 'none'      -- Chỉ xử lý instance
                AND r.reminder_date = ?       -- Của hôm nay
                AND r.status = 'pending'`,
             [todayLocalStr]
        );

        console.log(`   [Feeding] Found ${pendingFeedingsToday.length} pending instances today to manage is_read status.`);

        for (const reminder of pendingFeedingsToday) {
            const feedingTimeStr = reminder.feeding_time;
            if (!feedingTimeStr) continue; // Bỏ qua nếu không có giờ

            try {
                const [hours, minutes, seconds] = feedingTimeStr.split(':').map(Number);
                if (isNaN(hours) || isNaN(minutes)) throw new Error("Invalid time format");

                const reminderDateTimeLocalToday = new Date(nowLocal);
                reminderDateTimeLocalToday.setHours(hours, minutes, seconds || 0, 0);

                const oneHourBeforeLocal = new Date(reminderDateTimeLocalToday);
                oneHourBeforeLocal.setHours(oneHourBeforeLocal.getHours() - 1);

                let targetIsRead = null;

                if (nowLocal < oneHourBeforeLocal) {
                    if (reminder.is_read === false || reminder.is_read === 0) {
                        targetIsRead = true;
                    }
                } else if (nowLocal >= oneHourBeforeLocal && nowLocal <= reminderDateTimeLocalToday) {
                    if (reminder.is_read === true || reminder.is_read === 1) {
                        targetIsRead = false;
                    }
                }

                if (targetIsRead !== null) {
                    const updateResult = await db.execute(
                        'UPDATE reminders SET is_read = ? WHERE reminder_id = ? AND is_read != ?',
                        [targetIsRead, reminder.reminder_id, targetIsRead]
                    );

                    if (updateResult.affectedRows > 0) {
                        if (targetIsRead) {
                            console.log(`   -> [Feeding] Set is_read=TRUE for reminder ${reminder.reminder_id} (due at ${feedingTimeStr}, >1h away)`);
                            setReadCount++;
                        } else {
                            console.log(`   -> [Feeding] Set is_read=FALSE for reminder ${reminder.reminder_id} (due at ${feedingTimeStr}, <1h away)`);
                            setUnreadCount++;
                            if (reminder.user_email) {
                                const subject = `PetCare+ Feeding Reminder: ${reminder.pet_name} at ${feedingTimeStr.substring(0, 5)}`; // HH:MM
                                const htmlContent = `
                                <!DOCTYPE html>
                                <html lang="en">
                                <head>
                                    <meta charset="UTF-8">
                                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                    <title>PetCare+ Feeding Reminder</title>
                                    <style>
                                        body { font-family: 'Arial', sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
                                        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
                                        .header { background-color: #20df6c; color: #ffffff; padding: 20px; text-align: center; }
                                        .header h1 { margin: 0; font-size: 24px; }
                                        .content { padding: 30px; line-height: 1.6; color: #333333; }
                                        .content strong { color: #1a9c56; }
                                        .info-box { background-color: #e8f7f0; border-left: 5px solid #20df6c; padding: 15px; margin: 20px 0; border-radius: 4px; text-align: center; }
                                        .info-box p { margin: 5px 0; }
                                        .time-highlight { font-size: 28px; font-weight: bold; color: #1a9c56; margin: 10px 0; }
                                        .footer { text-align: center; padding: 20px; font-size: 12px; color: #888888; background-color: #f4f4f4; }
                                        .footer em { color: #666666;}
                                    </style>
                                </head>
                                <body>
                                    <div class="container">
                                        <div class="header">
                                            <h1>PetCare+ Feeding Reminder 🍲</h1>
                                        </div>
                                        <div class="content">
                                            <p>Hi Owner,</p>
                                            <p>It's almost time to feed <strong>${reminder.pet_name}</strong>!</p>
                                            <div class="info-box">
                                                <p>Scheduled Time Today:</p>
                                                <p class="time-highlight">${feedingTimeStr.substring(0, 5)}</p>
                                            </div>
                                            <p>Don't forget!</p>
                                        </div>
                                        <div class="footer">
                                             <em>You are receiving this because a feeding reminder is approaching.</em>
                                            <p>&copy; ${new Date().getFullYear()} PetCare+. All rights reserved.</p>
                                        </div>
                                    </div>
                                </body>
                                </html>
                                `;
                                sendReminderEmail(reminder.user_email, subject, htmlContent)
                                    .catch(err => console.error(`   -> Failed to send feeding reminder email for ${reminder.reminder_id}:`, err));
                            } else {
                                console.warn(`   -> Cannot send feeding email for ${reminder.reminder_id}: User email not found.`);
                            }
                        }
                    }
                }
            } catch(timeError) {
                console.error(`   -> [Feeding] Error processing time ${feedingTimeStr} for managing is_read status on reminder ${reminder.reminder_id}:`, timeError);
            }
        } // Kết thúc vòng lặp quản lý is_read

        // --- 1. Tạo Feeding Reminder Instances cho Hôm Nay ---
         const baseFeedings = await db.query(
             `SELECT reminder_id, pet_id, feeding_time, frequency, end_date
              FROM reminders
              WHERE type = 'feeding'
                AND feeding_time IS NOT NULL
                AND status = 'pending'
                AND (frequency = 'daily' OR (frequency = 'none' AND reminder_date = ?))
                AND (end_date IS NULL OR end_date >= ?)`,
             [todayLocalStr, todayLocalStr]
         );

         console.log(`   [Feeding] Found ${baseFeedings.length} base schedules to check for instance creation.`);

         for (const baseReminder of baseFeedings) {
            const feedingTimeStr = baseReminder.feeding_time;
            if (!feedingTimeStr) continue;

             try {
                 const [hours, minutes, seconds] = feedingTimeStr.split(':').map(Number);
                 if (isNaN(hours) || isNaN(minutes)) throw new Error("Invalid time format in DB");

                 const reminderDateTimeLocalToday = new Date(nowLocal);
                 reminderDateTimeLocalToday.setHours(hours, minutes, seconds || 0, 0);
                 const oneHourBeforeLocal = new Date(reminderDateTimeLocalToday);
                 oneHourBeforeLocal.setHours(oneHourBeforeLocal.getHours() - 1);

                 if (nowLocal >= oneHourBeforeLocal && nowLocal <= reminderDateTimeLocalToday) {
                     const existingInstance = await db.query(
                         `SELECT reminder_id FROM reminders
                          WHERE pet_id = ? AND type = 'feeding' AND reminder_date = ? AND feeding_time = ?
                            AND frequency = 'none' AND status = 'pending'`,
                         [baseReminder.pet_id, todayLocalStr, feedingTimeStr]
                     );

                      if (existingInstance.length === 0) {
                          const newId = crypto.randomBytes(6).toString('hex');
                          const insertResult = await db.execute(
                              `INSERT INTO reminders (reminder_id, pet_id, type, feeding_time, reminder_date, frequency, status, is_read, created_at, end_date)
                               VALUES (?, ?, 'feeding', ?, ?, 'none', 'pending', FALSE, NOW(), NULL)`,
                              [newId, baseReminder.pet_id, feedingTimeStr, todayLocalStr]
                          );
                           if (insertResult.affectedRows > 0) {
                              console.log(`   -> [Feeding] Created SPECIFIC instance ${newId} (initially unread) for pet ${baseReminder.pet_id} at ${feedingTimeStr}`);
                              createdCount++;
                           } else {
                               console.error(`   -> [Feeding] FAILED to create instance for pet ${baseReminder.pet_id} at ${feedingTimeStr}`);
                           }
                      }
                 }
             } catch(timeError) {
                  console.error(`   -> [Feeding] Error processing time ${feedingTimeStr} during instance creation for reminder ${baseReminder.reminder_id}:`, timeError);
             }
         } // Kết thúc vòng lặp tạo instance

        // --- 2. Xóa Instance Feeding của Hôm Nay nếu Quá Giờ ---
         console.log(`   [Feeding] Checking instances for deletion on ${todayLocalStr} where TIME('${currentTimeLocalStr}') > feeding_time`);
         const deleteResult = await db.execute(
             `DELETE FROM reminders
              WHERE type = 'feeding'
                AND frequency = 'none'
                AND reminder_date = ?
                AND TIME(?) > feeding_time`,
             [todayLocalStr, currentTimeLocalStr]
         );
         if (deleteResult.affectedRows > 0) {
             console.log(`   -> [Feeding] Deleted ${deleteResult.affectedRows} past SPECIFIC feeding instances from today (${todayLocalStr}).`);
             deletedSpecificTodayCount = deleteResult.affectedRows;
         }

        // --- 3. Dọn Dẹp Instance Feeding của Ngày Hôm Qua ---
        const yesterdayLocal = new Date(nowLocal);
        yesterdayLocal.setDate(yesterdayLocal.getDate() - 1);
        const yesterdayLocalStr = yesterdayLocal.toLocaleDateString('sv');
        const deletedYesterdayResult = await db.execute(
            `DELETE FROM reminders
             WHERE type = 'feeding' AND frequency = 'none' AND reminder_date = ?`,
            [yesterdayLocalStr]
        );
        if(deletedYesterdayResult.affectedRows > 0){
            console.log(`   -> [Feeding] Deleted ${deletedYesterdayResult.affectedRows} leftover 'none' instances from yesterday (${yesterdayLocalStr}).`);
            deletedYesterdayNoneCount = deletedYesterdayResult.affectedRows;
        }

        // --- Câu lệnh log cuối cùng TRONG TRY ---
        console.log(`[${jobStartTime.toISOString()}] Finished processFeedingReminders. SetRead: ${setReadCount}, SetUnread: ${setUnreadCount}, Created: ${createdCount}, Deleted Today: ${deletedSpecificTodayCount}, Deleted Yesterday: ${deletedYesterdayNoneCount}.`);
        console.log(`[${jobStartTime.toISOString()}] === 5-MINUTE JOB END ===\n`);

    } catch (error) {
        console.error('❌ Error processing feeding reminders:', error);
        // --- Câu lệnh log cuối cùng TRONG CATCH ---
        console.log(`[${jobStartTime.toISOString()}] === 5-MINUTE JOB END with ERROR === SetRead: ${setReadCount}, SetUnread: ${setUnreadCount}, Created: ${createdCount}, Deleted Today: ${deletedSpecificTodayCount}, Deleted Yesterday: ${deletedYesterdayNoneCount}.\n`);
    }
}

// --- Lên Lịch Cron Job ---
// Job Hàng Ngày: Chạy lúc 00:01
cron.schedule('1 0 * * *', async () => {  
  console.log(`\n[${new Date().toISOString()}] === DAILY JOB START ===`);
  try {
    // Chạy tuần tự để tránh xung đột
    await processRepeatingReminders();
    await processExpiredNoneReminders();
  } catch (e) {
    console.error("Error in DAILY cron job:", e);
  } finally {
    console.log(`[${new Date().toISOString()}] === DAILY JOB END ===`);
  }
});

// Job Thường Xuyên: Chạy mỗi 5 phút
cron.schedule('*/5 * * * *', async () => {
     try {
         await processFeedingReminders();
     } catch (e) { console.error("Error in 5-MINUTE cron job:", e); }
 });

console.log('✅ Cron jobs for reminders scheduled (v5 - Cron manages feeding is_read state). Waiting for tasks...');
