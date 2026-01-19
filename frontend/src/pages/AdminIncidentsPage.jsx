import React, { useEffect, useState, useCallback } from 'react';
import {
  Container, Paper, Typography, Table, TableHead, TableRow, TableCell,
  TableBody, Chip, TextField, MenuItem, Box, Button, TableContainer,
  IconButton, Fade, CircularProgress, Tooltip, Zoom, Grid, Card, CardContent, Avatar
} from '@mui/material';
import {
  Refresh as RefreshIcon, FilterList as FilterIcon, Clear as ClearIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const statusOptions = ['Pending', 'In Review', 'Resolved', 'Escalated', 'Closed'];
const priorityOptions = ['Low', 'Medium', 'High', 'Critical'];
const categoryOptions = ['Bullying', 'Harassment', 'Discrimination', 'Safety Hazard', 'Other'];

const statusColor = (status) => {
  if (status === 'Resolved' || status === 'Closed') return 'success';
  if (status === 'In Review') return 'info';
  if (status === 'Escalated') return 'warning';
  return 'default';
};

const AdminIncidentsPage = () => {
  const { token } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [staffUsers, setStaffUsers] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState({});
  const [filters, setFilters] = useState({ status: '', priority: '', category: '' });
  const [loading, setLoading] = useState(false);

  // ✅ FIXED 1: Fetch real staff users from API
  const fetchStaffUsers = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/users?role=staff', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStaffUsers(res.data);
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  }, [token]);

  const fetchIncidents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters);
      const res = await axios.get(`http://localhost:5000/api/incidents?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIncidents(res.data);
    } catch (error) {
      console.error('Error fetching incidents', error);
    } finally {
      setLoading(false);
    }
  }, [token, filters]);

  useEffect(() => {
    if (token) {
      fetchStaffUsers();
      fetchIncidents();
    }
  }, [token, fetchStaffUsers, fetchIncidents]);

  // 15s auto-refresh
  useEffect(() => {
    const interval = setInterval(fetchIncidents, 15000);
    return () => clearInterval(interval);
  }, [fetchIncidents]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ status: '', priority: '', category: '' });
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`http://localhost:5000/api/incidents/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchIncidents();
    } catch (error) {
      console.error('Error updating status', error);
    }
  };

  const assignIncident = async (incidentId) => {
    try {
      const staffId = selectedStaff[incidentId];
      if (!staffId) return;
      
      await axios.patch(`http://localhost:5000/api/incidents/${incidentId}/assign`, { assignedTo: staffId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedStaff(prev => ({ ...prev, [incidentId]: '' }));
      fetchIncidents();
    } catch (error) {
      console.error('Error assigning incident', error);
    }
  };

  const stats = {
    total: incidents.length,
    pending: incidents.filter(i => i.status === 'Pending').length,
    assigned: incidents.filter(i => i.assignedTo).length
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, pb: 4 }}>
      <Fade in timeout={600}>
        <Box>
          {/* Premium Header */}
          <Paper sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            borderRadius: 3,
            p: 4,
            color: 'white'
          }}>
            <Box>
              <Typography variant="h3" fontWeight="bold" gutterBottom>
                Incident Management
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                {stats.total} incidents • {stats.pending} pending • {stats.assigned} assigned
              </Typography>
            </Box>
            <Tooltip title="Refresh">
              <IconButton onClick={fetchIncidents} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Paper>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {[
              { title: 'Total Incidents', value: stats.total, color: '#ef4444' },
              { title: 'Pending', value: stats.pending, color: '#f59e0b' },
              { title: 'Assigned', value: stats.assigned, color: '#10b981' },
              { title: 'Staff Available', value: staffUsers.length, color: '#3b82f6' }
            ].map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Zoom in timeout={600 + index * 100}>
                  <Paper sx={{
                    background: `linear-gradient(135deg, ${stat.color}22 0%, ${stat.color}44 100%)`,
                    p: 3, textAlign: 'center', borderRadius: 3,
                    border: `1px solid ${stat.color}33`
                  }}>
                    <Typography variant="h4" fontWeight="bold" color={stat.color}>
                      {loading ? <CircularProgress size={24} /> : stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Paper>
                </Zoom>
              </Grid>
            ))}
          </Grid>

          {/* Filters */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'end' }}>
              <TextField
                select
                label="Status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                size="small"
                sx={{ minWidth: 140 }}
              >
                <MenuItem value="">All Status</MenuItem>
                {statusOptions.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
              
              <TextField
                select
                label="Priority"
                name="priority"
                value={filters.priority}
                onChange={handleFilterChange}
                size="small"
                sx={{ minWidth: 140 }}
              >
                <MenuItem value="">All Priority</MenuItem>
                {priorityOptions.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </TextField>
              
              <TextField
                select
                label="Category"
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                size="small"
                sx={{ minWidth: 140 }}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categoryOptions.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </TextField>
              
              <Box sx={{ flexGrow: 1 }} />
              <Button variant="contained" onClick={fetchIncidents} startIcon={<RefreshIcon />}>
                Apply Filters
              </Button>
              <Button variant="outlined" onClick={clearFilters} startIcon={<ClearIcon />}>
                Clear
              </Button>
            </Box>
          </Paper>

          {/* Incidents Table */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
              All Incidents ({incidents.length})
            </Typography>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading incidents...</Typography>
              </Box>
            ) : incidents.length === 0 ? (
              <Paper sx={{ p: 6, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  No incidents found
                </Typography>
              </Paper>
            ) : (
              <TableContainer sx={{ maxHeight: 600 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Title</TableCell>
                      <TableCell>Reporter</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Assigned</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {incidents.map((inc) => (
                      <TableRow key={inc._id} hover>
                        <TableCell sx={{ fontFamily: 'monospace' }}>
                          {inc.referenceId || inc._id.slice(-6)}
                        </TableCell>
                        <TableCell sx={{ maxWidth: 250 }}>
                          <Typography variant="body2" noWrap title={inc.title}>
                            {inc.title}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {inc.isAnonymous || !inc.reporter ? 'Anonymous' : inc.reporter.email}
                        </TableCell>
                        <TableCell>
                          <Chip label={inc.category || 'General'} size="small" />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={inc.priority || 'Medium'} 
                            color={statusColor(inc.priority === 'Critical' ? 'warning' : 'default')}
                            size="small" 
                          />
                        </TableCell>
                        <TableCell>
                          <Chip label={inc.status} color={statusColor(inc.status)} size="small" />
                        </TableCell>
                        <TableCell>
                          {inc.assignedTo ? inc.assignedTo.name || inc.assignedTo.email : 'Unassigned'}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => updateStatus(inc._id, 'Pending')}
                            >
                              Pending
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => updateStatus(inc._id, 'In Review')}
                            >
                              In Review
                            </Button>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={() => updateStatus(inc._id, 'Resolved')}
                            >
                              Resolve
                            </Button>
                            <TextField
                              select
                              size="small"
                              sx={{ minWidth: 120 }}
                              value={selectedStaff[inc._id] || ''}
                              onChange={(e) => setSelectedStaff(prev => ({
                                ...prev,
                                [inc._id]: e.target.value
                              }))}
                            >
                              <MenuItem value="">Unassign</MenuItem>
                              {staffUsers.map(staff => (
                                <MenuItem key={staff._id} value={staff._id}>
                                  {staff.name}
                                </MenuItem>
                              ))}
                            </TextField>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => assignIncident(inc._id)}
                              disabled={!selectedStaff[inc._id]}
                            >
                              Assign
                            </Button>
                          </Box>
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

export default AdminIncidentsPage;
