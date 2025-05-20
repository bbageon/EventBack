import {
     Injectable,
     InternalServerErrorException,
     NotFoundException,
     ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema as MongooseSchema } from 'mongoose';

// Schema
import {
     ConditionInfo,
     Event,
     EventDocument,
} from '../schemas/event.schema';
import {
     UserSummerEventProgress,
     UserEventProgressDocument,
} from '../schemas/userEventProgress.schema';
import { RewardOption } from '../schemas/reward.schema';
import { RewardType, RewardClaimLog, RewardClaimLogDocument } from '../schemas/reward-log.schema';
// Libs
import { EventConditionType, EventStatus, MapleRewardId } from '@app/common';
// Dto
import {
     DailyRewardInfoDto,
     SlotRewardInfoDto,
} from '@app/common';


@Injectable()
export class RewardService {
     constructor(
          @InjectModel(Event.name) private eventModel: Model<EventDocument>,
          @InjectModel(UserSummerEventProgress.name) private userProgressModel: Model<UserEventProgressDocument>,
          @InjectModel(RewardClaimLog.name)
          private rewardClaimLogModel: Model<RewardClaimLogDocument>
     ) { }

     /**
    * 일일 보상 정보를 설정/업데이트
    * @param eventId 
    * @param dailyRewardsData
    * @returns
    */
     async setDailyRewards(eventId: string, dailyRewardsData: DailyRewardInfoDto[],): Promise<EventDocument> {
          const event = await this.eventModel.findOne({ _id: eventId }).exec();;
          if (!event) {
               throw new NotFoundException(`ID '${eventId}'에 해당하는 이벤트를 찾을 수 없습니다.`);
          }
          event.dailyRewardsPool = dailyRewardsData;
          try {
               const updatedEvent = await event.save(); // 여기서 Mongoose 유효성 검사가 수행됩니다.
               return updatedEvent;
          } catch (error: any) {
               console.error('Error Name:', error.name);
               console.error('Error Message:', error.message);
               console.error('Error Stack:', error.stack);
               throw new InternalServerErrorException('An error occurred while creating the event', `${(error as any).message}`);
          }
     }

     /**
      * 특정 이벤트의 주간(게이지) 보상 정보를 설정/업데이트
      * @param eventId 
      * @param slotRewardsData 
      * @returns 
      */
     async setSlotRewards(eventId: string, slotRewardsData: SlotRewardInfoDto[]): Promise<EventDocument> {
          const event = await this.eventModel.findOne({ _id: eventId }).exec();
          if (!event) {
               throw new NotFoundException(`ID '${eventId}'에 해당하는 이벤트를 찾을 수 없습니다.`);
          }
          event.slotRewards = slotRewardsData; // DTO가 스키마와 호환된다고 가정
          try {
               const updatedEvent = await event.save();
               return updatedEvent;
          } catch (error: any) {
               console.error('Error Name:', error.name);
               console.error('Error Message:', error.message);
               console.error('Error Stack:', error.stack);
               throw new InternalServerErrorException('An error occurred while creating the event', `${(error as any).message}`);
          }
     }
     private async logRewardClaim(
          userId: number, // 타입을 ObjectId로 명확히
          eventId: number, // 타입을 ObjectId로 명확히
          rewardId: MapleRewardId, // Enum 타입 사용
          quantity: number,
          RewardType: RewardType,    // Enum 타입 사용
          RewardRequireIs: boolean,
     ): Promise<RewardClaimLogDocument> {
          const newClaim = new this.rewardClaimLogModel({
               userId,
               eventId,
               rewardId,
               quantity,
               RewardType,
               RewardRequireIs,
          });
          try {
               await newClaim.save();
               return newClaim;
          } catch (error: any) {
               console.error('Error Name:', error.name);
               console.error('Error Message:', error.message);
               console.error('Error Stack:', error.stack);
               throw new InternalServerErrorException('An error occurred while creating the event', `${(error as any).message}`);
          }
     }


