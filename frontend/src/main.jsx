import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from '@pages/Login';
import Home from '@pages/Home';
import Users from '@pages/Users';
import Error404 from '@pages/Error404';
import Root from '@pages/Root';
import Productos from '@pages/Productos';
import SubProducto from '@pages/SubProducto';
import Vehiculos from '@pages/Vehiculos';
import Inventario from '@pages/Inventario';
import SubInventario from '@pages/SubInventario';
import Movimientos from '@pages/Movimientos';
import Pedidos from "./pages/Pedidos.jsx";
import ProtectedRoute from '@components/ProtectedRoute';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './styles/theme';
import '@styles/styles.css';
import './styles/global.css';

const router = createBrowserRouter([
  {    
    path: '/',
    element: <Root/>,
    errorElement: <Error404/>,
    children: [
      {
        path: '/',
        element: <Home/>
      },
      {
        path: '/home',
        element: <Home/>
      },
      {
        path: '/users',
        element: (
          <ProtectedRoute allowedRoles={['administrador']}>
            <Users />
          </ProtectedRoute>
        ),
      },      
      {
        path: '/productos',
        element: (
          <ProtectedRoute allowedRoles={['administrador']}>
            <Productos />
          </ProtectedRoute>
        ),
      },
      {
        path: '/vehiculos',
        element: (
          <ProtectedRoute allowedRoles={['administrador']}>
            <Vehiculos />
          </ProtectedRoute>
        ),
      },
      {
        path: '/subproductos',
        element: (
          <ProtectedRoute allowedRoles={['administrador']}>
            <SubProducto />
          </ProtectedRoute>
        ),
      },
      {
        path: '/inventario',
        element: (
          <ProtectedRoute allowedRoles={['administrador']}>
            <Inventario />
          </ProtectedRoute>
        ),
      },
      {
        path: '/SubInventario',
        element: (
          <ProtectedRoute allowedRoles={['administrador']}>
            <SubInventario />
          </ProtectedRoute>
        ),
      },
      {
        path: '/movimientos',
        element: (
          <ProtectedRoute allowedRoles={['administrador']}>
            <Movimientos />
          </ProtectedRoute>
        ),
      },
      {
        path: '/pedidos',
        element: (
          <ProtectedRoute allowedRoles={['administrador']}>
            <Pedidos />
          </ProtectedRoute>
        ),
      }
    ]
  },
  {
    path: '/auth',
    element: <Login/>
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <RouterProvider router={router}/>
  </ThemeProvider>
)