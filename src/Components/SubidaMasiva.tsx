import React, { useState, useRef } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Grid,
    Alert,
    Snackbar,
    LinearProgress,
    Chip,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Collapse,
    IconButton,
    Paper,
} from '@mui/material';
import {
    CloudUpload as UploadIcon,
    Download as DownloadIcon,
    CheckCircle as SuccessIcon,
    Error as ErrorIcon,
    Warning as WarningIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    Category as CategoryIcon,
    Inventory as ProductIcon,
} from '@mui/icons-material';

interface UploadResult {
    total: number;
    success: number;
    errors: number;
    details: Array<{
        line: number;
        status: 'success' | 'error' | 'skipped';
        producto?: string;
        categoria?: string;
        error?: string;
        message?: string;
    }>;
}

const SubidaMasiva: React.FC = () => {
    const [uploading, setUploading] = useState(false);
    const [results, setResults] = useState<UploadResult | null>(null);
    const [showDetails, setShowDetails] = useState(false);
    const [alert, setAlert] = useState<{
        open: boolean;
        type: 'success' | 'error' | 'info';
        message: string;
    }>({
        open: false,
        type: 'success',
        message: '',
    });

    const productFileRef = useRef<HTMLInputElement>(null);
    const categoryFileRef = useRef<HTMLInputElement>(null);

    const handleCloseAlert = () => {
        setAlert(prev => ({ ...prev, open: false }));
    };

    const downloadTemplate = async (type: 'productos' | 'categorias') => {
        try {
            const url = `http://localhost:8000/descargar/plantilla/${type}`;
            const response = await fetch(url);
            
            if (response.ok) {
                const blob = await response.blob();
                const downloadUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = type === 'products' ? 'plantilla_productos.txt' : 'plantilla_categorias.txt';
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(downloadUrl);
                
                setAlert({
                    open: true,
                    type: 'success',
                    message: 'Plantilla descargada exitosamente',
                });
            } else {
                throw new Error('Error al descargar plantilla');
            }
        } catch (error) {
            setAlert({
                open: true,
                type: 'error',
                message: 'Error al descargar la plantilla',
            });
        }
    };

    const uploadFile = async (file: File, endpoint: string) => {
        setUploading(true);
        setResults(null);

        try {
            console.log('📤 Subiendo archivo:', file.name, file.size, 'bytes');
            
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`http://localhost:8000/subidamasiva/${endpoint}`, {
                method: 'POST',
                body: formData,
            });

            console.log('📥 Response status:', response.status);
            console.log('📥 Response headers:', response.headers.get('content-type'));

            if (!response.ok) {
                // Intentar leer como JSON primero, luego como texto
                let errorMessage;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || `Error ${response.status}`;
                } catch {
                    const errorText = await response.text();
                    errorMessage = errorText || `Error ${response.status}: ${response.statusText}`;
                }
                throw new Error(errorMessage);
            }

            // Leer respuesta como JSON
            const result = await response.json();
            console.log('✅ Upload result:', result);

            if (result.success) {
                setResults(result.data);
                setAlert({
                    open: true,
                    type: 'success',
                    message: result.message,
                });
            } else {
                throw new Error(result.message || 'Error en la subida');
            }
        } catch (error: any) {
            console.error('❌ Upload error:', error);
            setAlert({
                open: true,
                type: 'error',
                message: error.message || 'Error al procesar el archivo',
            });
        } finally {
            setUploading(false);
        }
    };

    const handleProductUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            uploadFile(file, 'productos');
        }
    };

    const handleCategoryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            uploadFile(file, 'categorias');
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'success':
                return <SuccessIcon color="success" />;
            case 'error':
                return <ErrorIcon color="error" />;
            case 'skipped':
                return <WarningIcon color="warning" />;
            default:
                return null;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'success':
                return 'success';
            case 'error':
                return 'error';
            case 'skipped':
                return 'warning';
            default:
                return 'default';
        }
    };

    return (
        <Box sx={{ maxWidth: 1000, mx: 'auto', p: 3 }}>
            <Typography variant="h4" gutterBottom textAlign="center" color="primary">
                Subida Masiva de Datos
            </Typography>
            
            <Typography variant="body1" textAlign="center" color="text.secondary" sx={{ mb: 4 }}>
                Sube múltiples productos y categorías desde archivos de texto
            </Typography>

            <Grid container spacing={3}>
                {/* Subida de Productos */}
                <Grid item xs={12} md={6}>
                    <Card elevation={3}>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <ProductIcon color="primary" sx={{ mr: 1 }} />
                                <Typography variant="h6" color="primary">
                                    Productos
                                </Typography>
                            </Box>
                            
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                Formato: descripcion|cantidad|precio|unidadMedida|nombreCategoria
                            </Typography>

                            <Box display="flex" flexDirection="column" gap={2}>
                                <Button
                                    variant="outlined"
                                    startIcon={<DownloadIcon />}
                                    onClick={() => downloadTemplate('products')}
                                    fullWidth
                                >
                                    Descargar Plantilla
                                </Button>

                                <input
                                    ref={productFileRef}
                                    type="file"
                                    accept=".txt,.csv"
                                    onChange={handleProductUpload}
                                    style={{ display: 'none' }}
                                />

                                <Button
                                    variant="contained"
                                    startIcon={<UploadIcon />}
                                    onClick={() => productFileRef.current?.click()}
                                    disabled={uploading}
                                    fullWidth
                                >
                                    Subir Productos
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Subida de Categorías */}
                <Grid item xs={12} md={6}>
                    <Card elevation={3}>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <CategoryIcon color="secondary" sx={{ mr: 1 }} />
                                <Typography variant="h6" color="secondary">
                                    Categorías
                                </Typography>
                            </Box>
                            
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                Formato: Una categoría por línea
                            </Typography>

                            <Box display="flex" flexDirection="column" gap={2}>
                                <Button
                                    variant="outlined"
                                    startIcon={<DownloadIcon />}
                                    onClick={() => downloadTemplate('categories')}
                                    fullWidth
                                >
                                    Descargar Plantilla
                                </Button>

                                <input
                                    ref={categoryFileRef}
                                    type="file"
                                    accept=".txt,.csv"
                                    onChange={handleCategoryUpload}
                                    style={{ display: 'none' }}
                                />

                                <Button
                                    variant="contained"
                                    startIcon={<UploadIcon />}
                                    onClick={() => categoryFileRef.current?.click()}
                                    disabled={uploading}
                                    fullWidth
                                    color="secondary"
                                >
                                    Subir Categorías
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Barra de progreso */}
            {uploading && (
                <Box sx={{ mt: 3 }}>
                    <LinearProgress />
                    <Typography textAlign="center" sx={{ mt: 1 }}>
                        Procesando archivo...
                    </Typography>
                </Box>
            )}

            {/* Resultados */}
            {results && (
                <Paper elevation={2} sx={{ mt: 3, p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Resultados del Procesamiento
                    </Typography>
                    
                    <Box display="flex" gap={2} mb={2}>
                        <Chip 
                            label={`Total: ${results.total}`} 
                            color="info" 
                        />
                        <Chip 
                            label={`Éxitos: ${results.success}`} 
                            color="success" 
                        />
                        <Chip 
                            label={`Errores: ${results.errors}`} 
                            color="error" 
                        />
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Button
                        onClick={() => setShowDetails(!showDetails)}
                        startIcon={showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        variant="outlined"
                        size="small"
                    >
                        {showDetails ? 'Ocultar' : 'Ver'} Detalles
                    </Button>

                    <Collapse in={showDetails}>
                        <List sx={{ mt: 2, maxHeight: 400, overflow: 'auto' }}>
                            {results.details.map((detail, index) => (
                                <ListItem key={index} divider>
                                    <ListItemIcon>
                                        {getStatusIcon(detail.status)}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Typography variant="body2">
                                                    Línea {detail.line}
                                                </Typography>
                                                <Chip 
                                                    label={detail.status} 
                                                    size="small" 
                                                    color={getStatusColor(detail.status) as any}
                                                />
                                            </Box>
                                        }
                                        secondary={
                                            detail.error || 
                                            detail.message || 
                                            (detail.producto ? `Producto: ${detail.producto}` : '') +
                                            (detail.categoria ? ` - Categoría: ${detail.categoria}` : '')
                                        }
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Collapse>
                </Paper>
            )}

            <Snackbar
                open={alert.open}
                autoHideDuration={4000}
                onClose={handleCloseAlert}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseAlert}
                    severity={alert.type}
                    sx={{ width: '100%' }}
                >
                    {alert.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default SubidaMasiva;