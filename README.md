# 여름맞이 물총 이벤트
2025 N_M_Assignment 01
## 1. 프로젝트 개요
![image](https://github.com/user-attachments/assets/7f3315c3-5c7d-4983-bfd0-2fa81e91e973)

본 프로젝트는 게임 내 다양한 이벤트를 생성, 관리하고 사용자의 참여에 따른 보상을 처리하는 백엔드 시스템입니다. 주로 일일 출석 기반의 보상과 주간 활동 게이지를 채워 획득하는 슬롯형 확률 보상 시스템을 중심으로 설계되었습니다.
기존의 출석 보상 시스템을 기반으로 확률 보상형 주간 이벤트 "여름맞이 물총 이벤트" 를 생성하였습니다. 
1. 특정 조건 충족 후, 일일 출석 완료(일일 보상 획득)
2. 물총에 게이지가 쌓임(게이지별 아이템 보상 확률 정의).
3. 트리거를 통해 사용자가 획득한 게이지 별 정의된 보상을 확률적으로 획득(주 1회)
* 보상 아이템 ENUM : `MapleRewardId`, 이벤트 조건 ENUM : `EventConditionType`

## 2. 기술 스택 및 주요 라이브러리

* **언어:** TypeScript
* **프레임워크:** NestJS (Monorepo)
* **데이터베이스:** MongoDB
* **API 문서화:** Swagger
* **인증:** JWT
* **개발/실행 환경:** Docker, Docker Compose

## 3. 아키텍처

### 3.1. 모노레포 구조
<img width="824" alt="image" src="https://github.com/user-attachments/assets/af07bb3a-6e28-4900-b8fb-1687b123341f" />

* **`apps/`**: 실제 실행되는 애플리케이션들이 위치합니다.
    * `event-app`: API 게이트웨이 역할, 클라이언트 요청 처리 및 내부 마이크로서비스 호출.
    * `auth`: 인증 관련 마이크로서비스 (사용자 인증, JWT 발급 등 - 상세 구현은 이번 논의에서 제외).
    * `event` : 이벤트 CRUD 처리 및 이벤트 관련 로직이 정의된 마이크로서비스
    * `reward` : `event` 마이크로 서비스 하위 모듈, 보상 로직 처리
* **`libs/common/`**: 여러 애플리케이션에서 공유되는 공통 모듈, DTO, Enum, 유틸리티 등을 포함합니다.
    * `AuthManager`: 인증/인가 가드, JWT 전략 등
    * `dto`: API 및 내부 통신용 데이터 전송 객체
    * `enum`: 공통 Enum (EventStatus, MapleRewardId, EventConditionType, RewardType 등)
    * `SwaggerManager`: Swagger 문서 설정


### 3.3. 데이터베이스
|제목|내용|
|------|---|
|User|사용자 관련 내용 정의|
|Event|이벤트 관련 내용 정의|
|UserSummerEventProgress|사용자별 이벤트 참여 현황|
|RewardClaimLog|보상 요청 로그 정의|
|RewardOption|각 보상(아이팀)별 수량 및 확률(슬롯) 정의|
|DailyRewardInfo|이벤트별 일일 출석 보상 정의|
|SlotRewardInfo|이벤트별 주간 출석(슬롯) 보상 정의|

## 4. 주요 기능

### 4.1. 이벤트 관리 (운영자/관리자)

* 이벤트 생성, 조회(목록/상세), 수정, 삭제 (CRUD).
* 이벤트 기간, 상태(예정, 활성, 종료 등), 이름, 설명 설정.
* 이벤트별 일일 출석 보상(`DailyRewardInfo`) 설정.
* 이벤트별 주간 게이지 달성을 위한 일일 조건 (`conditions`) 설정.
* 이벤트별 주간 게이지 슬롯 보상 (`SlotRewardInfo`) 설정.

### 4.2. 사용자 이벤트 참여

* **일일 출석 (`DailyCheckIn`):** 설정된 일일 조건 만족 시 출석 처리, 연속 출석일수(게이지) 증가, 일일 고정 보상 지급.
* **주간 게이지 보상 수령 (`WeeklyCheckIn`):** 달성한 게이지 레벨(연속 출석일수)에 해당하는 슬롯의 확률형 보상 수령. (예: 각 슬롯별 주 1회 또는 주 전체 1회 등 정책에 따름)
* 자신의 이벤트 진행 상태 및 보상 수령 이력 조회.

### 4.3. 보상 지급/요청 이력 로깅

* 모든 보상 지급(성공/실패) 내역을 `RewardClaimLog`에 기록하여 추적 및 감사 기능을 제공합니다.
* 관리자는 전체 또는 특정 사용자의 이력을 필터링하여 조회할 수 있습니다.

## 5. 설계 결정 및 주요 로직 설명

### 5.1. 이벤트 조건 (`Event.conditions` 및 `EventConditionType`)

* `Event` 스키마의 `conditions` 필드는 `ConditionInfo[]` 타입으로, 각 이벤트의 주간 게이지를 채우기 위한 일일 단위의 다양한 조건을 설정(예: 특정 몬스터 N마리 처치, 접속 시간 M분 달성 등)

### 5.2. 보상 시스템

* **일일 고정 보상 (`dailyRewardsPool`):** `DailyCheckIn` 성공 (및 일일 조건 만족) 시, 달성한 연속 출석 N일차에 해당하는 고정 보상을 지급합니다.
* **주간 슬롯 확률 보상 (`slotRewards`):** `WeeklyCheckIn` 시, 현재 달성한 게이지 레벨(연속 출석일수)에 해당하는 슬롯의 보상 목록(`RewardOption[]`) 중 하나를 확률적으로 지급합니다.
    * 각 슬롯별 보상 또는 주간 전체 게이지 보상에 대한 획득 횟수 제한은 `UserSummerEventProgress`의 `Check_Slots` 또는 `WeeklyRewardIs` 필드를 통해 관리됩니다.

### 5.3. 주간 초기화 로직 (`getStartOfWeekByThursday`)

* 사용자의 연속 출석일수(`currentStreak`) 및 수령한 슬롯(`Check_Slots`), 주간 보상 수령 여부(`WeeklyRewardIs`)는 매주 특정 요일(예: 목요일) 자정을 기준으로 초기화됩니다.
* `getStartOfWeekByThursday` 헬퍼 메소드가 이 기준 시점을 계산하며, `DailyCheckIn` 시점에 이전 주 데이터일 경우 초기화를 수행합니다.

## 6. API 구조 (게이트웨이 중심) 
### 6.1. 주요 엔드포인트
#### AUTH
* `POST /auth/user_signup`: 사용자 회원가입
* `POST /auth/admin_signup`: 관리자 회원가입
* `POST /auth/user_signin`: 로그인
* `POST /auth/admin_signin`: 관리자 로그인
* `POST /auth/check`: 토큰 유효성 검사

#### EVENT (event)
* `POST /events/create`: 새 이벤트 생성 
* `GET /events/findAll`: 전체 이벤트 목록 조회 
* `GET /events/find/:id`: 특정 이벤트 상세 조회
* `POST /events/update/{id}`: 이벤트 수정
* `POST /events/delete/{id}`: 이벤트 삭제

#### REWARD (event-reward)
* `PUT /event/reward/daily-rewards/{id}`: 이벤트 별 일일 보상 정보 설정
* `PUT /event/reward/slot-rewards/{id}`: 이벤트의 주간 보상(슬롯) 보상 정보 설정
* `POST /event/reward/DailyCheckIn`: 사용자 일일 출석(일일 보상 획득)
* `POST /event/reward/WeeklyCheckIn`: 사용자 주간 게이지 보상 수령 (일반 사용자)
* `GET /event/reward/eventInfo`: 내 보상 수령 이력 조회 (일반 사용자)
* `GET /event/reward/admin/reward-logs`: 전체 보상 수령 이력 조회 (관리자)

### 6.2. 인증 및 인가

모든 주요 API(event-app, gateway 의 코드)는 JWT 토큰 기반 인증(`AuthGuard('jwt')`)을 사용하며, 필요한 경우 `@Roles` 데코레이터와 `RolesGuard`를 통해 역할 기반 접근 제어를 수행

### 6.3. DTO 및 유효성 검사

모든 요청 본문(body)과 쿼리 파라미터는 DTO 클래스로 정의되며, `class-validator`와 NestJS의 `ValidationPipe`를 통해 유효성이 검사됩니다. Swagger 문서를 통해 API 명세가 제공됩니다.

## 7. 구현 중 고려사항 및 해결된 문제

* **Swagger 예시 데이터와 순환 의존성 문제:** DTO 파일 최상단에 enum을 사용하는 복잡한 상수(예시 데이터)를 선언하고 이를 같은 파일 내 데코레이터의 `example` 옵션으로 사용 시, 모듈 초기화 순서 및 순환 의존성으로 인해 `TypeError`가 발셍
    * **해결:** 예시 데이터를 데코레이터 내에 직접 리터럴로 작성하거나 (enum 값은 실제 문자열 사용), 예시 데이터용 상수를 테스트 코드나 시딩 스크립트 등 애플리케이션 주요 로딩 경로와 분리된 곳에 정의하여 사용.
* **Mongoose**
    * `_id` 수동 생성 : Mongoose 자동 생성 시, Swagger 문서에서 example 설정(userId, eventId) 에 일관성이 없음(매번 달라짐), 따라서 _id 값 수동 생성을 통해 (userId = 1, eventId = 1 ) Swagger 문서를 통해 API 테스트 시, 원활한 환경을 제공하고자함
    * `CastError` (예: `Cast to ObjectId failed for value "1"`): 스키마에서 수동 생성 시, `ObjectId`를 기대하는 필드에 `ObjectId`로 변환 불가능한 문자열(예: `"1"`)을 전달했을 때 발생. ID 타입을 프로젝트 전체적으로 일관되게 관리하고, 입력값에 대한 유효성 검사 및 타입 변환을 철저히 하여 해결.
      
* **NestJS 의존성 주입:**
* `LoggerManager` 인터셉트 문제 : 본 프로젝트는 마이크로서비스 및 모듈에서 사용하는 Logger 를 공용 라이브러리에 위치시킴. 이때, Logger 의 사용 여부를 .env 에서 `INFO_LOG(boolean)` 을 확인하여 결정함. jwtstrategy : `vaildate` return 문에서 this.logger ~ 를 통한 로거 출력을 작성하였으나, `INFO_LOG(boolean) = false` 로 설정되어 `vaildate` 함수가 false 를 리턴하고 `payload` 객체가 계속해서 null 이 출력되었음.
    * **해결:** 이는 `INFO_LOG(boolean) = true` 를 통해 해결하였음

## 8. 향후 개선 방향
* **일일 조건 검증 방식 (`checkEventConditionMet`):**
    * `RewardService` 내 `checkEventConditionMet` 메소드는 특정 사용자가 주어진 조건을 만족했는지 검사합니다.
    * **현재 상태 및 향후 확장 방향:** 이 조건 로직 검증은 현재 실제 검증 로직 없이 존재합니다. -> 모든 조건에 대하여 `true` 반환
    * 실제 구현 시, 사용자 활동 로그를 추적/제공하는 별도의 서비스와 연동하여 각 조건 유형에 맞는 검증 로직을 구체화해야 합니다.

---

## Instruction
### Build
docker compose build
### Execute
docker compose up --build
docker compose up
## Install
### Docker
https://docs.docker.com/desktop/setup/install/mac-install/

#### Dockerfile 작성 참고 사이트
https://velog.io/@yellow-w/1-%EB%8F%84%EC%BB%A4%EB%A1%9C-Nestjs-%EB%A1%9C%EC%BB%AC-%EA%B0%9C%EB%B0%9C-%ED%99%98%EA%B2%BD-%EB%A7%8C%EB%93%A4%EA%B8%B0
### nestjs
npm install -g @nestjs/cli
nest new project-name
### MongoDB for Mac
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
http://localhost:27017/ -> Check :: It looks like you are trying to access MongoDB over HTTP on the native driver port
mongo
#### 만약, command not found: mongo 발생 시,
-> brew install mongodb-community-shell
#### Create User
use admin
db.createUser({user : "root", pwd : "1234", roles : [ "root" ]})
#### MongoDB Data initialize
docker exec -it event_back_mongo_db mongosh -u root -p 1234 --authenticationDatabase admin
use event
db.getCollectionNames().forEach(function(collName) {db[collName].deleteMany({});});

## ISSUE 
### Docker 실행 오류
initializing backend: retrieving system info: retrieving system version: exec: "sw_vers": executable file not found in $PATH
initializing app: getting system info: retrieving system version: exec: "sw_vers": executable file not found in $PATH
### 해결방법
open /Applications/Docker.app/

### Dockerfile 빌드 시, node_modules 권한 문제
### 권한 확인
docker compose ps
docker exec -it [컨테이너 이름 또는 ID] sh
ls -la node_modules
권한 확인 후, dockerfile 에서 npm ci 실행 전에 사용자 지정 (Defalut : root)