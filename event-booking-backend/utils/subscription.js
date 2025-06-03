// utils/subscription.js

const categoriesWithLimit = ["Hall", "Farm", "Salon"];

function shouldEnforceLimit(category) {
  return categoriesWithLimit.includes(category);
}

function shouldLockSupplier(supplier) {
  return supplier.bookingCount >= 50;
}

module.exports = { shouldEnforceLimit, shouldLockSupplier };
