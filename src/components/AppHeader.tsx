import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const AppHeader: React.FC = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontSize: '0.75rem' }}>
          PDF Evaluator
        </Typography>
        <Button color="inherit" component={RouterLink} to="/" sx={{ fontSize: '0.75rem' }}>
          Home
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default AppHeader; 