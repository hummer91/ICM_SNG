/**
 * RangeChart 컴포넌트 테스트
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent } from '@testing-library/dom';
import { RangeChart } from './RangeChart.js';

describe('RangeChart Component', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('RangeChart 생성', () => {
    it('기본 차트를 생성해야 함', () => {
      const chart = RangeChart.create({
        data: { AA: 0.5, KK: 0.3 },
      });

      document.body.appendChild(chart);

      expect(chart.classList.contains('range-chart')).toBe(true);
      expect(chart.classList.contains('range-chart-medium')).toBe(true);
      expect(chart.querySelector('.range-grid')).toBeInTheDocument();
    });

    it('13x13 그리드를 생성해야 함', () => {
      const chart = RangeChart.create({
        data: {},
      });

      document.body.appendChild(chart);

      const cells = chart.querySelectorAll('.range-cell');
      expect(cells.length).toBe(169); // 13 x 13
    });

    it('크기 옵션을 적용해야 함', () => {
      const sizes = ['small', 'medium', 'large'];

      sizes.forEach((size) => {
        const chart = RangeChart.create({
          data: {},
          size,
        });

        expect(chart.classList.contains(`range-chart-${size}`)).toBe(true);
      });
    });
  });

  describe('핸드 매트릭스 생성', () => {
    it('올바른 핸드 표기를 생성해야 함', () => {
      const rangeChart = new RangeChart();
      const { hands } = rangeChart;

      // 포켓 페어 확인
      expect(hands[0][0]).toBe('AA');
      expect(hands[1][1]).toBe('KK');
      expect(hands[12][12]).toBe('22');

      // 수티드 핸드 확인 (우상단)
      expect(hands[0][1]).toBe('AKs');
      expect(hands[0][12]).toBe('A2s');

      // 오프수트 핸드 확인 (좌하단)
      expect(hands[1][0]).toBe('AKo');
      expect(hands[12][0]).toBe('A2o');
    });
  });

  describe('EV 색상 계산', () => {
    it('EV >= 0.2일 때 초록색 계열이어야 함', () => {
      const rangeChart = new RangeChart();
      const color = rangeChart.getColorForEV(0.5);

      expect(color.bg).toMatch(/rgb/);
      expect(color.text).toBe('#ffffff');
    });

    it('0 < EV < 0.2일 때 파란색 계열이어야 함', () => {
      const rangeChart = new RangeChart();
      const color = rangeChart.getColorForEV(0.1);

      expect(color.bg).toMatch(/rgb/);
      expect(color.text).toBe('#ffffff');
    });

    it('EV < 0일 때 빨간색 계열이어야 함', () => {
      const rangeChart = new RangeChart();
      const color = rangeChart.getColorForEV(-0.3);

      expect(color.bg).toMatch(/rgb/);
      expect(color.text).toBe('#ffffff');
    });

    it('EV가 undefined일 때 기본 색상이어야 함', () => {
      const rangeChart = new RangeChart();
      const color = rangeChart.getColorForEV(undefined);

      expect(color.bg).toBeTruthy();
      expect(color.text).toBeTruthy();
    });
  });

  describe('이벤트 처리', () => {
    it('셀 클릭 이벤트를 처리해야 함', () => {
      const onClick = vi.fn();
      const chart = RangeChart.create({
        data: { AA: 0.5 },
        onClick,
      });

      document.body.appendChild(chart);

      const aaCell = Array.from(chart.querySelectorAll('.range-cell')).find(
        (cell) => cell.querySelector('.range-cell-label')?.textContent === 'AA',
      );

      fireEvent.click(aaCell);
      expect(onClick).toHaveBeenCalledWith('AA', 0.5, { row: 0, col: 0 });
    });

    it('호버 이벤트를 처리해야 함', () => {
      const onHover = vi.fn();
      const chart = RangeChart.create({
        data: { KK: 0.3 },
        onHover,
      });

      document.body.appendChild(chart);

      const kkCell = Array.from(chart.querySelectorAll('.range-cell')).find(
        (cell) => cell.querySelector('.range-cell-label')?.textContent === 'KK',
      );

      fireEvent.mouseEnter(kkCell);
      expect(onHover).toHaveBeenCalledWith('KK', 0.3, { row: 1, col: 1 });

      fireEvent.mouseLeave(kkCell);
      expect(onHover).toHaveBeenCalledWith(null, null, null);
    });
  });

  describe('레이블 및 표시', () => {
    it('EV 값을 표시해야 함', () => {
      const chart = RangeChart.create({
        data: { AA: 0.75 },
        showEV: true,
      });

      document.body.appendChild(chart);

      const aaCell = Array.from(chart.querySelectorAll('.range-cell')).find(
        (cell) => cell.querySelector('.range-cell-label')?.textContent === 'AA',
      );

      const evText = aaCell.querySelector('.range-cell-ev');
      expect(evText).toBeInTheDocument();
      expect(evText.textContent).toBe('+0.75');
    });

    it('음수 EV 값을 올바르게 표시해야 함', () => {
      const chart = RangeChart.create({
        data: { '72o': -0.25 },
        showEV: true,
      });

      document.body.appendChild(chart);

      const cell = Array.from(chart.querySelectorAll('.range-cell')).find(
        (cell) => cell.querySelector('.range-cell-label')?.textContent === '72',
      );

      const evText = cell.querySelector('.range-cell-ev');
      expect(evText.textContent).toBe('-0.25');
    });

    it('범례를 표시해야 함', () => {
      const chart = RangeChart.create({
        data: {},
        showLabels: true,
      });

      document.body.appendChild(chart);

      const legend = chart.querySelector('.range-legend');
      expect(legend).toBeInTheDocument();

      const legendItems = legend.querySelectorAll('.range-legend-item');
      expect(legendItems.length).toBeGreaterThan(0);
    });
  });

  describe('스타일 클래스', () => {
    it('포켓 페어에 pocket-pair 클래스를 추가해야 함', () => {
      const chart = RangeChart.create({
        data: { AA: 0.5, KK: 0.3 },
      });

      document.body.appendChild(chart);

      const cells = chart.querySelectorAll('.range-cell');
      const aaCell = cells[0]; // AA는 첫 번째 셀
      const kkCell = cells[14]; // KK는 14번째 셀 (13 + 1)

      expect(aaCell.classList.contains('pocket-pair')).toBe(true);
      expect(kkCell.classList.contains('pocket-pair')).toBe(true);
    });

    it('수티드 핸드에 suited 클래스를 추가해야 함', () => {
      const chart = RangeChart.create({
        data: { AKs: 0.2 },
      });

      document.body.appendChild(chart);

      const aksCell = chart.querySelectorAll('.range-cell')[1]; // AKs는 두 번째 셀
      expect(aksCell.classList.contains('suited')).toBe(true);
    });
  });

  describe('샘플 데이터 생성', () => {
    it('샘플 데이터를 생성해야 함', () => {
      const sampleData = RangeChart.generateSampleData();

      expect(Object.keys(sampleData).length).toBe(169);
      expect(typeof sampleData.AA).toBe('number');
      expect(typeof sampleData.AKs).toBe('number');
      expect(typeof sampleData['72o']).toBe('number');
    });
  });
});
