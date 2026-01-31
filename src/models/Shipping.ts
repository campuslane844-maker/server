import mongoose from 'mongoose';

const shippingSchema = new mongoose.Schema({
  cost: {
    type: Number,
    required: true,
    default: 0
  }
}, { timestamps: true });


export const Shipping = mongoose.model('Shipping', shippingSchema);