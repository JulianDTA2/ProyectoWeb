import { Injectable, NotFoundException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateToolDto } from './dto/create-tool.dto';
import { Tool, ToolStatus } from './entities/tool.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ToolsService {
  constructor(
    @InjectRepository(Tool)
    private readonly toolRepository: Repository<Tool>,
    private readonly notifService: NotificationsService,
  ) {}

  async create(createToolDto: CreateToolDto, userId: string): Promise<Tool> {
    const newTool = this.toolRepository.create({
      ...createToolDto,
      ownerId: userId,
      status: ToolStatus.PENDING, // Por defecto pendiente
    });
    
    // Notificar al usuario que está en revisión
    await this.notifService.create(userId, `Tu herramienta "${newTool.name}" está en revisión.`);
    
    return this.toolRepository.save(newTool);
  }

  // Búsqueda pública: SOLO herramientas APROBADAS
  async findAll(): Promise<Tool[]> {
    return this.toolRepository.find({
      where: { status: ToolStatus.APPROVED },
      relations: { owner: true },
      select: { owner: { id: true, name: true, email: true } }
    });
  }

  // Búsqueda ADMIN: Herramientas PENDIENTES
  async findAllPending(): Promise<Tool[]> {
    return this.toolRepository.find({
      where: { status: ToolStatus.PENDING },
      relations: { owner: true },
    });
  }

  // Acción ADMIN: Aprobar o Rechazar
  async updateStatus(id: string, status: ToolStatus): Promise<Tool> {
    const tool = await this.toolRepository.findOneBy({ id });
    if (!tool) throw new NotFoundException('Herramienta no encontrada');

    tool.status = status;
    const savedTool = await this.toolRepository.save(tool);

    // Notificar al dueño
    const message = status === ToolStatus.APPROVED 
      ? `¡Felicidades! Tu herramienta "${tool.name}" ha sido aprobada y ya está visible.`
      : `Lo sentimos, tu herramienta "${tool.name}" ha sido rechazada.`;
      
    await this.notifService.create(tool.ownerId, message);

    return savedTool;
  }

  findOne(id: string) {
    return this.toolRepository.findOneBy({ id });
  }

  async remove(toolId: string, userId: string): Promise<void> {
    const tool = await this.toolRepository.findOneBy({ id: toolId });

    if (!tool) {
      throw new NotFoundException('La herramienta no existe');
    }

    if (tool.ownerId !== userId) {
      throw new UnauthorizedException('No tienes permiso para borrar esta herramienta');
    }

    await this.toolRepository.remove(tool);
  }
}