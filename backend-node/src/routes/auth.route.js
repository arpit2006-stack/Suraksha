import express from 'express';
import { signup, login , verifyOtp } from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/auth.middlewarre.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/verify-otp', verifyOtp);

router.get('/profile', protectRoute, (req, res) => {
    res.status(200).json({
        success: true,
        message: "🔐 SuRaksha Secured Vault Access Granted!",
        user: req.user
    });
});

export default router;