import { UUID } from "crypto";

export type createHouseholdDto = {
  Name: string;
};

export enum HouseholdRole {
  Reader,
  Shopper,
  Editor,
  Manager,
}

export type AppUser = {
  id: UUID;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
};

export type Household = {
  Id: UUID;
  Name: string;
  ShoppingLists?: ShoppingList[];
};

export type ShoppingList = {
  Id: UUID;
  Name: string;
  CreatedAt: string;
  CompletedAt?: string;
  HouseholdId: UUID;
  Household?: Household;
  Items: ShoppingItem[];
};

export type ShoppingItem = {
  Id: UUID;
  Name: string;
  Quantity: number;
  Notes?: string;
  CreatedAt: string;
  UpdatedAt?: string;
  Checked: boolean;
  StoreTagId: UUID;
  StoreTag?: StoreTag;
  ShoppingListId: UUID;
  ShoppingList?: ShoppingList;
};

export type StoreTag = {
  Id: UUID;
  Name: string;
  Description?: string;
  ColorHex: string;
  CreatedAt: string;
  UpdatedAt?: string;
  HouseholdId: UUID;
  Household?: Household;
};
