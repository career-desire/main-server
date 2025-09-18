import jwt from "jsonwebtoken";
import User from "../models/User.js";

//Protect data from unauthorized access
export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) return res.status(401).json({ message: "Unauthorized access" });

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(403).json({ message: "Oops! Your session timed out. Refresh the page to pick up where you left off." });
    }

    res.status(403).json({ message: "Please refresh and try again or log in." });
  }
};
