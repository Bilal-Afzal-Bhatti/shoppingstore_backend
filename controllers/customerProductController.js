import AdminProduct from '../models/adminProductModel.js';

// @desc    Get all products (for customers)
// @route   GET /api/customer/product/show
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
    if (category?.toLowerCase() === 'Flash Sales') {
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

// @desc    Add or update a star rating for a product
// @route   POST /api/customer/product/:id/rate
// @access  Public (or Private depending on your auth requirements)
export const rateProduct = async (req, res) => {
  try {
    const { rating } = req.body;
    
    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Please provide a valid rating between 1 and 5' });
    }

    const product = await AdminProduct.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Initialize ratings object if it doesn't exist
    if (!product.ratings) {
      product.ratings = { average: 0, count: 0, stars: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
    }

    // Increment specific star count
    const roundedRating = Math.round(rating);
    product.ratings.stars[roundedRating] = (product.ratings.stars[roundedRating] || 0) + 1;
    
    // Increment total count
    product.ratings.count += 1;

    // Calculate new average
    const currentTotal = (product.ratings.average * (product.ratings.count - 1));
    product.ratings.average = (currentTotal + rating) / product.ratings.count;

    await product.save();

    res.status(200).json({
      success: true,
      message: 'Thank you for your rating!',
      ratings: product.ratings
    });

  } catch (error) {
    console.error('Error rating product:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
