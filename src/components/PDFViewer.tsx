import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Box, 
  Typography, 
  Button, 
  CircularProgress,
  Grid,
  Tabs,
  Tab,
  Card,
  CardContent
} from '@mui/material';
import { Document, Page, pdfjs } from 'react-pdf';
import { useParams } from 'react-router-dom';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { CheckCircle, Cancel } from '@mui/icons-material';

interface Check {
  text: string;
  status: 'pass' | 'fail';
  details: string;
  page_number: number;
}

interface Checks {
  [key: string]: Check[];
}

const documents = [
  { id: '1', name: 'XYZ Document', status: 'completed', lastUpdated: '2024-03-20' },
  { id: '2', name: 'DEF Document', status: 'pending', lastUpdated: '2024-03-19' },
  { id: '3', name: 'MNO Document', status: 'completed', lastUpdated: '2024-03-18' },
  { id: '4', name: 'ABC Document', status: 'pending', lastUpdated: '2024-03-17' },
  { id: '5', name: 'PQR Document', status: 'completed', lastUpdated: '2024-03-16' }
];

const PDFViewer: React.FC = () => {
  const { id: documentId } = useParams();
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfData, setPdfData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [workerInitialized, setWorkerInitialized] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [checks, setChecks] = useState<Checks>({});

  const fetchChecks = async () => {
    try {
      const document = documents.find(doc => doc.id === documentId);
      if (!document) {
        throw new Error('Document not found');
      }

      const response = await fetch('/api/checks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ document_id: document.name.split(' ')[0] }),
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch checks: ${response.status}`);
      }
      const data = await response.json();
      setChecks(data);
    } catch (error) {
      console.error('Error fetching checks:', error);
    }
  };

  useEffect(() => {
    if (documentId) {
      fetchChecks();
    }
  }, [documentId]);

  useEffect(() => {
    const initializeWorker = async () => {
      try {
        const workerUrl = new URL(
          'pdfjs-dist/build/pdf.worker.min.js',
          import.meta.url
        ).toString();
        pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
        setWorkerInitialized(true);
      } catch (error) {
        console.error('Failed to initialize PDF.js worker:', error);
      }
    };

    initializeWorker();
  }, []);

  const fetchPage = async (pageNum: number) => {
    if (!workerInitialized) {
      console.error('PDF.js worker not initialized');
      return;
    }

    try {
      setIsLoading(true);
      
      if (pageNum < 1) {
        console.error('Invalid page number (less than 1):', pageNum);
        return;
      }
      
      console.log('Fetching page:', pageNum);
      
      const response = await fetch('/api/extract-page', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ page_number: pageNum }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Proxy response:', errorText);
        throw new Error(`Proxy error! status: ${response.status}, message: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Raw API response:', data);
      
      const pdfData = data.base64_content;
      if (!pdfData) {
        console.error('No PDF data found in response');
        throw new Error('No PDF data received in the response');
      }

      try {
        const binaryString = atob(pdfData);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        console.log('Created blob URL for page:', pageNum);
        setPdfData(url);
      } catch (error) {
        console.error('Error processing PDF data:', error);
        throw new Error('Failed to process PDF data: ' + (error instanceof Error ? error.message : String(error)));
      }
    } catch (error) {
      console.error('Error fetching page:', error);
      setPdfData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTotalPages = async () => {
    try {
      const response = await fetch('/api/total-pages', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Total pages response:', errorText);
        throw new Error(`Failed to get total pages: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Total pages response:', data);
      setNumPages(data.total_pages);
    } catch (error) {
      console.error('Error fetching total pages:', error);
    }
  };

  useEffect(() => {
    fetchTotalPages();
  }, []);

  useEffect(() => {
    if (workerInitialized && pageNumber >= 1) {
      fetchPage(pageNumber);
    }
  }, [pageNumber, workerInitialized]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return;
    console.log('Changing to page:', newPage);
    setPageNumber(newPage);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const onDocumentLoadSuccess = ({ numPages: loadedPages }: { numPages: number }) => {
    console.log('Document loaded successfully. Total pages:', loadedPages);
    if (numPages === null) {
      setNumPages(loadedPages);
    }
  };

  const handleCheckClick = (pageNumber: number) => {
    if (pageNumber >= 1 && (!numPages || pageNumber <= numPages)) {
      setPageNumber(pageNumber);
    }
  };

  return (
    <Grid container spacing={3} sx={{ height: '100%' }}>
      <Grid item xs={12} md={6}>
        <Paper elevation={3} sx={{ p: 1, height: '100%', display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
              <CircularProgress />
            </Box>
          ) : pdfData ? (
            <>
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Document
                  file={pdfData}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={(error) => console.error('PDF document load error:', error)}
                  loading={
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                      <CircularProgress />
                    </Box>
                  }
                >
                  <Page 
                    key={`page-${pageNumber}`}
                    pageNumber={1}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                    width={500}
                    onLoadError={(error) => console.error('PDF page load error:', error)}
                    loading={
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                        <CircularProgress />
                      </Box>
                    }
                  />
                </Document>
              </Box>
              <Box sx={{ mt: 0.5, display: 'flex', justifyContent: 'center', gap: 1 }}>
                <Button
                  variant="contained"
                  disabled={pageNumber <= 1}
                  onClick={() => handlePageChange(pageNumber - 1)}
                  size="small"
                >
                  Previous
                </Button>
                <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', fontSize: '0.75rem' }}>
                  Page {pageNumber} of {numPages || '?'}
                </Typography>
                <Button
                  variant="contained"
                  disabled={numPages ? pageNumber >= numPages : false}
                  onClick={() => handlePageChange(pageNumber + 1)}
                  size="small"
                >
                  Next
                </Button>
              </Box>
            </>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
              <CircularProgress />
            </Box>
          )}
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper elevation={3} sx={{ p: 1, height: '100%', display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
          <Typography variant="h7" gutterBottom sx={{ mb: 0.5 }}>
            Checks
          </Typography>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={currentTab} onChange={handleTabChange}>
              {Object.keys(checks).map((section, index) => (
                <Tab key={index} label={section} sx={{ fontSize: '0.75rem', py: 0.5 }} />
              ))}
            </Tabs>
          </Box>
          <Box sx={{ 
            mt: 0.5, 
            flex: 1, 
            overflow: 'auto',
            maxHeight: 'calc(75vh)',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '4px',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
              },
            },
          }}>
            <Grid container spacing={1.5}>
              {Object.keys(checks).length > 0 && checks[Object.keys(checks)[currentTab]].map((check: Check, index: number) => (
                <Grid item xs={12} key={index}>
                  <Card 
                    sx={{ 
                      backgroundColor: check.status === 'pass' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                      borderLeft: `4px solid ${check.status === 'pass' ? '#4CAF50' : '#F44336'}`,
                      cursor: 'pointer',
                      '&:hover': {
                        boxShadow: 3
                      },
                      mb: 1
                    }}
                    onClick={() => handleCheckClick(check.page_number)}
                  >
                    <CardContent sx={{ py: 0.5, px: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.25 }}>
                        {check.status === 'pass' ? (
                          <CheckCircle sx={{ color: '#4CAF50', mr: 0.5, fontSize: '1rem' }} />
                        ) : (
                          <Cancel sx={{ color: '#F44336', mr: 0.5, fontSize: '1rem' }} />
                        )}
                        <Typography variant="subtitle1" component="div" sx={{ fontSize: '0.75rem' }}>
                          {check.text}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        {check.details}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25, fontSize: '0.75rem' }}>
                        Page {check.page_number}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default PDFViewer; 