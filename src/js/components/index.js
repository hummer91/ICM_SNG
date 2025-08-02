/**
 * Linear 디자인 시스템 컴포넌트 라이브러리
 *
 * 중앙화된 컴포넌트 시스템으로 프로젝트 전체에서 재사용 가능
 */

// 컴포넌트 모듈 임포트
import { Button } from './Button.js';
import { Input } from './Input.js';
import { Card } from './Card.js';
import { Modal } from './Modal.js';
import { Toast } from './Toast.js';
import { Theme } from './Theme.js';
import { RangeChart } from './RangeChart.js';

// 전역 컴포넌트 레지스트리
const Components = {
  Button,
  Input,
  Card,
  Modal,
  Toast,
  Theme,
  RangeChart,
};

// 컴포넌트를 전역으로 사용할 수 있도록 window 객체에 추가
window.ICMComponents = Components;

// 컴포넌트 초기화
document.addEventListener('DOMContentLoaded', () => {
  console.log('Linear 디자인 시스템 컴포넌트 로드 완료');

  // 테마 초기화
  Theme.init();
});

// 컴포넌트 내보내기
export { Button, Input, Card, Modal, Toast, Theme, RangeChart };
