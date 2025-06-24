import AppError from "../helpers/errors/app.error.js"

const errorHandlerMiddleware = (err, req, res, next) => {
    //como no todos los errores de la app van a tener el mismo status_code en caso de no haber asumimos que es un error de servidor
    err.status_code = err.status_code || 500
    err.status = err.status || "error"
    if(err.is_operational){
        return res.json({
            status: err.status,
            message: err.message
        })
    }
    console.error('ERROR: ❌👄❌', err)

    return res.status(500).json({
        status: err.status,
        message: "Internal Server Error"
    })
}

export default errorHandlerMiddleware 
