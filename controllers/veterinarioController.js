import Veterinario from "../models/Veterinario.js";
import generarJWT from "../helpers/generarJWT.js";
import generarId from "../helpers/generarId.js";
import emailRegistro from "../helpers/emailRegistro.js";
import emailOlvidePassword from "../helpers/emailOlvidePassword.js";

const registrar = async (req, res) => {
    const { nombre, email, password } = req.body;

    //Prevenir usuarios duplicados
    //Buscamos en nuestra base de datos: en el campo email, si algun registro
    //tiene el mismo email que el que estamos intentando registrar
    const existeUsuario = await Veterinario.findOne({ email: email })

    //si se encontró un email igual en nuestra BBDD
    if (existeUsuario) {
        //Creamos una nueva instancia de un objeto error
        const error = new Error('Usuario ya registrado');
        //return hará que el bloque try-catch no llegue a ejecutarse
        return res.status(400).json({ msg: error.message });
    }

    try {
        // Guardar un nuevo veterinario
        const veterinario = new Veterinario(req.body);
        const veterinarioGuardado = await veterinario.save();
        //Enviar el email
        emailRegistro({
            email,
            nombre,
            token: veterinarioGuardado.token
        });

        res.json(veterinarioGuardado);
    } catch (error) {
        console.log(error);
    }
    console.log(nombre, email, password);
};
const perfil = (req, res) => {
    const { veterinario } = req

    res.json({ veterinario })
}

const confirmar = async (req, res) => {
    //para poder leer parametros dinamicos (en este caso :token)
    //utilizamos req.params.loquesea
    const { token } = req.params;

    const usuarioConfirmar = await Veterinario.findOne({ token: token });

    if (!usuarioConfirmar) {
        const error = new Error('Token no válido');
        return res.status(404).json({ msg: error.message });
    }

    try {
        //Anulamos el token, establecemos al usuario como confirmado, y guardamos en la BBDD
        usuarioConfirmar.token = null;
        usuarioConfirmar.confirmado = true;
        await usuarioConfirmar.save();

        res.json({ msg: 'Usuario Confirmado Correctamente' });
    } catch (error) {
        console.log(error);
    }
};

const autenticar = async (req, res) => {
    const { email, password } = req.body;
    //Comprobar si el usuario existe
    const usuario = await Veterinario.findOne({ email });
    if (!usuario) {
        const error = new Error("El usuario no existe");
        return res.status(403).json({ msg: error.message });
    }

    //comprobar si el usuario está confirmado
    if (!usuario.confirmado) {
        const error = new Error("El usuario no está confirmado");
        return res.status(403).json({ msg: error.message });
    };

    //revisar el password
    if (await usuario.comprobarPassword(password)) {
        //autenticar
        res.json({
            _id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            token: generarJWT(usuario.id),

        });
    } else {
        const error = new Error("El password es incorrecto");
        return res.status(403).json({ msg: error.message });
    }
};

const olvidePassword = async (req, res) => {
    const { email } = req.body;
    const existeVeterinario = await Veterinario.findOne({ email });
    if (!existeVeterinario) {
        const error = new Error('El usuario no existe');
        return res.status(400).json({ msg: error.message });
    }

    try {
        existeVeterinario.token = generarId();
        await existeVeterinario.save();

        //Enviar Email con instrucciones
        emailOlvidePassword({
            email,
            nombre: existeVeterinario.nombre,
            token: existeVeterinario.token
        });

        res.json({ msg: "Hemos enviado un email con las instrucciones" });
    } catch (error) {
        console.log(error);
    }

};

const comprobarToken = async (req, res) => {
    const { token } = req.params;
    const tokenValido = await Veterinario.findOne({ token });

    if (tokenValido) {
        //El token es valido, el usuario existe
        res.json({ msg: "Token válido y el usuario existe" })
    } else {
        const error = new Error('Token no válido')
        return res.status(400).json({ msg: error.message });
    }
};

const nuevoPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    const veterinario = await Veterinario.findOne({ token })
    if (!veterinario) {
        const error = new Error('Hubo un error');
        return res.status(400).json({ msg: error.message });
    }

    try {
        veterinario.token = null
        veterinario.password = password;
        await veterinario.save();
        res.json({ msg: 'Password modificado correctamente' })
    } catch (error) {
        console.log(error);
    }
};

const actualizarPerfil = async (req, res) => {
    const veterinario = await Veterinario.findById(req.params.id);
    if (!veterinario) {
        const error = new Error('Hubo un error')
        return res.status(400).json({ msg: error.message })
    }

    const { email } = req.body
    if (veterinario.email !== req.body.email) {
        const existeEmail = await Veterinario.findOne({ email })
        if (existeEmail) {
            const error = new Error("Ese email ya esta en uso");
            return res.status(400).json({ msg: error.message });
        }
    }

    try {
        veterinario.nombre = req.body.nombre;
        veterinario.email = req.body.email;
        veterinario.web = req.body.web;
        veterinario.telefono = req.body.nombre;
        const veterinarioActualizado = await veterinario.save();
        res.json(veterinarioActualizado);
    } catch (error) {
        console.log(error);
    }

}

const actualizarPassword = async (req, res) => {
    //leer los datos
    const { id } = req.veterinario
    const { pwd_actual, pwd_nuevo } = req.body
    //comprobar que el veterinario existe
    const veterinario = await Veterinario.findById(id);
    if (!veterinario) {
        const error = new Error('Hubo un error');
        return res.status(400).json({ msg: error.message });
    }
    //comprobar su password
    if (await veterinario.comprobarPassword(pwd_actual)) {
        veterinario.password = pwd_nuevo;
        await veterinario.save();
        res.json({msg:'Password Almacenado Correctamente'})
    } else {
        const error = new Error("El Password Actual es Incorrecto");
        return res.status(400).json({ msg: error.message });
    }
    //almacenar el nuevo password
}

export {
    registrar, perfil, confirmar, autenticar, olvidePassword, comprobarToken, nuevoPassword, actualizarPerfil, actualizarPassword
};