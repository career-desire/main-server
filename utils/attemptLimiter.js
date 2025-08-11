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

// Limiter For AI Features

const aiAttemptStore = new Map();

const MAX_AI_ATTEMPTS = 10;
const WINDOW_MS_FOR_AI = 1 * 60 * 1000; 

export const aiAttemptLimiter = (req, res, next) => {
  const key = req.user?.id || req.ip;
  const now = Date.now();

  let aiAttemptRecord = aiAttemptStore.get(key);
  
  if (!aiAttemptRecord) {
    aiAttemptStore.set(key, { count: 1, firstAttempt: now });
    req.remainingAIAttempts = MAX_AI_ATTEMPTS - 1;
    return next();
  }

  const { count, firstAttempt } = aiAttemptRecord;

  if (now - firstAttempt > WINDOW_MS_FOR_AI) {
    aiAttemptStore.set(key, { count: 1, firstAttempt: now });
    req.remainingAIAttempts = MAX_AI_ATTEMPTS - 1;
    return next();
  }

  if (count >= MAX_AI_ATTEMPTS) {
    return res.status(429).json({
      message: "Too many attempts. Please try again later",
      remainingAIAttempts: 0,
    });
  }

  aiAttemptStore.set(key, { count: count + 1, firstAttempt });
  req.remainingAIAttempts = MAX_AI_ATTEMPTS - (count + 1);

  req.aiLimitInfo = {
    count: count + 1,
    remaining: MAX_AI_ATTEMPTS - (count + 1),
    resetInMs: WINDOW_MS_FOR_AI - (now - firstAttempt),
  };

  next();
};
