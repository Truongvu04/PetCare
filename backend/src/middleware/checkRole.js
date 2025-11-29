export const isVendor = (req, res, next) => {
  if (!req.vendor) {
    return res.status(403).json({ message: "Forbidden: Vendor access required" });
  }
  next();
};

export const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }
  next();
};

export const isCustomer = (req, res, next) => {
  if (!req.vendor) {
    next();
  } else {
    return res.status(403).json({ message: "Forbidden: Customer access required (not vendor)" });
  }
};

