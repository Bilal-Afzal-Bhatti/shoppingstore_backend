import AdminProduct from '../models/adminProductModel.js';

// @desc    Get all products (for customers)
// @route   GET /api/customer/product
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const { category, search } = req.query;

    let query = { isActive: true }; // Only show active products to customers

    // 1. BESTSELLING
    if (category?.toLowerCase() === 'bestselling') {
      const bestsellingProducts = await AdminProduct.find(query)
        .sort({ 'ratings.average': -1, 'ratings.count': -1 })
        .limit(10);
      return res.status(200).json({ success: true, data: bestsellingProducts });
    }

    // 2. FLASH SALES
    if (category?.toLowerCase() === 'flash_sales') {
      // Products where discount exist and is NOT 'No Discount'
      query.discount = { $ne: 'No Discount' };
      const flashSales = await AdminProduct.find(query).limit(10);
      return res.status(200).json({ success: true, data: flashSales });
    }

    // 3. NEW ARRIVALS
    if (category?.toLowerCase() === 'new_arrival') {
      const newArrivals = await AdminProduct.find(query)
        .sort({ createdAt: -1 })
        .limit(12);
      return res.status(200).json({ success: true, data: newArrivals });
    }

    // 4. OUR PRODUCTS
    if (category?.toLowerCase() === 'our_products') {
      // Just fetch standard products (maybe a wider limit)
      const ourProducts = await AdminProduct.find(query)
        .sort({ createdAt: -1 })
        .limit(20);
      return res.status(200).json({ success: true, data: ourProducts });
    }

    // Handle other standard categories
    if (category) {
      query.category = category;
    }

    // Handle search query
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const products = await AdminProduct.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error('Error fetching customer products:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get single product by ID (for customers)
// @route   GET /api/customer/product/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await AdminProduct.findOne({
      _id: req.params.id,
      isActive: true, // Only show if active
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
