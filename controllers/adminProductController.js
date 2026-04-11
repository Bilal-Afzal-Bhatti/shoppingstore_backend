import AdminProduct from '../models/adminProductModel.js';
import asyncHandler from '../utils/asyncHandler.js';

// ─── GET ALL ──────────────────────────────────────────────────────────────────
// GET /api/admin/products?page=1&limit=10
export const getProducts = asyncHandler(async (req, res) => {
  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip  = (page - 1) * limit;

  const total    = await AdminProduct.countDocuments({ isActive: true });
  const products = await AdminProduct.find({ isActive: true })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: products,
  });
});

// ─── GET ONE ──────────────────────────────────────────────────────────────────
// GET /api/admin/products/:id
export const getProductById = asyncHandler(async (req, res) => {
  const product = await AdminProduct.findById(req.params.id);

  if (!product || !product.isActive) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  res.status(200).json({ success: true, data: product });
});

// ─── CREATE ───────────────────────────────────────────────────────────────────
// POST /api/admin/products
export const createProduct = asyncHandler(async (req, res) => {
  const { name, price, originalPrice, stock, image, discount } = req.body;

  if (!name || price === undefined || stock === undefined || !image) {
    return res.status(400).json({
      success: false,
      message: 'name, price, stock, and image are required',
    });
  }

  const product = await AdminProduct.create({
    name,
    price,
    originalPrice: originalPrice || null,
    stock,
    image,
    discount: discount || 'No Discount',
  });

  res.status(201).json({ success: true, data: product });
});

// ─── UPDATE ───────────────────────────────────────────────────────────────────
// PUT /api/admin/products/:id
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await AdminProduct.findById(req.params.id);

  if (!product || !product.isActive) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const { name, price, originalPrice, stock, image, discount } = req.body;

  product.name          = name          ?? product.name;
  product.price         = price         ?? product.price;
  product.originalPrice = originalPrice ?? product.originalPrice;
  product.stock         = stock         ?? product.stock;
  product.image         = image         ?? product.image;
  product.discount      = discount      ?? product.discount;

  const updated = await product.save();
  res.status(200).json({ success: true, data: updated });
});

// ─── DELETE (soft) ────────────────────────────────────────────────────────────
// DELETE /api/admin/products/:id
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await AdminProduct.findById(req.params.id);

  if (!product || !product.isActive) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  product.isActive = false;
  await product.save();

  res.status(200).json({ success: true, message: 'Product deleted successfully', id: req.params.id });
});