/**
 * 레인지 차트 컴포넌트
 * 프리플랍 핸드 레인지를 13x13 그리드로 표시
 * EV 값에 따라 색상 변경
 */

import { Theme } from './Theme.js';

export class RangeChart {
    constructor(options = {}) {
        this.options = {
            data: options.data || {}, // { 'AA': 0.5, 'AKs': 0.3, ... }
            size: options.size || 'medium', // small, medium, large
            showLabels: options.showLabels !== false,
            showEV: options.showEV !== false,
            highlightThreshold: options.highlightThreshold || 0.2, // EV >= 0.2 초록색
            onClick: options.onClick || null,
            onHover: options.onHover || null,
            className: options.className || '',
            ...options
        };

        // 핸드 순서 (13x13 그리드)
        this.ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
        this.hands = this.generateHandMatrix();
    }

    /**
     * 13x13 핸드 매트릭스 생성
     */
    generateHandMatrix() {
        const matrix = [];
        
        for (let row = 0; row < 13; row++) {
            const rowHands = [];
            for (let col = 0; col < 13; col++) {
                const rank1 = this.ranks[row];
                const rank2 = this.ranks[col];
                
                let hand;
                if (row === col) {
                    // 포켓 페어
                    hand = rank1 + rank2;
                } else if (row < col) {
                    // 수티드 (우상단)
                    hand = rank1 + rank2 + 's';
                } else {
                    // 오프수트 (좌하단)
                    hand = rank2 + rank1 + 'o';
                }
                
                rowHands.push(hand);
            }
            matrix.push(rowHands);
        }
        
        return matrix;
    }

    /**
     * EV 값에 따른 색상 계산
     */
    getColorForEV(ev) {
        if (ev === undefined || ev === null) {
            return {
                bg: Theme.colors.backgrounds.tertiary,
                text: Theme.colors.text.tertiary
            };
        }

        if (ev >= this.options.highlightThreshold) {
            // EV >= 0.2: 초록색
            const intensity = Math.min((ev - 0.2) / 0.8, 1); // 0.2~1.0 범위를 0~1로 정규화
            return {
                bg: this.interpolateColor('#1a4d2e', '#4cb782', intensity),
                text: '#ffffff'
            };
        } else if (ev > 0) {
            // 0 < EV < 0.2: 파란색 계열
            const intensity = ev / 0.2;
            return {
                bg: this.interpolateColor('#1a1f3a', '#4a5f8a', intensity),
                text: '#ffffff'
            };
        } else if (ev === 0) {
            // EV = 0: 회색
            return {
                bg: Theme.colors.backgrounds.secondary,
                text: Theme.colors.text.secondary
            };
        } else {
            // EV < 0: 빨간색 계열
            const intensity = Math.min(Math.abs(ev) / 0.5, 1);
            return {
                bg: this.interpolateColor('#3a1a1a', '#eb5757', intensity),
                text: '#ffffff'
            };
        }
    }

    /**
     * 색상 보간
     */
    interpolateColor(color1, color2, factor) {
        const c1 = this.hexToRgb(color1);
        const c2 = this.hexToRgb(color2);
        
        const r = Math.round(c1.r + (c2.r - c1.r) * factor);
        const g = Math.round(c1.g + (c2.g - c1.g) * factor);
        const b = Math.round(c1.b + (c2.b - c1.b) * factor);
        
        return `rgb(${r}, ${g}, ${b})`;
    }

    /**
     * HEX를 RGB로 변환
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    /**
     * 레인지 차트 렌더링
     */
    render() {
        const container = document.createElement('div');
        container.className = `range-chart range-chart-${this.options.size} ${this.options.className}`;

        // 그리드 컨테이너
        const grid = document.createElement('div');
        grid.className = 'range-grid';

        // 각 셀 생성
        this.hands.forEach((row, rowIndex) => {
            row.forEach((hand, colIndex) => {
                const cell = this.createCell(hand, rowIndex, colIndex);
                grid.appendChild(cell);
            });
        });

        container.appendChild(grid);

        // 범례 추가
        if (this.options.showLabels) {
            const legend = this.createLegend();
            container.appendChild(legend);
        }

        return container;
    }

