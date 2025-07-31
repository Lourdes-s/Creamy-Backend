import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: {
        type: String
    },
    cart: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: {
                type: Number,
                required: true,
                min: [1, 'La cantidad mínima es 1'],
                default: 1,
                validate: {
                    validator: Number.isInteger,
                    message: 'La cantidad debe ser un entero'
                }
            }
        }
    ],
    fecha_creacion: {
        type: Date,
        default: Date.now
    },
    role: {
        type: String,
        default: 'user',
        required: true
    },
    activo: {
        type: Boolean,
        default: true
    }
})

const User = mongoose.model('User', userSchema)

export default User