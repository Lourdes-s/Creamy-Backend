import ENVIROMENT from "../config/enviroment.js"
import ResponseBuilder from "../helpers/builders/response.builder.js"
import { verifyEmail, verifyMinLength, verifyString, verifyValidator } from "../helpers/validations.helpers.js"
import AppError from "../helpers/errors/app.error.js"
import { createUserToken, createUserPublic } from '../helpers/users/user.helpers.js'
import User from "../models/user.model.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { sendRegisterMail, sendRecoveryMail } from "../helpers/emailTransporter.helpers.js"


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

export const forgotPasswordController = async (req, res) => {
    try {
        const { email } = req.body
        console.log(req.body)
        const user = await User.findOne({ email: email })
        if (!user) {
            const response = new ResponseBuilder()
                .setOk(false)
                .setStatus(404)
                .setCode('USER_NOT_FIND')
                .setMessage('No existe un usuario con el correo electrónico proporcionado')
                .setData(
                    {
                        detail: 'No existe un usuario con el correo electrónico proporcionado'
                    }
                )
                .build()
            return res.status(404).json(response)
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

        const response = new ResponseBuilder()
            .setOk(true)
            .setCode('SUCCESS')
            .setMessage('Se ha enviado un correo electrónico para restablecer la contraseña')
            .setData(
                {
                    detail: 'Se ha enviado un correo electrónico para restablecer la contraseña'
                }
            )
            .build()
        return res.status(200).json(response)
    }
    catch (error) {
        const response = new ResponseBuilder()
            .setOk(false)
            .setStatus(500)
            .setMessage('Ha ocurrido un error excepcional. Por favor intente mas tarde')
            .setData({
                detail: error.message
            })
            .build()
        return res.status(500).json(response)
    }
}

export const recoveryPasswordController = async (req, res) => {
    try {
        const { reset_token } = req.params
        const newPassword = req.body.password
        const { email } = jwt.verify(reset_token, ENVIROMENT.SECRET_KEY)
        const user_to_modify = await User.findOne({ email: email })
        if (!user_to_modify) {
            const response = new ResponseBuilder()
                .setOk(false)
                .setStatus(404)
                .setMessage('El usuario no existe')
                .setData({
                    detail: 'El usuario no existe'
                })
                .build()
            return res.status(404).json(response)
        }
        if (!newPassword) {
            const response = new ResponseBuilder()
                .setOk(false)
                .setStatus(400)
                .setMessage('El campo password es requerido')
                .setData({
                    detail: 'El campo password es requerido'
                })
                .build()
            return res.status(400).json(response)
        }
        const newHashedPassword = await bcrypt.hash(newPassword, 10)
        user_to_modify.password = newHashedPassword
        await user_to_modify.save()
        const response = new ResponseBuilder()
            .setCode('SUCCESS')
            .setOk(true)
            .setStatus(200)
            .setMessage('contraseña modificada')
            .setData({
                detail: 'La contraseña ha sido modificada exitosamente'
            })
            .build()
        return res.status(200).json(response)
    }
    catch (err) {
        const response = new ResponseBuilder()
            .setOk(false)
            .setStatus(500)
            .setMessage('Ha ocurrido un error excepcional. Por favor intente mas tarde')
            .setData({
                detail: err.message
            })
            .build()
        return res.status(500).json(response)
    }
}