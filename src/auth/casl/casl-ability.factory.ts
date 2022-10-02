import { Injectable } from "@nestjs/common";
import { AbilityBuilder, MongoAbility, createMongoAbility, InferSubjects, ExtractSubjectType } from "@casl/ability";
import { Action } from "src/auth/casl.action";
import { User } from "src/schemas/user.schema";
import { Product } from "src/schemas/product.schema";

type Subjects = InferSubjects<typeof Product | typeof User> | 'all';
type Abilities = [Action, Subjects];
export type AppAbility = MongoAbility<Abilities>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User) {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

    if (user.isAdmin) {
      can(Action.Manage, 'all');
    } else {
      can(Action.Read, 'all');
    }

    can(Action.Update, Product, { createdBy: user });
    cannot(Action.Delete, Product, { isPublished: true });

    return build({
      detectSubjectType: (item) => {
        return item.constructor as ExtractSubjectType<Subjects>;
      },
    });
  }
}