     /**
      * 일일 출석
      * @param userIdString 
      * @param eventIdString 
      * @returns 
      */
     async DailyCheckIn(
          userIdString: number, // 입력 파라미터는 문자열
          eventIdString: number,  // 입력 파라미터는 문자열
     ): Promise<{ // 반환 타입 수정
          status: string;
          dailyReward?: { rewardId: string; quantity: number };
          conditionMet?: boolean; // conditionMet 필드 추가
          message?: string;       // message 필드 추가
     }> {
          const eventId = eventIdString;
          const userId = userIdString;
          // 실패 시 로그에 기록할 기본 정보
          const baseLogInfo = {
               userId,
               eventId,
               RewardType: RewardType.FAIL, // 스키마의 RewardType 사용
               placeholderRewardId: MapleRewardId.LOG_PLACEHOLDER_FAILURE, // Enum에 추가 필요
               placeholderQuantity: 0,
               RewardRequireIs: false,
          };
          try {
               // 1. 이벤트 정보 조회 및 유효성 검사
               const event = await this.eventModel.findById(eventId).exec();
               if (!event) {
                    await this.logRewardClaim(baseLogInfo.userId, baseLogInfo.eventId, baseLogInfo.placeholderRewardId, baseLogInfo.placeholderQuantity, baseLogInfo.RewardType, baseLogInfo.RewardRequireIs);
                    throw new NotFoundException(`Event with ID "${eventIdString}" not found`);
               }
               if (event.status !== EventStatus.ACTIVE) {
                    throw new ConflictException(`Event "${eventIdString}" is not currently active. Status: ${event.status}`);
               }
               // 2. 사용자 이벤트 진행 상태 조회 또는 초기화
               let userProgress = await this.userProgressModel.findOne({ eventId, userId }).exec(); // 변환된 ObjectId 사용
               const now = new Date();
               const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
               const currentWeekStart = this.getStartOfWeekByThursday(now);

               if (userProgress) {
                    const progressWeekStart = new Date(userProgress.weekStartDate.getFullYear(), userProgress.weekStartDate.getMonth(), userProgress.weekStartDate.getDate());
                    if (progressWeekStart < currentWeekStart) {
                         userProgress.currentStreak = 0;
                         userProgress.Check_Slots = [];
                         userProgress.weekStartDate = currentWeekStart;
                         userProgress.last_Date = undefined;
                    }
               } else {
                    userProgress = new this.userProgressModel({
                         eventId, // 변환된 ObjectId 사용
                         userId,  // 변환된 ObjectId 사용
                         currentStreak: 0,
                         Check_Slots: [],
                         weekStartDate: currentWeekStart,
                         last_Date: undefined,
                    });
               }
               // 3. 오늘 이미 출석했는지 확인
               if (userProgress.last_Date) {
                    const lastCheckinDay = new Date(userProgress.last_Date.getFullYear(), userProgress.last_Date.getMonth(), userProgress.last_Date.getDate());
                    if (lastCheckinDay.getTime() === today.getTime()) {
                         throw new ConflictException('[EVENT-REWARD][SERVICE] 일일 보상 중복 수령');
                    }
               }

               // 4. 다음 출석 일차 및 일일 조건 확인
               let dailyRewardGiven = undefined;
               let conditionMet = false;
               // 1일차 조건, 2일차 조건 계산을 위한 일수 계산
               const nextStreakDay = userProgress.currentStreak + 1;
               // --- 일일 조건 확인 로직 ---
               if (event.conditions && event.conditions.length >= nextStreakDay) {
                    // 현재 이벤트 조건
                    const currentDayCondition = event.conditions[nextStreakDay - 1];
                    if (currentDayCondition) {
                         // checkEventConditionMet 호출 시 변환된 ObjectId 사용
                         conditionMet = await this.checkEventConditionMet(userId, eventId, currentDayCondition);
                    } else {
                         conditionMet = true;
                    }
               } else {
                    conditionMet = true;
               }

               // 5. 조건 미달성 시 처리
               if (!conditionMet) {
                    await this.logRewardClaim(baseLogInfo.userId, baseLogInfo.eventId, baseLogInfo.placeholderRewardId, baseLogInfo.placeholderQuantity, baseLogInfo.RewardType, baseLogInfo.RewardRequireIs);
                    return { // --- 오류 2 해결: 반환 객체 타입 일치 ---
                         status: 'condition_not_met',
                         message: `오늘의 출석 조건(Day ${nextStreakDay})을 달성하지 못했습니다.`,
                         conditionMet: false,
                         dailyReward: undefined // 명시적으로 undefined 할당
                    };
               }

               // 6. 조건 만족 시: 일일 고정 보상 확인 및 지급   
               if (event.dailyRewardsPool && event.dailyRewardsPool.length > 0) {
                    const rewardStep = event.dailyRewardsPool.find(r => r.day === nextStreakDay);
                    if (rewardStep) {
                         dailyRewardGiven = { rewardId: rewardStep.rewardId as string, quantity: rewardStep.quantity };
                         // 요청 기록 저장
                         await this.logRewardClaim(
                              userId,
                              eventId,
                              rewardStep.rewardId,
                              rewardStep.quantity,
                              RewardType.DAILY_REWARD,
                              true
                         );
                    }
               }

               // 7. 사용자 진행 상태 업데이트 (마지막 출석일 기록)
               if (userProgress.currentStreak < 7) {
                    userProgress.currentStreak += 1;
               }
               userProgress.last_Date = now;

               // 8. 변경된 사용자 진행 상태 저장
               await userProgress.save();

               // 9. 최종 결과 반환
               return { // --- 오류 2 해결: 반환 객체 타입 일치 ---
                    status: 'checked_in',
                    dailyReward: dailyRewardGiven,
                    conditionMet: true,
                    message: '출석이 완료되었습니다.' // 성공 메시지 추가 (선택적)
               };

          } catch (error: any) {
               console.error('Error Name:', error.name);
               console.error('Error Message:', error.message);
               console.error('Error Stack:', error.stack);
               throw new InternalServerErrorException('An error occurred while creating the event', `${(error as any).message}`);
          }
     }

