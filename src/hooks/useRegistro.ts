import { useState } from "react";
import type { Usuario } from "../interfaces";
import { usuarioService } from "../services/usuarioService";

type DatosRegistro = Partial<Usuario> & {contraseña?: string};
/**
 * Hook para registrar a un nuevo usuario.
 * Gestiona el estado de carga y propaga limpiamente los errores para la UI.
 * 
 * @param dataUser Objeto con los datos del usuario incluyendo la contraseña
 */
export const useRegistro = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const register = async (dataUser: DatosRegistro) => {
        setLoading(true);
        setError(null);

        try{
            const result = await usuarioService.registro(dataUser);
            return result;
        } catch (err) {
            if (err instanceof Error){
                setError(err.message);
            } else {
                setError(`Ha ocurrido un error inesperado al registrar al usuario`);
            }
            throw err;
        } finally {
            setLoading(false);
        }
    };
    return { register, loading, error};
};