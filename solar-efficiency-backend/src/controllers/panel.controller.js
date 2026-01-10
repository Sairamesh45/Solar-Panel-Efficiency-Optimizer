const Panel = require('../models/SolarPanel.model');

exports.getPanels = async (req, res, next) => {
  try {
    const { userId } = req.query;
    const query = userId ? { userId } : {};
    const panels = await Panel.find(query);
    res.status(200).json({ success: true, data: panels });
  } catch (err) {
    next(err);
  }
};

exports.createPanel = async (req, res, next) => {
  try {
    const { userId, name, location, wattage, brand, installationDate } = req.body;
    const panel = new Panel({
      userId,
      name,
      location,
      installationDate: installationDate || new Date(),
      specifications: { wattage, brand }
    });
    await panel.save();
    res.status(201).json({ success: true, data: panel });
  } catch (err) {
    next(err);
  }
};
