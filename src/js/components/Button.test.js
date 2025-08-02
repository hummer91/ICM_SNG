/**
 * Button 컴포넌트 테스트
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/dom';
import { Button } from './Button.js';

describe('Button Component', () => {
  // 테스트 전 DOM 초기화
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('Button.create()', () => {
    it('기본 버튼을 생성해야 함', () => {
      const button = Button.create({
        text: '테스트 버튼',
      });

      document.body.appendChild(button);

      expect(screen.getByText('테스트 버튼')).toBeInTheDocument();
      expect(button.tagName).toBe('BUTTON');
      expect(button.classList.contains('btn')).toBe(true);
      expect(button.classList.contains('btn-md')).toBe(true);
      expect(button.classList.contains('btn-primary')).toBe(true);
    });

    it('다양한 변형을 적용해야 함', () => {
      const variants = ['primary', 'secondary', 'ghost', 'outline'];

      variants.forEach((variant) => {
        const button = Button.create({
          text: `${variant} 버튼`,
          variant,
        });

        expect(button.classList.contains(`btn-${variant}`)).toBe(true);
      });
    });

    it('크기 옵션을 적용해야 함', () => {
      const sizes = ['sm', 'md', 'lg'];

      sizes.forEach((size) => {
        const button = Button.create({
          text: `${size} 버튼`,
          size,
        });

        expect(button.classList.contains(`btn-${size}`)).toBe(true);
      });
    });

    it('비활성화 상태를 적용해야 함', () => {
      const button = Button.create({
        text: '비활성화 버튼',
        disabled: true,
      });

      expect(button.disabled).toBe(true);
      expect(button.classList.contains('btn-disabled')).toBe(true);
    });

    it('로딩 상태를 표시해야 함', () => {
      const button = Button.create({
        text: '로딩 버튼',
        loading: true,
      });

      document.body.appendChild(button);

      expect(button.disabled).toBe(true);
      expect(button.classList.contains('btn-loading')).toBe(true);
      expect(button.querySelector('.spinner')).toBeInTheDocument();
    });

    it('클릭 이벤트를 처리해야 함', () => {
      const onClick = vi.fn();
      const button = Button.create({
        text: '클릭 버튼',
        onClick,
      });

      document.body.appendChild(button);

      fireEvent.click(button);
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('비활성화된 버튼은 클릭되지 않아야 함', () => {
      const onClick = vi.fn();
      const button = Button.create({
        text: '비활성화 버튼',
        disabled: true,
        onClick,
      });

      document.body.appendChild(button);

      fireEvent.click(button);
      expect(onClick).not.toHaveBeenCalled();
    });

    it('커스텀 클래스를 적용해야 함', () => {
      const button = Button.create({
        text: '커스텀 버튼',
        className: 'custom-class another-class',
      });

      expect(button.classList.contains('custom-class')).toBe(true);
      expect(button.classList.contains('another-class')).toBe(true);
    });
  });

  describe('Button.createGroup()', () => {
    it('버튼 그룹을 생성해야 함', () => {
      const buttons = [
        { text: '버튼 1', variant: 'secondary' },
        { text: '버튼 2', variant: 'primary' },
      ];

      const group = Button.createGroup(buttons);
      document.body.appendChild(group);

      expect(group.classList.contains('btn-group')).toBe(true);
      expect(group.children.length).toBe(2);
      expect(screen.getByText('버튼 1')).toBeInTheDocument();
      expect(screen.getByText('버튼 2')).toBeInTheDocument();
    });

    it('그룹 내 버튼 클릭 이벤트를 처리해야 함', () => {
      const onClick1 = vi.fn();
      const onClick2 = vi.fn();

      const buttons = [
        { text: '버튼 1', onClick: onClick1 },
        { text: '버튼 2', onClick: onClick2 },
      ];

      const group = Button.createGroup(buttons);
      document.body.appendChild(group);

      fireEvent.click(screen.getByText('버튼 1'));
      expect(onClick1).toHaveBeenCalledTimes(1);
      expect(onClick2).not.toHaveBeenCalled();

      fireEvent.click(screen.getByText('버튼 2'));
      expect(onClick2).toHaveBeenCalledTimes(1);
    });
  });
});
