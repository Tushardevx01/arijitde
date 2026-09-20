import { Router } from 'express';
import authTokens from './auth.tokens';
import authOtp from './auth.otp';
import authPassword from './auth.password';
import authGoogle from './auth.google';
import authClient from './auth.client';
import authPan from './auth.pan';
import authProfile from './auth.profile';

const router = Router();

router.use(authTokens);
router.use(authOtp);
router.use(authPassword);
router.use(authGoogle);
router.use(authClient);
router.use(authPan);
router.use(authProfile);

export default router;