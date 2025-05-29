import React from 'react';
import { Link } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Paper,
    useTheme,
    alpha,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const Error404: React.FC = () => {
    const theme = useTheme();

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(theme.palette.grey[50], 0.5),
                px: 2,
            }}
        >
            <Paper
                elevation={4}
                sx={{
                    p: 6,
                    textAlign: 'center',
                    borderRadius: 3,
                    maxWidth: 500,
                    width: '100%',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        mb: 3,
                    }}
                >
                    <ErrorOutlineIcon
                        sx={{
                            fontSize: 80,
                            color: theme.palette.error.main,
                        }}
                    />
                </Box>

                <Typography
                    variant="h1"
                    sx={{
                        fontSize: { xs: '4rem', sm: '6rem' },
                        fontWeight: 'bold',
                        color: theme.palette.primary.main,
                        mb: 2,
                        lineHeight: 1,
                    }}
                >
                    404
                </Typography>

                <Typography
                    variant="h4"
                    gutterBottom
                    sx={{
                        fontWeight: 600,
                        color: theme.palette.text.primary,
                        mb: 2,
                    }}
                >
                    Página no encontrada
                </Typography>

                <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mb: 4, lineHeight: 1.6 }}
                >
                    Lo sentimos, la página que estás buscando no existe o ha sido movida.
                    Verifica la URL o regresa al inicio.
                </Typography>

                <Button
                    component={Link}
                    to="/"
                    variant="contained"
                    size="large"
                    startIcon={<HomeIcon />}
                    sx={{
                        borderRadius: 2,
                        py: 1.5,
                        px: 4,
                        fontWeight: 500,
                        textTransform: 'none',
                        boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.5)}`,
                        },
                        transition: 'all 0.3s ease',
                    }}
                >
                    Volver al inicio
                </Button>
            </Paper>
        </Box>
    );
};

export default Error404;