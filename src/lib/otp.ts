import crypto from "crypto";

export function generateOtp() {
  return crypto
    .randomInt(100000, 1000000)
    .toString();
}

export function hashOtp(otp: string) {
  return crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");
}