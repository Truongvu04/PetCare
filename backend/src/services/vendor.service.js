import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// Vendor
export const createVendor = (data) => prisma.vendor.create({ data })
export const findVendorByEmail = (email) => prisma.vendor.findUnique({ where: { email } })
export const findVendorById = (id) => prisma.vendor.findUnique({ where: { id } })
export const updateVendor = (id, payload) => prisma.vendor.update({ where: { id }, data: payload })

// Staff
export const addVendorStaff = (vendorId, staffData) => prisma.vendorStaff.create({ data: { ...staffData, vendorId } })
export const listVendorStaff = (vendorId) => prisma.vendorStaff.findMany({ where: { vendorId } })

// Product
export const createProduct = (vendorId, productData) => prisma.product.create({ data: { ...productData, vendorId } })
export const getProductById = (id) => prisma.product.findUnique({ where: { id } })
export const listProductsByVendor = (vendorId, filter = {}) => {
    const where = { vendorId }
    if (filter.search) {
        where.OR = [
            { title: { contains: filter.search, mode: 'insensitive' } },
            { description: { contains: filter.search, mode: 'insensitive' } }
        ]
    }
    if (typeof filter.active === 'boolean') where.active = filter.active
    if (filter.minPrice || filter.maxPrice) {
        where.price = {}
        if (filter.minPrice) where.price.gte = Number(filter.minPrice)
        if (filter.maxPrice) where.price.lte = Number(filter.maxPrice)
    }
    const orderBy = filter.sort === 'price_asc' ? { price: 'asc' } : filter.sort === 'price_desc' ? { price: 'desc' } : { createdAt: 'desc' }
    return prisma.product.findMany({ where, orderBy })
}
export const updateProduct = (productId, vendorId, payload) => prisma.product.updateMany({ where: { id: productId, vendorId }, data: payload })
export const deleteProduct = (productId, vendorId) => prisma.product.deleteMany({ where: { id: productId, vendorId } })

// Coupon
export const createCoupon = (vendorId, couponData) => prisma.coupon.create({ data: { ...couponData, vendorId } })
export const listCouponsByVendor = (vendorId) => prisma.coupon.findMany({ where: { vendorId } })
export const findCouponById = (id) => prisma.coupon.findUnique({ where: { id } })
export const updateCoupon = (couponId, vendorId, payload) => prisma.coupon.updateMany({ where: { id: couponId, vendorId }, data: payload })
export const deleteCoupon = (couponId, vendorId) => prisma.coupon.deleteMany({ where: { id: couponId, vendorId } })

export const linkCouponToProduct = async (vendorId, productId, couponId) => {
    const [product, coupon] = await Promise.all([
        prisma.product.findUnique({ where: { id: productId } }),
        prisma.coupon.findUnique({ where: { id: couponId } })
    ])
    if (!product || product.vendorId !== vendorId) throw new Error('Product not found or not owned')
    if (!coupon || coupon.vendorId !== vendorId) throw new Error('Coupon not found or not owned')
    return prisma.product.update({ where: { id: productId }, data: { coupons: { connect: { id: couponId } } }, include: { coupons: true } })
}

// Orders
export const listOrdersByVendor = (vendorId, filter = {}) => {
    const where = { vendorId }
    if (filter.status) where.status = filter.status
    return prisma.order.findMany({ where, orderBy: { createdAt: 'desc' } })
}
export const getOrderById = (id) => prisma.order.findUnique({ where: { id } })
export const updateOrderStatus = (orderId, vendorId, status) => prisma.order.updateMany({ where: { id: orderId, vendorId }, data: { status } })
