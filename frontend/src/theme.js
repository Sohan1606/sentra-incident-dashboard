import { createTheme } from '@mui/material/styles';

// Light theme - Premium design
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#667eea',
      light: '#9fa8da',
      dark: '#303f9f',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#764ba2',
      light: '#ba68c8',
      dark: '#7b1fa2',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    info: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.3,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 16,
  },
  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    '0 3px 6px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.12)',
    '0 10px 20px rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.10)',
    '0 15px 25px rgba(0,0,0,0.15), 0 5px 10px rgba(0,0,0,0.05)',
    '0 20px 40px rgba(0,0,0,0.15)',
    '0 25px 50px rgba(0,0,0,0.15)',
    '0 30px 60px rgba(0,0,0,0.15)',
    '0 35px 70px rgba(0,0,0,0.15)',
    '0 40px 80px rgba(0,0,0,0.15)',
    '0 45px 90px rgba(0,0,0,0.15)',
    '0 50px 100px rgba(0,0,0,0.15)',
    '0 55px 110px rgba(0,0,0,0.15)',
    '0 60px 120px rgba(0,0,0,0.15)',
    '0 65px 130px rgba(0,0,0,0.15)',
    '0 70px 140px rgba(0,0,0,0.15)',
    '0 75px 150px rgba(0,0,0,0.15)',
    '0 80px 160px rgba(0,0,0,0.15)',
    '0 85px 170px rgba(0,0,0,0.15)',
    '0 90px 180px rgba(0,0,0,0.15)',
    '0 95px 190px rgba(0,0,0,0.15)',
    '0 100px 200px rgba(0,0,0,0.15)',
    '0 105px 210px rgba(0,0,0,0.15)',
    '0 110px 220px rgba(0,0,0,0.15)',
    '0 115px 230px rgba(0,0,0,0.15)',
    '0 120px 240px rgba(0,0,0,0.15)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f5f9',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#cbd5e1',
            borderRadius: '4px',
            '&:hover': {
              background: '#94a3b8',
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          borderRadius: 16,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
          '&:hover': {
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          padding: '12px 24px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          '&:hover': {
            background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
            boxShadow: '0 6px 24px rgba(102, 126, 234, 0.3)',
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
            backgroundColor: 'rgba(102, 126, 234, 0.04)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#f8fafc',
          '& .MuiTableCell-head': {
            fontWeight: 600,
            color: '#374151',
            borderBottom: '2px solid #e2e8f0',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: '#f8fafc',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#667eea',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          border: '3px solid rgba(255,255,255,0.3)',
        },
      },
    },
  },
});

// Dark theme - Premium dark mode
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
      light: '#e3f2fd',
      dark: '#42a5f5',
      contrastText: '#000000',
    },
    secondary: {
      main: '#ce93d8',
      light: '#f3e5f5',
      dark: '#ab47bc',
      contrastText: '#000000',
    },
    background: {
      default: '#0f172a',
      paper: '#1e293b',
    },
    text: {
      primary: '#f1f5f9',
      secondary: '#cbd5e1',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    info: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.3,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 16,
  },
  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.4)',
    '0 3px 6px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.4)',
    '0 10px 20px rgba(0,0,0,0.3), 0 3px 6px rgba(0,0,0,0.4)',
    '0 15px 25px rgba(0,0,0,0.3), 0 5px 10px rgba(0,0,0,0.4)',
    '0 20px 40px rgba(0,0,0,0.3)',
    '0 25px 50px rgba(0,0,0,0.3)',
    '0 30px 60px rgba(0,0,0,0.3)',
    '0 35px 70px rgba(0,0,0,0.3)',
    '0 40px 80px rgba(0,0,0,0.3)',
    '0 45px 90px rgba(0,0,0,0.3)',
    '0 50px 100px rgba(0,0,0,0.3)',
    '0 55px 110px rgba(0,0,0,0.3)',
    '0 60px 120px rgba(0,0,0,0.3)',
    '0 65px 130px rgba(0,0,0,0.3)',
    '0 70px 140px rgba(0,0,0,0.3)',
    '0 75px 150px rgba(0,0,0,0.3)',
    '0 80px 160px rgba(0,0,0,0.3)',
    '0 85px 170px rgba(0,0,0,0.3)',
    '0 90px 180px rgba(0,0,0,0.3)',
    '0 95px 190px rgba(0,0,0,0.3)',
    '0 100px 200px rgba(0,0,0,0.3)',
    '0 105px 210px rgba(0,0,0,0.3)',
    '0 110px 220px rgba(0,0,0,0.3)',
    '0 115px 230px rgba(0,0,0,0.3)',
    '0 120px 240px rgba(0,0,0,0.3)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#1e293b',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#475569',
            borderRadius: '4px',
            '&:hover': {
              background: '#64748b',
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          borderRadius: 16,
          background: 'linear-gradient(135deg, rgba(30,41,59,0.9) 0%, rgba(51,65,85,0.9) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            transform: 'translateY(-2px)',
            border: '1px solid rgba(255,255,255,0.2)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          padding: '12px 24px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #90caf9 0%, #ce93d8 100%)',
          color: '#0f172a',
          '&:hover': {
            background: 'linear-gradient(135deg, #64b5f6 0%, #ba68c8 100%)',
            boxShadow: '0 6px 24px rgba(144, 202, 249, 0.3)',
          },
        },
        outlined: {
          borderWidth: 2,
          borderColor: 'rgba(255,255,255,0.2)',
          color: '#f1f5f9',
          '&:hover': {
            borderWidth: 2,
            backgroundColor: 'rgba(144, 202, 249, 0.1)',
            borderColor: '#90caf9',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          background: 'linear-gradient(135deg, rgba(30,41,59,0.9) 0%, rgba(51,65,85,0.9) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e293b',
          '& .MuiTableCell-head': {
            fontWeight: 600,
            color: '#f1f5f9',
            borderBottom: '2px solid #334155',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: '#1e293b',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: 'rgba(255,255,255,0.05)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#90caf9',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderWidth: 2,
              borderColor: '#90caf9',
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255,255,255,0.2)',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#cbd5e1',
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#90caf9',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          border: '3px solid rgba(255,255,255,0.2)',
        },
      },
    },
  },
});

const getTheme = (mode = 'light') => mode === 'light' ? lightTheme : darkTheme;

export default getTheme;
