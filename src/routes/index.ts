import { Router } from 'express';
import userRoutes from './userRoutes';

const router = Router();

// API 버전 정보
router.get('/', (req, res) => {
  res.json({
    message: 'Backend API Server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// 라우트 등록
router.use('/users', userRoutes);

export default router;
