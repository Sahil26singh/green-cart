import User from "../models/User.js"

//-api/cart/update
// server/controllers/cartController.js (or wherever updateCart is)
export const updateCart = async (req, res) => {
  try {
    // Prefer req.userId (set by auth middleware). Fallback to req.body.userId only if present.
    const userId =
      req.userId ??
      (req.user && (req.user._id ?? req.user.id)) ??
      req.body?.userId ??
      null;

    console.log('updateCart called, userId:', userId, 'cartItems:', req.body?.cartItems);

    if (!userId) {
      return res.status(401).json({ success: false, message: "User id missing" });
    }

    const { cartItems } = req.body;
    if (!cartItems || typeof cartItems !== "object") {
      return res.status(400).json({ success: false, message: "cartItems missing or invalid" });
    }

    await User.findByIdAndUpdate(userId, { cartItems });

    return res.status(200).json({ success: true, message: "cart updated" });
  } catch (error) {
    console.error("updateCart error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
