const PanelRequest = require('../models/PanelRequest.model');

exports.createPanelRequest = async (req, res, next) => {
  try {
    const { userId, name, location, wattage, brand, notes } = req.body;
    const request = new PanelRequest({ userId, name, location, wattage, brand, notes });
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
    const { id, status } = req.body;
    const updated = await PanelRequest.findByIdAndUpdate(id, { status }, { new: true });
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};
