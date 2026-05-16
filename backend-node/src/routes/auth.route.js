import express from 'express';
import { signup, login , verifyOtp } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/verify-otp', verifyOtp);

export default router;