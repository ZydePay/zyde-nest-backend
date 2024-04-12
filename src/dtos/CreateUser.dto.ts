import { IsNotEmpty } from 'class-validator';

export class CreateTransferDto {
  @IsNotEmpty()
  receipient: string;

  @IsNotEmpty()
  amount: number;
}

export type CreateTransferType = {
  receipient: string;
  amount: number;
};
