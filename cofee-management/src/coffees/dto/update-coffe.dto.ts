import { PartialType } from '@nestjs/swagger';
import { CreateCoffeeDto } from './create-cofee.dto';

export class UpdateCoffeDto extends PartialType(CreateCoffeeDto) {}
