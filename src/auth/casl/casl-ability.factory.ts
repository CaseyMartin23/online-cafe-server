import { Injectable } from "@nestjs/common";
import { Ability, createMongoAbility, AbilityBuilder, AbilityClass, InferSubjects } from "@casl/ability";
import { Action } from "src/auth/casl.action";
import { User } from "src/schemas/user.schema";
import { Product } from "src/schemas/product.schema";

type Subjects = InferSubjects<typeof Product | typeof User> | 'all';
export type AppAbility = Ability<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User) {
    const { can, cannot, build } = new AbilityBuilder<
      Ability<[Action, Subjects]>
    >(Ability as AbilityClass<AppAbility>);

    //     if (user.isAdmin) {
    //       can(Action.Manage, 'all');
    //     } else {
    //       can(Action.Read, 'all');
    //     }

    //     can(Action.Update, Article, { authorId: user.id });
    //     cannot(Action.Delete, Article, { isPublished: true });

    //     return build({
    //       detectSubjectType: (item) =>
    //         item.constructor as ExtractSubjectType<Subjects>,
    //     });
  }
}