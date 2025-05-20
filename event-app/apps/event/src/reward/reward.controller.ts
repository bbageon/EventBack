import { Controller } from '@nestjs/common';
import { RewardService } from './reward.service';
import { Ctx, MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { DailyCheckinRequestDto, DailyRewardInfoDto, SlotRewardInfoDto } from '@app/common';

@Controller()
export class RewardController {
  constructor(private readonly rewardService: RewardService) {
    interface GetSimplifiedRewardLogsPayload {
      filters: {
        userId?: number;
        dateFrom?: string | Date;
        dateTo?: string | Date;
      };
      pagination?: { page?: number; limit?: number };
    }
  }

  /**
   * 사용자 일일 출석 메시지 핸들러
   * @param payload 페이로드 (예: { userId: string, eventId: string })
   * @param context
   * @returns 출석 결과 및 지급된 일일 보상 정보
   */
  @MessagePattern('daily_check')
  async handleCheckinMessage(@Payload() payload: DailyCheckinRequestDto): Promise<{ status: string, dailyReward?: { rewardId: string, quantity: number } }> { 
    const userId = payload.userId;
    const eventId = payload.eventId;
    if (!userId || !eventId) {
      throw new RpcException('Invalid payload: userId and eventId are required');
    }
    try {
      const result = await this.rewardService.DailyCheckIn(userId, eventId);
      return result;
    } catch (error: any) {
      throw new RpcException(error);
    }
  }


  /**
   * 사용자 주간 보상 수령 메시지 핸들러
   * @param payload
   * @param context
   * @returns 지급된 게이지바 보상 정보
   */
  @MessagePattern('weekly_check') // <-- 메시지 패턴 유지
  // async handleClaimGaugeRewardMessage(@Payload() payload: ClaimRewardPayloadDto, @Ctx() context: any): Promise<ClaimRewardResultDto> { // DTO 사용 시
  async handleClaimGaugeRewardMessage(@Payload() payload: any, @Ctx() context: any): Promise<any> { // DTO 사용 전 임시 타입 유지
    const userId = payload.userId;
    const eventId = payload.eventId;
    if (!userId || !eventId) {
      throw new RpcException('Invalid payload: userId and eventId are required');
    }
    try {
      const result = await this.rewardService.WeeklyCheckIn(userId, eventId);
      return result;
    } catch (error: any) {
      throw new RpcException(error);
    }
  }


  /**
   * 사용자 이벤트 진행 상태 조회 메시지 핸들러
   * @param payload 페이로드
   * @param context Microservice 컨텍스트
   * @returns 사용자 진행 상태 정보
   */
  @MessagePattern('get_event_progress')
  // async handleGetUserEventProgressMessage(@Payload() payload: GetUserEventProgressPayloadDto, @Ctx() context: any): Promise<UserCheckinProgressDto | null> { // DTO 사용 시
  async handleGetUserEventProgressMessage(@Payload() payload: any, @Ctx() context: any): Promise<any | null> { // DTO 사용 전 임시 타입 유지
    const userId = payload.userId;
    const eventId = payload.eventId;
    if (!userId || !eventId) {
      throw new RpcException('Invalid payload: userId and eventId are required');
    }
    try {
      const result = await this.rewardService.getUserEventProgress(userId, eventId);
      return result; // 결과 (서비스에서 DTO로 매핑)
    } catch (error: any) {
      throw new RpcException(error);
    }
  }

  /**
 * 특정 이벤트의 일일 보상 정보 설정/업데이트
 * @param payload { eventId: string, rewards: DailyRewardInfoDto[] }
 */
  @MessagePattern('set_daily_rewards')
  async handleSetDailyRewards(
    @Payload() payload: { eventId: string, rewards: DailyRewardInfoDto[] }): Promise<any> { // 성공 시 보통 업데이트된 Event 또는 단순 성공 메시지/객체 반환
    const { eventId, rewards } = payload;
    if (!eventId || !rewards) {
      throw new RpcException('Invalid payload: eventId and rewards array are required for set_daily_rewards.');
    }
    try {
      const result = await this.rewardService.setDailyRewards(eventId, rewards);
      return { status: 'success', message: '일일 보상 정보가 성공적으로 설정되었습니다.', data: result };
    } catch (error: any) {
      throw new RpcException(error.message || '일일 보상 정보 설정 중 오류가 발생했습니다.');
    }
  }

  /**
   * 특정 이벤트의 주간(게이지) 보상 정보 설정/업데이트
   * @param payload { eventId: string, rewards: SlotRewardInfoDto[] }
   */
  @MessagePattern('set_weekly_rewards')
  async handleSetSlotRewards(@Payload() payload: {eventId : string, rewards : SlotRewardInfoDto[]}): Promise<any> {
    const { eventId, rewards } = payload;
    if (!eventId || !rewards) {
      throw new RpcException('Invalid payload: eventId and rewards array are required for set_slot_rewards.');
    }
    try {
      const result = await this.rewardService.setSlotRewards(eventId, rewards);
      return { status: 'success', message: '슬롯 보상 정보가 성공적으로 설정되었습니다.', data: result };
    } catch (error: any) {
      throw new RpcException(error.message || '슬롯 보상 정보 설정 중 오류가 발생했습니다.');
    }
  }

  @MessagePattern('get_reward_claim_logs') // 기존 패턴 유지
  async handleGetRewardClaimLogs(@Payload() payload: any,): Promise<any> {
    const filters = payload.filters || {};
    if (filters.dateFrom) filters.dateFrom = new Date(filters.dateFrom);
    if (filters.dateTo) filters.dateTo = new Date(filters.dateTo);
  
    try {
      return await this.rewardService.getRewardClaimLogs(filters, payload.pagination);
    } catch (error: any) {
      throw new RpcException(error.message || '슬롯 보상 정보 설정 중 오류가 발생했습니다.');
    }
  }
}
