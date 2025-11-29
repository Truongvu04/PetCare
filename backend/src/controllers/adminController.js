import { prisma } from "../config/prisma.js";

/**
 * GET /api/admin/stats
 * Lấy thống kê tổng quan: Total Users, Vendors, Orders, Revenue
 */
export const getAdminStats = async (req, res) => {
  try {
    // Total Users (active only)
    const totalUsers = await prisma.users.count({
      where: { is_active: true }
    });

    // Total Vendors (chỉ đếm users có role = 'vendor' và is_active = true)
    const totalVendors = await prisma.users.count({
      where: { 
        role: 'vendor',
        is_active: true
      }
    });

    // Total Orders
    const totalOrders = await prisma.orders.count();

    // Total Revenue (từ orders có status 'delivered')
    const revenueResult = await prisma.orders.aggregate({
      where: {
        status: 'delivered'
      },
      _sum: {
        total: true
      }
    });

    const totalRevenue = revenueResult._sum.total || 0;

    // Revenue by month (last 6 months) for chart
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const ordersByMonth = await prisma.orders.findMany({
      where: {
        status: 'delivered',
        created_at: {
          gte: sixMonthsAgo
        }
      },
      select: {
        total: true,
        created_at: true
      }
    });

    // Group by month
    const revenueByMonth = {};
    ordersByMonth.forEach(order => {
      const month = new Date(order.created_at).toISOString().slice(0, 7); // YYYY-MM
      if (!revenueByMonth[month]) {
        revenueByMonth[month] = 0;
      }
      revenueByMonth[month] += Number(order.total);
    });

    // Format for chart
    const chartData = Object.keys(revenueByMonth)
      .sort()
      .map(month => ({
        month,
        revenue: revenueByMonth[month]
      }));

    res.json({
      stats: {
        totalUsers,
        totalVendors,
        totalOrders,
        totalRevenue: Number(totalRevenue)
      },
      chartData
    });
  } catch (error) {
    console.error("❌ Error in getAdminStats:", error);
    res.status(500).json({ message: "Lỗi khi lấy thống kê", error: error.message });
  }
};

/**
 * GET /api/admin/users
 * Lấy danh sách users với pagination
 */
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const { role } = req.query; // Filter by role
    
    const where = {
      ...(search && {
        OR: [
          { full_name: { contains: search } },
          { email: { contains: search } }
        ]
      }),
      ...(role && role !== 'all' && { role })
    };

    const [users, total] = await Promise.all([
      prisma.users.findMany({
        where,
        skip,
        take: parseInt(limit),
        select: {
          user_id: true,
          full_name: true,
          email: true,
          role: true,
          is_active: true,
          avatar_url: true,
          created_at: true,
          vendors: {
            select: {
              vendor_id: true,
              store_name: true
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        }
      }),
      prisma.users.count({ where })
    ]);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("❌ Error in getAllUsers:", error);
    res.status(500).json({ message: "Lỗi khi lấy danh sách users", error: error.message });
  }
};

/**
 * PUT /api/admin/users/:id/status
 * Khóa/mở khóa user (toggle is_active)
 */
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    if (typeof is_active !== 'boolean') {
      return res.status(400).json({ message: "is_active phải là boolean" });
    }

    // Không cho phép khóa chính mình
    if (parseInt(id) === req.user.user_id) {
      return res.status(400).json({ message: "Bạn không thể khóa chính mình" });
    }

    const user = await prisma.users.update({
      where: { user_id: parseInt(id) },
      data: { is_active },
      select: {
        user_id: true,
        full_name: true,
        email: true,
        is_active: true
      }
    });

    res.json({
      message: is_active ? "Đã mở khóa tài khoản" : "Đã khóa tài khoản",
      user
    });
  } catch (error) {
    console.error("❌ Error in updateUserStatus:", error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: "User không tồn tại" });
    }
    res.status(500).json({ message: "Lỗi khi cập nhật trạng thái user", error: error.message });
  }
};

/**
 * GET /api/admin/users/:id
 * Lấy thông tin chi tiết của một user
 */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.users.findUnique({
      where: { user_id: parseInt(id) },
      select: {
        user_id: true,
        full_name: true,
        email: true,
        phone: true,
        role: true,
        is_active: true,
        avatar_url: true,
        created_at: true,
        vendors: {
          select: {
            vendor_id: true,
            store_name: true,
            status: true,
            address: true,
            phone: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: "User không tồn tại" });
    }

    res.json({ user });
  } catch (error) {
    console.error("❌ Error in getUserById:", error);
    res.status(500).json({ message: "Lỗi khi lấy thông tin user", error: error.message });
  }
};

