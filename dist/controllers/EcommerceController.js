"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EcommerceController = void 0;
const School_1 = require("../models/School");
const Category_1 = require("../models/Category");
const Product_1 = require("../models/Product");
const Cart_1 = require("../models/Cart");
const Order_1 = require("../models/Order");
const Wishlist_1 = require("../models/Wishlist");
const Review_1 = require("../models/Review");
const asyncHandler_1 = require("../utils/asyncHandler");
const errors_1 = require("../utils/errors");
const pagination_1 = require("../utils/pagination");
const NotificationService_1 = require("../services/NotificationService");
const mongoose_1 = __importDefault(require("mongoose"));
const Shipping_1 = require("../models/Shipping");
class EcommerceController {
}
exports.EcommerceController = EcommerceController;
_a = EcommerceController;
// Schools
EcommerceController.getSchools = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { search, page, limit } = req.query;
    const { skip } = (0, pagination_1.getPaginationParams)(req.query);
    const filter = { isDeleted: false };
    if (search) {
        filter.$text = { $search: search };
    }
    const [schools, total] = await Promise.all([
        School_1.School.find(filter).sort({ name: 1 }).skip(skip).limit(limit),
        School_1.School.countDocuments(filter),
    ]);
    const result = (0, pagination_1.createPaginationResult)(schools, total, page, limit);
    res.status(200).json({
        success: true,
        ...result,
    });
});
EcommerceController.createSchool = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const school = new School_1.School(req.body);
    await school.save();
    res.status(201).json({
        success: true,
        data: school,
    });
});
EcommerceController.updateSchool = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const school = await School_1.School.findOneAndUpdate({ _id: id, isDeleted: false }, req.body, { new: true, runValidators: true });
    if (!school) {
        throw new errors_1.NotFoundError("School not found");
    }
    res.status(200).json({
        success: true,
        data: school,
    });
});
EcommerceController.deleteSchool = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const school = await School_1.School.findOneAndUpdate({ _id: id, isDeleted: false }, {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: req.admin._id,
    }, { new: true });
    if (!school) {
        throw new errors_1.NotFoundError("School not found");
    }
    res.status(200).json({
        success: true,
        message: "School deleted successfully",
    });
});
// Categories
EcommerceController.getCategories = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { search, page, limit } = req.query;
    const { skip } = (0, pagination_1.getPaginationParams)(req.query);
    console.log(req.query);
    const filter = { isDeleted: false };
    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
        ];
    }
    const [categories, total] = await Promise.all([
        Category_1.Category.find(filter).sort({ name: 1 }).skip(skip).limit(limit),
        Category_1.Category.countDocuments(filter),
    ]);
    const result = (0, pagination_1.createPaginationResult)(categories, total, page, limit);
    res.status(200).json({
        success: true,
        ...result,
    });
});
EcommerceController.createCategory = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const category = new Category_1.Category(req.body);
    await category.save();
    res.status(201).json({
        success: true,
        data: category,
    });
});
EcommerceController.updateCategory = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const category = await Category_1.Category.findOneAndUpdate({ _id: id, isDeleted: false }, req.body, { new: true, runValidators: true });
    if (!category) {
        throw new errors_1.NotFoundError("Category not found");
    }
    res.status(200).json({
        success: true,
        data: category,
    });
});
EcommerceController.deleteCategory = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const category = await Category_1.Category.findOneAndUpdate({ _id: id, isDeleted: false }, {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: req.admin._id,
    }, { new: true });
    if (!category) {
        throw new errors_1.NotFoundError("Category not found");
    }
    res.status(200).json({
        success: true,
        message: "Category deleted successfully",
    });
});
EcommerceController.getProducts = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    try {
        const { category, school, brand, gender, subject, type, search, isActive, minPrice, maxPrice, inStock, sort = "relevance", page = 1, limit = 12, } = req.query;
        const { skip } = (0, pagination_1.getPaginationParams)(req.query);
        const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const baseMatch = { isDeleted: false };
        if (category)
            baseMatch.category = mongoose_1.default.Types.ObjectId.isValid(category)
                ? new mongoose_1.default.Types.ObjectId(category)
                : category;
        if (school)
            baseMatch.school = mongoose_1.default.Types.ObjectId.isValid(school)
                ? new mongoose_1.default.Types.ObjectId(school)
                : school;
        if (brand)
            baseMatch.brand = brand;
        if (gender)
            baseMatch.gender = gender;
        if (subject)
            baseMatch.subject = subject;
        if (type)
            baseMatch.type = type;
        if (isActive !== undefined)
            baseMatch.isActive = isActive === "true";
        const hasMin = minPrice !== undefined && minPrice !== null && minPrice !== "";
        const hasMax = maxPrice !== undefined && maxPrice !== null && maxPrice !== "";
        const buildRestPipeline = (opts) => {
            const pipeline = [];
            // If text score requested, add it (must come after $match)
            if (opts.includeTextScore) {
                pipeline.push({ $addFields: { score: { $meta: "textScore" } } });
            }
            // LOOKUP variants from the separate collection
            pipeline.push({
                $lookup: {
                    from: "variants", // collection name for Variant model
                    localField: "_id",
                    foreignField: "product",
                    as: "variants",
                },
            });
            // unwind the looked-up variants (allow products with zero variants)
            pipeline.push({
                $unwind: { path: "$variants", preserveNullAndEmptyArrays: true },
            });
            // price filters on variants
            if (hasMin || hasMax) {
                const priceFilter = {};
                if (hasMin)
                    priceFilter.$gte = Number(minPrice);
                if (hasMax)
                    priceFilter.$lte = Number(maxPrice);
                pipeline.push({ $match: { "variants.price": priceFilter } });
            }
            // in-stock filter
            if (inStock === "true") {
                pipeline.push({ $match: { "variants.stock": { $gt: 0 } } });
            }
            // group back to product-level and compute aggregates
            pipeline.push({
                $group: {
                    _id: "$_id",
                    doc: { $first: "$$ROOT" },
                    variants: { $push: "$variants" },
                    minPrice: { $min: "$variants.price" },
                    totalStock: { $sum: { $ifNull: ["$variants.stock", 0] } },
                },
            });
            // re-attach aggregated fields and variants to the root doc
            pipeline.push({
                $replaceRoot: {
                    newRoot: {
                        $mergeObjects: [
                            "$doc",
                            {
                                minPrice: "$minPrice",
                                totalStock: "$totalStock",
                                variants: "$variants",
                            },
                        ],
                    },
                },
            });
            // lookups for referenced objects (category, school) — keep as before
            pipeline.push({
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "category",
                },
            }, {
                $unwind: { path: "$category", preserveNullAndEmptyArrays: true },
            }, {
                $lookup: {
                    from: "schools",
                    localField: "school",
                    foreignField: "_id",
                    as: "school",
                },
            }, { $unwind: { path: "$school", preserveNullAndEmptyArrays: true } });
            return pipeline;
        };
        const buildFullPipeline = (firstMatch, usedText) => {
            const pipeline = [
                { $match: firstMatch },
                ...buildRestPipeline({ includeTextScore: usedText }),
            ];
            const sortStage = {};
            if (sort === "price_asc")
                sortStage.minPrice = 1;
            else if (sort === "price_desc")
                sortStage.minPrice = -1;
            else if (sort === "newest")
                sortStage.createdAt = -1;
            else if (sort === "relevance" && usedText)
                sortStage.score = { $meta: "textScore" };
            else
                sortStage.createdAt = -1;
            pipeline.push({
                $facet: {
                    docs: [
                        { $sort: sortStage },
                        { $skip: skip },
                        { $limit: Number(limit) },
                    ],
                    totalCount: [{ $count: "count" }],
                },
            });
            return pipeline;
        };
        const isPlannerError = (err) => {
            const code = err?.code || err?.errorResponse?.code;
            const msg = String(err?.message || err?.errmsg || "");
            return (code === 291 ||
                msg.includes("No query solutions") ||
                msg.includes("NoQueryExecutionPlans"));
        };
        let aggResult = [];
        if (search) {
            const textFirstMatch = {
                ...baseMatch,
                $text: { $search: String(search) },
            };
            try {
                const pipeline = buildFullPipeline(textFirstMatch, true);
                aggResult = await Product_1.Product.aggregate(pipeline).exec();
            }
            catch (err) {
                if (isPlannerError(err)) {
                    const escaped = escapeRegex(String(search));
                    const regexMatch = {
                        ...baseMatch,
                        $or: [
                            { name: { $regex: escaped, $options: "i" } },
                            { description: { $regex: escaped, $options: "i" } },
                            { brand: { $regex: escaped, $options: "i" } },
                        ],
                    };
                    const pipeline = buildFullPipeline(regexMatch, false);
                    aggResult = await Product_1.Product.aggregate(pipeline).exec();
                }
                else {
                    throw err;
                }
            }
        }
        else {
            const pipeline = buildFullPipeline(baseMatch, false);
            aggResult = await Product_1.Product.aggregate(pipeline).exec();
        }
        const products = aggResult[0]?.docs || [];
        const total = aggResult[0]?.totalCount?.[0]?.count || 0;
        return res.status(200).json({
            success: true,
            docs: products,
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.max(1, Math.ceil(total / Number(limit))),
        });
    }
    catch (err) {
        console.error("getProducts error", err);
        return res.status(500).json({ success: false, error: "Server error" });
    }
});
EcommerceController.getProductById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const product = await Product_1.Product.findOne({ _id: id, isDeleted: false })
        .populate("category", "name")
        .populate("school", "name")
        .populate("classLevel", "name")
        .lean(); // plain object for merging
    if (!product) {
        throw new errors_1.NotFoundError("Product not found");
    }
    // fetch variants from separate collection
    const variants = await Product_1.Variant.find({ product: product._id }).lean();
    // return product + variants together
    res.status(200).json({
        success: true,
        data: {
            ...product,
            variants,
        },
    });
});
EcommerceController.createProduct = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { variants, ...productData } = req.body;
    // Step 1: Create product
    const product = new Product_1.Product(productData);
    await product.save();
    let createdVariants = [];
    if (Array.isArray(variants) && variants.length > 0) {
        const variantDocs = variants.map((variant) => ({
            ...variant,
            product: product._id,
        }));
        createdVariants = (await Product_1.Variant.insertMany(variantDocs)).map((v) => v.toObject?.() ?? v);
    }
    res.status(201).json({
        success: true,
        data: {
            product: product.toObject(),
            variants: createdVariants,
        },
    });
});
EcommerceController.updateProduct = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { variants, ...productData } = req.body;
    console.log(req.body);
    // Step 1: Update product
    const product = await Product_1.Product.findOneAndUpdate({ _id: id, isDeleted: false }, productData, { new: true } // return updated product
    );
    if (!product) {
        throw new errors_1.NotFoundError("Product not found");
    }
    let updatedVariants = [];
    // Step 2: Handle variants
    if (Array.isArray(variants) && variants.length > 0) {
        for (const variant of variants) {
            if (variant._id) {
                const { _id, ...updateData } = variant; // strip _id from update payload
                const variantId = new mongoose_1.default.Types.ObjectId(variant._id);
                const updated = await Product_1.Variant.findOneAndUpdate({ _id: variantId, product: id }, // must match both _id and product
                { $set: updateData }, { new: true });
                if (updated) {
                    updatedVariants.push(updated.toObject());
                }
                else {
                    // If somehow not found, you decide: throw error or create
                    // throw new NotFoundError("Variant not found");
                }
            }
            else {
                const newVariant = await Product_1.Variant.create({
                    ...variant,
                    product: product._id,
                });
                updatedVariants.push(newVariant.toObject());
            }
        }
    }
    // Step 3: Return updated product + variants
    res.status(200).json({
        success: true,
        data: {
            product: product.toObject(),
            variants: updatedVariants,
        },
    });
});
EcommerceController.deleteProduct = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    // Step 1: Soft delete product
    const product = await Product_1.Product.findOneAndUpdate({ _id: id, isDeleted: false }, {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: req.admin._id,
    }, { new: true });
    if (!product) {
        throw new errors_1.NotFoundError("Product not found");
    }
    // Step 2: Soft delete related variants
    await Product_1.Variant.updateMany({ product: product._id, isDeleted: { $ne: true } }, {
        $set: {
            isDeleted: true,
            deletedAt: new Date(),
            deletedBy: req.admin._id,
        },
    });
    res.status(200).json({
        success: true,
        message: "Product and its variants deleted successfully",
    });
});
// Cart
EcommerceController.getCart = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user._id;
    let cart = await Cart_1.Cart.findOne({ userId })
        .populate({
        path: "items.productId",
        select: "name images category brand",
        populate: { path: "category", select: "name" },
    })
        .populate({
        path: "items.variantId",
        select: "name price stock images",
    });
    if (!cart) {
        cart = await Cart_1.Cart.create({ userId, items: [] });
        return res.status(200).json({ success: true, data: cart });
    }
    // Step 1: Attach selectedVariant info into each cart item
    cart.items = cart.items.map((item) => {
        const product = item.productId;
        const variant = item.variantId;
        return {
            ...item,
            productId: {
                ...product,
                selectedVariant: variant || null,
            },
            currentPrice: variant?.price ?? item.price, // prefer latest price
            currentStock: variant?.stock ?? 0, // live stock
            isPriceChanged: variant && variant.price !== item.price,
        };
    });
    return res.status(200).json({
        success: true,
        data: cart,
    });
});
EcommerceController.addToCart = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { productId, variantId, quantity } = req.body;
    const userId = req.user._id;
    // Step 1: Verify product exists & active
    const product = await Product_1.Product.findOne({
        _id: productId,
        isActive: true,
        isDeleted: false,
    });
    if (!product) {
        throw new errors_1.NotFoundError("Product not found or inactive");
    }
    // Step 2: Verify variant exists and belongs to product
    const variant = await Product_1.Variant.findOne({
        _id: variantId,
        product: product._id,
    });
    if (!variant) {
        throw new errors_1.NotFoundError("Product variant not found");
    }
    // Step 3: Check stock
    if (variant.stock < quantity) {
        throw new errors_1.ValidationError("Insufficient stock");
    }
    // Step 4: Find or create cart
    let cart = await Cart_1.Cart.findOne({ userId });
    if (!cart) {
        cart = new Cart_1.Cart({ userId, items: [] });
    }
    // Step 5: Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex((item) => item.productId.toString() === productId &&
        item.variantId.toString() === variantId);
    if (existingItemIndex > -1) {
        // ✅ Increase quantity
        cart.items[existingItemIndex].quantity += quantity;
    }
    else {
        // ✅ Add new item
        cart.items.push({
            productId,
            variantId,
            quantity,
            price: variant.price, // snapshot current price
        });
    }
    await cart.save();
    res.status(200).json({
        success: true,
        data: cart,
    });
});
EcommerceController.updateCartItem = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { itemId } = req.params;
    const { quantity, variantId } = req.body;
    const userId = req.user._id;
    // Step 1: Find cart
    const cart = await Cart_1.Cart.findOne({ userId });
    if (!cart) {
        throw new errors_1.NotFoundError("Cart not found");
    }
    // Step 2: Find cart item
    const item = cart.items.find((i) => i._id.toString() === itemId.toString());
    if (!item) {
        throw new errors_1.NotFoundError("Cart item not found");
    }
    // Step 3: Update quantity
    if (quantity !== undefined) {
        if (quantity < 1) {
            throw new errors_1.ValidationError("Quantity must be at least 1");
        }
        item.quantity = quantity;
    }
    // Step 4: Update variant
    if (variantId) {
        // Validate product exists
        const product = await Product_1.Product.findById(item.productId);
        if (!product) {
            throw new errors_1.NotFoundError("Product not found");
        }
        // Validate variant exists for this product
        const variant = await Product_1.Variant.findOne({
            _id: variantId,
            product: product._id,
        });
        if (!variant) {
            throw new errors_1.NotFoundError("Variant not found for this product");
        }
        // Update item with new variant + price snapshot
        item.variantId = variant._id;
        item.price = variant.price;
    }
    await cart.save();
    res.status(200).json({
        success: true,
        data: cart,
    });
});
EcommerceController.removeCartItem = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { itemId } = req.params;
    const userId = req.user._id;
    const cart = await Cart_1.Cart.findOne({ userId });
    if (!cart) {
        throw new errors_1.NotFoundError("Cart not found");
    }
    // ✅ Remove by cart item _id (so multiple variants of same product work fine)
    const beforeCount = cart.items.length;
    cart.items = cart.items.filter((item) => item._id.toString() !== itemId.toString());
    if (cart.items.length === beforeCount) {
        throw new errors_1.NotFoundError("Cart item not found");
    }
    await cart.save();
    res.status(200).json({
        success: true,
        data: cart,
    });
});
EcommerceController.clearCart = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user._id;
    const cart = await Cart_1.Cart.findOneAndUpdate({ userId }, { items: [] }, { new: true });
    res.status(200).json({
        success: true,
        data: cart,
    });
});
EcommerceController.getLocalCart = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { items } = req.body;
    if (!items || items.length === 0) {
        return res.status(200).json({ success: true, data: { items: [] } });
    }
    // 1) Collect productIds
    const productIds = [...new Set(items.map((i) => i.productId))];
    // 2) Fetch products in bulk
    const products = await Product_1.Product.find({
        _id: { $in: productIds },
        isDeleted: false,
    })
        .populate("category", "name")
        .lean();
    // 3) Fetch variants for these products
    const variants = await Product_1.Variant.find({
        product: { $in: productIds },
    }).lean();
    // 4) Map them for quick lookup
    const productMap = new Map(products.map((p) => [String(p._id), p]));
    const variantMap = new Map(variants.map((v) => [String(v._id), v]));
    // 5) Build hydrated cart
    const hydratedItems = items.map((it) => {
        const product = productMap.get(it.productId);
        const variant = variantMap.get(it.variantId);
        return {
            ...it,
            productId: product
                ? {
                    ...product,
                    selectedVariant: variant || null,
                }
                : it.productId, // fallback to id if product missing
            variantId: variant || it.variantId, // hydrate or fallback
            currentPrice: variant?.price ?? it.price ?? 0,
            currentStock: variant?.stock ?? 0,
            isPriceChanged: variant && it.price !== undefined && it.price !== variant.price,
        };
    });
    return res.status(200).json({
        success: true,
        data: { items: hydratedItems },
    });
});
EcommerceController.mergeCart = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user._id;
    console.log(userId);
    const { items = [] } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
        return res.status(200).json({ success: true, data: { items: [] } });
    }
    // Step 1: Fetch or create user's cart
    let cart = await Cart_1.Cart.findOne({ userId });
    if (!cart) {
        cart = new Cart_1.Cart({ userId, items: [] });
    }
    // Step 2: Merge local items
    for (const localItem of items) {
        const productId = new mongoose_1.default.Types.ObjectId(localItem.productId);
        const variantId = new mongoose_1.default.Types.ObjectId(localItem.variantId);
        // Validate product exists & active
        const product = await Product_1.Product.findOne({
            _id: productId,
            isActive: true,
            isDeleted: false,
        });
        if (!product)
            continue; // skip invalid products
        // Validate variant exists
        const variant = await Product_1.Variant.findOne({
            _id: variantId,
            product: productId,
        });
        if (!variant)
            continue; // skip invalid variants
        // Check stock (optional — clamp to available)
        const quantity = Math.min(localItem.quantity, variant.stock);
        const existingIndex = cart.items.findIndex((i) => i.productId.toString() === productId.toString() &&
            i.variantId.toString() === variantId.toString());
        if (existingIndex > -1) {
            // merge quantities
            cart.items[existingIndex].quantity += quantity;
        }
        else {
            cart.items.push({
                productId,
                variantId,
                quantity,
                price: variant.price, // snapshot
            });
        }
    }
    await cart.save();
    // Step 3: Hydrate cart
    const hydrated = await Cart_1.Cart.findOne({ userId })
        .populate({
        path: "items.productId",
        select: "name images category brand",
        populate: { path: "category", select: "name" },
    })
        .populate({
        path: "items.variantId",
        select: "name price stock images",
    });
    return res.status(200).json({
        success: true,
        message: "Cart merged successfully",
        data: hydrated,
    });
});
EcommerceController.checkout = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user._id;
    const { paymentType, shippingAddress } = req.body;
    let deliveryRate = 0;
    const shipping = await Shipping_1.Shipping.findOne();
    if (shipping)
        deliveryRate = shipping?.cost;
    // Step 1: Get cart
    const cart = await Cart_1.Cart.findOne({ userId })
        .populate("items.productId")
        .populate("items.variantId");
    if (!cart || cart.items.length === 0) {
        throw new errors_1.ValidationError("Cart is empty");
    }
    // Step 2: Transform cart items into order items
    const orderItems = [];
    for (const item of cart.items) {
        const product = item.productId;
        const variant = item.variantId;
        if (!product) {
            throw new errors_1.NotFoundError("Product not found for cart item");
        }
        if (!variant) {
            throw new errors_1.NotFoundError("Variant not found for cart item");
        }
        // Check stock again
        if (variant.stock < item.quantity) {
            throw new errors_1.ValidationError(`Insufficient stock for ${product.name} (${variant.name}). Available: ${variant.stock}, requested: ${item.quantity}`);
        }
        orderItems.push({
            productId: product._id,
            variantId: variant._id,
            quantity: item.quantity,
            price: variant.price,
            variant: {
                name: variant.name,
                price: variant.price,
                images: variant.images || [],
            },
        });
    }
    // Step 3: Calculate total
    let totalAmount = orderItems.reduce((total, item) => {
        return total + item.price * item.quantity;
    }, 0);
    if (deliveryRate > 0) {
        totalAmount += deliveryRate;
    }
    // Step 4: Create order
    const order = new Order_1.Order({
        userId,
        items: orderItems,
        totalAmount,
        shippingAddress,
        paymentType,
        paymentStatus: "pending",
        deliveryRate,
        freeShipping: deliveryRate === 0,
    });
    await order.save();
    res.status(201).json({
        success: true,
        data: {
            orderId: order._id,
            amount: order.totalAmount,
        },
    });
});
EcommerceController.reorder = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user._id;
    const { orderId } = req.params;
    // Step 1: Find order
    const order = await Order_1.Order.findOne({ _id: orderId, userId }).lean();
    if (!order) {
        return res
            .status(404)
            .json({ success: false, message: "Order not found" });
    }
    // Step 2: Ensure items exist
    if (!order.items || order.items.length === 0) {
        return res
            .status(400)
            .json({ success: false, message: "Order has no items to reorder" });
    }
    // Step 3: Find or create cart
    let cart = await Cart_1.Cart.findOne({ userId });
    if (!cart) {
        cart = new Cart_1.Cart({ userId, items: [] });
    }
    // Step 4: Merge items from order into cart
    order.items.forEach((it) => {
        const variantId = it.variantId?.toString();
        const productId = it.productId ? it.productId.toString() : null;
        if (!variantId)
            return; // skip invalid
        const existing = cart.items.find((c) => c.variantId?.toString() === variantId &&
            (productId ? c.productId?.toString() === productId : true));
        if (existing) {
            existing.quantity += it.quantity || 1;
        }
        else {
            cart.items.push({
                productId: productId || undefined,
                variantId,
                quantity: it.quantity || 1,
                price: it.price ?? it.variant?.price ?? 0, // fallback to variant price
            });
        }
    });
    await cart.save();
    return res.status(200).json({
        success: true,
        message: "Items from order added to your cart",
        data: cart,
    });
});
EcommerceController.getOrders = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { page, limit } = req.query;
    const { skip } = (0, pagination_1.getPaginationParams)(req.query);
    const [orders, total] = await Promise.all([
        Order_1.Order.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
        Order_1.Order.countDocuments(),
    ]);
    const result = (0, pagination_1.createPaginationResult)(orders, total, page, limit);
    res.status(200).json({
        success: true,
        ...result,
    });
});
EcommerceController.getMyOrders = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { page, limit } = req.query;
    const { skip } = (0, pagination_1.getPaginationParams)(req.query);
    const userId = req.user._id;
    const [orders, total] = await Promise.all([
        Order_1.Order.find({ userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .populate("items.productId", "name brand images") // ✅ show product info
            .populate("items.variantId", "name price images"), // ✅ show variant info
        Order_1.Order.countDocuments({ userId }),
    ]);
    const result = (0, pagination_1.createPaginationResult)(orders, total, page, limit);
    res.status(200).json({
        success: true,
        ...result,
    });
});
EcommerceController.getOrderById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const filter = { _id: id };
    // Regular users can only see their own orders
    if (req.user && !req.admin) {
        filter.userId = req.user._id;
    }
    const order = await Order_1.Order.findOne(filter)
        .populate("items.productId", "name brand images")
        .populate("items.variantId", "name price images");
    if (!order) {
        throw new errors_1.NotFoundError("Order not found");
    }
    res.status(200).json({
        success: true,
        data: order,
    });
});
EcommerceController.cancelOrder = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;
    const order = await Order_1.Order.findOne({ _id: id, userId, status: "pending" });
    if (!order) {
        throw new errors_1.NotFoundError("Order not found or cannot be cancelled");
    }
    order.status = "cancelled";
    await order.save();
    res.status(200).json({
        success: true,
        data: order,
        message: "Order cancelled successfully",
    });
});
EcommerceController.updateOrderStatus = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const order = await Order_1.Order.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
    if (!order) {
        throw new errors_1.NotFoundError("Order not found");
    }
    // Notify user of status change
    await NotificationService_1.NotificationService.notifyOrderStatusUpdate(order.userId, order._id, status);
    res.status(200).json({
        success: true,
        data: order,
    });
});
// Get wishlist for user
EcommerceController.getWishlist = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user._id;
    let wishlist = await Wishlist_1.Wishlist.findOne({ userId }).populate({
        path: "products",
        match: { isDeleted: false, isActive: true },
        select: "name images category brand",
        populate: { path: "category", select: "name" },
    });
    // if wishlist not found, create empty
    if (!wishlist) {
        wishlist = await new Wishlist_1.Wishlist({ userId, products: [] }).save();
        return res.status(200).json({ success: true, data: { products: [] } });
    }
    // hydrate variants separately
    const productsWithVariants = await Promise.all(wishlist.products.map(async (pDoc) => {
        const p = pDoc.toObject ? pDoc.toObject() : pDoc;
        const variants = await Product_1.Variant.find({
            product: p._id,
        }).select("name price stock images");
        return {
            ...p,
            variants,
        };
    }));
    return res.status(200).json({
        success: true,
        data: { products: productsWithVariants },
    });
});
// Add product to wishlist
EcommerceController.addToWishlist = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { productId } = req.body;
    const userId = req.user._id;
    // validate product exists & active
    const product = await Product_1.Product.findOne({
        _id: productId,
        isActive: true,
        isDeleted: false,
    });
    if (!product)
        throw new errors_1.NotFoundError("Product not found or inactive");
    // update wishlist atomically
    const wishlist = await Wishlist_1.Wishlist.findOneAndUpdate({ userId }, { $addToSet: { products: productId } }, // no duplicates
    { upsert: true, new: true }).populate({
        path: "products",
        match: { isDeleted: false, isActive: true },
        select: "name images variants category minPrice brand",
        populate: { path: "category", select: "name" },
    });
    return res.status(200).json({
        success: true,
        message: "Product added to wishlist",
        data: wishlist,
    });
});
// Remove product from wishlist
EcommerceController.removeFromWishlist = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { productId } = req.params;
    const userId = req.user._id;
    const wishlist = await Wishlist_1.Wishlist.findOne({ userId });
    if (!wishlist)
        throw new errors_1.NotFoundError("Wishlist not found");
    wishlist.products = wishlist.products.filter((id) => id.toString() !== productId);
    await wishlist.save();
    // repopulate to send consistent response
    await wishlist.populate({
        path: "products",
        match: { isDeleted: false, isActive: true },
        select: "name images variants category minPrice brand",
        populate: { path: "category", select: "name" },
    });
    res.status(200).json({
        success: true,
        message: "Product removed from wishlist",
        data: wishlist,
    });
});
// Reviews
EcommerceController.getReviews = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { productId, page, limit } = req.query;
    const { skip } = (0, pagination_1.getPaginationParams)(req.query);
    const filter = { isDeleted: false };
    if (productId)
        filter.productId = productId;
    const [reviews, total] = await Promise.all([
        Review_1.Review.find(filter)
            .populate("userId", "name")
            .populate("productId", "name")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Review_1.Review.countDocuments(filter),
    ]);
    const result = (0, pagination_1.createPaginationResult)(reviews, total, page, limit);
    res.status(200).json({
        success: true,
        ...result,
    });
});
EcommerceController.createReview = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { productId, rating, comment } = req.body;
    const userId = req.user._id;
    // Check if user already reviewed this product
    const existingReview = await Review_1.Review.findOne({
        productId,
        userId,
        isDeleted: false,
    });
    if (existingReview) {
        throw new errors_1.ValidationError("You have already reviewed this product");
    }
    const review = new Review_1.Review({
        productId,
        userId,
        rating,
        comment,
    });
    await review.save();
    res.status(201).json({
        success: true,
        data: review,
    });
});
EcommerceController.updateReview = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;
    const review = await Review_1.Review.findOneAndUpdate({ _id: id, userId, isDeleted: false }, req.body, { new: true, runValidators: true });
    if (!review) {
        throw new errors_1.NotFoundError("Review not found");
    }
    res.status(200).json({
        success: true,
        data: review,
    });
});
EcommerceController.deleteReview = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const filter = { _id: id, isDeleted: false };
    // Regular users can only delete their own reviews
    if (req.user && !req.admin) {
        filter.userId = req.user._id;
    }
    const review = await Review_1.Review.findOneAndUpdate(filter, {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: req.user?._id || req.admin?._id,
    }, { new: true });
    if (!review) {
        throw new errors_1.NotFoundError("Review not found");
    }
    res.status(200).json({
        success: true,
        message: "Review deleted successfully",
    });
});
//# sourceMappingURL=EcommerceController.js.map