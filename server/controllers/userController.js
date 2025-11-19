import User from "../models/User.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
// api/user/register
export const register = async (req, res)=>{
    try{
        const {name, email, password} = req.body
        if(!name || !email || !password){
            return res.json({success:false, message: 'Missing Details'})
        }
        const existingUser = await User.findOne({email})
        if(existingUser)
            return res.json({success: false, message: 'user already exist'})

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await User.create({name, email, password: hashedPassword})

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn:'7d'});
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', 
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7*24*60*60*100,
        })
        return res.json({success: true, User: {email: user.email, name: user.name}})
    }catch(error){
        console.log(error.message);
        res.json({success: false, message: error.message});
    }

}

//api/user/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: "Missing details" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ success: false, message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: "Invalid email or password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // cookie options: secure only in production, sameSite lax in dev, correct maxAge (ms)
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/", // important so cookie is sent for all routes under your host
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds (1000)
    };

    res.cookie("token", token, cookieOptions);

    return res.status(200).json({
      success: true,
      user: { email: user.email, name: user.name }, // lower-case key to match isAuth response
    });
  } catch (error) {
    console.error("login error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};


//check auth--- api/user/is-auth
export const isAuth = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({ success: true, user });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

//logout --- api/user/logout
export const logout = async (req,res)=>{
    try{
        res.clearCookie('token',{
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', 
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        });
        return res.json({success:true, message: 'logged out'});
    }catch(error){
        console.log(error.message);
        res.json({success:false, message: error.message});
    }
}