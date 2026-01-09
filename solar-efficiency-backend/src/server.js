const app = require('./app');
const config = require('./config/env');
const connectDB = require('./config/db');

// Connect to Database
connectDB();

const PORT = config.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${config.NODE_ENV} mode on port ${PORT}`);
});
