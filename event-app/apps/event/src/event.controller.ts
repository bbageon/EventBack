// apps/event/src/event/event.controller.ts

import { Controller } from '@nestjs/common';
// --- Microservice 리스너에 필요한 임포트 유지 ---
import { MessagePattern, Payload, Ctx, RpcException } from '@nestjs/microservices';

// 서비스 임포트 유지
import { EventService } from './event.service';
import { CreateEventDto, UpdateEventDto } from '@app/common';
import { EventDocument } from './schemas/event.schema';


@Controller()
export class EventController {
  constructor(private readonly eventService: EventService) {}

  /**
   * 새로운 이벤트 생성 메시지 핸들러
   * - 게이트웨이에서 'create_event' 패턴으로 메시지를 보낼 때 호출됩니다.
   * - 페이로드에는 CreateEventDto 와 생성자 사용자 ID가 포함되어야 합니다.
   * @param payload 페이로드 (예: { createEventDto: CreateEventDto, createdByUserId: string })
   * @param context Microservice 컨텍스트
   * @returns 생성된 이벤트 문서
   */
  @MessagePattern('create_event') // 게이트웨이에서 사용할 패턴 이름
  async handleCreateEventMessage(@Payload() payload: { createEventDto: CreateEventDto, createdByUserId: string }, @Ctx() context: any): Promise<EventDocument> { // DTO 사용 시
    const createEventDto = payload.createEventDto;
    const createdByUserId = payload.createdByUserId;
    console.log(createEventDto, createdByUserId)
    if (!createEventDto || !createdByUserId) {
      throw new RpcException('Invalid payload: createEventDto and createdByUserId are required');
    }
    try {
      const result = await this.eventService.createEvent(createEventDto, createdByUserId);
      return result;
    } catch (error: any) {
      throw new RpcException(error);
    }
  }

  /**
   * 이벤트 목록 조회 메시지 핸들러
   * - 게이트웨이에서 'find_events' 패턴으로 메시지를 보낼 때 호출됩니다.
   * - 페이로드에는 FilterEventsDto가 포함될 수 있습니다.
   * @param payload 페이로드 (예: { filterDto?: FilterEventsDto })
   * @param context Microservice 컨텍스트
   * @returns 이벤트 문서 배열
   */
  @MessagePattern('find_events') // 게이트웨이에서 사용할 패턴 이름
  async handleFindEventsMessage(@Ctx() context: any): Promise<EventDocument[]> { // DTO 사용 시
    try {
      const result = await this.eventService.findEvents();
      return result
    } catch (error: any) {
      throw new RpcException(error);
    }
  }

  /**
   * 이벤트 정보 수정 메시지 핸들러
   * @param payload 페이로드 (예: { id: string, updateEventDto: UpdateEventDto })
   * @param context Microservice 컨텍스트
   * @returns 수정된 이벤트 문서 또는 null
   */
  @MessagePattern('update_event') // 게이트웨이에서 사용할 패턴 이름
  async handleUpdateEventMessage(@Payload() payload: { eventId: string, updateEventDto: UpdateEventDto }, @Ctx() context: any): Promise<EventDocument | null> { // DTO 사용 시
    const eventId = payload.eventId;
    const updateEventDto = payload.updateEventDto;

    // 필수 페이로드 필드 누락 검사
    if (!eventId || !updateEventDto) {
      throw new RpcException('Invalid payload: id and updateEventDto are required');
    }
     // TODO: updateEventDto 자체에 대한 유효성 검사가 필요하다면 여기서 수행하거나 서비스에서 수행

    try {
      // 서비스 메소드 호출
      const result = await this.eventService.updateEvent(eventId, updateEventDto);
      // 결과 반환 (null 이거나 EventDocument)
      return result; // 수정된 EventDocument 또는 null 반환

    } catch (error: any) {
      throw new RpcException(error);
    }
  }

  /**
   * 이벤트 삭제 메시지 핸들러
   * - 게이트웨이에서 'delete_event' 패턴으로 메시지를 보낼 때 호출됩니다.
   * - 페이로드에는 이벤트 ID가 포함되어야 합니다.
   * @param payload 페이로드 (예: { id: string })
   * @param context Microservice 컨텍스트
   * @returns 삭제 성공 시 true, 실패 시 false
   */
  @MessagePattern('delete_event') // 게이트웨이에서 사용할 패턴 이름
  async handleDeleteEventMessage(@Payload() payload: { eventId : string }, @Ctx() context: any): Promise<boolean> { // DTO 사용 시
    const eventId = payload.eventId;
    if (!eventId) {
      throw new RpcException('Invalid payload: id is required');
    }
    try {
      const result = await this.eventService.deleteEvent(eventId);
      return result; // 삭제 성공 시 true, 해당 ID 없으면 false 반환
    } catch (error: any) {
      // 서비스에서 발생한 예외를 RpcException으로 감싸 게이트웨이로 다시 던집니다.
      throw new RpcException(error);
    }
  }

  /**
   * 이벤트 단일 조회 메시지 핸들러
   * - 게이트웨이에서 'find_event_by_id' 패턴으로 메시지를 보낼 때 호출됩니다.
   * - 페이로드에는 이벤트 ID가 포함되어야 합니다.
   * @param payload 페이로드
   * @returns 이벤트 문서 또는 null
   */
  @MessagePattern('find_event_by_id') // <-- 메시지 패턴 유지
  async handleFindEventByIdMessage(@Payload() payload: any, @Ctx() context: any): Promise<any | null> { // DTO 사용 전 임시 타입 유지
      const eventId = payload.eventId;
      if (!eventId) {
          throw new RpcException('Invalid payload: eventId is required');
      }
      try {
          const result = await this.eventService.findOneEvent(eventId);
          return result;

      } catch (error: any) {
          throw new RpcException(error);
      }
  }
}