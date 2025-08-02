/**
 * 테마 관리 컴포넌트
 * Linear 디자인 시스템의 색상과 스타일 정의
 */

export const Theme = {
    // Linear 디자인 시스템 색상
    colors: {
        backgrounds: {
            primary: 'rgb(8, 9, 10)',
            secondary: 'rgb(16, 17, 18)',
            tertiary: 'rgb(24, 25, 26)',
            overlay: 'rgba(10, 10, 10, 0.8)'
        },
        text: {
            primary: 'rgb(247, 248, 248)',
            secondary: 'rgb(174, 177, 183)',
            tertiary: 'rgb(138, 143, 152)',
            muted: 'rgb(93, 95, 101)'
        },
        border: {
            primary: 'rgb(33, 35, 38)',
            secondary: 'rgba(247, 248, 248, 0.08)',
            focus: 'rgba(94, 106, 210, 0.5)'
        },
        brand: {
            purple: '#5e6ad2',
            blue: '#26b5ce',
            pink: '#f02e65'
        },
        semantic: {
            success: '#4cb782',
            warning: '#f2c94c',
            error: '#eb5757',
            info: '#4ea7fc'
        }
    },

    // 타이포그래피
    typography: {
        fontSize: {
            xs: '12px',
            sm: '13px',
            base: '16px',
            lg: '18px',
            xl: '21px',
            '2xl': '24px',
            '3xl': '30px'
        },
        fontWeight: {
            light: '300',
            normal: '400',
            medium: '510',
            semibold: '590',
            bold: '680'
        }
    },

    // 스페이싱
    spacing: {
        0: '0px',
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '20px',
        6: '24px',
        8: '32px'
    },

    // 애니메이션
    animation: {
        duration: {
            fast: '150ms',
            normal: '200ms',
            slow: '300ms'
        },
        easing: {
            default: 'cubic-bezier(0.4, 0, 0.2, 1)',
            in: 'cubic-bezier(0.4, 0, 1, 1)',
            out: 'cubic-bezier(0, 0, 0.2, 1)'
        }
    },

    // 테마 초기화
    init() {
        // CSS 변수를 동적으로 설정
        const root = document.documentElement;
        
        // 색상 변수 설정
        Object.entries(this.colors.backgrounds).forEach(([key, value]) => {
            root.style.setProperty(`--bg-${key}`, value);
        });
        
        Object.entries(this.colors.text).forEach(([key, value]) => {
            root.style.setProperty(`--text-${key}`, value);
        });
        
        Object.entries(this.colors.semantic).forEach(([key, value]) => {
            root.style.setProperty(`--${key}`, value);
        });
    },

    // 색상 가져오기 헬퍼
    getColor(category, name) {
        return this.colors[category]?.[name] || '';
    }
};