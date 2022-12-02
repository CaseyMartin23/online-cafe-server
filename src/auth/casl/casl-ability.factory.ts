import { Injectable } from "@nestjs/common";
import { AbilityBuilder, MongoAbility, createMongoAbility, InferSubjects, ExtractSubjectType } from "@casl/ability";
import { Action } from "src/auth/casl.action";
import { User } from "src/schemas/user.schema";
import { Product } from "src/schemas/product.schema";
import { UserService } from "src/user/user.service";
import { Order } from "src/schemas/order.schema";
import { Cart } from "src/schemas/cart.schema";
import { Payment } from "src/schemas/payment.schema";
import { Delivery } from "src/schemas/delivery.schema";
import { Address } from "src/schemas/address.schema";

type Subjects = InferSubjects<typeof Product | typeof User | typeof Order | typeof Cart | typeof Payment | typeof Delivery | typeof Address> | 'all';
type Abilities = [Action, Subjects];
export type AppAbility = MongoAbility<Abilities>;

type RequestUser = {
  sub: string;
  iat: number;
  exp: number;
}

@Injectable()
export class CaslAbilityFactory {
  constructor(private userService: UserService) { }

  public async createForUser(user: RequestUser) {
    const fullUser = await this.userService.findOne(user.sub);
    const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

    if (fullUser.isAdmin) {
      can(Action.Manage, 'all');
    } else {
      can(Action.Read, Product);
      can(Action.Read, Order, { userId: fullUser.id });
      can(Action.Read, Cart, { userId: fullUser.id });
      can(Action.Read, Payment, { userId: fullUser.id });
      can(Action.Read, Address, { userId: fullUser.id });
    }

    return build({
      detectSubjectType: (item) => {
        return item.constructor as ExtractSubjectType<Subjects>;
      },
    });
  }
}