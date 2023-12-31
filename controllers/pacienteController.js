import Paciente from "../models/Paciente.js";

const agregarPaciente = async (req, res) => {
    //creamos el nuevo paciente con los datos que aportó el usuario
    const paciente = new Paciente(req.body);
    //necesitamos identificar qué veterinario ha registrado al paciente:
    paciente.veterinario = req.veterinario._id;

    try {

        const pacienteGuardado = await paciente.save();
        res.json(pacienteGuardado);
    } catch (error) {
        console.error(error);
    }
}


const obtenerPacientes = async (req, res) => {
    //obtenemos los pacientes cuyo veterinario es el logeado
    const pacientes = await Paciente.find().where('veterinario').equals(req.veterinario);
    res.json(pacientes);
};

const obtenerPaciente = async (req, res) => {
    //req.params representa una variable que se nos para a traves de la url (query string)
    const { id } = req.params;
    const paciente = await Paciente.findById(id);

    //Si no hay paciente
    if (!paciente) {
        return res.status(404).json({ msg: 'No encontrado' });
    }
    //si el veterinario que tiene asignado el paciente es diferente del que está logeado
    if (paciente.veterinario._id.toString() !== req.veterinario._id.toString()) {
        return res.json({ msg: 'Acción no válida' });
    }

    res.json(paciente);

}

const actualizarPaciente = async (req, res) => {

    const { id } = req.params;
    const paciente = await Paciente.findById(id);

    if (!paciente) {
        return res.status(404).json({ msg: 'No encontrado' });
    }

    if (paciente.veterinario._id.toString() !== req.veterinario._id.toString()) {
        return res.json({ msg: 'Acción no válida' });
    }

    //Actualizar paciente
    paciente.nombre = req.body.nombre || paciente.nombre;
    paciente.propietario = req.body.propietario || paciente.propietario;
    paciente.email = req.body.email || paciente.email;
    paciente.fecha = req.body.fecha || paciente.fecha;
    paciente.sintomas = req.body.sintomas || paciente.sintomas;
    try {
        const pacienteActualizado = await paciente.save();
        res.json(pacienteActualizado);
    } catch (error) {
        console.log(error);
    }

}

const eliminarPaciente = async (req, res) => {
    const { id } = req.params;
    const paciente = await Paciente.findById(id);

    if (!paciente) {
        return res.status(404).json({ msg: 'No encontrado' });
    }

    if (paciente.veterinario._id.toString() !== req.veterinario._id.toString()) {
        return res.json({ msg: 'Acción no válida' });
    }

    try {
        await paciente.deleteOne();
        res.json({msg:'Paciente eliminado'})
    } catch (error) {
        console.log(error);
    }
}


export {
    agregarPaciente,
    obtenerPacientes,
    obtenerPaciente,
    actualizarPaciente,
    eliminarPaciente
}