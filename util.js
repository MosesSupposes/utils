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
export const curryStrict = (fn, arity = fn.length) => {
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

export const pipe = (...fns) => initialValue => fns.reduce((acc, fn) => fn(acc), initialValue)

// This utility (and its counterpart, composePromises), make it so that you can compose functions that can accept either promises 
// or non-promise values as inputs without having to be promise-aware. Instead of writing conditional logic to handle 
// various inputs (promises vs. other data-types) and then conditionally returning a promise, or defaulting to doing the 
// ceremony of `Promise.resolve(arg).then(// function logic)` inside of all the functions in your pipeline -- which unnecessarily
// complicates your code -- you could instead put your regular, promise-agnostic functions in the pipeline
// and they'll compose hassle-free. Because this utility returns a promise as its final value, you could also chain a 
// `.catch()` or a `.finally()` onto the end of it (like so: `pipePromises(fn1, fn2, fn3).catch(fn4)` ).
export const pipePromises = (...fns) => initialValue => fns.reduce((acc, fn) => Promise.resolve(acc).then(fn), initialValue)

export const compose = (...fns) => initialValue => fns.reduceRight((acc, fn) => fn(acc), initialValue)

// This function is useful for composing promise-agnostic functions with inputs that could potentially contain a promise.
// (See `pipePromises` for a more detailed explanation.)
export const composePromises = (...fns) => initialValue => fns.reduceRight((acc, fn) => Promise.resolve(acc).then(fn), initialValue)

export const foldr = curry(
  (reducerFn, initialValue, arr) =>  reduce(arr.reverse(), reducerFn, initialValue)
)

export const reduceObj = curry(
    (reducerFn, initialValue, obj) => Object.entries(obj).reduce(reducerFn, initialValue)
)

export const filterObj = curry((predicateFn, obj) => {
    const newObj = {}
    
	Object.entries(obj)
	.filter( ([key, value]) => predicateFn(key, value) )
	.forEach( ([key,value]) => newObj[key] = value)
    
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
export const withCatch = promise => {
    return promise
        .then(data => [null, data])
        .catch(err => [err])
}

/*
    This function is useful for validating whether required fields exist on an object.
    You pass it an array of strings and/or arrays of strings (each sub-array representing nested fields)
    
    Usage: 
        const request = {
            body: {
                token: 'fjdlkfjaklhfewiofiweohi.fdsiohfoiwe.jfdsafjoew',
                user: {
                    username: 'moses',
                    password: 'password',
                    role: 'admin'
                }
            }
        }
​
validateFields(['token', ['user', 'role']], request.body) // returns true
 */
function validateFields(fields, obj) {
    return fields.every(field => {
        return field instanceof Array 
            ?  eval('obj.' + field.join('.') + ' !== undefined')
            : eval ('obj.' + field + ' !== undefined')
    })
}

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
