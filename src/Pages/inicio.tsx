import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    Paper,
    useTheme,
    alpha,
    Skeleton,
    Chip,
} from '@mui/material';
import { Link } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import CategoryIcon from '@mui/icons-material/Category';
import InventoryIcon from '@mui/icons-material/Inventory';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const Dashboard: React.FC = () => {
    const theme = useTheme();
    const [stats, setStats] = useState({
        usuarios: 0,
        categorias: 0,
        productos: 0,
    });
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            setLoading(true);
            
            // Obtener estadísticas de usuarios
            const usuariosResponse = await fetch('http://localhost:8000/usuario');
            if (usuariosResponse.ok) {
                const usuariosData = await usuariosResponse.json();
                
                let usuariosCount = 0;
                if (Array.isArray(usuariosData)) {
                    usuariosCount = usuariosData.length;
                } else if (usuariosData?.data && Array.isArray(usuariosData.data)) {
                    usuariosCount = usuariosData.data.length;
                } else if (usuariosData?.count) {
                    usuariosCount = usuariosData.count;
                }
                
                setStats({
                    usuarios: usuariosCount,
                    categorias: 0, // Por implementar
                    productos: 0,  // Por implementar
                });
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
            setStats({ usuarios: 0, categorias: 0, productos: 0 });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const statsCards = [
        {
            title: 'Usuarios',
            value: stats.usuarios,
            icon: <PersonIcon sx={{ fontSize: 40 }} />,
            color: theme.palette.primary.main,
            link: '/usuarios',
            description: 'Usuarios registrados en el sistema',
        },
        {
            title: 'Categorías',
            value: stats.categorias,
            icon: <CategoryIcon sx={{ fontSize: 40 }} />,
            color: theme.palette.secondary.main,
            link: '/categorias',
            description: 'Categorías de productos disponibles',
            disabled: true,
        },
        {
            title: 'Productos',
            value: stats.productos,
            icon: <InventoryIcon sx={{ fontSize: 40 }} />,
            color: theme.palette.success.main,
            link: '/productos',
            description: 'Productos en inventario',
            disabled: true,
        },
    ];

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: alpha(theme.palette.grey[50], 0.5), py: 3 }}>
            <Box sx={{ maxWidth: 1200, mx: 'auto', px: 2 }}>
                {/* Header */}
                <Paper
                    elevation={2}
                    sx={{
                        p: 4,
                        mb: 4,
                        borderRadius: 3,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                        color: 'white',
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    <Box
                        sx={{
                            position: 'absolute',
                            right: -50,
                            top: -50,
                            width: 200,
                            height: 200,
                            borderRadius: '50%',
                            background: alpha(theme.palette.common.white, 0.1),
                        }}
                    />
                    <Box
                        sx={{
                            position: 'absolute',
                            right: 20,
                            bottom: -30,
                            width: 100,
                            height: 100,
                            borderRadius: '50%',
                            background: alpha(theme.palette.common.white, 0.05),
                        }}
                    />
                    
                    <Box position="relative" zIndex={1}>
                        <Typography variant="h3" fontWeight="bold" gutterBottom>
                            ¡Bienvenido al Sistema!
                        </Typography>
                        <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
                            Panel de control del sistema de inventario
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                            <TrendingUpIcon />
                            <Typography variant="body1" sx={{ opacity: 0.8 }}>
                                Gestiona usuarios, categorías y productos de manera eficiente
                            </Typography>
                        </Box>
                    </Box>
                </Paper>

                {/* Estadísticas */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    {statsCards.map((card, index) => (
                        <Grid item xs={12} sm={6} lg={4} key={card.title}>
                            <Card
                                elevation={2}
                                sx={{
                                    height: '100%',
                                    borderRadius: 3,
                                    position: 'relative',
                                    overflow: 'hidden',
                                    transition: 'all 0.3s ease',
                                    opacity: card.disabled ? 0.6 : 1,
                                    '&:hover': {
                                        transform: card.disabled ? 'none' : 'translateY(-4px)',
                                        boxShadow: card.disabled ? 2 : `0 8px 25px ${alpha(card.color, 0.3)}`,
                                    },
                                }}
                            >
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: 4,
                                        background: card.color,
                                    }}
                                />
                                
                                <CardContent sx={{ p: 3 }}>
                                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                        <Box>
                                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                                {card.title}
                                            </Typography>
                                            {loading ? (
                                                <Skeleton variant="text" width={60} height={40} />
                                            ) : (
                                                <Typography variant="h3" fontWeight="bold" color={card.color}>
                                                    {card.value}
                                                </Typography>
                                            )}
                                        </Box>
                                        <Box
                                            sx={{
                                                p: 1.5,
                                                borderRadius: 2,
                                                backgroundColor: alpha(card.color, 0.1),
                                                color: card.color,
                                            }}
                                        >
                                            {card.icon}
                                        </Box>
                                    </Box>
                                    
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        {card.description}
                                    </Typography>

                                    {card.disabled && (
                                        <Chip
                                            label="Próximamente"
                                            size="small"
                                            sx={{
                                                backgroundColor: alpha(theme.palette.warning.main, 0.1),
                                                color: theme.palette.warning.main,
                                                fontWeight: 500,
                                            }}
                                        />
                                    )}
                                </CardContent>
                                
                                {!card.disabled && (
                                    <CardActions sx={{ p: 3, pt: 0 }}>
                                        <Button
                                            component={Link}
                                            to={card.link}
                                            endIcon={<ArrowForwardIcon />}
                                            sx={{
                                                color: card.color,
                                                fontWeight: 500,
                                                '&:hover': {
                                                    backgroundColor: alpha(card.color, 0.05),
                                                },
                                            }}
                                        >
                                            Ver detalles
                                        </Button>
                                    </CardActions>
                                )}
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {/* Acciones rápidas */}
                <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
                    <Typography variant="h5" fontWeight="600" gutterBottom color="primary">
                        Acciones Rápidas
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        Accede rápidamente a las funciones más utilizadas
                    </Typography>
                    
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={4}>
                            <Button
                                component={Link}
                                to="/usuarios"
                                variant="outlined"
                                startIcon={<PersonIcon />}
                                fullWidth
                                sx={{
                                    py: 2,
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    borderWidth: 2,
                                    '&:hover': {
                                        borderWidth: 2,
                                        transform: 'translateY(-2px)',
                                        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                                    },
                                }}
                            >
                                Gestionar Usuarios
                            </Button>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={4}>
                            <Button
                                variant="outlined"
                                startIcon={<CategoryIcon />}
                                disabled
                                fullWidth
                                sx={{
                                    py: 2,
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    borderWidth: 2,
                                }}
                            >
                                Gestionar Categorías
                                <Chip label="Pronto" size="small" sx={{ ml: 1 }} />
                            </Button>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={4}>
                            <Button
                                variant="outlined"
                                startIcon={<InventoryIcon />}
                                disabled
                                fullWidth
                                sx={{
                                    py: 2,
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    borderWidth: 2,
                                }}
                            >
                                Gestionar Productos
                                <Chip label="Pronto" size="small" sx={{ ml: 1 }} />
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Footer info */}
                <Box sx={{ textAlign: 'center', mt: 4, py: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                        Sistema de Inventario v1.0 - Desarrollado con React + TypeScript + Material-UI
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default Dashboard;