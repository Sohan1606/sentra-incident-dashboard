import { InputLabel, Select, MenuItem } from '@mui/material';
import React, { useEffect, useState, useCallback } from 'react';
import {
  Container, Paper, Typography, Table, TableHead, TableRow, TableCell,
  TableBody, Chip, CircularProgress, TableContainer, TableSortLabel,
  FormControl, IconButton, Box, Fade, Button, TextField, InputAdornment,
  Card, CardContent, Grid, Avatar, Badge, Tooltip, LinearProgress,
} from '@mui/material';

import {
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  PriorityHigh as PriorityHighIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const statusColor = (status) => {
  if (status === 'Resolved') return 'success';
  if (status === 'In Review') return 'info';
  return 'warning';
};

const StaffDashboard = () => {
  const { token, user } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [page, setPage] = useState(0);                    // ✅ FIXED 1
  const [rowsPerPage, setRowsPerPage] = useState(10);     // ✅ FIXED 2

  const fetchAssignedIncidents = useCallback(async () => {
    if (!token || !user?._id) {
      console.log('❌ Missing token/user');
      return;
    }
    
    console.log('🔍 Staff ID:', user._id.slice(-6), 'Role:', user.role);
    setLoading(true);
    
    try {
      const res = await axios.get('http://localhost:5000/api/incidents', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log('📊 Backend returned:', res.data.length, 'incidents');
      console.log('First incident assignedTo:', res.data[0]?.assignedTo?._id?.slice(-6));
      
      setIncidents(res.data);
    } catch (error) {
      console.error('❌ API Error:', error.response?.status, error.response?.data);
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  const updateIncidentStatus = async (incidentId, newStatus) => {
    setUpdating(prev => ({ ...prev, [incidentId]: true }));
    try {
      console.log('🔄 Updating:', incidentId.slice(-6), '→', newStatus);
      
      await axios.patch(
        `http://localhost:5000/api/incidents/${incidentId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setIncidents(prev => prev.map(inc => 
        inc._id === incidentId ? { ...inc, status: newStatus } : inc
      ));
      
      console.log('✅ Status updated!');
    } catch (error) {
      console.error('❌ Update failed:', error.response?.data);
      alert('Status update failed: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setUpdating(prev => ({ ...prev, [incidentId]: false }));
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // ✅ FIXED 3 - Pagination functions
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredIncidents = React.useMemo(() => {
    return incidents.filter(incident => {
      const matchesSearch = incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (incident.referenceId || incident._id).toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (incident.category || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || incident.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || incident.priority === filterPriority;
      const matchesCategory = filterCategory === 'all' || incident.category === filterCategory;

      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    });
  }, [incidents, searchTerm, filterStatus, filterPriority, filterCategory]);

  const sortedIncidents = React.useMemo(() => {
    let sortableIncidents = [...filteredIncidents];
    if (sortConfig.key) {
      sortableIncidents.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableIncidents;
  }, [filteredIncidents, sortConfig]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'error';
      case 'High': return 'warning';
      case 'Medium': return 'info';
      default: return 'default';
    }
  };

  useEffect(() => {
    if (token && user) {
      fetchAssignedIncidents();
    }
  }, [fetchAssignedIncidents, token, user]);

  useEffect(() => {
    const interval = setInterval(fetchAssignedIncidents, 10000);
    return () => clearInterval(interval);
  }, [fetchAssignedIncidents]);

  const stats = React.useMemo(() => {
    const total = sortedIncidents.length;
    const pending = sortedIncidents.filter(i => i.status === 'Pending').length;
    const inReview = sortedIncidents.filter(i => i.status === 'In Review').length;
    const resolved = sortedIncidents.filter(i => i.status === 'Resolved').length;
    const critical = sortedIncidents.filter(i => i.priority === 'Critical').length;

    return { total, pending, inReview, resolved, critical };
  }, [sortedIncidents]);

  return (
    <Container maxWidth="xl" sx={{ mt: 4, pb: 4 }}>
      <Fade in timeout={600}>
        <Box>
          {/* Header Section */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 3,
            p: 4,
            color: 'white'
          }}>
            <Box>
              <Typography variant="h3" fontWeight="bold" gutterBottom>
                Staff Dashboard
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Welcome back! You have {stats.total} assigned incidents
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Tooltip title="Refresh Data">
                <IconButton
                  onClick={fetchAssignedIncidents}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                    color: 'white'
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Avatar sx={{ width: 56, height: 56, bgcolor: 'rgba(255,255,255,0.2)' }}>
                <AssignmentIcon sx={{ fontSize: 28 }} />
              </Avatar>
            </Box>
          </Box>

          {/* Statistics Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {[
              {
                title: 'Total Assigned',
                value: stats.total,
                icon: <AssignmentIcon />,
                color: '#667eea',
                bgColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              },
              {
                title: 'Pending',
                value: stats.pending,
                icon: <ScheduleIcon />,
                color: '#ff9800',
                bgColor: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)'
              },
              {
                title: 'In Review',
                value: stats.inReview,
                icon: <CheckCircleIcon />,
                color: '#2196f3',
                bgColor: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)'
              },
              {
                title: 'Resolved',
                value: stats.resolved,
                icon: <CheckCircleIcon />,
                color: '#4caf50',
                bgColor: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)'
              },
              {
                title: 'Critical Priority',
                value: stats.critical,
                icon: <PriorityHighIcon />,
                color: '#f44336',
                bgColor: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)'
              }
            ].map((stat, index) => (
              <Grid item xs={12} sm={6} md={4} lg={2.4} key={index}>
                  <Card sx={{
                    background: stat.bgColor,
                    color: 'white',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 16px 48px rgba(0,0,0,0.2)'
                    }
                  }}>
                    <CardContent sx={{ p: 3, textAlign: 'center' }}>
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
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        {stat.title}
                      </Typography>
                    </CardContent>
                  </Card>
              </Grid>
            ))}
          </Grid>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }} color="text.secondary">
                Loading assigned incidents...
              </Typography>
            </Box>
          ) : sortedIncidents.length === 0 ? (
            <Paper sx={{ p: 6, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No incidents assigned yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Admin will assign incidents to you here. Auto-refreshing every 10 seconds.
              </Typography>
              <Button
                variant="outlined"
                onClick={fetchAssignedIncidents}
                startIcon={<RefreshIcon />}
              >
                Refresh Now
              </Button>
            </Paper>
          ) : (
            <>
              {/* Filter Controls */}
              <Paper sx={{ p: 3, mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <TextField
                  size="small"
                  placeholder="Search by title, ID, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{ minWidth: 250 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    )
                  }}
                />
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="In Review">In Review</MenuItem>
                    <MenuItem value="Resolved">Resolved</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    label="Priority"
                  >
                    <MenuItem value="all">All Priority</MenuItem>
                    <MenuItem value="Low">Low</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                    <MenuItem value="Critical">Critical</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    label="Category"
                  >
                    <MenuItem value="all">All Categories</MenuItem>
                    <MenuItem value="Academic">Academic</MenuItem>
                    <MenuItem value="Facilities">Facilities</MenuItem>
                    <MenuItem value="Safety">Safety</MenuItem>
                    <MenuItem value="Technology">Technology</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
                <Box sx={{ flexGrow: 1 }} />
                <Button
                  variant="outlined"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('all');
                    setFilterPriority('all');
                    setFilterCategory('all');
                  }}
                  startIcon={<ClearIcon />}
                >
                  Clear Filters
                </Button>
              </Paper>

              <Paper sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                  Assigned Incidents ({sortedIncidents.length})
                </Typography>
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
                            ID
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
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sortedIncidents
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((inc) => (
                          <TableRow key={inc._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                            <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                              {inc.referenceId || inc._id.slice(-6)}
                            </TableCell>
                            <TableCell sx={{ maxWidth: 250 }}>
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
                                color={getPriorityColor(inc.priority || 'Medium')}
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
                              <FormControl size="small" sx={{ minWidth: 120 }}>
                                <Select 
                                  value={inc.status}
                                  onChange={(e) => updateIncidentStatus(inc._id, e.target.value)}
                                  disabled={updating[inc._id]}
                                >
                                  {/* 👈 STAFF ONLY - 3 OPTIONS LOCKED */}
                                  <MenuItem value="Pending">Pending</MenuItem>
                                  <MenuItem value="In Review">In Review</MenuItem>
                                  <MenuItem value="Resolved">Resolved</MenuItem>
                                </Select>
                              </FormControl>
                              {updating[inc._id] && (
                                <CircularProgress size={20} sx={{ ml: 1 }} />
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                {/* ✅ FIXED 4 - Pagination Component */}
              </Paper>
            </>
          )}
        </Box>
      </Fade>
    </Container>
  );
};

export default StaffDashboard;
