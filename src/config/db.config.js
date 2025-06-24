//logica de conexion con la DB

import mongoDB from "mongoose"
import User from "../models/user.model.js"
import ENVIROMENT from "./enviroment.js"

const MONGO_URL = ENVIROMENT.MONGO_DB_CONNECTION_STR + '/' + ENVIROMENT.MONGO_DB_DATABASE

//.mongoose se utiliza para restablecer una conexcion con la DB
// Recibe un connection.string (url de la DB) y un objeto de configuracion 
mongoDB.connect(MONGO_URL, {})
.then(
    () => {
        console.log('Se establecio la conexion con mongoDB')
    }
)    
.catch(
    (err) => {
        console.error('La conexion con mongoDB ha fallado', err)
    }
)
.finally(
    () => {
        console.log('El server is Serving 💻👄💻💅')
    }
)

export default mongoDB