// src/loans/loans.module.ts
import { Module } from '@nestjs/common';
import { LoansService } from './loans.service';
import { LoansController } from './loans.controller';
import { TypeOrmModule } from '@nestjs/typeorm'; 
import { Loan } from './entities/loan.entity';   
import { ToolsModule } from '../tools/tools.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Loan]), 
    ToolsModule,
  ],
  controllers: [LoansController],
  providers: [LoansService],
  exports: [LoansService]
})
export class LoansModule {}