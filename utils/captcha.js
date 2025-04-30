import axios from "axios";

export const verifyCaptcha = async (req, res, next) => {
  const { captchaToken } = req.body;
  const secretKey = process.env.RECAPTCHA_SECRET;

  try {
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captchaToken}`
    );
    if (response.data.success) {
      next();
    } else {
      res.status(403).json({ error: "CAPTCHA verification failed" });
    }
  } catch (error) {
    res.status(500).json({ error: "CAPTCHA validation error" });
  }
};