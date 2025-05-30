import React, { useEffect, useState, useRef } from "react";
import {
    Button,
    TextField,
    Box,
    Snackbar,
    Alert,
    Typography,
    CircularProgress,
    Grid,
    Card,
    CardContent,
    Avatar,
    IconButton,
} from '@mui/material';
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
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        foto: '',
    });

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');

    const [alert, setAlert] = useState<{ open: boolean; type: 'success' | 'error' | 'info'; message: string }>({
        open: false,
        type: 'success',
        message: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (userToEdit) {
            setFormData({
                nombre: userToEdit.nombre,
                apellido: userToEdit.apellido,
                foto: userToEdit.foto,
            });
            
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
        if (!file) return;

        // Validaciones básicas
        if (!file.type.startsWith('image/')) {
            setAlert({
                open: true,
                type: 'error',
                message: 'Solo se permiten imágenes',
            });
            return;
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB
            setAlert({
                open: true,
                type: 'error',
                message: 'Imagen demasiado grande (máx 10MB)',
            });
            return;
        }

        setSelectedFile(file);
        
        // Preview inmediato
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreviewUrl(e.target?.result as string);
        };
        reader.readAsDataURL(file);
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

    // Función específica para subir imagen nueva
    const uploadNewImage = async (file: File): Promise<string> => {
        console.log('🔄 Subiendo imagen nueva...');
        
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);

        const response = await fetch('http://localhost:8000/upload', {
            method: 'POST',
            body: formDataUpload,
        });

        console.log('📤 Respuesta upload status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Error response:', errorText);
            throw new Error(`Error ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        console.log('✅ Upload result:', result);

        // Manejar diferentes estructuras de respuesta del backend
        if (result.success && result.data && result.data.url) {
            return result.data.url;
        } else if (result.url) {
            return result.url;
        } else if (result.data && result.data.filePath) {
            return result.data.filePath.replace('./uploads', '/uploads');
        } else {
            console.error('⚠️ Estructura de respuesta inesperada:', result);
            throw new Error('Respuesta del servidor inválida');
        }
    };

    // Función específica para actualizar imagen de usuario existente
    const updateUserImage = async (userId: number, file: File): Promise<string> => {
        console.log('🔄 Actualizando imagen de usuario:', userId);
        
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);

        const response = await fetch(`http://localhost:8000/usuario/${userId}/foto`, {
            method: 'PUT',
            body: formDataUpload,
        });

        console.log('📤 Respuesta update status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Error response:', errorText);
            throw new Error(`Error ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        console.log('✅ Update result:', result);

        // Manejar diferentes estructuras de respuesta
        if (result.success && result.data && result.data.fotoNueva) {
            return result.data.fotoNueva;
        } else if (result.fotoNueva) {
            return result.fotoNueva;
        } else if (result.data && result.data.url) {
            return result.data.url;
        } else {
            console.error('⚠️ Estructura de respuesta inesperada:', result);
            throw new Error('Respuesta del servidor inválida');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);
        console.log('🚀 Iniciando envío del formulario...');

        try {
            let fotoUrl = formData.foto; // URL existente por defecto

            // Solo subir imagen si hay una nueva seleccionada
            if (selectedFile) {
                console.log('📷 Procesando imagen seleccionada...');
                
                try {
                    if (userToEdit && userToEdit.idUsuario) {
                        // Actualizar imagen de usuario existente
                        fotoUrl = await updateUserImage(userToEdit.idUsuario, selectedFile);
                        console.log('✅ Imagen actualizada:', fotoUrl);
                    } else {
                        // Subir nueva imagen
                        fotoUrl = await uploadNewImage(selectedFile);
                        console.log('✅ Imagen subida:', fotoUrl);
                    }
                } catch (imageError: any) {
                    console.error('❌ Error procesando imagen:', imageError);
                    setAlert({
                        open: true,
                        type: 'error',
                        message: `Error al procesar imagen: ${imageError.message}`,
                    });
                    return;
                }
            }

            // Validar que tenemos foto para nuevos usuarios
            if (!fotoUrl && !userToEdit) {
                setAlert({
                    open: true,
                    type: 'error',
                    message: 'Debe seleccionar una foto para el usuario',
                });
                return;
            }

            console.log('💾 Guardando usuario con foto:', fotoUrl);

            // Guardar/actualizar usuario
            const url = 'http://localhost:8000/usuario';
            const method = userToEdit ? 'PUT' : 'POST';

            const payload = userToEdit ? {
                idUsuario: userToEdit.idUsuario,
                nombre: formData.nombre.trim(),
                apellido: formData.apellido.trim(),
                foto: fotoUrl,
            } : {
                nombre: formData.nombre.trim(),
                apellido: formData.apellido.trim(),
                foto: fotoUrl,
            };

            console.log('📤 Enviando payload:', payload);

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            console.log('📥 Usuario response status:', response.status);

            if (response.ok) {
                const result = await response.json();
                console.log('✅ Usuario guardado:', result);
                
                setAlert({
                    open: true,
                    type: 'success',
                    message: `Usuario ${formData.nombre} ${userToEdit ? 'actualizado' : 'creado'} exitosamente`,
                });
                onSuccess();
                resetForm();
            } else {
                const errorText = await response.text();
                console.error('❌ Error guardando usuario:', errorText);
                throw new Error(`Error ${response.status}: Usuario no pudo ser guardado`);
            }
        } catch (err: any) {
            console.error('❌ Error completo:', err);
            setAlert({
                open: true,
                type: 'error',
                message: err.message || 'Error al guardar usuario',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom textAlign="center" color="primary">
                    {userToEdit ? 'Actualizar Usuario' : 'Nuevo Usuario'}
                </Typography>

                <Box component="form" onSubmit={handleSubmit} noValidate>
                    {/* Sección de foto */}
                    <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
                        <Avatar
                            src={previewUrl}
                            sx={{ width: 80, height: 80, mb: 1 }}
                        >
                            <PersonIcon sx={{ fontSize: 40 }} />
                        </Avatar>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                        />

                        <Box display="flex" gap={1}>
                            <IconButton
                                color="primary"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isSubmitting}
                                size="small"
                            >
                                <PhotoCameraIcon />
                            </IconButton>

                            {previewUrl && (
                                <IconButton
                                    color="error"
                                    onClick={handleRemovePhoto}
                                    disabled={isSubmitting}
                                    size="small"
                                >
                                    <DeleteIcon />
                                </IconButton>
                            )}
                        </Box>

                        {selectedFile && (
                            <Typography variant="caption" color="textSecondary" textAlign="center">
                                {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
                            </Typography>
                        )}
                    </Box>

                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="nombre"
                                label="Nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                variant="outlined"
                                fullWidth
                                required
                                size="small"
                                InputProps={{
                                    startAdornment: <PersonIcon sx={{ mr: 1, color: 'action.active' }} />,
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="apellido"
                                label="Apellido"
                                value={formData.apellido}
                                onChange={handleChange}
                                variant="outlined"
                                fullWidth
                                required
                                size="small"
                                InputProps={{
                                    startAdornment: <BadgeIcon sx={{ mr: 1, color: 'action.active' }} />,
                                }}
                            />
                        </Grid>
                    </Grid>

                    <Box display="flex" justifyContent="center" mt={3}>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={isSubmitting}
                            startIcon={userToEdit ? <SystemUpdateAltIcon /> : <PersonAddAltIcon />}
                            sx={{ minWidth: 160 }}
                        >
                            {isSubmitting ? (
                                <>
                                    <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                                    Guardando...
                                </>
                            ) : (
                                userToEdit ? 'Actualizar' : 'Guardar'
                            )}
                        </Button>
                    </Box>
                </Box>

                <Snackbar
                    open={alert.open}
                    autoHideDuration={3000}
                    onClose={handleCloseAlert}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                >
                    <Alert onClose={handleCloseAlert} severity={alert.type} sx={{ width: '100%' }}>
                        {alert.message}
                    </Alert>
                </Snackbar>
            </CardContent>
        </Card>
    );
};

export default AgregarUsuarios;