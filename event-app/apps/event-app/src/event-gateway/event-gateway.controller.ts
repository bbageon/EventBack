// apps/event-app/src/event-gateway/event-gateway.controller.ts

import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  Req,
  Res,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';

import { Request, Response } from 'express';

import { EventGatewayService } from './event-gateway.service';

import { AuthGuard } from '@nestjs/passport';
import { createErrorResponse, createSuccessResponse, LoggerManager, RolesGuard } from '@app/common';
import { Roles } from '@app/common';
import { Role } from '@app/common';

import { ApiOperation, ApiTags, ApiBearerAuth, ApiBody, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';

// Dto
import {
  CreateEventDto,
  UpdateEventDto,
  EventResponseDto,
  RewardOptionDto,
  DailyRewardInfoDto,
  SlotRewardInfoDto,
  DailyCheckinRequestDto,
  DailyCheckinResponseDto,
  WeeklyCheckInRequestDto,
  WeeklyCheckInResponseDto,
  GetUserEventProgressRequestDto,
  UserEventProgressResponseDto
} from '@app/common/dto';


@ApiTags('Event')
@Controller('events')
export class EventGatewayController {
  constructor(
    private readonly eventGatewayService: EventGatewayService,
  ) { }

  /**
   * 이벤트 생성
   * @param createEventDto  
   * @param req 
   * @param res 
   */
  @ApiOperation({ summary: '새로운 이벤트 생성 (운영자/관리자용)' })
  @ApiBearerAuth('access-token')
  @ApiBody({ type: CreateEventDto })
  @ApiResponse(createErrorResponse('Error message'))
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  // @Roles(Role.OPERATOR, Role.ADMIN)
  @Post('create')
  async createEvent(@Body() createEventDto: CreateEventDto, @Req() req: Request, @Res() res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const createdByUserId = user.sub;
      const result = await this.eventGatewayService.createEvent(createEventDto, createdByUserId);
      res.status(HttpStatus.OK).json({
        status: HttpStatus.OK,
        message: 'Event created successfully',
        result: result,
      });

    } catch (error: any) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.message || 'An error occurred';
      const data = error.data || error.message;
      res.status(status).json({
        status: status,
        message: message,
        data: data,
      });
    }
  }

  /**
   * 이벤트 목록 조히
   * @param filterDto 
   * @param res 
   */
  @ApiOperation({ summary: '이벤트 목록 조회' })
  @ApiBearerAuth('access-token')
  @ApiResponse(createErrorResponse('Error message'))
  @Get('findAll')
  @UseGuards(AuthGuard('jwt'), RolesGuard) // 필요하다면 인증/권한 가드 적용
  // @Roles(Role.OPERATOR, Role.ADMIN)
  async findEvents(@Res() res: Response): Promise<void> {
    try {
      const result = await this.eventGatewayService.findAllEvents();

      res.status(HttpStatus.OK).json({
        status: HttpStatus.OK,
        message: 'success',
        result: result,
      });
    } catch (error: any) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.message || '[EVENT][CONTROLLER] An error occurred';
      const data = error.data || error.message;
      res.status(status).json({
        status: status,
        message: message,
        data: data,
      });
    }
  }

  /**
   * 이벤트 단일 조회
   * @param eventId
   * @param res 
   * @returns 
   */
  @ApiOperation({ summary: '이벤트 단일 조회' })
  @ApiBearerAuth('access-token')
  @ApiResponse(createErrorResponse('Error message'))
  @ApiParam({ name: 'id', description: '조회할 이벤트 ID', example : 1 })
  @UseGuards(AuthGuard('jwt'), RolesGuard) // 필요하다면 인증/권한 가드 적용
  // @Roles(Role.OPERATOR, Role.ADMIN)
  @Get('find/:id')
  async findEventById(@Param('id') id: number, @Res() res: Response): Promise<void> {
    try {
      console.log(id)
      const result = await this.eventGatewayService.findEventById(id);
      if (!result) {
        res.status(HttpStatus.NOT_FOUND).json({
          status: HttpStatus.NOT_FOUND,
          message: 'Event not found',
        });
        return;
      }
      res.status(HttpStatus.OK).json({
        status: HttpStatus.OK,
        message: 'Event retrieved successfully',
        result: result,
      });
    } catch (error: any) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.message || '[EVENT][CONTROLLER] An error occurred';
      const data = error.data || error.message;
      res.status(status).json({
        status: status,
        message: message,
        data: data,
      });
    }
  }

  /**
   * 이벤트 수정
   * @param name 
   * @param updateEventDto 
   * @param res 
   * @returns 
   */
  @ApiOperation({ summary: '이벤트 정보 수정 (운영자/관리자용)' })
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'id', description: '수정할 이벤트 ID', example : 1 })
  @ApiBody({ type: UpdateEventDto })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  // @Roles(Role.OPERATOR, Role.ADMIN)
  @Post('update/:id')
  async updateEvent(@Param('id',ParseIntPipe) id : number, @Body() updateEventDto: UpdateEventDto, @Res() res: Response): Promise<void> {
    try {
      const result = await this.eventGatewayService.updateEvent(id, updateEventDto);
      if (!result) {
        res.status(HttpStatus.NOT_FOUND).json({
          status: HttpStatus.NOT_FOUND,
          message: 'Event not found',
        });
        return; // 응답 후 함수 종료
      }
      res.status(HttpStatus.OK).json({
        status: HttpStatus.OK,
        message: 'Event updated successfully',
        result: result,
      });
    } catch (error: any) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.message || '[EVENT][CONTROLLER] An error occurred';
      const data = error.data || error.message;
      res.status(status).json({
        status: status,
        message: message,
        data: data,
      });
    }
  }

  /**
   * 이벤트 삭제
   * @param id 
   * @param res 
   * @returns 
   */
  @ApiOperation({ summary: '이벤트 삭제 (운영자/관리자용)' })
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'id', description: '삭제할 이벤트 eventId', example : '1' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  // @Roles(Role.ADMIN, Role.OPERATOR)
  @Post('delete/:id')
  async deleteEvent(@Param('id') id: number, @Res() res: Response): Promise<void> {
    try {
      const result = await this.eventGatewayService.deleteEvent(id);

      if (!result) {
        res.status(HttpStatus.NOT_FOUND).json({
          status: HttpStatus.NOT_FOUND,
          message: `[EVENT][CONTROLLER] Event eventId "${id}" not found or could not be deleted`,
        });
        return; // 응답 후 함수 종료
      }

      res.status(HttpStatus.OK).json({
        status: HttpStatus.OK,
        message: 'Event deleted successfully',
        result: true,
      });

    } catch (error: any) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.message || '[EVENT][CONTROLLER] An error occurred';
      const data = error.data || error.message;
      res.status(status).json({
        status: status,
        message: message,
        data: data,
      });
    }
  }
}