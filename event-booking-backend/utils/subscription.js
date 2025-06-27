// utils/subscription.js

// Contact-only categories and subcategories that bypass booking system and use direct contact
const CONTACT_ONLY_CATEGORIES = [
  "farm", // Only farm is contact-only
];

const CONTACT_ONLY_SUBCATEGORIES = [
  // No subcategories are contact-only
];

const FREE_CONTACT_LIMIT = 50;
const WARNING_THRESHOLD = 40;

function isContactOnlyCategory(category, subcategory = null) {
  // Only 'farm' is contact-only
  return category === "farm";
}

function shouldWarnSupplier(contactCount) {
  return contactCount >= WARNING_THRESHOLD && contactCount < FREE_CONTACT_LIMIT;
}

function shouldLockSupplier(contactCount) {
  return contactCount >= FREE_CONTACT_LIMIT;
}

// Add new constants
const SUBSCRIPTION_PLANS = {
  BASIC: {
    name: "basic",
    contactLimit: FREE_CONTACT_LIMIT,
    duration: 30, // days
    price: 0,
  },
  PREMIUM: {
    name: "premium",
    contactLimit: 100,
    duration: 30,
    price: 199,
  },
};

module.exports = {
  CONTACT_ONLY_CATEGORIES,
  CONTACT_ONLY_SUBCATEGORIES,
  FREE_CONTACT_LIMIT,
  WARNING_THRESHOLD,
  isContactOnlyCategory,
  shouldWarnSupplier,
  shouldLockSupplier,
  SUBSCRIPTION_PLANS,
};
