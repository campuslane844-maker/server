"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateReviewSchema = exports.createReviewSchema = exports.checkoutSchema = exports.updateCartItemSchema = exports.addToCartSchema = exports.updateProductSchema = exports.createProductSchema = exports.productVariantSchema = exports.updateCategorySchema = exports.createCategorySchema = exports.updateSchoolSchema = exports.createSchoolSchema = void 0;
const zod_1 = require("zod");
exports.createSchoolSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'School name is required'),
    logo: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    city: zod_1.z.string().optional(),
    state: zod_1.z.string().optional(),
    country: zod_1.z.string().optional(),
    pincode: zod_1.z.string().optional(),
});
exports.updateSchoolSchema = exports.createSchoolSchema.partial();
exports.createCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Category name is required'),
    description: zod_1.z.string().optional(),
    image: zod_1.z.string()
});
exports.updateCategorySchema = exports.createCategorySchema.partial();
exports.productVariantSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Variant name is required'),
    price: zod_1.z.number().min(0, 'Price must be non-negative'),
    cutoffPrice: zod_1.z.number().min(0, 'Cutoff price must be non-negative').optional(),
    stock: zod_1.z.number().int().min(0, 'Stock must be non-negative').default(0),
    images: zod_1.z.array(zod_1.z.string()).optional(),
    _id: zod_1.z.string().optional()
});
exports.createProductSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Product name is required'),
    description: zod_1.z.string().optional(),
    category: zod_1.z.string().min(1, 'Category ID is required'),
    images: zod_1.z.array(zod_1.z.string()).default([]),
    variants: zod_1.z.array(exports.productVariantSchema).min(1, 'At least one variant is required'),
    school: zod_1.z.string().optional(),
    gender: zod_1.z.enum(['Boys', 'Girls', 'Unisex']).optional(),
    classLevel: zod_1.z.string().optional(),
    subject: zod_1.z.string().optional(),
    brand: zod_1.z.string().optional(),
    type: zod_1.z.string().optional(),
    isActive: zod_1.z.boolean().default(true),
});
exports.updateProductSchema = exports.createProductSchema.partial();
exports.addToCartSchema = zod_1.z.object({
    productId: zod_1.z.string().min(1, 'Product ID is required'),
    variantId: zod_1.z.string().min(1, 'Variant ID is required'),
    quantity: zod_1.z.number().int().min(1, 'Quantity must be at least 1'),
});
exports.updateCartItemSchema = zod_1.z.object({
    quantity: zod_1.z.number().int().min(1, 'Quantity must be at least 1'),
});
exports.checkoutSchema = zod_1.z.object({
    paymentType: zod_1.z.enum(['COD', 'Razorpay']),
    shippingAddress: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Name is required'),
        phone: zod_1.z.string().min(1, 'Phone is required'),
        street: zod_1.z.string().min(1, 'Street is required'),
        streetOptional: zod_1.z.string().optional(),
        city: zod_1.z.string().min(1, 'City is required'),
        state: zod_1.z.string().min(1, 'State is required'),
        zipcode: zod_1.z.string().min(1, 'Zipcode is required'),
        country: zod_1.z.string().min(1, 'Country is required'),
    }),
    deliveryRate: zod_1.z.number().min(0).default(0),
    freeShipping: zod_1.z.boolean().default(false),
});
exports.createReviewSchema = zod_1.z.object({
    productId: zod_1.z.string().min(1, 'Product ID is required'),
    rating: zod_1.z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
    comment: zod_1.z.string().optional(),
});
exports.updateReviewSchema = zod_1.z.object({
    rating: zod_1.z.number().int().min(1).max(5, 'Rating must be between 1 and 5').optional(),
    comment: zod_1.z.string().optional(),
});
//# sourceMappingURL=ecommerce.js.map