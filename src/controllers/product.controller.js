import AppError from "../helpers/errors/app.error.js"
import ProductRepository from "../repositories/product.repository.js"

export const createProductController = async (req, res, next) => {
    try{
        const {new_product} = req.body
        if (!new_product) {
            return next(new AppError('Se necesita la informacion del producto para crearlo', 400)) //yo le puedo pasar a next el parametro para x middleware
        }
        const createdProduct = await ProductRepository.createProduct({...new_product, seller_id: req.user.id})
        return res.status(201).json(createdProduct)
    }
    catch(err){
        next(err)
    }
}

export const deleteProductController = async (req, res, next) => {
    try{
        const { product_id } = req.params
        if (!product_id) {
            return next(new AppError('Se necesita un product_id', 400))
        }
        const deletedProduct = await ProductRepository.deleteProduct(product_id)
        if(!deletedProduct){
            return next(new AppError('Producto no encontrado', 404))
        }
            return res.status(200).json('Producto eliminado')
    }
    catch (err){
        next(err)
    }
}

export const updateProductController = async (req, res, next) => {
    try {
        const { product_id } = req.params
        const { updated_data } = req.body

        if (!updated_data) {
            return next(new AppError('Se necesita la informacion del producto para actualizarlo', 400))
        }

        const updatedProduct = await ProductRepository.updateProduct(product_id, updated_data)
        if (updatedProduct) {
            res.status(200).json(updatedProduct)
        } else {
            return next(new AppError('Producto no encontrado', 404))
        }
    } 
    catch (err) {
        next(err)
    }
}

export const getProductByIdController = async (req, res, next) => {
    try{
        const { product_id } = req.params
        if (!product_id) {
            return next(new AppError('Se necesita un product_id', 400))
        }
        const product = await ProductRepository.getProductById(product_id)
        if (product) {
            return res.json({
                ok: true,
                message: 'Producto obtenido',
                payload: {
                    product: product
                }
            })
        }
        else { 
            return next(new AppError('Producto no encontrado', 404)) 
        }
    }
    catch (err){
        next(err)
    }
}

export const getAllProductsController = async (req, res, next) => {
    try {
        const products = await ProductRepository.getAllProducts()
        return res.status(200).json({
            ok: true,
            payload: {
                products}
            })
    }
    catch (error) {
        next(error)
    }
}