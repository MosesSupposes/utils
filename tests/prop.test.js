import { prop } from "../index";

it("is curryable", () => {
	expect(typeof prop("a")).toBe("function");
});

it("returns the specified field from an object", () => {
	const testObj = { a: 1, b: 2, c: 3 };

	expect(prop("a", testObj)).toBe(1);
	expect(prop("b", testObj)).toBe(2);
	expect(prop("c", testObj)).toBe(3);
});

it("doesn't mutate the original object", () => {
	const testObj = { a: 1, b: 2, c: 3 };

	prop("a", testObj);
	prop("b", testObj);
	prop("c", testObj);

	expect(testObj).toEqual({ a: 1, b: 2, c: 3 });
});
