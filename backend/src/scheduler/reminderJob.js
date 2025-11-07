// PetCare/backend/src/scheduler/reminderJob.js
import cron from 'node-cron';
import { prisma } from '../config/prisma.js';
// Đảm bảo import từ file ESM mailer.js gốc của bạn
import { sendReminderEmail } from '../utils/mailer.js'; 

// 1. IMPORT ENUMS (Theo chuẩn project hiện tại)
import pkg from '@prisma/client';
const { ReminderFrequency, ReminderType, ReminderStatus } = pkg; 

// === FIX_7: Đặt múi giờ Việt Nam (GMT+7) ===
const VIETNAM_OFFSET_HOURS = 7;

// --- 2. Helper Functions ---
// (Các hàm helpers: humanizeType, calculateNextReminderDate, generateNonFeedingEmailHtml, generateFeedingEmailHtml giữ nguyên)
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
function calculateNextReminderDate(lastDateUTC, frequency) {
    if (!lastDateUTC) return null;
    const next = new Date(lastDateUTC);
    next.setUTCHours(0, 0, 0, 0); 
    switch (frequency) {
        case 'daily': next.setUTCDate(next.getUTCDate() + 1); break;
        case 'weekly': next.setUTCDate(next.getUTCDate() + 7); break;
        case 'monthly':
            const currentDay = next.getUTCDate();
            next.setUTCMonth(next.getUTCMonth() + 1);
            if (next.getUTCDate() !== currentDay) { next.setUTCDate(0); }
            break;
        case 'yearly': next.setUTCFullYear(next.getUTCFullYear() + 1); break;
        default: return null;
    }
    return next;
}
function generateNonFeedingEmailHtml(reminder, displayDateStr, finalDueDateStr) {
    const petName = reminder.pet?.name || 'your pet';
    const ownerName = reminder.pet?.owner?.full_name || 'Owner';
    const reminderType = humanizeType(reminder.type);
    const vaccinationInfo = reminder.vaccination_type ? `(${reminder.vaccination_type})` : '';
    
    const isDaily = finalDueDateStr && !displayDateStr.includes('tomorrow'); 
    const titleText = isDaily ? 
        `Daily Reminder for ${petName}` : 
        `Reminder for ${petName}`;
    const pText = isDaily ? 
        `<p>This is a daily reminder for <strong>${petName}</strong>'s upcoming appointment:</p>` :
        `<p>Just a reminder for <strong>${petName}</strong> scheduled for ${displayDateStr}:</p>`;
    const finalDateText = finalDueDateStr ? `<p><em>(Final appointment date: ${finalDueDateStr})</em></p>` : '';
    const footerText = finalDueDateStr ? `<em>This is a daily reminder until ${finalDueDateStr}.</em>` : `<em>This is a one-time reminder.</em>`;
    
    return `
    <!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PetCare+ Daily Reminder</title><style>body { font-family: 'Arial', sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
    .header { background-color: #20df6c; color: #ffffff; padding: 20px; text-align: center; } .header h1 { margin: 0; font-size: 24px; }
    .content { padding: 30px; line-height: 1.6; color: #333333; } .content strong { color: #1a9c56; }
    .info-box { background-color: #e8f7f0; border-left: 5px solid #20df6c; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .info-box p { margin: 5px 0; } .footer { text-align: center; padding: 20px; font-size: 12px; color: #888888; background-color: #f4f4f4; }
    .footer em { color: #666666;} </style></head><body><div class="container"><div class="header"><h1>${titleText}</h1></div>
    <div class="content"><p>Hi ${ownerName},</p>${pText}
    <div class="info-box"><p><strong>Reminder Type:</strong> ${reminderType} ${vaccinationInfo}</p>
    <p><strong>Scheduled Date:</strong> ${displayDateStr}</p>${finalDateText}</div>
    <p>Keep up the great care!</p></div><div class="footer">${footerText}<p>&copy; ${new Date().getFullYear()} PetCare+. All rights reserved.</p>
    </div></div></body></html>`;
}
function generateFeedingEmailHtml(reminder, displayTime) {
    const petName = reminder.pet?.name || 'your pet';
    const ownerName = reminder.pet?.owner?.full_name || 'Owner';
    return `
    <!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PetCare+ Feeding Reminder</title><style>body { font-family: 'Arial', sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
    .header { background-color: #20df6c; color: #ffffff; padding: 20px; text-align: center; } .header h1 { margin: 0; font-size: 24px; }
    .content { padding: 30px; line-height: 1.6; color: #333333; } .content strong { color: #1a9c56; }
    .info-box { background-color: #e8f7f0; border-left: 5px solid #20df6c; padding: 15px; margin: 20px 0; border-radius: 4px; text-align: center; }
    .info-box p { margin: 5px 0; } .time-highlight { font-size: 28px; font-weight: bold; color: #1a9c56; margin: 10px 0; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #888888; background-color: #f4f4f4; } .footer em { color: #666666;}
    </style></head><body><div class="container"><div class="header"><h1>PetCare+ Feeding Reminder 🍲</h1></div><div class="content">
    <p>Hi ${ownerName},</p><p>It's almost time to feed <strong>${petName}</strong>!</p><div class="info-box"><p>Scheduled Time Today:</p>
    <p class="time-highlight">${displayTime}</p></div><p>Don't forget!</p></div><div class="footer">
    <em>You are receiving this because a feeding reminder is approaching.</em><p>&copy; ${new Date().getFullYear()} PetCare+. All rights reserved.</p>
    </div></div></body></html>`;
}
// ... (Hết helper functions) ...


