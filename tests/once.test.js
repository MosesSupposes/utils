import { once } from "../index";

it("returns a function", () => {
	expect(typeof once(() => true)).toBe("function");
});

it("runs a function once", () => {
	const add = x => y => x + y;
	const increment = add(1);
	const incrementOnce = once(increment);

	let num = 0;

	num = incrementOnce(num);
	num = incrementOnce(num);
	num = incrementOnce(num);
	num = incrementOnce(num);

	expect(num).toBe(1);
});
