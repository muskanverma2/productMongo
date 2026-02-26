const express = require("express");
const productController = require("../../controllers/product.controller.js");

const router = express.Router();
router.get("/getAllProductWithSi", productController.getAllProductWithSi);
router.post("/", productController.createProduct);
router.put("/:id", productController.updateProduct);
router.get("/:id", productController.getProductById);
router.get("/", productController.getAllProducts);
router.delete("/:id", productController.deleteProduct);
router.put('/sync/:syncId', productController.updateProductBySyncId);
router.delete("/sync/:syncId",productController.deleteProductBySyncId);
router.get('/sync/:syncId',productController.getProductBySyncId);
router.post("/hard-sync-from-mysql/:syncId",productController.hardSyncFromMySQL);

module.exports = router;
