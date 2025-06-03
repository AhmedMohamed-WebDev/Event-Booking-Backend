exports.unlockSupplier = async (req, res) => {
  try {
    const supplier = await User.findById(req.params.id);
    supplier.isLocked = false;
    supplier.bookingCount = 0; // or keep it as is
    await supplier.save();
    res.json({ message: "Supplier unlocked." });
  } catch (err) {
    res.status(500).json({ error: "Failed to unlock supplier" });
  }
};
