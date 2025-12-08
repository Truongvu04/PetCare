import cron from 'node-cron';
import { prisma } from '../config/prisma.js';

/**
 * Cron job để xóa/hủy orders có status PENDING lâu hơn 15 phút
 * Chạy mỗi 5 phút
 */
export const startCleanupPendingOrdersJob = () => {
  // Chạy mỗi 5 phút: "*/5 * * * *"
  cron.schedule('*/5 * * * *', async () => {
    try {
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

      // Tìm tất cả PENDING orders được tạo trước 15 phút
      const expiredOrders = await prisma.orders.findMany({
        where: {
          status: 'pending',
          created_at: {
            lt: fifteenMinutesAgo
          }
        },
        include: { order_items: true }
      });

      if (expiredOrders.length === 0) {
        console.log('[CLEANUP JOB] No expired pending orders found');
        return;
      }

      console.log(`[CLEANUP JOB] Found ${expiredOrders.length} expired pending orders. Processing cleanup...`);

      // Xóa/hủy từng order và restore stock
      for (const order of expiredOrders) {
        try {
          await prisma.$transaction(async (tx) => {
            // Restore stock cho tất cả items
            if (order.order_items && order.order_items.length > 0) {
              for (const item of order.order_items) {
                await tx.products.update({
                  where: { product_id: item.product_id },
                  data: { stock: { increment: item.quantity || 1 } }
                });
              }
            }

            // Xóa order
            await tx.orders.delete({
              where: { order_id: order.order_id }
            });
          });

          console.log(`✅ [CLEANUP] Order #${order.order_id} deleted. Stock restored.`);
        } catch (err) {
          console.error(`❌ [CLEANUP] Error deleting order #${order.order_id}:`, err.message);
        }
      }

      console.log(`[CLEANUP JOB] Completed. ${expiredOrders.length} orders cleaned up.`);
    } catch (err) {
      console.error('[CLEANUP JOB] Error:', err);
    }
  });

  console.log('✅ Cleanup pending orders job scheduled (every 5 minutes)');
};

export default startCleanupPendingOrdersJob;
