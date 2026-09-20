import { Router } from 'express';
import authTokens from './auth/auth.tokens';
import authOtp from './auth/auth.otp';
import authPassword from './auth/auth.password';
import authGoogle from './auth/auth.google';
import authClient from './auth/auth.client';
import authPan from './auth/auth.pan';
import authProfile from './auth/auth.profile';

const router = Router();

router.use(authTokens);
router.use(authOtp);
router.use(authPassword);
router.use(authGoogle);
router.use(authClient);
router.use(authPan);
router.use(authProfile);

export default router;