import { NextFunction, Request, Response } from "express";
import xss from "xss";

/**
 * Recursively sanitizes values without reassigning request properties.
 * Prevents XSS and NoSQL injection safely under Express v5+.
 */
const sanitizeInPlace = (obj: any): void => {
  if (!obj || typeof obj !== "object") return;

  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (typeof value === "string") {
      obj[key] = xss(value.replace(/\$|\./g, ""));
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (typeof item === "string") {
          value[index] = xss(item.replace(/\$|\./g, ""));
        } else if (typeof item === "object" && item !== null) {
          sanitizeInPlace(item);
        }
      });
    } else if (typeof value === "object" && value !== null) {
      sanitizeInPlace(value);
    }
  }
};

/**
 * Middleware to sanitize incoming requests
 * Mutates req.body, req.query, req.params safely without reassigning them
 */
export const sanitizeRequest = (req: Request, _res: Response, next: NextFunction) => {
  try {
    sanitizeInPlace(req.body);
    sanitizeInPlace(req.query);
    sanitizeInPlace(req.params);
  } catch (err) {
    console.error("Sanitization error:", err);
  }
  next();
};
