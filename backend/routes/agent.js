import express from 'express';
import Agent from '../modals/Agent.js';
import auth from '../middlewares/auth.js';

const router = express.Router();
router.post('/add-agent', auth, async (req, res) => {
  try {
    const agent = new Agent(req.body);
    await agent.save();
    res.status(201).json(agent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/all-agents', auth, async (req, res) => {
  try {
    const agents = await Agent.find().select('-password');
    res.json(agents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;