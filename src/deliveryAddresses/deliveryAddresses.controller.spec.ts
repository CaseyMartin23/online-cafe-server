import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryAddressesController } from './deliveryAddresses.controller';
import { DeliveryAddressesService } from './deliveryAddresses.service';

describe('DeliveryAddressesController', () => {
  let controller: DeliveryAddressesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeliveryAddressesController],
      providers: [DeliveryAddressesService],
    }).compile();

    controller = module.get<DeliveryAddressesController>(DeliveryAddressesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
