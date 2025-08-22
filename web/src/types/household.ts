import { UUID } from "crypto";

export type createHouseholdDto = {
  Name: string;
};

export type UserHousehold = {
  userId: string;
  user?: AppUser;
  householdId: UUID;
  household?: Household;
  role: HouseholdRole;
};

export enum HouseholdRole {
  Reader,
  Shopper,
  Editor,
  Manager,
}

export type AppUser = {
  id: string;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
};

export type Household = {
  Id: string;
  Name: string;
  Members?: UserHousehold[];
  ShoppingLists?: ShoppingList[];
};

export type ShoppingList = {
  Id: string;
  Name: string;
  CreatedAt: string;
  CompletedAt?: string;
  HouseholdId: string;
  Household?: Household;
  Items: ShoppingItem[];
};

export type ShoppingItem = {
  Id: string;
  Name: string;
  Quantity: number;
  Notes?: string;
  CreatedAt: string;
  UpdatedAt?: string;
  Checked: boolean;
  StoreTagId: string;
  StoreTag?: StoreTag;
  ShoppingListId: string;
  ShoppingList?: ShoppingList;
};

export type StoreTag = {
  Id: string;
  Name: string;
  Description?: string;
  ColorHex: string;
  CreatedAt: string;
  UpdatedAt?: string;
  HouseholdId: string;
  Household?: Household;
};
