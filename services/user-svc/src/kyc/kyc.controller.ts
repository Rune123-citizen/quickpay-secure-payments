
import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  UseGuards, 
  Request,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { KycService } from './kyc.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { UploadDocumentDto, UpdateDocumentStatusDto } from './dto/kyc.dto';

@ApiTags('KYC')
@Controller('kyc')
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload KYC document' })
  @ApiResponse({ status: 201, description: 'Document uploaded successfully' })
  async uploadDocument(
    @Request() req,
    @Body() uploadDocumentDto: UploadDocumentDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    // In a real implementation, you would upload the file to cloud storage
    // and get the URL. For now, we'll use a placeholder
    const documentUrl = `https://storage.example.com/kyc/${file.filename}`;
    
    return this.kycService.uploadDocument(req.user.sub, {
      ...uploadDocumentDto,
      documentUrl,
    });
  }

  @Get('my-documents')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user KYC documents' })
  @ApiResponse({ status: 200, description: 'Documents retrieved successfully' })
  async getMyDocuments(@Request() req) {
    return this.kycService.getUserDocuments(req.user.sub);
  }

  @Get('pending')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get pending KYC documents (admin only)' })
  @ApiResponse({ status: 200, description: 'Pending documents retrieved successfully' })
  async getPendingDocuments() {
    return this.kycService.getPendingDocuments();
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get KYC statistics (admin only)' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStats() {
    return this.kycService.getKycStats();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get KYC document by ID (admin only)' })
  @ApiResponse({ status: 200, description: 'Document retrieved successfully' })
  async getDocument(@Param('id') id: string) {
    return this.kycService.getDocument(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update KYC document status (admin only)' })
  @ApiResponse({ status: 200, description: 'Document status updated successfully' })
  async updateDocumentStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateDocumentStatusDto,
    @Request() req
  ) {
    return this.kycService.updateDocumentStatus(id, updateDto, req.user.sub);
  }
}
