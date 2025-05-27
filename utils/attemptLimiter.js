const attemptStore = new Map();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60 * 60 * 1000;

export const otpAttemptLimiter = (req, res, next) => {
  const key = req.body?.mobile || req.ip;
  const now = Date.now();

  let attemptRecord = attemptStore.get(key);

  if (!attemptRecord) {
    attemptStore.set(key, { count: 1, firstAttempt: now });
    req.remainingAttempts = MAX_ATTEMPTS - 1;
    return next();
  }

  const { count, firstAttempt } = attemptRecord;

  if (now - firstAttempt > WINDOW_MS) {
    attemptStore.set(key, { count: 1, firstAttempt: now });
    req.remainingAttempts = MAX_ATTEMPTS - 1;
    return next();
  }

  // Too many attempts
  if (count >= MAX_ATTEMPTS) {
    return res.status(429).json({
      message: "Too many requests. Please try again after 1 hour.",
      remainingAttempts: 0,
    });
  }

  attemptStore.set(key, { count: count + 1, firstAttempt });
  req.remainingAttempts = MAX_ATTEMPTS - (count + 1);

  next();
};