const express = require('express');
const router = express.Router();

router.post('/survey', (req, res) => {
  const { workspaceId, feedback } = req.body;
  // Simuliraj procesiranje feedback-a
  require('../classifier/process')(workspaceId, feedback);
  res.status(200).send({ ok: true });
});

router.get('/digest/:workspaceId', (req, res) => {
  const data = require('../digest/generate')(req.params.workspaceId);
  res.json(data);
});

module.exports = router;
