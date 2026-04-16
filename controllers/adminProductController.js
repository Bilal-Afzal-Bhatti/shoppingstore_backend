// controllers/adminProductController.js
import AdminProduct from '../models/adminProductModel.js';
import asyncHandler from '../utils/asyncHandler.js';

// ─── GET ALL ──────────────────────────────────────────────────────────────────
// GET /api/admin/products?page=1&limit=10&category=Electronics
export const getProducts = asyncHandler(async (req, res) => {
  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip  = (page - 1) * limit;

  // ── Build filter ────────────────────────────────────────────────────────────
  const filter = { isActive: true };
  if (req.query.category) filter.category = req.query.category;
  if (req.query.search) {
    filter.name = { $regex: req.query.search, $options: 'i' };
  }

  const [total, products] = await Promise.all([
    AdminProduct.countDocuments(filter),
    AdminProduct.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
  ]);

  res.status(200).json({
    success: true,
    count:   products.length,
    total,
    page,
    pages:   Math.ceil(total / limit),
    data:    products,
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
  const { name, price, originalPrice, stock, image, discount, category, colors } = req.body;

  if (!name || price === undefined || stock === undefined || !image || !category) {
    return res.status(400).json({
      success: false,
      message: 'name, price, stock, image, and category are required',
    });
  }

  // ── Validate colors array if provided ──────────────────────────────────────
  if (colors && !Array.isArray(colors)) {
    return res.status(400).json({ success: false, message: 'colors must be an array' });
  }

  const product = await AdminProduct.create({
    name,
    price,
    originalPrice: originalPrice || null,
    stock,
    image,
    discount: discount || 'No Discount',
    category,
    colors:   colors || [],
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

  const { name, price, originalPrice, stock, image, discount, category, colors } = req.body;

  product.name          = name          ?? product.name;
  product.price         = price         ?? product.price;
  product.originalPrice = originalPrice ?? product.originalPrice;
  product.stock         = stock         ?? product.stock;
  product.image         = image         ?? product.image;
  product.discount      = discount      ?? product.discount;
  product.category      = category      ?? product.category;
  product.colors        = colors        ?? product.colors;

  const updated = await product.save();
  res.status(200).json({ success: true, data: updated });
});

// ─── ADD COLOR VARIANT ────────────────────────────────────────────────────────
// POST /api/admin/products/:id/colors
export const addColor = asyncHandler(async (req, res) => {
  const { name, hex, stock } = req.body;

  if (!name || !hex) {
    return res.status(400).json({ success: false, message: 'Color name and hex are required' });
  }

  const product = await AdminProduct.findById(req.params.id);
  if (!product || !product.isActive) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  product.colors.push({ name, hex, stock: stock || 0 });
  await product.save();

  res.status(200).json({ success: true, data: product });
});

// ─── REMOVE COLOR VARIANT ─────────────────────────────────────────────────────
// DELETE /api/admin/products/:id/colors/:colorId
export const removeColor = asyncHandler(async (req, res) => {
  const product = await AdminProduct.findById(req.params.id);
  if (!product || !product.isActive) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  product.colors = product.colors.filter(
    (c) => c._id.toString() !== req.params.colorId
  );

  await product.save();
  res.status(200).json({ success: true, data: product });
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
// ─── GET LEADERBOARD (CMS ANALYTICS) ──────────────────────────────────────────
// GET /api/admin/products/leaderboard/:category
export const getProductLeaderboard = asyncHandler(async (req, res) => {
  const { category } = req.params;

  const leaderboard = await AdminProduct.aggregate([
    // 1. Filter by category and active status
    { $match: { category: category, isActive: true } },
    
    // 2. Sort by highest average, then highest count (Industry Standard)
    { $sort: { "ratings.average": -1, "ratings.count": -1 } },
    
    // 3. Keep payload light for the Admin Table
    { 
      $project: { 
        name: 1, 
        image: 1, 
        price: 1, 
        "ratings.average": 1, 
        "ratings.count": 1 
      } 
    },
    { $limit: 10 }
  ]);

  res.status(200).json({ success: true, data: leaderboard });
});

// ─── SUBMIT REVIEW & UPDATE RATING ───────────────────────────────────────────
// POST /api/admin/products/:id/review
export const addProductReview = asyncHandler(async (req, res) => {
  const { rating } = req.body; // Expecting number 1-5
  const productId = req.params.id;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
  }

  const product = await AdminProduct.findById(productId);
  if (!product || !product.isActive) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  // Industrial Standard Calculation:
  // Recalculate average: (OldAvg * OldCount + NewRating) / (OldCount + 1)
  const currentTotalPoints = product.ratings.average * product.ratings.count;
  product.ratings.count += 1;
  product.ratings.average = (currentTotalPoints + rating) / product.ratings.count;

  // Increment specific star count for CMS charts
  product.ratings.stars[rating] = (product.ratings.stars[rating] || 0) + 1;

  await product.save();

  res.status(200).json({ 
    success: true, 
    message: 'Rating submitted', 
    average: product.ratings.average 
  });
});