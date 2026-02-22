import mongoose from "mongoose";
import { isQualifiedName } from "typescript";

const cartItemSchema = new mongoose.Schema({
  productId: { type: Number, required: true }, // product id from frontend
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  discount: { type: String }, // e.g. "40% OFF"
  quantity: { type: Number, default: 1 }, // quantity of this item
});

const cartSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [cartItemSchema],
    totalPrice: { type: Number, default: 0 },
  },
  { timestamps: true }
);

cartSchema.pre("save", function (next) {
  this.totalPrice = this.items.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );
  next();
});


const Cart = mongoose.model("Cart", cartSchema);
export default Cart;
