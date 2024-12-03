import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CoffeeEntity } from './entities/coffee.entity';
import { CreateCoffeeDto } from './dto/create-cofee.dto';
import { UpdateCoffeDto } from './dto/update-coffe.dto';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { FlavorEntity } from './entities/flavor.entity';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { EventEntity } from '../events/entities/event.entity';
import { ConfigType } from '@nestjs/config';
import coffeesConfig from './config/coffees.config';

@Injectable()
export class CoffeesService {
  constructor(
    @InjectRepository(CoffeeEntity)
    private readonly coffeeRepository: Repository<CoffeeEntity>,
    @InjectRepository(FlavorEntity)
    private readonly flavorRepository: Repository<FlavorEntity>,
    private readonly dataSource: DataSource,
    @Inject(coffeesConfig.KEY)
    private readonly coffeesConfiguration: ConfigType<typeof coffeesConfig>,
  ) {
    console.log(this.coffeesConfiguration);
  }
  // coffees: Coffee[] = [
  //   {
  //     id: 1,
  //     name: 'capuchino',
  //     brand: 'ness-cafe',
  //     flavors: ['flavor_1', 'flavor_2'],
  //   },
  //   {
  //     id: 2,
  //     name: 'maciato',
  //     brand: 'espresso',
  //     flavors: ['flavor_2'],
  //   },
  //   {
  //     id: 3,
  //     name: 'espresso-hard',
  //     brand: 'espresso',
  //     flavors: ['flavor_3'],
  //   },
  // ];

  findAll(query: PaginationQueryDto): Promise<CoffeeEntity[]> {
    const { limit, offset } = query;
    return this.coffeeRepository.find({
      skip: offset,
      take: limit,
      relations: ['flavors'],
    });
  }

  async findOne(id: number): Promise<CoffeeEntity | null> {
    const coffee = await this.coffeeRepository.findOne({ where: [{ id }] });

    if (!coffee) throw new NotFoundException();

    return coffee;
    // return this.coffees.find((x) => x.id === id);
  }

  async create(createCoffeeDto: CreateCoffeeDto): Promise<CoffeeEntity> {
    const flavors = await Promise.all(
      createCoffeeDto.flavors.map((flavor) =>
        this.preloadFlavorByName(flavor.name),
      ),
    );

    const coffee = await this.coffeeRepository.create({
      name: createCoffeeDto.name,
      brand: createCoffeeDto.brand,
      flavors,
    });

    return this.coffeeRepository.save(coffee);
    //this.coffees.push(createCoffeeDto as Coffee);
  }

  async update(id: number, updateCoffeeDto: UpdateCoffeDto): Promise<boolean> {
    const flavors =
      updateCoffeeDto.flavors &&
      (await Promise.all(
        updateCoffeeDto.flavors.map((flavor) =>
          this.preloadFlavorByName(flavor.name),
        ),
      ));

    const coffee = await this.coffeeRepository.preload({
      id,
      name: updateCoffeeDto.name,
      brand: updateCoffeeDto.brand,
      flavors,
    });
    await this.coffeeRepository.save(coffee);
    return true;
    // const coffee = this.findOne(id);

    // if (!coffee) return false;

    // coffee.brand = updateCoffeeDto.brand;
    // coffee.flavors = updateCoffeeDto.flavors;
    // coffee.name = updateCoffeeDto.name;

    // return true;
  }

  async remove(id: number): Promise<CoffeeEntity> {
    const coffee = await this.findOne(id);
    return this.coffeeRepository.remove(coffee);
    // const coffeeIndex = this.coffees.findIndex((x) => x.id === id);
    // if (coffeeIndex >= 0) {
    //   this.coffees.splice(coffeeIndex, 1);
    // }
  }

  async recommendCoffee(coffee: CoffeeEntity) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      coffee.recommendations++;
      const recommendEvent = new EventEntity();
      recommendEvent.name = 'recommend_coffee';
      recommendEvent.type = 'coffee';
      recommendEvent.payload = { coffeeId: coffee.id };

      // Execute your operations
      await queryRunner.manager.save(coffee);
      await queryRunner.manager.save(recommendEvent);

      // Commit the transaction if everything goes well
      await queryRunner.commitTransaction();
    } catch (err) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      // Release the query runner when done
      await queryRunner.release();
    }
  }

  private async preloadFlavorByName(name: string): Promise<FlavorEntity> {
    const flavor = await this.flavorRepository.findOne({ where: { name } });

    if (flavor) return flavor;

    return this.flavorRepository.create({ name });
  }
}
