import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar,
    IconButton,
    Typography,
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    DialogContentText,
    Tooltip,
    Skeleton,
} from '@mui/material';
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

    // Sin estado de loading - carga directa

    if (!usuarios || usuarios.length === 0) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <PersonIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                    No hay usuarios registrados
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Crea tu primer usuario usando el botón "Nuevo Usuario"
                </Typography>
            </Box>
        );
    }

    return (
        <>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                            <TableCell><strong>Usuario</strong></TableCell>
                            <TableCell><strong>Nombre</strong></TableCell>
                            <TableCell><strong>Apellido</strong></TableCell>
                            <TableCell align="center"><strong>Acciones</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {usuarios.map((usuario, index) => (
                            <TableRow
                                key={usuario.idUsuario || index}
                                sx={{
                                    '&:hover': {
                                        backgroundColor: '#fafafa',
                                    },
                                }}
                            >
                                <TableCell>
                                    <Avatar
                                        src={usuario.foto ? `http://localhost:8000${usuario.foto}` : undefined}
                                        sx={{
                                            width: 40,
                                            height: 40,
                                        }}
                                    >
                                        <PersonIcon />
                                    </Avatar>
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
                                    <Box display="flex" gap={0.5} justifyContent="center">
                                        <Tooltip title="Editar">
                                            <IconButton
                                                size="small"
                                                color="primary"
                                                onClick={() => onEdit(usuario)}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>

                                        <Tooltip title="Eliminar">
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => handleDeleteClick(usuario)}
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

            {/* Dialog de confirmación para eliminar */}
            <Dialog
                open={deleteDialog.open}
                onClose={handleDeleteCancel}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle color="error.main">
                    Confirmar eliminación
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
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
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={handleDeleteCancel}
                        variant="outlined"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        variant="contained"
                        color="error"
                        autoFocus
                    >
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog para mostrar imagen completa */}
            <Dialog
                open={imageDialog.open}
                onClose={handleImageDialogClose}
                maxWidth="sm"
            >
                <DialogTitle textAlign="center">
                    {imageDialog.userName}
                </DialogTitle>
                <DialogContent sx={{ p: 2, textAlign: 'center' }}>
                    <Box
                        component="img"
                        src={imageDialog.imageUrl}
                        alt={imageDialog.userName}
                        sx={{
                            width: '100%',
                            maxWidth: 300,
                            height: 'auto',
                            objectFit: 'cover',
                            borderRadius: 1,
                        }}
                        onError={(e) => {
                            console.error('Error cargando imagen:', e);
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', p: 2 }}>
                    <Button
                        onClick={handleImageDialogClose}
                        variant="contained"
                    >
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default TablaUsuario;