
const express = require('express');
const app = express();

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'notif-service'
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Notification Service running on port ${port}`);
});
