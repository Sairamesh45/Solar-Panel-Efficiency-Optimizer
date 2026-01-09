exports.getPanels = async (req, res, next) => {
  res.status(200).json({ message: 'Get Panels' });
};

exports.createPanel = async (req, res, next) => {
  res.status(201).json({ message: 'Create Panel' });
};
