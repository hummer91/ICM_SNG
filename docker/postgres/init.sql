-- PostgreSQL 초기화 스크립트
-- 데이터베이스 및 사용자 생성

-- 데이터베이스 생성 (이미 존재하지 않는 경우)
SELECT 'CREATE DATABASE myapp_dev'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'myapp_dev')\gexec

-- 테스트 데이터베이스 생성
SELECT 'CREATE DATABASE myapp_test'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'myapp_test')\gexec

-- 확장 기능 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 기본 테이블 생성 (예시)
-- 실제 프로젝트에 맞게 수정하세요

-- 사용자 테이블
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();