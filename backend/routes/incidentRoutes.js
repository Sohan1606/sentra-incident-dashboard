const express = require('express');
const Incident = require('../models/Incident');
const User = require('../models/User');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

const generateReferenceId = () => {
  return 'SENTRA-' + Date.now().toString(36).toUpperCase();
};

// Create incident
router.post('/', protect, async (req, res) => {
  try {
    const {
      title, description, category, location, incidentDate, isAnonymous, priority,
    } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const incident = await Incident.create({
      referenceId: generateReferenceId(),
      title, description, category, location, incidentDate,
      isAnonymous: !!isAnonymous,
      reporter: isAnonymous ? null : req.user._id,
      priority: priority || 'Medium',
      status: 'Pending',
      history: [{
        status: 'Pending',
        changedBy: req.user._id,
        note: 'Incident created',
      }],
    });

    return res.status(201).json(incident);
  } catch (error) {
    console.error('Create incident error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
});

// ✅ STUDENT/STAFF: My incidents (reporter + anonymous)
router.get('/my', protect, async (req, res) => {
  try {
    const userIdStr = req.user._id.toString();
    console.log('🔍 MY INCIDENTS -', req.user.role, 'ID:', userIdStr.slice(-6));
    
    const query = {
      $or: [
        { reporter: req.user._id },
        { isAnonymous: true }
      ]
    };
    
    const incidents = await Incident.find(query)
      .sort({ createdAt: -1 })
      .select('-history');
    
    console.log('📊 MY INCIDENTS:', incidents.length, 'found');
    return res.json(incidents);
  } catch (error) {
    console.error('Get my incidents error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
});

// ✅ ADMIN sees ALL, STAFF sees ASSIGNED ONLY
router.get('/', protect, async (req, res) => {
  try {
    const { status, category, priority } = req.query;
    const filter = {};
    
    const userIdStr = req.user._id.toString();
    console.log('🔍', req.user.role, 'ID:', userIdStr.slice(-6));
    
    // 🔥 FIXED: Staff sees ONLY assigned incidents
    if (req.user.role === 'staff') {
      filter.assignedTo = req.user._id;  // 👈 SIMPLE & CORRECT
      console.log('🔍 Staff: Assigned only to', userIdStr.slice(-6));
    }
    
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    console.log('🔍 Filter:', JSON.stringify(filter));
    
    const incidents = await Incident.find(filter)
      .populate('reporter', 'name email role')
      .populate('assignedTo', 'name email role')
      .sort({ createdAt: -1 });

    console.log('📊', req.user.role, 'sees', incidents.length, 'incidents');
    return res.json(incidents);
  } catch (error) {
    console.error('Get incidents error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Single incident
router.get('/:id', protect, async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id)
      .populate('reporter', 'name email role')
      .populate('assignedTo', 'name email role');

    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }
    return res.json(incident);
  } catch (error) {
    console.error('Get incident error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
});

// 🔥 FIXED STATUS UPDATE - NO validateStatusUpdate middleware
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status, note } = req.body;
    const incident = await Incident.findById(req.params.id);
    
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    // ✅ STAFF RESTRICTIONS
    if (req.user.role === 'staff') {
      // Staff can ONLY update THEIR assigned incidents
      const isAssignedToStaff = incident.assignedTo?._id?.toString() === req.user._id.toString() ||
                               incident.assignedTo?.toString() === req.user._id.toString();
      
      if (!isAssignedToStaff) {
        return res.status(403).json({ 
          message: 'Can only update assigned incidents' 
        });
      }

      // Staff can ONLY use these 3 statuses
      const staffAllowed = ['Pending', 'In Review', 'Resolved'];
      if (!staffAllowed.includes(status)) {
        return res.status(403).json({ 
          message: `Staff can only use: ${staffAllowed.join(', ')}` 
        });
      }
    }

    // UPDATE INCIDENT
    incident.status = status;
    if (note) {
      incident.history = incident.history || [];
      incident.history.push({
        status,
        changedBy: req.user._id,
        note,
        timestamp: new Date()
      });
    }
    
    await incident.save();

    // HIDE assignedReports FROM STAFF RESPONSE
    const responseData = req.user.role === 'staff' 
      ? { ...incident.toObject(), assignedReports: undefined }
      : incident;

    console.log('✅ Status updated:', status, 'by', req.user.role);
    res.json({ 
      success: true, 
      data: responseData 
    });
    
  } catch (error) {
    console.error('❌ Status update error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Assign incident (admin only)
router.patch('/:id/assign', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const { assignedTo, staffId } = req.body;
    if (!assignedTo && !staffId) {
      return res.status(400).json({ message: 'assignedTo or staffId required' });
    }
    
    const targetId = assignedTo || staffId;
    console.log('🔍 Assigning to:', targetId.toString().slice(-6));

    const incident = await Incident.findById(req.params.id);
    if (!incident) return res.status(404).json({ message: 'Incident not found' });

    const staffUser = await User.findById(targetId).select('name email role');
    if (!staffUser || staffUser.role !== 'staff') {
      return res.status(400).json({ message: 'Valid staff required' });
    }

    incident.assignedTo = targetId;
    incident.history.push({
      status: incident.status,
      changedBy: req.user._id,
      note: `Assigned to ${staffUser.name}`,
    });

    await incident.save();
    console.log('✅ Assigned to:', staffUser.name);
    
    const updated = await Incident.findById(req.params.id)
      .populate('assignedTo', 'name email role')
      .populate('reporter', 'name email role');
    
    return res.json(updated);
  } catch (error) {
    console.error('Assign error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
