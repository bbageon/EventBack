import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventConditionType, EventStatus, MapleRewardId } from '../enum';
import { DailyRewardInfo, SlotRewardInfo } from '@app/event/schemas/reward.schema';
import { DailyRewardInfoDto, SlotRewardInfoDto } from './reward.dto';
import { Types } from 'mongoose';
import { IsArray, IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ConditionInfo } from '@app/event/schemas/event.schema';

/** 일일 보상 예시 */
const dailyRewardsDataForEvent: DailyRewardInfoDto[] = [
  { day: 1, rewardId: MapleRewardId.MESO_1M, quantity: 1 }, // 100만 메소
  { day: 2, rewardId: MapleRewardId.POWER_ELIXIR_X10, quantity: 3 }, // 파워 엘릭서 30개 (10개묶음 3개)
  { day: 3, rewardId: MapleRewardId.EVENT_COIN_10, quantity: 5 }, // 이벤트 주화 50개 (10개묶음 5개)
  { day: 4, rewardId: MapleRewardId.EXPERIENCE_COUPON_2X_15MIN_X1, quantity: 2 }, // 경험치 2배 쿠폰 (15분) 2개
  { day: 5, rewardId: MapleRewardId.MILEAGE_500, quantity: 1 }, // 500 마일리지
  { day: 6, rewardId: MapleRewardId.SUSPICIOUS_CUBE_X50, quantity: 1 }, // 수상한 큐브 50개
  { day: 7, rewardId: MapleRewardId.PREPARED_SPIRIT_PENDANT_3D, quantity: 1 }, // 준비된 정령의 펜던트 (3일)

  // 2주차: 강화 및 추가 성장 지원
  { day: 8, rewardId: MapleRewardId.MESO_10M, quantity: 1 }, // 1000만 메소
  { day: 9, rewardId: MapleRewardId.TRAIT_BOOST_POTION_X1, quantity: 1 }, // 성향 성장의 비약
  { day: 10, rewardId: MapleRewardId.EVENT_COIN_50, quantity: 2 }, // 이벤트 주화 100개 (50개묶음 2개)
  { day: 11, rewardId: MapleRewardId.SAFETY_CHARM_X5, quantity: 1 }, // 세이프티 참 5개 (기간제)
  { day: 12, rewardId: MapleRewardId.RED_CUBE_X1, quantity: 2 }, // 레드 큐브 2개
  { day: 13, rewardId: MapleRewardId.TELEPORT_WORLD_MAP_7D_X1, quantity: 1 }, // 텔레포트 월드맵 (7일)
  { day: 14, rewardId: MapleRewardId.KARMA_POWERFUL_REBIRTH_FLAME_X1, quantity: 3 }, // 카르마 강환불 3개

  // 3주차: 심볼 및 코어 강화, 유틸리티
  { day: 15, rewardId: MapleRewardId.MAPLE_POINTS_500, quantity: 1 }, // 500 메이플포인트
  { day: 16, rewardId: MapleRewardId.CORE_GEMSTONE_X10, quantity: 1 }, // 코어 젬스톤 10개
  { day: 17, rewardId: MapleRewardId.EXPERIENCE_COUPON_2X_30MIN_X1, quantity: 2 }, // 경험치 2배 쿠폰 (30분) 2개
  { day: 18, rewardId: MapleRewardId.EVENT_COIN_100, quantity: 1 }, // 이벤트 주화 100개
  { day: 19, rewardId: MapleRewardId.PENDANT_SLOT_EXPANSION_30D_X1, quantity: 1 }, // 펜던트 슬롯 확장권 (30일)
  { day: 20, rewardId: MapleRewardId.BLACK_CUBE_X1, quantity: 1 }, // 블랙 큐브 1개
  { day: 21, rewardId: MapleRewardId.SELECTIVE_ARCANE_SYMBOL_X20, quantity: 1 }, // 선택 아케인심볼 20개

  // 4주차 및 마지막 주: 고급 아이템 및 치장/특별 보상
  { day: 22, rewardId: MapleRewardId.MESO_100M, quantity: 1 }, // 1억 메소
  { day: 23, rewardId: MapleRewardId.MIRACLE_CIRCULATOR_X3, quantity: 1 }, // 미라클 서큘레이터 3개
  { day: 24, rewardId: MapleRewardId.CHOICE_HAIR_COUPON_X1, quantity: 1 }, // 초이스 헤어쿠폰
  { day: 25, rewardId: MapleRewardId.EVENT_COIN_100, quantity: 2 }, // 이벤트 주화 200개 (100개묶음 2개)
  { day: 26, rewardId: MapleRewardId.KARMA_MEISTER_CUBE_X1, quantity: 2 }, // 카르마 명장의 큐브 2개
  { day: 27, rewardId: MapleRewardId.EXPERIENCE_NODESTONE_X1, quantity: 1 }, // 경험의 코어 젬스톤
  { day: 28, rewardId: MapleRewardId.KARMA_ETERNAL_REBIRTH_FLAME_X1, quantity: 2 }, // 카르마 영환불 2개
  { day: 29, rewardId: MapleRewardId.EVENT_RANDOM_DAMAGE_SKIN_BOX_X1, quantity: 1 }, // 이벤트 데미지 스킨 상자
  { day: 30, rewardId: MapleRewardId.TYPHOON_GROWTH_POTION_X1, quantity: 1 }, // 태풍 성장의 비약
  { day: 31, rewardId: MapleRewardId.UNIQUE_POTENTIAL_SCROLL_100_X1, quantity: 1 }, // 유니크 잠재100% 또는 KARMA_STAR_FORCE_15_SCROLL_X1 등 가치 높은 아이템
];
/** 주간 보상 예시 */
const slotRewardsDataForEvent: SlotRewardInfoDto[] = [
  // --- 슬롯 1 보상 ---
  {
    slot: 1,
    rewards: [
      { rewardId: MapleRewardId.EVENT_COIN_10, quantity: 2, probability: 0.6 }, // 이벤트 주화 20개
      { rewardId: MapleRewardId.POWER_ELIXIR_X10, quantity: 1, probability: 0.3 }, // 파워 엘릭서 10개
      { rewardId: MapleRewardId.MESO_1M, quantity: 1, probability: 0.1 },          // 100만 메소
    ],
  },
  // --- 슬롯 2 보상 ---
  {
    slot: 2,
    rewards: [
      { rewardId: MapleRewardId.EVENT_COIN_10, quantity: 3, probability: 0.5 }, // 이벤트 주화 30개
      { rewardId: MapleRewardId.EXPERIENCE_COUPON_2X_15MIN_X1, quantity: 1, probability: 0.3 }, // 경험치 2배 쿠폰 (15분)
      { rewardId: MapleRewardId.SUSPICIOUS_CUBE_X50, quantity: 1, probability: 0.2 }, // 수상한 큐브 50개
    ],
  },
  // --- 슬롯 3 보상 ---
  {
    slot: 3,
    rewards: [
      { rewardId: MapleRewardId.EVENT_COIN_50, quantity: 1, probability: 0.5 }, // 이벤트 주화 50개
      { rewardId: MapleRewardId.TRAIT_BOOST_POTION_X1, quantity: 1, probability: 0.3 }, // 성향 성장의 비약
      { rewardId: MapleRewardId.RED_CUBE_X1, quantity: 1, probability: 0.2 },          // 레드 큐브 1개
    ],
  },
  // --- 슬롯 4 보상 ---
  {
    slot: 4,
    rewards: [
      { rewardId: MapleRewardId.EVENT_COIN_50, quantity: 2, probability: 0.4 }, // 이벤트 주화 100개
      { rewardId: MapleRewardId.CORE_GEMSTONE_X10, quantity: 1, probability: 0.3 }, // 코어 젬스톤 10개
      { rewardId: MapleRewardId.KARMA_POWERFUL_REBIRTH_FLAME_X1, quantity: 1, probability: 0.2 }, // 카르마 강환불 1개
      { rewardId: MapleRewardId.MVP_PLUS_EXP_BUFF_X1, quantity: 1, probability: 0.1 }, // MVP 플러스 EXP 버프
    ],
  },
  // --- 슬롯 5 보상 ---
  {
    slot: 5,
    rewards: [
      { rewardId: MapleRewardId.EVENT_COIN_100, quantity: 1, probability: 0.4 }, // 이벤트 주화 100개
      { rewardId: MapleRewardId.EXPERIENCE_COUPON_2X_30MIN_X1, quantity: 1, probability: 0.3 }, // 경험치 2배 쿠폰 (30분)
      { rewardId: MapleRewardId.BLACK_CUBE_X1, quantity: 1, probability: 0.2 },          // 블랙 큐브 1개
      { rewardId: MapleRewardId.SELECTIVE_ARCANE_SYMBOL_X20, quantity: 1, probability: 0.1 }, // 선택 아케인심볼 20개
    ],
  },
  // --- 슬롯 6 보상 ---
  {
    slot: 6,
    rewards: [
      { rewardId: MapleRewardId.EVENT_COIN_100, quantity: 2, probability: 0.4 }, // 이벤트 주화 200개
      { rewardId: MapleRewardId.KARMA_MEISTER_CUBE_X1, quantity: 1, probability: 0.25 }, // 카르마 명장의 큐브 1개
      { rewardId: MapleRewardId.EXPERIENCE_NODESTONE_X1, quantity: 1, probability: 0.2 }, // 경험의 코어 젬스톤
      { rewardId: MapleRewardId.EVENT_RANDOM_CHAIR_BOX_X1, quantity: 1, probability: 0.15 }, // 이벤트 의자 상자
    ],
  },
  // --- 슬롯 7 보상 (최종 보상) ---
  {
    slot: 7,
    rewards: [
      { rewardId: MapleRewardId.EVENT_COIN_100, quantity: 3, probability: 0.35 }, // 이벤트 주화 300개
      { rewardId: MapleRewardId.UNIQUE_POTENTIAL_SCROLL_100_X1, quantity: 1, probability: 0.05 }, // 유니크 잠재 100% (매우 희귀)
      { rewardId: MapleRewardId.KARMA_STAR_FORCE_15_SCROLL_X1, quantity: 1, probability: 0.1 }, // 카르마 15성 스타포스 강화권
      { rewardId: MapleRewardId.TYPHOON_GROWTH_POTION_X1, quantity: 1, probability: 0.2 }, // 태풍 성장의 비약
      { rewardId: MapleRewardId.SELECTIVE_AUTHENTIC_SYMBOL_X10, quantity: 1, probability: 0.15 }, // 선택 어센틱심볼 10개
      { rewardId: MapleRewardId.EVENT_OUTFIT_SET_BOX_PERMANENT, quantity: 1, probability: 0.15 }, // 이벤트 코디 세트 상자 (영구)
    ],
  },
];

