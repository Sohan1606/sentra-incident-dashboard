import React, { useEffect, useState, useCallback } from 'react';
import {
  Container, Grid, Paper, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, TextField, Dialog,
  DialogTitle, DialogContent, DialogActions, MenuItem, FormControl,
  InputLabel, Select, Chip, CircularProgress, Alert, IconButton,
  Box, Divider, useTheme, useMediaQuery, Fade, Zoom, Card, CardContent,
  Avatar, Tooltip, Badge
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Report as ReportIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // States
  const [stats, setStats] = useState({ total: 0, pending: 0, inReview: 0, resolved: 0, escalated: 0 });
  const [incidents, setIncidents] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [incidentStaffMap, setIncidentStaffMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [staffDialog, setStaffDialog] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', email: '' });
  const [staffLoading, setStaffLoading] = useState(false);

  // ✅ FIXED 1: Real API endpoints + proper error handling
  const fetchStaff = useCallback(async () => {
    if (!token) return;
    setStaffLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/users?role=staff', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStaffList(res.data);
    } catch (error) {
      console.error('❌ Staff fetch failed:', error.response?.data || error.message);
    } finally {
      setStaffLoading(false);
    }
  }, [token]);

  const fetchIncidents = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/incidents', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIncidents(res.data);
      
      // ✅ FIXED 2: Complete stats calculation
      const total = res.data.length;
      setStats({
        total,
        pending: res.data.filter(i => i.status === 'Pending').length,
        inReview: res.data.filter(i => i.status === 'In Review').length,
        resolved: res.data.filter(i => i.status === 'Resolved').length,
        escalated: res.data.filter(i => i.status === 'Escalated').length,
      });
    } catch (error) {
      console.error('❌ Incidents fetch failed:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Initial load + 15s auto-refresh
  useEffect(() => {
    if (token) {
      fetchStaff();
      fetchIncidents();
    }
  }, [token, fetchStaff, fetchIncidents]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchIncidents();
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchIncidents]);

  // ✅ FIXED 3: Proper filtering
  const filteredIncidents = React.useMemo(() => {
    return incidents
      .filter(incident => 
        incident.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (filterStatus === 'all' || incident.status === filterStatus)
      )
      .slice(0, 15);
  }, [incidents, searchTerm, filterStatus]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved': return 'success';
      case 'In Review': return 'info';
      case 'Pending': return 'warning';
      case 'Escalated': return 'error';
      default: return 'default';
    }
  };

  // ✅ FIXED 4: Real backend assignment (no fake staff)
  const assignIncident = async (incidentId) => {
    const selectedStaffId = incidentStaffMap[incidentId];
    if (!selectedStaffId) {
      alert('Please select staff first');
      return;
    }

    const selectedStaff = staffList.find(s => s._id === selectedStaffId);
    if (!selectedStaff) {
      alert('Selected staff not found');
      return;
    }

    try {
      await axios.patch(`http://localhost:5000/api/incidents/${incidentId}/assign`, {
        assignedTo: selectedStaffId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Clear selection and refresh
      setIncidentStaffMap(prev => {
        const newMap = { ...prev };
        delete newMap[incidentId];
        return newMap;
      });
      
      fetchIncidents();
      console.log(`✅ Assigned INC-${incidentId.slice(-6)} → ${selectedStaff.name}`);
    } catch (error) {
      console.error('❌ Assignment failed:', error.response?.data || error.message);
      alert('Assignment failed: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  const handleStaffSelect = (incidentId, staffId) => {
    setIncidentStaffMap(prev => ({
      ...prev,
      [incidentId]: staffId
    }));
  };

  // ✅ FIXED 5: Backend staff management
  const addStaffMember = async () => {
    if (!newStaff.name.trim() || !newStaff.email.trim()) {
      alert('Please fill name and email');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/users', {
        name: newStaff.name.trim(),
        email: newStaff.email.trim(),
        role: 'staff',
        password: 'staff123' // Default password - change in production
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNewStaff({ name: '', email: '' });
      setStaffDialog(false);
      fetchStaff(); // Refresh staff list
      console.log('✅ Staff member added');
    } catch (error) {
      console.error('❌ Add staff failed:', error.response?.data || error.message);
      alert('Failed to add staff: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  const deleteStaffMember = async (staffId) => {
    if (staffList.length <= 2) {
      alert('❌ Keep at least 2 staff members');
      return;
    }

    const isAssigned = incidents.some(i => i.assignedTo?._id === staffId || i.assignedTo === staffId);
    if (isAssigned) {
      alert('❌ Cannot delete staff assigned to incidents');
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/users/${staffId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchStaff();
      console.log('✅ Staff member deleted');
    } catch (error) {
      console.error('❌ Delete staff failed:', error.response?.data || error.message);
      alert('Failed to delete staff');
    }
  };

  const staffStats = React.useMemo(() => {
    const activeStaff = staffList.length;
    const assignedIncidents = incidents.filter(i => i.assignedTo).length;
    const unassignedIncidents = incidents.filter(i => !i.assignedTo).length;
    const resolutionRate = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;
    return { activeStaff, assignedIncidents, unassignedIncidents, resolutionRate };
  }, [staffList, incidents, stats]);

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
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            borderRadius: 3,
            p: 4,
            color: 'white'
          }}>
            <Box>
              <Typography variant="h3" fontWeight="bold" gutterBottom>
                Admin Dashboard
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                {staffStats.activeStaff} staff • {stats.total} incidents • {staffStats.resolutionRate}% resolved
              </Typography>
            </Box>
            <IconButton onClick={fetchIncidents} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}>
              <RefreshIcon />
            </IconButton>
          </Paper>

          {/* Stats Grid */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {[
              { title: 'Total', value: stats.total, icon: <ReportIcon />, color: '#1e3c72', subtitle: 'All incidents' },
              { title: 'Pending', value: stats.pending, icon: <AssignmentIcon />, color: '#ff9800', subtitle: 'Awaiting review' },
              { title: 'In Review', value: stats.inReview, icon: <TrendingUpIcon />, color: '#2196f3', subtitle: 'Being processed' },
              { title: 'Resolved', value: stats.resolved, icon: <CheckCircleIcon />, color: '#4caf50', subtitle: `${staffStats.resolutionRate}% rate` },
              { title: 'Staff', value: staffStats.activeStaff, icon: <PeopleIcon />, color: '#9c27b0', subtitle: 'Active members' },
              { title: 'Unassigned', value: staffStats.unassignedIncidents, icon: <AssignmentIcon />, color: '#f44336', subtitle: 'Need assignment' }
            ].map((stat, index) => (
              <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
                <Zoom in timeout={600 + index * 100}>
                  <Card sx={{
                    background: `linear-gradient(135deg, ${stat.color}22 0%, ${stat.color}44 100%)`,
                    borderRadius: 3,
                    height: '100%',
                    '&:hover': { transform: 'translateY(-4px)' }
                  }}>
                    <CardContent sx={{ p: 3, textAlign: 'center' }}>
                      <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: stat.color + '66' }}>
                        {stat.icon}
                      </Avatar>
                      <Typography variant="h4" fontWeight="bold" color={stat.color}>
                        {loading ? <CircularProgress size={24} color="inherit" /> : stat.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">{stat.subtitle}</Typography>
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>
            ))}
          </Grid>

          {/* Controls */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'end' }}>
              <TextField
                size="small"
                placeholder="Search incidents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ minWidth: 250 }}
              />
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Status</InputLabel>
                <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} label="Status">
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="In Review">In Review</MenuItem>
                  <MenuItem value="Resolved">Resolved</MenuItem>
                  <MenuItem value="Escalated">Escalated</MenuItem>
                </Select>
              </FormControl>
              <Box sx={{ flexGrow: 1 }} />
              <Button 
                variant="contained" 
                startIcon={<PersonAddIcon />}
                onClick={() => setStaffDialog(true)}
              >
                Add Staff ({staffList.length})
              </Button>
            </Box>
          </Paper>

          {/* Staff Management */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>Staff ({staffList.length})</Typography>
            <Grid container spacing={2}>
              {staffList.map((staff, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={staff._id}>
                  <Card sx={{ '&:hover': { transform: 'translateY(-4px)' } }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar>{staff.name.charAt(0).toUpperCase()}</Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle1" fontWeight="bold">{staff.name}</Typography>
                          <Typography variant="body2" color="text.secondary">{staff.email}</Typography>
                        </Box>
                        <IconButton 
                          color="error" 
                          onClick={() => deleteStaffMember(staff._id)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Recent Incidents */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Recent Incidents ({filteredIncidents.length})</Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer sx={{ maxHeight: 600 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Title</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Assigned</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredIncidents.map((incident) => (
                      <TableRow key={incident._id} hover>
                        <TableCell sx={{ fontFamily: 'monospace' }}>
                          {incident.referenceId || incident._id.slice(-6)}
                        </TableCell>
                        <TableCell sx={{ maxWidth: 250 }}>
                          <Typography variant="body2" noWrap title={incident.title}>
                            {incident.title}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={incident.status} color={getStatusColor(incident.status)} size="small" />
                        </TableCell>
                        <TableCell>
                          {incident.assignedTo?.name || incident.assignedTo?.email || 'Unassigned'}
                        </TableCell>
                        <TableCell>
                          <FormControl size="small" sx={{ minWidth: 120, mr: 1 }}>
                            <Select 
                              value={incidentStaffMap[incident._id] || ''} 
                              onChange={(e) => handleStaffSelect(incident._id, e.target.value)}
                            >
                              <MenuItem value="">Unassign</MenuItem>
                              {staffList.map((staff) => (
                                <MenuItem key={staff._id} value={staff._id}>
                                  {staff.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <Button 
                            size="small" 
                            variant="contained" 
                            onClick={() => assignIncident(incident._id)} 
                            disabled={!incidentStaffMap[incident._id]}
                          >
                            Assign
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>

          {/* Add Staff Dialog */}
          <Dialog open={staffDialog} onClose={() => setStaffDialog(false)} maxWidth="sm">
            <DialogTitle>Add Staff Member</DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
              <TextField 
                fullWidth label="Name" 
                value={newStaff.name} 
                onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
              />
              <TextField 
                fullWidth label="Email" 
                type="email"
                sx={{ mt: 2 }}
                value={newStaff.email} 
                onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setStaffDialog(false)}>Cancel</Button>
              <Button variant="contained" onClick={addStaffMember}>Add Staff</Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Fade>
    </Container>
  );
};

export default AdminDashboard;
