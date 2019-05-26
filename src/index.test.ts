import IndexableArray from "./index";

function getData(): { id?: number; name: string }[] {
  return [{ id: 1, name: "George" }, { id: 2, name: "Lisa" }, { id: 3, name: "George" }];
}

function ia() {
  return new IndexableArray(...getData()).addIndex("name", "id");
}

function singleIa() {
  return new IndexableArray(...getData()).addIndex("name");
}

function selfIa() {
  return new IndexableArray(...getData()).addSelfIndex();
}

describe("Indexable Array", () => {
  describe("instance", () => {
    it("should be an instance of Array.", () => {
      expect(Array.isArray(ia())).toBe(true);
    });

    it("should be equal to given array.", () => {
      expect([...ia()]).toEqual(getData());
    });

    it("should update sub values using set().", () => {
      const result = ia();
      result.set(0, "name", "Kevin");
      expect(result.getAllIndexes("George")).toEqual([2]);
      expect(result.getAllIndexes("Kevin")).toEqual([0]);
    });

    it("should throw if non existing item tried to be updated with set().", () => {
      expect(() => ia().set(99, "name", "Kevin")).toThrow("Cannot set field value of undefined");
    });

    it("should throw if non existing index tried to be get.", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => ia().get("XYZ", ({ key: "NON-EXISTING" } as unknown) as any)).toThrow("Key is not indexed");
    });

    it("should update sub values using set() even if sub field does not exists.", () => {
      const result = new IndexableArray({ id: 1 }, { id: 2, name: "Lisa" }, { id: 3, name: "George" }).addIndex("name");
      result.set(0, "name", "Kevin");
      expect(result.getAllIndexes("George")).toEqual([2]);
      expect(result.getAllIndexes("Kevin")).toEqual([0]);
    });

    it("should disable and enable index.", () => {
      const result = ia();
      result.disableIndex();
      result[0].name = "Kevin";
      result.enableIndex();
      expect(result.getAllIndexes("George")).toEqual([2]);
      expect(result.getAllIndexes("Kevin")).toEqual([0]);
    });

    it("should throw if index based operation is used while index is disabled.", () => {
      const result = ia();
      result.disableIndex();

      expect(() => result.getAllIndexes("Lisa")).toThrow("Index based operations cannot be used");
    });

    it("should return correct value for mixed (object & primitive) keys.", () => {
      const nameObject = { short: "L" };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const testData: { id?: number; name: string | Record<string, any> }[] = [
        { id: 1, name: "George" },
        { id: 2, name: nameObject },
        { id: 3, name: "George" },
      ];

      const result = new IndexableArray(...testData).addIndex("name");

      expect(result.getIndex(nameObject)).toBe(1);
    });

    it("can change default index key.", () => {
      const result = ia().setDefaultIndex("id");
      expect(result.getIndex(1)).toBe(0);
    });

    it("wont re-build already built index", () => {
      const result = ia();
      result.addIndex("name");
      expect(result.getIndex("Lisa")).toBe(1);
    });
  });

  describe("IndexableArray.from()", () => {
    it("should create new IndexableArray from normal array", () => {
      const result = IndexableArray.from([{ id: 1, name: "George" }, { id: 2, name: "Lisa" }, { id: 3, name: "George" }]).addIndex("name");
      expect(result.getAllIndexes("George")).toEqual([0, 2]);
    });

    it("should create new IndexableArray from normal array using map function", () => {
      const result = IndexableArray.from(
        [{ id: 1, name: "George" }, { id: 2, name: "Lisa" }, { id: 3, name: "George" }],
        ({ id, name }) => ({ id: id + 1, name })
      ).addIndex("name");

      expect(result.getAll("George")).toEqual([{ id: 2, name: "George" }, { id: 4, name: "George" }]);
    });

    it("should create new IndexableArray from IndexableArray", () => {
      const result = IndexableArray.from(ia());
      expect(result.getAllIndexes("George")).toEqual([0, 2]);
    });
  });

  describe("getIndex()", () => {
    it("should return index of value for default field.", () => {
      expect(ia().getIndex("George")).toBe(0);
    });

    it("should return -1 if default field is not found.", () => {
      expect(ia().getIndex("XYZ")).toBe(-1);
    });

    it("should return index of value for default field from given index.", () => {
      expect(ia().getIndex("George", { fromIndex: 1 })).toBe(2);
    });

    it("should return index of value for default field from given negative index.", () => {
      expect(ia().getIndex("George", { fromIndex: -2 })).toBe(2);
    });

    it("should return index of value for given field.", () => {
      expect(ia().getIndex(2, { key: "id" })).toBe(1);
    });

    it("should return -1 if value for given field is not found.", () => {
      expect(ia().getIndex(2, { key: "id" })).toBe(1);
    });

    it("should return index of value for given field from given index.", () => {
      expect(ia().getIndex("George", { key: "name", fromIndex: 1 })).toBe(2);
    });

    it("should return index of value for given field from given negative index.", () => {
      expect(ia().getIndex("George", { key: "name", fromIndex: -2 })).toBe(2);
    });

    it("should return index of selfIndexed data for default value", () => {
      const result = selfIa();
      expect(result.getIndex(result[0])).toBe(0);
    });

    it("should return index of value for default field with single field index.", () => {
      expect(singleIa().getIndex("George")).toBe(0);
    });
  });

  describe("get()", () => {
    it("should return value for default field.", () => {
      expect(ia().get("George")).toEqual({ name: "George", id: 1 });
    });

    it("should return undefined if default field is not found.", () => {
      expect(ia().get("XYZ")).toBeUndefined();
    });

    it("should return value for default field from given index.", () => {
      expect(ia().get("George", { fromIndex: 1 })).toEqual({ name: "George", id: 3 });
    });

    it("should return index of value for given field.", () => {
      expect(ia().get(2, { key: "id" })).toEqual({ name: "Lisa", id: 2 });
    });

    it("should return index of value for given field from given index.", () => {
      expect(ia().get("George", { key: "name", fromIndex: 1 })).toEqual({ name: "George", id: 3 });
    });
  });

  describe("getAll()", () => {
    it("should return values for default field.", () => {
      expect(ia().getAll("George")).toEqual([{ name: "George", id: 1 }, { name: "George", id: 3 }]);
    });

    it("should return empty array if default field is not found.", () => {
      expect(ia().getAll("XYZ")).toEqual([]);
    });

    it("should return index of value for given field.", () => {
      expect(ia().getAll(2, { key: "id" })).toEqual([{ name: "Lisa", id: 2 }]);
    });
  });

  describe("getAllIndexes()", () => {
    it("should return all indexes of value for default field.", () => {
      expect(ia().getAllIndexes("George")).toEqual([0, 2]);
    });

    it("should return empty array for all indexes if default field not found.", () => {
      expect(ia().getAllIndexes("XYZ")).toEqual([]);
    });

    it("should return all indexes of value for given field.", () => {
      expect(ia().getAllIndexes("George", { key: "name" })).toEqual([0, 2]);
    });
  });

  describe("has", () => {
    it("should check existence of value for default field.", () => {
      expect(ia().has("Lisa")).toBe(true);
    });

    it("should check existence of value for given field.", () => {
      expect(ia().has(1, { key: "id" })).toBe(true);
    });
  });

  describe("push()", () => {
    it("should add given values.", () => {
      const result = ia();
      result.push({ name: "Mia", id: 9 }, { name: "Mia", id: 10 });
      expect([...result]).toEqual([...getData(), { name: "Mia", id: 9 }, { name: "Mia", id: 10 }]);
      expect(result.getAllIndexes("Mia")).toEqual([3, 4]);
    });

    it("should add given value even with a missing indexed fields.", () => {
      const result = ia();
      result.push({ name: "Mia" });
      expect(result.getIndex(undefined, { key: "id" })).toBe(3);
    });
  });

  describe("pop()", () => {
    it("should remove last value.", () => {
      const result = ia();
      result.pop();
      expect([...result]).toEqual([{ id: 1, name: "George" }, { id: 2, name: "Lisa" }]);
      expect(result.getAllIndexes("George")).toEqual([0]);
    });

    it("should remove last value for self Indexable Array.", () => {
      const result = selfIa();
      result.pop();
      expect([...result]).toEqual([{ id: 1, name: "George" }, { id: 2, name: "Lisa" }]);
      expect(result.getIndex(result[1])).toEqual(1);
    });

    it("should return index of self indexed data for default value", () => {
      const result = selfIa();
      expect(result.getIndex(result[0])).toBe(0);
    });
  });

  describe("shift()", () => {
    it("should remove first value.", () => {
      const result = ia();
      result.shift();
      expect([...result]).toEqual([{ id: 2, name: "Lisa" }, { id: 3, name: "George" }]);
      expect(result.getAllIndexes("George")).toEqual([1]);
    });
  });

  describe("unshift()", () => {
    it("should add first value.", () => {
      const result = ia();
      result.unshift({ id: 9, name: "Mia" }, { id: 10, name: "Mia" });
      expect([...result]).toEqual([
        { id: 9, name: "Mia" },
        { id: 10, name: "Mia" },
        { id: 1, name: "George" },
        { id: 2, name: "Lisa" },
        { id: 3, name: "George" },
      ]);
      expect(result.getAllIndexes("George")).toEqual([2, 4]);
    });
  });

  describe("length", () => {
    it("should handle increase.", () => {
      const result = ia();
      result.length = 4;
      expect([...result]).toEqual([{ id: 1, name: "George" }, { id: 2, name: "Lisa" }, { id: 3, name: "George" }, undefined]);
      expect(result.getAllIndexes("George")).toEqual([0, 2]);
    });

    it("should handle decrease.", () => {
      const result = ia();
      result.length = 2;
      expect([...result]).toEqual([{ id: 1, name: "George" }, { id: 2, name: "Lisa" }]);
      expect(result.getAllIndexes("George")).toEqual([0]);
    });
  });

  describe("splice()", () => {
    it("should remove elements.", () => {
      const result = ia();
      result.splice(0, 1);
      expect([...result]).toEqual([{ id: 2, name: "Lisa" }, { id: 3, name: "George" }]);
      expect(result.getAllIndexes("George")).toEqual([1]);
    });

    it("should add elements.", () => {
      const result = ia();
      result.splice(1, 0, { id: 9, name: "Mia" }, { id: 10, name: "Mia" }, { id: 11, name: "George" });
      expect([...result]).toEqual([
        { id: 1, name: "George" },
        { id: 9, name: "Mia" },
        { id: 10, name: "Mia" },
        { id: 11, name: "George" },
        { id: 2, name: "Lisa" },
        { id: 3, name: "George" },
      ]);
      expect(result.getAllIndexes("George")).toEqual([0, 3, 5]);
    });

    it("should remove and add elements.", () => {
      const result = ia();
      result.splice(1, 1, { id: 9, name: "Mia" }, { id: 10, name: "Mia" }, { id: 11, name: "George" });
      expect([...result]).toEqual([
        { id: 1, name: "George" },
        { id: 9, name: "Mia" },
        { id: 10, name: "Mia" },
        { id: 11, name: "George" },
        { id: 3, name: "George" },
      ]);
      expect(result.getAllIndexes("George")).toEqual([0, 3, 4]);
    });

    it("should disable and recreate index if operations coverage are above threshold", () => {
      const result = ia();
      result.splice(0);
      expect([...result]).toEqual([]);
      expect(result.getAllIndexes("George")).toEqual([]);
    });

    it("should not disable index if operations coverage are below threshold", () => {
      const result = new IndexableArray(
        { id: 1, name: "Mia" },
        { id: 2, name: "Mia" },
        { id: 3, name: "George" },
        { id: 4, name: "Mia" },
        { id: 5, name: "Sam" },
        { id: 6, name: "Mia" }
      ).addIndex("name");
      result.splice(5, 1);

      expect([...result]).toEqual([
        { id: 1, name: "Mia" },
        { id: 2, name: "Mia" },
        { id: 3, name: "George" },
        { id: 4, name: "Mia" },
        { id: 5, name: "Sam" },
      ]);

      expect(result.getAllIndexes("Mia")).toEqual([0, 1, 3]);
    });
  });

  describe("reverse()", () => {
    it("should reverse array.", () => {
      const result = ia();
      result.push({ id: 9, name: "Mia" });
      result.reverse();
      expect([...result]).toEqual([{ id: 9, name: "Mia" }, { id: 3, name: "George" }, { id: 2, name: "Lisa" }, { id: 1, name: "George" }]);
      expect(result.getAllIndexes("George")).toEqual([1, 3]);
    });
  });
});

