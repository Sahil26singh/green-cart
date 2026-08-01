import Address from '../models/Address.js';

// ─── POST /api/address/add ────────────────────────────────────────────────────

export const addAddress = async (req, res) => {
  try {
    const userId  = req.userId;
    const address = req.body?.address ?? null;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User id missing' });
    }
    if (!address) {
      return res.status(400).json({ success: false, message: 'Address missing' });
    }

    const newAddress = await new Address({ userId, ...address }).save();

    return res.status(201).json({ success: true, message: 'Address saved', address: newAddress });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/address/get ─────────────────────────────────────────────────────

export const getAddress = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User id missing' });
    }

    const addresses = await Address.find({ userId });
    return res.json({ success: true, addresses });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
