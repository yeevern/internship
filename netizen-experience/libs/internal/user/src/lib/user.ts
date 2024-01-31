import { userLibConfiguration } from "../init";
import { Rights } from "../types";
import { userMetaEntity } from "./entities";

export async function getUser({ id }: { id: string }) {
  const { userTable } = userLibConfiguration.config;
  return await userTable.get({
    schema: userMetaEntity,
    keys: {
      id,
      sort: "meta",
    },
  });
}

export async function createUser({
  email,
  id,
  name,
  picture,
}: {
  id: string;
  name: string;
  email: string;
  picture: string;
}) {
  const { userTable } = userLibConfiguration.config;
  const user = await getUser({ id });
  if (user) return user;
  const createdUser = await userTable.create({
    schema: userMetaEntity,
    item: {
      id,
      sort: "meta",
      name,
      email,
      picture,
      rights: [],
    },
  });
  return createdUser;
}

export async function updateRights({ id, rights }: { id: string; rights: Rights[] }) {
  const { userTable } = userLibConfiguration.config;
  const user = await getUser({ id });
  if (!user) throw new Error("User not found");
  return await userTable.update({
    schema: userMetaEntity,
    attributes: {
      id,
      sort: "meta",
      rights,
    },
  });
}
