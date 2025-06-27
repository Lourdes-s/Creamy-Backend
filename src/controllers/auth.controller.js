import ENVIROMENT from "../config/enviroment.js"
import ResponseBuilder from "../helpers/builders/response.builder.js"
import transporterEmail from "../helpers/emailTransporter.helpers.js"
import { verifyEmail, verifyMinLength, verifyString } from "../helpers/validations.helpers.js"
import User from "../models/user.model.js"
import bcrypt from "bcrypt"
import nodemailer from "nodemailer"
import jwt from "jsonwebtoken"

export const registerController = async (req, res) => {
    try{
        const { name, password, email } = req.body
        const registerConfig = {
            name: {
                value: name,
                errors: [],
                validation: [
                    verifyString,
                    (field_name, field_value) => verifyMinLength(field_name, field_value, 5)
                ]
            },
            password: {
                value: password,
                errors: [],
                validation: [
                    verifyString,
                    (field_name, field_value) => verifyMinLength(field_name, field_value, 10)
                ]
            },
            email: {
                value: email,
                errors: [],
                validation: [
                    verifyEmail,
                    (field_name, field_value) => verifyMinLength(field_name, field_value, 10)
                ]
            }
        }
        let hayErrores = false
        for (let field_name in registerConfig) {
            for (let validation of registerConfig[field_name].validation) {
                let result = validation(field_name, registerConfig[field_name].value)
                if (result) {
                    hayErrores = true
                    registerConfig[field_name].errors.push(result)
                }
            }
        }

        if (hayErrores) {
            const response = new ResponseBuilder()
                .setOk(false)
                .setStatus(400)
                .setCode('VALIDATION_ERROR')
                .setData({
                        registerState: registerConfig
                })
                .build()
                return res.status(400).json(response)
        } 

        const hashedPassword = await bcrypt.hash(registerConfig.password.value, 10)

        const validationToken = jwt.sign(
            {
                email: registerConfig.email.value
            },
            ENVIROMENT.SECRET_KEY,
            {
                expiresIn: '1d',
            }
        )

        const redirectUrl = `${ENVIROMENT.URL_FRONTEND}/api/auth/verify-email/` + validationToken

        await transporterEmail.sendMail({
            subject: 'Validacion de email',
            to: registerConfig.email.value,
            html: `
                <h1>Para validar tu email haz click <a href='${redirectUrl}'>aqui</a></h1>
            `
        })

        const userCreated = new User({
            name: registerConfig.name.value, 
            email: registerConfig.email.value,
            password: hashedPassword,
            verificationToken: ''
        })
        await userCreated.save() //esto lo guarda en mongoDB
    
        const response = new ResponseBuilder()
        .setCode('SUCCESS')
        .setOk(true)
        .setStatus(200)
        .setData(
            { registerResult: registerConfig }
        )
        .build()
        return res.status(200).json(response)
    }
    catch(error){
        if(error.code === 11000){
            const response = new ResponseBuilder()
            .setOk(false)
            .setStatus(400)
            .setMessage('Email already registered')
            .setData({
                detail: 'El email ya esta en uso'
            })
            .build()
            return res.status(400).json(response)
        }
        console.error(error)
    }
}

export const verifyEmailController = async (req, res ) => {
    try{
        const {validation_token} = req.params
        const payload = jwt.verify(validation_token, ENVIROMENT.SECRET_KEY)
        const email_to_verify = payload.email
        const user_to_verify = await User.findOne({ email: email_to_verify})
        user_to_verify.emailVerified = true
        await user_to_verify.save()
        const response = new ResponseBuilder()
        .setCode('SUCCESS')
        .setOk(true)
        .setStatus(200)
        .setMessage('Usuario verificado')
        .setData({
            detail: 'El usuario ha sido verificado exitosamente'
        })
        .build()
        return res.redirect('http://localhost:5173/login')
    }
    catch(error){
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

export const loginController = async (req, res) => {
    try{
        const { email, password } = req.body
        //TODO: Validar que el email y password no esten vacios
        
        const user = await User.findOne({email: email})
        if(!user){
            const response = new ResponseBuilder()
            .setOk(false)
            .setCode(404)
            .setMessage('Usuario no encontrado')
            .setData({
                detail: 'El usuario no existe'
            })
            .build()
            return res.status(404).json(response)
        }

        const isCorrectPassword = await bcrypt.compare(password, user.password)
        if(!isCorrectPassword){
            const response = new ResponseBuilder()
            .setOk(false)
            .setCode(401)
            .setMessage('Credenciales invalidas')
            .setData({
                detail: 'La contraseña es incorrecta'
            })
            .build()
            return res.status(401).json(response)
        }
        if(!user.emailVerified){
            const response = new ResponseBuilder()
            .setOk(false)
            .setCode(403)
            .setMessage('Cuenta no verificada')
            .setData({
                detail: 'La cuenta no ha sido verificada'
            })
            .build()
            return res.status(403).json(response)
        }

        const access_token = jwt.sign(
            {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }, 
            ENVIROMENT.SECRET_KEY, 
            {
                expiresIn: '1d' // esto determina cuanto dura la session
            }
        )

        const response = new ResponseBuilder()
        .setCode('LOGGED_SUCCESS')
        .setOk(true)
        .setCode(200)
        .setMessage('Inicio de sesión exitoso')
        .setData({
            access_token: access_token,
            user_info: {
                user_id: user._id,
                name: user.name,
                email: user.email
            }
        })
        .build()
        return res.status(200).json(response)
    }
    catch(error){
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

export const forgotPasswordController = async (req, res) => {
    try {
        const { email } = req.body  
        console.log(req.body)
        const user = await User.findOne({email: email})
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

        const resetUrl = `${ENVIROMENT.URL_FRONTEND}/auth/recovery-password/${reset_token}`

        await transporterEmail.sendMail({
            subject: 'Restablecer contraseña',
            to: email,
            html: `
                <h1>Para poder restablecer tu contraseña ha click <a href='${resetUrl}'> aqui </a></h1>
            `
        })

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
    catch (error){
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
        const {reset_token} = req.params
        const newPassword = req.body.password
        const {email} = jwt.verify(reset_token, ENVIROMENT.SECRET_KEY)
        const user_to_modify = await User.findOne({ email: email})
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
        if (!newPassword){
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
    catch(err){
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