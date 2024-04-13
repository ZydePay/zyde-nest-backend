import { IsNotEmpty } from 'class-validator';

export class CreateTransferDto {
  @IsNotEmpty()
  receipient: string;

  @IsNotEmpty()
  amount: number;

  @IsNotEmpty()
  privateKey: string;

}

export type CreateTransferType = {
  receipient: string;
  amount: number;
  privateKey: string;
};
