import nodemailer from 'nodemailer'
import ENVIROMENT from '../config/enviroment.js'

const transporterEmail = nodemailer.createTransport({
    service: 'gmail',
    tls: {
        rejectUnauthorized: false
    },
    auth: {
        user: ENVIROMENT.EMAIL_USER,
        pass: ENVIROMENT.EMAIL_PASSWORD
    }
})

export const sendRegisterMail = async (validationToken, email) => {
    const redirectUrl = `${ENVIROMENT.URL_FRONTEND}/verify-email/` + validationToken
    const result = await transporterEmail.sendMail({
        subject: 'Valida tu email',
        to: email,
        html: `
            <h1>Valida tu mail</h1>
            <p>Para validar tu mail haz click <a href='${redirectUrl}'>aqui</a></p>
        `
    })
    return result
}

export const sendRecoveryMail = async (reset_token, email) => {
    const resetUrl = `${ENVIROMENT.URL_FRONTEND}/recovery-password/${reset_token}`
    const result = await transporterEmail.sendMail({
        subject: 'Restablecer contraseña',
        to: email,
        html: `
            <h1>Para poder restablecer tu contraseña haz click <a href='${resetUrl}'> aqui </a></h1>
        `
    })
    return result
}