// --- 3. Cron Job Logic ---

// (JOB 1: processNonFeedingReminders không thay đổi, nó đã đúng)
async function processNonFeedingReminders() {
    const jobStartTime = new Date();
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); 
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

    console.log(`[${jobStartTime.toISOString()}] === JOB 1 START: Processing Non-Feeding ===`);

    try {
        // (Step 1a: Dọn dẹp base)
        const deletedOldBase = await prisma.reminder.deleteMany({
            where: {
                type: { not: 'feeding' },
                reminder_date: { lt: today }, 
                is_instance: false
            }
        });
        if (deletedOldBase.count > 0) {
            console.log(`   -> [NonFeed Step 1a] Deleted ${deletedOldBase.count} past-due non-feeding BASE reminders.`);
        }
        
        // (Step 1b: Dọn dẹp instance)
         const deletedOldInstance = await prisma.reminder.deleteMany({
            where: {
                type: { not: 'feeding' },
                is_instance: true,
                created_at: { lt: today } 
            }
        });
         if (deletedOldInstance.count > 0) {
            console.log(`   -> [NonFeed Step 1b] Deleted ${deletedOldInstance.count} old non-feeding INSTANCES (created < today).`);
        }

        // (Step 2: Tìm base lặp lại)
        const baseReminders = await prisma.reminder.findMany({
            where: {
                type: { not: 'feeding' },
                frequency: { not: 'none' }, 
                status: ReminderStatus.pending,
                reminder_date: { gte: today }, 
                is_instance: false
            },
            include: { pet: { include: { owner: true } } }
        });

        if (baseReminders.length === 0) {
            console.log("   -> [NonFeed Step 2] No upcoming 'daily/weekly/monthly/yearly' non-feeding base reminders found.");
        } else {
             console.log(`   -> [NonFeed Step 2] Found ${baseReminders.length} upcoming base reminders to check.`);
        
            for (const base of baseReminders) {
                const owner = base.pet?.owner;
                if (!owner?.email) continue; 
                
                const dueDate = base.reminder_date; 
                let shouldCreateInstance = false; 

                // (Step 3: Kiểm tra frequency)
                switch (base.frequency) {
                    case 'daily':
                        if (today <= dueDate) { 
                            shouldCreateInstance = true;
                        }
                        break;
                    case 'weekly':
                        if (today <= dueDate) {
                            const diffTime = dueDate.getTime() - today.getTime();
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                            if (diffDays % 7 === 0) {
                                shouldCreateInstance = true;
                            }
                        }
                        break;
                    case 'monthly':
                        if (today <= dueDate) {
                            if (today.getUTCDate() === dueDate.getUTCDate()) {
                                shouldCreateInstance = true;
                            }
                        }
                        break;
                    case 'yearly':
                         if (today <= dueDate) {
                            if (today.getUTCDate() === dueDate.getUTCDate() && 
                                today.getUTCMonth() === dueDate.getUTCMonth()) {
                                shouldCreateInstance = true;
                            }
                        }
                        break;
                }

                // (Step 4: Chống spam và Tạo instance)
                if (shouldCreateInstance) {
                    // (Logic này đã ĐÚNG: CSDL trước, Email sau)
                    console.log(`   -> [NonFeed Step 4] Attempting to create instance (Freq: ${base.frequency}) for Base ${base.reminder_id} (Date: ${dueDate.toISOString().slice(0, 10)})`);
                    
                    try {
                        // 1. CSDL TRƯỚC
                        await prisma.reminder.create({
                            data: {
                                pet_id: base.pet_id,
                                type: base.type,
                                vaccination_type: base.vaccination_type,
                                reminder_date: base.reminder_date, 
                                frequency: 'none', 
                                status: ReminderStatus.pending, 
                                is_read: false, 
                                is_instance: true,
                                email_sent: false 
                            }
                        });

                        // 2. EMAIL SAU
                        console.log(`   -> [NonFeed Step 4] SUCCESS. Sending EMAIL.`);
                        const finalDueDateStr = dueDate.toISOString().slice(0, 10);
                        const subject = `PetCare+ Reminder: ${base.pet.name}'s ${humanizeType(base.type)}`;
                        const htmlContent = generateNonFeedingEmailHtml(base, finalDueDateStr, finalDueDateStr); 
                        
                        sendReminderEmail(owner.email, subject, htmlContent)
                            .catch(err => console.error(`   -> (Ignorable) Failed to send non-feeding email for ${base.pet_id}:`, err));
                    
                    } catch (err) {
                        if (err.code === 'P2002') { 
                            console.log(`   -> [NonFeed Step 4] Instance already exists (P2002). Skipping.`);
                        } else {
                            console.error(`   -> [NonFeed Step 4] FAILED to create instance for Base ${base.reminder_id}:`, err);
                        }
                        continue;
                    }
                } 
            } 
        } 

        console.log(`[${new Date().toISOString()}] === JOB 1 END ===`);
    
    } catch (error) {
        console.error('❌ Error in JOB 1 (Non-Feeding):', error);
    }
}


