import React, { useEffect, useState, useCallback } from 'react';
import {
  Container, Grid, Paper, Button, Typography, Table, TableHead,
  TableRow, TableCell, TableBody, Chip, CircularProgress, TableContainer,
  Box, Fade, IconButton, TableSortLabel, Card, CardContent, Avatar,
  Divider, Tooltip
} from '@mui/material';
import Zoom from '@mui/material/Zoom';
import {
  Refresh as RefreshIcon, School as SchoolIcon, 
  Report as ReportIcon, Schedule as ScheduleIcon,
  Assignment as AssignmentIcon, CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const getStatusColor = (status) => {
  if (status === 'Resolved') return 'success';
  if (status === 'In Review') return 'info';
  return 'warning';
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'Critical': return 'error';
    case 'High': return 'warning';
    case 'Medium': return 'info';
    default: return 'default';
  }
};

const StudentDashboard = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [myIncidents, setMyIncidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const fetchMyIncidents = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      // ✅ FIXED: Use /my endpoint for students (their own incidents)
      const res = await axios.get('http://localhost:5000/api/incidents/my', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyIncidents(res.data);
    } catch (error) {
      console.error('Error fetching student incidents:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchMyIncidents();
  }, [fetchMyIncidents]);

  useEffect(() => {
    const interval = setInterval(fetchMyIncidents, 15000);
    return () => clearInterval(interval);
  }, [fetchMyIncidents]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedIncidents = React.useMemo(() => {
    let sortable = [...myIncidents];
    if (sortConfig.key) {
      sortable.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortable;
  }, [myIncidents, sortConfig]);

  const stats = React.useMemo(() => {
    const total = sortedIncidents.length;
    const pending = sortedIncidents.filter(i => i.status === 'Pending').length;
    const inReview = sortedIncidents.filter(i => i.status === 'In Review').length;
    const resolved = sortedIncidents.filter(i => i.status === 'Resolved').length;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    return { total, pending, inReview, resolved, resolutionRate };
  }, [sortedIncidents]);

  return (
    <Container maxWidth="xl" sx={{ mt: 4, pb: 4 }}>
      <Fade in timeout={600}>
        <Box>
          {/* Header Section */}
          <Paper sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            borderRadius: 3,
            p: 4,
            color: 'white'
          }}>
            <Box>
              <Typography variant="h3" fontWeight="bold" gutterBottom>
                Student Dashboard
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Welcome back! Track your reported incidents
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.7, mt: 1 }}>
                Monitor the status of incidents you've reported and stay informed
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Tooltip title="Refresh Data">
                <IconButton
                  onClick={fetchMyIncidents}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Avatar sx={{ width: 56, height: 56, bgcolor: 'rgba(255,255,255,0.2)' }}>
                <SchoolIcon sx={{ fontSize: 28 }} />
              </Avatar>
            </Box>
          </Paper>

          {/* Statistics Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {[
              {
                title: 'Total Reported',
                value: stats.total,
                icon: <ReportIcon />,
                color: '#4facfe',
                bgColor: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                subtitle: 'Your incidents'
              },
              {
                title: 'Pending',
                value: stats.pending,
                icon: <ScheduleIcon />,
                color: '#ff9800',
                bgColor: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                subtitle: 'Awaiting review'
              },
              {
                title: 'In Review',
                value: stats.inReview,
                icon: <AssignmentIcon />,
                color: '#2196f3',
                bgColor: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                subtitle: 'Being processed'
              },
              {
                title: 'Resolved',
                value: stats.resolved,
                icon: <CheckCircleIcon />,
                color: '#4caf50',
                bgColor: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
                subtitle: `${stats.resolutionRate}% resolved`
              }
            ].map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Zoom in timeout={600 + index * 100}>
                  <Paper sx={{
                    background: stat.bgColor,
                    color: 'white',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 16px 48px rgba(0,0,0,0.2)'
                    },
                    p: 3,
                    textAlign: 'center'
                  }}>
                    <Avatar sx={{
                      width: 60,
                      height: 60,
                      bgcolor: 'rgba(255,255,255,0.2)',
                      mx: 'auto',
                      mb: 2
                    }}>
                      {stat.icon}
                    </Avatar>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                      {loading ? <CircularProgress size={24} color="inherit" /> : stat.value}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                      {stat.title}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      {stat.subtitle}
                    </Typography>
                  </Paper>
                </Zoom>
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ my: 4 }} />

          {/* Quick Actions */}
          <Grid container spacing={3} sx={{ mb: 5 }}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 4, height: 160, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="h6" gutterBottom textAlign="center">
                  Report New Incident
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
                  Submit confidential reports anonymously if needed
                </Typography>
                <Button 
                  variant="contained" 
                  size="large" 
                  fullWidth
                  onClick={() => navigate('/student/report')}
                >
                  + New Report
                </Button>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 4, height: 160 }}>
                <Typography variant="h6" gutterBottom>
                  Awareness Hub
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Campus policies, helplines, safety tips
                </Typography>
                <Button 
                  variant="outlined" 
                  size="large" 
                  fullWidth
                  onClick={() => navigate('/awareness')}
                >
                  Open Hub
                </Button>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 4, height: 160 }}>
                <Typography variant="h6" gutterBottom>
                  My Stats
                </Typography>
                <Typography variant="h3" fontWeight="bold" color="primary.main">
                  {sortedIncidents.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Reports
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* My Incidents Table */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
              My Incident Reports ({sortedIncidents.length})
            </Typography>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading your reports...</Typography>
              </Box>
            ) : sortedIncidents.length === 0 ? (
              <Paper sx={{ p: 6, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No incidents reported yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Your reports will appear here with real-time status updates
                </Typography>
                <Button 
                  variant="contained" 
                  size="large"
                  onClick={() => navigate('/student/report')}
                >
                  Report Your First Incident
                </Button>
              </Paper>
            ) : (
              <TableContainer sx={{ maxHeight: 500 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <TableSortLabel
                          active={sortConfig.key === 'referenceId'}
                          direction={sortConfig.key === 'referenceId' ? sortConfig.direction : 'asc'}
                          onClick={() => handleSort('referenceId')}
                        >
                          Reference ID
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={sortConfig.key === 'title'}
                          direction={sortConfig.key === 'title' ? sortConfig.direction : 'asc'}
                          onClick={() => handleSort('title')}
                        >
                          Title
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Assigned</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortedIncidents.map((incident) => (
                      <TableRow 
                        key={incident._id} 
                        hover 
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell sx={{ fontFamily: 'monospace' }}>
                          {incident.referenceId || incident._id.slice(-6)}
                        </TableCell>
                        <TableCell sx={{ maxWidth: 300 }}>
                          <Typography variant="body2" noWrap title={incident.title}>
                            {incident.title}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={incident.status} 
                            color={getStatusColor(incident.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={incident.priority || 'Medium'}
                            color={getPriorityColor(incident.priority)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(incident.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {incident.assignedTo?.name || 'Unassigned'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Box>
      </Fade>
    </Container>
  );
};

export default StudentDashboard;
