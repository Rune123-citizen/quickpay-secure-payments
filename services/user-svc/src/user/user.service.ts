
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatus, KycTier } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto, UpdateProfileDto } from './dto/user.dto';
import { KafkaService } from '../kafka/kafka.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private kafkaService: KafkaService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { phoneNumber: createUserDto.phoneNumber }
    });

    if (existingUser) {
      throw new ConflictException('User with this phone number already exists');
    }

    const user = this.userRepository.create({
      ...createUserDto,
      isPhoneVerified: true, // Assuming phone is verified during registration
    });

    const savedUser = await this.userRepository.save(user);

    // Publish user created event
    await this.kafkaService.publish('user.created', {
      userId: savedUser.id,
      phoneNumber: savedUser.phoneNumber,
      timestamp: new Date().toISOString(),
    });

    return savedUser;
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      select: ['id', 'phoneNumber', 'email', 'firstName', 'lastName', 'status', 'kycTier', 'createdAt']
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['sessions', 'kycDocuments']
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByPhone(phoneNumber: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { phoneNumber }
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    
    Object.assign(user, updateUserDto);
    const updatedUser = await this.userRepository.save(user);

    // Publish user updated event
    await this.kafkaService.publish('user.updated', {
      userId: updatedUser.id,
      changes: updateUserDto,
      timestamp: new Date().toISOString(),
    });

    return updatedUser;
  }

  async updateProfile(id: string, updateProfileDto: UpdateProfileDto): Promise<User> {
    const user = await this.findOne(id);
    
    Object.assign(user, updateProfileDto);
    return this.userRepository.save(user);
  }

  async updateKycTier(id: string, tier: KycTier): Promise<User> {
    const user = await this.findOne(id);
    
    user.kycTier = tier;
    user.kycVerified = tier > KycTier.NONE;
    user.kycVerifiedAt = tier > KycTier.NONE ? new Date() : null;

    const updatedUser = await this.userRepository.save(user);

    // Publish KYC status change event
    await this.kafkaService.publish('user.kyc.updated', {
      userId: updatedUser.id,
      kycTier: tier,
      kycVerified: updatedUser.kycVerified,
      timestamp: new Date().toISOString(),
    });

    return updatedUser;
  }

  async updateStatus(id: string, status: UserStatus): Promise<User> {
    const user = await this.findOne(id);
    
    user.status = status;
    const updatedUser = await this.userRepository.save(user);

    // Publish user status change event
    await this.kafkaService.publish('user.status.changed', {
      userId: updatedUser.id,
      oldStatus: user.status,
      newStatus: status,
      timestamp: new Date().toISOString(),
    });

    return updatedUser;
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);

    // Publish user deleted event
    await this.kafkaService.publish('user.deleted', {
      userId: id,
      timestamp: new Date().toISOString(),
    });
  }

  async getStats(): Promise<any> {
    const totalUsers = await this.userRepository.count();
    const activeUsers = await this.userRepository.count({ where: { status: UserStatus.ACTIVE } });
    const kycVerifiedUsers = await this.userRepository.count({ where: { kycVerified: true } });
    
    const kycTierStats = await this.userRepository
      .createQueryBuilder('user')
      .select('user.kycTier', 'tier')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.kycTier')
      .getRawMany();

    return {
      totalUsers,
      activeUsers,
      kycVerifiedUsers,
      kycTierStats,
    };
  }
}
