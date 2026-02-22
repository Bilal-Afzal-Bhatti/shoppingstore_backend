import Cart from "../models/cart.js";
import CartItem from "../models/cartdeleted.js";
import mongoose from "mongoose";  

export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id; // from token middleware
    const { productId, name, price, image,quantity, discount } = req.body;

    // find user cart
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // create new cart
      cart = new Cart({
        userId,
        items: [{ productId, name, price, image,quantity ,discount }],
      });
    } else {
      // add to existing
      cart.items.push({ productId, name, price, image,quantity, discount });
    }

    await cart.save();
    res.status(200).json({ message: "Item added to cart", cart });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const getCart = async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ message: "userId is required" });

   const cart = await Cart.findOne({ userId: new mongoose.Types.ObjectId(userId) });


    if (!cart) return res.status(404).json({ message: "Cart not found", items: [] });

    console.log("Fetched cart:", cart); // check backend
    res.status(200).json(cart); // return full cart
  } catch (err) {
    console.error("Get Cart Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};



export const updateCartItem = async (req, res) => {
  const { userId, id } = req.params; // id = item._id
  const { quantity } = req.body;

  if (!userId) return res.status(400).json({ message: "userId is required" });
  if (!id) return res.status(400).json({ message: "itemId is required" });

  try {
    // Find the cart for this user
    const cart = await Cart.findOne({ userId: new mongoose.Types.ObjectId(userId) });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    // Find the exact item in the cart
    const item = cart.items.id(id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    // Update quantity
    item.quantity = quantity;

    // Optional: update item totalPrice (if you keep it per item)
    item.totalPrice = (item.price || 0) * quantity;

    // Save the cart → pre-save hook will automatically recalc cart total
    await cart.save();

    res.status(200).json({
      message: "Cart updated successfully",
      item,
      cartTotal: cart.totalPrice, // this comes from pre-save hook
      items: cart.items,           // all items for frontend
    });
  } catch (error) {
    console.error("❌ Error updating cart item:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const deleteCartItem = async (req, res) => {
  const { userId, id} = req.params;

  if (!userId) return res.status(400).json({ message: "userId is required" });
  if (!id) return res.status(400).json({ message: "itemId is required" });

  try {
    // ✅ Correctly create ObjectId from userId string
    const cart = await Cart.findOne({ userId: new mongoose.Types.ObjectId(userId) });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const itemIndex = cart.items.findIndex(item => item._id.toString() === id);
    if (itemIndex === -1) return res.status(404).json({ message: "Item not found in cart" });

    // Remove the item
    cart.items.splice(itemIndex, 1);

    // Save cart -> pre save hook will recalculate totalPrice
    await cart.save();

    res.json({ message: "Item deleted successfully", cart });
  } catch (error) {
    console.error("Error deleting cart item:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};