export type voidFunc = () => void;
interface IdItem {
  id: string;
}
export interface IdMap<T> {
  [id: string]: T;
}

export function itemsToObjById<T extends IdItem>(items: T[]) {
  const holder: IdMap<T> = {};

  for (const item of items) {
    const { id } = item;
    if (holder[id]) {
      throw new Error("Duplicate 'id' property in items");
    } else {
      holder[id] = item;
    }
  }

  return holder;
}
