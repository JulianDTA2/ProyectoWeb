import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateToolDto } from './dto/create-tool.dto';
import { UpdateToolDto } from './dto/update-tool.dto';
import { Tool } from './entities/tool.entity';

@Injectable()
export class ToolsService {
  constructor(
    @InjectRepository(Tool)
    private readonly toolRepository: Repository<Tool>,
  ) {}

  async create(createToolDto: CreateToolDto, userId: string): Promise<Tool> {
    const newTool = this.toolRepository.create({
      ...createToolDto,
      ownerId: userId, 
    });
    
    return this.toolRepository.save(newTool);
  }

  async findAll(): Promise<Tool[]> {
    return this.toolRepository.find({
      relations: {
        owner: true,
      },
      select: {
        owner: {
          id: true,
          name: true,
          email: true,
        }
      }
    });
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