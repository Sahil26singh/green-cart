import User from '../models/User.js';

// ─── POST /api/cart/update ────────────────────────────────────────────────────

export const updateCart = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User id missing' });
    }

    const { cartItems } = req.body;
    if (!cartItems || typeof cartItems !== 'object') {
      return res.status(400).json({ success: false, message: 'cartItems missing or invalid' });
    }

    await User.findByIdAndUpdate(userId, { cartItems });

    return res.json({ success: true, message: 'Cart updated' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
