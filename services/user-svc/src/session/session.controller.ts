
import { Controller, Get, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SessionService } from './session.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Sessions')
@Controller('sessions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get('my-sessions')
  @ApiOperation({ summary: 'Get current user sessions' })
  @ApiResponse({ status: 200, description: 'Sessions retrieved successfully' })
  async getMySessions(@Request() req) {
    return this.sessionService.findByUserId(req.user.sub);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate a session' })
  @ApiResponse({ status: 200, description: 'Session deactivated successfully' })
  async deactivateSession(@Param('id') id: string, @Request() req) {
    // Verify session belongs to user
    const sessions = await this.sessionService.findByUserId(req.user.sub);
    const sessionExists = sessions.some(session => session.id === id);
    
    if (!sessionExists) {
      throw new NotFoundException('Session not found');
    }

    await this.sessionService.deactivate(id);
    return { success: true, message: 'Session deactivated successfully' };
  }

  @Delete('all')
  @ApiOperation({ summary: 'Deactivate all user sessions' })
  @ApiResponse({ status: 200, description: 'All sessions deactivated successfully' })
  async deactivateAllSessions(@Request() req) {
    await this.sessionService.deactivateAllUserSessions(req.user.sub);
    return { success: true, message: 'All sessions deactivated successfully' };
  }
}