     /**
      * 주간 보상 획득
      * @param userIdString 
      * @param eventIdString 
      * @returns 
      */
     async WeeklyCheckIn(
          userIdString: number, // 입력 파라미터는 문자열
          eventIdString: number,  // 입력 파라미터는 문자열
     ): Promise<{ status: string; gaugeReward?: { rewardId: string; quantity: number } }> {
          // --- ID 유효성 검사 및 ObjectId로 변환 ---
          const eventId = eventIdString;
          const userId = userIdString;
          const baseLogInfo = {
               userId,
               eventId,
               RewardType: RewardType.FAIL,
               placeholderRewardId: MapleRewardId.LOG_PLACEHOLDER_FAILURE,
               placeholderQuantity: 0,
               RewardRequireIs: false,
          }
          try {
               // 1. 이벤트 문서 조회
               const event = await this.eventModel.findById(eventId).exec();
               if (!event) throw new NotFoundException(`Event with ID "${eventIdString}" not found`);
               // --- 이벤트 활성 상태 확인 ---
               if (event.status !== EventStatus.ACTIVE) { // 주석 해제 및 활성화
                    throw new ConflictException(`Event "${eventIdString}" is not currently active. Status: ${event.status}`);
               }
               // --- 여기까지 ---

               // 2. 사용자 진행 상태 조회
               const userProgress = await this.userProgressModel.findOne({ eventId, userId }).exec();
               if (!userProgress) {
                    throw new NotFoundException(`User progress not found for event "${eventIdString}" and user "${userIdString}"`);
               }

               // 3. 주간 초기화 로직 (확인만 - 실제 초기화는 DailyCheckIn에서)
               const now = new Date();
               const currentWeekStart = this.getStartOfWeekByThursday(now);
               const progressWeekStart = new Date(userProgress.weekStartDate.getFullYear(), userProgress.weekStartDate.getMonth(), userProgress.weekStartDate.getDate());

               if (progressWeekStart < currentWeekStart) {
                    throw new ConflictException('[EVENT-REWARD][SERVICE] Progress information is for a previous week. Please perform a daily check-in first to update weekly data.');
               }

               // 6. 주간 보상 획득 여부 확인
               if (userProgress.WeeklyRewardIs) { // UserSummerEventProgress 스키마에 WeeklyRewardIs: boolean 필드 추가 필요
                    const detail = '[EVENT-REWARD][SERVICE] 주간 보상 중복 수령';
                    await this.logRewardClaim(baseLogInfo.userId, baseLogInfo.eventId, baseLogInfo.placeholderRewardId, baseLogInfo.placeholderQuantity, baseLogInfo.RewardType, baseLogInfo.RewardRequireIs);
                    throw new ConflictException(detail);
               }

               userProgress.WeeklyRewardIs = true;

               // 4. 현재 쌓은 게이지 칸 수 확인
               const currentLevel = userProgress.currentStreak;

               // 5. 보상 수령 가능한 게이지 레벨 범위 확인
               if (currentLevel <= 0 || currentLevel > 7) { // 0일차 또는 7일 초과 시 보상 없음 (정책에 따라 조정)
                    throw new ConflictException(`Current gauge level (${currentLevel}) is not eligible for reward (claimable at levels 1-7).`);
               }


               // 7. 해당 게이지 레벨에 맞는 보상 목록 조회
               if (!event.slotRewards || event.slotRewards.length === 0) {
                    throw new InternalServerErrorException('No slot rewards defined for this event.');
               }
               const slotRewardDef = event.slotRewards.find(sr => sr.slot === currentLevel);
               if (!slotRewardDef || !slotRewardDef.rewards || slotRewardDef.rewards.length === 0) {
                    throw new InternalServerErrorException(`[EVENT-REWARD][SERVICE] No probabilistic rewards defined for gauge level ${currentLevel}.`);
               }

               // 8. 보상 목록에서 확률적으로 보상 선택
               const selectedRewardOption = this.selectProbabilisticReward(slotRewardDef.rewards);
               if (!selectedRewardOption) {
                    throw new InternalServerErrorException(`[EVENT-REWARD][SERVICE] Failed to select a probabilistic reward for gauge level ${currentLevel}.`);
               }

               // 9. 보상 지급 로직 수행 (이 부분은 실제 게임 아이템/재화 지급 시스템과 연동 필요)
               // ** 예정 사항 ->  실제 보상 지급 Microservice 호출 또는 로직 구현 
               const gaugeRewardGiven = {
                    rewardId: selectedRewardOption.rewardId as string, // MapleRewardId enum 값을 문자열로 반환
                    quantity: selectedRewardOption.quantity
               };
               // TODO: 실제 보상 지급 실패 시 예외 처리 및 트랜잭션 고려 필요

               // --- 10. 보상 요청 이력 기록 ---
               await this.logRewardClaim(
                    userId, // ObjectId 타입
                    eventId, // ObjectId 타입
                    selectedRewardOption.rewardId,
                    selectedRewardOption.quantity,
                    RewardType.SLOT_REWARD, // 지급 유형: 슬롯 보상
                    true
               );
               // --- 여기까지 ---

               // 11. 보상 수령 기록 및 상태 업데이트
               userProgress.Check_Slots.push(currentLevel);
               userProgress.Check_Slots.sort((a, b) => a - b); // 정렬 (선택적)
               await userProgress.save();

               // 12. 결과 반환
               return { status: 'gauge_reward_claimed', gaugeReward: gaugeRewardGiven };

          } catch (error: any) {
               console.error('Error Name:', error.name);
               console.error('Error Message:', error.message);
               console.error('Error Stack:', error.stack);
               throw new InternalServerErrorException('[EVENT-REWARD][SERVICE] An error occurred while creating the event', `${(error as any).message}`);
          }
     }

