import {
  FlattenMaps,
  HydratedDocument,
  PopulateOptions,
  ProjectionType,
  QueryFilter,
  QueryOptions,
} from "mongoose";
import { IChat } from "../../common/interfaces/chat.interface.js";
import { Chat } from "../models/chat.model.js";
import { DataBaseRepository } from "./base.repository.js";

export class ChatRepository extends DataBaseRepository<IChat> {
  constructor() {
    super(Chat);
  }

  async findOneChat({
    filter,
    options,
    page = 1,
    size = 5,
  }: {
    filter?: QueryFilter<IChat>;
    options?: QueryOptions<IChat> | null;
    page?: number;
    size?: number;
  }): Promise<HydratedDocument<IChat> | FlattenMaps<IChat> | null> {
    const doc = await this.model.findOne(
      filter,
      {
        messages: { $slice: [-(page * size), size] },
      } as ProjectionType<IChat>,
      options,
    );

    return doc;
  }
}
