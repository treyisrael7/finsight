interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  const minLength = Number(process.env.NEXT_PUBLIC_MIN_PASSWORD_LENGTH) || 8;
  const requireSpecialChars =
    process.env.NEXT_PUBLIC_REQUIRE_SPECIAL_CHARS === "true";
  const requireNumbers = process.env.NEXT_PUBLIC_REQUIRE_NUMBERS === "true";
  const requireUppercase = process.env.NEXT_PUBLIC_REQUIRE_UPPERCASE === "true";

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }

  if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  if (requireNumbers && !/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