     /**
      * 사용자 이벤트 진행 상태 조회
      */
     async getUserEventProgress(userId: string, eventId: string): Promise<any | null> {
          try {
               const userProgress = await this.userProgressModel.findOne({ eventId, userId }).exec();
               if (!userProgress) return null;
               const now = new Date();
               const currentWeekStart = this.getStartOfWeekByThursday(now);
               const progressWeekStart = new Date(userProgress.weekStartDate.getFullYear(), userProgress.weekStartDate.getMonth(), userProgress.weekStartDate.getDate());

               if (progressWeekStart < currentWeekStart) {
                    userProgress.currentStreak = 0;
                    userProgress.Check_Slots = [];
                    userProgress.weekStartDate = currentWeekStart;
                    userProgress.last_Date = undefined;
                    await userProgress.save();
               }

               return userProgress.toObject();

          } catch (error: any) {
               console.error('Error Name:', error.name);
               console.error('Error Message:', error.message);
               console.error('Error Stack:', error.stack);
               throw new InternalServerErrorException('[EVENT-REWARD][SERVICE] An error occurred while creating the event', `${(error as any).message}`);
          }
     }
     /**
 * 보상 지급/요청 이력을 조회 (필터 단순화 버전)
 * @param filters 필터 조건 (userId - 선택적, dateFrom, dateTo - 선택적)
 * @param pagination 페이지네이션 옵션
 * @returns 보상 이력 목록과 관련 정보
 */
     async getRewardClaimLogs(
          filters: {
               userId?: number;   
               dateFrom?: Date;
               dateTo?: Date;
          },
          pagination: { page?: number; limit?: number } = { page: 1, limit: 10 },
     ): Promise<{
          logs: RewardClaimLogDocument[];
          total: number;
          currentPage: number;
          perPage: number;
          totalPages: number;
     }> {
          const query: any = {};
          if (filters.userId !== undefined) {
               query.userId = filters.userId;
          }

          if (filters.dateFrom || filters.dateTo) {
               query.createdAt = {};
               if (filters.dateFrom) {
                    query.createdAt.$gte = filters.dateFrom;
               }
               if (filters.dateTo) {
                    const endDate = new Date(filters.dateTo);
                    endDate.setUTCHours(23, 59, 59, 999); // 해당 날짜의 끝까지 포함 (UTC 기준)
                    query.createdAt.$lte = endDate;
               }
          }

          const currentPage = Math.max(1, pagination.page || 1);
          const perPage = Math.max(1, pagination.limit || 10);
          const skip = (currentPage - 1) * perPage;
          try {
               const [logs, total] = await Promise.all([
                    this.rewardClaimLogModel
                         .find(query)
                         .sort({ createdAt: -1 })
                         .skip(skip)
                         .limit(perPage)
                         .populate('eventId', 'name') // 이벤트 이름 정도는 같이 보여주는 것이 좋을 수 있음
                         .exec(),
                    this.rewardClaimLogModel.countDocuments(query).exec(),
               ]);

               const totalPages = Math.ceil(total / perPage);
               return { logs, total, currentPage, perPage, totalPages };
          } catch (error: any) {
               console.error('Error Name:', error.name);
               console.error('Error Message:', error.message);
               console.error('Error Stack:', error.stack);
               throw new InternalServerErrorException('[EVENT-REWARD][SERVICE]An error occurred while creating the event', `${(error as any).message}`);
          }
     }

