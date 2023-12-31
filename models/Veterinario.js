import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import generarId from '../helpers/generarId.js'

const veterinarioSchema = mongoose.Schema({
    //MongoDB autoasigna el ID
    nombre: {
        type: String,
        required: true,
        trim: true //elimina los espacios en blanco tanto al inicio como al final
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    telefono: {
        type: String,
        default: null,
        trim: true
    },
    web: {
        type: String,
        default: null
    },
    token: {
        type: String,
        default: generarId(),
    },
    confirmado: {
        type: Boolean,
        default: false
    }
});

//hashear contraseña
//el metodo pre() de mongoose nos permite hacer algo antes de registrar el modelo
//como vamos a utilizar this, no podemos utilizar arrow function, hay que declarar 
//la funcion callback de la forma function(){}
veterinarioSchema.pre('save', async function (next) {
    if(!this.isModified('password')){ //Si el password ya está hasheado, no se vuelve a hashear
        next();
    }
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
});

//metodo que retorna true si la password que ha introducido el usuario
//coincide con las password hasheada en la BBDD
veterinarioSchema.methods.comprobarPassword = async function (passwordFormulario) {
    return await bcrypt.compare(passwordFormulario,this.password);
}

//registramos Veterinario como modelo en mongoose
const Veterinario = mongoose.model("Veterinario", veterinarioSchema);
//lo exportamos para poder importarlo en otros archivos
export default Veterinario;