import React, { useEffect, useState, useRef } from "react";
import {
    Button,
    TextField,
    Box,
    Snackbar,
    Alert,
    Typography,
    CircularProgress,
    Divider,
    Grid,
    useTheme,
    useMediaQuery,
    Card,
    CardContent,
    Avatar,
    IconButton,
    Fade,
    Tooltip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import PersonIcon from '@mui/icons-material/Person';
import BadgeIcon from '@mui/icons-material/Badge';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';

interface FormUsuario {
    idUsuario: number | null;
    nombre: string;
    apellido: string;
    foto: string;
}

interface Props {
    userToEdit: FormUsuario | null;
    onSuccess: () => void;
    usersList: FormUsuario[];
    setUserToEdit: (user: FormUsuario | null) => void;
}

const AgregarUsuarios: React.FC<Props> = ({ userToEdit, onSuccess, usersList, setUserToEdit }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        foto: '',
    });

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

    const [alert, setAlert] = useState<{ open: boolean; type: 'success' | 'error' | 'info'; message: string }>({
        open: false,
        type: 'success',
        message: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    useEffect(() => {
        if (userToEdit) {
            setFormData({
                nombre: userToEdit.nombre,
                apellido: userToEdit.apellido,
                foto: userToEdit.foto,
            });
            
            // Si hay una foto existente, mostrarla
            if (userToEdit.foto) {
                setPreviewUrl(`http://localhost:8000${userToEdit.foto}`);
            }
        } else {
            setFormData({ nombre: '', apellido: '', foto: '' });
            setPreviewUrl('');
            setSelectedFile(null);
        }
    }, [userToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFocus = (fieldName: string) => {
        setFocusedField(fieldName);
    };

    const handleBlur = () => {
        setFocusedField(null);
    };

    const handleCloseAlert = () => {
        setAlert(prev => ({ ...prev, open: false }));
    };

    const resetForm = () => {
        setUserToEdit(null);
        setFormData({ nombre: '', apellido: '', foto: '' });
        setSelectedFile(null);
        setPreviewUrl('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validar tipo de archivo
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                setAlert({
                    open: true,
                    type: 'error',
                    message: 'Solo se permiten imágenes (JPG, PNG, GIF, WebP)',
                });
                return;
            }

            // Validar tamaño (3MB máximo)
            const maxSize = 3 * 1024 * 1024; // 3MB
            if (file.size > maxSize) {
                setAlert({
                    open: true,
                    type: 'error',
                    message: 'El archivo es demasiado grande (máximo 3MB)',
                });
                return;
            }

            setSelectedFile(file);
            
            // Crear preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewUrl(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUploadPhoto = async (): Promise<string | null> => {
        if (!selectedFile) return null;

        setIsUploadingPhoto(true);
        
        try {
            const formDataUpload = new FormData();
            formDataUpload.append('file', selectedFile);

            const response = await fetch('http://localhost:8000/upload', {
                method: 'POST',
                body: formDataUpload,
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Foto subida exitosamente:', result);
                return result.data.url; // Devuelve la URL de la foto
            } else {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || 'Error al subir la foto');
            }
        } catch (error: any) {
            console.error('Error al subir foto:', error);
            throw new Error(error.message || 'Error al subir la foto');
        } finally {
            setIsUploadingPhoto(false);
        }
    };

    const handleUpdateUserPhoto = async (userId: number): Promise<string | null> => {
        if (!selectedFile) return null;

        setIsUploadingPhoto(true);
        
        try {
            const formDataUpload = new FormData();
            formDataUpload.append('file', selectedFile);

            const response = await fetch(`http://localhost:8000/usuario/${userId}/foto`, {
                method: 'PUT',
                body: formDataUpload,
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Foto actualizada exitosamente:', result);
                return result.data.fotoNueva; // Devuelve la URL de la nueva foto
            } else {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || 'Error al actualizar la foto');
            }
        } catch (error: any) {
            console.error('Error al actualizar foto:', error);
            throw new Error(error.message || 'Error al actualizar la foto');
        } finally {
            setIsUploadingPhoto(false);
        }
    };

    const handleRemovePhoto = () => {
        setSelectedFile(null);
        setPreviewUrl('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const validateForm = (): boolean => {
        if (!formData.nombre.trim()) {
            setAlert({
                open: true,
                type: 'error',
                message: 'El nombre es obligatorio',
            });
            return false;
        }
        if (!formData.apellido.trim()) {
            setAlert({
                open: true,
                type: 'error',
                message: 'El apellido es obligatorio',
            });
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);
        console.log("Datos que se van a enviar", formData);

        try {
            let fotoUrl = formData.foto; // URL existente por defecto

            // Si hay una nueva foto seleccionada, subirla primero
            if (selectedFile) {
                try {
                    if (userToEdit) {
                        // Actualizar foto de usuario existente
                        fotoUrl = await handleUpdateUserPhoto(userToEdit.idUsuario!);
                    } else {
                        // Subir nueva foto
                        fotoUrl = await handleUploadPhoto();
                    }
                } catch (photoError: any) {
                    setAlert({
                        open: true,
                        type: 'error',
                        message: photoError.message,
                    });
                    return;
                }
            }

            // Solo proceder si tenemos una foto (nueva o existente)
            if (!fotoUrl && !userToEdit) {
                setAlert({
                    open: true,
                    type: 'error',
                    message: 'Debe seleccionar una foto para el usuario',
                });
                return;
            }

            const url = 'http://localhost:8000/usuario';
            const method = userToEdit ? 'PUT' : 'POST';

            const payload = userToEdit ? {
                idUsuario: userToEdit.idUsuario,
                nombre: formData.nombre,
                apellido: formData.apellido,
                foto: fotoUrl || formData.foto,
            } : {
                nombre: formData.nombre,
                apellido: formData.apellido,
                foto: fotoUrl,
            };

            console.log('Payload enviado:', payload);

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            console.log('Response status:', response.status);
            
            if (response.ok) {
                let responseData;
                try {
                    responseData = await response.json();
                } catch {
                    responseData = { success: true };
                }
                console.log('Response data:', responseData);
                
                setAlert({
                    open: true,
                    type: 'success',
                    message: userToEdit
                        ? `¡Usuario ${formData.nombre} actualizado exitosamente!`
                        : `¡Usuario ${formData.nombre} creado exitosamente!`,
                });
                onSuccess();
                resetForm();
            } else {
                const errorData = await response.json().catch(() => null);
                console.error('Error response:', errorData);
                throw new Error(errorData?.message || `Error ${response.status}: ${response.statusText}`);
            }
        } catch (err: any) {
            console.error('Error completo:', err);
            
            let errorMessage = 'Ocurrió un error al guardar el usuario';
            
            if (err.name === 'TypeError' && err.message.includes('fetch')) {
                errorMessage = 'Error de conexión. Verifique que el servidor esté ejecutándose.';
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            setAlert({
                open: true,
                type: 'error',
                message: errorMessage,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Fade in={true} timeout={500}>
            <Card
                elevation={4}
                sx={{
                    borderRadius: 3,
                    overflow: 'visible',
                    backgroundColor: theme.palette.background.paper,
                    boxShadow: `0 10px 40px -10px ${alpha(theme.palette.primary.main, 0.2)}`,
                    position: 'relative',
                }}
            >
                <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
                    <Box component="form" onSubmit={handleSubmit} noValidate>
                        <Box display="flex" alignItems="center" justifyContent="center" mb={3}>
                            <Typography
                                variant="h5"
                                fontWeight="600"
                                color="primary"
                                sx={{ letterSpacing: '0.5px' }}
                            >
                                {userToEdit ? 'Actualizar Usuario' : 'Registro de Usuario'}
                            </Typography>
                        </Box>

                        <Divider sx={{ mb: 4 }} />

                        {/* Sección de foto */}
                        <Box display="flex" justifyContent="center" mb={4}>
                            <Box textAlign="center">
                                <Avatar
                                    src={previewUrl}
                                    sx={{
                                        width: 120,
                                        height: 120,
                                        mx: 'auto',
                                        mb: 2,
                                        border: `3px solid ${theme.palette.primary.main}`,
                                        boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                                    }}
                                >
                                    <PersonIcon sx={{ fontSize: 60 }} />
                                </Avatar>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    style={{ display: 'none' }}
                                />

                                <Box display="flex" gap={1} justifyContent="center">
                                    <Tooltip title="Seleccionar foto">
                                        <IconButton
                                            color="primary"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploadingPhoto}
                                        >
                                            <PhotoCameraIcon />
                                        </IconButton>
                                    </Tooltip>

                                    {(previewUrl || selectedFile) && (
                                        <Tooltip title="Quitar foto">
                                            <IconButton
                                                color="error"
                                                onClick={handleRemovePhoto}
                                                disabled={isUploadingPhoto}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </Box>

                                {selectedFile && (
                                    <Typography variant="caption" color="textSecondary" display="block">
                                        {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                                    </Typography>
                                )}

                                {isUploadingPhoto && (
                                    <Box display="flex" alignItems="center" justifyContent="center" mt={1}>
                                        <CircularProgress size={20} sx={{ mr: 1 }} />
                                        <Typography variant="caption">Subiendo foto...</Typography>
                                    </Box>
                                )}
                            </Box>
                        </Box>

                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    name="nombre"
                                    label="Nombre"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    onFocus={() => handleFocus('nombre')}
                                    onBlur={handleBlur}
                                    variant="outlined"
                                    fullWidth
                                    required
                                    InputProps={{
                                        startAdornment: (
                                            <PersonIcon
                                                color={focusedField === 'nombre' ? 'primary' : 'action'}
                                                sx={{ mr: 1 }}
                                            />
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            transition: theme.transitions.create(['box-shadow']),
                                            ...(focusedField === 'nombre' && {
                                                boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.2)}`
                                            })
                                        }
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    name="apellido"
                                    label="Apellido"
                                    value={formData.apellido}
                                    onChange={handleChange}
                                    onFocus={() => handleFocus('apellido')}
                                    onBlur={handleBlur}
                                    variant="outlined"
                                    fullWidth
                                    required
                                    InputProps={{
                                        startAdornment: (
                                            <BadgeIcon
                                                color={focusedField === 'apellido' ? 'primary' : 'action'}
                                                sx={{ mr: 1 }}
                                            />
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            transition: theme.transitions.create(['box-shadow']),
                                            ...(focusedField === 'apellido' && {
                                                boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.2)}`
                                            })
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>

                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                mt: 4,
                                '& .MuiButton-root': {
                                    borderRadius: 2,
                                    py: 1.5,
                                    px: 4,
                                    fontWeight: 500,
                                    letterSpacing: '0.5px',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    '&:hover:not(:disabled)': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: `0 6px 20px -5px ${alpha(theme.palette.primary.main, 0.4)}`
                                    }
                                }
                            }}
                        >
                            <Tooltip title={userToEdit ? "Guardar cambios del usuario" : "Registrar nuevo usuario"}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    disabled={isSubmitting || isUploadingPhoto}
                                    startIcon={userToEdit ? <SystemUpdateAltIcon /> : <PersonAddAltIcon />}
                                    sx={{
                                        backgroundColor: theme.palette.primary.main,
                                        boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
                                        '&:hover': {
                                            backgroundColor: theme.palette.primary.dark,
                                        }
                                    }}
                                >
                                    {isSubmitting || isUploadingPhoto ? (
                                        <>
                                            <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                                            {isUploadingPhoto ? 'Subiendo foto...' : (userToEdit ? 'Actualizando...' : 'Registrando...')}
                                        </>
                                    ) : (
                                        userToEdit ? 'Actualizar Usuario' : 'Registrar Usuario'
                                    )}
                                </Button>
                            </Tooltip>
                        </Box>
                    </Box>
                </CardContent>

                <Snackbar
                    open={alert.open}
                    autoHideDuration={6000}
                    onClose={handleCloseAlert}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                >
                    <Alert onClose={handleCloseAlert} severity={alert.type} sx={{ width: '100%' }}>
                        {alert.message}
                    </Alert>
                </Snackbar>
            </Card>
        </Fade>
    );
};

export default AgregarUsuarios;