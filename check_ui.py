#!/usr/bin/env python3
import time
from playwright.sync_api import sync_playwright
import os

def check_poker_ui():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)  # headless=False로 브라우저 보이기
        page = browser.new_page(viewport={'width': 1920, 'height': 1080})
        
        # 로컬 파일 열기
        file_path = f"file://{os.path.abspath('index.html')}"
        page.goto(file_path)
        
        # 페이지 로딩 대기
        page.wait_for_timeout(2000)
        
        # 스크린샷 저장
        screenshot_path = '/tmp/poker_ui_check.png'
        page.screenshot(path=screenshot_path, full_page=False)
        print(f"Screenshot saved to: {screenshot_path}")
        
        # 플레이어 요소들 확인
        print("\n=== 플레이어 카드 확인 ===")
        player_cards = page.query_selector_all('.player-card')
        print(f"플레이어 카드 수: {len(player_cards)}")
        
        # 각 플레이어 정보 확인
        for i in range(len(player_cards)):
            print(f"\n플레이어 {i + 1}:")
            
            # 플레이어 이름 확인
            name_selector = f'.player-card:nth-child({i + 1}) .player-name'
            name_element = page.query_selector(name_selector)
            if name_element:
                name = name_element.text_content()
                is_visible = name_element.is_visible()
                print(f"  이름: {name} (visible: {is_visible})")
            
            # 포지션 확인
            position_selector = f'.player-card:nth-child({i + 1}) .player-position'
            position_element = page.query_selector(position_selector)
            if position_element:
                position = position_element.text_content()
                is_visible = position_element.is_visible()
                print(f"  포지션: {position} (visible: {is_visible})")
            
            # 칩 수 확인
            chips_selector = f'.player-card:nth-child({i + 1}) .chip-count'
            chips_element = page.query_selector(chips_selector)
            if chips_element:
                chips = chips_element.text_content()
                print(f"  칩: {chips}")
        
        # 달러 아이콘 확인
        print("\n=== 달러 아이콘 확인 ===")
        dollar_icons = page.query_selector_all('.chip-icon')
        print(f"달러 아이콘 수: {len(dollar_icons)}")
        for icon in dollar_icons:
            is_visible = icon.is_visible()
            print(f"  달러 아이콘 visible: {is_visible}")
        
        # 10초 대기 (브라우저 확인용)
        print("\n브라우저에서 확인하세요. 10초 후 종료됩니다...")
        time.sleep(10)
        
        browser.close()

if __name__ == "__main__":
    check_poker_ui()