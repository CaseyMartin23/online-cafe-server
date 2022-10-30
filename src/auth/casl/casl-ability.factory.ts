import { Injectable } from "@nestjs/common";
import { AbilityBuilder, MongoAbility, createMongoAbility, InferSubjects, ExtractSubjectType } from "@casl/ability";
import { Action } from "src/auth/casl.action";
import { User } from "src/schemas/user.schema";
import { Product } from "src/schemas/product.schema";
import { UserService } from "src/user/user.service";

type Subjects = InferSubjects<typeof Product | typeof User> | 'all';
type Abilities = [Action, Subjects];
export type AppAbility = MongoAbility<Abilities>;

type RequestUser = {
  sub: string;
  email: string;
  iat: number;
  exp: number;
}

@Injectable()
export class CaslAbilityFactory {
  constructor(private userService: UserService) { }
  async createForUser(user: RequestUser) {
    const fullUser = await this.userService.findOne(user.sub)
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

    if (fullUser.isAdmin) {
      can(Action.Manage, 'all');
    } else {
      can(Action.Read, 'all');
    }

    // can(Action.Update, Product, {  });
    // cannot(Action.Delete, Product, { isPublished: true });

    return build({
      detectSubjectType: (item) => {
        return item.constructor as ExtractSubjectType<Subjects>;
      },
    });
  }
}