import jwt from 'jsonwebtoken';

/**
 * Middleware: Authenticates the seller via the `sellerToken` HTTP-only cookie.
 * Verifies the JWT and checks that the email matches the SELLER_EMAIL env var.
 */
const authSeller = async (req, res, next) => {
  const { sellerToken } = req.cookies;

  if (!sellerToken) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(sellerToken, process.env.JWT_SECRET);

    if (decoded.email !== process.env.SELLER_EMAIL) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: error.message });
  }
};

export default authSeller;
