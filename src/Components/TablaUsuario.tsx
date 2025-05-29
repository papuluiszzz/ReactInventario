import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Avatar,
    IconButton,
    Typography,
    Box,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    DialogContentText,
    Tooltip,
    useTheme,
    useMediaQuery,
    Card,
    CardContent,
    Fade,
    Skeleton,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import VisibilityIcon from '@mui/icons-material/Visibility';

interface Usuario {
    idUsuario: number | null;
    nombre: string;
    apellido: string;
    foto: string;
}

interface Props {
    usuarios: Usuario[];
    onEdit: (usuario: Usuario) => void;
    onDelete: (id: number) => void;
    loading?: boolean;
}

const TablaUsuario: React.FC<Props> = ({ usuarios, onEdit, onDelete, loading = false }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        usuario: Usuario | null;
    }>({
        open: false,
        usuario: null,
    });

    const [imageDialog, setImageDialog] = useState<{
        open: boolean;
        imageUrl: string;
        userName: string;
    }>({
        open: false,
        imageUrl: '',
        userName: '',
    });

    const handleDeleteClick = (usuario: Usuario) => {
        setDeleteDialog({
            open: true,
            usuario,
        });
    };

    const handleDeleteConfirm = () => {
        if (deleteDialog.usuario?.idUsuario) {
            onDelete(deleteDialog.usuario.idUsuario);
        }
        setDeleteDialog({ open: false, usuario: null });
    };

    const handleDeleteCancel = () => {
        setDeleteDialog({ open: false, usuario: null });
    };

    const handleImageClick = (foto: string, nombre: string, apellido: string) => {
        setImageDialog({
            open: true,
            imageUrl: `http://localhost:8000${foto}`,
            userName: `${nombre} ${apellido}`,
        });
    };

    const handleImageDialogClose = () => {
        setImageDialog({
            open: false,
            imageUrl: '',
            userName: '',
        });
    };

    const renderLoadingSkeleton = () => (
        <>
            {[...Array(3)].map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                    <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                            <Skeleton variant="circular" width={50} height={50} />
                            <Box>
                                <Skeleton variant="text" width={120} height={20} />
                                <Skeleton variant="text" width={100} height={16} />
                            </Box>
                        </Box>
                    </TableCell>
                    <TableCell>
                        <Skeleton variant="text" width={80} height={20} />
                    </TableCell>
                    <TableCell>
                        <Skeleton variant="text" width={100} height={20} />
                    </TableCell>
                    <TableCell>
                        <Box display="flex" gap={1}>
                            <Skeleton variant="circular" width={40} height={40} />
                            <Skeleton variant="circular" width={40} height={40} />
                            <Skeleton variant="circular" width={40} height={40} />
                        </Box>
                    </TableCell>
                </TableRow>
            ))}
        </>
    );

    if (loading) {
        return (
            <Fade in={true} timeout={500}>
                <Card elevation={2} sx={{ borderRadius: 2 }}>
                    <CardContent sx={{ p: 0 }}>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
                                        <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                                            Usuario
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                                            Nombre
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                                            Apellido
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                                            Acciones
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {renderLoadingSkeleton()}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            </Fade>
        );
    }

    if (!usuarios || usuarios.length === 0) {
        return (
            <Fade in={true} timeout={500}>
                <Card elevation={2} sx={{ borderRadius: 2 }}>
                    <CardContent sx={{ p: 4, textAlign: 'center' }}>
                        <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No hay usuarios registrados
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Crea tu primer usuario utilizando el formulario de registro
                        </Typography>
                    </CardContent>
                </Card>
            </Fade>
        );
    }

    return (
        <Fade in={true} timeout={500}>
            <Card 
                elevation={2} 
                sx={{ 
                    borderRadius: 2,
                    overflow: 'hidden',
                    boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.1)}`,
                }}
            >
                <CardContent sx={{ p: 0 }}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow 
                                    sx={{ 
                                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                        '& th': {
                                            fontWeight: 600,
                                            color: theme.palette.primary.main,
                                            py: 2,
                                        }
                                    }}
                                >
                                    <TableCell>Usuario</TableCell>
                                    <TableCell>Nombre</TableCell>
                                    <TableCell>Apellido</TableCell>
                                    <TableCell align="center">Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {usuarios.map((usuario, index) => (
                                    <TableRow
                                        key={usuario.idUsuario || index}
                                        sx={{
                                            '&:hover': {
                                                backgroundColor: alpha(theme.palette.primary.main, 0.04),
                                            },
                                            '&:last-child td': {
                                                borderBottom: 0,
                                            },
                                            transition: theme.transitions.create(['background-color']),
                                        }}
                                    >
                                        <TableCell>
                                            <Box display="flex" alignItems="center" gap={2}>
                                                <Tooltip title="Ver foto completa">
                                                    <Avatar
                                                        src={usuario.foto ? `http://localhost:8000${usuario.foto}` : undefined}
                                                        sx={{
                                                            width: 50,
                                                            height: 50,
                                                            cursor: 'pointer',
                                                            border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                                            transition: theme.transitions.create(['transform', 'box-shadow']),
                                                            '&:hover': {
                                                                transform: 'scale(1.1)',
                                                                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                                                            }
                                                        }}
                                                        onClick={() => handleImageClick(usuario.foto, usuario.nombre, usuario.apellido)}
                                                    >
                                                        <PersonIcon />
                                                    </Avatar>
                                                </Tooltip>
                                                <Box>
                                                    <Typography variant="body2" fontWeight={500}>
                                                        ID: {usuario.idUsuario}
                                                    </Typography>
                                                    <Chip
                                                        label="Activo"
                                                        size="small"
                                                        color="success"
                                                        sx={{ fontSize: '0.7rem', height: 20 }}
                                                    />
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body1" fontWeight={500}>
                                                {usuario.nombre}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body1" fontWeight={500}>
                                                {usuario.apellido}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box display="flex" gap={1} justifyContent="center">
                                                <Tooltip title="Ver foto">
                                                    <IconButton
                                                        size="small"
                                                        color="info"
                                                        onClick={() => handleImageClick(usuario.foto, usuario.nombre, usuario.apellido)}
                                                        sx={{
                                                            backgroundColor: alpha(theme.palette.info.main, 0.1),
                                                            '&:hover': {
                                                                backgroundColor: alpha(theme.palette.info.main, 0.2),
                                                                transform: 'scale(1.1)',
                                                            },
                                                            transition: theme.transitions.create(['transform', 'background-color']),
                                                        }}
                                                    >
                                                        <VisibilityIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Editar usuario">
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        onClick={() => onEdit(usuario)}
                                                        sx={{
                                                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                                            '&:hover': {
                                                                backgroundColor: alpha(theme.palette.primary.main, 0.2),
                                                                transform: 'scale(1.1)',
                                                            },
                                                            transition: theme.transitions.create(['transform', 'background-color']),
                                                        }}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Eliminar usuario">
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleDeleteClick(usuario)}
                                                        sx={{
                                                            backgroundColor: alpha(theme.palette.error.main, 0.1),
                                                            '&:hover': {
                                                                backgroundColor: alpha(theme.palette.error.main, 0.2),
                                                                transform: 'scale(1.1)',
                                                            },
                                                            transition: theme.transitions.create(['transform', 'background-color']),
                                                        }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>

                {/* Dialog de confirmación para eliminar */}
                <Dialog
                    open={deleteDialog.open}
                    onClose={handleDeleteCancel}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{
                        sx: {
                            borderRadius: 2,
                            boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
                        }
                    }}
                >
                    <DialogTitle sx={{ 
                        color: theme.palette.error.main,
                        fontWeight: 600,
                        pb: 1
                    }}>
                        Confirmar eliminación
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText sx={{ fontSize: '1rem', lineHeight: 1.6 }}>
                            ¿Estás seguro de que deseas eliminar al usuario{' '}
                            <strong>
                                {deleteDialog.usuario?.nombre} {deleteDialog.usuario?.apellido}
                            </strong>
                            ?
                            <br />
                            <br />
                            Esta acción no se puede deshacer.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ p: 3, pt: 1 }}>
                        <Button
                            onClick={handleDeleteCancel}
                            variant="outlined"
                            sx={{ 
                                borderRadius: 2,
                                px: 3,
                                borderColor: theme.palette.grey[300],
                                color: theme.palette.text.primary,
                                '&:hover': {
                                    borderColor: theme.palette.grey[400],
                                    backgroundColor: alpha(theme.palette.grey[400], 0.1),
                                }
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleDeleteConfirm}
                            variant="contained"
                            color="error"
                            autoFocus
                            sx={{ 
                                borderRadius: 2,
                                px: 3,
                                boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.4)}`,
                                '&:hover': {
                                    boxShadow: `0 6px 16px ${alpha(theme.palette.error.main, 0.5)}`,
                                }
                            }}
                        >
                            Eliminar
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Dialog para mostrar imagen completa */}
                <Dialog
                    open={imageDialog.open}
                    onClose={handleImageDialogClose}
                    maxWidth="md"
                    PaperProps={{
                        sx: {
                            borderRadius: 2,
                            overflow: 'hidden',
                            boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
                        }
                    }}
                >
                    <DialogTitle sx={{ 
                        textAlign: 'center',
                        fontWeight: 600,
                        color: theme.palette.primary.main,
                        pb: 1
                    }}>
                        Foto de {imageDialog.userName}
                    </DialogTitle>
                    <DialogContent sx={{ p: 0, textAlign: 'center' }}>
                        <Box
                            component="img"
                            src={imageDialog.imageUrl}
                            alt={imageDialog.userName}
                            sx={{
                                width: '100%',
                                maxWidth: 400,
                                height: 'auto',
                                objectFit: 'cover',
                            }}
                            onError={(e) => {
                                console.error('Error cargando imagen:', e);
                                // Mostrar imagen por defecto en caso de error
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    </DialogContent>
                    <DialogActions sx={{ justifyContent: 'center', p: 2 }}>
                        <Button
                            onClick={handleImageDialogClose}
                            variant="contained"
                            sx={{ 
                                borderRadius: 2,
                                px: 4,
                            }}
                        >
                            Cerrar
                        </Button>
                    </DialogActions>
                </Dialog>
            </Card>
        </Fade>
    );
};

export default TablaUsuario;