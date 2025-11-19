import jwt from "jsonwebtoken";

const authUser = async (req, res, next) => {
  const token = req.cookies?.token; 

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

    if (!tokenDecode?.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    req.userId = tokenDecode.id;

    next(); // proceed to next middleware/handler
  } catch (error) {
    return res.status(401).json({ success: false, message: error.message });
  }
};

export default authUser;
