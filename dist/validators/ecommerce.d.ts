import { z } from 'zod';
export declare const createSchoolSchema: z.ZodObject<{
    name: z.ZodString;
    logo: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    state: z.ZodOptional<z.ZodString>;
    country: z.ZodOptional<z.ZodString>;
    pincode: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    city?: string | undefined;
    state?: string | undefined;
    country?: string | undefined;
    pincode?: string | undefined;
    logo?: string | undefined;
    address?: string | undefined;
}, {
    name: string;
    city?: string | undefined;
    state?: string | undefined;
    country?: string | undefined;
    pincode?: string | undefined;
    logo?: string | undefined;
    address?: string | undefined;
}>;
export declare const updateSchoolSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    logo: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    address: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    city: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    state: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    country: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    pincode: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    city?: string | undefined;
    state?: string | undefined;
    country?: string | undefined;
    pincode?: string | undefined;
    logo?: string | undefined;
    address?: string | undefined;
}, {
    name?: string | undefined;
    city?: string | undefined;
    state?: string | undefined;
    country?: string | undefined;
    pincode?: string | undefined;
    logo?: string | undefined;
    address?: string | undefined;
}>;
export declare const createCategorySchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    image: z.ZodString;
}, "strip", z.ZodTypeAny, {
    image: string;
    name: string;
    description?: string | undefined;
}, {
    image: string;
    name: string;
    description?: string | undefined;
}>;
export declare const updateCategorySchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    image: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    image?: string | undefined;
    name?: string | undefined;
    description?: string | undefined;
}, {
    image?: string | undefined;
    name?: string | undefined;
    description?: string | undefined;
}>;
export declare const productVariantSchema: z.ZodObject<{
    name: z.ZodString;
    price: z.ZodNumber;
    cutoffPrice: z.ZodOptional<z.ZodNumber>;
    stock: z.ZodDefault<z.ZodNumber>;
    images: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    _id: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    price: number;
    stock: number;
    _id?: string | undefined;
    cutoffPrice?: number | undefined;
    images?: string[] | undefined;
}, {
    name: string;
    price: number;
    _id?: string | undefined;
    cutoffPrice?: number | undefined;
    stock?: number | undefined;
    images?: string[] | undefined;
}>;
export declare const createProductSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    category: z.ZodString;
    images: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    variants: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        price: z.ZodNumber;
        cutoffPrice: z.ZodOptional<z.ZodNumber>;
        stock: z.ZodDefault<z.ZodNumber>;
        images: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        _id: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        price: number;
        stock: number;
        _id?: string | undefined;
        cutoffPrice?: number | undefined;
        images?: string[] | undefined;
    }, {
        name: string;
        price: number;
        _id?: string | undefined;
        cutoffPrice?: number | undefined;
        stock?: number | undefined;
        images?: string[] | undefined;
    }>, "many">;
    school: z.ZodOptional<z.ZodString>;
    gender: z.ZodOptional<z.ZodEnum<["Boys", "Girls", "Unisex"]>>;
    classLevel: z.ZodOptional<z.ZodString>;
    subject: z.ZodOptional<z.ZodString>;
    brand: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodString>;
    isActive: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name: string;
    isActive: boolean;
    images: string[];
    category: string;
    variants: {
        name: string;
        price: number;
        stock: number;
        _id?: string | undefined;
        cutoffPrice?: number | undefined;
        images?: string[] | undefined;
    }[];
    classLevel?: string | undefined;
    type?: string | undefined;
    description?: string | undefined;
    subject?: string | undefined;
    school?: string | undefined;
    gender?: "Boys" | "Girls" | "Unisex" | undefined;
    brand?: string | undefined;
}, {
    name: string;
    category: string;
    variants: {
        name: string;
        price: number;
        _id?: string | undefined;
        cutoffPrice?: number | undefined;
        stock?: number | undefined;
        images?: string[] | undefined;
    }[];
    classLevel?: string | undefined;
    type?: string | undefined;
    description?: string | undefined;
    isActive?: boolean | undefined;
    subject?: string | undefined;
    images?: string[] | undefined;
    school?: string | undefined;
    gender?: "Boys" | "Girls" | "Unisex" | undefined;
    brand?: string | undefined;
}>;
export declare const updateProductSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    category: z.ZodOptional<z.ZodString>;
    images: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString, "many">>>;
    variants: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        price: z.ZodNumber;
        cutoffPrice: z.ZodOptional<z.ZodNumber>;
        stock: z.ZodDefault<z.ZodNumber>;
        images: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        _id: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        price: number;
        stock: number;
        _id?: string | undefined;
        cutoffPrice?: number | undefined;
        images?: string[] | undefined;
    }, {
        name: string;
        price: number;
        _id?: string | undefined;
        cutoffPrice?: number | undefined;
        stock?: number | undefined;
        images?: string[] | undefined;
    }>, "many">>;
    school: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    gender: z.ZodOptional<z.ZodOptional<z.ZodEnum<["Boys", "Girls", "Unisex"]>>>;
    classLevel: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    subject: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    brand: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    type: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    isActive: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    classLevel?: string | undefined;
    type?: string | undefined;
    description?: string | undefined;
    isActive?: boolean | undefined;
    subject?: string | undefined;
    images?: string[] | undefined;
    category?: string | undefined;
    school?: string | undefined;
    gender?: "Boys" | "Girls" | "Unisex" | undefined;
    brand?: string | undefined;
    variants?: {
        name: string;
        price: number;
        stock: number;
        _id?: string | undefined;
        cutoffPrice?: number | undefined;
        images?: string[] | undefined;
    }[] | undefined;
}, {
    name?: string | undefined;
    classLevel?: string | undefined;
    type?: string | undefined;
    description?: string | undefined;
    isActive?: boolean | undefined;
    subject?: string | undefined;
    images?: string[] | undefined;
    category?: string | undefined;
    school?: string | undefined;
    gender?: "Boys" | "Girls" | "Unisex" | undefined;
    brand?: string | undefined;
    variants?: {
        name: string;
        price: number;
        _id?: string | undefined;
        cutoffPrice?: number | undefined;
        stock?: number | undefined;
        images?: string[] | undefined;
    }[] | undefined;
}>;
export declare const addToCartSchema: z.ZodObject<{
    productId: z.ZodString;
    variantId: z.ZodString;
    quantity: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    productId: string;
    variantId: string;
    quantity: number;
}, {
    productId: string;
    variantId: string;
    quantity: number;
}>;
export declare const updateCartItemSchema: z.ZodObject<{
    quantity: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    quantity: number;
}, {
    quantity: number;
}>;
export declare const checkoutSchema: z.ZodObject<{
    paymentType: z.ZodEnum<["COD", "Razorpay"]>;
    shippingAddress: z.ZodObject<{
        name: z.ZodString;
        phone: z.ZodString;
        street: z.ZodString;
        streetOptional: z.ZodOptional<z.ZodString>;
        city: z.ZodString;
        state: z.ZodString;
        zipcode: z.ZodString;
        country: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        phone: string;
        city: string;
        state: string;
        country: string;
        street: string;
        zipcode: string;
        streetOptional?: string | undefined;
    }, {
        name: string;
        phone: string;
        city: string;
        state: string;
        country: string;
        street: string;
        zipcode: string;
        streetOptional?: string | undefined;
    }>;
    deliveryRate: z.ZodDefault<z.ZodNumber>;
    freeShipping: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    shippingAddress: {
        name: string;
        phone: string;
        city: string;
        state: string;
        country: string;
        street: string;
        zipcode: string;
        streetOptional?: string | undefined;
    };
    paymentType: "COD" | "Razorpay";
    deliveryRate: number;
    freeShipping: boolean;
}, {
    shippingAddress: {
        name: string;
        phone: string;
        city: string;
        state: string;
        country: string;
        street: string;
        zipcode: string;
        streetOptional?: string | undefined;
    };
    paymentType: "COD" | "Razorpay";
    deliveryRate?: number | undefined;
    freeShipping?: boolean | undefined;
}>;
export declare const createReviewSchema: z.ZodObject<{
    productId: z.ZodString;
    rating: z.ZodNumber;
    comment: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    productId: string;
    rating: number;
    comment?: string | undefined;
}, {
    productId: string;
    rating: number;
    comment?: string | undefined;
}>;
export declare const updateReviewSchema: z.ZodObject<{
    rating: z.ZodOptional<z.ZodNumber>;
    comment: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    comment?: string | undefined;
    rating?: number | undefined;
}, {
    comment?: string | undefined;
    rating?: number | undefined;
}>;
//# sourceMappingURL=ecommerce.d.ts.map