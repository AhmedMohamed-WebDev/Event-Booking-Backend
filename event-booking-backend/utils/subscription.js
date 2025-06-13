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

module.exports = {
  CONTACT_ONLY_CATEGORIES,
  FREE_CONTACT_LIMIT,
  WARNING_THRESHOLD,
  isContactOnlyCategory,
  shouldWarnSupplier,
  shouldLockSupplier,
};
