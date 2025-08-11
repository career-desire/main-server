import User from "../models/User.js";

export const checkUserCredits = async (userId, amount) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const { totalCredits } = user.creditInfo;
  if (totalCredits < amount) throw new Error("Insufficient credit token");

  return true;
};

export const deductUserCredits = async (userId, amount, details = "AI Resume Generation") => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const { totalCredits } = user.creditInfo;
  if (totalCredits < amount) throw new Error("Insufficient credit token");

  user.creditInfo.totalCredits -= amount;
  user.creditInfo.creditsUsed += amount;
  user.creditInfo.transactions.unshift({
    action: "spend",
    amount,
    details,
    status: "success",
    date: new Date(),
  });

  await user.save();

  return user.creditInfo.totalCredits;
};
