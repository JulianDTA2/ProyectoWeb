import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLoanDto } from './dto/create-loan.dto';
import { Loan } from './entities/loan.entity';
import { ToolsService } from '../tools/tools.service';

@Injectable()
export class LoansService {
  constructor(
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
    private readonly toolsService: ToolsService,
  ) {}

  async create(createLoanDto: CreateLoanDto, requesterId: string): Promise<Loan> {
    const { toolId, startDate, endDate } = createLoanDto;

    const tool = await this.toolsService.findOne(toolId);
    if (!tool) {
      throw new BadRequestException('La herramienta no existe');
    }

    if (tool.ownerId === requesterId) {
      throw new BadRequestException('No puedes solicitar tu propia herramienta');
    }

    const newLoan = this.loanRepository.create({
      toolId,
      ownerId: tool.ownerId,
      requesterId: requesterId,
      startDate,
      endDate,
    });

    return this.loanRepository.save(newLoan);
  }
}