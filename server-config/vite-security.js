/**
 * Vite 개발 서버 보안 설정
 * @module server-config/vite-security
 */

import { generateCSP, SECURITY_HEADERS } from '../src/config/security.js';

/**
 * Vite 보안 미들웨어
 *
 * @description 개발 환경에서도 프로덕션과 유사한 보안 헤더를 적용합니다.
 * @param {Object} req - 요청 객체
 * @param {Object} res - 응답 객체
 * @param {Function} next - 다음 미들웨어
 */
export function securityMiddleware(req, res, next) {
  // CSP 헤더 설정
  res.setHeader('Content-Security-Policy', generateCSP());

  // 기타 보안 헤더 설정
  Object.entries(SECURITY_HEADERS).forEach(([header, value]) => {
    // 개발 환경에서는 HSTS를 제외
    if (header !== 'Strict-Transport-Security') {
      res.setHeader(header, value);
    }
  });

  // HTTPS 리다이렉션 (개발 환경에서는 선택적)
  if (process.env.VITE_FORCE_HTTPS === 'true' && req.headers['x-forwarded-proto'] === 'http') {
    const httpsUrl = `https://${req.headers.host}${req.url}`;
    res.writeHead(301, { Location: httpsUrl });
    res.end();
    return;
  }

  next();
}

/**
 * Vite 설정 플러그인
 *
 * @description vite.config.js에서 사용할 보안 플러그인
 */
export const viteSecurityPlugin = () => ({
  name: 'vite-security',
  configureServer(server) {
    server.middlewares.use(securityMiddleware);
  },
  configurePreviewServer(server) {
    server.middlewares.use(securityMiddleware);
  },
});
