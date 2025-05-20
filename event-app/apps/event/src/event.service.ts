// apps/event/src/event/event.service.ts

import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Schema } from 'mongoose';

// schema
import {
  Event,
  EventDocument,
} from './schemas/event.schema';

import {
  UserSummerEventProgress, // 변경된 스키마 이름
  UserEventProgressDocument, // 변경된 문서 타입 이름
} from './schemas/userEventProgress.schema'; // 파일 이름 확인

// dto
import { UpdateEventDto, CreateEventDto } from '@app/common';

// TODO: 날짜/시간 처리 라이브러리 또는 내장 Date 사용
// import { isSameDay, isBefore } from 'date-fns';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    @InjectModel(UserSummerEventProgress.name) private userProgressModel: Model<UserEventProgressDocument>, // 모델 이름 변경 반영
    // private readonly rewardService : RewardService,
  ) { }

  // --- 이벤트 관리 메소드 ---

  /**
   * 이벤트 단일 조회
   * @param id
   * @returns
   * @throws
   */
  async findOneEvent(id: string): Promise<EventDocument | null> {
    try {
      const event = await this.eventModel.findById(id).exec();
      console.log(event)
      if (!event) {
        throw new NotFoundException(`ID '${id}'에 해당하는 이벤트를 찾을 수 없습니다.`);
      }
      return event;
    } catch (error: any) {
      console.error('Error Name:', error.name);
      console.error('Error Message:', error.message);
      console.error('Error Stack:', error.stack);
      throw new InternalServerErrorException('An error occurred while creating the event', `${(error as any).message}`);
    }
  }


  /**
 * 새로운 이벤트 생성
 * @param createEventDto 이벤트 생성 데이터
 * @param createdByUserId 이벤트를 생성하는 사용자 ID
 * @returns 생성된 이벤트 문서
 * @throws InternalServerErrorException (DB 저장 오류 등)
 */
  async createEvent(createEventDto: CreateEventDto, createdByUserId: string): Promise<EventDocument> {
    try {
      // 새 Mongoose 문서 인스턴스 생성
      const newEvent = new this.eventModel({
        ...createEventDto,
        createdBy: createdByUserId,
      });
      const savedEvent = await newEvent.save();
      return savedEvent; // 저장된 문서 반환

    } catch (error: any) {
      console.error('Error Name:', error.name);
      console.error('Error Message:', error.message);
      console.error('Error Stack:', error.stack);
      throw new InternalServerErrorException('An error occurred while creating the event', { cause: error});
    }
  }

  /**
   * 이벤트 목록 조회 (필터링 가능)
   * @returns 조건에 맞는 이벤트 문서 배열
   * @throws InternalServerErrorException (DB 조회 오류 시)
   */
  async findEvents(): Promise<EventDocument[]> {
    try {
      const events = await this.eventModel.find().exec();
      return events;
    } catch (error: any) {
      console.error('Error Name:', error.name);
      console.error('Error Message:', error.message);
      console.error('Error Stack:', error.stack);
      throw new InternalServerErrorException('An error occurred while finding events', { cause: error });
    }
  }


  /**
   * 이벤트 정보 수정
   * @param id 수정할 이벤트 ID
   * @param updateEventDto 이벤트 수정 데이터
   * @returns 수정된 이벤트 문서 또는 null (해당 ID의 이벤트가 없을 시)
   * @throws InternalServerErrorException (DB 수정 오류 등)
   */
  async updateEvent(id: string, updateEventDto: UpdateEventDto): Promise<EventDocument | null> {
    try {
      // ID로 이벤트 문서 찾기

      const event = await this.eventModel.findById(id).exec();
      // 해당 ID의 이벤트가 없으면 null 반환
      if (!event) {
        return null;
      }
      Object.assign(event, updateEventDto);
      const updatedEvent = await event.save();
      return updatedEvent;
    } catch (error: any) {
      console.error('Error Name:', error.name);
      console.error('Error Message:', error.message);
      console.error('Error Stack:', error.stack);
      throw new InternalServerErrorException('An error occurred while finding events', { cause: error });
    }
  }

  /**
   * 이벤트 삭제
   * @param id 삭제할 이벤트 ID
   * @returns 삭제 성공 시 true, 해당 ID의 이벤트가 없을 시 false
   * @throws InternalServerErrorException (DB 삭제 오류 시)
   */
  async deleteEvent(id: string): Promise<boolean> {
    try {
      const event = await this.eventModel.findByIdAndDelete(id).exec();
      return !!event; // 삭제 여부를 boolean으로 반환
      
    } catch (error: any) {
      throw new InternalServerErrorException('An error occurred while deleting the event', { cause: error });
    }
  }
}