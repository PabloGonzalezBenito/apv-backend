import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import conectarDB from './config/db.js';
import veterinarioRoutes from './routes/veterinarioRoutes.js';
import pacienteRoutes from './routes/pacienteRoutes.js';

//En esta variable de app vamos a tener la funcionalidad requerida para
//crear el servidor
const app = express();

//de esta forma le decimos a express que vamos a enviar datos de tipo JSON
app.use(express.json());

//Para buscar el archivo .env que contiene nuestras variables de entorno
dotenv.config();

//llamo a la funcion conectarDB importada desde el archivo db.js
conectarDB();


const dominiosPermitidos = [process.env.FRONTEND_URL]

const corsOptions = {
    origin: function (origin, callback) {
        if (dominiosPermitidos.indexOf(origin) !== -1) {
            //El origen del Request esta permitido
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
    }
}
app.use(cors(corsOptions));
//app.use(cors({origin: '*'}));

//use es una manera en la que express maneja el routing
app.use('/api/veterinarios', veterinarioRoutes);
app.use('/api/pacientes', pacienteRoutes);

const PORT = process.env.PORT || 4000;

//Establecemos el puerto
app.listen(PORT, () => {
    console.log(`Servidor funcionando en el puerto ${PORT}`);
});