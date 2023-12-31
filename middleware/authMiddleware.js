import jwt from "jsonwebtoken";
import Veterinario from "../models/Veterinario.js";

const checkAuth = async (req, res, next) => {
    let token;


    //si se esta enviando el JSON Web Token, y dicho token empieza con "Bearer"
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            //eliminamos el inicio "bearer" del jwt
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            //traemos toda la info menos password, confirmado y token de confirmacion
            req.veterinario = await Veterinario.findById(decoded.id).select("-password -token -confirmado");

            return next();
        } catch (error) {
            const e = new Error('Token no válido');
           return res.status(403).json({ msg: e.message });
        }
    }
    if (!token) {

        const error = new Error('Token no válido o inexistente');
        res.status(403).json({ msg: error.message });
    }
    next();
}

export default checkAuth;