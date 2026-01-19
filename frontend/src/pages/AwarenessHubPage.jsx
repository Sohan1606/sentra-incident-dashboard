import { CircularProgress, Button } from '@mui/material';
import React, { useEffect, useState, useCallback } from 'react';
import {
  Container, Grid, Paper, Typography, Chip, Link, Box, Fade,
  IconButton, Card, CardContent, Avatar, Tooltip, Zoom
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import axios from 'axios';

const typeColor = (type) => {
  if (type === 'policy') return 'info';
  if (type === 'helpline') return 'success';
  if (type === 'tip') return 'warning';
  return 'default';
};

const AwarenessHubPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAwareness = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/awareness');
      setItems(res.data);
    } catch (error) {
      console.error('Error fetching awareness', error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAwareness();
  }, [fetchAwareness]);

  // 30s auto-refresh
  useEffect(() => {
    const interval = setInterval(fetchAwareness, 30000);
    return () => clearInterval(interval);
  }, [fetchAwareness]);

  const stats = {
    total: items.length,
    policies: items.filter(i => i.type === 'policy').length,
    helplines: items.filter(i => i.type === 'helpline').length,
    tips: items.filter(i => i.type === 'tip').length
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
            background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
            borderRadius: 3,
            p: 4,
            color: 'white'
          }}>
            <Box>
              <Typography variant="h3" fontWeight="bold" gutterBottom>
                Awareness Hub
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                {stats.total} resources • Policies, helplines, safety tips
              </Typography>
            </Box>
            <Tooltip title="Refresh">
              <IconButton
                onClick={fetchAwareness}
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Paper>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 6 }}>
            {[
              { title: 'Total Resources', value: stats.total, icon: '📚', color: '#8b5cf6' },
              { title: 'Campus Policies', value: stats.policies, icon: '📜', color: '#3b82f6' },
              { title: 'Helplines', value: stats.helplines, icon: '📞', color: '#10b981' },
              { title: 'Safety Tips', value: stats.tips, icon: '💡', color: '#f59e0b' }
            ].map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Zoom in timeout={600 + index * 100}>
                  <Paper sx={{
                    background: `linear-gradient(135deg, ${stat.color}22 0%, ${stat.color}44 100%)`,
                    p: 3, textAlign: 'center', borderRadius: 3,
                    border: `1px solid ${stat.color}33`,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}>
                    <Avatar sx={{ 
                      mx: 'auto', 
                      mb: 2, 
                      bgcolor: stat.color + '66',
                      width: 56,
                      height: 56,
                      fontSize: '1.5rem'
                    }}>
                      {stat.icon}
                    </Avatar>
                    <Typography variant="h4" fontWeight="bold" color={stat.color} gutterBottom>
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

          {/* Awareness Items */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
              Campus Resources ({items.length})
            </Typography>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }} color="text.secondary">
                  Loading awareness resources...
                </Typography>
              </Box>
            ) : items.length === 0 ? (
              <Paper sx={{ p: 6, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No resources available
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Check back later for campus policies and helplines
                </Typography>
                <Button variant="outlined" onClick={fetchAwareness} startIcon={<RefreshIcon />}>
                  Refresh
                </Button>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {items.map((item, index) => (
                  <Grid item xs={12} md={6} lg={4} key={item._id}>
                    <Zoom in timeout={600 + index * 100}>
                      <Card sx={{
                        height: '100%',
                        borderRadius: 3,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        border: '1px solid rgba(139, 92, 246, 0.1)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                        }
                      }}>
                        <CardContent sx={{ p: 3 }}>
                          <Chip
                            label={item.type?.toUpperCase() || 'INFO'}
                            color={typeColor(item.type)}
                            size="small"
                            sx={{ mb: 2 }}
                          />
                          <Typography variant="h6" fontWeight={600} gutterBottom>
                            {item.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                            {item.content}
                          </Typography>
                          {item.link && (
                            <Link 
                              href={item.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              underline="hover"
                              sx={{ 
                                fontWeight: 500,
                                color: 'primary.main',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 0.5
                              }}
                            >
                              Learn more →
                            </Link>
                          )}
                        </CardContent>
                      </Card>
                    </Zoom>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Box>
      </Fade>
    </Container>
  );
};

export default AwarenessHubPage;
