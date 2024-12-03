import { Test, TestingModule } from '@nestjs/testing';
import { CoffeesService } from './coffees.service';
import { getCustomRepositoryToken, getRepositoryToken } from '@nestjs/typeorm';
import { FlavorEntity } from './entities/flavor.entity';
import { CoffeeEntity } from './entities/coffee.entity';
import { DataSource, Repository } from 'typeorm';
import coffeesConfig from './config/coffees.config';
import { NotFoundException } from '@nestjs/common';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
const createMockRepository = <T = any>(): MockRepository<T> => ({
  findOne: jest.fn(),
  create: jest.fn(),
});

describe('CofeesService', () => {
  let service: CoffeesService;
  let coffeRepository: MockRepository;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoffeesService,

        {
          provide: getRepositoryToken(CoffeeEntity),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(FlavorEntity),
          useValue: createMockRepository(),
        },
        { provide: DataSource, useValue: {} },
        { provide: coffeesConfig.KEY, useValue: {} },
      ],
    }).compile();

    service = module.get<CoffeesService>(CoffeesService);
    coffeRepository = module.get<MockRepository>(
      getRepositoryToken(CoffeeEntity),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    describe('when coffe with ID exists', () => {
      it('should return the coffe object', async () => {
        const coffeeId = 1;
        const expectedCofee = {};

        coffeRepository.findOne.mockReturnValue(expectedCofee);

        const coffee = await service.findOne(coffeeId);
        expect(coffee).toEqual(expectedCofee);
      });
    });
    describe('otherwise', () => {
      it('should throw the "NotFoundException"', async () => {
        const coffeeId = 1;

        coffeRepository.findOne.mockReturnValue(undefined);
        try {
          await service.findOne(coffeeId);
        } catch (err) {
          expect(err).toBeInstanceOf(NotFoundException);
        }
      });
    });
  });
});
