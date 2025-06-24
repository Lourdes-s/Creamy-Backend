import nodemailer from 'nodemailer'
import ENVIROMENT from '../config/enviroment.js'

const transporterEmail = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: ENVIROMENT.EMAIL_USER,
        pass: ENVIROMENT.EMAIL_PASSWORD
    }
})

export default transporterEmail 