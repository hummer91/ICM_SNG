import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import apiRoutes from './routes';
import config from '../config/environment';

const app = express();
const PORT = config.PORT;

// 미들웨어 설정
app.use(helmet()); // 보안 헤더 설정
app.use(cors({
  origin: config.CORS_ORIGIN.split(','),
  credentials: true
})); // CORS 설정
app.use(morgan('combined')); // 로깅
app.use(express.json({ limit: '10mb' })); // JSON 파싱
app.use(express.urlencoded({ extended: true })); // URL 인코딩 파싱

// API 라우트
app.use('/api', apiRoutes);

// 헬스 체크 엔드포인트
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 404 핸들러
app.use(notFoundHandler);

// 에러 핸들러
app.use(errorHandler);

// 서버 시작
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`🚀 Server is running on port ${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`📚 Health check: http://localhost:${PORT}/health`);
  // eslint-disable-next-line no-console
  console.log(`🔗 API base URL: http://localhost:${PORT}/api`);
});

export default app;
