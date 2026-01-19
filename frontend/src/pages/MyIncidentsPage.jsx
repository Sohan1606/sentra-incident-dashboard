import React, { useEffect, useState, useCallback } from 'react';
import {
  Container, Paper, Typography, Table, TableHead, TableRow, TableCell,
  TableBody, Chip, CircularProgress, TableContainer, TableSortLabel,
  Box, Fade, IconButton, Tooltip, Zoom, Grid, Avatar
} from '@mui/material';
import {
  Refresh as RefreshIcon, History as HistoryIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const statusColor = (status) => {
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

const MyIncidentsPage = () => {
  const { token } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const fetchMyIncidents = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/incidents/my', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIncidents(res.data);
    } catch (error) {
      console.error('Error fetching incidents', error.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Initial load + 15s auto-refresh
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
    let sortable = [...incidents];
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
  }, [incidents, sortConfig]);

  const stats = React.useMemo(() => {
    const total = incidents.length;
    const pending = incidents.filter(i => i.status === 'Pending').length;
    const inReview = incidents.filter(i => i.status === 'In Review').length;
    const resolved = incidents.filter(i => i.status === 'Resolved').length;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
    return { total, pending, inReview, resolved, resolutionRate };
  }, [incidents]);

  return (
    <Container maxWidth="xl" sx={{ mt: 4, pb: 4 }}>
      <Fade in timeout={600}>
        <Box>
          {/* Header */}
          <Paper sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            borderRadius: 3,
            p: 4,
            color: 'white'
          }}>
            <Box>
              <Typography variant="h3" fontWeight="bold" gutterBottom>
                My Incidents
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                {stats.total} total reports • {stats.resolutionRate}% resolved
              </Typography>
            </Box>
            <Tooltip title="Refresh">
              <IconButton
                onClick={fetchMyIncidents}
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Paper>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {[
              { title: 'Total', value: stats.total, icon: <HistoryIcon />, color: '#10b981' },
              { title: 'Pending', value: stats.pending, icon: <RefreshIcon />, color: '#f59e0b' },
              { title: 'In Review', value: stats.inReview, icon: <RefreshIcon />, color: '#3b82f6' },
              { title: 'Resolved', value: stats.resolved, icon: <RefreshIcon />, color: '#10b981' }
            ].map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Zoom in timeout={600 + index * 100}>
                  <Paper sx={{
                    background: `linear-gradient(135deg, ${stat.color}22 0%, ${stat.color}44 100%)`,
                    p: 3, textAlign: 'center', borderRadius: 3,
                    border: `1px solid ${stat.color}33`
                  }}>
                    <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: stat.color + '66' }}>
                      {stat.icon}
                    </Avatar>
                    <Typography variant="h4" fontWeight="bold" color={stat.color}>
                      {loading ? <CircularProgress size={24} color="inherit" /> : stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Paper>
                </Zoom>
              </Grid>
            ))}
          </Grid>

          {/* Incidents Table */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
              Incident Reports ({sortedIncidents.length})
            </Typography>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading your incidents...</Typography>
              </Box>
            ) : sortedIncidents.length === 0 ? (
              <Paper sx={{ p: 6, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No incidents reported yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Your reports will appear here once submitted
                </Typography>
              </Paper>
            ) : (
              <TableContainer sx={{ maxHeight: 600 }}>
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
                      <TableCell>Category</TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={sortConfig.key === 'priority'}
                          direction={sortConfig.key === 'priority' ? sortConfig.direction : 'asc'}
                          onClick={() => handleSort('priority')}
                        >
                          Priority
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={sortConfig.key === 'status'}
                          direction={sortConfig.key === 'status' ? sortConfig.direction : 'asc'}
                          onClick={() => handleSort('status')}
                        >
                          Status
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={sortConfig.key === 'createdAt'}
                          direction={sortConfig.key === 'createdAt' ? sortConfig.direction : 'asc'}
                          onClick={() => handleSort('createdAt')}
                        >
                          Date
                        </TableSortLabel>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortedIncidents.map((inc) => (
                      <TableRow key={inc._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell sx={{ fontFamily: 'monospace' }}>
                          {inc.referenceId || inc._id.slice(-6)}
                        </TableCell>
                        <TableCell sx={{ maxWidth: 300 }}>
                          <Typography variant="body2" noWrap title={inc.title}>
                            {inc.title}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={inc.category || 'General'} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={inc.priority || 'Medium'}
                            color={getPriorityColor(inc.priority)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={inc.status}
                            color={statusColor(inc.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(inc.createdAt).toLocaleDateString()}
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

export default MyIncidentsPage;