const weeklyGaugeDailyConditions: ConditionInfo[] = [
  {
    type: EventConditionType.MONSTER_KILL_ANY, // 조건 유형: 레벨 범위 몬스터 처치
    parameters: {
      count: 300, // 처치 수
      // levelRangeOffset: 20 // 예: 캐릭터 레벨 기준 +-20 범위의 몬스터
    },
    description: "1일차: 오늘의 몬스터 300마리 처치하고 게이지 채우기!",
  },
  {
    type: EventConditionType.PLAYTIME_SESSION, // 조건 유형: 접속 시간 달성
    parameters: {
      minutes: 30, // 접속 유지 시간 (분)
    },
    description: "2일차: 30분 동안 접속 유지하고 게이지 채우기!",
  },
  {
    type: EventConditionType.ITEM_COLLECT, // 조건 유형: 특정 아이템 수집
    parameters: {
      itemId: "EVENT_ITEM_SPROUT", // 수집할 아이템의 ID (예시)
      count: 20, // 수집할 아이템 개수
    },
    description: "3일차: 이벤트 새싹 20개 모으고 게이지 채우기!",
  },
  {
    type: EventConditionType.QUEST_COMPLETE_SPECIFIC, // 조건 유형: 특정 퀘스트 완료
    parameters: {
      questId: "DAILY_EVENT_QUEST_001", // 완료해야 할 퀘스트의 ID (예시)
    },
    description: "4일차: '오늘의 특별 임무' 퀘스트 완료하고 게이지 채우기!",
  },
  {
    type: EventConditionType.BOSS_KILL_SPECIFIC, // 조건 유형: 특정 보스 처치
    parameters: {
      bossId: "EASY_CYGNUS", // 처치할 보스 ID (예시)
      count: 1, // 처치 횟수
    },
    description: "5일차: 이지 시그너스 1회 클리어하고 게이지 채우기!",
  },
  {
    type: EventConditionType.MINIGAME_PLAY_COUNT, // 조건 유형: 미니게임 참여
    parameters: {
      gameId: "EVENT_MINIGAME_YUTNORI", // 참여할 미니게임 ID (예시)
      count: 2, // 참여 횟수
    },
    description: "6일차: 이벤트 윷놀이 2회 참여하고 게이지 채우기!",
  },
  {
    type: EventConditionType.MONSTER_KILL_ANY, // 조건 유형: 레벨 범위 몬스터 처치 (7일차는 더 많이)
    parameters: {
      count: 500,
      // levelRangeOffset: 20
    },
    description: "7일차: 오늘의 몬스터 500마리 처치하고 주간 게이지 완성!",
  },
];