/**
 * PUT /api/admin/users/:id
 * Cập nhật thông tin user (full_name, email, phone, role)
 */
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email, phone, role } = req.body;

    // Không cho phép thay đổi role của chính mình
    if (parseInt(id) === req.user.user_id && role && role !== req.user.role) {
      return res.status(400).json({ message: "Bạn không thể thay đổi role của chính mình" });
    }

    // Validate role nếu có
    if (role && !['admin', 'vendor', 'owner'].includes(role)) {
      return res.status(400).json({ message: "Role không hợp lệ. Phải là: admin, vendor, hoặc owner" });
    }

    // Validate email format nếu có
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Email không hợp lệ" });
    }

    const updateData = {};
    if (full_name !== undefined) updateData.full_name = full_name.trim();
    if (email !== undefined) updateData.email = email.trim();
    if (phone !== undefined) updateData.phone = phone?.trim() || null;
    if (role !== undefined) updateData.role = role;

    const user = await prisma.users.update({
      where: { user_id: parseInt(id) },
      data: updateData,
      select: {
        user_id: true,
        full_name: true,
        email: true,
        phone: true,
        role: true,
        is_active: true,
        avatar_url: true,
        vendors: {
          select: {
            vendor_id: true,
            store_name: true,
            status: true
          }
        }
      }
    });

    res.json({
      message: "Đã cập nhật thông tin user thành công",
      user
    });
  } catch (error) {
    console.error("❌ Error in updateUser:", error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: "User không tồn tại" });
    }
    if (error.code === 'P2002') {
      return res.status(400).json({ message: "Email đã được sử dụng bởi user khác" });
    }
    res.status(500).json({ message: "Lỗi khi cập nhật thông tin user", error: error.message });
  }
};

/**
 * GET /api/admin/products/pending
 * Lấy danh sách sản phẩm chờ duyệt
 */
export const getPendingProducts = async (req, res) => {
  try {
    const products = await prisma.products.findMany({
      where: {
        status: 'PENDING'
      },
      include: {
        vendors: {
          select: {
            vendor_id: true,
            store_name: true,
            users: {
              select: {
                user_id: true,
                full_name: true,
                email: true
              }
            }
          }
        },
        product_images: {
          select: {
            image_url: true,
            is_thumbnail: true
          },
          orderBy: {
            is_thumbnail: 'desc'
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    res.json({ products });
  } catch (error) {
    console.error("❌ Error in getPendingProducts:", error);
    res.status(500).json({ message: "Lỗi khi lấy danh sách sản phẩm chờ duyệt", error: error.message });
  }
};

/**
 * PUT /api/admin/products/:id/approval
 * Duyệt hoặc từ chối sản phẩm
 */
export const approveProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejection_reason } = req.body;

    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: "Status phải là APPROVED hoặc REJECTED" });
    }

    // Nếu từ chối, bắt buộc phải có lý do
    if (status === 'REJECTED' && (!rejection_reason || rejection_reason.trim().length === 0)) {
      return res.status(400).json({ message: "Vui lòng nhập lý do từ chối" });
    }

    const updateData = {
      status,
      ...(status === 'REJECTED' && { rejection_reason: rejection_reason.trim() }),
      ...(status === 'APPROVED' && { rejection_reason: null })
    };

    const product = await prisma.products.update({
      where: { product_id: parseInt(id) },
      data: updateData,
      include: {
        vendors: {
          select: {
            store_name: true
          }
        }
      }
    });

    res.json({
      message: status === 'APPROVED' ? "Đã duyệt sản phẩm" : "Đã từ chối sản phẩm",
      product
    });
  } catch (error) {
    console.error("❌ Error in approveProduct:", error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }
    res.status(500).json({ message: "Lỗi khi cập nhật trạng thái sản phẩm", error: error.message });
  }
};

/**
 * GET /api/admin/vendors/pending
 * Lấy danh sách vendor requests chờ duyệt
 */
export const getPendingVendors = async (req, res) => {
  try {
    const vendors = await prisma.vendors.findMany({
      where: {
        status: 'pending'
      },
      include: {
        users: {
          select: {
            user_id: true,
            full_name: true,
            email: true,
            phone: true,
            avatar_url: true,
            created_at: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    res.json({ vendors });
  } catch (error) {
    console.error("❌ Error in getPendingVendors:", error);
    res.status(500).json({ message: "Lỗi khi lấy danh sách vendor chờ duyệt", error: error.message });
  }
};

/**
 * PUT /api/admin/vendors/:id/approval
 * Duyệt hoặc từ chối vendor request
 */
export const approveVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejection_reason } = req.body;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "Status phải là 'approved' hoặc 'rejected'" });
    }

    // Nếu từ chối, bắt buộc phải có lý do
    if (status === 'rejected' && (!rejection_reason || rejection_reason.trim().length === 0)) {
      return res.status(400).json({ message: "Vui lòng nhập lý do từ chối" });
    }

    // Cập nhật vendor status
    const updateData = {
      status,
      ...(status === 'rejected' && { rejection_reason: rejection_reason.trim() }),
      ...(status === 'approved' && { rejection_reason: null })
    };

    const vendor = await prisma.vendors.update({
      where: { vendor_id: parseInt(id) },
      data: updateData,
      include: {
        users: {
          select: {
            user_id: true,
            full_name: true,
            email: true,
            role: true
          }
        }
      }
    });

    // Nếu approve, cập nhật role của user thành 'vendor' nếu chưa phải
    if (status === 'approved' && vendor.users.role !== 'vendor') {
      await prisma.users.update({
        where: { user_id: vendor.users.user_id },
        data: { role: 'vendor' }
      });
    }

    res.json({
      message: status === 'approved' ? "Đã duyệt vendor" : "Đã từ chối vendor",
      vendor
    });
  } catch (error) {
    console.error("❌ Error in approveVendor:", error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: "Vendor không tồn tại" });
    }
    res.status(500).json({ message: "Lỗi khi cập nhật trạng thái vendor", error: error.message });
  }
};

