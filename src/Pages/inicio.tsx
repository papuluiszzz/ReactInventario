import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    Paper,
    Skeleton,
} from '@mui/material';
import { Link } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import CategoryIcon from '@mui/icons-material/Category';
import InventoryIcon from '@mui/icons-material/Inventory';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState({
        usuarios: 0,
    });
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            setLoading(true);
            
            const usuariosResponse = await fetch('http://localhost:8000/usuario');
            if (usuariosResponse.ok) {
                const usuariosData = await usuariosResponse.json();
                
                let usuariosCount = 0;
                if (Array.isArray(usuariosData)) {
                    usuariosCount = usuariosData.length;
                } else if (usuariosData?.data && Array.isArray(usuariosData.data)) {
                    usuariosCount = usuariosData.data.length;
                }
                
                setStats({
                    usuarios: usuariosCount,
                    categorias: 0,
                    productos: 0,
                });
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
            setStats({ usuarios: 0 });
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
            icon: <PersonIcon sx={{ fontSize: 30 }} />,
            color: '#1976d2',
            link: '/usuarios',
            available: true,
        },
    ];

    return (
        <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
            {/* Header simple */}
            <Paper sx={{ p: 3, mb: 3, textAlign: 'center', bgcolor: '#f5f5f5' }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Sistema de Inventario
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Gestiona tu inventario de manera eficiente
                </Typography>
            </Paper>

            {/* Estadísticas */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                {statsCards.map((card) => (
                    <Grid item xs={12} sm={4} key={card.title}>
                        <Card 
                            sx={{ 
                                textAlign: 'center',
                                opacity: card.available ? 1 : 0.6,
                                transition: 'all 0.2s',
                                '&:hover': card.available ? {
                                    transform: 'translateY(-2px)',
                                    boxShadow: 3
                                } : {}
                            }}
                        >
                            <CardContent sx={{ py: 3 }}>
                                <Box 
                                    sx={{ 
                                        display: 'inline-flex', 
                                        p: 2, 
                                        borderRadius: '50%', 
                                        bgcolor: card.color, 
                                        color: 'white',
                                        mb: 2
                                    }}
                                >
                                    {card.icon}
                                </Box>
                                
                                <Typography variant="h4" fontWeight="bold" color={card.color}>
                                    {loading ? <Skeleton width={40} /> : card.value}
                                </Typography>
                                
                                <Typography variant="h6" color="text.primary" gutterBottom>
                                    {card.title}
                                </Typography>

                                {card.available ? (
                                    <Button
                                        component={Link}
                                        to={card.link}
                                        endIcon={<ArrowForwardIcon />}
                                        sx={{ color: card.color }}
                                    >
                                        Ver detalles
                                    </Button>
                                ) : (
                                    <Typography variant="caption" color="text.secondary">
                                        Próximamente
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Acciones rápidas */}
            <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Acciones Rápidas
                </Typography>
                
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={6}>
                        <Button
                            component={Link}
                            to="/usuarios"
                            variant="outlined"
                            fullWidth
                            startIcon={<PersonIcon />}
                            sx={{ py: 1.5 }}
                        >
                            Gestionar Usuarios
                        </Button>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={6}>
                        <Button
                            component={Link}
                            to="/subida-masiva"
                            variant="outlined"
                            fullWidth
                            startIcon={<InventoryIcon />}
                            sx={{ py: 1.5 }}
                        >
                            Subida Masiva
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
};

export default Dashboard;