// --- 이벤트 관리 DTO 정의 ---
export class CreateEventDto {
  @ApiProperty({
    description: '이벤트 고유 ID (숫자, 필수)',
    example: 1, // 예시로 숫자 1 사용
    type: Number,
  })
  @IsNumber({}, { message: '이벤트 ID는 숫자여야 합니다.' })
  @IsNotEmpty({ message: '이벤트 ID는 필수 항목입니다.' })
  @Min(1, { message: '이벤트 ID는 1 이상이어야 합니다.' }) // ID 정책에 따라 설정
  _id: number; // 타입을 number로 변경, 클라이언트가 제공

  @ApiProperty({
    description: '이벤트 이름 (필수, 공백 없이)',
    example: '여름맞이물총이벤트',
  })
  @IsString({ message: '이벤트 이름은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '이벤트 이름은 필수 항목입니다.' })
  @Matches(/^\S+$/, { message: '이벤트 이름에는 공백을 포함할 수 없습니다.' }) // 스키마의 match 조건 반영
  @Type(() => String) // 명시적 타입 변환 (class-transformer) - Mongoose의 trim은 DB 저장 전 처리
  name: string;

  @ApiPropertyOptional({ description: '이벤트 상세 설명', example: '매일 출석하고 보상받으세요!' })
  @IsOptional()
  @IsString({ message: '이벤트 상세 설명은 문자열이어야 합니다.' })
  @Type(() => String)
  description?: string;

  @ApiProperty({ description: '이벤트 초기 상태', enum: EventStatus, example: EventStatus.ACTIVE })
  @IsNotEmpty({ message: '이벤트 상태는 필수 항목입니다.' })
  @IsEnum(EventStatus, { message: '유효하지 않은 이벤트 상태입니다.' })
  status: EventStatus; // 스키마에서 required: true 이므로 DTO에서도 필수

  @ApiProperty({ description: '이벤트 시작 일시', type: Date, example: '2025-07-01T00:00:00Z' })
  @IsNotEmpty({ message: '이벤트 시작 일시는 필수 항목입니다.' })
  @Type(() => Date) // 문자열을 Date 객체로 변환
  @IsDate({ message: '유효한 날짜 형식이어야 합니다.' })
  startDate: Date;

  @ApiProperty({ description: '이벤트 종료 일시', type: Date, example: '2025-07-31T23:59:59Z' })
  @IsNotEmpty({ message: '이벤트 종료 일시는 필수 항목입니다.' })
  @Type(() => Date) // 문자열을 Date 객체로 변환
  @IsDate({ message: '유효한 날짜 형식이어야 합니다.' })
  endDate: Date;

  @ApiProperty({ description: '이벤트 유형 식별자', example: 'WEEKLY_CHECKIN_GAUGE' })
  @IsString({ message: '이벤트 유형은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '이벤트 유형은 필수 항목입니다.' }) // DTO에 명시되어 있으므로 필수로 간주
  eventType: string;

  @ApiPropertyOptional({ description: '일일 보상 목록', type: [DailyRewardInfoDto], example : dailyRewardsDataForEvent })
  @IsOptional()
  @IsArray({ message: '일일 고정 보상 목록은 배열이어야 합니다.' })
  @ValidateNested({ each: true, message: '각 일일 고정 보상이 유효해야 합니다.' })
  @Type(() => DailyRewardInfoDto)
  dailyFixedRewards?: DailyRewardInfoDto[];

  @ApiPropertyOptional({ description: '주간 보상 조건 목록', type: [ConditionInfo], example : weeklyGaugeDailyConditions })
  @IsOptional()
  @IsArray({ message: '주간 보상 달성 조건은 배열, 길이 7' })
  @ValidateNested({ each: true, message: '각 일일 고정 보상이 유효해야 합니다.' })
  @Type(() => ConditionInfo)
  conditions?: ConditionInfo[]; 

  @ApiPropertyOptional({ description: '주간 보상 목록, 길이 7', type: [SlotRewardInfoDto], example : slotRewardsDataForEvent })
  @IsOptional()
  @IsArray({ message: '게이지 레벨별 확률 보상 목록은 배열이어야 합니다.' })
  @ValidateNested({ each: true, message: '각 게이지 레벨별 확률 보상이 유효해야 합니다.' })
  @Type(() => SlotRewardInfoDto)
  slotRewards?: SlotRewardInfoDto[];
}

export class UpdateEventDto {
  @ApiPropertyOptional({ description: '이벤트 이름 (수정 시 입력)', example: '수정버전_이벤트' }) // 공백 없는 예시로 변경
  @IsOptional()
  @IsString({ message: '이벤트 이름은 문자열이어야 합니다.' })
  @Matches(/^\S+$/, { message: '이벤트 이름에는 공백을 포함할 수 없습니다.' }) // 공백 없음 검증
  @Type(() => String) // 명시적 타입 변환 (class-transformer)
  name?: string;

  @ApiPropertyOptional({ description: '이벤트 상세 설명 (수정 시 입력)' })
  @IsOptional()
  @IsString({ message: '이벤트 상세 설명은 문자열이어야 합니다.' })
  @Type(() => String)
  description?: string;

  @ApiPropertyOptional({ description: '이벤트 상태 (수정 시 변경)', enum: EventStatus })
  @IsOptional()
  @IsEnum(EventStatus, { message: '유효하지 않은 이벤트 상태입니다.' })
  status?: EventStatus;

  @ApiPropertyOptional({ description: '이벤트 시작 일시 (수정 시 변경)', type: Date, example: '2025-07-01T00:00:00Z' })
  @IsOptional()
  @Type(() => Date) // 문자열을 Date 객체로 변환 (class-transformer)
  @IsDate({ message: '유효한 날짜 형식이여야 합니다.' })
  startDate?: Date;

  @ApiPropertyOptional({ description: '이벤트 종료 일시 (수정 시 변경)', type: Date, example: '2025-07-31T23:59:59Z' })
  @IsOptional()
  @Type(() => Date) // 문자열을 Date 객체로 변환 (class-transformer)
  @IsDate({ message: '유효한 날짜 형식이여야 합니다.' })
  endDate?: Date;

  @ApiPropertyOptional({ description: '일일 출석 게이지 이벤트의 일일 고정 보상 목록 (수정 시 변경)', type: [DailyRewardInfoDto] })
  @IsOptional()
  @IsArray({ message: '일일 고정 보상 목록은 배열이어야 합니다.' })
  @ValidateNested({ each: true, message: '각 일일 고정 보상이 유효해야 합니다.' })
  @Type(() => DailyRewardInfoDto) // DailyRewardInfo -> DailyRewardInfoDto 로 수정
  dailyFixedRewards?: DailyRewardInfoDto[];

  @ApiPropertyOptional({ description: '일일 출석 게이지 이벤트의 게이지 레벨별 확률 보상 목록 (수정 시 변경)', type: [SlotRewardInfoDto] })
  @IsOptional()
  @IsArray({ message: '게이지 레벨별 확률 보상 목록은 배열이어야 합니다.' })
  @ValidateNested({ each: true, message: '각 게이지 레벨별 확률 보상이 유효해야 합니다.' })
  @Type(() => SlotRewardInfoDto) // SlotRewardInfo -> SlotRewardInfoDto 로 수정
  slotRewards?: SlotRewardInfoDto[];
}
// 이벤트 이력 조회 응답 
export class EventResponseDto {
  @ApiProperty({ description: '이벤트 고유 ID', type: String, example: '60d5ec49982d11001c5a3b6e' })
  id: string; // _id 를 문자열 id 로 매핑

  @ApiProperty({ description: '이벤트 이름', example: '여름맞이 물총 이벤트' })
  name: string;

  @ApiPropertyOptional({ description: '이벤트 상세 설명', example: '매일 출석하고 보상받으세요!' })
  description?: string;

  @ApiProperty({ description: '이벤트 상태', enum: EventStatus, example: EventStatus.ACTIVE })
  status: EventStatus;

  @ApiProperty({ description: '이벤트 시작 일시', type: Date, example: '2025-07-01T00:00:00Z' })
  startDate: Date;

  @ApiProperty({ description: '이벤트 종료 일시', type: Date, example: '2025-07-31T23:59:59Z' })
  endDate: Date;

  @ApiProperty({ description: '이벤트를 생성한 사용자 ID', type: String, example: '60d5ec49982d11001c5a3b6a' })
  createdBy: string;

  @ApiPropertyOptional({ description: '일일 출석 게이지 이벤트의 일일 고정 보상 목록', type: [DailyRewardInfo] })
  dailyFixedRewards?: DailyRewardInfo[];

  // 게이지 레벨별 확률 보상 목록 (주간 출석 게이지 이벤트용)
  @ApiPropertyOptional({ description: '일일 출석 게이지 이벤트의 게이지 레벨별 확률 보상 목록', type: [SlotRewardInfo] })
  slotRewards?: SlotRewardInfo[];

  @ApiProperty({ description: '생성 일시', type: Date, example: '2025-06-15T10:00:00Z' })
  createdAt: Date;

  @ApiProperty({ description: '수정 일시', type: Date, example: '2025-06-16T11:00:00Z' })
  updatedAt: Date;

}