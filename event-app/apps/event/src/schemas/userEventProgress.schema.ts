import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Mongoose, Types, Schema as  MoongoseSchema } from 'mongoose';

@Schema({
  timestamps: true, 
  versionKey: false
})
export class UserSummerEventProgress {
  // @Prop({ type: Types.ObjectId, auto: true })
  // _id: Types.ObjectId;

  @Prop({ required : true, ref : 'Event'})
  eventId : number;

  @Prop({ required: true, ref : 'User' })
  userId : number;

  // 현재 주간의 출석 일수 (게이지바 칸 수)
  @Prop({ required: true, default: 0, min: 0, max: 7 })
  currentStreak: number; // 기본값 0, 최대 7

  // 마지막으로 성공적으로 출석한 날짜
  @Prop({ type: Date }) // 출석하지 않았으면 null
  last_Date?: Date;

  // 이번주 수령한 보상
  @Prop({ type: [Number], default: [] }) // 숫자의 배열, 기본값 빈 배열
  Check_Slots: number[];

  // 이번 주간 출석 시작일
  @Prop({ required: true, type: Date })
  weekStartDate: Date;

  // 주간 보상을 받았는지
  @Prop({ type: Boolean, default: false })
  WeeklyRewardIs: boolean;
}

export type UserEventProgressDocument = UserSummerEventProgress & Document;

export const UserEventProgressSchema = SchemaFactory.createForClass(UserSummerEventProgress);

// INDEX
UserEventProgressSchema.index({ eventId: 1, userId: 1 }, { unique: true });
UserEventProgressSchema.index({ userId: 1 });