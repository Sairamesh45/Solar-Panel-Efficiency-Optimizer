const PanelRequest = require('../models/PanelRequest.model');

exports.createPanelRequest = async (req, res, next) => {
  try {
    const { userId, name, location, wattage, brand, notes } = req.body;
    const request = new PanelRequest({ 
      userId, 
      name, 
      location, 
      wattage, 
      brand, 
      notes,
      timeline: [{
        status: 'pending',
        message: 'Panel request created',
        timestamp: new Date(),
        userId
      }]
    });
    await request.save();
    res.status(201).json({ success: true, data: request });
  } catch (err) {
    next(err);
  }
};

exports.getPanelRequests = async (req, res, next) => {
  try {
    const requests = await PanelRequest.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: requests });
  } catch (err) {
    next(err);
  }
};

exports.updatePanelRequestStatus = async (req, res, next) => {
  try {
    const { id, status, installerId, panelId, message, userId } = req.body;
    const update = { status };
    const timelineEntry = {
      status,
      message: message || `Status changed to ${status}`,
      timestamp: new Date(),
      userId: userId || null
    };
    
    if (installerId) {
      update.installerId = installerId;
    }
    if (panelId) {
      update.panelId = panelId;
    }
    
    const updated = await PanelRequest.findByIdAndUpdate(
      id, 
      { 
        ...update,
        $push: { timeline: timelineEntry }
      }, 
      { new: true }
    ).populate('timeline.userId', 'name role');
    
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

// Installer marks installation as complete
exports.markInstallationComplete = async (req, res, next) => {
  try {
    const { id, installerId } = req.body;
    
    const updated = await PanelRequest.findByIdAndUpdate(
      id,
      {
        status: 'completed',
        $push: {
          timeline: {
            status: 'completed',
            message: 'Installation completed by installer',
            timestamp: new Date(),
            userId: installerId
          }
        }
      },
      { new: true }
    ).populate('timeline.userId', 'name role');
    
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};
