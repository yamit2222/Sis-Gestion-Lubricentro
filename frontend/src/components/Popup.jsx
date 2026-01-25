import Form from './Form';
import '@styles/popup.css';
import CloseIcon from '@mui/icons-material/Close';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

export default function Popup({ show, setShow, data, action }) {
    const userData = data && data.length > 0 ? data[0] : {};

    const handleSubmit = (formData) => {
        action(formData);
    };


    return (
        <div>
            { show && (
            <div className="bg">
                <div className="popup">
                    <button className='close' onClick={() => setShow(false)}>
                        <CloseIcon />
                    </button>
                    <Form
                        title="Editar usuario"
                        fields={[
                            {
                                label: "Nombre completo",
                                name: "nombreCompleto",
                                defaultValue: userData.nombreCompleto || "",
                                placeholder: 'Yamit Soto Gallardo',
                                fieldType: 'input',
                                type: "text",
                                required: true,
                                minLength: 15,
                                maxLength: 50,
                                pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
                                patternMessage: "Debe contener solo letras y espacios",
                            },
                            {
                                label: "Correo electrónico",
                                name: "email",
                                defaultValue: userData.email || "",
                                placeholder: 'example@gmail.cl',
                                fieldType: 'input',
                                type: "email",
                                required: true,
                                minLength: 15,
                                maxLength: 30,
                            },
                            {
                                label: "Rol",
                                name: "rol",
                                fieldType: 'select',
                                options: [
                                    { value: 'administrador', label: 'Administrador' },
                                    { value: 'usuario', label: 'Usuario' },
                                ],
                                required: true,
                                defaultValue: userData.rol || "",
                            },
                            {
                                label: (
                                    <span>
                                        Nueva contraseña
                                        <span className='tooltip-icon'>
                                            <HelpOutlineIcon />
                                            <span className='tooltip-text'>Este campo es opcional</span>
                                        </span>
                                    </span>
                                ),
                                name: "newPassword",
                                placeholder: "**********",
                                fieldType: 'input',
                                type: "password",
                                required: false,
                                minLength: 8,
                                maxLength: 26,
                                pattern: /^[a-zA-Z0-9]+$/,
                                patternMessage: "Debe contener solo letras y números",
                            }
                        ]}
                        onSubmit={handleSubmit}
                        buttonText="Editar usuario"
                        backgroundColor={'#fff'}
                    />
                </div>
            </div>
            )}
        </div>
    );
}