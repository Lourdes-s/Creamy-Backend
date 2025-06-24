//Los middlewares son funciones que se anteponen entre la consulta y la respuesta del servidor (controlador)
//Recibe req, res y next. Next es una funcion que va a indicar que la consulta puede seguir al siguiente middleware o controlador 

const testMiddleware = (req, res, next) => {
    console.log('middleware ejecutado')
    if (.5 < Math.random()) {
        res.status(400).json({message: 'Error no has tenido suerte'})
    }
    else{
        //cuando active nex voy a pasar al siguiente controlador o middleware
        next()
    }
}

export default testMiddleware 