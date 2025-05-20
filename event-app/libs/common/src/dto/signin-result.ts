export interface SignInResult {
    // @ApiProperty() // 필요하다면 추가
    access_token: string;
    // 필요한 경우 다른 정보 추가
    // @ApiProperty()
    // username?: string;
    // @ApiProperty()
    // role?: string;
  }