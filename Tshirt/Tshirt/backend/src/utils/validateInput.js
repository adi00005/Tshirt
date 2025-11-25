// src/utils/validateInput.js
import validator from "validator";

export const validateSignup = ({ username, email, password }) => {
  if (!username || !email || !password) return "All fields are required";
  if (!validator.isEmail(email)) return "Invalid email";
  if (username.length < 3) return "Username must be at least 3 characters";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(password) || !/[0-9]/.test(password))
    return "Password must include at least one uppercase letter and one number";
  return null;
};

export const sanitizeInput = (input) => {
  if (!input || typeof input !== "string") return "";
  return input.trim().replace(/\s+/g, " ");
};

