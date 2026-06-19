import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class IssueCertificateDto {
  @ApiProperty({ description: 'User ID to issue certificate for' })
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'Course ID the certificate is for' })
  @IsUUID()
  courseId: string;
}
