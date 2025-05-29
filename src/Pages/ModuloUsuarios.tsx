import React, { useState, useEffect } from "react";
import {
    Grid,
    Typography,
    Box,
    Snackbar,
    Alert,
    Paper,
    Button,
    useTheme,
    alpha,
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
    const theme = useTheme();
    
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [usuarioToEdit, setUsuarioToEdit] = useState<Usuario | null>(null);
    const [loading, setLoading] = useState(true);
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

    // Función para obtener usuarios
    const fetchUsuarios = async () => {
        setLoading(true);
        try {
            console.log('🔄 Obteniendo usuarios...');
            const response = await fetch("http://localhost:8000/usuario");
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('✅ Respuesta de usuarios:', data);
            
            // Manejar diferentes formatos de respuesta
            let usuariosArray = [];
            
            if (Array.isArray(data)) {
                usuariosArray = data;
            } else if (data && Array.isArray(data.data)) {
                usuariosArray = data.data;
            } else if (data && data.success && Array.isArray(data.data)) {
                usuariosArray = data.data;
            } else {
                console.warn('⚠️ Formato de respuesta no reconocido:', data);
                usuariosArray = [];
            }
            
            console.log('📊 Usuarios procesados:', usuariosArray);
            setUsuarios(usuariosArray);
        } catch (error) {
            console.error('❌ Error obteniendo usuarios:', error);
            setAlert({
                open: true,
                type: 'error',
                message: 'Error al cargar los usuarios. Verifique que el servidor esté ejecutándose.',
            });
            setUsuarios([]);
        } finally {
            setLoading(false);
        }
    };

    // Función para eliminar usuario
    const handleDeleteUsuario = async (id: number) => {
        try {
            console.log('🗑️ Eliminando usuario con ID:', id);
            
            const response = await fetch("http://localhost:8000/usuario", {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ idUsuario: id }),
            });

            if (response.ok) {
                console.log('✅ Usuario eliminado exitosamente');
                setAlert({
                    open: true,
                    type: 'success',
                    message: 'Usuario eliminado exitosamente',
                });
                
                // Actualizar la lista de usuarios
                await fetchUsuarios();
            } else {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || `Error ${response.status}`);
            }
        } catch (error: any) {
            console.error('❌ Error eliminando usuario:', error);
            setAlert({
                open: true,
                type: 'error',
                message: error.message || 'Error al eliminar el usuario',
            });
        }
    };

    // Función para manejar éxito del formulario
    const handleFormSuccess = () => {
        fetchUsuarios();
        setUsuarioToEdit(null);
        setShowForm(false);
    };

    // Función para editar usuario
    const handleEditUsuario = (usuario: Usuario) => {
        setUsuarioToEdit(usuario);
        setShowForm(true);
    };

    // Función para cerrar alerta
    const handleCloseAlert = () => {
        setAlert(prev => ({ ...prev, open: false }));
    };

    // Función para mostrar/ocultar formulario
    const toggleForm = () => {
        if (showForm && usuarioToEdit) {
            setUsuarioToEdit(null);
        }
        setShowForm(!showForm);
    };

    // Función para refrescar datos
    const handleRefresh = () => {
        fetchUsuarios();
        setAlert({
            open: true,
            type: 'info',
            message: 'Lista de usuarios actualizada',
        });
    };

    // Cargar usuarios al montar el componente
    useEffect(() => {
        fetchUsuarios();
    }, []);

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: alpha(theme.palette.grey[50], 0.5), py: 3 }}>
            <Box sx={{ maxWidth: 1200, mx: 'auto', px: 2 }}>
                {/* Header */}
                <Paper
                    elevation={2}
                    sx={{
                        p: 3,
                        mb: 3,
                        borderRadius: 2,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                        color: 'white',
                    }}
                >
                    <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                        <Box>
                            <Typography variant="h4" fontWeight="bold" gutterBottom>
                                Gestión de Usuarios
                            </Typography>
                            <Typography variant="body1" sx={{ opacity: 0.9 }}>
                                Administra los usuarios del sistema
                            </Typography>
                        </Box>
                        
                        <Box display="flex" gap={2}>
                            <Button
                                variant="contained"
                                startIcon={<RefreshIcon />}
                                onClick={handleRefresh}
                                sx={{
                                    bgcolor: 'rgba(255,255,255,0.2)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    '&:hover': {
                                        bgcolor: 'rgba(255,255,255,0.3)',
                                    }
                                }}
                            >
                                Refrescar
                            </Button>
                            
                            <Button
                                variant="contained"
                                startIcon={<PersonAddIcon />}
                                onClick={toggleForm}
                                sx={{
                                    bgcolor: 'rgba(255,255,255,0.9)',
                                    color: theme.palette.primary.main,
                                    '&:hover': {
                                        bgcolor: 'rgba(255,255,255,1)',
                                    }
                                }}
                            >
                                {showForm ? 'Ocultar Formulario' : 'Nuevo Usuario'}
                            </Button>
                        </Box>
                    </Box>
                </Paper>

                <Grid container spacing={3}>
                    {/* Formulario de usuario */}
                    {showForm && (
                        <Grid item xs={12} lg={5}>
                            <AgregarUsuarios
                                userToEdit={usuarioToEdit}
                                onSuccess={handleFormSuccess}
                                usersList={usuarios}
                                setUserToEdit={setUsuarioToEdit}
                            />
                        </Grid>
                    )}

                    {/* Tabla de usuarios */}
                    <Grid item xs={12} lg={showForm ? 7 : 12}>
                        <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                            <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
                                <Typography variant="h6" fontWeight="600" color="primary">
                                    Lista de Usuarios
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {loading ? 'Cargando...' : `${usuarios.length} usuario${usuarios.length !== 1 ? 's' : ''} registrado${usuarios.length !== 1 ? 's' : ''}`}
                                </Typography>
                            </Box>
                            
                            <TablaUsuario
                                usuarios={usuarios}
                                onEdit={handleEditUsuario}
                                onDelete={handleDeleteUsuario}
                                loading={loading}
                            />
                        </Paper>
                    </Grid>
                </Grid>

                {/* Floating Action Button para móviles */}
                <Zoom in={!showForm}>
                    <Fab
                        color="primary"
                        aria-label="add"
                        onClick={toggleForm}
                        sx={{
                            position: 'fixed',
                            bottom: 16,
                            right: 16,
                            display: { xs: 'flex', lg: 'none' },
                            boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                        }}
                    >
                        <PersonAddIcon />
                    </Fab>
                </Zoom>

                {/* Snackbar para alertas */}
                <Snackbar
                    open={alert.open}
                    autoHideDuration={6000}
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
        </Box>
    );
};

export default ModuloUsuarios;