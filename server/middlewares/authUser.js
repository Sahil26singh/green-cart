import jwt from 'jsonwebtoken';

/**
 * Middleware: Authenticates a regular user via the `token` HTTP-only cookie.
 * On success, attaches `req.userId` (the decoded user ID) and calls next().
 */
const authUser = async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: error.message });
  }
};

export default authUser;
