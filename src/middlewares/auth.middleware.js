import jwt from 'jsonwebtoken'
import ENVIROMENT from '../config/enviroment.js'

const authMiddleware = (allowed_roles) => {
    return (req, res, next) => {
        try {
            const auth_header = req.headers['authorization']
            if (!auth_header) {
                return res.status(401).json({ message: 'Falta el token de autorización' })
            }
            const access_token = auth_header.split(' ')[1]
            if (!access_token) {
                return res.status(401).json({ message: 'Token de autorización inválido' })
            }
            const user_session_payload_decoded = jwt.verify(access_token, ENVIROMENT.SECRET_KEY)
            if (!allowed_roles.includes(user_session_payload_decoded.role)) {
                return res.status(403).json({ message: 'No tienes permisos para realizar esta acción' })
            }
            req.user = user_session_payload_decoded
            next()
        } catch (err) {
            return res.status(401).json({ message: 'Token inválido o expirado', error: err.message })
        }
    }
}

export default authMiddleware