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
    const redirectUrl = `${ENVIROMENT.URL_FRONTEND}/auth/verify-email/${validationToken}` 
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
    const resetUrl = `${ENVIROMENT.URL_FRONTEND}/auth/recovery-password/${reset_token}`
    const result = await transporterEmail.sendMail({
        subject: 'Restablecer contraseña',
        to: email,
        html: `
            <h1>Para poder restablecer tu contraseña haz click <a href='${resetUrl}'> aqui </a></h1>
        `
    })
    return result
}
export const sendContactMail = async (name, email, message) => {
    const result = await transporterEmail.sendMail({
        from: `"Contacto Creamy" <${ENVIROMENT.EMAIL_USER}>`,
        to: ENVIROMENT.EMAIL_USER, // llega a lourdes.tests@gmail.com
        subject: 'Nuevo mensaje de contacto desde Creamy 💌',
        html: `
            <h2>Nuevo mensaje desde Creamy</h2>
            <p><strong>Nombre:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Mensaje:</strong></p>
            <p>${message}</p>
        `
    })
    return result
}