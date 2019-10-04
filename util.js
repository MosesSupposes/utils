/**
 * ======================================================
 * Title: ---- General Purpose Helpers/Utilities ----
 * Author: ---- Moses Samuel ----
  ========================================================*/ 
  

export const curry = (fn, seen = []) => (...args) =>
  fn.length === args.length + seen.length
    ? fn(...seen, ...args)
    : curry(fn, [...seen, ...args])


// This function strictly accepts one argument at a time.
export const curryStrict (fn, arity = fn.length) {
    return (function nextCurried(prevArgs) {
    	return function curried(nextArg) {
	    var args = prevArgs.concat([nextArg])
	    if (args.length >= arity) {
	        return fn(...args)
	    } else {
	        return nextCurried(args)
	    }
	}
    })([])
}

export const pluck = field => o => o[field]        
        
export const map = curry((fn, value) => value.map(fn))

export const filter = curry((fn, value) => value.filter(fn))

export const reduce = curry((reducerFn, initialValue, arr) => {
    var accumulator = (initialValue === undefined) ? undefined : initialValue
    for (let i = 0;i < arr.length; i++) {
        if (accumulator !== undefined) 
            accumulator = reducerFn(accumulator, arr[i], i, arr)
        else 
            accumulator = arr[i]
    }
    return accumulator
})

export const pipe = (...fns) => i => fns.reduce((acc, fn) => fn(acc), i)

export const compose = (...fns) => i => fns.reduceRight((acc, fn) => fn(acc), i)

export const foldr = curry(
  (reducerFn, initialValue, arr) =>  reduce(arr.reverse(), reducerFn, initialValue)
)

export const reduceObj = curry(
    (reducerFn, initialValue, o) => Object.values(o).reduce(reducerFn, initialValue)
)

export const filterObj = curry(function agnosticFilter(predicateFn, o) {
    const newObj = {}
    
	Object.keys(o)
	.filter(key => predicateFn(o[key]))
    .forEach(key => newObj[key] = o[key])
    
	return newObj
})

export const objectFromEntries = (arr) => Object.assign({}, ...arr.map(([k, v]) => ({ [k]: v }) ))

export const binary = fn => curry((arg1,arg2) => fn(arg1,arg2))

export const unary = fn => arg1 => fn(arg1)

/* This function is useful for async functions 
   Usage: 
       const getAllEntries = async (req, res) => await withCatch(Db.find())
       const [err, data] = getAllEntries()
   This prevents the awaited promise from silently exiting your function if the promise rejects.
*/
export const withCatch = promise => 
    promise
        .then(data => [null, data])
        .catch(err => [err])


/**
 * Showing off
 */

export const map9000 = (fn, [head, ...tail]) => (
    head === undefined && tail.length < 1
      ? []
      : [fn(head), ...map9000(fn, tail)]
)

export const compose9000 = (...fns) => (...args) => fns.reduceRight((res, fn) => [fn.call(null, ...res)], args)[0]

export const filter9000 = (pred, [head, ...tail]) => head === undefined ? [] : (
    pred(head) ?
      [head, ...filter9000(pred, tail)] : [...filter9000(pred, tail)]
)