     /**
      * 이벤트 만족 조건 호출
      * @param userId 
      * @param eventId 
      * @param condition 
      * @returns 
      */
     // User 활동에 대한 추가적인 선언 해야함
     private async checkEventConditionMet(
          userId: number, // ObjectId 타입 사용
          eventId: number, // ObjectId 타입 사용
          condition: ConditionInfo,
     ): Promise<boolean> {
          switch (condition.type) {
               // 일일 로그인
               case EventConditionType.DAILY_LOGIN_COUNT:
                    return true;
               // 레벌 범위 몬스터       
               case EventConditionType.MONSTER_KILL_ANY:
                    return true;
               // 접속시간
               case EventConditionType.PLAYTIME_SESSION:
                    return true;
               default:
                    return true
          }
     }
     /**
      * 주어진 날짜가 포함된 주의 목요일 시작 날짜/시간을 계산
      * 목요일 = 0일차, 금요일 = 1일차
      */
     private getStartOfWeekByThursday(date: Date): Date {
          const dayOfWeek = date.getDay();
          const thursdayDay = 4;
          const diff = dayOfWeek >= thursdayDay ? dayOfWeek - thursdayDay : dayOfWeek + (7 - thursdayDay);
          const thursday = new Date(date.getFullYear(), date.getMonth(), date.getDate() - diff);
          thursday.setHours(0, 0, 0, 0);
          return thursday;
     }


     /**
      * 보상 옵션 목록에서 확률에 따라 하나의 보상을 선택
      */
     private selectProbabilisticReward(options: RewardOption[]): RewardOption | undefined {
          const totalProbability = options.reduce((sum, option) => sum + option.probability, 0);
          if (totalProbability <= 0) return undefined;
          let randomNumber = Math.random() * totalProbability;
          for (const option of options) {
               if (randomNumber < option.probability) return option;
               randomNumber -= option.probability;
          }
          return options[options.length - 1];
     }
}