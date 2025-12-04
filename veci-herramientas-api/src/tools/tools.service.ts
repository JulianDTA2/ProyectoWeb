import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateToolDto } from './dto/create-tool.dto';
import { Tool, ToolStatus, PostType } from './entities/tool.entity';
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
      status: ToolStatus.PENDING,
      available: true, // Por defecto disponible
    });
    
    await this.notifService.create(userId, `Tu publicación "${newTool.name}" está en revisión.`);
    return this.toolRepository.save(newTool);
  }

  // --- MODIFICADO: Solo devuelve herramientas DISPONIBLES ---
  async findAll(): Promise<Tool[]> {
    return this.toolRepository.find({
      where: { 
        status: ToolStatus.APPROVED,
        available: true 
      },
      relations: { owner: true },
      select: { owner: { id: true, name: true, email: true } },
      order: { createdAt: 'DESC' }
    });
  }

  // --- NUEVO: Ver herramientas NO DISPONIBLES (Vendidas/Prestadas) ---
  async findAllUnavailable(): Promise<Tool[]> {
    return this.toolRepository.find({
      where: { available: false },
      relations: { owner: true },
      order: { createdAt: 'DESC' }
    });
  }

  async findAllPending(): Promise<Tool[]> {
    return this.toolRepository.find({
      where: { status: ToolStatus.PENDING },
      relations: { owner: true },
    });
  }

  // --- MÉTODO AUXILIAR PARA CAMBIAR DISPONIBILIDAD ---
  async setAvailability(id: string, available: boolean) {
    await this.toolRepository.update(id, { available });
  }

  async updateStatus(id: string, status: ToolStatus): Promise<Tool> {
    const tool = await this.toolRepository.findOneBy({ id });
    if (!tool) throw new NotFoundException('Herramienta no encontrada');

    tool.status = status;
    const savedTool = await this.toolRepository.save(tool);

    const message = status === ToolStatus.APPROVED 
      ? `¡Felicidades! Tu publicación "${tool.name}" ha sido aprobada.`
      : `Tu publicación "${tool.name}" ha sido rechazada.`;
      
    await this.notifService.create(tool.ownerId, message);
    return savedTool;
  }

  async findOne(id: string) { return this.toolRepository.findOneBy({ id }); }

  async remove(toolId: string, userId: string): Promise<void> {
    const tool = await this.toolRepository.findOneBy({ id: toolId });
    if (!tool) throw new NotFoundException('Herramienta no encontrada');
    if (tool.ownerId !== userId) throw new UnauthorizedException('No autorizado');
    await this.toolRepository.remove(tool);
  }
}