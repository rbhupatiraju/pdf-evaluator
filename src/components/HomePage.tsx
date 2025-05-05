import React from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Box,
  IconButton
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

interface Document {
  id: string;
  name: string;
  status: 'pending' | 'completed';
  lastUpdated: string;
}

const documents: Document[] = [
  { id: '1', name: 'XYZ Document', status: 'completed', lastUpdated: '2024-03-20' },
  { id: '2', name: 'DEF Document', status: 'pending', lastUpdated: '2024-03-19' },
  { id: '3', name: 'MNO Document', status: 'completed', lastUpdated: '2024-03-18' },
  { id: '4', name: 'ABC Document', status: 'pending', lastUpdated: '2024-03-17' },
  { id: '5', name: 'PQR Document', status: 'completed', lastUpdated: '2024-03-16' }
];

const HomePage: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ fontSize: '0.75rem' }}>
          Documents
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontSize: '0.75rem' }}>Document Name</TableCell>
                <TableCell sx={{ fontSize: '0.75rem' }}>Status</TableCell>
                <TableCell sx={{ fontSize: '0.75rem' }}>Last Updated</TableCell>
                <TableCell sx={{ fontSize: '0.75rem' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell sx={{ fontSize: '0.75rem' }}>{doc.name}</TableCell>
                  <TableCell>
                    <Typography 
                      sx={{ 
                        color: doc.status === 'completed' ? '#4CAF50' : '#FFA726',
                        fontWeight: 'medium',
                        fontSize: '0.75rem'
                      }}
                    >
                      {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.75rem' }}>{doc.lastUpdated}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        component={RouterLink}
                        to={`/viewer/${doc.id}`}
                        size="small"
                        title="View Document"
                        sx={{ 
                          color: 'primary.main',
                          '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.04)' }
                        }}
                      >
                        👁️
                      </IconButton>
                      <IconButton
                        size="small"
                        title="Run Analysis"
                        sx={{ 
                          color: 'success.main',
                          '&:hover': { backgroundColor: 'rgba(76, 175, 80, 0.04)' }
                        }}
                      >
                        ▶️
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default HomePage; 