import AppError from "../helpers/errors/app.error.js"
import User from "../models/user.model.js"

export const addToCartController = async (req, res, next) => {
    try {
        const { productId, quantity } = req.body
        const userId = req.user._id

        if (!productId || quantity <= 0) {
            return next(new AppError('Datos inválidos', 400))
        }

        const user = await User.findById(userId)
        const existingItem = user.cart.find(item => item.product.toString() === productId)

        if (existingItem) {
            existingItem.quantity += quantity
        } else {
            user.cart.push({ product: productId, quantity })
        }

        await user.save()

        return res.status(201).json(user.cart)
    }
    catch (error) {
        next(error)
    }
}

export const removeFromCartController = async (req, res, next) => {
    try {
        const { productId } = req.params
        const userId = req.user._id

        const user = await User.findById(userId)
        user.cart = user.cart.filter(item => item.product.toString() !== productId)

        await user.save()

        return res.status(200).json(user.cart)
    } catch (error) {
        next(error)
    }
}

export const updateCartItemController = async (req, res, next) => {
    try {
        const { productId, quantity } = req.body
        const userId = req.user._id

        if (quantity <= 0) {
            return next(new AppError('Cantidad inválida', 400))
        }

        const user = await User.findById(userId)
        const item = user.cart.find(item => item.product.toString() === productId)

        if (!item) {
            return next(new AppError('Producto no encontrado en el carrito', 404))
        }

        item.quantity = quantity
        await user.save()

        return res.status(200).json(user.cart)
    } catch (error) {
        next(error)
    }
}

export const getCartController = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).populate('cart.product')
        return res.status(200).json(user.cart)
    } catch (error) {
        next(error)
    }
}

export const clearCartController = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id)
        user.cart = []
        await user.save()
        return res.status(200).json({ message: 'Carrito vacío' })
    } catch (error) {
        next(error)
    }
}