const Product = require("../models/product");

const createProduct = async (productData) => {
  try {
    if (productData) {
      const existingCode = await Product.findOne({
        status: true,
        code: productData.code,
      });

      if (existingCode) {
        throw new Error("Code already exists");
      }
    }

    const result = await Product.create(productData);
    return result;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

// ===================================================
// UPDATE PRODUCT (same logic)
// ===================================================
const updateProduct = async (id, updateData) => {
  try {
    const product = await Product.findById(id);
    if (!product) {
      throw new Error("Product not found");
    }

    Object.assign(product, updateData);
    await product.save();

    return product;
  } catch (error) {
    throw new Error(error.message);
  }
};


// const getProductById = async (id) => {
//   try {
//     const organizedData = await Product.findById(id);

//     console.log("organizedData--------------------", organizedData);

//     if (!organizedData) {
//       return null;
//     }

//     const productData = organizedData.toObject();
//     return productData;
//   } catch (error) {
//     console.error("Error fetching product by ID:", error);
//     throw error;
//   }
// };

const mongoose = require("mongoose");

const getProductById = async (id) => {
  try {
    let organizedData;

    // ✅ If valid Mongo ObjectId → search by _id
    if (mongoose.Types.ObjectId.isValid(id)) {
      organizedData = await Product.findById(id);
    } 
    // ✅ Otherwise → treat as MySQL UUID
    else {
      organizedData = await Product.findOne({ mysqlProductId: id });
    }

    console.log("organizedData--------------------", organizedData);

    if (!organizedData) {
      return null;
    }

    return organizedData.toObject();

  } catch (error) {
    console.error("Error fetching product by ID:", error);
    throw error;
  }
};

const getCreatedDateFilter = (createdAtFilter, startDate = null, endDate = null) => {
  const now = new Date();
  const start = new Date();
  const end = new Date();

  switch (createdAtFilter) {
    case "All_Dates":
      return null;

    case "today":
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return { $gte: start, $lte: end };

    case "yesterday":
      start.setDate(now.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      end.setDate(now.getDate() - 1);
      end.setHours(23, 59, 59, 999);
      return { $gte: start, $lte: end };

    case "thisWeek": {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      start.setDate(diff);
      start.setHours(0, 0, 0, 0);
      end.setDate(diff + 6);
      end.setHours(23, 59, 59, 999);
      return { $gte: start, $lte: end };
    }

    case "lastWeek": {
      const day = now.getDay();
      const diff = now.getDate() - day - 6;
      start.setDate(diff);
      start.setHours(0, 0, 0, 0);
      end.setDate(diff + 6);
      end.setHours(23, 59, 59, 999);
      return { $gte: start, $lte: end };
    }

    case "thisMonth":
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(now.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      return { $gte: start, $lte: end };

    case "lastMonth":
      start.setMonth(now.getMonth() - 1, 1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(now.getMonth(), 0);
      end.setHours(23, 59, 59, 999);
      return { $gte: start, $lte: end };

    case "thisYear":
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(11, 31);
      end.setHours(23, 59, 59, 999);
      return { $gte: start, $lte: end };

    case "customRange":
      if (startDate && endDate) {
        return {
          $gte: new Date(startDate + " 00:00:00"),
          $lte: new Date(endDate + " 23:59:59"),
        };
      }

      if (startDate && !endDate) {
        return {
          $gte: new Date(startDate + " 00:00:00"),
        };
      }

      if (!startDate && endDate) {
        return {
          $lte: new Date(endDate + " 23:59:59"),
        };
      }

      return null;

    default:
      return null;
  }
};


const getAllProducts = async (
  page,
  limit,
  sortBy,
  sortOrder,
  falsePagination
) => {
  try {
    const offset = (page - 1) * limit;
    const validSortFields = ["code", "title", "createdAt", "updatedAt"];
    const orderField = validSortFields.includes(sortBy) ? sortBy : "createdAt";
    const orderDirection = sortOrder && sortOrder.toUpperCase() === "ASC" ? 1 : -1;

   
    if (falsePagination) {
      const products = await Product.find().sort({ [orderField]: orderDirection });

      const parsedProducts = products.map((product) => {
        const productData = product.toObject();
        return {
          ...productData,
          specialOffers: productData.specialOffers || [],
        };
      });

      return {
        total: parsedProducts.length,
        totalPages: 1,
        currentPage: 1,
        products: parsedProducts,
      };
    }

 
    const [products, total] = await Promise.all([
      Product.find()
        .sort({ [orderField]: orderDirection })
        .skip(parseInt(offset, 10))
        .limit(parseInt(limit, 10)),
      Product.countDocuments(),
    ]);

    const parsedProducts = products.map((product) => {
      const productData = product.toObject();
      return {
        ...productData,
        images: productData.images,
        themes: productData.themes,
        bookingCutOffTime: productData.bookingCutOffTime,
        times: productData.times,
        pickupPlaces: productData.pickupPlaces,
        dropoffPlaces: productData.dropoffPlaces,
        locations: productData.locations,
        cancellationPolicies: productData.cancellationPolicies,
        whatToBring: productData.whatToBring,
        ageRanges: productData.ageRanges,
        exclusions: productData.exclusions,
        inclusions: productData.inclusions,
        categories: productData.categories,
        destinations: productData.destinations,
        languages: productData.languages,
        languagesTour: productData.languagesTour,
        resources: productData.resources,
        rates: productData.rates,
        tasks: productData.tasks,
        experienceType: productData.experienceType,
        specialOffers: productData.specialOffers || [],
      };
    });

    return {
      total: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      products: parsedProducts,
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};


const getAllProductWithSi = async (page, limit) => {
  try {
    const offset = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find({
        status: true,
        supplierId: { $ne: null },
      })
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit),
      Product.countDocuments({
        status: true,
        supplierId: { $ne: null },
      }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: products,
    };
  } catch (error) {
    throw new Error(`Unable to fetch products: ${error.message}`);
  }
};

// ===================================================
// DELETE PRODUCT (soft delete same logic)
// ===================================================
const deleteProduct = async (id) => {
  try {
    const product = await Product.findById(id);

    if (!product) {
      return null;
    }

    product.status = false;
    await product.save();

    return product;
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};




const updateProductBySyncId = async (syncId, updateData, session = null) => {
  try {
    const options = {
      new: true,
      lean: true,
    };

    if (session) {
      options.session = session;
    }

    const product = await Product.findOneAndUpdate(
      { syncId },
      { $set: updateData },
      options
    );

    if (!product) {
      throw new Error("Product not found");
    }

    return product;
  } catch (error) {
    console.error("Mongo service updateProductBySyncId error:", error);
    throw error;
  }
};



const getProductBySyncId = async (syncId) => {
  try {
    const product = await Product.findOne({ syncId }).lean();

    if (!product) {
      throw new Error("Product not found in Mongo");
    }

    return product;
  } catch (error) {
    console.error("Mongo service getProductBySyncId error:", error);
    throw new Error("Failed to fetch product by syncId: " + error.message);
  }
};


// services/product.service.js
const deleteProductBySyncId = async (syncId) => {
  const deletedProduct = await Product.findOneAndDelete({ syncId });

  if (!deletedProduct) {
    throw new Error("Product not found");
  }

  return deletedProduct.toObject();
};







/**
 * Hard replace Mongo product
 * @param {object} productData - Full product object fetched from MySQL
 * @returns {object} - Mongo document
 */
const hardReplaceMongoProduct = async (productData) => {
  try {
    if (!productData || !productData.syncId) {
      throw new Error("Product data with syncId is required");
    }

    const mongoProduct = await Product.findOneAndReplace(
      { syncId: productData.syncId },
      productData,
      { upsert: true, new: true, overwrite: true }
    );

    return mongoProduct;
  } catch (error) {
    console.error("Mongo Hard Replace Error:", error.message);
    throw new Error("Failed to sync product to Mongo: " + error.message);
  }
};









module.exports = {
  createProduct,
  updateProduct,
  getProductById,
  getAllProducts,
  deleteProduct,
  getAllProductWithSi,
  updateProductBySyncId,
  getProductBySyncId,
  deleteProductBySyncId,
  hardReplaceMongoProduct
};
