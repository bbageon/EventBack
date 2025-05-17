# Development stage
# 모든 의존성 설치 및 빌드 수행
FROM node:alpine As development

# 컨테이너 작업 디렉토리 설정
WORKDIR /usr/src/app

# package.json 및 lock 파일 복사
# NestJS 모노레포는 루트의 package.json과 각 앱의 package.json을 가집니다.
# 올바른 의존성 설치를 위해 루트와 해당 앱의 package.json 모두 필요합니다.
COPY package*.json ./
COPY apps/auth/package*.json ./apps/auth/

# 의존성 설치 (루트에서 실행)
# NestJS monorepo 명령어 사용
RUN npm install

# 모든 소스 코드 복사
COPY . .

# Auth 앱 빌드 (NestJS CLI monorepo 명령어 사용)
# dist/apps/auth 폴더에 빌드 결과가 생성됩니다.
RUN npm run build auth

# Production stage
# 불필요한 개발/빌드 도구 제외, 최종 실행 이미지 생성
FROM node:alpine as production

# 환경 변수 설정 (NODE_ENV)
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

# 컨테이너 작업 디렉토리 설정
WORKDIR /usr/src/app

# 프로덕션 의존성만 설치 (루트에서 실행)
# --only=production 옵션 사용
COPY package*.json ./
COPY apps/auth/package*.json ./apps/auth/
RUN npm install --only=production

# 개발 스테이지에서 빌드된 Auth 앱 결과물 복사
COPY --from=development /usr/src/app/dist/apps/auth ./dist/apps/auth

# 최종 실행 명령어
# NestJS CLI build 명령어 결과 폴더와 main 파일 경로 사용
CMD ["node", "dist/apps/auth/main"]