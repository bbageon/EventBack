import { EventConditionType, EventStatus } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { DailyRewardInfo, SlotRewardInfo } from './reward.schema';
import { Document, Types, Schema as MongooseSchema } from 'mongoose'; // Schema를 MongooseSchema로 별칭 부여

// 조건 상세 정보 정의
@Schema({ _id: false }) // 하위 문서이므로 자체 _id는 생성하지 않음
export class ConditionInfo {
  @Prop({
    required: true,
    type: String,
  })
  type: EventConditionType; // 조건의 유형

  @Prop({
    type: MongooseSchema.Types.Mixed, 
    required: false,
  })
  parameters?: any;

  @Prop({ type: String, required: false })
  description?: string;
}

// 이벤트 스키마 정의
@Schema({
  timestamps: true,
  versionKey: false,
})
export class Event {
  @Prop({
    type: Number,     
    required: true,
    unique: true,     
  })
  _id: number; 

  @Prop({
    required: true,
    trim : true, // 공백
    match : [/^\S+$/, '이벤트 이름에는 공백 X'],
    unique : true,
  })
  name: string;

  @Prop() // 이벤트 상세 설명
  description?: string;

  @Prop({ required: true, enum: EventStatus, type: String }) // 이벤트 상태
  status: EventStatus;

  @Prop({ required: true, type: Date }) // 이벤트 시작 일시
  startDate: Date;

  @Prop({ required: true, type: Date }) // 이벤트 종료 일시
  endDate: Date;

  @Prop({ required: true, type: String }) // 이벤트를 생성한 사용자 ID
  createdBy: string;
  
  /** 일일 보상 */
  @Prop({ type: [DailyRewardInfo] })
  dailyRewardsPool?: DailyRewardInfo[]; // 일일 보상 옵션 목록

  /** 주간 보상 조건 정의 조건 -> [1일차 ~ 7일차] */
  @Prop({ type: [ConditionInfo], default: undefined }) 
  conditions?: ConditionInfo[]; 

  /** 주간 보상 */
  @Prop({ type: [SlotRewardInfo] })
  slotRewards?: SlotRewardInfo[]; // 게이지바 레벨별 보상 옵션 목록
}

// Event Document 타입 정의
export type EventDocument = Event & Document;

// Event 클래스로부터 Mongoose 스키마 생성
export const EventSchema = SchemaFactory.createForClass(Event);

// 인덱스 설정
EventSchema.index({ status: 1, endDate: 1 });
EventSchema.index({ createdBy: 1 });
// 이벤트 유형으로 조회하는 경우 인덱스 고려
EventSchema.index({ eventType: 1 });