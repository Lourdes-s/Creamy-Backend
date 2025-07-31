import express from 'express'
import authMiddleware from '../middlewares/auth.middleware.js'
import { addToCartController, removeFromCartController, updateCartItemController, getCartController, clearCartController } from '../controllers/cart.controller.js'

const cartRouter = express.Router()

cartRouter.get('/', authMiddleware(['user', 'admin']), getCartController)
cartRouter.post('/add', authMiddleware(['user', 'admin']), addToCartController)
cartRouter.put('/update', authMiddleware(['user', 'admin']), updateCartItemController)
cartRouter.delete('/clear', authMiddleware(['user', 'admin']), clearCartController)
cartRouter.delete('/:productId', authMiddleware(['user', 'admin']), removeFromCartController)



export default cartRouter