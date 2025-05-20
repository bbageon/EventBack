import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsString, Max, Min, ValidateNested } from "class-validator";
import { MapleRewardId } from "../enum";


// 보상 옵션 정보 DTO
export class RewardOptionDto {
  @ApiProperty({ description: '보상 ID', example: MapleRewardId.MESO_1M })
  @IsString({ message: '보상 ID는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '보상 ID는 필수 항목입니다.' })
  @IsEnum(MapleRewardId)
  rewardId: MapleRewardId;

  @ApiProperty({ description: '보상 수량', example: 10, minimum: 1 })
  @IsNumber({}, { message: '보상 수량은 숫자여야 합니다.' })
  @Min(1, { message: '보상 수량은 최소 1 이상이어야 합니다.' })
  @IsNotEmpty({ message: '보상 수량은 필수 항목입니다.' })
  quantity: number;

  @ApiProperty({ description: '확률 (0.0 ~ 1.0)', example: 0.5, minimum: 0, maximum: 1 })
  @IsNumber({}, { message: '확률은 숫자여야 합니다.' })
  @Min(0, { message: '확률은 최소 0 이상이어야 합니다.' })
  @Max(1, { message: '확률은 최대 1 이하여야 합니다.' })
  @IsNotEmpty({ message: '확률은 필수 항목입니다.' })
  probability: number;
}

// 일일 보상
export class DailyRewardInfoDto {
  @ApiProperty({ description: '설정할 출석 일차', example: 1, minimum: 1, maximum: 31 })
  @IsNumber({},)
  @Min(1, { message: '출석 일차는 최소 1 이상' })
  @Max(31, { message: '출석 일차는 최대 31 이하' })
  @IsNotEmpty({ message: '출석 일차는 필수 항목입니다.' })
  day: number;

  @ApiProperty({ description: '보상 ID', example: MapleRewardId.MESO_1M })
  @IsString({ message: '보상 ID는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '보상 ID는 필수 항목입니다.' })
  @IsEnum(MapleRewardId)
  rewardId: MapleRewardId;

  @ApiProperty({ description: '보상 수량', example: 1, minimum: 1 })
  @IsNumber({}, { message: '보상 수량은 숫자여야 합니다.' })
  @Min(1, { message: '보상 수량은 최소 1 이상이어야 합니다.' })
  @IsNotEmpty({ message: '보상 수량은 필수 항목입니다.' })
  quantity: number;
}

// 주간 보상
export class SlotRewardInfoDto {
  @ApiProperty({ description: '게이지 칸 번호 (1-7)', example: 1, minimum: 1, maximum: 7 })
  @IsNumber({}, { message: '게이지 칸 번호는 숫자여야 합니다.' })
  @Min(1, { message: '게이지 칸 번호는 최소 1 이상이어야 합니다.' })
  @Max(7, { message: '게이지 칸 번호는 최대 7 이하여야 합니다.' })
  @IsNotEmpty({ message: '게이지 칸 번호(slot)는 필수 항목입니다.' }) // <<< slotRewards.0.slot 오류 방지
  slot: number;

  @ApiProperty({ description: '해당 슬롯 보상 옵션 목록', type: [RewardOptionDto] })
  @IsArray({ message: '보상 옵션 목록은 배열이어야 합니다.' })
  @ValidateNested({ each: true, message: '각 보상 옵션이 유효해야 합니다.' }) // 배열의 각 요소를 RewardOptionDto 기준으로 검증
  @Type(() => RewardOptionDto) // class-transformer가 배열 내 객체를 RewardOptionDto 타입으로 변환하도록 지시
  @IsNotEmpty({ message: '보상 옵션 목록은 필수 항목입니다.' }) // 슬롯에 보상이 하나라도 있어야 한다면
  // @ArrayMinSize(1, { message: '각 슬롯에는 최소 하나의 보상 옵션이 있어야 합니다.' }) // 필요시 추가
  rewards: RewardOptionDto[];
}


// 사용자 일일 출석 요청 DTO
export class DailyCheckinRequestDto {
  @ApiProperty({ description: '유저 ID', example: '1' })
  userId: number; // 이벤트 ID
  @ApiProperty({ description: '이벤트 ID', example: '1' })
  eventId: number; // 이벤트 ID
}

// 사용자 일일 출석 응답 DTO (EventService.DailyCheckIn 반환 타입 미러링)
export class DailyCheckinResponseDto {
  @ApiProperty({ description: '출석 처리 상태', example: 'checked_in' })
  status: string; // 'checked_in' 또는 'checked_in_max_gauge' 등

  @ApiPropertyOptional({ description: '지급된 일일 보상 정보 (출석 성공 시)', type: RewardOptionDto }) // RewardOptionDto 사용
  dailyReward?: RewardOptionDto; // 일일 보상 정보 (rewardId, quantity)
}

// 사용자 주간 보상 수령 요청 DTO
export class WeeklyCheckInRequestDto {
  @ApiProperty({ description: '유저 ID', example: '1' })
  userId: number; // 이벤트 ID
  @ApiProperty({ description: '이벤트 ID', example: '1' })
  eventId: number; // 이벤트 ID
}

// 사용자 주간 보상 수령 응답 DTO (EventService.claimGaugeReward 반환 타입 미러링)
export class WeeklyCheckInResponseDto {
  @ApiProperty({ description: '보상 수령 처리 상태', example: 'gauge_reward_claimed' })
  status: string; // 'gauge_reward_claimed' 또는 'already_claimed_this_level' 등

  @ApiPropertyOptional({ description: '지급된 게이지바 보상 정보 (수령 성공 시)', type: RewardOptionDto }) // RewardOptionDto 사용
  gaugeReward?: RewardOptionDto; // 게이지바 보상 정보 (rewardId, quantity)
}

// 사용자 이벤트 진행 상태 조회 요청 DTO (Query Parameter 사용 시)
export class GetUserEventProgressRequestDto {
  // userId 는 토큰에서 가져옴
  @ApiProperty({ description: '진행 상태를 조회할 이벤트 ID', example: '1' })
  eventId: number; // 이벤트 ID
}

// 사용자 이벤트 진행 상태 조회 응답 DTO (UserSummerEventProgress 스키마 미러링)
export class UserEventProgressResponseDto {
  @ApiProperty({ description: '진행 상태 문서 ID', type: String, example: '1' })
  id: string; // _id 를 문자열 id 로 매핑

  @ApiProperty({ description: '연결된 이벤트 ID', type: String, example: '1' })
  eventId: number; // ObjectId 를 문자열 ID 로 매핑

  @ApiProperty({ description: '사용자 ID', type: String, example: '1' })
  userId: number; // ObjectId 를 문자열 ID 로 매핑

  @ApiProperty({ description: '현재 주간 누적 출석 횟수 (게이지 레벨)', example: 3, minimum: 0, maximum: 7 })
  currentStreak: number;

  @ApiPropertyOptional({ description: '마지막 출석 날짜', type: Date, example: '2025-07-18T12:00:00Z' })
  lastCheckinDate?: Date; // 스키마 필드 이름 lastCheckinDate 또는 last_Date 에 따라 수정

  @ApiProperty({ description: '이번 주 이미 보상 수령한 게이지 레벨 목록', type: [Number], example: [1, 2] })
  claimedLevels: number[]; // 스키마 필드 이름 claimedSlots 또는 Check_Slots 에 따라 수정 (Check_Slots 사용)

  @ApiProperty({ description: '이번 주간 출석 시작일 (목요일)', type: Date, example: '2025-07-14T00:00:00Z' })
  weekStartDate: Date;

  @ApiProperty({ description: '생성 일시', type: Date, example: '2025-07-15T10:00:00Z' })
  createdAt: Date;

  @ApiProperty({ description: '수정 일시', type: Date, example: '2025-07-18T12:00:00Z' })
  updatedAt: Date;
}
