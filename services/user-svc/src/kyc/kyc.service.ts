
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KycDocument, DocumentType, DocumentStatus } from './entities/kyc-document.entity';
import { UserService } from '../user/user.service';
import { KycTier } from '../user/entities/user.entity';
import { UploadDocumentDto, UpdateDocumentStatusDto } from './dto/kyc.dto';

@Injectable()
export class KycService {
  constructor(
    @InjectRepository(KycDocument)
    private kycDocumentRepository: Repository<KycDocument>,
    private userService: UserService,
  ) {}

  async uploadDocument(userId: string, uploadDocumentDto: UploadDocumentDto): Promise<KycDocument> {
    // Check if document type already exists for user
    const existingDocument = await this.kycDocumentRepository.findOne({
      where: { 
        userId, 
        documentType: uploadDocumentDto.documentType,
        status: DocumentStatus.APPROVED 
      }
    });

    if (existingDocument) {
      throw new BadRequestException('Document of this type already exists and is approved');
    }

    const document = this.kycDocumentRepository.create({
      userId,
      ...uploadDocumentDto,
    });

    return this.kycDocumentRepository.save(document);
  }

  async getUserDocuments(userId: string): Promise<KycDocument[]> {
    return this.kycDocumentRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' }
    });
  }

  async getDocument(id: string): Promise<KycDocument> {
    const document = await this.kycDocumentRepository.findOne({
      where: { id },
      relations: ['user']
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return document;
  }

  async updateDocumentStatus(
    id: string, 
    updateDto: UpdateDocumentStatusDto,
    verifiedBy: string
  ): Promise<KycDocument> {
    const document = await this.getDocument(id);
    
    document.status = updateDto.status;
    document.rejectionReason = updateDto.rejectionReason;
    document.verifiedBy = verifiedBy;
    document.verifiedAt = new Date();

    const updatedDocument = await this.kycDocumentRepository.save(document);

    // Update user KYC tier based on approved documents
    await this.updateUserKycTier(document.userId);

    return updatedDocument;
  }

  async getPendingDocuments(): Promise<KycDocument[]> {
    return this.kycDocumentRepository.find({
      where: { status: DocumentStatus.PENDING },
      relations: ['user'],
      order: { createdAt: 'ASC' }
    });
  }

  private async updateUserKycTier(userId: string): Promise<void> {
    const approvedDocuments = await this.kycDocumentRepository.find({
      where: { userId, status: DocumentStatus.APPROVED }
    });

    const documentTypes = approvedDocuments.map(doc => doc.documentType);
    
    let newTier = KycTier.NONE;

    // Tier 1: Basic KYC (PAN card)
    if (documentTypes.includes(DocumentType.PAN)) {
      newTier = KycTier.TIER_1;
    }

    // Tier 2: Full KYC (PAN + Aadhaar + Address proof)
    const hasAadhaar = documentTypes.includes(DocumentType.AADHAAR);
    const hasAddressProof = documentTypes.some(type => 
      [DocumentType.BANK_STATEMENT, DocumentType.UTILITY_BILL].includes(type)
    );

    if (documentTypes.includes(DocumentType.PAN) && hasAadhaar && hasAddressProof) {
      newTier = KycTier.TIER_2;
    }

    await this.userService.updateKycTier(userId, newTier);
  }

  async getKycStats(): Promise<any> {
    const totalDocuments = await this.kycDocumentRepository.count();
    const pendingDocuments = await this.kycDocumentRepository.count({ 
      where: { status: DocumentStatus.PENDING } 
    });
    const approvedDocuments = await this.kycDocumentRepository.count({ 
      where: { status: DocumentStatus.APPROVED } 
    });
    const rejectedDocuments = await this.kycDocumentRepository.count({ 
      where: { status: DocumentStatus.REJECTED } 
    });

    const documentTypeStats = await this.kycDocumentRepository
      .createQueryBuilder('doc')
      .select('doc.documentType', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('doc.documentType')
      .getRawMany();

    return {
      totalDocuments,
      pendingDocuments,
      approvedDocuments,
      rejectedDocuments,
      documentTypeStats,
    };
  }
}
