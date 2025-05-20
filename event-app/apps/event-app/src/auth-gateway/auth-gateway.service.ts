// apps/event-app/src/auth-gateway/auth-gateway.service.ts
import { Injectable, Inject, InternalServerErrorException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';

// Dto
import { UserSignInDto, UserSignUpDto } from '@app/common';
import { UserDto } from '@app/common';
import { SignInResult } from '@app/common';

@Injectable()
export class AuthGatewayService {
    constructor(
        @Inject('AUTH_SERVICE') private readonly authServiceClient: ClientProxy
    ) { }

    /**
     * 회원가입
     * @param payload 
     * @returns 
     */
    async signUpUser(payload: UserSignUpDto): Promise<UserDto> {
        const pattern = 'signup';
        try {
            const result = await firstValueFrom(
                this.authServiceClient.send<UserDto, UserSignUpDto>(pattern, payload).pipe(
                    timeout(5000))
            );
            return result;
        } catch (error: any) {
            console.error('Error Name:', error.name);
            console.error('Error Message:', error.message);
            console.error('Error Stack:', error.stack);
            throw new InternalServerErrorException('[AUTH][SERVICE]An error occurred while finding events', { cause: error });
        }
    }

    /**
     * 로그인
     * @param payload
     * @returns 
     */
    async signIn(payload: UserSignInDto): Promise<SignInResult> {
        const pattern = 'signin';
        try {
            const result = await firstValueFrom(
                this.authServiceClient.send<SignInResult, UserSignInDto>(pattern, payload).pipe(
                    timeout(5000),
                )
            );
            return result;
        } catch (error: any) {
            console.error('Error Name:', error.name);
            console.error('Error Message:', error.message);
            console.error('Error Stack:', error.stack);
            throw new InternalServerErrorException('[AUTH][SERVICE]An error occurred while finding events', { cause: error });
        }
    }

    /**
     * 유저 검색
     * @returns 
     */
    async getUsers(): Promise<UserDto[]> {
        const pattern = 'get_users';
        try {
            const result = await firstValueFrom(
                this.authServiceClient.send<UserDto[], object>(pattern, {}).pipe(timeout(5000))
            );
            return result;
        } catch (error: any) {
            console.error('Error Name:', error.name);
            console.error('Error Message:', error.message);
            console.error('Error Stack:', error.stack);
            throw new InternalServerErrorException('[AUTH][SERVICE]An error occurred while finding events', { cause: error });
        }
    }

    /**
     * 토큰 검색
     * @param payload 
     * @returns 
     */
    async checkToken(payload: { token: string }): Promise<any> {
        const pattern = 'auth_check';
        try {
            const result = await firstValueFrom(
                this.authServiceClient.send<any, { token: string }>(pattern, payload).pipe(timeout(5000))
            );
            return result;
        } catch (error: any) {
            console.error('Error Name:', error.name);
            console.error('Error Message:', error.message);
            console.error('Error Stack:', error.stack);
            throw new InternalServerErrorException('[AUTH][SERVICE]An error occurred while finding events', { cause: error });
        }
    }
}