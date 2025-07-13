import ENVIROMENT from "../config/enviroment.js"
import { verifyEmail, verifyMinLength, verifyString, verifyValidator } from "../helpers/validations.helpers.js"
import AppError from "../helpers/errors/app.error.js"
import { createUserToken } from '../helpers/users/user.helpers.js'
import User from "../models/user.model.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { sendRegisterMail, sendRecoveryMail, sendContactMail } from "../helpers/emailTransporter.helpers.js"


const validateRegister = (name, password, email) => {
    const validator = {
        name: {
            value: name,
            validation: [
                verifyString,
                (field_name, field_value) => verifyMinLength(field_name, field_value, 5)
            ]
        },
        password: {
            value: password,
            validation: [
                verifyString,
                (field_name, field_value) => verifyMinLength(field_name, field_value, 10)
            ]
        },
        email: {
            value: email,
            validation: [
                verifyEmail,
                (field_name, field_value) => verifyMinLength(field_name, field_value, 10)
            ]
        }
    }
    return verifyValidator(validator)
}

const validateLogin = (email, password) => {
    const validator = {
        email: {
            value: email,
            validation: [
                verifyEmail,
                (field_name, field_value) => verifyMinLength(field_name, field_value, 10)
            ]
        },
        password: {
            value: password,
            validation: [
                verifyString,
                (field_name, field_value) => verifyMinLength(field_name, field_value, 10)
            ]
        }
    }
    return verifyValidator(validator)
}

const validateRecovery = (password, reset_token) => {
    const validator = {
        password: {
            value: password,
            validation: [
                verifyString,
                (field_name, field_value) => verifyMinLength(field_name, field_value, 10)
            ]
        },
        reset_token: {
            value: reset_token,
            validation: [
                verifyString
            ]
        }
    }
    return verifyValidator(validator)
}

const validateContact = (name, email, message) => {
    const validator = {
        name: {
            value: name,
            validation: [
                verifyString,
                (field_name, field_value) => verifyMinLength(field_name, field_value, 5)
            ]
        },
        email: {
            value: email,
            validation: [
                verifyEmail
            ]
        },
        message: {
            value: message,
            validation: [
                verifyString,
                (field_name, field_value) => verifyMinLength(field_name, field_value, 10)
            ]
        }
    }
    return verifyValidator(validator)
}

export const registerController = async (req, res, next) => {
    try {
        const { name, password, email } = req.body

        const errors = validateRegister(name, password, email)
        if (errors !== undefined) {
            next(new AppError(errors, 400))
            return
        }

        const existingUser = await User.findOne({ email: email })
        if (existingUser) {
            return next(new AppError('El email ya está registrado', 400))
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const userCreated = new User({
            name: name,
            email: email,
            password: hashedPassword,
            verificationToken: ''
        })
        await userCreated.save() //esto lo guarda en mongoDB

        const validationToken = jwt.sign(
            { email: email },
            ENVIROMENT.SECRET_KEY,
            { expiresIn: '1d', }
        )

        await sendRegisterMail(validationToken, email)

        return res.status(201).json({
            ok: true,
            message: 'Usuario registrado correctamente. Verifica tu correo electrónico.'
        })
    }
    catch (error) {
        next(error)
    }
}

export const verifyEmailController = async (req, res, next) => {
    try {
        const { validation_token } = req.params
        const payload = jwt.verify(validation_token, ENVIROMENT.SECRET_KEY)
        const email_to_verify = payload.email
        const user_to_verify = await User.findOne({ email: email_to_verify })
        if (!user_to_verify) {
            return next(new AppError('Usuario no encontrado para verificar email', 404))
        }
        user_to_verify.emailVerified = true
        await user_to_verify.save()
        return res.status(200).json({
            ok: true,
            message: 'Correo electrónico verificado correctamente'
        })
    }
    catch (error) {
        next(error)
    }
}
export const loginController = async (req, res, next) => {
    try {
        const { email, password } = req.body

        const errors = validateLogin(email, password)
        if (errors) {
            return next(new AppError(errors, 400))
        }

        const user = await User.findOne({ email: email })
        if (!user) {
            next(new AppError('Usuario no encontrado', 404))
            return
        }

        const isCorrectPassword = await bcrypt.compare(password, user.password)
        if (!isCorrectPassword) {
            next(new AppError('Contraseña incorrecta', 401))
            return
        }

        if (!user.emailVerified) {
            next(new AppError('El correo electronico no ha sido verificado', 403))
            return
        }

        const userPublic = createUserToken(user)
        const access_token = jwt.sign(userPublic, ENVIROMENT.SECRET_KEY, { expiresIn: '1d' })

        return res.status(200).json({
            ok: true,
            access_token,
            user: userPublic
        })

    }
    catch (error) {
        next(error)
    }
}

export const forgotPasswordController = async (req, res, next) => {
    try {
        const { email } = req.body
        const user = await User.findOne({ email: email })

        if (!user) {
            next(new AppError('El usuario no existe', 404))
            return
        }

        const reset_token = jwt.sign(
            {
                email: email
            },
            ENVIROMENT.SECRET_KEY,
            {
                expiresIn: '1d'
            }
        )

        await sendRecoveryMail(reset_token, email)


        return res.status(200).json({
            ok: true,
            message: 'Correo de restablecimiento de contraseña enviado'
        })
    }
    catch (error) {
        next(error)
    }
}

export const recoveryPasswordController = async (req, res, next) => {
    try {
        const { password, reset_token } = req.body
        const errors = validateRecovery(password, reset_token)

        if (errors) {
            return next(new AppError(errors, 400))
        }

        const { email } = jwt.verify(reset_token, ENVIROMENT.SECRET_KEY)
        const user_to_modify = await User.findOne({ email: email })

        if (!user_to_modify) {
            next(new AppError('El usuario no existe', 404))
            return
        }


        const newHashedPassword = await bcrypt.hash(password, 10)
        user_to_modify.password = newHashedPassword

        await user_to_modify.save()
        res.status(200).json({
            ok: true,
            message: 'Contraseña restablecida correctamente'
        })
    }
    catch (error) {
        next(error)
    }
}

export const contactMailController = async (req, res, next) => {
    try {
        const { name, email, message } = req.body
        const errors = validateContact(name, email, message)

        if (errors) {
            return next(new AppError(errors, 400))
        }

        if (!name || !email || !message) {
            return res.status(400).json({
                message: 'Todos los campos son obligatorios.'
            })
        }

        await sendContactMail(name, email, message)

        res.status(200).json({
            message: 'Mensaje enviado correctamente. Gracias por contactarnos.'
        })
    } 
    catch (error) {
        next(error)
    }
}
