import { NavLink, useNavigate } from "react-router-dom";
import { logout } from '@services/auth.service.js';
import { useAuth } from '@context/AuthContext';
import '@styles/navbar.css';
import { useState } from "react";
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import InventoryRoundedIcon from '@mui/icons-material/InventoryRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded';
import ListAltRoundedIcon from '@mui/icons-material/ListAltRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import ExitToAppRoundedIcon from '@mui/icons-material/ExitToAppRounded';
import BuildRoundedIcon from '@mui/icons-material/BuildRounded';
import MiscellaneousServicesRoundedIcon from '@mui/icons-material/MiscellaneousServicesRounded';
import SellRoundedIcon from '@mui/icons-material/SellRounded';
import WarehouseRoundedIcon from '@mui/icons-material/WarehouseRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';

const Navbar = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);

    const logoutSubmit = () => {
        try {
            logout();
            navigate('/auth'); 
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    return (
        <nav className="navbar">
            <div className={`nav-menu ${menuOpen ? 'activado' : ''}`}>
                <ul>
                    <li>
                        <NavLink 
                            to="/home" 
                            onClick={() => setMenuOpen(false)} 
                            className={({ isActive }) => isActive ? 'active' : ''}
                        >
                            <HomeRoundedIcon style={{marginRight: '1rem'}} />
                            Inicio
                        </NavLink>
                    </li>
                    {user?.rol === 'administrador' && (
                        <>
                            
                            <li>
                                <NavLink 
                                    to="/productos" 
                                    onClick={() => setMenuOpen(false)} 
                                    className={({ isActive }) => isActive ? 'active' : ''}
                                >
                                    <StorageRoundedIcon style={{marginRight: '1rem'}} />
                                    Producto
                                </NavLink>
                            </li>                            <li>    
                                <NavLink 
                                    to="/subproductos" 
                                    onClick={() => setMenuOpen(false)} 
                                    className={({ isActive }) => isActive ? 'active' : ''}
                                >
                                    <StorageRoundedIcon style={{marginRight: '1rem'}} />
                                    ProductoPequeño
                                </NavLink>
                            </li>
                            <li>
                                <NavLink 
                                    to="/inventario" 
                                    onClick={() => setMenuOpen(false)} 
                                    className={({ isActive }) => isActive ? 'active' : ''}
                                >
                                    <WarehouseRoundedIcon style={{marginRight: '1rem'}} />
                                    Inventario
                                </NavLink>
                            </li>
                            <li>
                                <NavLink 
                                    to="/SubInventario" 
                                    onClick={() => setMenuOpen(false)} 
                                    className={({ isActive }) => isActive ? 'active' : ''}
                                >
                                    <WarehouseRoundedIcon style={{marginRight: '1rem'}} />
                                    InventarioPequeño
                                </NavLink>
                            </li> 
                            <li>    
                                <NavLink 
                                    to="/vehiculos" 
                                    onClick={() => setMenuOpen(false)} 
                                    className={({ isActive }) => isActive ? 'active' : ''}
                                >
                                    <DirectionsCarRoundedIcon style={{marginRight: '1rem'}} />
                                    Vehículos
                                </NavLink>
                            </li>
                            <li>
                                <NavLink 
                                    to="/movimientos" 
                                    onClick={() => setMenuOpen(false)} 
                                    className={({ isActive }) => isActive ? 'active' : ''}
                                >
                                    <ListAltRoundedIcon style={{marginRight: '1rem'}} />
                                    Movimientos
                                </NavLink>
                            </li>
                            <li>
                                <NavLink 
                                    to="/pedidos" 
                                    onClick={() => setMenuOpen(false)} 
                                    className={({ isActive }) => isActive ? 'active' : ''}
                                >
                                    <SellRoundedIcon style={{marginRight: '1rem'}} />
                                    Pedidos
                                </NavLink>
                            </li>
                        </>
                    )}
                    <li>
                        <NavLink 
                            to="/auth" 
                            onClick={() => { 
                                logoutSubmit(); 
                                setMenuOpen(false); 
                            }} 
                            className={({ isActive }) => isActive ? 'active' : ''}
                        >
                            <ExitToAppRoundedIcon style={{marginRight: '1rem'}} />
                            Cerrar sesión
                        </NavLink>
                    </li>
                </ul>
            </div>
            <div className="hamburger" onClick={toggleMenu}>
                <span className="bar"></span>
                <span className="bar"></span>
                <span className="bar"></span>
            </div>
        </nav>
    );
};

export default Navbar;