describe("delete", () => {
  it("should delete element.", () => {
    const result = ia();
    delete result[1];
    expect([...result]).toEqual([{ id: 1, name: "George" }, undefined, { id: 3, name: "George" }]);
    expect(result.getAllIndexes("George")).toEqual([0, 2]);
  });
});

describe("copyWithin()", () => {
  it("should copy elements.", () => {
    const result = ia();
    result.copyWithin(0, 1, 2);
    expect([...result]).toEqual([{ id: 2, name: "Lisa" }, { id: 2, name: "Lisa" }, { id: 3, name: "George" }]);
    expect(result.getAllIndexes("Lisa")).toEqual([0, 1]);
    expect(result.getAllIndexes("George")).toEqual([2]);
  });
});

describe("fill()", () => {
  it("should fill elements.", () => {
    const result = ia();
    result.fill({ id: 9, name: "Mia" }, 1, 3);
    expect([...result]).toEqual([{ id: 1, name: "George" }, { id: 9, name: "Mia" }, { id: 9, name: "Mia" }]);
    expect(result.getAllIndexes("Mia")).toEqual([1, 2]);
    expect(result.getAllIndexes("George")).toEqual([0]);
  });
});

describe("assignment()", () => {
  it("should cahnge value of assigned item.", () => {
    const result = ia();
    result[0] = { id: 9, name: "Mia" };
    expect([...result]).toEqual([{ id: 9, name: "Mia" }, { id: 2, name: "Lisa" }, { id: 3, name: "George" }]);
    expect(result.getAllIndexes("Mia")).toEqual([0]);
    expect(result.getAllIndexes("George")).toEqual([2]);
  });

  it("should add value of non-existing item.", () => {
    const result = ia();
    result[5] = { id: 9, name: "Mia" };
    expect([...result]).toEqual([
      { id: 1, name: "George" },
      { id: 2, name: "Lisa" },
      { id: 3, name: "George" },
      undefined,
      undefined,
      { id: 9, name: "Mia" },
    ]);
    expect(result.getAllIndexes("Mia")).toEqual([5]);
    expect(result.getAllIndexes("George")).toEqual([0, 2]);
  });
});