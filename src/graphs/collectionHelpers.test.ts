import { itemsToObjById } from "./collectionHelpers";

describe("itemsToObjById", () => {
  const item1 = { id: "1", text: "hi" };
  const item2 = { id: "2", text: "hello" };
  const item2a = { id: "2", text: "hi there" };

  test("itemsToObjById does its job", () => {
    const map = itemsToObjById([item1, item2]);
    expect(map).toEqual({
      "1": item1,
      "2": item2
    });
  });

  test("itemsToObjById throws on duplicate IDs", () => {
    expect(() => itemsToObjById([item1, item2, item2a])).toThrow();
  });
});
