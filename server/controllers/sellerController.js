import jwt from 'jsonwebtoken';

/** Shared cookie options for the seller auth token. */
const sellerCookieOptions = (clear = false) => ({
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  path:     '/',
  ...(clear ? {} : { maxAge: 7 * 24 * 60 * 60 * 1000 }),
});

// ─── POST /api/seller/login ───────────────────────────────────────────────────

export const sellerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (password !== process.env.SELLER_PASSWORD || email !== process.env.SELLER_EMAIL) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('sellerToken', token, sellerCookieOptions());

    return res.json({ success: true, message: 'Logged in' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/seller/is-auth ──────────────────────────────────────────────────

export const isSellerAuth = async (_req, res) => {
  try {
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/seller/logout ───────────────────────────────────────────────────

export const sellerLogout = async (_req, res) => {
  try {
    res.clearCookie('sellerToken', sellerCookieOptions(true));
    return res.json({ success: true, message: 'Logged out' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
