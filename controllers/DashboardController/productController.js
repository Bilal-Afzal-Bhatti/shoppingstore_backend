import Product from "../../models/DashboardModels/Product.js";

// 1. GET ALL PRODUCTS (With Admin Search & Pagination)
export const getProducts = async () => {
  const res = await fetch(`${API_URL}/products`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch products');
  
  const data = await res.json();
  return data.products; // Extract the array from the response object
};

// 2. CREATE PRODUCT (CMS Entry)
export const addProduct = async (req, res) => {
  try {
    const { name, price, category, stock, image, description } = req.body;

    // Strict validation for data integrity
    if (!name || !price || !category || !image) {
      return res.status(400).json({ 
        success: false, 
        message: "Required fields: Name, Price, Category, and Image are mandatory." 
      });
    }

    const newProduct = new Product({
      ...req.body,
      // Ensure prices and stock are stored as numbers
      price: Number(price),
      stock: Number(stock || 0)
    });

    await newProduct.save();

    res.status(201).json({ 
      success: true, 
      message: "Product successfully indexed in catalog", 
      data: newProduct 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Creation failed", 
      error: error.message 
    });
  }
};

// 3. DELETE PRODUCT (Inventory Removal)
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ 
        success: false, 
        message: "Target product not found in database" 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: `Inventory updated: '${deletedProduct.name}' removed.` 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Deletion failed", 
      error: error.message 
    });
  }
};