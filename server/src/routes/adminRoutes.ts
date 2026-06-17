import express from 'express';
import Config from '../models/Config.js';

const router = express.Router();

const MASTER_PASSWORD = process.env.MASTER_PASSWORD;
const DEFAULT_ADMIN_PASSWORD = 'admin123';

// Helper to get or create admin password
const getAdminPassword = async () => {
  let config = await Config.findOne({ key: 'admin_password' });
  if (!config) {
    config = new Config({ key: 'admin_password', value: DEFAULT_ADMIN_PASSWORD });
    await config.save();
  }
  return config;
};

// Admin Login
router.post('/login', async (req, res) => {
  const { password } = req.body;

  try {
    // 1. Check if it's the master password (auto-reset)
    if (password === MASTER_PASSWORD) {
      const config = await getAdminPassword();
      config.value = DEFAULT_ADMIN_PASSWORD;
      await config.save();
      return res.json({
        success: true,
        message: 'Master password used. Admin password has been reset to default.',
        token: 'authenticated'
      });
    }

    // 2. Check against current password in DB
    const config = await getAdminPassword();
    if (password === config.value) {
      return res.json({ success: true, token: 'authenticated' });
    }

    res.status(401).json({ success: false, message: 'Invalid password' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Change Admin Password
router.put('/change-password', async (req, res) => {
  const { newPassword } = req.body;
  try {
    const config = await getAdminPassword();
    config.value = newPassword;
    await config.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;
