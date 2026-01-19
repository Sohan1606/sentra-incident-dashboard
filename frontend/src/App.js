import React, { useState, useEffect, useMemo, useCallback } from 'react';

function App() {
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [usersDB, setUsersDB] = useState({});
  const [incidents, setIncidents] = useState([]);
  const [newIncident, setNewIncident] = useState({title:'', priority:'medium', description:''});

  const API_BASE = 'https://sentra-6zqa.onrender.com/api';

  // LOAD INCIDENTS FROM BACKEND
  useEffect(() => {
    fetch(`${API_BASE}/incidents`)
      .then(res => res.json())
      .then(setIncidents)
      .catch(err => console.log('Backend loading...'));
  }, []);

  // USERS STILL LOCAL (admin creates users locally)
  useEffect(() => {
    const savedUsers = localStorage.getItem('sentraUsers');
    if (savedUsers) setUsersDB(JSON.parse(savedUsers));
  }, []);

  useEffect(() => {
    localStorage.setItem('sentraUsers', JSON.stringify(usersDB));
  }, [usersDB]);

  const defaultUsers = {
    'admin@test.com': { password: '123456', role: 'admin' },
    'staff@test.com': { password: '123456', role: 'staff' },
    'student@test.com': { password: '123456', role: 'student' }
  };

  const currentUsersDB = useMemo(() => ({ ...defaultUsers, ...usersDB }), [usersDB]);

  const handleLogin = (e) => {
    e.preventDefault();
    const user = currentUsersDB[email];
    if(user && user.password === password) {

      setRole(user.role);
      setEmail(email);
    } else {
      alert(`Invalid credentials!\n\nDefault accounts:\nadmin@test.com/123456\nstaff@test.com/123456\nstudent@test.com/123456`);
    }
  };

  // BACKEND: REPORT INCIDENT
  const reportIncident = useCallback(() => {
    if (!newIncident.title.trim()) {
      alert('Please enter incident title');
      return;
    }
    const incident = {
      title: newIncident.title,
      description: newIncident.description,
      priority: newIncident.priority,
      status: 'pending',
      reportedBy: email,
      timestamp: new Date().toLocaleString()
    };
    
    fetch(`${API_BASE}/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(incident)
    })
    .then(res => res.json())
    .then(newIncident => setIncidents([newIncident, ...incidents]))
    .catch(err => console.log('Save failed, using local'));
    
    setNewIncident({title:'', priority:'medium', description:''});
  }, [newIncident, email, incidents]);

  // BACKEND: ASSIGN INCIDENT
  const assignIncident = useCallback((id, assignedStaff = null) => {
    const staffMembers = Object.entries(currentUsersDB)
      .filter(([_, data]) => data.role === 'staff')
      .map(([email]) => email);
    
    const assignment = assignedStaff || (staffMembers.length > 0 ? staffMembers[0] : email);
    
    fetch(`${API_BASE}/incidents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'assigned', assignedTo: assignment, assignedBy: email })
    })
    .then(res => res.json())
    .then(updatedIncident => {
      setIncidents(incidents.map(inc => inc.id === id ? updatedIncident : inc));
    })
    .catch(err => console.log('Update failed'));
  }, [currentUsersDB, email, incidents]);

  // BACKEND: RESOLVE INCIDENT
  const resolveIncident = useCallback((id) => {
    fetch(`${API_BASE}/incidents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'resolved', resolvedBy: email, resolvedAt: new Date().toLocaleString() })
    })
    .then(res => res.json())
    .then(updatedIncident => {
      setIncidents(incidents.map(inc => inc.id === id ? updatedIncident : inc));
    })
    .catch(err => console.log('Resolve failed'));
  }, [email, incidents]);

  // LOGIN SCREEN
      if(!role) {

    return (
      <div style={{ 
        padding: '40px', minHeight: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
      }}>
        <h1 style={{ color: 'white', textAlign: 'center', fontSize: '2.5rem', marginBottom: '20px' }}>
          🔥 SENTRA INCIDENT SYSTEM
        </h1>
        <div style={{ 
          maxWidth: '400px', width: '100%', padding: '40px', 
          background: 'rgba(255,255,255,0.95)', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ textAlign: 'center', color: '#1e40af', marginBottom: '30px' }}>
            🔐 SECURE LOGIN
          </h2>
          <form onSubmit={handleLogin}>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              style={{ 
                width:'100%', padding:'15px', margin:'10px 0', borderRadius:'10px', 
                border:'2px solid #e5e7eb', fontSize: '16px', boxSizing: 'border-box'
              }}
              placeholder="admin@test.com" 
              required
            />
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              style={{ 
                width:'100%', padding:'15px', margin:'10px 0', borderRadius:'10px', 
                border:'2px solid #e5e7eb', fontSize: '16px', boxSizing: 'border-box'
              }}
              placeholder="123456" 
              required
            />
            <button type="submit" style={{
              width: '100%', padding: '18px', background: '#10b981', color: 'white',
              border: 'none', borderRadius: '12px', fontSize: '18px', cursor: 'pointer', 
              fontWeight: 'bold', marginTop: '10px'
            }}>
              🚀 ENTER SECURE DASHBOARD
            </button>
          </form>
          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: '#6b7280' }}>
            Default accounts:<br/>
            admin@test.com / 123456<br/>
            staff@test.com / 123456<br/>
            student@test.com / 123456
          </div>
        </div>
      </div>
    );
  }

  // DASHBOARD (REST OF YOUR CODE REMAINS IDENTICAL)
  return (
    <div style={{ padding: '20px', background: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ color: '#1e40af', margin: 0 }}>
            🎯 SENTRA DASHBOARD - <span style={{ color: '#059669' }}>{role.toUpperCase()}</span>
          </h1>
          <button onClick={() => { 
            setRole(''); setEmail(''); setPassword(''); 
          }} style={{
            background: '#ef4444', color: 'white', border: 'none', padding: '12px 24px',
            borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
          }}>
            🔐 Logout
          </button>
        </div>
        <p style={{ color: '#6b7280', margin: '10px 0 0 0' }}>Logged in as: <strong>{email}</strong></p>
      </div>

      {/* ADMIN PANEL */}
      {role === 'admin' && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h2 style={{ color: '#8b5cf6' }}>👑 ADMIN - USER MANAGEMENT</h2>
          <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '300px' }}>
              <h3 style={{ color: '#059669' }}>➕ Add Staff</h3>
              <input id="staffEmail" placeholder="staff2@school.com" style={{width:'100%',padding:'12px',marginBottom:'10px',borderRadius:'8px',border:'1px solid #d1d5db'}} />
              <button onClick={() => {
                const emailInput = document.getElementById('staffEmail').value.trim();
  if(emailInput && !currentUsersDB[emailInput]) {

                  setUsersDB({...currentUsersDB, [emailInput]: { password: '123456', role: 'staff' }});
                  document.getElementById('staffEmail').value = '';
                  alert(`✅ Staff created: ${emailInput}\nLogin: ${emailInput}/123456`);
                } else if (currentUsersDB[emailInput]) {
                  alert('❌ User already exists!');
                }
              }} style={{ padding: '12px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', width: '100%' }}>
                ➕ Create Staff
              </button>
            </div>
            <div style={{ flex: 1, minWidth: '300px' }}>
              <h3 style={{ color: '#f59e0b' }}>➕ Add Student</h3>
              <input id="studentEmail" placeholder="student2@school.com" style={{width:'100%',padding:'12px',marginBottom:'10px',borderRadius:'8px',border:'1px solid #d1d5db'}} />
              <button onClick={() => {
                const emailInput = document.getElementById('studentEmail').value.trim();
    if(emailInput && !currentUsersDB[emailInput]) {

                  setUsersDB({...currentUsersDB, [emailInput]: { password: '123456', role: 'student' }});
                  document.getElementById('studentEmail').value = '';
                  alert(`✅ Student created: ${emailInput}\nLogin: ${emailInput}/123456`);
                } else if (currentUsersDB[emailInput]) {
                  alert('❌ User already exists!');
                }
              }} style={{ padding: '12px 20px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', width: '100%' }}>
                ➕ Create Student
              </button>
            </div>
          </div>
          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px' }}>
            <h4 style={{ margin: '0 0 15px 0', color: '#374151' }}>📋 Active Users ({Object.keys(currentUsersDB).length})</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {Object.entries(currentUsersDB).map(([userEmail, data]) => (
                <span key={userEmail} style={{
                  background: data.role === 'admin' ? '#e0e7ff' : data.role === 'staff' ? '#d1fae5' : '#fef3c7',
                  color: data.role === 'admin' ? '#3730a3' : data.role === 'staff' ? '#065f46' : '#92400e',
                  padding: '8px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: '500'
                }}>
                  {userEmail.slice(0,20)}{userEmail.length > 20 ? '...' : ''} <strong>{data.role}</strong>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STUDENT PANEL */}
      {role === 'student' && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h2 style={{ color: '#f59e0b', marginBottom: '20px' }}>🎓 Report New Incident</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input 
              type="text" 
              value={newIncident.title} 
              onChange={(e) => setNewIncident({...newIncident, title: e.target.value})}
              placeholder="e.g. Broken projector in Lab 101" 
              style={{ padding: '15px', borderRadius: '10px', border: '2px solid #e5e7eb', fontSize: '16px' }} 
            />
            <select 
              value={newIncident.priority} 
              onChange={(e) => setNewIncident({...newIncident, priority: e.target.value})}
              style={{ padding: '15px', borderRadius: '10px', border: '2px solid #e5e7eb', fontSize: '16px' }}
            >
              <option value="low">🟢 Low Priority</option>
              <option value="medium">🟡 Medium Priority</option>
              <option value="high">🔴 High Priority</option>
            </select>
            <textarea 
              value={newIncident.description} 
              onChange={(e) => setNewIncident({...newIncident, description: e.target.value})}
              placeholder="Describe the issue in detail..." 
              rows="4"
              style={{ padding: '15px', borderRadius: '10px', border: '2px solid #e5e7eb', fontSize: '16px', resize: 'vertical' }}
            />
            <button onClick={reportIncident} style={{
              padding: '18px', background: '#f59e0b', color: 'white', border: 'none',
              borderRadius: '12px', fontSize: '18px', cursor: 'pointer', fontWeight: 'bold'
            }}>
              🚨 SUBMIT INCIDENT REPORT
            </button>
          </div>
        </div>
      )}

      {/* STAFF PANEL */}
      {role === 'staff' && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h2 style={{ color: '#059669' }}>🏢 Staff Incident Management</h2>
          <p style={{ color: '#6b7280' }}>Review, assign, and resolve student-reported incidents</p>
        </div>
      )}

      {/* INCIDENTS TABLE */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <h2 style={{ color: '#dc2626', marginBottom: '20px' }}>🚨 Incident Dashboard ({incidents.length})</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
            <thead>
              <tr style={{ background: '#f3f4f6' }}>
                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>ID</th>
                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Title</th>
                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Status</th>
                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Priority</th>
                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Reported By</th>
                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Time</th>
                {role !== 'student' && <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {incidents.map((incident) => (
                <tr key={incident.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '15px', fontWeight: '500' }}># {incident.id}</td>
                  <td style={{ padding: '15px' }}>{incident.title}</td>
                  <td style={{ padding: '15px' }}>
                    <span style={{ 
                      background: incident.status === 'resolved' ? '#d1fae5' : 
                                   incident.status === 'assigned' ? '#fef3c7' : '#fee2e2',
                      color: incident.status === 'resolved' ? '#065f46' : 
                              incident.status === 'assigned' ? '#92400e' : '#991b1b',
                      padding: '6px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: '600'
                    }}>
                      {incident.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '15px' }}>
                    <span style={{ 
                      background: incident.priority === 'high' ? '#fecaca' : 
                                   incident.priority === 'medium' ? '#fef3c7' : '#d1fae5',
                      color: incident.priority === 'high' ? '#991b1b' : 
                              incident.priority === 'medium' ? '#92400e' : '#065f46',
                      padding: '6px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: '600'
                    }}>
                      {incident.priority.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '15px' }}>{incident.reportedBy}</td>
                  <td style={{ padding: '15px', fontSize: '14px', color: '#6b7280' }}>{incident.timestamp}</td>
                  {role !== 'student' && (
                    <td style={{ padding: '15px' }}>
                      {incident.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <select 
                            id={`staff-${incident.id}`}
                            defaultValue=""
                            style={{ 
                              padding: '6px 12px', borderRadius: '6px', border: '1px solid #d1d5db',
                              fontSize: '14px', minWidth: '150px'
                            }}
                          >
                            <option value="">Select Staff...</option>
                            {Object.entries(currentUsersDB)
                              .filter(([_, data]) => data.role === 'staff')
                              .map(([staffEmail]) => (
                                <option key={staffEmail} value={staffEmail}>
                                  {staffEmail}
                                </option>
                              ))}
                          </select>
                          <button 
                            onClick={() => {
                              const staffEmail = document.getElementById(`staff-${incident.id}`).value;
      if(staffEmail) {

                                assignIncident(incident.id, staffEmail);
                              } else {
                                alert('Please select a staff member');
                              }
                            }}
                            style={{
                              background: '#10b981', color: 'white', border: 'none', padding: '8px 16px',
                              borderRadius: '6px', cursor: 'pointer', fontWeight: '600'
                            }}
                          >
                            Assign ➡️
                          </button>
                        </div>
                      )}
                      {incident.status === 'assigned' && (
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={{ 
                            background: '#dbeafe', color: '#1e40af', padding: '4px 12px', 
                            borderRadius: '20px', fontSize: '14px'
                          }}>
                            👤 {incident.assignedTo}
                          </span>
                          <button 
                            onClick={() => resolveIncident(incident.id)}
                            style={{
                              background: '#3b82f6', color: 'white', border: 'none', padding: '8px 16px',
                              borderRadius: '6px', cursor: 'pointer', fontWeight: '600'
                            }}
                          >
                            ✅ Resolve
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {incidents.length === 0 && (
                <tr>
                  <td colSpan={role !== 'student' ? "7" : "6"} style={{ 
                    padding: '60px', textAlign: 'center', color: '#6b7280', fontStyle: 'italic' 
                  }}>
                    {role === 'student' ? '📝 No incidents yet. Report one above!' : '✅ System ready! Waiting for incidents...'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;
