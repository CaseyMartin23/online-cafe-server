import { Prop } from "@nestjs/mongoose";

export class DefaultSchema {
	@Prop(Date)
	dateCreated: Date = new Date();

	@Prop(Date)
	dateUpdated: Date = new Date();
}