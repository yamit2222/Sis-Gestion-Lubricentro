import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '@components/Navbar';
import { AuthProvider } from '@context/AuthContext';

function Root()  {
    return (
        <AuthProvider>
            <PageRoot/>
        </AuthProvider>
    );
}

function PageRoot() {
    const location = useLocation();
    const hideNavbar = location.pathname === '/auth';
    return (
        <>
            {!hideNavbar && <Navbar />}
            <div style={hideNavbar ? {paddingLeft: 0, width: '100vw', minHeight: '100vh'} : {}}>
                <Outlet />
            </div>
        </>
    );
}

export default Root;