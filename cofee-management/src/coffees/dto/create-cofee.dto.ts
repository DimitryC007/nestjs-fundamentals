import { IsArray, IsString } from 'class-validator';
import { FlavorDto } from './flavors.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCoffeeDto {
  @ApiProperty({ description: 'the name of the coffee' })
  @IsString()
  readonly name: string;
  @ApiProperty({ description: 'the brand of the coffee' })
  @IsString()
  readonly brand: string;
  @IsArray()
  readonly flavors: FlavorDto[];
}
