import jwt from 'jsonwebtoken'
import ENVIROMENT from '../config/enviroment.js'

const authMiddleware = (allowed_roles) => {
    return (req, res, next) => {
        try {
            // ek header generalmente tiene info de la autorizacion
            const auth_header = req.headers['authorization']// 'Bearer token_value'
            if (!auth_header) {
                return res.json({ message: 'Falta el token de autorizacion' })
            }
            //El split devuelve un array:  'Bearer token_value'.split(' ') => ['Bearer', 'token_value']
            const access_token = auth_header.split(' ')[1] //esto seria igual al valor del token 
            if (!access_token) {
                return res.json({ message: 'El token de autorizacion no es valido' })
            }
            const user_session_payload_decoded = jwt.verify(access_token, ENVIROMENT.SECRET_KEY)//decodifico el token de acceso y lo verifico 
            if (!allowed_roles.includes(user_session_payload_decoded.role)) {
                return res.json({ message: 'El usuario no tiene permiso para realizar esta accion', status: 403})
            }
            req.user = user_session_payload_decoded//guardamos en el objeto req informacion de sesion del usuario (es una forma de guardar una sesion)
            next() // para ir al controlador o middleware siguiente
        }
        catch (err) {
            return res.status(500).json({ message: 'Error al verificar el token de autorizacion', error: err })
        }
    }
}


//ProductRouter.delete('/:product_id', authMiddleware(['admin']), createProductController)

export default authMiddleware 