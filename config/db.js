import mongoose from 'mongoose'

//para poder utilizar las variables de entorno para dar seguridad a nuestra BBDD,
//necesitamos escribir en consola npm i dotenv

const conectarDB = async () => {
    try {

        const db = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        const url = `${db.connection.host}:${db.connection.port}`;
        console.log(`MongoDB conectado en: ${url}`);
    } catch (error) {
        console.log(`error: ${error.message}`);
        process.exit(1)
    }
};

export default conectarDB
