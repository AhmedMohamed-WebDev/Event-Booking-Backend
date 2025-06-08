exports.standardizeJordanPhone = (phone) => {
  // Remove all non-digit characters
  let cleaned = phone.replace(/[\s\-\(\)]/g, "");

  // Remove '+' if present
  if (cleaned.startsWith("+")) {
    cleaned = cleaned.substring(1);
  }

  // Handle different formats
  if (cleaned.startsWith("962")) {
    cleaned = cleaned.substring(3);
  } else if (cleaned.startsWith("0")) {
    cleaned = cleaned.substring(1);
  }

  // Validate the remaining number (must be 9 digits starting with 7[789])
  if (!/^7[789]\d{7}$/.test(cleaned)) {
    throw new Error("Invalid Jordan phone number format");
  }

  return `+962${cleaned}`;
};

exports.isValidJordanPhone = (phone) => {
  try {
    // Test if the phone number is already standardized
    if (phone.startsWith("+962")) {
      const localPart = phone.substring(4);
      return /^7[789]\d{7}$/.test(localPart);
    }
    // If not standardized, try to standardize it
    exports.standardizeJordanPhone(phone);
    return true;
  } catch (error) {
    return false;
  }
};

exports.formatPhoneForDisplay = (phone) => {
  try {
    const standardized = exports.standardizeJordanPhone(phone);
    const localNumber = standardized.slice(-9);
    return `(0${localNumber.substring(0, 2)}) ${localNumber.substring(
      2,
      5
    )}-${localNumber.substring(5)}`;
  } catch (error) {
    return phone; // Return original if formatting fails
  }
};
