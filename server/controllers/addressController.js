import Address from "../models/Address.js"

//-api/address/add
// POST /api/address/add
export const addAddress = async (req, res) => {
  try {
    // Prefer req.userId (from auth middleware); fallback to req.body.userId
    const userId =
      req.userId ??
      (req.user && (req.user._id ?? req.user.id)) ??
      req.body?.userId ??
      null;

    const address = req.body?.address ?? null;

    console.log('addAddress called. userIdFromReqUser:', req.user && req.user._id, 'req.userId:', req.userId, 'userIdFromBody:', req.body?.userId);
    console.log('address payload:', address);

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User id missing' });
    }
    if (!address) {
      return res.status(400).json({ success: false, message: 'Address missing' });
    }

    // create and save (adjust field names to your schema)
    const newAddress = new Address({ userId, ...address });
    await newAddress.save();

    return res.status(201).json({ success: true, message: 'Address saved', address: newAddress });
  } catch (err) {
    console.error('addAddress error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};




//-api/address/get
export const getAddress = async (req, res) => {
  try {
    // prefer req.userId (set by auth middleware), fallback to req.user._id or req.user.id
    const userId =
      req.userId ??
      (req.user && (req.user._id ?? req.user.id)) ??
      null;

    if (!userId) {
      console.log("getAddress: missing userId on request", { reqUser: req.user, reqUserId: req.userId });
      return res.status(401).json({ success: false, message: "User id missing" });
    }

    const addresses = await Address.find({ userId });
    return res.status(200).json({ success: true, addresses }); // plural key
  } catch (error) {
    console.error("getAddress error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
