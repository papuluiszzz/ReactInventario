import React, { useState, useEffect } from "react";
import {
    Grid,
    Typography,
    Box,
    Snackbar,
    Alert,
    Paper,
    Button,
    Fab,
    Zoom,
} from "@mui/material";
import RefreshIcon from '@mui/icons-material/Refresh';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AgregarUsuarios from "../Components/AgregarUsuarios";
import TablaUsuario from "../Components/TablaUsuario";

interface Usuario {
    idUsuario: number | null;
    nombre: string;
    apellido: string;
    foto: string;
}

const ModuloUsuarios: React.FC = () => {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [usuarioToEdit, setUsuarioToEdit] = useState<Usuario | null>(null);
    const [loading, setLoading] = useState(false); // Sin loading inicial
    const [showForm, setShowForm] = useState(false);
    const [alert, setAlert] = useState<{
        open: boolean;
        type: 'success' | 'error' | 'info';
        message: string;
    }>({
        open: false,
        type: 'success',
        message: '',
    });

    const fetchUsuarios = async () => {
        try {
            const response = await fetch("http://localhost:8000/usuario");
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            let usuariosArray = [];
            if (Array.isArray(data)) {
                usuariosArray = data;
            } else if (data && Array.isArray(data.data)) {
                usuariosArray = data.data;
            } else if (data && data.success && Array.isArray(data.data)) {
                usuariosArray = data.data;
            }
            
            setUsuarios(usuariosArray);
        } catch (error) {
            console.error('Error obteniendo usuarios:', error);
            setAlert({
                open: true,
                type: 'error',
                message: 'Error al cargar usuarios',
            });
            setUsuarios([]);
        }
    };

    const handleDeleteUsuario = async (id: number) => {
        try {
            const response = await fetch("http://localhost:8000/usuario", {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ idUsuario: id }),
            });

            if (response.ok) {
                setAlert({
                    open: true,
                    type: 'success',
                    message: 'Usuario eliminado exitosamente',
                });
                await fetchUsuarios();
            } else {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || `Error ${response.status}`);
            }
        } catch (error: any) {
            setAlert({
                open: true,
                type: 'error',
                message: error.message || 'Error al eliminar el usuario',
            });
        }
    };

    const handleFormSuccess = () => {
        fetchUsuarios();
        setUsuarioToEdit(null);
        setShowForm(false);
    };

    const handleEditUsuario = (usuario: Usuario) => {
        setUsuarioToEdit(usuario);
        setShowForm(true);
    };

    const handleCloseAlert = () => {
        setAlert(prev => ({ ...prev, open: false }));
    };

    const toggleForm = () => {
        if (showForm && usuarioToEdit) {
            setUsuarioToEdit(null);
        }
        setShowForm(!showForm);
    };

    const handleRefresh = () => {
        fetchUsuarios();
        setAlert({
            open: true,
            type: 'info',
            message: 'Lista actualizada',
        });
    };

    useEffect(() => {
        fetchUsuarios();
    }, []);

    return (
        <Box sx={{ p: 2, maxWidth: 1200, mx: 'auto' }}>
            {/* Header */}
            <Paper sx={{ p: 2, mb: 3, bgcolor: '#f8f9fa' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                    <Box>
                        <Typography variant="h5" fontWeight="bold">
                            Gestión de Usuarios
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {usuarios.length} usuario{usuarios.length !== 1 ? 's' : ''} registrado{usuarios.length !== 1 ? 's' : ''}
                        </Typography>
                    </Box>
                    
                    <Box display="flex" gap={1}>
                        <Button
                            variant="outlined"
                            startIcon={<RefreshIcon />}
                            onClick={handleRefresh}
                            size="small"
                        >
                            Actualizar
                        </Button>
                        
                        <Button
                            variant="contained"
                            startIcon={<PersonAddIcon />}
                            onClick={toggleForm}
                            size="small"
                            sx={{ display: { xs: 'none', sm: 'flex' } }}
                        >
                            {showForm ? 'Ocultar' : 'Nuevo Usuario'}
                        </Button>
                    </Box>
                </Box>
            </Paper>

            <Grid container spacing={2}>
                {/* Formulario */}
                {showForm && (
                    <Grid item xs={12} lg={4}>
                        <AgregarUsuarios
                            userToEdit={usuarioToEdit}
                            onSuccess={handleFormSuccess}
                            usersList={usuarios}
                            setUserToEdit={setUsuarioToEdit}
                        />
                    </Grid>
                )}

                {/* Tabla */}
                <Grid item xs={12} lg={showForm ? 8 : 12}>
                    <Paper sx={{ overflow: 'hidden' }}>
                        <TablaUsuario
                            usuarios={usuarios}
                            onEdit={handleEditUsuario}
                            onDelete={handleDeleteUsuario}
                        />
                    </Paper>
                </Grid>
            </Grid>

            {/* FAB para móviles */}
            <Zoom in={!showForm}>
                <Fab
                    color="primary"
                    aria-label="add"
                    onClick={toggleForm}
                    sx={{
                        position: 'fixed',
                        bottom: 16,
                        right: 16,
                        display: { xs: 'flex', sm: 'none' },
                    }}
                >
                    <PersonAddIcon />
                </Fab>
            </Zoom>

            {/* Snackbar para alertas */}
            <Snackbar
                open={alert.open}
                autoHideDuration={4000}
                onClose={handleCloseAlert}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleCloseAlert}
                    severity={alert.type}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {alert.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ModuloUsuarios;