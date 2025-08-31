const standardizePhone = (phone, countryCode, pattern, errorMessage) => {
  // Remove all non-digit characters
  let cleaned = phone.replace(/[\s\-\(\)]/g, "");

  // Remove '+' if present
  if (cleaned.startsWith("+")) {
    cleaned = cleaned.substring(1);
  }

  // Handle different formats
  if (cleaned.startsWith(countryCode)) {
    cleaned = cleaned.substring(countryCode.length);
  } else if (cleaned.startsWith("0")) {
    cleaned = cleaned.substring(1);
  }

  // Validate the remaining number
  if (!pattern.test(cleaned)) {
    throw new Error(errorMessage);
  }

  return `+${countryCode}${cleaned}`;
};

exports.standardizeJordanPhone = (phone) => {
  return standardizePhone(
    phone,
    "962",
    /^7[789]\d{7}$/,
    "Invalid Jordan phone number format"
  );
};

exports.standardizeKuwaitPhone = (phone) => {
  return standardizePhone(
    phone,
    "965",
    /^[569]\d{7}$/,
    "Invalid Kuwait phone number format"
  );
};

exports.standardizePhoneByCountry = (phone, country) => {
  if (country === "kuwait") {
    return exports.standardizeKuwaitPhone(phone);
  } else {
    return exports.standardizeJordanPhone(phone);
  }
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

exports.isValidKuwaitPhone = (phone) => {
  try {
    // Test if the phone number is already standardized
    if (phone.startsWith("+965")) {
      const localPart = phone.substring(4);
      return /^[569]\d{7}$/.test(localPart);
    }
    // If not standardized, try to standardize it
    exports.standardizeKuwaitPhone(phone);
    return true;
  } catch (error) {
    return false;
  }
};

exports.formatPhoneForDisplay = (phone) => {
  try {
    // Check if it's a Kuwait number
    if (phone.startsWith("+965")) {
      const standardized = exports.standardizeKuwaitPhone(phone);
      const localNumber = standardized.slice(-8);
      return `(${localNumber.substring(0, 3)}) ${localNumber.substring(
        3,
        6
      )}-${localNumber.substring(6)}`;
    } else {
      // Jordan number
      const standardized = exports.standardizeJordanPhone(phone);
      const localNumber = standardized.slice(-9);
      return `(0${localNumber.substring(0, 2)}) ${localNumber.substring(
        2,
        5
      )}-${localNumber.substring(5)}`;
    }
  } catch (error) {
    return phone; // Return original if formatting fails
  }
};

// Helper function to standardize phone number automatically
exports.standardizePhoneAuto = (phone) => {
  try {
    // Remove all non-digit characters first
    let cleaned = phone.replace(/[\s\-\(\)]/g, "");

    // Check if it's a Kuwait number (starts with +965, 965, or 9)
    if (cleaned.startsWith("+965") || cleaned.startsWith("965")) {
      return exports.standardizeKuwaitPhone(phone);
    } else if (cleaned.startsWith("9") && cleaned.length === 8) {
      // This is likely a Kuwait number (8 digits starting with 9)
      return exports.standardizeKuwaitPhone(phone);
    } else if (cleaned.startsWith("+962") || cleaned.startsWith("962")) {
      // Jordan number with country code
      return exports.standardizeJordanPhone(phone);
    } else if (cleaned.startsWith("7") && cleaned.length === 9) {
      // This is likely a Jordan number (9 digits starting with 7)
      return exports.standardizeJordanPhone(phone);
    } else {
      // Try Jordan first, if it fails, try Kuwait
      try {
        return exports.standardizeJordanPhone(phone);
      } catch (jordanError) {
        try {
          return exports.standardizeKuwaitPhone(phone);
        } catch (kuwaitError) {
          throw new Error(`Invalid phone number format: ${phone}`);
        }
      }
    }
  } catch (error) {
    throw new Error(`Invalid phone number format: ${phone}`);
  }
};
