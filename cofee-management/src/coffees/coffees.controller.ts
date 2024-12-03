import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CoffeesService } from './coffees.service';
import { CoffeeEntity } from './entities/coffee.entity';
import { CreateCoffeeDto } from './dto/create-cofee.dto';
import { UpdateCoffeDto } from './dto/update-coffe.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { Public } from '../common/decorators/public.decorator';
import { ParseIntPipe } from '../common/pipes/parse-int/parse-int.pipe';
import { protocol } from '../common/decorators/protocol.decorator';
import { ApiForbiddenResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('coffees')
@Controller({ path: 'coffees', version: '1' })
export class CoffeesController {
  constructor(private readonly cofeesService: CoffeesService) {}

  @ApiForbiddenResponse({ description: 'Forbidden' })
  @Public()
  @Get()
  async findAll(
    @protocol('https') protocol: string,
    @Query() query: PaginationQueryDto,
  ): Promise<CoffeeEntity[]> {
    console.log('protocol: ' + protocol);
    //const { limit, offset } = query;
    //await new Promise((resolve) => setTimeout(resolve, 4000));
    return this.cofeesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<CoffeeEntity | null> {
    return this.cofeesService.findOne(id);
  }

  @Post()
  create(@Body() createCoffeeDto: CreateCoffeeDto): Promise<CoffeeEntity> {
    return this.cofeesService.create(createCoffeeDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCoffeDto: UpdateCoffeDto,
  ): Promise<boolean> {
    return this.cofeesService.update(id, updateCoffeDto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number): Promise<CoffeeEntity> {
    return this.cofeesService.remove(id);
  }
}
