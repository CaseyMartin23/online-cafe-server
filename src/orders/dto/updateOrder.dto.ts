import { PartialType } from "@nestjs/mapped-types";
import { IsEnum, IsMongoId, IsDate } from "class-validator";
import { OrderStatuses } from "src/schemas/order.schema";

class OrderUpdateValues {
  @IsEnum(OrderStatuses)
  status: OrderStatuses;

  @IsMongoId()
  cartId: string;

  @IsMongoId()
  deliveryId: string;

  @IsMongoId()
  paymentId: string;

  @IsDate()
  dateOrdered: Date;

  @IsDate()
  datePaid: Date;

  @IsDate()
  dateFulfilled: Date;
}

export class UpdateOrderDto extends PartialType(OrderUpdateValues) {}
