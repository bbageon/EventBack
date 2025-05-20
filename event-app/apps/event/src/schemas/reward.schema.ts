import { MapleRewardId } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

// 일일 보상 정보
@Schema({ _id: false })
export class DailyRewardInfo {
  @Prop({ required: true, type: Number, min: 1, max: 31 })
  day: number;

  @Prop({ required: true, type: String })
  rewardId: MapleRewardId; // 해당 일차에 지급될 고정 보상의 종류 ID

  @Prop({ required: true, type: Number, min: 0 }) // 수량은 0 이상이라고 가정
  quantity: number; // 해당 일차에 지급될 고정 보상의 수량
}
export const DailyRewardInfoSchema = SchemaFactory.createForClass(DailyRewardInfo);

// 주간 보상 상세 정보
@Schema({ _id: false })
export class RewardOption {
  @Prop({ required: true, type: String })
  rewardId: MapleRewardId;

  @Prop({ required: true, type: Number, min: 0 }) // 수량은 0 이상이라고 가정
  quantity: number; // 보상 수량

  @Prop({ required: true, type: Number, min: 0, max: 1 })
  probability: number; // 해당 보상을 얻을 확률 (0.0 ~ 1.0 사이)
}
export const RewardOptionSchema = SchemaFactory.createForClass(RewardOption);

// 주간 보상 정보 (1칸 = [...], 2칸 = [...])
@Schema({ _id: false })
export class SlotRewardInfo {
  @Prop({ required: true, type: Number, min: 1, max: 7 })
  slot: number; // 게이지 칸 번호 (1일차 출석 = 슬롯 1, ..., 7일차 출석 = 슬롯 7)
  
  @Prop({ required: true, type: [RewardOptionSchema] })
  rewards: RewardOption[]; // 예: 슬롯 1에서는 [아이템A(확률0.8), 아이템B(확률0.2)] 중 하나를 얻음
}
export const SlotRewardInfoSchema = SchemaFactory.createForClass(SlotRewardInfo);