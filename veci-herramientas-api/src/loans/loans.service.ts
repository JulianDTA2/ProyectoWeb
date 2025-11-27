import { 
  BadRequestException, 
  Injectable, 
  NotFoundException, 
  UnauthorizedException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanStatusDto } from './dto/update-loan-status.dto'; // <-- Importar
import { Loan } from './entities/loan.entity';
import { ToolsService } from '../tools/tools.service';

@Injectable()
export class LoansService {
  constructor(
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
    private readonly toolsService: ToolsService,
  ) {}

  // ... (tus métodos create y findMyLoans existentes) ...
  async create(createLoanDto: CreateLoanDto, requesterId: string): Promise<Loan> {
    const { toolId, startDate, endDate } = createLoanDto;
    const tool = await this.toolsService.findOne(toolId);
    if (!tool) throw new BadRequestException('La herramienta no existe');
    if (tool.ownerId === requesterId) throw new BadRequestException('No puedes solicitar tu propia herramienta');

    const newLoan = this.loanRepository.create({
      toolId,
      ownerId: tool.ownerId,
      requesterId,
      startDate,
      endDate,
    });
    return this.loanRepository.save(newLoan);
  }

  async findMyLoans(userId: string): Promise<Loan[]> {
    return this.loanRepository.find({
      where: [{ requesterId: userId }, { ownerId: userId }],
      relations: { tool: true, owner: true, requester: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Loan | null> {
    return this.loanRepository.findOneBy({ id });
  }

  async updateStatus(
    id: string, 
    updateLoanStatusDto: UpdateLoanStatusDto, 
    userId: string
  ): Promise<Loan> {
    const loan = await this.loanRepository.findOneBy({ id });

    if (!loan) {
      throw new NotFoundException('Préstamo no encontrado');
    }

    // Validación de seguridad: Solo el dueño de la herramienta puede cambiar el estado
    // (Opcional: podrías permitir que el solicitante cancele si está 'pending')
    if (loan.ownerId !== userId) {
      throw new UnauthorizedException('No tienes permiso para gestionar este préstamo');
    }

    loan.status = updateLoanStatusDto.status;
    return this.loanRepository.save(loan);
  }
}