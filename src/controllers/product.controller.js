const { productService, availabilityService } = require("../services");
const { Recurrence,Product } = require("../models");
const axios = require("axios");
const { randomUUID } = require("crypto");
// const MYSQL_BASE_URL = "http://192.168.29.95:3000/kan/product";
const MYSQL_BASE_URL = "http://192.168.29.178:3000/kan/product";

const createProduct = async (req, res) => {
  try {
    const data = { ...req.body };
    if (!data.syncId) {
      data.syncId = randomUUID();
    }
    const product = await productService.createProduct(data);
    const syncId = product.syncId || data.syncId;
    const syncSource = req.headers["x-sync-source"] || "mongo";
    const mysqlSyncEnabled = Boolean(MYSQL_BASE_URL);
    const shouldSyncToMySQL =
      mysqlSyncEnabled && syncSource !== "mysql" && product?._id;

    if (shouldSyncToMySQL) {
      try {
        await axios.post(
          MYSQL_BASE_URL,
          {
            ...data,
            syncId,               
            mongoProductId: product._id,
          },
          {
            headers: { "x-sync-source": "mongo" },
          }
        );

        console.log("✅ Product synced to MySQL successfully");
      } catch (mysqlErr) {
        console.error(
          "❌ MySQL sync error (product create):",
          mysqlErr.response?.data || mysqlErr.message
        );
      }
    } else {
      if (!mysqlSyncEnabled) {
        console.log("Skipping Mongo → MySQL sync (MYSQL_BASE_URL not set)");
      } else if (syncSource === "mysql") {
        console.log("Skipping Mongo → MySQL sync (request came from MySQL)");
      } else {
        console.log("Skipping Mongo → MySQL sync (missing Mongo product id)");
      }
    }

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    console.error("Error creating product (Mongo):", error);

    if (error.message.includes("Code already exists")) {
      return res.status(400).json({
        success: false,
        message: "Product code already exists",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Error creating product",
      error: error.message,
    });
  }
};


const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const productData = req.body;

    const updatedProduct = await productService.updateProduct(
      productId,
      productData
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // ----- SYNC TO MYSQL -----
    try {
      const syncId = updatedProduct.syncId || productData.syncId;

      if (!syncId) {
        console.log("syncId missing, skipping MySQL update sync");
      } else {
        await axios.put(`${MYSQL_BASE_URL}/${syncId}`, productData, {
          headers: { "x-sync-source": "mongo" },
        });
      }
    } catch (mysqlErr) {
      console.error(
        "MySQL sync error (update):",
        mysqlErr.response?.data || mysqlErr.message
      );
    }

    return res.status(200).json({
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error updating product",
      error: error.message,
    });
  }
};


const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await productService.deleteProduct(id);
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    try {
      const syncId = deletedProduct.syncId;

      if (!syncId) {
        console.log("syncId missing, skipping MySQL delete sync");
      } else {
        await axios.delete(`${MYSQL_BASE_URL}/${syncId}`, {
          headers: { "x-sync-source": "mongo" },
        });
      }
    } catch (mysqlErr) {
      console.error(
        "MySQL sync error (delete):",
        mysqlErr.response?.data || mysqlErr.message
      );
    }
    return res.status(200).json({
      message: "Product deleted successfully",
      data: deletedProduct,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error deleting product",
      error: error.message,
    });
  }
};


const getProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await productService.getProductById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.status(200).json({
      message: "Product fetched successfully",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching product",
      error: error.message,
    });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "DESC",
      falsePagination = false,
    } = req.query;
    const products = await productService.getAllProducts(
      page,
      limit,
      sortBy,
      sortOrder,
      falsePagination
    );

    return res.status(200).json({
      message: "Products fetched successfully",
      data: products,
    });
  } catch (error) {
    console.log("error-----------------------",error)
    return res.status(500).json({
      message: "Error fetching products",
      error: error.message,
    });
  }
};

const getAllProductWithSi = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const products = await productService.getAllProductWithSi(page, limit);
    return res.status(200).json({
      message: "Products fetched successfully",
      data: products,
    });
  } catch (error) {
    console.log("error-----------------------",error)
    return res.status(500).json({
      message: "Error fetching products",
      error: error.message,
    });
  }
};

const getProductBySyncId = async (req, res) => {
  try {
    const { syncId } = req.params;
    const product = await productService.getProductBySyncId(syncId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Product fetched successfully (Mongo)",
      data: product,
    });
  } catch (error) {
    console.error("Mongo controller getProductBySyncId error:", error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


const updateProductBySyncId = async (req, res) => {
  try {
    const { syncId } = req.params;
    const updateData = req.body;
    const updatedProduct =
    await productService.updateProductBySyncId(syncId, updateData);
    const syncSource = req.headers["x-sync-source"];
    if (syncSource !== "mysql") {
      try {
        await axios.put(
          `${MYSQL_BASE_URL}/sync/${syncId}`,
          {
            ...updateData,
            mongoProductId: updatedProduct._id,
          },
          {
            headers: { "x-sync-source": "mongo" },
          }
        );
        console.log("✅ Product synced to MySQL successfully");
      } catch (mysqlErr) {
        console.error(
          "❌ MySQL sync error:",
          mysqlErr.response?.data || mysqlErr.message
        );
      }
    }
    return res.status(200).json({
      success: true,
      message: "Product updated successfully (Mongo)",
      data: updatedProduct,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};




const deleteProductBySyncId = async (req, res) => {
  try {
    const { syncId } = req.params;
    const deletedProduct = await productService.deleteProductBySyncId(syncId);
    const syncSource = req.headers["x-sync-source"];
    if (syncSource !== "mysql") {
      try {
        await axios.delete(
          `${MYSQL_BASE_URL}/products/sync/${syncId}`,
          {
            headers: { "x-sync-source": "mongo" },
          }
        );
        console.log("✅ MySQL hard delete synced (product)");
      } catch (mysqlErr) {
        console.error(
          "❌ MySQL sync error (product hard delete):",
          mysqlErr.response?.data || mysqlErr.message
        );
      }
    }
    return res.status(200).json({
      success: true,
      message: "Product deleted successfully (Mongo)",
      data: deletedProduct
    });

  } catch (error) {
    console.error("Mongo controller deleteProductBySyncId error:", error.message);
    return res.status(error.message === "Product not found" ? 404 : 400).json({
      success: false,
      message: error.message,
    });
  }
};


const hardSyncFromMySQL = async (req, res) => {
  const { syncId } = req.params;

  try {
    const response = await axios.get(
      `${MYSQL_BASE_URL}/sync/${syncId}`,
      { headers: { "x-sync-source": "mongo" } }
    );
    const mysqlProduct = response.data.data;
    if (!mysqlProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found in MySQL",
      });
    }
    const mongoProduct = await productService.hardReplaceMongoProduct(mysqlProduct);
    return res.json({
      success: true,
      message: "Hard sync completed",
      data: mongoProduct,
    });

  } catch (error) {
    console.error("Hard sync error:", error.message);

    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        message: "Product not found in MySQL",
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
  getAllProducts,
  getAllProductWithSi,
  updateProductBySyncId,
  getProductBySyncId,
  deleteProductBySyncId,
  hardSyncFromMySQL
};
