import { DailyRewardInfoDto, getLogDto, SlotRewardInfoDto } from '@app/common';
import { Injectable, Inject, InternalServerErrorException } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';

@Injectable()
export class EventRewardGatewayService {
   rewardServiceClient: any;
   constructor(
      @Inject('EVENT_SERVICE') private readonly eventServiceClient: ClientProxy,
   ) { }

   /**
    * 사용자 일일 출석 메시지 전송
    * @param userId 사용자 ID
    * @param eventId 이벤트 ID
    * @returns 출석 결과 및 일일 보상 정보
    * @throws RpcException (Microservice 오류 시)
    */
   async DailyCheckin(userId: number, eventId: number): Promise<any> { // TODO: 반환/페이로드 타입 DTO 사용
      const pattern = 'daily_check'; // Event Microservice의 @MessagePattern과 일치해야 함
      const payload = { userId, eventId }; // Microservice로 보낼 페이로드
      try {
         const result = await firstValueFrom(
            this.eventServiceClient.send<any, any>(pattern, payload).pipe(timeout(5000)) // TODO: 반환/페이로드 타입 DTO 사용
         );
         return result;

      } catch (error: any) {
         if (error instanceof RpcException) {
            throw error;
         }
         throw new InternalServerErrorException(`[EVENT-REWARD][SERVICE] Error calling event service ${pattern}`, { cause: error });
      }
   }

   /**
    * 사용자 게이지바 보상 수령 메시지 전송
    * @param userId 사용자 ID
    * @param eventId 이벤트 ID
    * @returns 지급된 게이지바 보상 정보
    * @throws RpcException (Microservice 오류 시)
    */
   async WeeklyCheckIn(userId: number, eventId: number): Promise<any> { // TODO: 반환/페이로드 타입 DTO 사용
      const pattern = 'weekly_check'; // Reward Microservice 컨트롤러의 @MessagePattern과 일치해야 함
      const payload = { userId, eventId }; // Microservice로 보낼 페이로드

      try {
         const result = await firstValueFrom(
            this.eventServiceClient.send<any, any>(pattern, payload).pipe(timeout(5000)) // TODO: 반환/페이로드 타입 DTO 사용
         );
         return result;

      } catch (error: any) {
         if (error instanceof RpcException) {
            throw error;
         }
         throw new InternalServerErrorException(`[EVENT-REWARD][SERVICE] Error calling event service ${pattern}`, { cause: error });
      }
   }

   /**
    * 사용자 이벤트 이력 조회 메시지 전송
    * @param userId 사용자 ID
    * @param eventId 이벤트 ID
    * @returns 사용자 진행 상태 정보 또는 null
    * @throws RpcException (Microservice 오류 시)
    */
   async getUserEventProgress(userId: number, eventId: number): Promise<any | null> { // TODO: 반환/페이로드 타입 DTO 사용
      const pattern = 'get_event_progress'; // Event Microservice의 @MessagePattern과 일치해야 함
      const payload = { userId, eventId }; // Microservice로 보낼 페이로드

      try {
         const result = await firstValueFrom(
            this.eventServiceClient.send<any | null, any>(pattern, payload).pipe(timeout(5000)) // TODO: 반환/페이로드 타입 DTO 사용
         );
         return result;

      } catch (error: any) {
         if (error instanceof RpcException) {
            throw error;
         }
         throw new InternalServerErrorException(`[EVENT-REWARD][SERVICE] Error calling event service ${pattern}`, { cause: error });
      }
   }

   /**
    * 특정 이벤트의 일일 보상 정보 설정
    * @param eventId 이벤트 ID
    * @param rewardsData 설정할 일일 보상 데이터
    * @returns 마이크로서비스의 응답 (성공 시 보통 업데이트된 이벤트 정보 또는 성공 메시지)
    */
   async setDailyRewardsForEvent(eventId: number, rewardsData: DailyRewardInfoDto[],): Promise<any> { // 실제 반환 타입으로 변경 권장 (예: EventDocument 또는 특정 응답 DTO)
      const pattern = 'set_daily_rewards';
      const payload = { eventId, rewards: rewardsData };
      try {
         return await firstValueFrom(this.eventServiceClient.send(pattern, payload).pipe(timeout(5000)),
         );
      } catch (error: any) {
         if (error instanceof RpcException) {
            throw error;
         }
         throw new InternalServerErrorException(`[EVENT-REWARD][SERVICE] Error calling event service ${pattern}`, { cause: error });
      }
   }

   /**
    * 특정 이벤트의 주간(게이지) 보상 정보 설정
    * @param eventId 이벤트 ID
    * @param rewardsData 설정할 슬롯 보상 데이터
    * @returns 마이크로서비스의 응답
    */
   async setSlotRewardsForEvent(eventId: number, rewardsData: SlotRewardInfoDto[],): Promise<any> { // 실제 반환 타입으로 변경 권장
      const pattern = 'set_weekly_rewards';
      const payload = { eventId, rewards: rewardsData };
      try {
         return await firstValueFrom(this.eventServiceClient.send(pattern, payload).pipe(timeout(5000)),
         );
      } catch (error: any) {
         if (error instanceof RpcException) {
            throw error;
         }
         throw new InternalServerErrorException(`[EVENT-REWARD][SERVICE] Error calling event service ${pattern}`, { cause: error });
      }
   }

   /**
    * 보상 로그 조회
    * @param queryDto 
    * @param requestingUserId 
    * @returns 
    */
   async getRewardLogs(
      queryDto: getLogDto,
      requestingUserId?: number,
   ): Promise<any> {
      const pattern = 'get_reward_claim_logs';
      const filters: { userId?: number; dateFrom?: string; dateTo?: string } = {};

      if (requestingUserId !== undefined) {
         filters.userId = requestingUserId;
      }

      if (queryDto.dateFrom) filters.dateFrom = queryDto.dateFrom;
      if (queryDto.dateTo) filters.dateTo = queryDto.dateTo;

      const pagination = {
         page: queryDto.page,
         limit: queryDto.limit,
      };
      const payload = { filters, pagination };
      try {
         return await firstValueFrom(
            this.eventServiceClient.send(pattern, payload).pipe(timeout(5000)));
      } catch (error: any) {
         console.error('Error Name:', error.name);
         console.error('Error Message:', error.message);
         console.error('Error Stack:', error.stack);
         throw new InternalServerErrorException('[EVENT-REWARD][SERVICE] Error calling event service', { cause: error });
      }
   }
}
