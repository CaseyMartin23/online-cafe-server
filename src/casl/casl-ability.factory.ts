// import { Ability, InferSubjects } from "@casl/ability";
// import { Action } from "src/auth/casl.action";

// type Subjects = InferSubjects<typeof Article | typeof User> | 'all';
// export type AppAbility = Ability<[Action, Subjects]>;

// @Injectable()
// export class CaslAbilityFactory {
//   createForUser(user: User) {
//     const { can, cannot, build } = new AbilityBuilder<
//       Ability<[Action, Subjects]>
//     >(Ability as AbilityClass<AppAbility>);

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
//   }
// }