import { without } from "../index";

it("returns an object", () => {
	expect(typeof without("foo", { foo: "bar" })).toBe("object");
});

it("is curryable", () => {
	expect(typeof without("foo")).toBe("function");
});

it("filters out the specified property from the object", () => {
	expect(Object.keys(without("a", { a: 1, b: 2, c: 3 }))).not.toContain("a");
});

it("can accept an array of keys to filter out", () => {
	const actual = without(["a", "b"], { a: 1, b: 2, c: 3 });
	const expected = { c: 3 };
	expect(actual).toEqual(expected);
});

it("doesn't mutate the original object", () => {
	const original = { a: 1, b: 2, c: 3 };
	without("a", original);
	expect(original).toEqual({ a: 1, b: 2, c: 3 });
});
