import express from 'express';
import { obtenerPacientes,agregarPaciente, obtenerPaciente, actualizarPaciente, eliminarPaciente } from '../controllers/pacienteController.js';
import checkAuth from '../middleware/authMiddleware.js';

const router = express.Router();

//checkout nos permite proteger una ruta, es decir, que haya que estar
//logeado para acceder a ella
router.route('/').post(checkAuth,agregarPaciente).get(checkAuth,obtenerPacientes);

router.route('/:id')
.get(checkAuth, obtenerPaciente)
.put(checkAuth, actualizarPaciente)
.delete(checkAuth,eliminarPaciente);

export default router;