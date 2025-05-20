import { UpdateEventDto } from '@app/common';
import { Injectable, Inject, InternalServerErrorException } from '@nestjs/common'; // Inject 임포트 필요
import { ClientProxy, RpcException } from '@nestjs/microservices'; // Microservice 클라이언트 관련 임포트
import { firstValueFrom, timeout } from 'rxjs'; // Observable 처리 유틸 임포트


@Injectable()
export class EventGatewayService {
   constructor(
      @Inject('EVENT_SERVICE') private readonly eventServiceClient: ClientProxy,
   ) { }

   /**
    * 새로운 이벤트 생성 메시지 전송
    * @param createEventDto 생성 데이터 (HTTP 요청 본문으로부터 받음)
    * @param createdByUserId 이벤트를 생성하는 사용자 ID (인증된 사용자 정보로부터 얻음)
    * @returns 생성된 이벤트 정보
    * @throws RpcException (Microservice 오류 시)
    */
   async createEvent(createEventDto: any, createdByUserId: string): Promise<any> { // TODO: DTO 타입 사용
      const pattern = 'create_event'; // Event Microservice의 @MessagePattern과 일치해야 함
      const payload = { createEventDto, createdByUserId }; // Microservice로 보낼 페이로드

      try {
         // Microservice로 메시지 전송하고 응답 대기 (timeout 설정)
         const result = await firstValueFrom(
            this.eventServiceClient.send<any, any>(pattern, payload).pipe(timeout(5000)) // TODO: 반환/페이로드 타입 DTO 사용
         );
         return result; // Microservice로부터 받은 결과 반환

      } catch (error: any) {
         console.error('Error Name:', error.name);
         console.error('Error Message:', error.message);
         console.error('Error Stack:', error.stack);
         throw new InternalServerErrorException('[EVENT][SERVICE]An error occurred while finding events', { cause: error });
      }
   }

   /**
    * 이벤트 목록 조회 메시지 전송
    * @returns 이벤트 목록
    * @throws RpcException (Microservice 오류 시)
    */
   async findAllEvents(): Promise<any[]> { // TODO: DTO 타입 사용
      const pattern = 'find_events';
      const payload = {};

      try {
         const result = await firstValueFrom(
            this.eventServiceClient.send<any[], any>(pattern, payload).pipe(timeout(5000)) // TODO: 반환/페이로드 타입 DTO 사용
         );
         return result; // Microservice로부터 받은 결과 반환
      } catch (error: any) {
         console.error('Error Name:', error.name);
         console.error('Error Message:', error.message);
         console.error('Error Stack:', error.stack);
         throw new InternalServerErrorException('[EVENT][SERVICE]An error occurred while finding events', { cause: error });
      }
   }

   /**
    * 이벤트 단일 조회 메시지 전송
    * @param eventId 이벤트 ID
    * @returns 이벤트 상세 정보 또는 null
    * @throws RpcException (Microservice 오류 시)
    */
   async findEventById(eventId: number): Promise<any | null> { // TODO: DTO 타입 사용
      const pattern = 'find_event_by_id';
      const payload = { eventId };
      console.log("123", payload)
      try {
         const result = await firstValueFrom(
            this.eventServiceClient.send<any | null, any>(pattern, payload).pipe(timeout(5000)) // TODO: 반환/페이로드 타입 DTO 사용
         );
         return result; // Microservice로부터 받은 결과 반환

      } catch (error: any) {
         console.error('Error Name:', error.name);
         console.error('Error Message:', error.message);
         console.error('Error Stack:', error.stack);
         throw new InternalServerErrorException('[EVENT][SERVICE]An error occurred while finding events', { cause: error });
      }
   }

   /**
    * 이벤트 정보 수정 메시지 전송
    * @param eventId 수정할 이벤트 ID
    * @param updateEventDto 수정 데이터 (HTTP 요청 본문으로부터 받음)
    * @returns 수정된 이벤트 정보 또는 null
    * @throws RpcException (Microservice 오류 시)
    */
   async updateEvent(eventId: number, updateEventDto: UpdateEventDto): Promise<any | null> { // TODO: DTO 타입 사용
      const pattern = 'update_event';
      const payload = { eventId: eventId, updateEventDto }; // Microservice는 payload.id, payload.updateEventDto 형태로 받을 것임
      try {
         const result = await firstValueFrom(
            this.eventServiceClient.send<any | null, any>(pattern, payload).pipe(timeout(5000)) // TODO: 반환/페이로드 타입 DTO 사용
         );
         return result;

      } catch (error: any) {
         console.error('Error Name:', error.name);
         console.error('Error Message:', error.message);
         console.error('Error Stack:', error.stack);
         throw new InternalServerErrorException('[EVENT][SERVICE]An error occurred while finding events', { cause: error });
      }
   }

   /**
    * 이벤트 삭제 메시지 전송
    * @param eventId
    * @returns 삭제 성공 시 true, 해당 ID 없을 시 false
    * @throws RpcException (Microservice 오류 시)
    */
   async deleteEvent(id: number): Promise<boolean> {
      const pattern = 'delete_event';
      const payload = { eventId: id }; // Microservice는 payload.id 형태로 받을 것임
      try {
         const result = await firstValueFrom(
            this.eventServiceClient.send<boolean, any>(pattern, payload).pipe(timeout(5000)) // TODO: 페이로드 타입 DTO 사용
         );
         return result;

      } catch (error: any) {
         console.error('Error Name:', error.name);
         console.error('Error Message:', error.message);
         console.error('Error Stack:', error.stack);
         throw new InternalServerErrorException('[EVENT][SERVICE]An error occurred while finding events', { cause: error });
      }
   }
}