    /**
     * 셀 생성
     */
    createCell(hand, row, col) {
        const cell = document.createElement('div');
        cell.className = 'range-cell';
        
        const ev = this.options.data[hand];
        const colors = this.getColorForEV(ev);
        
        cell.style.backgroundColor = colors.bg;
        cell.style.color = colors.text;

        // 대각선 (포켓 페어) 스타일
        if (row === col) {
            cell.classList.add('pocket-pair');
        }
        
        // 수티드 핸드 표시
        if (row < col) {
            cell.classList.add('suited');
        }

        // 핸드 라벨
        const label = document.createElement('div');
        label.className = 'range-cell-label';
        label.textContent = hand.replace('o', '');
        cell.appendChild(label);

        // EV 값 표시
        if (this.options.showEV && ev !== undefined) {
            const evText = document.createElement('div');
            evText.className = 'range-cell-ev';
            evText.textContent = ev >= 0 ? `+${ev.toFixed(2)}` : ev.toFixed(2);
            cell.appendChild(evText);
        }

        // 이벤트 핸들러
        if (this.options.onClick) {
            cell.style.cursor = 'pointer';
            cell.addEventListener('click', () => {
                this.options.onClick(hand, ev, { row, col });
            });
        }

        if (this.options.onHover) {
            cell.addEventListener('mouseenter', () => {
                this.options.onHover(hand, ev, { row, col });
            });
            cell.addEventListener('mouseleave', () => {
                this.options.onHover(null, null, null);
            });
        }

        // 툴팁
        cell.title = `${hand}: EV ${ev !== undefined ? ev.toFixed(3) : 'N/A'}`;

        return cell;
    }

    /**
     * 범례 생성
     */
    createLegend() {
        const legend = document.createElement('div');
        legend.className = 'range-legend';

        const items = [
            { label: 'EV ≥ 0.2', color: '#4cb782' },
            { label: '0 < EV < 0.2', color: '#4a5f8a' },
            { label: 'EV = 0', color: Theme.colors.backgrounds.secondary },
            { label: 'EV < 0', color: '#eb5757' }
        ];

        items.forEach(item => {
            const legendItem = document.createElement('div');
            legendItem.className = 'range-legend-item';
            
            const color = document.createElement('div');
            color.className = 'range-legend-color';
            color.style.backgroundColor = item.color;
            
            const label = document.createElement('span');
            label.className = 'range-legend-label';
            label.textContent = item.label;
            
            legendItem.appendChild(color);
            legendItem.appendChild(label);
            legend.appendChild(legendItem);
        });

        return legend;
    }

    /**
     * 데이터 업데이트
     */
    updateData(newData) {
        this.options.data = newData;
        return this.render();
    }

    /**
     * 특정 핸드 하이라이트
     */
    highlightHand(hand) {
        const cells = document.querySelectorAll('.range-cell');
        cells.forEach(cell => {
            const label = cell.querySelector('.range-cell-label');
            if (label && label.textContent === hand.replace('o', '')) {
                cell.classList.add('highlighted');
            } else {
                cell.classList.remove('highlighted');
            }
        });
    }

    /**
     * 정적 팩토리 메서드
     */
    static create(options) {
        return new RangeChart(options).render();
    }

    /**
     * 샘플 데이터 생성 (테스트용)
     */
    static generateSampleData() {
        const data = {};
        const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
        
        // 프리미엄 핸드들
        const premiumHands = ['AA', 'KK', 'QQ', 'JJ', 'TT', 'AKs', 'AKo', 'AQs', 'AQo'];
        
        ranks.forEach((r1, i) => {
            ranks.forEach((r2, j) => {
                let hand;
                if (i === j) {
                    hand = r1 + r2;
                } else if (i < j) {
                    hand = r1 + r2 + 's';
                } else {
                    hand = r2 + r1 + 'o';
                }
                
                // 랜덤 EV 생성 (프리미엄 핸드는 높은 값)
                if (premiumHands.includes(hand)) {
                    data[hand] = 0.2 + Math.random() * 0.5;
                } else if (i < 6 && j < 6) {
                    data[hand] = -0.1 + Math.random() * 0.4;
                } else {
                    data[hand] = -0.3 + Math.random() * 0.3;
                }
            });
        });
        
        return data;
    }
}