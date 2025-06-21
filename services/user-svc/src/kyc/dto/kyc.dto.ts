
import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentType, DocumentStatus } from '../entities/kyc-document.entity';

export class UploadDocumentDto {
  @ApiProperty({ enum: DocumentType })
  @IsEnum(DocumentType)
  documentType: DocumentType;

  @ApiProperty({ example: 'ABCDE1234F' })
  @IsString()
  documentNumber: string;

  @ApiProperty({ description: 'Document file URL (set automatically after upload)' })
  @IsOptional()
  @IsString()
  documentUrl?: string;

  @ApiPropertyOptional({ description: 'Back side document URL (for Aadhaar, etc.)' })
  @IsOptional()
  @IsString()
  backDocumentUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: any;
}

export class UpdateDocumentStatusDto {
  @ApiProperty({ enum: DocumentStatus })
  @IsEnum(DocumentStatus)
  status: DocumentStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
