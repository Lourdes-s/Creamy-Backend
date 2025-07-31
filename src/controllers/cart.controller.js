import AppError from "../helpers/errors/app.error.js"
import User from "../models/user.model.js"

export const addToCartController = async (req, res, next) => {
    try {
        const { productId, quantity } = req.body
        const userId = req.user.id

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

        return res.status(201).json({
            ok: true,
            payload: { cart: user.cart }
        })
    }
    catch (error) {
        next(error)
    }
}

export const removeFromCartController = async (req, res, next) => {
    try {
        const { productId } = req.params
        const userId = req.user.id

        const user = await User.findById(userId)
        user.cart = user.cart.filter(item => item.product.toString() !== productId)

        await user.save()

        return res.status(200).json({ ok: true, payload: { cart: user.cart } })
    } catch (error) {
        next(error)
    }
}

export const updateCartItemController = async (req, res, next) => {
    try {
        const { productId, quantity } = req.body
        const userId = req.user.id

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
        const userId = req.user?.id
        if (!userId) {
            return next(new AppError('No se pudo identificar al usuario', 401))
        }
        const user = await User.findById(userId).populate('cart.product')
        if (!user) {
            return next(new AppError('Usuario no encontrado', 404))
        }
        return res.status(200).json({ ok: true, payload: { cart: user.cart } })
    } catch (error) {
        next(error)
    }
}

export const clearCartController = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id)
        if (!user) {
            return next(new AppError('Usuario no encontrado', 404))
        }
        user.cart = [] 
        await user.save() 
        const updatedUser = await User.findById(user._id).populate('cart.product')
        console.log('Carrito después de vaciar (revisado):', updatedUser.cart)
        return res.status(200).json({ ok: true, payload: { cart: updatedUser.cart } })
    } catch (error) {
        next(error)
    }
}