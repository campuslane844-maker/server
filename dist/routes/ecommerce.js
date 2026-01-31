"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const EcommerceController_1 = require("../controllers/EcommerceController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const ecommerce_1 = require("../validators/ecommerce");
const common_1 = require("../validators/common");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
// Schools (admin only)
router.get('/schools', auth_1.requireAdminAuth, (0, validation_1.validateQuery)(common_1.paginationSchema), EcommerceController_1.EcommerceController.getSchools);
router.post('/schools', auth_1.requireAdminAuth, (0, validation_1.validateBody)(ecommerce_1.createSchoolSchema), EcommerceController_1.EcommerceController.createSchool);
router.patch('/schools/:id', auth_1.requireAdminAuth, (0, validation_1.validateParams)(zod_1.z.object({ id: common_1.mongoIdSchema })), (0, validation_1.validateBody)(ecommerce_1.updateSchoolSchema), EcommerceController_1.EcommerceController.updateSchool);
router.delete('/schools/:id', auth_1.requireAdminAuth, (0, validation_1.validateParams)(zod_1.z.object({ id: common_1.mongoIdSchema })), EcommerceController_1.EcommerceController.deleteSchool);
// Categories (admin only)
router.get('/categories', (0, validation_1.validateQuery)(common_1.paginationSchema), EcommerceController_1.EcommerceController.getCategories);
router.post('/categories', auth_1.requireAdminAuth, (0, validation_1.validateBody)(ecommerce_1.createCategorySchema), EcommerceController_1.EcommerceController.createCategory);
router.patch('/categories/:id', auth_1.requireAdminAuth, (0, validation_1.validateParams)(zod_1.z.object({ id: common_1.mongoIdSchema })), (0, validation_1.validateBody)(ecommerce_1.updateCategorySchema), EcommerceController_1.EcommerceController.updateCategory);
router.delete('/categories/:id', auth_1.requireAdminAuth, (0, validation_1.validateParams)(zod_1.z.object({ id: common_1.mongoIdSchema })), EcommerceController_1.EcommerceController.deleteCategory);
// Products
router.get('/products', (0, validation_1.validateQuery)(common_1.paginationSchema.extend({
    category: common_1.mongoIdSchema.optional(),
    school: common_1.mongoIdSchema.optional(),
    isActive: zod_1.z.string().optional(),
    brand: zod_1.z.string().optional(),
    gender: zod_1.z.string().optional(),
    subject: zod_1.z.string().optional(),
    type: zod_1.z.string().optional(),
    search: zod_1.z.string().optional(),
    minPrice: zod_1.z.string().optional(),
    maxPrice: zod_1.z.string().optional(),
    inStock: zod_1.z.string().optional(),
})), EcommerceController_1.EcommerceController.getProducts);
router.get('/products/:id', (0, validation_1.validateParams)(zod_1.z.object({ id: common_1.mongoIdSchema })), EcommerceController_1.EcommerceController.getProductById);
router.post('/products', auth_1.requireAdminAuth, (0, validation_1.validateBody)(ecommerce_1.createProductSchema), EcommerceController_1.EcommerceController.createProduct);
router.patch('/products/:id', auth_1.requireAdminAuth, (0, validation_1.validateParams)(zod_1.z.object({ id: common_1.mongoIdSchema })), (0, validation_1.validateBody)(ecommerce_1.updateProductSchema), EcommerceController_1.EcommerceController.updateProduct);
router.delete('/products/:id', auth_1.requireAdminAuth, (0, validation_1.validateParams)(zod_1.z.object({ id: common_1.mongoIdSchema })), EcommerceController_1.EcommerceController.deleteProduct);
// Cart
router.get('/cart', auth_1.requireAuth, EcommerceController_1.EcommerceController.getCart);
router.post('/cart/local', EcommerceController_1.EcommerceController.getLocalCart);
router.post('/cart/merge', auth_1.requireAuth, EcommerceController_1.EcommerceController.mergeCart);
router.post('/cart/items', auth_1.requireAuth, (0, validation_1.validateBody)(ecommerce_1.addToCartSchema), EcommerceController_1.EcommerceController.addToCart);
router.patch('/cart/items/:itemId', auth_1.requireAuth, (0, validation_1.validateParams)(zod_1.z.object({ itemId: common_1.mongoIdSchema })), (0, validation_1.validateBody)(ecommerce_1.updateCartItemSchema), EcommerceController_1.EcommerceController.updateCartItem);
router.delete('/cart/items/:itemId', auth_1.requireAuth, (0, validation_1.validateParams)(zod_1.z.object({ itemId: common_1.mongoIdSchema })), EcommerceController_1.EcommerceController.removeCartItem);
router.delete('/cart', auth_1.requireAuth, EcommerceController_1.EcommerceController.clearCart);
// Orders
router.post('/orders/checkout', auth_1.requireAuth, (0, validation_1.validateBody)(ecommerce_1.checkoutSchema), EcommerceController_1.EcommerceController.checkout);
router.post('/orders/reorder/:orderId', auth_1.requireAuth, (0, validation_1.validateParams)(zod_1.z.object({ orderId: common_1.mongoIdSchema })), EcommerceController_1.EcommerceController.reorder);
router.get('/admin/orders', auth_1.requireAdminAuth, (0, validation_1.validateQuery)(common_1.paginationSchema), EcommerceController_1.EcommerceController.getOrders);
router.get('/orders/mine', auth_1.requireAuth, (0, validation_1.validateQuery)(common_1.paginationSchema), EcommerceController_1.EcommerceController.getMyOrders);
router.get('/orders/:id', auth_1.requireAnyAuth, (0, validation_1.validateParams)(zod_1.z.object({ id: common_1.mongoIdSchema })), EcommerceController_1.EcommerceController.getOrderById);
router.patch('/orders/:id/cancel', auth_1.requireAuth, (0, validation_1.validateParams)(zod_1.z.object({ id: common_1.mongoIdSchema })), EcommerceController_1.EcommerceController.cancelOrder);
// Admin order management
router.patch('/admin/orders/:id/status', auth_1.requireAdminAuth, (0, validation_1.validateParams)(zod_1.z.object({ id: common_1.mongoIdSchema })), (0, validation_1.validateBody)(zod_1.z.object({
    status: zod_1.z.enum(["pending", "confirmed", "packed", "shipped", "out_for_delivery", "delivered", "cancelled"])
})), EcommerceController_1.EcommerceController.updateOrderStatus);
// Wishlist
router.get('/wishlist', auth_1.requireAuth, EcommerceController_1.EcommerceController.getWishlist);
router.post('/wishlist', auth_1.requireAuth, (0, validation_1.validateBody)(zod_1.z.object({ productId: common_1.mongoIdSchema })), EcommerceController_1.EcommerceController.addToWishlist);
router.delete('/wishlist/:productId', auth_1.requireAuth, (0, validation_1.validateParams)(zod_1.z.object({ productId: common_1.mongoIdSchema })), EcommerceController_1.EcommerceController.removeFromWishlist);
// Reviews
router.get('/reviews', (0, validation_1.validateQuery)(common_1.paginationSchema.extend({
    productId: common_1.mongoIdSchema.optional(),
})), EcommerceController_1.EcommerceController.getReviews);
router.post('/reviews', auth_1.requireAuth, (0, validation_1.validateBody)(ecommerce_1.createReviewSchema), EcommerceController_1.EcommerceController.createReview);
router.patch('/reviews/:id', auth_1.requireAuth, (0, validation_1.validateParams)(zod_1.z.object({ id: common_1.mongoIdSchema })), (0, validation_1.validateBody)(ecommerce_1.updateReviewSchema), EcommerceController_1.EcommerceController.updateReview);
router.delete('/reviews/:id', auth_1.requireAuth, (0, validation_1.validateParams)(zod_1.z.object({ id: common_1.mongoIdSchema })), EcommerceController_1.EcommerceController.deleteReview);
exports.default = router;
//# sourceMappingURL=ecommerce.js.map