// File: /src/utils/axiosInstance.js
import axios from 'axios';

const baseURL =import.meta.env.VITE_BACKEND_BASE_URL;

const axiosInstance = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the JWT token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle authentication errors and common responses
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login page if unauthorized
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(error);
    }
    
    // Create user-friendly error messages
    const errorMessage = 
      error.response?.data?.message || 
      error.response?.statusText || 
      'Something went wrong. Please try again.';
    
    // Show error in console instead of toast
    console.error('API Error:', errorMessage);
    
    return Promise.reject(error);
  }
);

// Helper utility for grouping sales by product
export const groupSalesByProduct = (sales = []) => {
  return sales.reduce((acc, sale) => {
    const productId = sale.product?._id || 'unknown';
    
    if (!acc[productId]) {
      acc[productId] = {
        product: sale.product,
        transactions: [],
        totalRevenue: 0,
        totalSales: 0
      };
    }
    
    acc[productId].transactions.push({
      _id: sale._id,
      buyer: sale.buyer,
      date: sale.createdAt,
      amount: sale.amount,
      status: sale.status
    });
    
    acc[productId].totalRevenue += sale.amount;
    acc[productId].totalSales += 1;
    
    return acc;
  }, {});
};

// Helper utility for grouping purchases by category
export const groupPurchasesByCategory = (purchases = []) => {
  return purchases.reduce((acc, purchase) => {
    const category = purchase.product?.category || 'other';
    
    if (!acc[category]) {
      acc[category] = [];
    }
    
    acc[category].push(purchase);
    return acc;
  }, {});
};

// Helper to calculate statistics from purchases
export const getPurchaseStats = (purchases = []) => {
  return {
    totalItems: purchases.length,
    totalSpent: purchases.reduce((sum, p) => sum + p.amount, 0).toFixed(2),
    documentCount: purchases.filter(p => p.product?.category === 'document').length,
    softwareCount: purchases.filter(p => p.product?.category === 'software').length,
    designCount: purchases.filter(p => p.product?.category === 'design').length,
    otherCount: purchases.filter(p => 
      !['document', 'software', 'design'].includes(p.product?.category)
    ).length,
  };
};

// Enhanced API functions with better error handling
export const api = {
  // Products
  getProducts: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/products', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },
  
  getProductById: async (id) => {
    try {
      const response = await axiosInstance.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  },
  
  getMyProducts: async () => {
    try {
      const response = await axiosInstance.get('/products/seller/my-products');
      return response.data;
    } catch (error) {
      console.error('Error fetching seller products:', error);
      throw error;
    }
  },
  
  // Orders
  getMyPurchases: async () => {
    try {
      const response = await axiosInstance.get('/orders/my-purchases');
      return response.data;
    } catch (error) {
      console.error('Error fetching purchases:', error);
      throw error;
    }
  },
  
  getMySales: async () => {
    try {
      const response = await axiosInstance.get('/orders/my-sales');
      return response.data;
    } catch (error) {
      console.error('Error fetching sales:', error);
      throw error;
    }
  },
  
  getDownloadUrl: async (orderId) => {
    try {
      const response = await axiosInstance.get(`/orders/download/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error generating download URL:', error);
      throw error;
    }
  },
  
  // Product Management
  createProduct: async (productData) => {
    try {
      const response = await axiosInstance.post('/products', productData);
      console.log('Product created successfully!');
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },
  
  updateProduct: async (id, updateData) => {
    try {
      const response = await axiosInstance.put(`/products/${id}`, updateData);
      console.log('Product updated successfully!');
      return response.data;
    } catch (error) {
      console.error(`Error updating product ${id}:`, error);
      throw error;
    }
  },
  
  toggleProductStatus: async (id, currentStatus) => {
    try {
      const response = await axiosInstance.put(`/products/${id}`, {
        active: !currentStatus
      });
      
      const statusText = !currentStatus ? 'activated' : 'deactivated';
      console.log(`Product ${statusText} successfully!`);
      
      return response.data;
    } catch (error) {
      console.error(`Error toggling product status ${id}:`, error);
      throw error;
    }
  },
  
  // File Upload
  getSignedUploadUrl: async (fileName, contentType, fileType = 'file') => {
    try {
      const response = await axiosInstance.post('/uploads/get-signed-url', {
        fileName,
        contentType,
        fileType,
      });
      return response.data;
    } catch (error) {
      console.error('Error getting signed upload URL:', error);
      throw error;
    }
  },
  
  uploadToSignedUrl: async (signedUrl, file, contentType) => {
    try {
      // Direct upload to S3 or storage service
      await axios.put(signedUrl, file, {
        headers: {
          'Content-Type': contentType,
        },
      });
      
      return true;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },
  
  // User
  updateProfile: async (userData) => {
    try {
      const response = await axiosInstance.put('/users/profile', userData);
      console.log('Profile updated successfully!');
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },
  
  // Cart
  getCart: async () => {
    try {
      const response = await axiosInstance.get('/cart');
      return response.data;
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }
  },
  
  addToCart: async (productId) => {
    try {
      const response = await axiosInstance.post('/cart', { productId });
      console.log('Product added to cart!');
      return response.data;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  },
  
  removeFromCart: async (productId) => {
    try {
      const response = await axiosInstance.delete(`/cart/${productId}`);
      console.log('Product removed from cart');
      return response.data;
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  },
  
  // Reviews
  getProductReviews: async (productId) => {
    try {
      const response = await axiosInstance.get(`/reviews/product/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product reviews:', error);
      throw error;
    }
  },
  
  createReview: async (reviewData) => {
    try {
      const response = await axiosInstance.post('/reviews', reviewData);
      console.log('Review submitted successfully!');
      return response.data;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  },
  
  // Authentication helpers
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
  
  getCurrentUser: () => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        return JSON.parse(userJson);
      } catch (e) {
        console.error('Error parsing user data', e);
        return null;
      }
    }
    return null;
  },
  
  // Dashboard data
  getDashboardData: async (userRole) => {
    try {
      const requests = [];
      
      // Role-specific requests
      if (userRole === 'seller' || userRole === 'admin') {
        requests.push(
          axiosInstance.get('/products/seller/my-products'),
          axiosInstance.get('/orders/my-sales')
        );
      }
      
      if (userRole === 'buyer' || userRole === 'admin') {
        requests.push(
          axiosInstance.get('/orders/my-purchases')
        );
      }
      
      const responses = await Promise.all(requests);
      
      // Process the responses based on user role
      const dashboardData = {};
      
      let responseIndex = 0;
      
      if (userRole === 'seller' || userRole === 'admin') {
        dashboardData.products = responses[responseIndex++].data.products;
        dashboardData.sales = responses[responseIndex++].data.orders;
      }
      
      if (userRole === 'buyer' || userRole === 'admin') {
        dashboardData.purchases = responses[responseIndex++].data.orders;
      }
      
      return dashboardData;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }
};

export default axiosInstance;