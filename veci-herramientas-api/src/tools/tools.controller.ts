import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, UnauthorizedException} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ToolsService } from './tools.service';
import { CreateToolDto } from './dto/create-tool.dto';
import { UpdateToolDto } from './dto/update-tool.dto';
import { ToolStatus } from './entities/tool.entity';
import { UserRole } from '../users/entities/user.entity';

@UseGuards(AuthGuard('jwt'))
@Controller('tools')
export class ToolsController {
  constructor(private readonly toolsService: ToolsService) {}

  @Post()
  create(@Body() createToolDto: CreateToolDto, @Request() req: any) {
    const userId = req.user.userId;
    return this.toolsService.create(createToolDto, userId);
  }

  @Get()
  findAll() {
    return this.toolsService.findAll();
  }

  @Get('pending')
  getPending(@Request() req: any) {
    this.checkAdmin(req.user);
    return this.toolsService.findAllPending();
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string, 
    @Body('status') status: ToolStatus,
    @Request() req: any
  ) {
    this.checkAdmin(req.user);
    return this.toolsService.updateStatus(id, status);
  }

  private checkAdmin(user: any) {
    // IMPORTANTE: Debemos asegurarnos que el JWT strategy devuelva el rol
    // Por ahora, asumiremos que si el email es 'admin@veci.com' es admin
    // O mejor, actualiza tu JWT Strategy para incluir el rol.
    if (user.role !== UserRole.ADMIN) {
        // Fallback temporal para pruebas si no has actualizado JWT:
        // if (user.email !== 'admin@veci.com') 
        throw new UnauthorizedException('Solo administradores');
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.toolsService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.userId;
    return this.toolsService.remove(id, userId);
  }
}