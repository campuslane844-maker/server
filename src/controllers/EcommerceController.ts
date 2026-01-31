import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { School } from "../models/School";
import { Category } from "../models/Category";
import { IVariant, Product, Variant } from "../models/Product";
import { Cart } from "../models/Cart";
import { Order } from "../models/Order";
import { Wishlist } from "../models/Wishlist";
import { Review } from "../models/Review";
import { asyncHandler } from "../utils/asyncHandler";
import { NotFoundError, ValidationError } from "../utils/errors";
import {
  getPaginationParams,
  createPaginationResult,
} from "../utils/pagination";
import { NotificationService } from "../services/NotificationService";
import mongoose from "mongoose";
import { Shipping } from "../models/Shipping";

export class EcommerceController {
  // Schools
  static getSchools = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { search, page, limit } = req.query as any;
      const { skip } = getPaginationParams(req.query);

      const filter: any = { isDeleted: false };

      if (search) {
        filter.$text = { $search: search };
      }

      const [schools, total] = await Promise.all([
        School.find(filter).sort({ name: 1 }).skip(skip).limit(limit),
        School.countDocuments(filter),
      ]);

      const result = createPaginationResult(schools, total, page, limit);

      res.status(200).json({
        success: true,
        ...result,
      });
    }
  );

  static createSchool = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const school = new School(req.body);
      await school.save();

      res.status(201).json({
        success: true,
        data: school,
      });
    }
  );

  static updateSchool = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { id } = req.params;

      const school = await School.findOneAndUpdate(
        { _id: id, isDeleted: false },
        req.body,
        { new: true, runValidators: true }
      );

      if (!school) {
        throw new NotFoundError("School not found");
      }

      res.status(200).json({
        success: true,
        data: school,
      });
    }
  );

  static deleteSchool = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { id } = req.params;

      const school = await School.findOneAndUpdate(
        { _id: id, isDeleted: false },
        {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: req.admin._id,
        },
        { new: true }
      );

      if (!school) {
        throw new NotFoundError("School not found");
      }

      res.status(200).json({
        success: true,
        message: "School deleted successfully",
      });
    }
  );

  // Categories
  static getCategories = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { search, page, limit } = req.query as any;
      const { skip } = getPaginationParams(req.query);
      console.log(req.query);
      const filter: any = { isDeleted: false };

      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ];
      }

      const [categories, total] = await Promise.all([
        Category.find(filter).sort({ name: 1 }).skip(skip).limit(limit),
        Category.countDocuments(filter),
      ]);

      const result = createPaginationResult(categories, total, page, limit);

      res.status(200).json({
        success: true,
        ...result,
      });
    }
  );

  static createCategory = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const category = new Category(req.body);
      await category.save();

      res.status(201).json({
        success: true,
        data: category,
      });
    }
  );

  static updateCategory = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { id } = req.params;

      const category = await Category.findOneAndUpdate(
        { _id: id, isDeleted: false },
        req.body,
        { new: true, runValidators: true }
      );

      if (!category) {
        throw new NotFoundError("Category not found");
      }

      res.status(200).json({
        success: true,
        data: category,
      });
    }
  );

  static deleteCategory = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { id } = req.params;

      const category = await Category.findOneAndUpdate(
        { _id: id, isDeleted: false },
        {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: req.admin._id,
        },
        { new: true }
      );

      if (!category) {
        throw new NotFoundError("Category not found");
      }

      res.status(200).json({
        success: true,
        message: "Category deleted successfully",
      });
    }
  );

  static getProducts = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const {
          category,
          school,
          brand,
          gender,
          subject,
          type,
          search,
          isActive,
          minPrice,
          maxPrice,
          inStock,
          sort = "relevance",
          page = 1,
          limit = 12,
        } = req.query as any;

        const { skip } = getPaginationParams(req.query);

        const escapeRegex = (s: string) =>
          s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        const baseMatch: any = { isDeleted: false };
        if (category)
          baseMatch.category = mongoose.Types.ObjectId.isValid(category)
            ? new mongoose.Types.ObjectId(category)
            : category;
        if (school)
          baseMatch.school = mongoose.Types.ObjectId.isValid(school)
            ? new mongoose.Types.ObjectId(school)
            : school;
        if (brand) baseMatch.brand = brand;
        if (gender) baseMatch.gender = gender;
        if (subject) baseMatch.subject = subject;
        if (type) baseMatch.type = type;
        if (isActive !== undefined) baseMatch.isActive = isActive === "true";

        const hasMin =
          minPrice !== undefined && minPrice !== null && minPrice !== "";
        const hasMax =
          maxPrice !== undefined && maxPrice !== null && maxPrice !== "";

        const buildRestPipeline = (opts: { includeTextScore?: boolean }) => {
          const pipeline: any[] = [];

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
            const priceFilter: any = {};
            if (hasMin) priceFilter.$gte = Number(minPrice);
            if (hasMax) priceFilter.$lte = Number(maxPrice);
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
          pipeline.push(
            {
              $lookup: {
                from: "categories",
                localField: "category",
                foreignField: "_id",
                as: "category",
              },
            },
            {
              $unwind: { path: "$category", preserveNullAndEmptyArrays: true },
            },
            {
              $lookup: {
                from: "schools",
                localField: "school",
                foreignField: "_id",
                as: "school",
              },
            },
            { $unwind: { path: "$school", preserveNullAndEmptyArrays: true } }
          );

          return pipeline;
        };

        const buildFullPipeline = (firstMatch: any, usedText: boolean) => {
          const pipeline = [
            { $match: firstMatch },
            ...buildRestPipeline({ includeTextScore: usedText }),
          ];

          const sortStage: any = {};
          if (sort === "price_asc") sortStage.minPrice = 1;
          else if (sort === "price_desc") sortStage.minPrice = -1;
          else if (sort === "newest") sortStage.createdAt = -1;
          else if (sort === "relevance" && usedText)
            sortStage.score = { $meta: "textScore" };
          else sortStage.createdAt = -1;

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

        const isPlannerError = (err: any) => {
          const code = err?.code || err?.errorResponse?.code;
          const msg = String(err?.message || err?.errmsg || "");
          return (
            code === 291 ||
            msg.includes("No query solutions") ||
            msg.includes("NoQueryExecutionPlans")
          );
        };

        let aggResult: any[] = [];

        if (search) {
          const textFirstMatch = {
            ...baseMatch,
            $text: { $search: String(search) },
          };

          try {
            const pipeline = buildFullPipeline(textFirstMatch, true);
            aggResult = await Product.aggregate(pipeline).exec();
          } catch (err) {
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
              aggResult = await Product.aggregate(pipeline).exec();
            } else {
              throw err;
            }
          }
        } else {
          const pipeline = buildFullPipeline(baseMatch, false);
          aggResult = await Product.aggregate(pipeline).exec();
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
      } catch (err) {
        console.error("getProducts error", err);
        return res.status(500).json({ success: false, error: "Server error" });
      }
    }
  );

  static getProductById = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { id } = req.params;

      const product = await Product.findOne({ _id: id, isDeleted: false })
        .populate("category", "name")
        .populate("school", "name")
        .populate("classLevel", "name")
        .lean(); // plain object for merging

      if (!product) {
        throw new NotFoundError("Product not found");
      }

      // fetch variants from separate collection
      const variants = await Variant.find({ product: product._id }).lean();

      // return product + variants together
      res.status(200).json({
        success: true,
        data: {
          ...product,
          variants,
        },
      });
    }
  );

  static createProduct = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { variants, ...productData } = req.body;

      // Step 1: Create product
      const product = new Product(productData);
      await product.save();

      let createdVariants: IVariant[] = [];

      if (Array.isArray(variants) && variants.length > 0) {
        const variantDocs = variants.map((variant: Partial<IVariant>) => ({
          ...variant,
          product: product._id,
        }));

        createdVariants = (await Variant.insertMany(variantDocs)).map(
          (v) => v.toObject?.<IVariant>() ?? (v as unknown as IVariant)
        );
      }

      res.status(201).json({
        success: true,
        data: {
          product: product.toObject(),
          variants: createdVariants,
        },
      });
    }
  );

  static updateProduct = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { id } = req.params;
      const { variants, ...productData } = req.body;
      console.log(req.body);
      // Step 1: Update product
      const product = await Product.findOneAndUpdate(
        { _id: id, isDeleted: false },
        productData,
        { new: true } // return updated product
      );

      if (!product) {
        throw new NotFoundError("Product not found");
      }

      let updatedVariants: IVariant[] = [];

      // Step 2: Handle variants
      if (Array.isArray(variants) && variants.length > 0) {
        for (const variant of variants) {
          if (variant._id) {
            const { _id, ...updateData } = variant; // strip _id from update payload
            const variantId = new mongoose.Types.ObjectId(variant._id);
            const updated = await Variant.findOneAndUpdate(
              { _id: variantId, product: id }, // must match both _id and product
              { $set: updateData },
              { new: true }
            );

            if (updated) {
              updatedVariants.push(updated.toObject() as IVariant);
            } else {
              // If somehow not found, you decide: throw error or create
              // throw new NotFoundError("Variant not found");
            }
          } else {
            const newVariant = await Variant.create({
              ...variant,
              product: product._id,
            });
            updatedVariants.push(newVariant.toObject() as IVariant);
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
    }
  );

  static deleteProduct = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { id } = req.params;

      // Step 1: Soft delete product
      const product = await Product.findOneAndUpdate(
        { _id: id, isDeleted: false },
        {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: req.admin._id,
        },
        { new: true }
      );

      if (!product) {
        throw new NotFoundError("Product not found");
      }

      // Step 2: Soft delete related variants
      await Variant.updateMany(
        { product: product._id, isDeleted: { $ne: true } },
        {
          $set: {
            isDeleted: true,
            deletedAt: new Date(),
            deletedBy: req.admin._id,
          },
        }
      );

      res.status(200).json({
        success: true,
        message: "Product and its variants deleted successfully",
      });
    }
  );

  // Cart
  static getCart = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const userId = req.user._id;

      let cart = await Cart.findOne({ userId })
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
        cart = await Cart.create({ userId, items: [] });
        return res.status(200).json({ success: true, data: cart });
      }

      // Step 1: Attach selectedVariant info into each cart item
      cart.items = cart.items.map((item: any) => {
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
    }
  );

  static addToCart = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { productId, variantId, quantity } = req.body;
      const userId = req.user._id;

      // Step 1: Verify product exists & active
      const product = await Product.findOne({
        _id: productId,
        isActive: true,
        isDeleted: false,
      });

      if (!product) {
        throw new NotFoundError("Product not found or inactive");
      }

      // Step 2: Verify variant exists and belongs to product
      const variant = await Variant.findOne({
        _id: variantId,
        product: product._id,
      });

      if (!variant) {
        throw new NotFoundError("Product variant not found");
      }

      // Step 3: Check stock
      if (variant.stock < quantity) {
        throw new ValidationError("Insufficient stock");
      }

      // Step 4: Find or create cart
      let cart = await Cart.findOne({ userId });
      if (!cart) {
        cart = new Cart({ userId, items: [] });
      }

      // Step 5: Check if item already exists in cart
      const existingItemIndex = cart.items.findIndex(
        (item: any) =>
          item.productId.toString() === productId &&
          item.variantId.toString() === variantId
      );

      if (existingItemIndex > -1) {
        // ✅ Increase quantity
        cart.items[existingItemIndex].quantity += quantity;
      } else {
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
    }
  );

  static updateCartItem = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { itemId } = req.params;
      const { quantity, variantId } = req.body;
      const userId = req.user._id;

      // Step 1: Find cart
      const cart = await Cart.findOne({ userId });
      if (!cart) {
        throw new NotFoundError("Cart not found");
      }

      // Step 2: Find cart item
      const item = cart.items.find(
        (i) => (i as any)._id.toString() === itemId.toString()
      );
      if (!item) {
        throw new NotFoundError("Cart item not found");
      }

      // Step 3: Update quantity
      if (quantity !== undefined) {
        if (quantity < 1) {
          throw new ValidationError("Quantity must be at least 1");
        }
        item.quantity = quantity;
      }

      // Step 4: Update variant
      if (variantId) {
        // Validate product exists
        const product = await Product.findById(item.productId);
        if (!product) {
          throw new NotFoundError("Product not found");
        }

        // Validate variant exists for this product
        const variant = await Variant.findOne({
          _id: variantId,
          product: product._id,
        });
        if (!variant) {
          throw new NotFoundError("Variant not found for this product");
        }

        // Update item with new variant + price snapshot
        item.variantId = variant._id as mongoose.Types.ObjectId;
        item.price = variant.price;
      }

      await cart.save();

      res.status(200).json({
        success: true,
        data: cart,
      });
    }
  );

  static removeCartItem = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { itemId } = req.params;
      const userId = req.user._id;

      const cart = await Cart.findOne({ userId });
      if (!cart) {
        throw new NotFoundError("Cart not found");
      }

      // ✅ Remove by cart item _id (so multiple variants of same product work fine)
      const beforeCount = cart.items.length;
      cart.items = cart.items.filter(
        (item: any) => item._id.toString() !== itemId.toString()
      );

      if (cart.items.length === beforeCount) {
        throw new NotFoundError("Cart item not found");
      }

      await cart.save();

      res.status(200).json({
        success: true,
        data: cart,
      });
    }
  );

  static clearCart = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const userId = req.user._id;

      const cart = await Cart.findOneAndUpdate(
        { userId },
        { items: [] },
        { new: true }
      );

      res.status(200).json({
        success: true,
        data: cart,
      });
    }
  );

  static getLocalCart = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { items } = req.body as {
        items: {
          productId: string;
          variantId: string;
          quantity: number;
          price?: number;
        }[];
      };

      if (!items || items.length === 0) {
        return res.status(200).json({ success: true, data: { items: [] } });
      }

      // 1) Collect productIds
      const productIds = [...new Set(items.map((i) => i.productId))];

      // 2) Fetch products in bulk
      const products = await Product.find({
        _id: { $in: productIds },
        isDeleted: false,
      })
        .populate("category", "name")
        .lean();

      // 3) Fetch variants for these products
      const variants = await Variant.find({
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
          isPriceChanged:
            variant && it.price !== undefined && it.price !== variant.price,
        };
      });

      return res.status(200).json({
        success: true,
        data: { items: hydratedItems },
      });
    }
  );

  static mergeCart = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const userId = req.user._id;
      console.log(userId);
      const { items = [] } = req.body as {
        items: {
          productId: string;
          variantId: string;
          quantity: number;
          price?: number;
        }[];
      };

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(200).json({ success: true, data: { items: [] } });
      }

      // Step 1: Fetch or create user's cart
      let cart = await Cart.findOne({ userId });
      if (!cart) {
        cart = new Cart({ userId, items: [] });
      }

      // Step 2: Merge local items
      for (const localItem of items) {
        const productId = new mongoose.Types.ObjectId(localItem.productId);
        const variantId = new mongoose.Types.ObjectId(localItem.variantId);

        // Validate product exists & active
        const product = await Product.findOne({
          _id: productId,
          isActive: true,
          isDeleted: false,
        });
        if (!product) continue; // skip invalid products

        // Validate variant exists
        const variant = await Variant.findOne({
          _id: variantId,
          product: productId,
        });
        if (!variant) continue; // skip invalid variants

        // Check stock (optional — clamp to available)
        const quantity = Math.min(localItem.quantity, variant.stock);

        const existingIndex = cart.items.findIndex(
          (i: any) =>
            i.productId.toString() === productId.toString() &&
            i.variantId.toString() === variantId.toString()
        );

        if (existingIndex > -1) {
          // merge quantities
          cart.items[existingIndex].quantity += quantity;
        } else {
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
      const hydrated = await Cart.findOne({ userId })
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
    }
  );

  static checkout = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const userId = req.user._id;
      const { paymentType, shippingAddress } =
        req.body;

      let deliveryRate = 0;
      const shipping = await Shipping.findOne();
      if(shipping) deliveryRate = shipping?.cost;

      // Step 1: Get cart
      const cart = await Cart.findOne({ userId })
        .populate("items.productId")
        .populate("items.variantId");

      if (!cart || cart.items.length === 0) {
        throw new ValidationError("Cart is empty");
      }

      // Step 2: Transform cart items into order items
      const orderItems = [];
      for (const item of cart.items) {
        const product: any = item.productId;
        const variant: any = item.variantId;

        if (!product) {
          throw new NotFoundError("Product not found for cart item");
        }
        if (!variant) {
          throw new NotFoundError("Variant not found for cart item");
        }

        // Check stock again
        if (variant.stock < item.quantity) {
          throw new ValidationError(
            `Insufficient stock for ${product.name} (${variant.name}). Available: ${variant.stock}, requested: ${item.quantity}`
          );
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

      if (deliveryRate>0) {
        totalAmount += deliveryRate;
      }

      // Step 4: Create order
      const order = new Order({
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
    }
  );

  static reorder = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const userId = req.user._id;
      const { orderId } = req.params;

      // Step 1: Find order
      const order = await Order.findOne({ _id: orderId, userId }).lean();
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
      let cart = await Cart.findOne({ userId });
      if (!cart) {
        cart = new Cart({ userId, items: [] });
      }

      // Step 4: Merge items from order into cart
      order.items.forEach((it: any) => {
        const variantId = it.variantId?.toString();
        const productId = it.productId ? it.productId.toString() : null;

        if (!variantId) return; // skip invalid

        const existing = cart.items.find(
          (c: any) =>
            c.variantId?.toString() === variantId &&
            (productId ? c.productId?.toString() === productId : true)
        );

        if (existing) {
          existing.quantity += it.quantity || 1;
        } else {
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
    }
  );

  static getOrders = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { page, limit } = req.query as any;
      const { skip } = getPaginationParams(req.query);

      const [orders, total] = await Promise.all([
        Order.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
        Order.countDocuments(),
      ]);

      const result = createPaginationResult(orders, total, page, limit);

      res.status(200).json({
        success: true,
        ...result,
      });
    }
  );

  static getMyOrders = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { page, limit } = req.query as any;
      const { skip } = getPaginationParams(req.query);
      const userId = req.user._id;

      const [orders, total] = await Promise.all([
        Order.find({ userId })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .populate("items.productId", "name brand images") // ✅ show product info
          .populate("items.variantId", "name price images"), // ✅ show variant info
        Order.countDocuments({ userId }),
      ]);

      const result = createPaginationResult(orders, total, page, limit);

      res.status(200).json({
        success: true,
        ...result,
      });
    }
  );

  static getOrderById = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { id } = req.params;

      const filter: any = { _id: id };

      // Regular users can only see their own orders
      if (req.user && !req.admin) {
        filter.userId = req.user._id;
      }

      const order = await Order.findOne(filter)
        .populate("items.productId", "name brand images")
        .populate("items.variantId", "name price images");

      if (!order) {
        throw new NotFoundError("Order not found");
      }

      res.status(200).json({
        success: true,
        data: order,
      });
    }
  );

  static cancelOrder = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { id } = req.params;
      const userId = req.user._id;

      const order = await Order.findOne({ _id: id, userId, status: "pending" });

      if (!order) {
        throw new NotFoundError("Order not found or cannot be cancelled");
      }

      order.status = "cancelled";
      await order.save();

      res.status(200).json({
        success: true,
        data: order,
        message: "Order cancelled successfully",
      });
    }
  );

  static updateOrderStatus = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { id } = req.params;
      const { status } = req.body;

      const order = await Order.findByIdAndUpdate(
        id,
        { status },
        { new: true, runValidators: true }
      );

      if (!order) {
        throw new NotFoundError("Order not found");
      }

      // Notify user of status change
      await NotificationService.notifyOrderStatusUpdate(
        order.userId as mongoose.Types.ObjectId,
        order._id as mongoose.Types.ObjectId,
        status
      );

      res.status(200).json({
        success: true,
        data: order,
      });
    }
  );

  // Get wishlist for user
  static getWishlist = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const userId = req.user._id;

      let wishlist = await Wishlist.findOne({ userId }).populate({
        path: "products",
        match: { isDeleted: false, isActive: true },
        select: "name images category brand",
        populate: { path: "category", select: "name" },
      });

      // if wishlist not found, create empty
      if (!wishlist) {
        wishlist = await new Wishlist({ userId, products: [] }).save();
        return res.status(200).json({ success: true, data: { products: [] } });
      }

      // hydrate variants separately
      const productsWithVariants = await Promise.all(
        (wishlist.products as any[]).map(async (pDoc) => {
          const p = pDoc.toObject ? pDoc.toObject() : pDoc;

          const variants = await Variant.find({
            product: p._id,
          }).select("name price stock images");

          return {
            ...p,
            variants,
          };
        })
      );

      return res.status(200).json({
        success: true,
        data: { products: productsWithVariants },
      });
    }
  );

  // Add product to wishlist
  static addToWishlist = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { productId } = req.body;
      const userId = req.user._id;

      // validate product exists & active
      const product = await Product.findOne({
        _id: productId,
        isActive: true,
        isDeleted: false,
      });
      if (!product) throw new NotFoundError("Product not found or inactive");

      // update wishlist atomically
      const wishlist = await Wishlist.findOneAndUpdate(
        { userId },
        { $addToSet: { products: productId } }, // no duplicates
        { upsert: true, new: true }
      ).populate({
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
    }
  );

  // Remove product from wishlist
  static removeFromWishlist = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { productId } = req.params;
      const userId = req.user._id;

      const wishlist = await Wishlist.findOne({ userId });
      if (!wishlist) throw new NotFoundError("Wishlist not found");

      wishlist.products = wishlist.products.filter(
        (id) => id.toString() !== productId
      );

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
    }
  );

  // Reviews
  static getReviews = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { productId, page, limit } = req.query as any;
      const { skip } = getPaginationParams(req.query);

      const filter: any = { isDeleted: false };
      if (productId) filter.productId = productId;

      const [reviews, total] = await Promise.all([
        Review.find(filter)
          .populate("userId", "name")
          .populate("productId", "name")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Review.countDocuments(filter),
      ]);

      const result = createPaginationResult(reviews, total, page, limit);

      res.status(200).json({
        success: true,
        ...result,
      });
    }
  );

  static createReview = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { productId, rating, comment } = req.body;
      const userId = req.user._id;

      // Check if user already reviewed this product
      const existingReview = await Review.findOne({
        productId,
        userId,
        isDeleted: false,
      });
      if (existingReview) {
        throw new ValidationError("You have already reviewed this product");
      }

      const review = new Review({
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
    }
  );

  static updateReview = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { id } = req.params;
      const userId = req.user._id;

      const review = await Review.findOneAndUpdate(
        { _id: id, userId, isDeleted: false },
        req.body,
        { new: true, runValidators: true }
      );

      if (!review) {
        throw new NotFoundError("Review not found");
      }

      res.status(200).json({
        success: true,
        data: review,
      });
    }
  );

  static deleteReview = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { id } = req.params;

      const filter: any = { _id: id, isDeleted: false };

      // Regular users can only delete their own reviews
      if (req.user && !req.admin) {
        filter.userId = req.user._id;
      }

      const review = await Review.findOneAndUpdate(
        filter,
        {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: req.user?._id || req.admin?._id,
        },
        { new: true }
      );

      if (!review) {
        throw new NotFoundError("Review not found");
      }

      res.status(200).json({
        success: true,
        message: "Review deleted successfully",
      });
    }
  );
}
