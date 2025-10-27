// PetCare/backend/scheduler/reminderJob.js
const cron = require('node-cron');
const db = require('../config/db'); // Đảm bảo đường dẫn đúng
const crypto = require('crypto');
const { sendReminderEmail } = require('../utils/mailer');

// --- Helper Functions ---

// Tính ngày tiếp theo dựa trên tần suất (xử lý ngày cuối tháng)
function calculateNextReminderDate(lastDate, frequency) {
    if (!lastDate) return null;
    // Làm việc với ngày UTC để tránh lệch múi giờ khi tính toán
    const next = new Date(lastDate);
    next.setUTCHours(0, 0, 0, 0); // Bắt đầu tính từ nửa đêm UTC

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
            // Nếu ngày bị thay đổi (ví dụ: 31/1 -> 3/3), đặt về ngày cuối của tháng trước đó (tháng 2)
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
 * Xử lý reminder lặp lại (khác feeding) THEO LOGIC MỚI.
 * Gửi email nhắc nhở hàng ngày nếu frequency='daily' và chưa đến ngày hẹn cuối.
 * Xóa reminder cũ khi tạo mới.
 * Xóa hoàn toàn khi qua ngày hẹn cuối.
 */
async function processRepeatingReminders_NewLogic() {
    const jobStartTime = new Date();
    const todayLocalStr = jobStartTime.toLocaleDateString('sv'); // Ngày hôm nay 'YYYY-MM-DD'

    console.log(`[${jobStartTime.toISOString()}] Running processRepeatingReminders_NewLogic... (Checking against date: ${todayLocalStr})`);

    try {
        // Lấy TẤT CẢ reminder lặp lại (khác feeding) đang pending
        const potentialReminders = await db.query(
            `SELECT r.*, p.name as pet_name, u.email as user_email
             FROM reminders r
             JOIN pets p ON r.pet_id = p.id
             JOIN Users u ON p.user_id = u.user_id
             WHERE r.type != 'feeding'
               AND r.frequency != 'none'  -- Chỉ lấy loại lặp lại
               AND r.status = 'pending'`, // Chỉ lấy cái đang chờ
            [] // Không lọc theo ngày ở đây nữa
        );

        if (!potentialReminders || potentialReminders.length === 0) {
            console.log("   -> No potential non-feeding repeating reminders found to process.");
            return;
        }

        console.log(`   -> Found ${potentialReminders.length} potential non-feeding repeating reminders to check.`);

        for (const reminder of potentialReminders) {
            const finalDueDateStr = reminder.reminder_date; // Ngày hẹn cuối cùng (YYYY-MM-DD)

            // Kiểm tra định dạng ngày hẹn cuối
            if (!finalDueDateStr || !/^\d{4}-\d{2}-\d{2}$/.test(finalDueDateStr)) {
                console.warn(`   -> Skipping reminder ${reminder.reminder_id}: Invalid final due date format "${finalDueDateStr}".`);
                continue;
            }

            // --- Logic Xóa Hoàn Toàn ---
            // Nếu ngày hôm nay ĐÃ VƯỢT QUA ngày hẹn cuối -> Xóa reminder này đi
            if (todayLocalStr > finalDueDateStr) {
                console.log(`   -> Deleting reminder ${reminder.reminder_id} as today (${todayLocalStr}) is past the final due date (${finalDueDateStr}).`);
                try {
                    await db.execute('DELETE FROM reminders WHERE reminder_id = ?', [reminder.reminder_id]);
                } catch (deleteErr) {
                    console.error(`   -> FAILED to delete past reminder ${reminder.reminder_id}:`, deleteErr);
                }
                continue; // Chuyển sang reminder tiếp theo
            }

            // --- Logic Gửi Email Hàng Ngày (chỉ áp dụng cho frequency = 'daily') ---
            // Nếu frequency là 'daily' VÀ ngày hôm nay CHƯA QUA ngày hẹn cuối (<=)
            if (reminder.frequency === 'daily' && todayLocalStr <= finalDueDateStr) {
                // Tính ngày MAI (today + 1 day)
                const nextDayDate = new Date(jobStartTime); // Lấy ngày giờ hiện tại
                nextDayDate.setUTCDate(nextDayDate.getUTCDate() + 1); // Cộng 1 ngày (UTC)
                const nextDayStr = formatDate(nextDayDate); // Format thành 'YYYY-MM-DD'

                // Chỉ tạo và gửi mail nếu ngày mai vẫn chưa qua ngày hẹn cuối
                if (nextDayStr && nextDayStr <= finalDueDateStr) {
                    // Kiểm tra xem reminder cho ngày mai đã tồn tại chưa (phòng trường hợp job chạy lỗi/dừng giữa chừng)
                     const existingNext = await db.query(
                         `SELECT reminder_id FROM reminders
                          WHERE pet_id = ? AND type = ? AND reminder_date = ? AND frequency = 'daily' AND status = 'pending'`,
                         [reminder.pet_id, reminder.type, nextDayStr] // Tìm bản ghi gốc cho ngày mai
                     );

                    // Nếu chưa tồn tại bản ghi gốc cho ngày mai -> Tạo mới và Gửi mail
                     if (existingNext.length === 0) {
                         const newId = crypto.randomBytes(6).toString('hex');
                         // Tạo bản ghi MỚI giống hệt bản ghi hiện tại, chỉ khác reminder_id và reminder_date là ngày mai
                         const insertResult = await db.execute(
                             `INSERT INTO reminders (reminder_id, pet_id, type, vaccination_type, reminder_date, frequency, status, is_read, created_at, end_date)
                              VALUES (?, ?, ?, ?, ?, ?, 'pending', FALSE, NOW(), ?)`,
                             [newId, reminder.pet_id, reminder.type, reminder.vaccination_type, nextDayStr, reminder.frequency, reminder.end_date] // end_date giữ nguyên từ gốc
                         );

                         if (insertResult.affectedRows > 0) {
                             console.log(`   -> Created next daily reminder ${newId} for original ${reminder.reminder_id} scheduled for ${nextDayStr}`);

                             // Gửi Email thông báo về reminder của NGÀY MAI
                             if (reminder.user_email) {
                                 const subject = `PetCare+ Daily Reminder: ${reminder.pet_name}'s ${reminder.type} on ${nextDayStr}`;
                                 const htmlContent = `
                                 <!DOCTYPE html>
                                 <html lang="en">
                                 <head>
                                     <meta charset="UTF-8">
                                     <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                     <title>PetCare+ Daily Reminder</title>
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
                                         <div class="header"><h1>PetCare+ Daily Reminder</h1></div>
                                         <div class="content">
                                             <p>Hi Owner,</p>
                                             <p>Just a reminder for <strong>${reminder.pet_name}</strong> scheduled for tomorrow:</p>
                                             <div class="info-box">
                                                 <p><strong>Reminder Type:</strong> ${reminder.type} ${reminder.vaccination_type ? `(${reminder.vaccination_type})` : ''}</p>
                                                 <p><strong>Date:</strong> ${nextDayStr}</p>
                                                 <p><em>(Final appointment date: ${finalDueDateStr})</em></p>
                                             </div>
                                             <p>Keep up the great care!</p>
                                         </div>
                                         <div class="footer">
                                            <em>This is a daily reminder until ${finalDueDateStr}.</em>
                                            <p>&copy; ${new Date().getFullYear()} PetCare+. All rights reserved.</p>
                                        </div>
                                     </div>
                                 </body>
                                 </html>
                                 `;
                                 sendReminderEmail(reminder.user_email, subject, htmlContent)
                                     .catch(err => console.error(`   -> Failed to send daily reminder email for ${newId}:`, err));
                             } else {
                                 console.warn(`   -> Cannot send email for new reminder ${newId}: User email not found.`);
                             }

                             // XÓA reminder CŨ (của ngày hôm nay) sau khi tạo mới thành công
                             console.log(`   -> Deleting old daily reminder ${reminder.reminder_id} (date: ${reminder.reminder_date}) after creating new one.`);
                             try {
                                 await db.execute('DELETE FROM reminders WHERE reminder_id = ?', [reminder.reminder_id]);
                             } catch (deleteOldErr) {
                                 console.error(`   -> FAILED to delete old daily reminder ${reminder.reminder_id}:`, deleteOldErr);
                             }

                         } else {
                             console.error(`   -> FAILED to create next daily reminder for original ${reminder.reminder_id}`);
                         }
                     } else {
                          console.log(`   -> Skipping creation for ${reminder.reminder_id}, reminder for ${nextDayStr} already exists.`);
                          // Xóa bản ghi hiện tại nếu bản ghi của ngày mai đã tồn tại (để dọn dẹp)
                           console.log(`   -> Deleting potentially redundant reminder ${reminder.reminder_id} (date: ${reminder.reminder_date}).`);
                           try {
                               await db.execute('DELETE FROM reminders WHERE reminder_id = ?', [reminder.reminder_id]);
                           } catch (deleteRedundantErr) {
                               console.error(`   -> FAILED to delete redundant reminder ${reminder.reminder_id}:`, deleteRedundantErr);
                           }
                     }
                } else {
                    // Nếu ngày mai đã qua ngày hẹn cuối, không tạo mới nữa.
                    // Reminder của hôm nay sẽ bị xóa ở lần chạy job tiếp theo (khi today > finalDueDateStr)
                    console.log(`   -> Not creating next daily reminder for ${reminder.reminder_id} as next day ${nextDayStr} would be past final due date ${finalDueDateStr}.`);
                }
            }
            // --- Xử lý các frequency khác (weekly, monthly, yearly) ---
            // Giữ logic cũ: chỉ xử lý khi đến hạn/quá hạn, nhưng XÓA thay vì UPDATE
            else if (reminder.frequency !== 'daily' && todayLocalStr >= finalDueDateStr) {
                 console.log(`   -> Processing W/M/Y reminder ${reminder.reminder_id} which is due on ${finalDueDateStr}.`);

                 // Chuyển đổi ngày hẹn cuối sang Date object để tính toán
                 let finalDueDateForCalc = null;
                 try {
                     if (/^\d{4}-\d{2}-\d{2}$/.test(finalDueDateStr)) {
                          finalDueDateForCalc = new Date(finalDueDateStr + 'T00:00:00Z');
                     }
                 } catch(e) { /* ignore */ }

                 if (!finalDueDateForCalc || isNaN(finalDueDateForCalc.getTime())) {
                     console.warn(`   -> Skipping W/M/Y reminder ${reminder.reminder_id}: Invalid final due date for calculation.`);
                     continue; // Bỏ qua nếu ngày không hợp lệ
                 }


                 // Tính ngày hẹn tiếp theo dựa trên ngày hẹn cuối CŨ
                 const nextDateUTC = calculateNextReminderDate(finalDueDateForCalc, reminder.frequency);

                 if (nextDateUTC) {
                     const nextDateLocalStr = formatDate(nextDateUTC);
                     if (nextDateLocalStr) {
                         // Kiểm tra end_date (ít có ý nghĩa với logic này nhưng giữ lại)
                         let stopRepeating = false;
                         if (reminder.end_date) {
                              const endDateStr = String(reminder.end_date).slice(0, 10);
                              if (/^\d{4}-\d{2}-\d{2}$/.test(endDateStr)) {
                                  if (nextDateLocalStr > endDateStr) {
                                      stopRepeating = true;
                                      console.log(`   -> Stopping repeat for W/M/Y reminder ${reminder.reminder_id} due to end_date.`);
                                  }
                              }
                         }

                         // Nếu không dừng lặp lại -> Tạo mới và Xóa cũ
                         if (!stopRepeating) {
                             // Kiểm tra tồn tại
                             const existingNext = await db.query(
                                 `SELECT reminder_id FROM reminders
                                  WHERE pet_id = ? AND type = ? AND reminder_date = ? AND frequency = ? AND status = 'pending'`,
                                 [reminder.pet_id, reminder.type, nextDateLocalStr, reminder.frequency]
                             );

                             if (existingNext.length === 0) {
                                 const newId = crypto.randomBytes(6).toString('hex');
                                 // Tạo mới với ngày hẹn tiếp theo
                                 const insertResult = await db.execute(
                                     `INSERT INTO reminders (reminder_id, pet_id, type, vaccination_type, reminder_date, frequency, status, is_read, created_at, end_date)
                                      VALUES (?, ?, ?, ?, ?, ?, 'pending', FALSE, NOW(), ?)`,
                                     [newId, reminder.pet_id, reminder.type, reminder.vaccination_type, nextDateLocalStr, reminder.frequency, reminder.end_date]
                                 );

                                 if (insertResult.affectedRows > 0) {
                                     console.log(`   -> Created next ${reminder.frequency} reminder ${newId} for ${nextDateLocalStr}`);
                                     // Gửi email cho reminder MỚI (W/M/Y)
                                     if (reminder.user_email) {
                                         const subject = `PetCare+ Reminder: ${reminder.pet_name}'s ${reminder.type} due on ${nextDateLocalStr}`;
                                         const htmlContent = `...`; // Template HTML tương tự
                                         sendReminderEmail(reminder.user_email, subject, htmlContent)
                                             .catch(err => console.error(`   -> Failed to send ${reminder.frequency} reminder email for ${newId}:`, err));
                                     }
                                     // XÓA reminder cũ (W/M/Y)
                                     console.log(`   -> Deleting old ${reminder.frequency} reminder ${reminder.reminder_id} (date: ${reminder.reminder_date})`);
                                     try {
                                        await db.execute('DELETE FROM reminders WHERE reminder_id = ?', [reminder.reminder_id]);
                                     } catch (deleteOldErr) {
                                         console.error(`   -> FAILED to delete old ${reminder.frequency} reminder ${reminder.reminder_id}:`, deleteOldErr);
                                     }
                                 } else {
                                      console.error(`   -> FAILED to create next ${reminder.frequency} reminder for ${reminder.reminder_id}`);
                                      // Cân nhắc không xóa cái cũ nếu không tạo được cái mới? Hoặc thử lại?
                                 }
                             } else {
                                  console.log(`   -> Skipping creation for W/M/Y ${reminder.reminder_id}, next reminder on ${nextDateLocalStr} already exists.`);
                                  // Xóa bản ghi hiện tại nếu bản ghi tiếp theo đã tồn tại (dọn dẹp)
                                   console.log(`   -> Deleting potentially redundant W/M/Y reminder ${reminder.reminder_id} (date: ${reminder.reminder_date}).`);
                                   try {
                                       await db.execute('DELETE FROM reminders WHERE reminder_id = ?', [reminder.reminder_id]);
                                   } catch (deleteRedundantErr) {
                                       console.error(`   -> FAILED to delete redundant W/M/Y reminder ${reminder.reminder_id}:`, deleteRedundantErr);
                                   }
                             }
                         } else {
                              // Nếu dừng lặp lại (do end_date) -> Xóa bản ghi hiện tại luôn
                              console.log(`   -> Stopping repeat and deleting W/M/Y reminder ${reminder.reminder_id} (date: ${reminder.reminder_date}).`);
                              try {
                                 await db.execute('DELETE FROM reminders WHERE reminder_id = ?', [reminder.reminder_id]);
                              } catch (deleteStopErr) {
                                 console.error(`   -> FAILED to delete stopped W/M/Y reminder ${reminder.reminder_id}:`, deleteStopErr);
                              }
                         }
                     } else {
                          console.warn(`   -> Could not format next date for W/M/Y reminder ${reminder.reminder_id}. Deleting it.`);
                          try { await db.execute('DELETE FROM reminders WHERE reminder_id = ?', [reminder.reminder_id]); } catch (e) {/*ignore*/}
                     }
                 } else {
                      // Không tính được ngày tiếp theo -> Xóa luôn
                      console.warn(`   -> Could not calculate next date for ${reminder.frequency} reminder ${reminder.reminder_id}. Deleting it.`);
                      try {
                         await db.execute('DELETE FROM reminders WHERE reminder_id = ?', [reminder.reminder_id]);
                      } catch (deleteCalcErr) {
                         console.error(`   -> FAILED to delete W/M/Y reminder ${reminder.reminder_id} after calc error:`, deleteCalcErr);
                      }
                 }
            }
            // Các trường hợp khác (ví dụ: W/M/Y chưa đến hạn) -> Bỏ qua trong lần chạy này
            // else { console.log(`   -> Skipping ${reminder.frequency} reminder ${reminder.reminder_id} (date: ${reminder.reminder_date}) - not due yet.`); }

        } // Kết thúc vòng lặp for
        console.log(`[${jobStartTime.toISOString()}] Finished processRepeatingReminders_NewLogic.`);
    } catch (error) {
        console.error('❌ Error processing non-feeding repeating reminders (New Logic):', error);
    }
}

/**
 * Xử lý feeding reminders.
 * (Hàm này giữ nguyên logic cũ vì nó xử lý instance hàng ngày dựa trên giờ)
 */
async function processFeedingReminders() {
    // ====> KHAI BÁO BIẾN TRONG HÀM <====
    const jobStartTime = new Date();
    const nowLocal = jobStartTime;
    const todayLocalStr = nowLocal.toLocaleDateString('sv');
    const currentTimeLocalStr = nowLocal.toLocaleTimeString('sv', { hour12: false });
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
            if (!feedingTimeStr) continue;

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
                                const htmlContent = `...`; // Template HTML cho feeding
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
        }

        // --- 1. Tạo Feeding Reminder Instances ... ---
         const baseFeedings = await db.query( /* ... */ );
         console.log(`   [Feeding] Found ${baseFeedings.length} base schedules to check for instance creation.`);
         for (const baseReminder of baseFeedings) { /* ... Tạo instance nếu cần ... */ }

        // --- 2. Xóa Instance Feeding của Hôm Nay nếu Quá Giờ ---
         console.log(`   [Feeding] Checking instances for deletion on ${todayLocalStr} where TIME('${currentTimeLocalStr}') > feeding_time`);
         const deleteResult = await db.execute( /* ... */ );
         if (deleteResult.affectedRows > 0) { /* ... */ }

        // --- 3. Dọn Dẹp Instance Feeding của Ngày Hôm Qua ---
        const yesterdayLocal = new Date(nowLocal); /* ... */
        const deletedYesterdayResult = await db.execute( /* ... */ );
        if(deletedYesterdayResult.affectedRows > 0){ /* ... */ }

        console.log(`[${jobStartTime.toISOString()}] Finished processFeedingReminders. SetRead: ${setReadCount}, SetUnread: ${setUnreadCount}, Created: ${createdCount}, Deleted Today: ${deletedSpecificTodayCount}, Deleted Yesterday: ${deletedYesterdayNoneCount}.`);
        console.log(`[${jobStartTime.toISOString()}] === 5-MINUTE JOB END ===\n`);

    } catch (error) {
        console.error('❌ Error processing feeding reminders:', error);
        console.log(`[${jobStartTime.toISOString()}] === 5-MINUTE JOB END with ERROR === SetRead: ${setReadCount}, SetUnread: ${setUnreadCount}, Created: ${createdCount}, Deleted Today: ${deletedSpecificTodayCount}, Deleted Yesterday: ${deletedYesterdayNoneCount}.\n`);
    }
}


// --- Lên Lịch Cron Job ---
// Job Hàng Ngày: Chạy lúc 00:01
cron.schedule('1 0 * * *', async () => { 
  console.log(`\n[${new Date().toISOString()}] === DAILY JOB START ===`);
  try {
    // Chỉ cần chạy hàm logic mới
    await processRepeatingReminders_NewLogic();
    // await processExpiredNoneReminders(); // Hàm này không cần nữa
  } catch (e) {
    console.error("Error in DAILY cron job:", e);
  } finally {
    console.log(`[${new Date().toISOString()}] === DAILY JOB END ===`);
  }
});

// Job Thường Xuyên: Chạy mỗi 5 phút (Giữ nguyên cho feeding)
cron.schedule('*/5 * * * *', async () => {
     try {
         await processFeedingReminders();
     } catch (e) { console.error("Error in 5-MINUTE cron job:", e); }
 });

console.log('✅ Cron jobs for reminders scheduled (NEW LOGIC for non-feeding). Waiting for tasks...');
