import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { LoansService } from './loans.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Post()
  create(@Body() createLoanDto: CreateLoanDto, @Request() req: any) {
    const requesterId = req.user.userId;
    return this.loansService.create(createLoanDto, requesterId);
  }
}