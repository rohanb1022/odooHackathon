const express = require('express');
const app = express();
const port = 3001;

app.use(express.json());

app.get('/api/ml/status', (req, res) => {
  res.json({ status: 'Machine Learning backend is running!', version: '1.0.0' });
});

app.post('/api/ml/predict', (req, res) => {
  const data = req.body;
  // Dummy prediction logic
  res.json({
    message: 'Prediction successful',
    inputReceived: data,
    prediction: Math.random() * 100
  });
});

app.listen(port, () => {
  console.log(`ML Backend server listening at http://localhost:${port}`);
});
