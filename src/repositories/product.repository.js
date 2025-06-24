import Product from "../models/products.model.js"

//capa logica de nuestra aplicacion para comunica con la base de datos por si queremos cambiar de base de datos solo tenemos que cambiar en un lugar

class ProductRepository{
    static async createProduct (new_product_data){
        const new_product = new Product (new_product_data)
        return await new_product.save()
    }

    static async updateProduct (product_id, update_data) { 
        return Product.findByIdAndUpdate(product_id, update_data)
    }

    static async getAllProducts (){
        return Product.find({active: true})
    }

    static async getProductById (product_id){
        return Product.findById(product_id)
    }

    static async deleteProduct (product_id){
                //{new: true} indica que tiene que devolver el producto actualiado
        return Product.findByIdAndUpdate(product_id, {active: false}, {new: true})
    }
}

export default ProductRepository