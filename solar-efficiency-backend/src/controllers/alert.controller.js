const Alert = require('../models/Alert.model');
const SolarPanel = require('../models/SolarPanel.model');

exports.createAlert = async (req, res, next) => {
  try {
    const { panelId, type, message } = req.body;
    const alert = new Alert({ panelId, type, message });
    await alert.save();
    res.status(201).json({ message: 'Alert created', data: alert });
  } catch (error) {
    next(error);
  }
};

exports.getAlerts = async (req, res, next) => {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: alerts });
  } catch (error) {
    next(error);
  }
};

exports.getUnresolvedAlerts = async (req, res, next) => {
  try {
    const alerts = await Alert.find({ resolved: false }).sort({ createdAt: -1 }).populate('panelId');
    res.status(200).json({ success: true, data: alerts });
  } catch (error) {
    next(error);
  }
};

exports.getUserAlerts = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { resolved, limit = 100 } = req.query;
    
    // Find all panels owned by this user
    const panels = await SolarPanel.find({ userId: userId });
    const panelIds = panels.map(p => p._id);
    
    const query = { panelId: { $in: panelIds } };
    if (resolved !== undefined) {
      query.resolved = resolved === 'true' || resolved === true;
    }
    
    const alerts = await Alert.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('panelId');
      
    res.status(200).json({ success: true, data: alerts });
  } catch (error) {
    next(error);
  }
};

exports.getPanelAlerts = async (req, res, next) => {
  try {
    const { panelId } = req.params;
    const alerts = await Alert.find({ panelId }).sort({ createdAt: -1 }).populate('panelId');
    res.status(200).json({ success: true, data: alerts });
  } catch (error) {
    next(error);
  }
};

exports.resolveAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    const alert = await Alert.findByIdAndUpdate(
      id,
      { resolved: true, resolvedAt: new Date() },
      { new: true }
    );
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }
    res.status(200).json({ success: true, data: alert });
  } catch (error) {
    next(error);
  }
};

exports.markAlertAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const alert = await Alert.findByIdAndUpdate(
      id,
      { read: true },
      { new: true }
    );
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }
    res.status(200).json({ success: true, data: alert });
  } catch (error) {
    next(error);
  }
};

exports.deleteAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    const alert = await Alert.findByIdAndDelete(id);
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }
    res.status(200).json({ success: true, message: 'Alert deleted successfully' });
  } catch (error) {
    next(error);
  }
};