/**
 * ===================================================================
 * JOB 2: Xử lý Feeding (Sửa logic V21)
 * ===================================================================
 */
async function processFeedingReminders() {
    const jobStartTime = new Date();
    const now = new Date(); 
    const today = new Date(now);
    today.setUTCHours(0, 0, 0, 0); 
    const yesterday = new Date(today);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1); 
    const timeNowObj = new Date(Date.UTC(1970, 0, 1, now.getUTCHours(), now.getUTCMinutes()));
    const timeNowNum = timeNowObj.getTime();

    console.log(`[${jobStartTime.toISOString()}] --- JOB 2 START (V21): Processing Feeding (TimeNow UTC: ${timeNowObj.toISOString().slice(11, 19)}) ---`);

    try {
        // (Step 0: Dọn 'none', 'non-instance' feeding cũ)
        const deletedOldOneTime = await prisma.reminder.deleteMany({
            where: {
                type: 'feeding',
                frequency: 'none',
                is_instance: false,
                reminder_date: { lt: today } 
            }
        });
         if (deletedOldOneTime.count > 0) {
            console.log(`   -> [Feed Step 0] Deleted ${deletedOldOneTime.count} past-due 'none' (non-instance) feeding reminders.`);
        }

        // (Step 1: Dọn 'instance' feeding cũ)
        const deletedYesterday = await prisma.reminder.deleteMany({
            where: { type: 'feeding', frequency: 'none', reminder_date: yesterday, is_instance: true }
        });
        if (deletedYesterday.count > 0) {
            console.log(`   -> [Feed Step 1] Deleted ${deletedYesterday.count} leftover instances from yesterday.`);
        }

        // (Step 2: Tìm base 'daily' (Tạo instance))
        const baseFeedings = await prisma.reminder.findMany({
            where: {
                type: 'feeding',
                feeding_time: { not: null },
                status: ReminderStatus.pending, 
                is_instance: false, 
                frequency: 'daily', 
                AND: [ { OR: [ { end_date: null }, { end_date: { gte: today } } ] } ],
            },
            include: { pet: { include: { owner: true } } } 
        });

        if (baseFeedings.length === 0) {
            console.log(`   -> [Feed Step 2] No active 'daily' base feeding schedules found.`);
        } else {
            console.log(`   -> [Feed Step 2] Found ${baseFeedings.length} upcoming base schedules to check.`);
            
            for (const base of baseFeedings) {
                if (!base.pet?.owner || !base.feeding_time) continue;

                // === (SỬA LỖI CRASH V20) ===
                // Khai báo biến *bên trong* vòng lặp
                const reminderTime = base.feeding_time; 
                const reminderTimeNum = reminderTime.getTime();
                const tenMinutesBeforeNum = reminderTimeNum - (10 * 60 * 1000);
                // ==========================

                // (Step 3: Check cửa sổ 10 phút)
                if (timeNowNum >= tenMinutesBeforeNum && timeNowNum <= reminderTimeNum) {
                    
                    // === (SỬA LỖI SPAM V21: Quay lại "Check-then-Act") ===
                    
                    // 1. KIỂM TRA (Check)
                    const existingInstanceToday = await prisma.reminder.findFirst({
                        where: {
                            pet_id: base.pet_id,
                            type: 'feeding',
                            feeding_time: reminderTime,
                            reminder_date: today,
                            is_instance: true
                        }
                    });

                    // 2. HÀNH ĐỘNG (Act)
                    if (!existingInstanceToday) {
                        console.log(`   -> [Feed Step 5] Instance not found. Attempting to create instance for Base ${base.reminder_id}.`);
                        try {
                            // 2a. CSDL TRƯỚC
                            await prisma.reminder.create({
                                data: {
                                    pet_id: base.pet_id,
                                    type: 'feeding',
                                    vaccination_type: base.vaccination_type, // (Giữ lại V20 fix)
                                    feeding_time: reminderTime,
                                    reminder_date: today, 
                                    frequency: 'none', 
                                    status: ReminderStatus.pending, 
                                    is_read: false, 
                                    is_instance: true,
                                    email_sent: false 
                                }
                            });

                            // 2b. EMAIL SAU
                            console.log(`   -> [Feed Step 5] SUCCESS. Sending EMAIL for new instance.`);
                            const owner = base.pet.owner;
                            const localTime = new Date(reminderTime.getTime() + (VIETNAM_OFFSET_HOURS * 60 * 60 * 1000));
                            const displayTime = localTime.toISOString().slice(11, 16);
                            const subject = `PetCare+ Feeding Reminder 🍲`;
                            const htmlContent = generateFeedingEmailHtml(base, displayTime); 
                            
                            await sendReminderEmail(owner.email, subject, htmlContent)
                                .catch(err => console.error(`   -> (Ignorable) Failed to send feeding email for ${base.pet_id} (instance already created):`, err));
                            
                        } catch (err) {
                            // 2c. XỬ LÝ LỖI (Race Condition)
                            if (err.code === 'P2002') { 
                                console.log(`   -> [Feed Step 5] Race Condition: Instance already exists (P2002). Skipping email.`);
                            } else {
                                console.error(`   -> [Feed Step 5] FAILED to create instance for Base ${base.reminder_id}:`, err);
                            }
                            
                            // === (SỬA LỖI LOGIC V18) ===
                            // Dùng 'continue' thay vì 'return'
                            // để "Step 6" có thể chạy.
                            continue; 
                            // ==========================
                        }
                    } else {
                        console.log(`   -> [Feed Step 4] Instance for Base ${base.reminder_id} already exists. Skipping.`);
                    }
                    // === (HẾT SỬA LỖI V21) ===
                } 
            } 
        }

        // (Step 6: Xử lý 'feeding' (none, non-instance) HÔM NAY)
        const oneTimeFeedingsToday = await prisma.reminder.findMany({
             where: {
                type: 'feeding',
                feeding_time: { not: null },
                status: ReminderStatus.pending, 
                is_instance: false, 
                frequency: 'none',  
                reminder_date: today 
            },
            include: { pet: { include: { owner: true } } } 
        });

        if (oneTimeFeedingsToday.length > 0) {
            console.log(`   -> [Feed Step 6] Found ${oneTimeFeedingsToday.length} 'none' (non-instance) reminders for today.`);
            for (const r of oneTimeFeedingsToday) {
                 if (!r.pet?.owner || !r.feeding_time) continue;
                 
                 // === (SỬA LỖI CRASH V20) ===
                 // Khai báo biến *bên trong* vòng lặp
                 const reminderTime = r.feeding_time; 
                 const reminderTimeNum = reminderTime.getTime();
                 const tenMinutesBeforeNum = reminderTimeNum - (10 * 60 * 1000);
                 // ==========================
                 
                 if (timeNowNum >= tenMinutesBeforeNum && timeNowNum <= reminderTimeNum) {
                     
                     if (r.email_sent === false) {

                         console.log(`   -> [Feed Step 6] Claiming 'none' reminder ${r.reminder_id}.`);
                         try {
                            // 1. CSDL TRƯỚC
                            await prisma.reminder.update({
                                where: { 
                                    reminder_id: r.reminder_id,
                                    email_sent: false 
                                },
                                data: { 
                                    is_read: false,
                                    email_sent: true 
                                }
                            });
                         
                            // 2. EMAIL SAU
                            console.log(`   -> [Feed Step 6] Sending email for 'none' reminder ${r.reminder_id}.`);
                            const owner = r.pet.owner;
                            const localTime = new Date(reminderTime.getTime() + (VIETNAM_OFFSET_HOURS * 60 * 60 * 1000));
                            const displayTime = localTime.toISOString().slice(11, 16);
                            const subject = `PetCare+ Feeding Reminder 🍲`;
                            const htmlContent = generateFeedingEmailHtml(r, displayTime); 
                                
                            await sendReminderEmail(owner.email, subject, htmlContent)
                                .catch(err => console.error(`   -> (Ignorable) Failed to send 'none' feeding email for ${r.pet_id} (flag already set):`, err));
                         
                         } catch (err) {
                             console.error(`   -> [Feed Step 6] FAILED to claim 'none' reminder ${r.reminder_id}:`, err);
                             continue;
                         }
                     }
                 }
            }
        }

        // (Step 7: Dọn dẹp Instance qua giờ)
        const instancesTodayPast = await prisma.reminder.findMany({
            where: {
                type: 'feeding',
                frequency: 'none',
                reminder_date: today,
                is_instance: true,
                feeding_time: { lt: timeNowObj } 
            }
        });

        if (instancesTodayPast.length > 0) {
            const idsToDelete = instancesTodayPast.map(r => r.reminder_id);
            console.log(`   -> [Feed Step 7] Deleting ${idsToDelete.length} past instances from today.`);
            await prisma.reminder.deleteMany({
                where: { reminder_id: { in: idsToDelete } }
            });
        }

        console.log(`[${jobStartTime.toISOString()}] --- JOB 2 END (V21) ---`);

    } catch (error) {
        console.error('❌ Error in JOB 2 (Feeding) (V21):', error);
    }
}
// ===================================================================
// === HẾT PHẦN JOB 2 ========================================
// ===================================================================


// --- 4. Lên Lịch Cron Job ---
cron.schedule('1 0 * * *', async () => { 
    try {
        await processNonFeedingReminders();
    } catch (e) {
        console.error("CRITICAL Error in NON-FEEDING (All Tasks) cron job:", e);
    }
});


cron.schedule('*/5 * * * *', async () => {
    try {
        await processFeedingReminders();
    } catch (e) { 
        console.error("CRITICAL Error in 5-MINUTE (Feeding Activate) cron job:", e); 
    }
});

console.log('✅ Cron jobs for reminders scheduled (V21 LOGIC - Final Fix). Waiting for tasks...');
