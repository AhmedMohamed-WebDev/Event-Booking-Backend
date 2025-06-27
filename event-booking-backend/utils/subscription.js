// utils/subscription.js

// Only these categories bypass booking system and use direct contact
const CONTACT_ONLY_CATEGORIES = [
  "wedding-halls", // قاعات
  "farm", // مزارع
];

const FREE_CONTACT_LIMIT = 50;
const WARNING_THRESHOLD = 40;

function isContactOnlyCategory(category) {
  return CONTACT_ONLY_CATEGORIES.includes(category);
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
    name: 'basic',
    contactLimit: FREE_CONTACT_LIMIT,
    duration: 30, // days
    price: 0
  },
  PREMIUM: {
    name: 'premium',
    contactLimit: 100,
    duration: 30,
    price: 199
  }
};

module.exports = {
  CONTACT_ONLY_CATEGORIES,
  FREE_CONTACT_LIMIT,
  WARNING_THRESHOLD,
  isContactOnlyCategory,
  shouldWarnSupplier,
  shouldLockSupplier,
  SUBSCRIPTION_PLANS
};
