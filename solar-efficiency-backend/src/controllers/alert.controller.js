const Alert = require('../models/Alert.model');

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
