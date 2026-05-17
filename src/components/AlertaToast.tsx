import { FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';

// Definimos qué datos (props) necesita recibir este componente para funcionar
interface AlertaToastProps {
  tipo: 'exito' | 'error';
  mensaje: string;
}

const AlertaToast = ({ tipo, mensaje }: AlertaToastProps) => {
  return (
    <div className={`fixed top-6 right-6 z-[100] px-6 py-4 rounded-xl shadow-2xl text-white font-medium flex items-center gap-3 transition-all duration-300 transform translate-y-0 ${
      tipo === 'exito' ? 'bg-green-500' : 'bg-red-500'
    }`}>
      {tipo === 'exito' ? <FiCheckCircle size={24} /> : <FiAlertTriangle size={24} />}
      <span>{mensaje}</span>
    </div>
  );
};

export default AlertaToast;