const recurringService = require('../services/recurringMaintenance.service');

// Create recurring maintenance schedule
exports.create = async (req, res, next) => {
  try {
    const { panelId, type, frequency, startDate, notes } = req.body;
    
    if (!panelId || !type || !frequency || !startDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: panelId, type, frequency, startDate' 
      });
    }
    
    const recurring = await recurringService.create({
      panelId,
      type,
      frequency,
      startDate,
      notes,
      createdBy: req.user?.id
    });
    
    res.status(201).json({ 
      success: true, 
      data: recurring,
      message: 'Recurring maintenance schedule created successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get all recurring schedules
exports.getAll = async (req, res, next) => {
  try {
    const schedules = await recurringService.getAll();
    res.status(200).json({ success: true, data: schedules });
  } catch (error) {
    next(error);
  }
};

// Get schedules for a panel
exports.getByPanel = async (req, res, next) => {
  try {
    const { panelId } = req.params;
    const schedules = await recurringService.getByPanel(panelId);
    res.status(200).json({ success: true, data: schedules });
  } catch (error) {
    next(error);
  }
};

// Update schedule
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await recurringService.update(id, req.body);
    
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }
    
    res.status(200).json({ 
      success: true, 
      data: updated,
      message: 'Schedule updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Delete schedule
exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await recurringService.delete(id);
    
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }
    
    res.status(200).json({ success: true, message: 'Schedule deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Toggle active status
exports.toggleActive = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await recurringService.toggleActive(id);
    
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }
    
    res.status(200).json({ 
      success: true, 
      data: updated,
      message: `Schedule ${updated.isActive ? 'activated' : 'paused'} successfully`
    });
  } catch (error) {
    next(error);
  }
};

// Generate due maintenance requests
exports.generateDue = async (req, res, next) => {
  try {
    const result = await recurringService.generateDueMaintenance();
    res.status(200).json({ 
      success: true, 
      data: result,
      message: `Generated ${result.generated} maintenance request(s)`
    });
  } catch (error) {
    next(error);
  }
};

// Get upcoming schedules
exports.getUpcoming = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const schedules = await recurringService.getUpcoming(days);
    res.status(200).json({ success: true, data: schedules });
  } catch (error) {
    next(error);
  }
};
