class AppError extends Error {
    constructor(message, status_code) {
        super(message)
        this.status_code = status_code
        this.status = String(status_code).startsWith('4') ? 'fail' : 'error' //error (sintaxis, database, etc), fallo (no se encontro el producto)
        this.is_operational = true //si debemos responder con ese error - true porque todos los errores de aplicacion deben tener su respuesta
        Error.captureStackTrace(this, this.constructor) //captura la taza del error
    }
}

export default AppError