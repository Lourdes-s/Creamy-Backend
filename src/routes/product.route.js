import express from 'express'
import { createProductController, deleteProductController, getAllProductsController, getProductByIdController, updateProductController } from '../controllers/product.controller.js'
import authMiddleware from '../middlewares/auth.middleware.js'

const productRouter = express.Router()

productRouter.get('/:product_id', getProductByIdController)
productRouter.get('/', getAllProductsController)
productRouter.post('/', authMiddleware(['admin']), createProductController)
productRouter.put('/:product_id', authMiddleware(['admin']), updateProductController)
productRouter.delete('/:product_id', authMiddleware(['admin']), deleteProductController)

export default productRouter                            