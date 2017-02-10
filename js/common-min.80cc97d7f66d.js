if (typeof window.gettext === "undefined") {
	window.gettext = function (msgid) {
		return msgid
	}
}
if (typeof window.ngettext === "undefined") {
	window.ngettext = function (singular, plural, count) {
		return count === 1 ? singular : plural
	}
}
if (typeof window.interpolate === "undefined") {
	window.interpolate = function (fmt, obj, named) {
		if (named) {
			return fmt.replace(/%\(\w+\)s/g, function (match) {
				return String(obj[match.slice(2, -2)])
			})
		} else {
			return fmt.replace(/%s/g, function (match) {
				return String(obj.shift())
			})
		}
	}
}
(function () {
	var root = this;
	var previousUnderscore = root._;
	var ArrayProto = Array.prototype,
	ObjProto = Object.prototype,
	FuncProto = Function.prototype;
	var push = ArrayProto.push,
	slice = ArrayProto.slice,
	toString = ObjProto.toString,
	hasOwnProperty = ObjProto.hasOwnProperty;
	var nativeIsArray = Array.isArray,
	nativeKeys = Object.keys,
	nativeBind = FuncProto.bind,
	nativeCreate = Object.create;
	var Ctor = function () {};
	var _ = function (obj) {
		if (obj instanceof _)
			return obj;
		if (!(this instanceof _))
			return new _(obj);
		this._wrapped = obj
	};
	if (typeof exports !== "undefined") {
		if (typeof module !== "undefined" && module.exports) {
			exports = module.exports = _
		}
		exports._ = _
	} else {
		root._ = _
	}
	_.VERSION = "1.8.2";
	var optimizeCb = function (func, context, argCount) {
		if (context === void 0)
			return func;
		switch (argCount == null ? 3 : argCount) {
		case 1:
			return function (value) {
				return func.call(context, value)
			};
		case 2:
			return function (value, other) {
				return func.call(context, value, other)
			};
		case 3:
			return function (value, index, collection) {
				return func.call(context, value, index, collection)
			};
		case 4:
			return function (accumulator, value, index, collection) {
				return func.call(context, accumulator, value, index, collection)
			}
		}
		return function () {
			return func.apply(context, arguments)
		}
	};
	var cb = function (value, context, argCount) {
		if (value == null)
			return _.identity;
		if (_.isFunction(value))
			return optimizeCb(value, context, argCount);
		if (_.isObject(value))
			return _.matcher(value);
		return _.property(value)
	};
	_.iteratee = function (value, context) {
		return cb(value, context, Infinity)
	};
	var createAssigner = function (keysFunc, undefinedOnly) {
		return function (obj) {
			var length = arguments.length;
			if (length < 2 || obj == null)
				return obj;
			for (var index = 1; index < length; index++) {
				var source = arguments[index],
				keys = keysFunc(source),
				l = keys.length;
				for (var i = 0; i < l; i++) {
					var key = keys[i];
					if (!undefinedOnly || obj[key] === void 0)
						obj[key] = source[key]
				}
			}
			return obj
		}
	};
	var baseCreate = function (prototype) {
		if (!_.isObject(prototype))
			return {};
		if (nativeCreate)
			return nativeCreate(prototype);
		Ctor.prototype = prototype;
		var result = new Ctor;
		Ctor.prototype = null;
		return result
	};
	var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
	var isArrayLike = function (collection) {
		var length = collection && collection.length;
		return typeof length == "number" && length >= 0 && length <= MAX_ARRAY_INDEX
	};
	_.each = _.forEach = function (obj, iteratee, context) {
		iteratee = optimizeCb(iteratee, context);
		var i,
		length;
		if (isArrayLike(obj)) {
			for (i = 0, length = obj.length; i < length; i++) {
				iteratee(obj[i], i, obj)
			}
		} else {
			var keys = _.keys(obj);
			for (i = 0, length = keys.length; i < length; i++) {
				iteratee(obj[keys[i]], keys[i], obj)
			}
		}
		return obj
	};
	_.map = _.collect = function (obj, iteratee, context) {
		iteratee = cb(iteratee, context);
		var keys = !isArrayLike(obj) && _.keys(obj),
		length = (keys || obj).length,
		results = Array(length);
		for (var index = 0; index < length; index++) {
			var currentKey = keys ? keys[index] : index;
			results[index] = iteratee(obj[currentKey], currentKey, obj)
		}
		return results
	};
	function createReduce(dir) {
		function iterator(obj, iteratee, memo, keys, index, length) {
			for (; index >= 0 && index < length; index += dir) {
				var currentKey = keys ? keys[index] : index;
				memo = iteratee(memo, obj[currentKey], currentKey, obj)
			}
			return memo
		}
		return function (obj, iteratee, memo, context) {
			iteratee = optimizeCb(iteratee, context, 4);
			var keys = !isArrayLike(obj) && _.keys(obj),
			length = (keys || obj).length,
			index = dir > 0 ? 0 : length - 1;
			if (arguments.length < 3) {
				memo = obj[keys ? keys[index] : index];
				index += dir
			}
			return iterator(obj, iteratee, memo, keys, index, length)
		}
	}
	_.reduce = _.foldl = _.inject = createReduce(1);
	_.reduceRight = _.foldr = createReduce(-1);
	_.find = _.detect = function (obj, predicate, context) {
		var key;
		if (isArrayLike(obj)) {
			key = _.findIndex(obj, predicate, context)
		} else {
			key = _.findKey(obj, predicate, context)
		}
		if (key !== void 0 && key !== -1)
			return obj[key]
	};
	_.filter = _.select = function (obj, predicate, context) {
		var results = [];
		predicate = cb(predicate, context);
		_.each(obj, function (value, index, list) {
			if (predicate(value, index, list))
				results.push(value)
		});
		return results
	};
	_.reject = function (obj, predicate, context) {
		return _.filter(obj, _.negate(cb(predicate)), context)
	};
	_.every = _.all = function (obj, predicate, context) {
		predicate = cb(predicate, context);
		var keys = !isArrayLike(obj) && _.keys(obj),
		length = (keys || obj).length;
		for (var index = 0; index < length; index++) {
			var currentKey = keys ? keys[index] : index;
			if (!predicate(obj[currentKey], currentKey, obj))
				return false
		}
		return true
	};
	_.some = _.any = function (obj, predicate, context) {
		predicate = cb(predicate, context);
		var keys = !isArrayLike(obj) && _.keys(obj),
		length = (keys || obj).length;
		for (var index = 0; index < length; index++) {
			var currentKey = keys ? keys[index] : index;
			if (predicate(obj[currentKey], currentKey, obj))
				return true
		}
		return false
	};
	_.contains = _.includes = _.include = function (obj, target, fromIndex) {
		if (!isArrayLike(obj))
			obj = _.values(obj);
		return _.indexOf(obj, target, typeof fromIndex == "number" && fromIndex) >= 0
	};
	_.invoke = function (obj, method) {
		var args = slice.call(arguments, 2);
		var isFunc = _.isFunction(method);
		return _.map(obj, function (value) {
			var func = isFunc ? method : value[method];
			return func == null ? func : func.apply(value, args)
		})
	};
	_.pluck = function (obj, key) {
		return _.map(obj, _.property(key))
	};
	_.where = function (obj, attrs) {
		return _.filter(obj, _.matcher(attrs))
	};
	_.findWhere = function (obj, attrs) {
		return _.find(obj, _.matcher(attrs))
	};
	_.max = function (obj, iteratee, context) {
		var result = -Infinity,
		lastComputed = -Infinity,
		value,
		computed;
		if (iteratee == null && obj != null) {
			obj = isArrayLike(obj) ? obj : _.values(obj);
			for (var i = 0, length = obj.length; i < length; i++) {
				value = obj[i];
				if (value > result) {
					result = value
				}
			}
		} else {
			iteratee = cb(iteratee, context);
			_.each(obj, function (value, index, list) {
				computed = iteratee(value, index, list);
				if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
					result = value;
					lastComputed = computed
				}
			})
		}
		return result
	};
	_.min = function (obj, iteratee, context) {
		var result = Infinity,
		lastComputed = Infinity,
		value,
		computed;
		if (iteratee == null && obj != null) {
			obj = isArrayLike(obj) ? obj : _.values(obj);
			for (var i = 0, length = obj.length; i < length; i++) {
				value = obj[i];
				if (value < result) {
					result = value
				}
			}
		} else {
			iteratee = cb(iteratee, context);
			_.each(obj, function (value, index, list) {
				computed = iteratee(value, index, list);
				if (computed < lastComputed || computed === Infinity && result === Infinity) {
					result = value;
					lastComputed = computed
				}
			})
		}
		return result
	};
	_.shuffle = function (obj) {
		var set = isArrayLike(obj) ? obj : _.values(obj);
		var length = set.length;
		var shuffled = Array(length);
		for (var index = 0, rand; index < length; index++) {
			rand = _.random(0, index);
			if (rand !== index)
				shuffled[index] = shuffled[rand];
			shuffled[rand] = set[index]
		}
		return shuffled
	};
	_.sample = function (obj, n, guard) {
		if (n == null || guard) {
			if (!isArrayLike(obj))
				obj = _.values(obj);
			return obj[_.random(obj.length - 1)]
		}
		return _.shuffle(obj).slice(0, Math.max(0, n))
	};
	_.sortBy = function (obj, iteratee, context) {
		iteratee = cb(iteratee, context);
		return _.pluck(_.map(obj, function (value, index, list) {
				return {
					value : value,
					index : index,
					criteria : iteratee(value, index, list)
				}
			}).sort(function (left, right) {
				var a = left.criteria;
				var b = right.criteria;
				if (a !== b) {
					if (a > b || a === void 0)
						return 1;
					if (a < b || b === void 0)
						return -1
				}
				return left.index - right.index
			}), "value")
	};
	var group = function (behavior) {
		return function (obj, iteratee, context) {
			var result = {};
			iteratee = cb(iteratee, context);
			_.each(obj, function (value, index) {
				var key = iteratee(value, index, obj);
				behavior(result, value, key)
			});
			return result
		}
	};
	_.groupBy = group(function (result, value, key) {
			if (_.has(result, key))
				result[key].push(value);
			else
				result[key] = [value]
		});
	_.indexBy = group(function (result, value, key) {
			result[key] = value
		});
	_.countBy = group(function (result, value, key) {
			if (_.has(result, key))
				result[key]++;
			else
				result[key] = 1
		});
	_.toArray = function (obj) {
		if (!obj)
			return [];
		if (_.isArray(obj))
			return slice.call(obj);
		if (isArrayLike(obj))
			return _.map(obj, _.identity);
		return _.values(obj)
	};
	_.size = function (obj) {
		if (obj == null)
			return 0;
		return isArrayLike(obj) ? obj.length : _.keys(obj).length
	};
	_.partition = function (obj, predicate, context) {
		predicate = cb(predicate, context);
		var pass = [],
		fail = [];
		_.each(obj, function (value, key, obj) {
			(predicate(value, key, obj) ? pass : fail).push(value)
		});
		return [pass, fail]
	};
	_.first = _.head = _.take = function (array, n, guard) {
		if (array == null)
			return void 0;
		if (n == null || guard)
			return array[0];
		return _.initial(array, array.length - n)
	};
	_.initial = function (array, n, guard) {
		return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)))
	};
	_.last = function (array, n, guard) {
		if (array == null)
			return void 0;
		if (n == null || guard)
			return array[array.length - 1];
		return _.rest(array, Math.max(0, array.length - n))
	};
	_.rest = _.tail = _.drop = function (array, n, guard) {
		return slice.call(array, n == null || guard ? 1 : n)
	};
	_.compact = function (array) {
		return _.filter(array, _.identity)
	};
	var flatten = function (input, shallow, strict, startIndex) {
		var output = [],
		idx = 0;
		for (var i = startIndex || 0, length = input && input.length; i < length; i++) {
			var value = input[i];
			if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
				if (!shallow)
					value = flatten(value, shallow, strict);
				var j = 0,
				len = value.length;
				output.length += len;
				while (j < len) {
					output[idx++] = value[j++]
				}
			} else if (!strict) {
				output[idx++] = value
			}
		}
		return output
	};
	_.flatten = function (array, shallow) {
		return flatten(array, shallow, false)
	};
	_.without = function (array) {
		return _.difference(array, slice.call(arguments, 1))
	};
	_.uniq = _.unique = function (array, isSorted, iteratee, context) {
		if (array == null)
			return [];
		if (!_.isBoolean(isSorted)) {
			context = iteratee;
			iteratee = isSorted;
			isSorted = false
		}
		if (iteratee != null)
			iteratee = cb(iteratee, context);
		var result = [];
		var seen = [];
		for (var i = 0, length = array.length; i < length; i++) {
			var value = array[i],
			computed = iteratee ? iteratee(value, i, array) : value;
			if (isSorted) {
				if (!i || seen !== computed)
					result.push(value);
				seen = computed
			} else if (iteratee) {
				if (!_.contains(seen, computed)) {
					seen.push(computed);
					result.push(value)
				}
			} else if (!_.contains(result, value)) {
				result.push(value)
			}
		}
		return result
	};
	_.union = function () {
		return _.uniq(flatten(arguments, true, true))
	};
	_.intersection = function (array) {
		if (array == null)
			return [];
		var result = [];
		var argsLength = arguments.length;
		for (var i = 0, length = array.length; i < length; i++) {
			var item = array[i];
			if (_.contains(result, item))
				continue;
			for (var j = 1; j < argsLength; j++) {
				if (!_.contains(arguments[j], item))
					break
			}
			if (j === argsLength)
				result.push(item)
		}
		return result
	};
	_.difference = function (array) {
		var rest = flatten(arguments, true, true, 1);
		return _.filter(array, function (value) {
			return !_.contains(rest, value)
		})
	};
	_.zip = function () {
		return _.unzip(arguments)
	};
	_.unzip = function (array) {
		var length = array && _.max(array, "length").length || 0;
		var result = Array(length);
		for (var index = 0; index < length; index++) {
			result[index] = _.pluck(array, index)
		}
		return result
	};
	_.object = function (list, values) {
		var result = {};
		for (var i = 0, length = list && list.length; i < length; i++) {
			if (values) {
				result[list[i]] = values[i]
			} else {
				result[list[i][0]] = list[i][1]
			}
		}
		return result
	};
	_.indexOf = function (array, item, isSorted) {
		var i = 0,
		length = array && array.length;
		if (typeof isSorted == "number") {
			i = isSorted < 0 ? Math.max(0, length + isSorted) : isSorted
		} else if (isSorted && length) {
			i = _.sortedIndex(array, item);
			return array[i] === item ? i : -1
		}
		if (item !== item) {
			return _.findIndex(slice.call(array, i), _.isNaN)
		}
		for (; i < length; i++)
			if (array[i] === item)
				return i;
		return -1
	};
	_.lastIndexOf = function (array, item, from) {
		var idx = array ? array.length : 0;
		if (typeof from == "number") {
			idx = from < 0 ? idx + from + 1 : Math.min(idx, from + 1)
		}
		if (item !== item) {
			return _.findLastIndex(slice.call(array, 0, idx), _.isNaN)
		}
		while (--idx >= 0)
			if (array[idx] === item)
				return idx;
		return -1
	};
	function createIndexFinder(dir) {
		return function (array, predicate, context) {
			predicate = cb(predicate, context);
			var length = array != null && array.length;
			var index = dir > 0 ? 0 : length - 1;
			for (; index >= 0 && index < length; index += dir) {
				if (predicate(array[index], index, array))
					return index
			}
			return -1
		}
	}
	_.findIndex = createIndexFinder(1);
	_.findLastIndex = createIndexFinder(-1);
	_.sortedIndex = function (array, obj, iteratee, context) {
		iteratee = cb(iteratee, context, 1);
		var value = iteratee(obj);
		var low = 0,
		high = array.length;
		while (low < high) {
			var mid = Math.floor((low + high) / 2);
			if (iteratee(array[mid]) < value)
				low = mid + 1;
			else
				high = mid
		}
		return low
	};
	_.range = function (start, stop, step) {
		if (arguments.length <= 1) {
			stop = start || 0;
			start = 0
		}
		step = step || 1;
		var length = Math.max(Math.ceil((stop - start) / step), 0);
		var range = Array(length);
		for (var idx = 0; idx < length; idx++, start += step) {
			range[idx] = start
		}
		return range
	};
	var executeBound = function (sourceFunc, boundFunc, context, callingContext, args) {
		if (!(callingContext instanceof boundFunc))
			return sourceFunc.apply(context, args);
		var self = baseCreate(sourceFunc.prototype);
		var result = sourceFunc.apply(self, args);
		if (_.isObject(result))
			return result;
		return self
	};
	_.bind = function (func, context) {
		if (nativeBind && func.bind === nativeBind)
			return nativeBind.apply(func, slice.call(arguments, 1));
		if (!_.isFunction(func))
			throw new TypeError("Bind must be called on a function");
		var args = slice.call(arguments, 2);
		var bound = function () {
			return executeBound(func, bound, context, this, args.concat(slice.call(arguments)))
		};
		return bound
	};
	_.partial = function (func) {
		var boundArgs = slice.call(arguments, 1);
		var bound = function () {
			var position = 0,
			length = boundArgs.length;
			var args = Array(length);
			for (var i = 0; i < length; i++) {
				args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i]
			}
			while (position < arguments.length)
				args.push(arguments[position++]);
			return executeBound(func, bound, this, this, args)
		};
		return bound
	};
	_.bindAll = function (obj) {
		var i,
		length = arguments.length,
		key;
		if (length <= 1)
			throw new Error("bindAll must be passed function names");
		for (i = 1; i < length; i++) {
			key = arguments[i];
			obj[key] = _.bind(obj[key], obj)
		}
		return obj
	};
	_.memoize = function (func, hasher) {
		var memoize = function (key) {
			var cache = memoize.cache;
			var address = "" + (hasher ? hasher.apply(this, arguments) : key);
			if (!_.has(cache, address))
				cache[address] = func.apply(this, arguments);
			return cache[address]
		};
		memoize.cache = {};
		return memoize
	};
	_.delay = function (func, wait) {
		var args = slice.call(arguments, 2);
		return setTimeout(function () {
			return func.apply(null, args)
		}, wait)
	};
	_.defer = _.partial(_.delay, _, 1);
	_.throttle = function (func, wait, options) {
		var context,
		args,
		result;
		var timeout = null;
		var previous = 0;
		if (!options)
			options = {};
		var later = function () {
			previous = options.leading === false ? 0 : _.now();
			timeout = null;
			result = func.apply(context, args);
			if (!timeout)
				context = args = null
		};
		return function () {
			var now = _.now();
			if (!previous && options.leading === false)
				previous = now;
			var remaining = wait - (now - previous);
			context = this;
			args = arguments;
			if (remaining <= 0 || remaining > wait) {
				if (timeout) {
					clearTimeout(timeout);
					timeout = null
				}
				previous = now;
				result = func.apply(context, args);
				if (!timeout)
					context = args = null
			} else if (!timeout && options.trailing !== false) {
				timeout = setTimeout(later, remaining)
			}
			return result
		}
	};
	_.debounce = function (func, wait, immediate) {
		var timeout,
		args,
		context,
		timestamp,
		result;
		var later = function () {
			var last = _.now() - timestamp;
			if (last < wait && last >= 0) {
				timeout = setTimeout(later, wait - last)
			} else {
				timeout = null;
				if (!immediate) {
					result = func.apply(context, args);
					if (!timeout)
						context = args = null
				}
			}
		};
		return function () {
			context = this;
			args = arguments;
			timestamp = _.now();
			var callNow = immediate && !timeout;
			if (!timeout)
				timeout = setTimeout(later, wait);
			if (callNow) {
				result = func.apply(context, args);
				context = args = null
			}
			return result
		}
	};
	_.wrap = function (func, wrapper) {
		return _.partial(wrapper, func)
	};
	_.negate = function (predicate) {
		return function () {
			return !predicate.apply(this, arguments)
		}
	};
	_.compose = function () {
		var args = arguments;
		var start = args.length - 1;
		return function () {
			var i = start;
			var result = args[start].apply(this, arguments);
			while (i--)
				result = args[i].call(this, result);
			return result
		}
	};
	_.after = function (times, func) {
		return function () {
			if (--times < 1) {
				return func.apply(this, arguments)
			}
		}
	};
	_.before = function (times, func) {
		var memo;
		return function () {
			if (--times > 0) {
				memo = func.apply(this, arguments)
			}
			if (times <= 1)
				func = null;
			return memo
		}
	};
	_.once = _.partial(_.before, 2);
	var hasEnumBug = !{
		toString : null
	}
	.propertyIsEnumerable("toString");
	var nonEnumerableProps = ["valueOf", "isPrototypeOf", "toString", "propertyIsEnumerable", "hasOwnProperty", "toLocaleString"];
	function collectNonEnumProps(obj, keys) {
		var nonEnumIdx = nonEnumerableProps.length;
		var constructor = obj.constructor;
		var proto = _.isFunction(constructor) && constructor.prototype || ObjProto;
		var prop = "constructor";
		if (_.has(obj, prop) && !_.contains(keys, prop))
			keys.push(prop);
		while (nonEnumIdx--) {
			prop = nonEnumerableProps[nonEnumIdx];
			if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
				keys.push(prop)
			}
		}
	}
	_.keys = function (obj) {
		if (!_.isObject(obj))
			return [];
		if (nativeKeys)
			return nativeKeys(obj);
		var keys = [];
		for (var key in obj)
			if (_.has(obj, key))
				keys.push(key);
		if (hasEnumBug)
			collectNonEnumProps(obj, keys);
		return keys
	};
	_.allKeys = function (obj) {
		if (!_.isObject(obj))
			return [];
		var keys = [];
		for (var key in obj)
			keys.push(key);
		if (hasEnumBug)
			collectNonEnumProps(obj, keys);
		return keys
	};
	_.values = function (obj) {
		var keys = _.keys(obj);
		var length = keys.length;
		var values = Array(length);
		for (var i = 0; i < length; i++) {
			values[i] = obj[keys[i]]
		}
		return values
	};
	_.mapObject = function (obj, iteratee, context) {
		iteratee = cb(iteratee, context);
		var keys = _.keys(obj),
		length = keys.length,
		results = {},
		currentKey;
		for (var index = 0; index < length; index++) {
			currentKey = keys[index];
			results[currentKey] = iteratee(obj[currentKey], currentKey, obj)
		}
		return results
	};
	_.pairs = function (obj) {
		var keys = _.keys(obj);
		var length = keys.length;
		var pairs = Array(length);
		for (var i = 0; i < length; i++) {
			pairs[i] = [keys[i], obj[keys[i]]]
		}
		return pairs
	};
	_.invert = function (obj) {
		var result = {};
		var keys = _.keys(obj);
		for (var i = 0, length = keys.length; i < length; i++) {
			result[obj[keys[i]]] = keys[i]
		}
		return result
	};
	_.functions = _.methods = function (obj) {
		var names = [];
		for (var key in obj) {
			if (_.isFunction(obj[key]))
				names.push(key)
		}
		return names.sort()
	};
	_.extend = createAssigner(_.allKeys);
	_.extendOwn = _.assign = createAssigner(_.keys);
	_.findKey = function (obj, predicate, context) {
		predicate = cb(predicate, context);
		var keys = _.keys(obj),
		key;
		for (var i = 0, length = keys.length; i < length; i++) {
			key = keys[i];
			if (predicate(obj[key], key, obj))
				return key
		}
	};
	_.pick = function (object, oiteratee, context) {
		var result = {},
		obj = object,
		iteratee,
		keys;
		if (obj == null)
			return result;
		if (_.isFunction(oiteratee)) {
			keys = _.allKeys(obj);
			iteratee = optimizeCb(oiteratee, context)
		} else {
			keys = flatten(arguments, false, false, 1);
			iteratee = function (value, key, obj) {
				return key in obj
			};
			obj = Object(obj)
		}
		for (var i = 0, length = keys.length; i < length; i++) {
			var key = keys[i];
			var value = obj[key];
			if (iteratee(value, key, obj))
				result[key] = value
		}
		return result
	};
	_.omit = function (obj, iteratee, context) {
		if (_.isFunction(iteratee)) {
			iteratee = _.negate(iteratee)
		} else {
			var keys = _.map(flatten(arguments, false, false, 1), String);
			iteratee = function (value, key) {
				return !_.contains(keys, key)
			}
		}
		return _.pick(obj, iteratee, context)
	};
	_.defaults = createAssigner(_.allKeys, true);
	_.clone = function (obj) {
		if (!_.isObject(obj))
			return obj;
		return _.isArray(obj) ? obj.slice() : _.extend({}, obj)
	};
	_.tap = function (obj, interceptor) {
		interceptor(obj);
		return obj
	};
	_.isMatch = function (object, attrs) {
		var keys = _.keys(attrs),
		length = keys.length;
		if (object == null)
			return !length;
		var obj = Object(object);
		for (var i = 0; i < length; i++) {
			var key = keys[i];
			if (attrs[key] !== obj[key] || !(key in obj))
				return false
		}
		return true
	};
	var eq = function (a, b, aStack, bStack) {
		if (a === b)
			return a !== 0 || 1 / a === 1 / b;
		if (a == null || b == null)
			return a === b;
		if (a instanceof _)
			a = a._wrapped;
		if (b instanceof _)
			b = b._wrapped;
		var className = toString.call(a);
		if (className !== toString.call(b))
			return false;
		switch (className) {
		case "[object RegExp]":
		case "[object String]":
			return "" + a === "" + b;
		case "[object Number]":
			if (+a !== +a)
				return +b !== +b;
			return +a === 0 ? 1 / +a === 1 / b : +a === +b;
		case "[object Date]":
		case "[object Boolean]":
			return +a === +b
		}
		var areArrays = className === "[object Array]";
		if (!areArrays) {
			if (typeof a != "object" || typeof b != "object")
				return false;
			var aCtor = a.constructor,
			bCtor = b.constructor;
			if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor && _.isFunction(bCtor) && bCtor instanceof bCtor) && ("constructor" in a && "constructor" in b)) {
				return false
			}
		}
		aStack = aStack || [];
		bStack = bStack || [];
		var length = aStack.length;
		while (length--) {
			if (aStack[length] === a)
				return bStack[length] === b
		}
		aStack.push(a);
		bStack.push(b);
		if (areArrays) {
			length = a.length;
			if (length !== b.length)
				return false;
			while (length--) {
				if (!eq(a[length], b[length], aStack, bStack))
					return false
			}
		} else {
			var keys = _.keys(a),
			key;
			length = keys.length;
			if (_.keys(b).length !== length)
				return false;
			while (length--) {
				key = keys[length];
				if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack)))
					return false
			}
		}
		aStack.pop();
		bStack.pop();
		return true
	};
	_.isEqual = function (a, b) {
		return eq(a, b)
	};
	_.isEmpty = function (obj) {
		if (obj == null)
			return true;
		if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj)))
			return obj.length === 0;
		return _.keys(obj).length === 0
	};
	_.isElement = function (obj) {
		return !!(obj && obj.nodeType === 1)
	};
	_.isArray = nativeIsArray || function (obj) {
		return toString.call(obj) === "[object Array]"
	};
	_.isObject = function (obj) {
		var type = typeof obj;
		return type === "function" || type === "object" && !!obj
	};
	_.each(["Arguments", "Function", "String", "Number", "Date", "RegExp", "Error"], function (name) {
		_["is" + name] = function (obj) {
			return toString.call(obj) === "[object " + name + "]"
		}
	});
	if (!_.isArguments(arguments)) {
		_.isArguments = function (obj) {
			return _.has(obj, "callee")
		}
	}
	if (typeof / . /  != "function" && typeof Int8Array != "object") {
		_.isFunction = function (obj) {
			return typeof obj == "function" || false
		}
	}
	_.isFinite = function (obj) {
		return isFinite(obj) && !isNaN(parseFloat(obj))
	};
	_.isNaN = function (obj) {
		return _.isNumber(obj) && obj !== +obj
	};
	_.isBoolean = function (obj) {
		return obj === true || obj === false || toString.call(obj) === "[object Boolean]"
	};
	_.isNull = function (obj) {
		return obj === null
	};
	_.isUndefined = function (obj) {
		return obj === void 0
	};
	_.has = function (obj, key) {
		return obj != null && hasOwnProperty.call(obj, key)
	};
	_.noConflict = function () {
		root._ = previousUnderscore;
		return this
	};
	_.identity = function (value) {
		return value
	};
	_.constant = function (value) {
		return function () {
			return value
		}
	};
	_.noop = function () {};
	_.property = function (key) {
		return function (obj) {
			return obj == null ? void 0 : obj[key]
		}
	};
	_.propertyOf = function (obj) {
		return obj == null ? function () {}
		 : function (key) {
			return obj[key]
		}
	};
	_.matcher = _.matches = function (attrs) {
		attrs = _.extendOwn({}, attrs);
		return function (obj) {
			return _.isMatch(obj, attrs)
		}
	};
	_.times = function (n, iteratee, context) {
		var accum = Array(Math.max(0, n));
		iteratee = optimizeCb(iteratee, context, 1);
		for (var i = 0; i < n; i++)
			accum[i] = iteratee(i);
		return accum
	};
	_.random = function (min, max) {
		if (max == null) {
			max = min;
			min = 0
		}
		return min + Math.floor(Math.random() * (max - min + 1))
	};
	_.now = Date.now || function () {
		return (new Date).getTime()
	};
	var escapeMap = {
		"&" : "&amp;",
		"<" : "&lt;",
		">" : "&gt;",
		'"' : "&quot;",
		"'" : "&#x27;",
		"`" : "&#x60;"
	};
	var unescapeMap = _.invert(escapeMap);
	var createEscaper = function (map) {
		var escaper = function (match) {
			return map[match]
		};
		var source = "(?:" + _.keys(map).join("|") + ")";
		var testRegexp = RegExp(source);
		var replaceRegexp = RegExp(source, "g");
		return function (string) {
			string = string == null ? "" : "" + string;
			return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string
		}
	};
	_.escape = createEscaper(escapeMap);
	_.unescape = createEscaper(unescapeMap);
	_.result = function (object, property, fallback) {
		var value = object == null ? void 0 : object[property];
		if (value === void 0) {
			value = fallback
		}
		return _.isFunction(value) ? value.call(object) : value
	};
	var idCounter = 0;
	_.uniqueId = function (prefix) {
		var id = ++idCounter + "";
		return prefix ? prefix + id : id
	};
	_.templateSettings = {
		evaluate : /<%([\s\S]+?)%>/g,
		interpolate : /<%=([\s\S]+?)%>/g,
		escape : /<%-([\s\S]+?)%>/g
	};
	var noMatch = /(.)^/;
	var escapes = {
		"'" : "'",
		"\\" : "\\",
		"\r" : "r",
		"\n" : "n",
		"\u2028" : "u2028",
		"\u2029" : "u2029"
	};
	var escaper = /\\|'|\r|\n|\u2028|\u2029/g;
	var escapeChar = function (match) {
		return "\\" + escapes[match]
	};
	_.template = function (text, settings, oldSettings) {
		if (!settings && oldSettings)
			settings = oldSettings;
		settings = _.defaults({}, settings, _.templateSettings);
		var matcher = RegExp([(settings.escape || noMatch).source, (settings.interpolate || noMatch).source, (settings.evaluate || noMatch).source].join("|") + "|$", "g");
		var index = 0;
		var source = "__p+='";
		text.replace(matcher, function (match, escape, interpolate, evaluate, offset) {
			source += text.slice(index, offset).replace(escaper, escapeChar);
			index = offset + match.length;
			if (escape) {
				source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'"
			} else if (interpolate) {
				source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'"
			} else if (evaluate) {
				source += "';\n" + evaluate + "\n__p+='"
			}
			return match
		});
		source += "';\n";
		if (!settings.variable)
			source = "with(obj||{}){\n" + source + "}\n";
		source = "var __t,__p='',__j=Array.prototype.join," + "print=function(){__p+=__j.call(arguments,'');};\n" + source + "return __p;\n";
		try {
			var render = new Function(settings.variable || "obj", "_", source)
		} catch (e) {
			e.source = source;
			throw e
		}
		var template = function (data) {
			return render.call(this, data, _)
		};
		var argument = settings.variable || "obj";
		template.source = "function(" + argument + "){\n" + source + "}";
		return template
	};
	_.chain = function (obj) {
		var instance = _(obj);
		instance._chain = true;
		return instance
	};
	var result = function (instance, obj) {
		return instance._chain ? _(obj).chain() : obj
	};
	_.mixin = function (obj) {
		_.each(_.functions(obj), function (name) {
			var func = _[name] = obj[name];
			_.prototype[name] = function () {
				var args = [this._wrapped];
				push.apply(args, arguments);
				return result(this, func.apply(_, args))
			}
		})
	};
	_.mixin(_);
	_.each(["pop", "push", "reverse", "shift", "sort", "splice", "unshift"], function (name) {
		var method = ArrayProto[name];
		_.prototype[name] = function () {
			var obj = this._wrapped;
			method.apply(obj, arguments);
			if ((name === "shift" || name === "splice") && obj.length === 0)
				delete obj[0];
			return result(this, obj)
		}
	});
	_.each(["concat", "join", "slice"], function (name) {
		var method = ArrayProto[name];
		_.prototype[name] = function () {
			return result(this, method.apply(this._wrapped, arguments))
		}
	});
	_.prototype.value = function () {
		return this._wrapped
	};
	_.prototype.valueOf = _.prototype.toJSON = _.prototype.value;
	_.prototype.toString = function () {
		return "" + this._wrapped
	};
	if (typeof define === "function" && define.amd) {
		define("underscore", [], function () {
			return _
		})
	}
}).call(this);
(function (undefined) {
	var moment,
	VERSION = "2.8.3",
	globalScope = typeof global !== "undefined" ? global : this,
	oldGlobalMoment,
	round = Math.round,
	hasOwnProperty = Object.prototype.hasOwnProperty,
	i,
	YEAR = 0,
	MONTH = 1,
	DATE = 2,
	HOUR = 3,
	MINUTE = 4,
	SECOND = 5,
	MILLISECOND = 6,
	locales = {},
	momentProperties = [],
	hasModule = typeof module !== "undefined" && module.exports,
	aspNetJsonRegex = /^\/?Date\((\-?\d+)/i,
	aspNetTimeSpanJsonRegex = /(\-)?(?:(\d*)\.)?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?)?/,
	isoDurationRegex = /^(-)?P(?:(?:([0-9,.]*)Y)?(?:([0-9,.]*)M)?(?:([0-9,.]*)D)?(?:T(?:([0-9,.]*)H)?(?:([0-9,.]*)M)?(?:([0-9,.]*)S)?)?|([0-9,.]*)W)$/,
	formattingTokens = /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Q|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|S{1,4}|X|zz?|ZZ?|.)/g,
	localFormattingTokens = /(\[[^\[]*\])|(\\)?(LT|LL?L?L?|l{1,4})/g,
	parseTokenOneOrTwoDigits = /\d\d?/,
	parseTokenOneToThreeDigits = /\d{1,3}/,
	parseTokenOneToFourDigits = /\d{1,4}/,
	parseTokenOneToSixDigits = /[+\-]?\d{1,6}/,
	parseTokenDigits = /\d+/,
	parseTokenWord = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i,
	parseTokenTimezone = /Z|[\+\-]\d\d:?\d\d/gi,
	parseTokenT = /T/i,
	parseTokenTimestampMs = /[\+\-]?\d+(\.\d{1,3})?/,
	parseTokenOrdinal = /\d{1,2}/,
	parseTokenOneDigit = /\d/,
	parseTokenTwoDigits = /\d\d/,
	parseTokenThreeDigits = /\d{3}/,
	parseTokenFourDigits = /\d{4}/,
	parseTokenSixDigits = /[+-]?\d{6}/,
	parseTokenSignedNumber = /[+-]?\d+/,
	isoRegex = /^\s*(?:[+-]\d{6}|\d{4})-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/,
	isoFormat = "YYYY-MM-DDTHH:mm:ssZ",
	isoDates = [["YYYYYY-MM-DD", /[+-]\d{6}-\d{2}-\d{2}/], ["YYYY-MM-DD", /\d{4}-\d{2}-\d{2}/], ["GGGG-[W]WW-E", /\d{4}-W\d{2}-\d/], ["GGGG-[W]WW", /\d{4}-W\d{2}/], ["YYYY-DDD", /\d{4}-\d{3}/]],
	isoTimes = [["HH:mm:ss.SSSS", /(T| )\d\d:\d\d:\d\d\.\d+/], ["HH:mm:ss", /(T| )\d\d:\d\d:\d\d/], ["HH:mm", /(T| )\d\d:\d\d/], ["HH", /(T| )\d\d/]],
	parseTimezoneChunker = /([\+\-]|\d\d)/gi,
	proxyGettersAndSetters = "Date|Hours|Minutes|Seconds|Milliseconds".split("|"),
	unitMillisecondFactors = {
		Milliseconds : 1,
		Seconds : 1e3,
		Minutes : 6e4,
		Hours : 36e5,
		Days : 864e5,
		Months : 2592e6,
		Years : 31536e6
	},
	unitAliases = {
		ms : "millisecond",
		s : "second",
		m : "minute",
		h : "hour",
		d : "day",
		D : "date",
		w : "week",
		W : "isoWeek",
		M : "month",
		Q : "quarter",
		y : "year",
		DDD : "dayOfYear",
		e : "weekday",
		E : "isoWeekday",
		gg : "weekYear",
		GG : "isoWeekYear"
	},
	camelFunctions = {
		dayofyear : "dayOfYear",
		isoweekday : "isoWeekday",
		isoweek : "isoWeek",
		weekyear : "weekYear",
		isoweekyear : "isoWeekYear"
	},
	formatFunctions = {},
	relativeTimeThresholds = {
		s : 45,
		m : 45,
		h : 22,
		d : 26,
		M : 11
	},
	ordinalizeTokens = "DDD w W M D d".split(" "),
	paddedTokens = "M D H h m s w W".split(" "),
	formatTokenFunctions = {
		M : function () {
			return this.month() + 1
		},
		MMM : function (format) {
			return this.localeData().monthsShort(this, format)
		},
		MMMM : function (format) {
			return this.localeData().months(this, format)
		},
		D : function () {
			return this.date()
		},
		DDD : function () {
			return this.dayOfYear()
		},
		d : function () {
			return this.day()
		},
		dd : function (format) {
			return this.localeData().weekdaysMin(this, format)
		},
		ddd : function (format) {
			return this.localeData().weekdaysShort(this, format)
		},
		dddd : function (format) {
			return this.localeData().weekdays(this, format)
		},
		w : function () {
			return this.week()
		},
		W : function () {
			return this.isoWeek()
		},
		YY : function () {
			return leftZeroFill(this.year() % 100, 2)
		},
		YYYY : function () {
			return leftZeroFill(this.year(), 4)
		},
		YYYYY : function () {
			return leftZeroFill(this.year(), 5)
		},
		YYYYYY : function () {
			var y = this.year(),
			sign = y >= 0 ? "+" : "-";
			return sign + leftZeroFill(Math.abs(y), 6)
		},
		gg : function () {
			return leftZeroFill(this.weekYear() % 100, 2)
		},
		gggg : function () {
			return leftZeroFill(this.weekYear(), 4)
		},
		ggggg : function () {
			return leftZeroFill(this.weekYear(), 5)
		},
		GG : function () {
			return leftZeroFill(this.isoWeekYear() % 100, 2)
		},
		GGGG : function () {
			return leftZeroFill(this.isoWeekYear(), 4)
		},
		GGGGG : function () {
			return leftZeroFill(this.isoWeekYear(), 5)
		},
		e : function () {
			return this.weekday()
		},
		E : function () {
			return this.isoWeekday()
		},
		a : function () {
			return this.localeData().meridiem(this.hours(), this.minutes(), true)
		},
		A : function () {
			return this.localeData().meridiem(this.hours(), this.minutes(), false)
		},
		H : function () {
			return this.hours()
		},
		h : function () {
			return this.hours() % 12 || 12
		},
		m : function () {
			return this.minutes()
		},
		s : function () {
			return this.seconds()
		},
		S : function () {
			return toInt(this.milliseconds() / 100)
		},
		SS : function () {
			return leftZeroFill(toInt(this.milliseconds() / 10), 2)
		},
		SSS : function () {
			return leftZeroFill(this.milliseconds(), 3)
		},
		SSSS : function () {
			return leftZeroFill(this.milliseconds(), 3)
		},
		Z : function () {
			var a = -this.zone(),
			b = "+";
			if (a < 0) {
				a = -a;
				b = "-"
			}
			return b + leftZeroFill(toInt(a / 60), 2) + ":" + leftZeroFill(toInt(a) % 60, 2)
		},
		ZZ : function () {
			var a = -this.zone(),
			b = "+";
			if (a < 0) {
				a = -a;
				b = "-"
			}
			return b + leftZeroFill(toInt(a / 60), 2) + leftZeroFill(toInt(a) % 60, 2)
		},
		z : function () {
			return this.zoneAbbr()
		},
		zz : function () {
			return this.zoneName()
		},
		X : function () {
			return this.unix()
		},
		Q : function () {
			return this.quarter()
		}
	},
	deprecations = {},
	lists = ["months", "monthsShort", "weekdays", "weekdaysShort", "weekdaysMin"];
	function dfl(a, b, c) {
		switch (arguments.length) {
		case 2:
			return a != null ? a : b;
		case 3:
			return a != null ? a : b != null ? b : c;
		default:
			throw new Error("Implement me")
		}
	}
	function hasOwnProp(a, b) {
		return hasOwnProperty.call(a, b)
	}
	function defaultParsingFlags() {
		return {
			empty : false,
			unusedTokens : [],
			unusedInput : [],
			overflow : -2,
			charsLeftOver : 0,
			nullInput : false,
			invalidMonth : null,
			invalidFormat : false,
			userInvalidated : false,
			iso : false
		}
	}
	function printMsg(msg) {
		if (moment.suppressDeprecationWarnings === false && typeof console !== "undefined" && console.warn) {
			console.warn("Deprecation warning: " + msg)
		}
	}
	function deprecate(msg, fn) {
		var firstTime = true;
		return extend(function () {
			if (firstTime) {
				printMsg(msg);
				firstTime = false
			}
			return fn.apply(this, arguments)
		}, fn)
	}
	function deprecateSimple(name, msg) {
		if (!deprecations[name]) {
			printMsg(msg);
			deprecations[name] = true
		}
	}
	function padToken(func, count) {
		return function (a) {
			return leftZeroFill(func.call(this, a), count)
		}
	}
	function ordinalizeToken(func, period) {
		return function (a) {
			return this.localeData().ordinal(func.call(this, a), period)
		}
	}
	while (ordinalizeTokens.length) {
		i = ordinalizeTokens.pop();
		formatTokenFunctions[i + "o"] = ordinalizeToken(formatTokenFunctions[i], i)
	}
	while (paddedTokens.length) {
		i = paddedTokens.pop();
		formatTokenFunctions[i + i] = padToken(formatTokenFunctions[i], 2)
	}
	formatTokenFunctions.DDDD = padToken(formatTokenFunctions.DDD, 3);
	function Locale() {}
	function Moment(config, skipOverflow) {
		if (skipOverflow !== false) {
			checkOverflow(config)
		}
		copyConfig(this, config);
		this._d = new Date(+config._d)
	}
	function Duration(duration) {
		var normalizedInput = normalizeObjectUnits(duration),
		years = normalizedInput.year || 0,
		quarters = normalizedInput.quarter || 0,
		months = normalizedInput.month || 0,
		weeks = normalizedInput.week || 0,
		days = normalizedInput.day || 0,
		hours = normalizedInput.hour || 0,
		minutes = normalizedInput.minute || 0,
		seconds = normalizedInput.second || 0,
		milliseconds = normalizedInput.millisecond || 0;
		this._milliseconds = +milliseconds + seconds * 1e3 + minutes * 6e4 + hours * 36e5;
		this._days = +days + weeks * 7;
		this._months = +months + quarters * 3 + years * 12;
		this._data = {};
		this._locale = moment.localeData();
		this._bubble()
	}
	function extend(a, b) {
		for (var i in b) {
			if (hasOwnProp(b, i)) {
				a[i] = b[i]
			}
		}
		if (hasOwnProp(b, "toString")) {
			a.toString = b.toString
		}
		if (hasOwnProp(b, "valueOf")) {
			a.valueOf = b.valueOf
		}
		return a
	}
	function copyConfig(to, from) {
		var i,
		prop,
		val;
		if (typeof from._isAMomentObject !== "undefined") {
			to._isAMomentObject = from._isAMomentObject
		}
		if (typeof from._i !== "undefined") {
			to._i = from._i
		}
		if (typeof from._f !== "undefined") {
			to._f = from._f
		}
		if (typeof from._l !== "undefined") {
			to._l = from._l
		}
		if (typeof from._strict !== "undefined") {
			to._strict = from._strict
		}
		if (typeof from._tzm !== "undefined") {
			to._tzm = from._tzm
		}
		if (typeof from._isUTC !== "undefined") {
			to._isUTC = from._isUTC
		}
		if (typeof from._offset !== "undefined") {
			to._offset = from._offset
		}
		if (typeof from._pf !== "undefined") {
			to._pf = from._pf
		}
		if (typeof from._locale !== "undefined") {
			to._locale = from._locale
		}
		if (momentProperties.length > 0) {
			for (i in momentProperties) {
				prop = momentProperties[i];
				val = from[prop];
				if (typeof val !== "undefined") {
					to[prop] = val
				}
			}
		}
		return to
	}
	function absRound(number) {
		if (number < 0) {
			return Math.ceil(number)
		} else {
			return Math.floor(number)
		}
	}
	function leftZeroFill(number, targetLength, forceSign) {
		var output = "" + Math.abs(number),
		sign = number >= 0;
		while (output.length < targetLength) {
			output = "0" + output
		}
		return (sign ? forceSign ? "+" : "" : "-") + output
	}
	function positiveMomentsDifference(base, other) {
		var res = {
			milliseconds : 0,
			months : 0
		};
		res.months = other.month() - base.month() + (other.year() - base.year()) * 12;
		if (base.clone().add(res.months, "M").isAfter(other)) {
			--res.months
		}
		res.milliseconds = +other - +base.clone().add(res.months, "M");
		return res
	}
	function momentsDifference(base, other) {
		var res;
		other = makeAs(other, base);
		if (base.isBefore(other)) {
			res = positiveMomentsDifference(base, other)
		} else {
			res = positiveMomentsDifference(other, base);
			res.milliseconds = -res.milliseconds;
			res.months = -res.months
		}
		return res
	}
	function createAdder(direction, name) {
		return function (val, period) {
			var dur,
			tmp;
			if (period !== null && !isNaN(+period)) {
				deprecateSimple(name, "moment()." + name + "(period, number) is deprecated. Please use moment()." + name + "(number, period).");
				tmp = val;
				val = period;
				period = tmp
			}
			val = typeof val === "string" ? +val : val;
			dur = moment.duration(val, period);
			addOrSubtractDurationFromMoment(this, dur, direction);
			return this
		}
	}
	function addOrSubtractDurationFromMoment(mom, duration, isAdding, updateOffset) {
		var milliseconds = duration._milliseconds,
		days = duration._days,
		months = duration._months;
		updateOffset = updateOffset == null ? true : updateOffset;
		if (milliseconds) {
			mom._d.setTime(+mom._d + milliseconds * isAdding)
		}
		if (days) {
			rawSetter(mom, "Date", rawGetter(mom, "Date") + days * isAdding)
		}
		if (months) {
			rawMonthSetter(mom, rawGetter(mom, "Month") + months * isAdding)
		}
		if (updateOffset) {
			moment.updateOffset(mom, days || months)
		}
	}
	function isArray(input) {
		return Object.prototype.toString.call(input) === "[object Array]"
	}
	function isDate(input) {
		return Object.prototype.toString.call(input) === "[object Date]" || input instanceof Date
	}
	function compareArrays(array1, array2, dontConvert) {
		var len = Math.min(array1.length, array2.length),
		lengthDiff = Math.abs(array1.length - array2.length),
		diffs = 0,
		i;
		for (i = 0; i < len; i++) {
			if (dontConvert && array1[i] !== array2[i] || !dontConvert && toInt(array1[i]) !== toInt(array2[i])) {
				diffs++
			}
		}
		return diffs + lengthDiff
	}
	function normalizeUnits(units) {
		if (units) {
			var lowered = units.toLowerCase().replace(/(.)s$/, "$1");
			units = unitAliases[units] || camelFunctions[lowered] || lowered
		}
		return units
	}
	function normalizeObjectUnits(inputObject) {
		var normalizedInput = {},
		normalizedProp,
		prop;
		for (prop in inputObject) {
			if (hasOwnProp(inputObject, prop)) {
				normalizedProp = normalizeUnits(prop);
				if (normalizedProp) {
					normalizedInput[normalizedProp] = inputObject[prop]
				}
			}
		}
		return normalizedInput
	}
	function makeList(field) {
		var count,
		setter;
		if (field.indexOf("week") === 0) {
			count = 7;
			setter = "day"
		} else if (field.indexOf("month") === 0) {
			count = 12;
			setter = "month"
		} else {
			return
		}
		moment[field] = function (format, index) {
			var i,
			getter,
			method = moment._locale[field],
			results = [];
			if (typeof format === "number") {
				index = format;
				format = undefined
			}
			getter = function (i) {
				var m = moment().utc().set(setter, i);
				return method.call(moment._locale, m, format || "")
			};
			if (index != null) {
				return getter(index)
			} else {
				for (i = 0; i < count; i++) {
					results.push(getter(i))
				}
				return results
			}
		}
	}
	function toInt(argumentForCoercion) {
		var coercedNumber = +argumentForCoercion,
		value = 0;
		if (coercedNumber !== 0 && isFinite(coercedNumber)) {
			if (coercedNumber >= 0) {
				value = Math.floor(coercedNumber)
			} else {
				value = Math.ceil(coercedNumber)
			}
		}
		return value
	}
	function daysInMonth(year, month) {
		return new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
	}
	function weeksInYear(year, dow, doy) {
		return weekOfYear(moment([year, 11, 31 + dow - doy]), dow, doy).week
	}
	function daysInYear(year) {
		return isLeapYear(year) ? 366 : 365
	}
	function isLeapYear(year) {
		return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0
	}
	function checkOverflow(m) {
		var overflow;
		if (m._a && m._pf.overflow === -2) {
			overflow = m._a[MONTH] < 0 || m._a[MONTH] > 11 ? MONTH : m._a[DATE] < 1 || m._a[DATE] > daysInMonth(m._a[YEAR], m._a[MONTH]) ? DATE : m._a[HOUR] < 0 || m._a[HOUR] > 23 ? HOUR : m._a[MINUTE] < 0 || m._a[MINUTE] > 59 ? MINUTE : m._a[SECOND] < 0 || m._a[SECOND] > 59 ? SECOND : m._a[MILLISECOND] < 0 || m._a[MILLISECOND] > 999 ? MILLISECOND : -1;
			if (m._pf._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {
				overflow = DATE
			}
			m._pf.overflow = overflow
		}
	}
	function isValid(m) {
		if (m._isValid == null) {
			m._isValid = !isNaN(m._d.getTime()) && m._pf.overflow < 0 && !m._pf.empty && !m._pf.invalidMonth && !m._pf.nullInput && !m._pf.invalidFormat && !m._pf.userInvalidated;
			if (m._strict) {
				m._isValid = m._isValid && m._pf.charsLeftOver === 0 && m._pf.unusedTokens.length === 0
			}
		}
		return m._isValid
	}
	function normalizeLocale(key) {
		return key ? key.toLowerCase().replace("_", "-") : key
	}
	function chooseLocale(names) {
		var i = 0,
		j,
		next,
		locale,
		split;
		while (i < names.length) {
			split = normalizeLocale(names[i]).split("-");
			j = split.length;
			next = normalizeLocale(names[i + 1]);
			next = next ? next.split("-") : null;
			while (j > 0) {
				locale = loadLocale(split.slice(0, j).join("-"));
				if (locale) {
					return locale
				}
				if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) {
					break
				}
				j--
			}
			i++
		}
		return null
	}
	function loadLocale(name) {
		var oldLocale = null;
		if (!locales[name] && hasModule) {
			try {
				oldLocale = moment.locale();
				require("./locale/" + name);
				moment.locale(oldLocale)
			} catch (e) {}
		}
		return locales[name]
	}
	function makeAs(input, model) {
		return model._isUTC ? moment(input).zone(model._offset || 0) : moment(input).local()
	}
	extend(Locale.prototype, {
		set : function (config) {
			var prop,
			i;
			for (i in config) {
				prop = config[i];
				if (typeof prop === "function") {
					this[i] = prop
				} else {
					this["_" + i] = prop
				}
			}
		},
		_months : "January_February_March_April_May_June_July_August_September_October_November_December".split("_"),
		months : function (m) {
			return this._months[m.month()]
		},
		_monthsShort : "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),
		monthsShort : function (m) {
			return this._monthsShort[m.month()]
		},
		monthsParse : function (monthName) {
			var i,
			mom,
			regex;
			if (!this._monthsParse) {
				this._monthsParse = []
			}
			for (i = 0; i < 12; i++) {
				if (!this._monthsParse[i]) {
					mom = moment.utc([2e3, i]);
					regex = "^" + this.months(mom, "") + "|^" + this.monthsShort(mom, "");
					this._monthsParse[i] = new RegExp(regex.replace(".", ""), "i")
				}
				if (this._monthsParse[i].test(monthName)) {
					return i
				}
			}
		},
		_weekdays : "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
		weekdays : function (m) {
			return this._weekdays[m.day()]
		},
		_weekdaysShort : "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),
		weekdaysShort : function (m) {
			return this._weekdaysShort[m.day()]
		},
		_weekdaysMin : "Su_Mo_Tu_We_Th_Fr_Sa".split("_"),
		weekdaysMin : function (m) {
			return this._weekdaysMin[m.day()]
		},
		weekdaysParse : function (weekdayName) {
			var i,
			mom,
			regex;
			if (!this._weekdaysParse) {
				this._weekdaysParse = []
			}
			for (i = 0; i < 7; i++) {
				if (!this._weekdaysParse[i]) {
					mom = moment([2e3, 1]).day(i);
					regex = "^" + this.weekdays(mom, "") + "|^" + this.weekdaysShort(mom, "") + "|^" + this.weekdaysMin(mom, "");
					this._weekdaysParse[i] = new RegExp(regex.replace(".", ""), "i")
				}
				if (this._weekdaysParse[i].test(weekdayName)) {
					return i
				}
			}
		},
		_longDateFormat : {
			LT : "h:mm A",
			L : "MM/DD/YYYY",
			LL : "MMMM D, YYYY",
			LLL : "MMMM D, YYYY LT",
			LLLL : "dddd, MMMM D, YYYY LT"
		},
		longDateFormat : function (key) {
			var output = this._longDateFormat[key];
			if (!output && this._longDateFormat[key.toUpperCase()]) {
				output = this._longDateFormat[key.toUpperCase()].replace(/MMMM|MM|DD|dddd/g, function (val) {
						return val.slice(1)
					});
				this._longDateFormat[key] = output
			}
			return output
		},
		isPM : function (input) {
			return (input + "").toLowerCase().charAt(0) === "p"
		},
		_meridiemParse : /[ap]\.?m?\.?/i,
		meridiem : function (hours, minutes, isLower) {
			if (hours > 11) {
				return isLower ? "pm" : "PM"
			} else {
				return isLower ? "am" : "AM"
			}
		},
		_calendar : {
			sameDay : "[Today at] LT",
			nextDay : "[Tomorrow at] LT",
			nextWeek : "dddd [at] LT",
			lastDay : "[Yesterday at] LT",
			lastWeek : "[Last] dddd [at] LT",
			sameElse : "L"
		},
		calendar : function (key, mom) {
			var output = this._calendar[key];
			return typeof output === "function" ? output.apply(mom) : output
		},
		_relativeTime : {
			future : "in %s",
			past : "%s ago",
			s : "a few seconds",
			m : "a minute",
			mm : "%d minutes",
			h : "an hour",
			hh : "%d hours",
			d : "a day",
			dd : "%d days",
			M : "a month",
			MM : "%d months",
			y : "a year",
			yy : "%d years"
		},
		relativeTime : function (number, withoutSuffix, string, isFuture) {
			var output = this._relativeTime[string];
			return typeof output === "function" ? output(number, withoutSuffix, string, isFuture) : output.replace(/%d/i, number)
		},
		pastFuture : function (diff, output) {
			var format = this._relativeTime[diff > 0 ? "future" : "past"];
			return typeof format === "function" ? format(output) : format.replace(/%s/i, output)
		},
		ordinal : function (number) {
			return this._ordinal.replace("%d", number)
		},
		_ordinal : "%d",
		preparse : function (string) {
			return string
		},
		postformat : function (string) {
			return string
		},
		week : function (mom) {
			return weekOfYear(mom, this._week.dow, this._week.doy).week
		},
		_week : {
			dow : 0,
			doy : 6
		},
		_invalidDate : "Invalid date",
		invalidDate : function () {
			return this._invalidDate
		}
	});
	function removeFormattingTokens(input) {
		if (input.match(/\[[\s\S]/)) {
			return input.replace(/^\[|\]$/g, "")
		}
		return input.replace(/\\/g, "")
	}
	function makeFormatFunction(format) {
		var array = format.match(formattingTokens),
		i,
		length;
		for (i = 0, length = array.length; i < length; i++) {
			if (formatTokenFunctions[array[i]]) {
				array[i] = formatTokenFunctions[array[i]]
			} else {
				array[i] = removeFormattingTokens(array[i])
			}
		}
		return function (mom) {
			var output = "";
			for (i = 0; i < length; i++) {
				output += array[i]instanceof Function ? array[i].call(mom, format) : array[i]
			}
			return output
		}
	}
	function formatMoment(m, format) {
		if (!m.isValid()) {
			return m.localeData().invalidDate()
		}
		format = expandFormat(format, m.localeData());
		if (!formatFunctions[format]) {
			formatFunctions[format] = makeFormatFunction(format)
		}
		return formatFunctions[format](m)
	}
	function expandFormat(format, locale) {
		var i = 5;
		function replaceLongDateFormatTokens(input) {
			return locale.longDateFormat(input) || input
		}
		localFormattingTokens.lastIndex = 0;
		while (i >= 0 && localFormattingTokens.test(format)) {
			format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
			localFormattingTokens.lastIndex = 0;
			i -= 1
		}
		return format
	}
	function getParseRegexForToken(token, config) {
		var a,
		strict = config._strict;
		switch (token) {
		case "Q":
			return parseTokenOneDigit;
		case "DDDD":
			return parseTokenThreeDigits;
		case "YYYY":
		case "GGGG":
		case "gggg":
			return strict ? parseTokenFourDigits : parseTokenOneToFourDigits;
		case "Y":
		case "G":
		case "g":
			return parseTokenSignedNumber;
		case "YYYYYY":
		case "YYYYY":
		case "GGGGG":
		case "ggggg":
			return strict ? parseTokenSixDigits : parseTokenOneToSixDigits;
		case "S":
			if (strict) {
				return parseTokenOneDigit
			}
		case "SS":
			if (strict) {
				return parseTokenTwoDigits
			}
		case "SSS":
			if (strict) {
				return parseTokenThreeDigits
			}
		case "DDD":
			return parseTokenOneToThreeDigits;
		case "MMM":
		case "MMMM":
		case "dd":
		case "ddd":
		case "dddd":
			return parseTokenWord;
		case "a":
		case "A":
			return config._locale._meridiemParse;
		case "X":
			return parseTokenTimestampMs;
		case "Z":
		case "ZZ":
			return parseTokenTimezone;
		case "T":
			return parseTokenT;
		case "SSSS":
			return parseTokenDigits;
		case "MM":
		case "DD":
		case "YY":
		case "GG":
		case "gg":
		case "HH":
		case "hh":
		case "mm":
		case "ss":
		case "ww":
		case "WW":
			return strict ? parseTokenTwoDigits : parseTokenOneOrTwoDigits;
		case "M":
		case "D":
		case "d":
		case "H":
		case "h":
		case "m":
		case "s":
		case "w":
		case "W":
		case "e":
		case "E":
			return parseTokenOneOrTwoDigits;
		case "Do":
			return parseTokenOrdinal;
		default:
			a = new RegExp(regexpEscape(unescapeFormat(token.replace("\\", "")), "i"));
			return a
		}
	}
	function timezoneMinutesFromString(string) {
		string = string || "";
		var possibleTzMatches = string.match(parseTokenTimezone) || [],
		tzChunk = possibleTzMatches[possibleTzMatches.length - 1] || [],
		parts = (tzChunk + "").match(parseTimezoneChunker) || ["-", 0, 0],
		minutes =  + (parts[1] * 60) + toInt(parts[2]);
		return parts[0] === "+" ? -minutes : minutes
	}
	function addTimeToArrayFromToken(token, input, config) {
		var a,
		datePartArray = config._a;
		switch (token) {
		case "Q":
			if (input != null) {
				datePartArray[MONTH] = (toInt(input) - 1) * 3
			}
			break;
		case "M":
		case "MM":
			if (input != null) {
				datePartArray[MONTH] = toInt(input) - 1
			}
			break;
		case "MMM":
		case "MMMM":
			a = config._locale.monthsParse(input);
			if (a != null) {
				datePartArray[MONTH] = a
			} else {
				config._pf.invalidMonth = input
			}
			break;
		case "D":
		case "DD":
			if (input != null) {
				datePartArray[DATE] = toInt(input)
			}
			break;
		case "Do":
			if (input != null) {
				datePartArray[DATE] = toInt(parseInt(input, 10))
			}
			break;
		case "DDD":
		case "DDDD":
			if (input != null) {
				config._dayOfYear = toInt(input)
			}
			break;
		case "YY":
			datePartArray[YEAR] = moment.parseTwoDigitYear(input);
			break;
		case "YYYY":
		case "YYYYY":
		case "YYYYYY":
			datePartArray[YEAR] = toInt(input);
			break;
		case "a":
		case "A":
			config._isPm = config._locale.isPM(input);
			break;
		case "H":
		case "HH":
		case "h":
		case "hh":
			datePartArray[HOUR] = toInt(input);
			break;
		case "m":
		case "mm":
			datePartArray[MINUTE] = toInt(input);
			break;
		case "s":
		case "ss":
			datePartArray[SECOND] = toInt(input);
			break;
		case "S":
		case "SS":
		case "SSS":
		case "SSSS":
			datePartArray[MILLISECOND] = toInt(("0." + input) * 1e3);
			break;
		case "X":
			config._d = new Date(parseFloat(input) * 1e3);
			break;
		case "Z":
		case "ZZ":
			config._useUTC = true;
			config._tzm = timezoneMinutesFromString(input);
			break;
		case "dd":
		case "ddd":
		case "dddd":
			a = config._locale.weekdaysParse(input);
			if (a != null) {
				config._w = config._w || {};
				config._w["d"] = a
			} else {
				config._pf.invalidWeekday = input
			}
			break;
		case "w":
		case "ww":
		case "W":
		case "WW":
		case "d":
		case "e":
		case "E":
			token = token.substr(0, 1);
		case "gggg":
		case "GGGG":
		case "GGGGG":
			token = token.substr(0, 2);
			if (input) {
				config._w = config._w || {};
				config._w[token] = toInt(input)
			}
			break;
		case "gg":
		case "GG":
			config._w = config._w || {};
			config._w[token] = moment.parseTwoDigitYear(input)
		}
	}
	function dayOfYearFromWeekInfo(config) {
		var w,
		weekYear,
		week,
		weekday,
		dow,
		doy,
		temp;
		w = config._w;
		if (w.GG != null || w.W != null || w.E != null) {
			dow = 1;
			doy = 4;
			weekYear = dfl(w.GG, config._a[YEAR], weekOfYear(moment(), 1, 4).year);
			week = dfl(w.W, 1);
			weekday = dfl(w.E, 1)
		} else {
			dow = config._locale._week.dow;
			doy = config._locale._week.doy;
			weekYear = dfl(w.gg, config._a[YEAR], weekOfYear(moment(), dow, doy).year);
			week = dfl(w.w, 1);
			if (w.d != null) {
				weekday = w.d;
				if (weekday < dow) {
					++week
				}
			} else if (w.e != null) {
				weekday = w.e + dow
			} else {
				weekday = dow
			}
		}
		temp = dayOfYearFromWeeks(weekYear, week, weekday, doy, dow);
		config._a[YEAR] = temp.year;
		config._dayOfYear = temp.dayOfYear
	}
	function dateFromConfig(config) {
		var i,
		date,
		input = [],
		currentDate,
		yearToUse;
		if (config._d) {
			return
		}
		currentDate = currentDateArray(config);
		if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
			dayOfYearFromWeekInfo(config)
		}
		if (config._dayOfYear) {
			yearToUse = dfl(config._a[YEAR], currentDate[YEAR]);
			if (config._dayOfYear > daysInYear(yearToUse)) {
				config._pf._overflowDayOfYear = true
			}
			date = makeUTCDate(yearToUse, 0, config._dayOfYear);
			config._a[MONTH] = date.getUTCMonth();
			config._a[DATE] = date.getUTCDate()
		}
		for (i = 0; i < 3 && config._a[i] == null; ++i) {
			config._a[i] = input[i] = currentDate[i]
		}
		for (; i < 7; i++) {
			config._a[i] = input[i] = config._a[i] == null ? i === 2 ? 1 : 0 : config._a[i]
		}
		config._d = (config._useUTC ? makeUTCDate : makeDate).apply(null, input);
		if (config._tzm != null) {
			config._d.setUTCMinutes(config._d.getUTCMinutes() + config._tzm)
		}
	}
	function dateFromObject(config) {
		var normalizedInput;
		if (config._d) {
			return
		}
		normalizedInput = normalizeObjectUnits(config._i);
		config._a = [normalizedInput.year, normalizedInput.month, normalizedInput.day, normalizedInput.hour, normalizedInput.minute, normalizedInput.second, normalizedInput.millisecond];
		dateFromConfig(config)
	}
	function currentDateArray(config) {
		var now = new Date;
		if (config._useUTC) {
			return [now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()]
		} else {
			return [now.getFullYear(), now.getMonth(), now.getDate()]
		}
	}
	function makeDateFromStringAndFormat(config) {
		if (config._f === moment.ISO_8601) {
			parseISO(config);
			return
		}
		config._a = [];
		config._pf.empty = true;
		var string = "" + config._i,
		i,
		parsedInput,
		tokens,
		token,
		skipped,
		stringLength = string.length,
		totalParsedInputLength = 0;
		tokens = expandFormat(config._f, config._locale).match(formattingTokens) || [];
		for (i = 0; i < tokens.length; i++) {
			token = tokens[i];
			parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
			if (parsedInput) {
				skipped = string.substr(0, string.indexOf(parsedInput));
				if (skipped.length > 0) {
					config._pf.unusedInput.push(skipped)
				}
				string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
				totalParsedInputLength += parsedInput.length
			}
			if (formatTokenFunctions[token]) {
				if (parsedInput) {
					config._pf.empty = false
				} else {
					config._pf.unusedTokens.push(token)
				}
				addTimeToArrayFromToken(token, parsedInput, config)
			} else if (config._strict && !parsedInput) {
				config._pf.unusedTokens.push(token)
			}
		}
		config._pf.charsLeftOver = stringLength - totalParsedInputLength;
		if (string.length > 0) {
			config._pf.unusedInput.push(string)
		}
		if (config._isPm && config._a[HOUR] < 12) {
			config._a[HOUR] += 12
		}
		if (config._isPm === false && config._a[HOUR] === 12) {
			config._a[HOUR] = 0
		}
		dateFromConfig(config);
		checkOverflow(config)
	}
	function unescapeFormat(s) {
		return s.replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (matched, p1, p2, p3, p4) {
			return p1 || p2 || p3 || p4
		})
	}
	function regexpEscape(s) {
		return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")
	}
	function makeDateFromStringAndArray(config) {
		var tempConfig,
		bestMoment,
		scoreToBeat,
		i,
		currentScore;
		if (config._f.length === 0) {
			config._pf.invalidFormat = true;
			config._d = new Date(NaN);
			return
		}
		for (i = 0; i < config._f.length; i++) {
			currentScore = 0;
			tempConfig = copyConfig({}, config);
			if (config._useUTC != null) {
				tempConfig._useUTC = config._useUTC
			}
			tempConfig._pf = defaultParsingFlags();
			tempConfig._f = config._f[i];
			makeDateFromStringAndFormat(tempConfig);
			if (!isValid(tempConfig)) {
				continue
			}
			currentScore += tempConfig._pf.charsLeftOver;
			currentScore += tempConfig._pf.unusedTokens.length * 10;
			tempConfig._pf.score = currentScore;
			if (scoreToBeat == null || currentScore < scoreToBeat) {
				scoreToBeat = currentScore;
				bestMoment = tempConfig
			}
		}
		extend(config, bestMoment || tempConfig)
	}
	function parseISO(config) {
		var i,
		l,
		string = config._i,
		match = isoRegex.exec(string);
		if (match) {
			config._pf.iso = true;
			for (i = 0, l = isoDates.length; i < l; i++) {
				if (isoDates[i][1].exec(string)) {
					config._f = isoDates[i][0] + (match[6] || " ");
					break
				}
			}
			for (i = 0, l = isoTimes.length; i < l; i++) {
				if (isoTimes[i][1].exec(string)) {
					config._f += isoTimes[i][0];
					break
				}
			}
			if (string.match(parseTokenTimezone)) {
				config._f += "Z"
			}
			makeDateFromStringAndFormat(config)
		} else {
			config._isValid = false
		}
	}
	function makeDateFromString(config) {
		parseISO(config);
		if (config._isValid === false) {
			delete config._isValid;
			moment.createFromInputFallback(config)
		}
	}
	function map(arr, fn) {
		var res = [],
		i;
		for (i = 0; i < arr.length; ++i) {
			res.push(fn(arr[i], i))
		}
		return res
	}
	function makeDateFromInput(config) {
		var input = config._i,
		matched;
		if (input === undefined) {
			config._d = new Date
		} else if (isDate(input)) {
			config._d = new Date(+input)
		} else if ((matched = aspNetJsonRegex.exec(input)) !== null) {
			config._d = new Date(+matched[1])
		} else if (typeof input === "string") {
			makeDateFromString(config)
		} else if (isArray(input)) {
			config._a = map(input.slice(0), function (obj) {
					return parseInt(obj, 10)
				});
			dateFromConfig(config)
		} else if (typeof input === "object") {
			dateFromObject(config)
		} else if (typeof input === "number") {
			config._d = new Date(input)
		} else {
			moment.createFromInputFallback(config)
		}
	}
	function makeDate(y, m, d, h, M, s, ms) {
		var date = new Date(y, m, d, h, M, s, ms);
		if (y < 1970) {
			date.setFullYear(y)
		}
		return date
	}
	function makeUTCDate(y) {
		var date = new Date(Date.UTC.apply(null, arguments));
		if (y < 1970) {
			date.setUTCFullYear(y)
		}
		return date
	}
	function parseWeekday(input, locale) {
		if (typeof input === "string") {
			if (!isNaN(input)) {
				input = parseInt(input, 10)
			} else {
				input = locale.weekdaysParse(input);
				if (typeof input !== "number") {
					return null
				}
			}
		}
		return input
	}
	function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale) {
		return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture)
	}
	function relativeTime(posNegDuration, withoutSuffix, locale) {
		var duration = moment.duration(posNegDuration).abs(),
		seconds = round(duration.as("s")),
		minutes = round(duration.as("m")),
		hours = round(duration.as("h")),
		days = round(duration.as("d")),
		months = round(duration.as("M")),
		years = round(duration.as("y")),
		args = seconds < relativeTimeThresholds.s && ["s", seconds] || minutes === 1 && ["m"] || minutes < relativeTimeThresholds.m && ["mm", minutes] || hours === 1 && ["h"] || hours < relativeTimeThresholds.h && ["hh", hours] || days === 1 && ["d"] || days < relativeTimeThresholds.d && ["dd", days] || months === 1 && ["M"] || months < relativeTimeThresholds.M && ["MM", months] || years === 1 && ["y"] || ["yy", years];
		args[2] = withoutSuffix;
		args[3] = +posNegDuration > 0;
		args[4] = locale;
		return substituteTimeAgo.apply({}, args)
	}
	function weekOfYear(mom, firstDayOfWeek, firstDayOfWeekOfYear) {
		var end = firstDayOfWeekOfYear - firstDayOfWeek,
		daysToDayOfWeek = firstDayOfWeekOfYear - mom.day(),
		adjustedMoment;
		if (daysToDayOfWeek > end) {
			daysToDayOfWeek -= 7
		}
		if (daysToDayOfWeek < end - 7) {
			daysToDayOfWeek += 7
		}
		adjustedMoment = moment(mom).add(daysToDayOfWeek, "d");
		return {
			week : Math.ceil(adjustedMoment.dayOfYear() / 7),
			year : adjustedMoment.year()
		}
	}
	function dayOfYearFromWeeks(year, week, weekday, firstDayOfWeekOfYear, firstDayOfWeek) {
		var d = makeUTCDate(year, 0, 1).getUTCDay(),
		daysToAdd,
		dayOfYear;
		d = d === 0 ? 7 : d;
		weekday = weekday != null ? weekday : firstDayOfWeek;
		daysToAdd = firstDayOfWeek - d + (d > firstDayOfWeekOfYear ? 7 : 0) - (d < firstDayOfWeek ? 7 : 0);
		dayOfYear = 7 * (week - 1) + (weekday - firstDayOfWeek) + daysToAdd + 1;
		return {
			year : dayOfYear > 0 ? year : year - 1,
			dayOfYear : dayOfYear > 0 ? dayOfYear : daysInYear(year - 1) + dayOfYear
		}
	}
	function makeMoment(config) {
		var input = config._i,
		format = config._f;
		config._locale = config._locale || moment.localeData(config._l);
		if (input === null || format === undefined && input === "") {
			return moment.invalid({
				nullInput : true
			})
		}
		if (typeof input === "string") {
			config._i = input = config._locale.preparse(input)
		}
		if (moment.isMoment(input)) {
			return new Moment(input, true)
		} else if (format) {
			if (isArray(format)) {
				makeDateFromStringAndArray(config)
			} else {
				makeDateFromStringAndFormat(config)
			}
		} else {
			makeDateFromInput(config)
		}
		return new Moment(config)
	}
	moment = function (input, format, locale, strict) {
		var c;
		if (typeof locale === "boolean") {
			strict = locale;
			locale = undefined
		}
		c = {};
		c._isAMomentObject = true;
		c._i = input;
		c._f = format;
		c._l = locale;
		c._strict = strict;
		c._isUTC = false;
		c._pf = defaultParsingFlags();
		return makeMoment(c)
	};
	moment.suppressDeprecationWarnings = false;
	moment.createFromInputFallback = deprecate("moment construction falls back to js Date. This is " + "discouraged and will be removed in upcoming major " + "release. Please refer to " + "https://github.com/moment/moment/issues/1407 for more info.", function (config) {
			config._d = new Date(config._i)
		});
	function pickBy(fn, moments) {
		var res,
		i;
		if (moments.length === 1 && isArray(moments[0])) {
			moments = moments[0]
		}
		if (!moments.length) {
			return moment()
		}
		res = moments[0];
		for (i = 1; i < moments.length; ++i) {
			if (moments[i][fn](res)) {
				res = moments[i]
			}
		}
		return res
	}
	moment.min = function () {
		var args = [].slice.call(arguments, 0);
		return pickBy("isBefore", args)
	};
	moment.max = function () {
		var args = [].slice.call(arguments, 0);
		return pickBy("isAfter", args)
	};
	moment.utc = function (input, format, locale, strict) {
		var c;
		if (typeof locale === "boolean") {
			strict = locale;
			locale = undefined
		}
		c = {};
		c._isAMomentObject = true;
		c._useUTC = true;
		c._isUTC = true;
		c._l = locale;
		c._i = input;
		c._f = format;
		c._strict = strict;
		c._pf = defaultParsingFlags();
		return makeMoment(c).utc()
	};
	moment.unix = function (input) {
		return moment(input * 1e3)
	};
	moment.duration = function (input, key) {
		var duration = input,
		match = null,
		sign,
		ret,
		parseIso,
		diffRes;
		if (moment.isDuration(input)) {
			duration = {
				ms : input._milliseconds,
				d : input._days,
				M : input._months
			}
		} else if (typeof input === "number") {
			duration = {};
			if (key) {
				duration[key] = input
			} else {
				duration.milliseconds = input
			}
		} else if (!!(match = aspNetTimeSpanJsonRegex.exec(input))) {
			sign = match[1] === "-" ? -1 : 1;
			duration = {
				y : 0,
				d : toInt(match[DATE]) * sign,
				h : toInt(match[HOUR]) * sign,
				m : toInt(match[MINUTE]) * sign,
				s : toInt(match[SECOND]) * sign,
				ms : toInt(match[MILLISECOND]) * sign
			}
		} else if (!!(match = isoDurationRegex.exec(input))) {
			sign = match[1] === "-" ? -1 : 1;
			parseIso = function (inp) {
				var res = inp && parseFloat(inp.replace(",", "."));
				return (isNaN(res) ? 0 : res) * sign
			};
			duration = {
				y : parseIso(match[2]),
				M : parseIso(match[3]),
				d : parseIso(match[4]),
				h : parseIso(match[5]),
				m : parseIso(match[6]),
				s : parseIso(match[7]),
				w : parseIso(match[8])
			}
		} else if (typeof duration === "object" && ("from" in duration || "to" in duration)) {
			diffRes = momentsDifference(moment(duration.from), moment(duration.to));
			duration = {};
			duration.ms = diffRes.milliseconds;
			duration.M = diffRes.months
		}
		ret = new Duration(duration);
		if (moment.isDuration(input) && hasOwnProp(input, "_locale")) {
			ret._locale = input._locale
		}
		return ret
	};
	moment.version = VERSION;
	moment.defaultFormat = isoFormat;
	moment.ISO_8601 = function () {};
	moment.momentProperties = momentProperties;
	moment.updateOffset = function () {};
	moment.relativeTimeThreshold = function (threshold, limit) {
		if (relativeTimeThresholds[threshold] === undefined) {
			return false
		}
		if (limit === undefined) {
			return relativeTimeThresholds[threshold]
		}
		relativeTimeThresholds[threshold] = limit;
		return true
	};
	moment.lang = deprecate("moment.lang is deprecated. Use moment.locale instead.", function (key, value) {
			return moment.locale(key, value)
		});
	moment.locale = function (key, values) {
		var data;
		if (key) {
			if (typeof values !== "undefined") {
				data = moment.defineLocale(key, values)
			} else {
				data = moment.localeData(key)
			}
			if (data) {
				moment.duration._locale = moment._locale = data
			}
		}
		return moment._locale._abbr
	};
	moment.defineLocale = function (name, values) {
		if (values !== null) {
			values.abbr = name;
			if (!locales[name]) {
				locales[name] = new Locale
			}
			locales[name].set(values);
			moment.locale(name);
			return locales[name]
		} else {
			delete locales[name];
			return null
		}
	};
	moment.langData = deprecate("moment.langData is deprecated. Use moment.localeData instead.", function (key) {
			return moment.localeData(key)
		});
	moment.localeData = function (key) {
		var locale;
		if (key && key._locale && key._locale._abbr) {
			key = key._locale._abbr
		}
		if (!key) {
			return moment._locale
		}
		if (!isArray(key)) {
			locale = loadLocale(key);
			if (locale) {
				return locale
			}
			key = [key]
		}
		return chooseLocale(key)
	};
	moment.isMoment = function (obj) {
		return obj instanceof Moment || obj != null && hasOwnProp(obj, "_isAMomentObject")
	};
	moment.isDuration = function (obj) {
		return obj instanceof Duration
	};
	for (i = lists.length - 1; i >= 0; --i) {
		makeList(lists[i])
	}
	moment.normalizeUnits = function (units) {
		return normalizeUnits(units)
	};
	moment.invalid = function (flags) {
		var m = moment.utc(NaN);
		if (flags != null) {
			extend(m._pf, flags)
		} else {
			m._pf.userInvalidated = true
		}
		return m
	};
	moment.parseZone = function () {
		return moment.apply(null, arguments).parseZone()
	};
	moment.parseTwoDigitYear = function (input) {
		return toInt(input) + (toInt(input) > 68 ? 1900 : 2e3)
	};
	extend(moment.fn = Moment.prototype, {
		clone : function () {
			return moment(this)
		},
		valueOf : function () {
			return +this._d + (this._offset || 0) * 6e4
		},
		unix : function () {
			return Math.floor(+this / 1e3)
		},
		toString : function () {
			return this.clone().locale("en").format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ")
		},
		toDate : function () {
			return this._offset ? new Date(+this) : this._d
		},
		toISOString : function () {
			var m = moment(this).utc();
			if (0 < m.year() && m.year() <= 9999) {
				return formatMoment(m, "YYYY-MM-DD[T]HH:mm:ss.SSS[Z]")
			} else {
				return formatMoment(m, "YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]")
			}
		},
		toArray : function () {
			var m = this;
			return [m.year(), m.month(), m.date(), m.hours(), m.minutes(), m.seconds(), m.milliseconds()]
		},
		isValid : function () {
			return isValid(this)
		},
		isDSTShifted : function () {
			if (this._a) {
				return this.isValid() && compareArrays(this._a, (this._isUTC ? moment.utc(this._a) : moment(this._a)).toArray()) > 0
			}
			return false
		},
		parsingFlags : function () {
			return extend({}, this._pf)
		},
		invalidAt : function () {
			return this._pf.overflow
		},
		utc : function (keepLocalTime) {
			return this.zone(0, keepLocalTime)
		},
		local : function (keepLocalTime) {
			if (this._isUTC) {
				this.zone(0, keepLocalTime);
				this._isUTC = false;
				if (keepLocalTime) {
					this.add(this._dateTzOffset(), "m")
				}
			}
			return this
		},
		format : function (inputString) {
			var output = formatMoment(this, inputString || moment.defaultFormat);
			return this.localeData().postformat(output)
		},
		add : createAdder(1, "add"),
		subtract : createAdder(-1, "subtract"),
		diff : function (input, units, asFloat) {
			var that = makeAs(input, this),
			zoneDiff = (this.zone() - that.zone()) * 6e4,
			diff,
			output,
			daysAdjust;
			units = normalizeUnits(units);
			if (units === "year" || units === "month") {
				diff = (this.daysInMonth() + that.daysInMonth()) * 432e5;
				output = (this.year() - that.year()) * 12 + (this.month() - that.month());
				daysAdjust = this - moment(this).startOf("month") - (that - moment(that).startOf("month"));
				daysAdjust -= (this.zone() - moment(this).startOf("month").zone() - (that.zone() - moment(that).startOf("month").zone())) * 6e4;
				output += daysAdjust / diff;
				if (units === "year") {
					output = output / 12
				}
			} else {
				diff = this - that;
				output = units === "second" ? diff / 1e3 : units === "minute" ? diff / 6e4 : units === "hour" ? diff / 36e5 : units === "day" ? (diff - zoneDiff) / 864e5 : units === "week" ? (diff - zoneDiff) / 6048e5 : diff
			}
			return asFloat ? output : absRound(output)
		},
		from : function (time, withoutSuffix) {
			return moment.duration({
				to : this,
				from : time
			}).locale(this.locale()).humanize(!withoutSuffix)
		},
		fromNow : function (withoutSuffix) {
			return this.from(moment(), withoutSuffix)
		},
		calendar : function (time) {
			var now = time || moment(),
			sod = makeAs(now, this).startOf("day"),
			diff = this.diff(sod, "days", true),
			format = diff < -6 ? "sameElse" : diff < -1 ? "lastWeek" : diff < 0 ? "lastDay" : diff < 1 ? "sameDay" : diff < 2 ? "nextDay" : diff < 7 ? "nextWeek" : "sameElse";
			return this.format(this.localeData().calendar(format, this))
		},
		isLeapYear : function () {
			return isLeapYear(this.year())
		},
		isDST : function () {
			return this.zone() < this.clone().month(0).zone() || this.zone() < this.clone().month(5).zone()
		},
		day : function (input) {
			var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
			if (input != null) {
				input = parseWeekday(input, this.localeData());
				return this.add(input - day, "d")
			} else {
				return day
			}
		},
		month : makeAccessor("Month", true),
		startOf : function (units) {
			units = normalizeUnits(units);
			switch (units) {
			case "year":
				this.month(0);
			case "quarter":
			case "month":
				this.date(1);
			case "week":
			case "isoWeek":
			case "day":
				this.hours(0);
			case "hour":
				this.minutes(0);
			case "minute":
				this.seconds(0);
			case "second":
				this.milliseconds(0)
			}
			if (units === "week") {
				this.weekday(0)
			} else if (units === "isoWeek") {
				this.isoWeekday(1)
			}
			if (units === "quarter") {
				this.month(Math.floor(this.month() / 3) * 3)
			}
			return this
		},
		endOf : function (units) {
			units = normalizeUnits(units);
			return this.startOf(units).add(1, units === "isoWeek" ? "week" : units).subtract(1, "ms")
		},
		isAfter : function (input, units) {
			units = normalizeUnits(typeof units !== "undefined" ? units : "millisecond");
			if (units === "millisecond") {
				input = moment.isMoment(input) ? input : moment(input);
				return +this > +input
			} else {
				return +this.clone().startOf(units) > +moment(input).startOf(units)
			}
		},
		isBefore : function (input, units) {
			units = normalizeUnits(typeof units !== "undefined" ? units : "millisecond");
			if (units === "millisecond") {
				input = moment.isMoment(input) ? input : moment(input);
				return +this < +input
			} else {
				return +this.clone().startOf(units) < +moment(input).startOf(units)
			}
		},
		isSame : function (input, units) {
			units = normalizeUnits(units || "millisecond");
			if (units === "millisecond") {
				input = moment.isMoment(input) ? input : moment(input);
				return +this === +input
			} else {
				return +this.clone().startOf(units) === +makeAs(input, this).startOf(units)
			}
		},
		min : deprecate("moment().min is deprecated, use moment.min instead. https://github.com/moment/moment/issues/1548", function (other) {
			other = moment.apply(null, arguments);
			return other < this ? this : other
		}),
		max : deprecate("moment().max is deprecated, use moment.max instead. https://github.com/moment/moment/issues/1548", function (other) {
			other = moment.apply(null, arguments);
			return other > this ? this : other
		}),
		zone : function (input, keepLocalTime) {
			var offset = this._offset || 0,
			localAdjust;
			if (input != null) {
				if (typeof input === "string") {
					input = timezoneMinutesFromString(input)
				}
				if (Math.abs(input) < 16) {
					input = input * 60
				}
				if (!this._isUTC && keepLocalTime) {
					localAdjust = this._dateTzOffset()
				}
				this._offset = input;
				this._isUTC = true;
				if (localAdjust != null) {
					this.subtract(localAdjust, "m")
				}
				if (offset !== input) {
					if (!keepLocalTime || this._changeInProgress) {
						addOrSubtractDurationFromMoment(this, moment.duration(offset - input, "m"), 1, false)
					} else if (!this._changeInProgress) {
						this._changeInProgress = true;
						moment.updateOffset(this, true);
						this._changeInProgress = null
					}
				}
			} else {
				return this._isUTC ? offset : this._dateTzOffset()
			}
			return this
		},
		zoneAbbr : function () {
			return this._isUTC ? "UTC" : ""
		},
		zoneName : function () {
			return this._isUTC ? "Coordinated Universal Time" : ""
		},
		parseZone : function () {
			if (this._tzm) {
				this.zone(this._tzm)
			} else if (typeof this._i === "string") {
				this.zone(this._i)
			}
			return this
		},
		hasAlignedHourOffset : function (input) {
			if (!input) {
				input = 0
			} else {
				input = moment(input).zone()
			}
			return (this.zone() - input) % 60 === 0
		},
		daysInMonth : function () {
			return daysInMonth(this.year(), this.month())
		},
		dayOfYear : function (input) {
			var dayOfYear = round((moment(this).startOf("day") - moment(this).startOf("year")) / 864e5) + 1;
			return input == null ? dayOfYear : this.add(input - dayOfYear, "d")
		},
		quarter : function (input) {
			return input == null ? Math.ceil((this.month() + 1) / 3) : this.month((input - 1) * 3 + this.month() % 3)
		},
		weekYear : function (input) {
			var year = weekOfYear(this, this.localeData()._week.dow, this.localeData()._week.doy).year;
			return input == null ? year : this.add(input - year, "y")
		},
		isoWeekYear : function (input) {
			var year = weekOfYear(this, 1, 4).year;
			return input == null ? year : this.add(input - year, "y")
		},
		week : function (input) {
			var week = this.localeData().week(this);
			return input == null ? week : this.add((input - week) * 7, "d")
		},
		isoWeek : function (input) {
			var week = weekOfYear(this, 1, 4).week;
			return input == null ? week : this.add((input - week) * 7, "d")
		},
		weekday : function (input) {
			var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
			return input == null ? weekday : this.add(input - weekday, "d")
		},
		isoWeekday : function (input) {
			return input == null ? this.day() || 7 : this.day(this.day() % 7 ? input : input - 7)
		},
		isoWeeksInYear : function () {
			return weeksInYear(this.year(), 1, 4)
		},
		weeksInYear : function () {
			var weekInfo = this.localeData()._week;
			return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy)
		},
		get : function (units) {
			units = normalizeUnits(units);
			return this[units]()
		},
		set : function (units, value) {
			units = normalizeUnits(units);
			if (typeof this[units] === "function") {
				this[units](value)
			}
			return this
		},
		locale : function (key) {
			var newLocaleData;
			if (key === undefined) {
				return this._locale._abbr
			} else {
				newLocaleData = moment.localeData(key);
				if (newLocaleData != null) {
					this._locale = newLocaleData
				}
				return this
			}
		},
		lang : deprecate("moment().lang() is deprecated. Use moment().localeData() instead.", function (key) {
			if (key === undefined) {
				return this.localeData()
			} else {
				return this.locale(key)
			}
		}),
		localeData : function () {
			return this._locale
		},
		_dateTzOffset : function () {
			return Math.round(this._d.getTimezoneOffset() / 15) * 15
		}
	});
	function rawMonthSetter(mom, value) {
		var dayOfMonth;
		if (typeof value === "string") {
			value = mom.localeData().monthsParse(value);
			if (typeof value !== "number") {
				return mom
			}
		}
		dayOfMonth = Math.min(mom.date(), daysInMonth(mom.year(), value));
		mom._d["set" + (mom._isUTC ? "UTC" : "") + "Month"](value, dayOfMonth);
		return mom
	}
	function rawGetter(mom, unit) {
		return mom._d["get" + (mom._isUTC ? "UTC" : "") + unit]()
	}
	function rawSetter(mom, unit, value) {
		if (unit === "Month") {
			return rawMonthSetter(mom, value)
		} else {
			return mom._d["set" + (mom._isUTC ? "UTC" : "") + unit](value)
		}
	}
	function makeAccessor(unit, keepTime) {
		return function (value) {
			if (value != null) {
				rawSetter(this, unit, value);
				moment.updateOffset(this, keepTime);
				return this
			} else {
				return rawGetter(this, unit)
			}
		}
	}
	moment.fn.millisecond = moment.fn.milliseconds = makeAccessor("Milliseconds", false);
	moment.fn.second = moment.fn.seconds = makeAccessor("Seconds", false);
	moment.fn.minute = moment.fn.minutes = makeAccessor("Minutes", false);
	moment.fn.hour = moment.fn.hours = makeAccessor("Hours", true);
	moment.fn.date = makeAccessor("Date", true);
	moment.fn.dates = deprecate("dates accessor is deprecated. Use date instead.", makeAccessor("Date", true));
	moment.fn.year = makeAccessor("FullYear", true);
	moment.fn.years = deprecate("years accessor is deprecated. Use year instead.", makeAccessor("FullYear", true));
	moment.fn.days = moment.fn.day;
	moment.fn.months = moment.fn.month;
	moment.fn.weeks = moment.fn.week;
	moment.fn.isoWeeks = moment.fn.isoWeek;
	moment.fn.quarters = moment.fn.quarter;
	moment.fn.toJSON = moment.fn.toISOString;
	function daysToYears(days) {
		return days * 400 / 146097
	}
	function yearsToDays(years) {
		return years * 146097 / 400
	}
	extend(moment.duration.fn = Duration.prototype, {
		_bubble : function () {
			var milliseconds = this._milliseconds,
			days = this._days,
			months = this._months,
			data = this._data,
			seconds,
			minutes,
			hours,
			years = 0;
			data.milliseconds = milliseconds % 1e3;
			seconds = absRound(milliseconds / 1e3);
			data.seconds = seconds % 60;
			minutes = absRound(seconds / 60);
			data.minutes = minutes % 60;
			hours = absRound(minutes / 60);
			data.hours = hours % 24;
			days += absRound(hours / 24);
			years = absRound(daysToYears(days));
			days -= absRound(yearsToDays(years));
			months += absRound(days / 30);
			days %= 30;
			years += absRound(months / 12);
			months %= 12;
			data.days = days;
			data.months = months;
			data.years = years
		},
		abs : function () {
			this._milliseconds = Math.abs(this._milliseconds);
			this._days = Math.abs(this._days);
			this._months = Math.abs(this._months);
			this._data.milliseconds = Math.abs(this._data.milliseconds);
			this._data.seconds = Math.abs(this._data.seconds);
			this._data.minutes = Math.abs(this._data.minutes);
			this._data.hours = Math.abs(this._data.hours);
			this._data.months = Math.abs(this._data.months);
			this._data.years = Math.abs(this._data.years);
			return this
		},
		weeks : function () {
			return absRound(this.days() / 7)
		},
		valueOf : function () {
			return this._milliseconds + this._days * 864e5 + this._months % 12 * 2592e6 + toInt(this._months / 12) * 31536e6
		},
		humanize : function (withSuffix) {
			var output = relativeTime(this, !withSuffix, this.localeData());
			if (withSuffix) {
				output = this.localeData().pastFuture(+this, output)
			}
			return this.localeData().postformat(output)
		},
		add : function (input, val) {
			var dur = moment.duration(input, val);
			this._milliseconds += dur._milliseconds;
			this._days += dur._days;
			this._months += dur._months;
			this._bubble();
			return this
		},
		subtract : function (input, val) {
			var dur = moment.duration(input, val);
			this._milliseconds -= dur._milliseconds;
			this._days -= dur._days;
			this._months -= dur._months;
			this._bubble();
			return this
		},
		get : function (units) {
			units = normalizeUnits(units);
			return this[units.toLowerCase() + "s"]()
		},
		as : function (units) {
			var days,
			months;
			units = normalizeUnits(units);
			if (units === "month" || units === "year") {
				days = this._days + this._milliseconds / 864e5;
				months = this._months + daysToYears(days) * 12;
				return units === "month" ? months : months / 12
			} else {
				days = this._days + yearsToDays(this._months / 12);
				switch (units) {
				case "week":
					return days / 7 + this._milliseconds / 6048e5;
				case "day":
					return days + this._milliseconds / 864e5;
				case "hour":
					return days * 24 + this._milliseconds / 36e5;
				case "minute":
					return days * 24 * 60 + this._milliseconds / 6e4;
				case "second":
					return days * 24 * 60 * 60 + this._milliseconds / 1e3;
				case "millisecond":
					return Math.floor(days * 24 * 60 * 60 * 1e3) + this._milliseconds;
				default:
					throw new Error("Unknown unit " + units)
				}
			}
		},
		lang : moment.fn.lang,
		locale : moment.fn.locale,
		toIsoString : deprecate("toIsoString() is deprecated. Please use toISOString() instead " + "(notice the capitals)", function () {
			return this.toISOString()
		}),
		toISOString : function () {
			var years = Math.abs(this.years()),
			months = Math.abs(this.months()),
			days = Math.abs(this.days()),
			hours = Math.abs(this.hours()),
			minutes = Math.abs(this.minutes()),
			seconds = Math.abs(this.seconds() + this.milliseconds() / 1e3);
			if (!this.asSeconds()) {
				return "P0D"
			}
			return (this.asSeconds() < 0 ? "-" : "") + "P" + (years ? years + "Y" : "") + (months ? months + "M" : "") + (days ? days + "D" : "") + (hours || minutes || seconds ? "T" : "") + (hours ? hours + "H" : "") + (minutes ? minutes + "M" : "") + (seconds ? seconds + "S" : "")
		},
		localeData : function () {
			return this._locale
		}
	});
	moment.duration.fn.toString = moment.duration.fn.toISOString;
	function makeDurationGetter(name) {
		moment.duration.fn[name] = function () {
			return this._data[name]
		}
	}
	for (i in unitMillisecondFactors) {
		if (hasOwnProp(unitMillisecondFactors, i)) {
			makeDurationGetter(i.toLowerCase())
		}
	}
	moment.duration.fn.asMilliseconds = function () {
		return this.as("ms")
	};
	moment.duration.fn.asSeconds = function () {
		return this.as("s")
	};
	moment.duration.fn.asMinutes = function () {
		return this.as("m")
	};
	moment.duration.fn.asHours = function () {
		return this.as("h")
	};
	moment.duration.fn.asDays = function () {
		return this.as("d")
	};
	moment.duration.fn.asWeeks = function () {
		return this.as("weeks")
	};
	moment.duration.fn.asMonths = function () {
		return this.as("M")
	};
	moment.duration.fn.asYears = function () {
		return this.as("y")
	};
	moment.locale("en", {
		ordinal : function (number) {
			var b = number % 10,
			output = toInt(number % 100 / 10) === 1 ? "th" : b === 1 ? "st" : b === 2 ? "nd" : b === 3 ? "rd" : "th";
			return number + output
		}
	});
	function makeGlobal(shouldDeprecate) {
		if (typeof ender !== "undefined") {
			return
		}
		oldGlobalMoment = globalScope.moment;
		if (shouldDeprecate) {
			globalScope.moment = deprecate("Accessing Moment through the global scope is " + "deprecated, and will be removed in an upcoming " + "release.", moment)
		} else {
			globalScope.moment = moment
		}
	}
	if (hasModule) {
		module.exports = moment
	} else if (typeof define === "function" && define.amd) {
		define("moment", function (require, exports, module) {
			if (module.config && module.config() && module.config().noGlobal === true) {
				globalScope.moment = oldGlobalMoment
			}
			return moment
		});
		makeGlobal(true)
	} else {
		makeGlobal()
	}
}).call(this);
(function (e, t) {
	var n,
	r,
	i = typeof t,
	o = e.location,
	a = e.document,
	s = a.documentElement,
	l = e.jQuery,
	u = e.$,
	c = {},
	p = [],
	f = "1.10.1",
	d = p.concat,
	h = p.push,
	g = p.slice,
	m = p.indexOf,
	y = c.toString,
	v = c.hasOwnProperty,
	b = f.trim,
	x = function (e, t) {
		return new x.fn.init(e, t, r)
	},
	w = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,
	T = /\S+/g,
	C = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,
	N = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,
	k = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
	E = /^[\],:{}\s]*$/,
	S = /(?:^|:|,)(?:\s*\[)+/g,
	A = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g,
	j = /"[^"\\\r\n]*"|true|false|null|-?(?:\d+\.|)\d+(?:[eE][+-]?\d+|)/g,
	D = /^-ms-/,
	L = /-([\da-z])/gi,
	H = function (e, t) {
		return t.toUpperCase()
	},
	q = function (e) {
		(a.addEventListener || "load" === e.type || "complete" === a.readyState) && (_(), x.ready())
	},
	_ = function () {
		a.addEventListener ? (a.removeEventListener("DOMContentLoaded", q, !1), e.removeEventListener("load", q, !1)) : (a.detachEvent("onreadystatechange", q), e.detachEvent("onload", q))
	};
	x.fn = x.prototype = {
		jquery : f,
		constructor : x,
		init : function (e, n, r) {
			var i,
			o;
			if (!e)
				return this;
			if ("string" == typeof e) {
				if (i = "<" === e.charAt(0) && ">" === e.charAt(e.length - 1) && e.length >= 3 ? [null, e, null] : N.exec(e), !i || !i[1] && n)
					return !n || n.jquery ? (n || r).find(e) : this.constructor(n).find(e);
				if (i[1]) {
					if (n = n instanceof x ? n[0] : n, x.merge(this, x.parseHTML(i[1], n && n.nodeType ? n.ownerDocument || n : a, !0)), k.test(i[1]) && x.isPlainObject(n))
						for (i in n)
							x.isFunction(this[i]) ? this[i](n[i]) : this.attr(i, n[i]);
					return this
				}
				if (o = a.getElementById(i[2]), o && o.parentNode) {
					if (o.id !== i[2])
						return r.find(e);
					this.length = 1,
					this[0] = o
				}
				return this.context = a,
				this.selector = e,
				this
			}
			return e.nodeType ? (this.context = this[0] = e, this.length = 1, this) : x.isFunction(e) ? r.ready(e) : (e.selector !== t && (this.selector = e.selector, this.context = e.context), x.makeArray(e, this))
		},
		selector : "",
		length : 0,
		toArray : function () {
			return g.call(this)
		},
		get : function (e) {
			return null == e ? this.toArray() : 0 > e ? this[this.length + e] : this[e]
		},
		pushStack : function (e) {
			var t = x.merge(this.constructor(), e);
			return t.prevObject = this,
			t.context = this.context,
			t
		},
		each : function (e, t) {
			return x.each(this, e, t)
		},
		ready : function (e) {
			return x.ready.promise().done(e),
			this
		},
		slice : function () {
			return this.pushStack(g.apply(this, arguments))
		},
		first : function () {
			return this.eq(0)
		},
		last : function () {
			return this.eq(-1)
		},
		eq : function (e) {
			var t = this.length,
			n = +e + (0 > e ? t : 0);
			return this.pushStack(n >= 0 && t > n ? [this[n]] : [])
		},
		map : function (e) {
			return this.pushStack(x.map(this, function (t, n) {
					return e.call(t, n, t)
				}))
		},
		end : function () {
			return this.prevObject || this.constructor(null)
		},
		push : h,
		sort : [].sort,
		splice : [].splice
	},
	x.fn.init.prototype = x.fn,
	x.extend = x.fn.extend = function () {
		var e,
		n,
		r,
		i,
		o,
		a,
		s = arguments[0] || {},
		l = 1,
		u = arguments.length,
		c = !1;
		for ("boolean" == typeof s && (c = s, s = arguments[1] || {}, l = 2), "object" == typeof s || x.isFunction(s) || (s = {}), u === l && (s = this, --l); u > l; l++)
			if (null != (o = arguments[l]))
				for (i in o)
					e = s[i], r = o[i], s !== r && (c && r && (x.isPlainObject(r) || (n = x.isArray(r))) ? (n ? (n = !1, a = e && x.isArray(e) ? e : []) : a = e && x.isPlainObject(e) ? e : {}, s[i] = x.extend(c, a, r)) : r !== t && (s[i] = r));
		return s
	},
	x.extend({
		expando : "jQuery" + (f + Math.random()).replace(/\D/g, ""),
		noConflict : function (t) {
			return e.$ === x && (e.$ = u),
			t && e.jQuery === x && (e.jQuery = l),
			x
		},
		isReady : !1,
		readyWait : 1,
		holdReady : function (e) {
			e ? x.readyWait++ : x.ready(!0)
		},
		ready : function (e) {
			if (e === !0 ? !--x.readyWait : !x.isReady) {
				if (!a.body)
					return setTimeout(x.ready);
				x.isReady = !0,
				e !== !0 && --x.readyWait > 0 || (n.resolveWith(a, [x]), x.fn.trigger && x(a).trigger("ready").off("ready"))
			}
		},
		isFunction : function (e) {
			return "function" === x.type(e)
		},
		isArray : Array.isArray || function (e) {
			return "array" === x.type(e)
		},
		isWindow : function (e) {
			return null != e && e == e.window
		},
		isNumeric : function (e) {
			return !isNaN(parseFloat(e)) && isFinite(e)
		},
		type : function (e) {
			return null == e ? e + "" : "object" == typeof e || "function" == typeof e ? c[y.call(e)] || "object" : typeof e
		},
		isPlainObject : function (e) {
			var n;
			if (!e || "object" !== x.type(e) || e.nodeType || x.isWindow(e))
				return !1;
			try {
				if (e.constructor && !v.call(e, "constructor") && !v.call(e.constructor.prototype, "isPrototypeOf"))
					return !1
			} catch (r) {
				return !1
			}
			if (x.support.ownLast)
				for (n in e)
					return v.call(e, n);
			for (n in e);
			return n === t || v.call(e, n)
		},
		isEmptyObject : function (e) {
			var t;
			for (t in e)
				return !1;
			return !0
		},
		error : function (e) {
			throw Error(e)
		},
		parseHTML : function (e, t, n) {
			if (!e || "string" != typeof e)
				return null;
			"boolean" == typeof t && (n = t, t = !1),
			t = t || a;
			var r = k.exec(e),
			i = !n && [];
			return r ? [t.createElement(r[1])] : (r = x.buildFragment([e], t, i), i && x(i).remove(), x.merge([], r.childNodes))
		},
		parseJSON : function (n) {
			return e.JSON && e.JSON.parse ? e.JSON.parse(n) : null === n ? n : "string" == typeof n && (n = x.trim(n), n && E.test(n.replace(A, "@").replace(j, "]").replace(S, ""))) ? Function("return " + n)() : (x.error("Invalid JSON: " + n), t)
		},
		parseXML : function (n) {
			var r,
			i;
			if (!n || "string" != typeof n)
				return null;
			try {
				e.DOMParser ? (i = new DOMParser, r = i.parseFromString(n, "text/xml")) : (r = new ActiveXObject("Microsoft.XMLDOM"), r.async = "false", r.loadXML(n))
			} catch (o) {
				r = t
			}
			return r && r.documentElement && !r.getElementsByTagName("parsererror").length || x.error("Invalid XML: " + n),
			r
		},
		noop : function () {},
		globalEval : function (t) {
			t && x.trim(t) && (e.execScript || function (t) {
				e.eval.call(e, t)
			})(t)
		},
		camelCase : function (e) {
			return e.replace(D, "ms-").replace(L, H)
		},
		nodeName : function (e, t) {
			return e.nodeName && e.nodeName.toLowerCase() === t.toLowerCase()
		},
		each : function (e, t, n) {
			var r,
			i = 0,
			o = e.length,
			a = M(e);
			if (n) {
				if (a) {
					for (; o > i; i++)
						if (r = t.apply(e[i], n), r === !1)
							break
				} else
					for (i in e)
						if (r = t.apply(e[i], n), r === !1)
							break
			} else if (a) {
				for (; o > i; i++)
					if (r = t.call(e[i], i, e[i]), r === !1)
						break
			} else
				for (i in e)
					if (r = t.call(e[i], i, e[i]), r === !1)
						break;
			return e
		},
		trim : b && !b.call("﻿ ") ? function (e) {
			return null == e ? "" : b.call(e)
		}
		 : function (e) {
			return null == e ? "" : (e + "").replace(C, "")
		},
		makeArray : function (e, t) {
			var n = t || [];
			return null != e && (M(Object(e)) ? x.merge(n, "string" == typeof e ? [e] : e) : h.call(n, e)),
			n
		},
		inArray : function (e, t, n) {
			var r;
			if (t) {
				if (m)
					return m.call(t, e, n);
				for (r = t.length, n = n ? 0 > n ? Math.max(0, r + n) : n : 0; r > n; n++)
					if (n in t && t[n] === e)
						return n
			}
			return -1
		},
		merge : function (e, n) {
			var r = n.length,
			i = e.length,
			o = 0;
			if ("number" == typeof r)
				for (; r > o; o++)
					e[i++] = n[o];
			else
				while (n[o] !== t)
					e[i++] = n[o++];
			return e.length = i,
			e
		},
		grep : function (e, t, n) {
			var r,
			i = [],
			o = 0,
			a = e.length;
			for (n = !!n; a > o; o++)
				r = !!t(e[o], o), n !== r && i.push(e[o]);
			return i
		},
		map : function (e, t, n) {
			var r,
			i = 0,
			o = e.length,
			a = M(e),
			s = [];
			if (a)
				for (; o > i; i++)
					r = t(e[i], i, n), null != r && (s[s.length] = r);
			else
				for (i in e)
					r = t(e[i], i, n), null != r && (s[s.length] = r);
			return d.apply([], s)
		},
		guid : 1,
		proxy : function (e, n) {
			var r,
			i,
			o;
			return "string" == typeof n && (o = e[n], n = e, e = o),
			x.isFunction(e) ? (r = g.call(arguments, 2), i = function () {
				return e.apply(n || this, r.concat(g.call(arguments)))
			}, i.guid = e.guid = e.guid || x.guid++, i) : t
		},
		access : function (e, n, r, i, o, a, s) {
			var l = 0,
			u = e.length,
			c = null == r;
			if ("object" === x.type(r)) {
				o = !0;
				for (l in r)
					x.access(e, n, l, r[l], !0, a, s)
			} else if (i !== t && (o = !0, x.isFunction(i) || (s = !0), c && (s ? (n.call(e, i), n = null) : (c = n, n = function (e, t, n) {
							return c.call(x(e), n)
						})), n))
				for (; u > l; l++)
					n(e[l], r, s ? i : i.call(e[l], l, n(e[l], r)));
			return o ? e : c ? n.call(e) : u ? n(e[0], r) : a
		},
		now : function () {
			return (new Date).getTime()
		},
		swap : function (e, t, n, r) {
			var i,
			o,
			a = {};
			for (o in t)
				a[o] = e.style[o], e.style[o] = t[o];
			i = n.apply(e, r || []);
			for (o in t)
				e.style[o] = a[o];
			return i
		}
	}),
	x.ready.promise = function (t) {
		if (!n)
			if (n = x.Deferred(), "complete" === a.readyState)
				setTimeout(x.ready);
			else if (a.addEventListener)
				a.addEventListener("DOMContentLoaded", q, !1), e.addEventListener("load", q, !1);
			else {
				a.attachEvent("onreadystatechange", q),
				e.attachEvent("onload", q);
				var r = !1;
				try {
					r = null == e.frameElement && a.documentElement
				} catch (i) {}
				r && r.doScroll && function o() {
					if (!x.isReady) {
						try {
							r.doScroll("left")
						} catch (e) {
							return setTimeout(o, 50)
						}
						_(),
						x.ready()
					}
				}
				()
			}
		return n.promise(t)
	},
	x.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function (e, t) {
		c["[object " + t + "]"] = t.toLowerCase()
	});
	function M(e) {
		var t = e.length,
		n = x.type(e);
		return x.isWindow(e) ? !1 : 1 === e.nodeType && t ? !0 : "array" === n || "function" !== n && (0 === t || "number" == typeof t && t > 0 && t - 1 in e)
	}
	r = x(a),
	function (e, t) {
		var n,
		r,
		i,
		o,
		a,
		s,
		l,
		u,
		c,
		p,
		f,
		d,
		h,
		g,
		m,
		y,
		v,
		b = "sizzle" + -new Date,
		w = e.document,
		T = 0,
		C = 0,
		N = lt(),
		k = lt(),
		E = lt(),
		S = !1,
		A = function () {
			return 0
		},
		j = typeof t,
		D = 1 << 31,
		L = {}
		.hasOwnProperty,
		H = [],
		q = H.pop,
		_ = H.push,
		M = H.push,
		O = H.slice,
		F = H.indexOf || function (e) {
			var t = 0,
			n = this.length;
			for (; n > t; t++)
				if (this[t] === e)
					return t;
			return -1
		},
		B = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",
		P = "[\\x20\\t\\r\\n\\f]",
		R = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",
		W = R.replace("w", "w#"),
		$ = "\\[" + P + "*(" + R + ")" + P + "*(?:([*^$|!~]?=)" + P + "*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|(" + W + ")|)|)" + P + "*\\]",
		I = ":(" + R + ")(?:\\(((['\"])((?:\\\\.|[^\\\\])*?)\\3|((?:\\\\.|[^\\\\()[\\]]|" + $.replace(3, 8) + ")*)|.*)\\)|)",
		z = RegExp("^" + P + "+|((?:^|[^\\\\])(?:\\\\.)*)" + P + "+$", "g"),
		X = RegExp("^" + P + "*," + P + "*"),
		U = RegExp("^" + P + "*([>+~]|" + P + ")" + P + "*"),
		V = RegExp(P + "*[+~]"),
		Y = RegExp("=" + P + "*([^\\]'\"]*)" + P + "*\\]", "g"),
		J = RegExp(I),
		G = RegExp("^" + W + "$"),
		Q = {
			ID : RegExp("^#(" + R + ")"),
			CLASS : RegExp("^\\.(" + R + ")"),
			TAG : RegExp("^(" + R.replace("w", "w*") + ")"),
			ATTR : RegExp("^" + $),
			PSEUDO : RegExp("^" + I),
			CHILD : RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + P + "*(even|odd|(([+-]|)(\\d*)n|)" + P + "*(?:([+-]|)" + P + "*(\\d+)|))" + P + "*\\)|)", "i"),
			bool : RegExp("^(?:" + B + ")$", "i"),
			needsContext : RegExp("^" + P + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + P + "*((?:-\\d)?\\d*)" + P + "*\\)|)(?=[^-]|$)", "i")
		},
		K = /^[^{]+\{\s*\[native \w/,
		Z = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,
		et = /^(?:input|select|textarea|button)$/i,
		tt = /^h\d$/i,
		nt = /'|\\/g,
		rt = RegExp("\\\\([\\da-f]{1,6}" + P + "?|(" + P + ")|.)", "ig"),
		it = function (e, t, n) {
			var r = "0x" + t - 65536;
			return r !== r || n ? t : 0 > r ? String.fromCharCode(r + 65536) : String.fromCharCode(55296 | r >> 10, 56320 | 1023 & r)
		};
		try {
			M.apply(H = O.call(w.childNodes), w.childNodes),
			H[w.childNodes.length].nodeType
		} catch (ot) {
			M = {
				apply : H.length ? function (e, t) {
					_.apply(e, O.call(t))
				}
				 : function (e, t) {
					var n = e.length,
					r = 0;
					while (e[n++] = t[r++]);
					e.length = n - 1
				}
			}
		}
		function at(e, t, n, i) {
			var o,
			a,
			s,
			l,
			u,
			c,
			d,
			m,
			y,
			x;
			if ((t ? t.ownerDocument || t : w) !== f && p(t), t = t || f, n = n || [], !e || "string" != typeof e)
				return n;
			if (1 !== (l = t.nodeType) && 9 !== l)
				return [];
			if (h && !i) {
				if (o = Z.exec(e))
					if (s = o[1]) {
						if (9 === l) {
							if (a = t.getElementById(s), !a || !a.parentNode)
								return n;
							if (a.id === s)
								return n.push(a), n
						} else if (t.ownerDocument && (a = t.ownerDocument.getElementById(s)) && v(t, a) && a.id === s)
							return n.push(a), n
					} else {
						if (o[2])
							return M.apply(n, t.getElementsByTagName(e)), n;
						if ((s = o[3]) && r.getElementsByClassName && t.getElementsByClassName)
							return M.apply(n, t.getElementsByClassName(s)), n
					}
				if (r.qsa && (!g || !g.test(e))) {
					if (m = d = b, y = t, x = 9 === l && e, 1 === l && "object" !== t.nodeName.toLowerCase()) {
						c = bt(e),
						(d = t.getAttribute("id")) ? m = d.replace(nt, "\\$&") : t.setAttribute("id", m),
						m = "[id='" + m + "'] ",
						u = c.length;
						while (u--)
							c[u] = m + xt(c[u]);
						y = V.test(e) && t.parentNode || t,
						x = c.join(",")
					}
					if (x)
						try {
							return M.apply(n, y.querySelectorAll(x)),
							n
						} catch (T) {}
					finally {
						d || t.removeAttribute("id")
					}
				}
			}
			return At(e.replace(z, "$1"), t, n, i)
		}
		function st(e) {
			return K.test(e + "")
		}
		function lt() {
			var e = [];
			function t(n, r) {
				return e.push(n += " ") > o.cacheLength && delete t[e.shift()],
				t[n] = r
			}
			return t
		}
		function ut(e) {
			return e[b] = !0,
			e
		}
		function ct(e) {
			var t = f.createElement("div");
			try {
				return !!e(t)
			} catch (n) {
				return !1
			}
			finally {
				t.parentNode && t.parentNode.removeChild(t),
				t = null
			}
		}
		function pt(e, t, n) {
			e = e.split("|");
			var r,
			i = e.length,
			a = n ? null : t;
			while (i--)
				(r = o.attrHandle[e[i]]) && r !== t || (o.attrHandle[e[i]] = a)
		}
		function ft(e, t) {
			var n = e.getAttributeNode(t);
			return n && n.specified ? n.value : e[t] === !0 ? t.toLowerCase() : null
		}
		function dt(e, t) {
			return e.getAttribute(t, "type" === t.toLowerCase() ? 1 : 2)
		}
		function ht(e) {
			return "input" === e.nodeName.toLowerCase() ? e.defaultValue : t
		}
		function gt(e, t) {
			var n = t && e,
			r = n && 1 === e.nodeType && 1 === t.nodeType && (~t.sourceIndex || D) - (~e.sourceIndex || D);
			if (r)
				return r;
			if (n)
				while (n = n.nextSibling)
					if (n === t)
						return -1;
			return e ? 1 : -1
		}
		function mt(e) {
			return function (t) {
				var n = t.nodeName.toLowerCase();
				return "input" === n && t.type === e
			}
		}
		function yt(e) {
			return function (t) {
				var n = t.nodeName.toLowerCase();
				return ("input" === n || "button" === n) && t.type === e
			}
		}
		function vt(e) {
			return ut(function (t) {
				return t = +t,
				ut(function (n, r) {
					var i,
					o = e([], n.length, t),
					a = o.length;
					while (a--)
						n[i = o[a]] && (n[i] = !(r[i] = n[i]))
				})
			})
		}
		s = at.isXML = function (e) {
			var t = e && (e.ownerDocument || e).documentElement;
			return t ? "HTML" !== t.nodeName : !1
		},
		r = at.support = {},
		p = at.setDocument = function (e) {
			var n = e ? e.ownerDocument || e : w,
			i = n.parentWindow;
			return n !== f && 9 === n.nodeType && n.documentElement ? (f = n, d = n.documentElement, h = !s(n), i && i.frameElement && i.attachEvent("onbeforeunload", function () {
					p()
				}), r.attributes = ct(function (e) {
						return e.innerHTML = "<a href='#'></a>",
						pt("type|href|height|width", dt, "#" === e.firstChild.getAttribute("href")),
						pt(B, ft, null == e.getAttribute("disabled")),
						e.className = "i",
						!e.getAttribute("className")
					}), r.input = ct(function (e) {
						return e.innerHTML = "<input>",
						e.firstChild.setAttribute("value", ""),
						"" === e.firstChild.getAttribute("value")
					}), pt("value", ht, r.attributes && r.input), r.getElementsByTagName = ct(function (e) {
						return e.appendChild(n.createComment("")),
						!e.getElementsByTagName("*").length
					}), r.getElementsByClassName = ct(function (e) {
						return e.innerHTML = "<div class='a'></div><div class='a i'></div>",
						e.firstChild.className = "i",
						2 === e.getElementsByClassName("i").length
					}), r.getById = ct(function (e) {
						return d.appendChild(e).id = b,
						!n.getElementsByName || !n.getElementsByName(b).length
					}), r.getById ? (o.find.ID = function (e, t) {
					if (typeof t.getElementById !== j && h) {
						var n = t.getElementById(e);
						return n && n.parentNode ? [n] : []
					}
				}, o.filter.ID = function (e) {
					var t = e.replace(rt, it);
					return function (e) {
						return e.getAttribute("id") === t
					}
				}) : (delete o.find.ID, o.filter.ID = function (e) {
					var t = e.replace(rt, it);
					return function (e) {
						var n = typeof e.getAttributeNode !== j && e.getAttributeNode("id");
						return n && n.value === t
					}
				}), o.find.TAG = r.getElementsByTagName ? function (e, n) {
				return typeof n.getElementsByTagName !== j ? n.getElementsByTagName(e) : t
			}
				 : function (e, t) {
				var n,
				r = [],
				i = 0,
				o = t.getElementsByTagName(e);
				if ("*" === e) {
					while (n = o[i++])
						1 === n.nodeType && r.push(n);
					return r
				}
				return o
			}, o.find.CLASS = r.getElementsByClassName && function (e, n) {
				return typeof n.getElementsByClassName !== j && h ? n.getElementsByClassName(e) : t
			}, m = [], g = [], (r.qsa = st(n.querySelectorAll)) && (ct(function (e) {
						e.innerHTML = "<select><option selected=''></option></select>",
						e.querySelectorAll("[selected]").length || g.push("\\[" + P + "*(?:value|" + B + ")"),
						e.querySelectorAll(":checked").length || g.push(":checked")
					}), ct(function (e) {
						var t = n.createElement("input");
						t.setAttribute("type", "hidden"),
						e.appendChild(t).setAttribute("t", ""),
						e.querySelectorAll("[t^='']").length && g.push("[*^$]=" + P + "*(?:''|\"\")"),
						e.querySelectorAll(":enabled").length || g.push(":enabled", ":disabled"),
						e.querySelectorAll("*,:x"),
						g.push(",.*:")
					})), (r.matchesSelector = st(y = d.webkitMatchesSelector || d.mozMatchesSelector || d.oMatchesSelector || d.msMatchesSelector)) && ct(function (e) {
					r.disconnectedMatch = y.call(e, "div"),
					y.call(e, "[s!='']:x"),
					m.push("!=", I)
				}), g = g.length && RegExp(g.join("|")), m = m.length && RegExp(m.join("|")), v = st(d.contains) || d.compareDocumentPosition ? function (e, t) {
				var n = 9 === e.nodeType ? e.documentElement : e,
				r = t && t.parentNode;
				return e === r || !(!r || 1 !== r.nodeType || !(n.contains ? n.contains(r) : e.compareDocumentPosition && 16 & e.compareDocumentPosition(r)))
			}
				 : function (e, t) {
				if (t)
					while (t = t.parentNode)
						if (t === e)
							return !0;
				return !1
			}, r.sortDetached = ct(function (e) {
						return 1 & e.compareDocumentPosition(n.createElement("div"))
					}), A = d.compareDocumentPosition ? function (e, t) {
				if (e === t)
					return S = !0, 0;
				var i = t.compareDocumentPosition && e.compareDocumentPosition && e.compareDocumentPosition(t);
				return i ? 1 & i || !r.sortDetached && t.compareDocumentPosition(e) === i ? e === n || v(w, e) ? -1 : t === n || v(w, t) ? 1 : c ? F.call(c, e) - F.call(c, t) : 0 : 4 & i ? -1 : 1 : e.compareDocumentPosition ? -1 : 1
			}
				 : function (e, t) {
				var r,
				i = 0,
				o = e.parentNode,
				a = t.parentNode,
				s = [e],
				l = [t];
				if (e === t)
					return S = !0, 0;
				if (!o || !a)
					return e === n ? -1 : t === n ? 1 : o ? -1 : a ? 1 : c ? F.call(c, e) - F.call(c, t) : 0;
				if (o === a)
					return gt(e, t);
				r = e;
				while (r = r.parentNode)
					s.unshift(r);
				r = t;
				while (r = r.parentNode)
					l.unshift(r);
				while (s[i] === l[i])
					i++;
				return i ? gt(s[i], l[i]) : s[i] === w ? -1 : l[i] === w ? 1 : 0
			}, n) : f
		},
		at.matches = function (e, t) {
			return at(e, null, null, t)
		},
		at.matchesSelector = function (e, t) {
			if ((e.ownerDocument || e) !== f && p(e), t = t.replace(Y, "='$1']"), !(!r.matchesSelector || !h || m && m.test(t) || g && g.test(t)))
				try {
					var n = y.call(e, t);
					if (n || r.disconnectedMatch || e.document && 11 !== e.document.nodeType)
						return n
				} catch (i) {}
			return at(t, f, null, [e]).length > 0
		},
		at.contains = function (e, t) {
			return (e.ownerDocument || e) !== f && p(e),
			v(e, t)
		},
		at.attr = function (e, n) {
			(e.ownerDocument || e) !== f && p(e);
			var i = o.attrHandle[n.toLowerCase()],
			a = i && L.call(o.attrHandle, n.toLowerCase()) ? i(e, n, !h) : t;
			return a === t ? r.attributes || !h ? e.getAttribute(n) : (a = e.getAttributeNode(n)) && a.specified ? a.value : null : a
		},
		at.error = function (e) {
			throw Error("Syntax error, unrecognized expression: " + e)
		},
		at.uniqueSort = function (e) {
			var t,
			n = [],
			i = 0,
			o = 0;
			if (S = !r.detectDuplicates, c = !r.sortStable && e.slice(0), e.sort(A), S) {
				while (t = e[o++])
					t === e[o] && (i = n.push(o));
				while (i--)
					e.splice(n[i], 1)
			}
			return e
		},
		a = at.getText = function (e) {
			var t,
			n = "",
			r = 0,
			i = e.nodeType;
			if (i) {
				if (1 === i || 9 === i || 11 === i) {
					if ("string" == typeof e.textContent)
						return e.textContent;
					for (e = e.firstChild; e; e = e.nextSibling)
						n += a(e)
				} else if (3 === i || 4 === i)
					return e.nodeValue
			} else
				for (; t = e[r]; r++)
					n += a(t);
			return n
		},
		o = at.selectors = {
			cacheLength : 50,
			createPseudo : ut,
			match : Q,
			attrHandle : {},
			find : {},
			relative : {
				">" : {
					dir : "parentNode",
					first : !0
				},
				" " : {
					dir : "parentNode"
				},
				"+" : {
					dir : "previousSibling",
					first : !0
				},
				"~" : {
					dir : "previousSibling"
				}
			},
			preFilter : {
				ATTR : function (e) {
					return e[1] = e[1].replace(rt, it),
					e[3] = (e[4] || e[5] || "").replace(rt, it),
					"~=" === e[2] && (e[3] = " " + e[3] + " "),
					e.slice(0, 4)
				},
				CHILD : function (e) {
					return e[1] = e[1].toLowerCase(),
					"nth" === e[1].slice(0, 3) ? (e[3] || at.error(e[0]), e[4] =  + (e[4] ? e[5] + (e[6] || 1) : 2 * ("even" === e[3] || "odd" === e[3])), e[5] =  + (e[7] + e[8] || "odd" === e[3])) : e[3] && at.error(e[0]),
					e
				},
				PSEUDO : function (e) {
					var n,
					r = !e[5] && e[2];
					return Q.CHILD.test(e[0]) ? null : (e[3] && e[4] !== t ? e[2] = e[4] : r && J.test(r) && (n = bt(r, !0)) && (n = r.indexOf(")", r.length - n) - r.length) && (e[0] = e[0].slice(0, n), e[2] = r.slice(0, n)), e.slice(0, 3))
				}
			},
			filter : {
				TAG : function (e) {
					var t = e.replace(rt, it).toLowerCase();
					return "*" === e ? function () {
						return !0
					}
					 : function (e) {
						return e.nodeName && e.nodeName.toLowerCase() === t
					}
				},
				CLASS : function (e) {
					var t = N[e + " "];
					return t || (t = RegExp("(^|" + P + ")" + e + "(" + P + "|$)")) && N(e, function (e) {
						return t.test("string" == typeof e.className && e.className || typeof e.getAttribute !== j && e.getAttribute("class") || "")
					})
				},
				ATTR : function (e, t, n) {
					return function (r) {
						var i = at.attr(r, e);
						return null == i ? "!=" === t : t ? (i += "", "=" === t ? i === n : "!=" === t ? i !== n : "^=" === t ? n && 0 === i.indexOf(n) : "*=" === t ? n && i.indexOf(n) > -1 : "$=" === t ? n && i.slice(-n.length) === n : "~=" === t ? (" " + i + " ").indexOf(n) > -1 : "|=" === t ? i === n || i.slice(0, n.length + 1) === n + "-" : !1) : !0
					}
				},
				CHILD : function (e, t, n, r, i) {
					var o = "nth" !== e.slice(0, 3),
					a = "last" !== e.slice(-4),
					s = "of-type" === t;
					return 1 === r && 0 === i ? function (e) {
						return !!e.parentNode
					}
					 : function (t, n, l) {
						var u,
						c,
						p,
						f,
						d,
						h,
						g = o !== a ? "nextSibling" : "previousSibling",
						m = t.parentNode,
						y = s && t.nodeName.toLowerCase(),
						v = !l && !s;
						if (m) {
							if (o) {
								while (g) {
									p = t;
									while (p = p[g])
										if (s ? p.nodeName.toLowerCase() === y : 1 === p.nodeType)
											return !1;
									h = g = "only" === e && !h && "nextSibling"
								}
								return !0
							}
							if (h = [a ? m.firstChild : m.lastChild], a && v) {
								c = m[b] || (m[b] = {}),
								u = c[e] || [],
								d = u[0] === T && u[1],
								f = u[0] === T && u[2],
								p = d && m.childNodes[d];
								while (p = ++d && p && p[g] || (f = d = 0) || h.pop())
									if (1 === p.nodeType && ++f && p === t) {
										c[e] = [T, d, f];
										break
									}
							} else if (v && (u = (t[b] || (t[b] = {}))[e]) && u[0] === T)
								f = u[1];
							else
								while (p = ++d && p && p[g] || (f = d = 0) || h.pop())
									if ((s ? p.nodeName.toLowerCase() === y : 1 === p.nodeType) && ++f && (v && ((p[b] || (p[b] = {}))[e] = [T, f]), p === t))
										break;
							return f -= i,
							f === r || 0 === f % r && f / r >= 0
						}
					}
				},
				PSEUDO : function (e, t) {
					var n,
					r = o.pseudos[e] || o.setFilters[e.toLowerCase()] || at.error("unsupported pseudo: " + e);
					return r[b] ? r(t) : r.length > 1 ? (n = [e, e, "", t], o.setFilters.hasOwnProperty(e.toLowerCase()) ? ut(function (e, n) {
							var i,
							o = r(e, t),
							a = o.length;
							while (a--)
								i = F.call(e, o[a]), e[i] = !(n[i] = o[a])
						}) : function (e) {
						return r(e, 0, n)
					}) : r
				}
			},
			pseudos : {
				not : ut(function (e) {
					var t = [],
					n = [],
					r = l(e.replace(z, "$1"));
					return r[b] ? ut(function (e, t, n, i) {
						var o,
						a = r(e, null, i, []),
						s = e.length;
						while (s--)
							(o = a[s]) && (e[s] = !(t[s] = o))
					}) : function (e, i, o) {
						return t[0] = e,
						r(t, null, o, n),
						!n.pop()
					}
				}),
				has : ut(function (e) {
					return function (t) {
						return at(e, t).length > 0
					}
				}),
				contains : ut(function (e) {
					return function (t) {
						return (t.textContent || t.innerText || a(t)).indexOf(e) > -1
					}
				}),
				lang : ut(function (e) {
					return G.test(e || "") || at.error("unsupported lang: " + e),
					e = e.replace(rt, it).toLowerCase(),
					function (t) {
						var n;
						do
							if (n = h ? t.lang : t.getAttribute("xml:lang") || t.getAttribute("lang"))
								return n = n.toLowerCase(), n === e || 0 === n.indexOf(e + "-");
						while ((t = t.parentNode) && 1 === t.nodeType);
						return !1
					}
				}),
				target : function (t) {
					var n = e.location && e.location.hash;
					return n && n.slice(1) === t.id
				},
				root : function (e) {
					return e === d
				},
				focus : function (e) {
					return e === f.activeElement && (!f.hasFocus || f.hasFocus()) && !!(e.type || e.href || ~e.tabIndex)
				},
				enabled : function (e) {
					return e.disabled === !1
				},
				disabled : function (e) {
					return e.disabled === !0
				},
				checked : function (e) {
					var t = e.nodeName.toLowerCase();
					return "input" === t && !!e.checked || "option" === t && !!e.selected
				},
				selected : function (e) {
					return e.parentNode && e.parentNode.selectedIndex,
					e.selected === !0
				},
				empty : function (e) {
					for (e = e.firstChild; e; e = e.nextSibling)
						if (e.nodeName > "@" || 3 === e.nodeType || 4 === e.nodeType)
							return !1;
					return !0
				},
				parent : function (e) {
					return !o.pseudos.empty(e)
				},
				header : function (e) {
					return tt.test(e.nodeName)
				},
				input : function (e) {
					return et.test(e.nodeName)
				},
				button : function (e) {
					var t = e.nodeName.toLowerCase();
					return "input" === t && "button" === e.type || "button" === t
				},
				text : function (e) {
					var t;
					return "input" === e.nodeName.toLowerCase() && "text" === e.type && (null == (t = e.getAttribute("type")) || t.toLowerCase() === e.type)
				},
				first : vt(function () {
					return [0]
				}),
				last : vt(function (e, t) {
					return [t - 1]
				}),
				eq : vt(function (e, t, n) {
					return [0 > n ? n + t : n]
				}),
				even : vt(function (e, t) {
					var n = 0;
					for (; t > n; n += 2)
						e.push(n);
					return e
				}),
				odd : vt(function (e, t) {
					var n = 1;
					for (; t > n; n += 2)
						e.push(n);
					return e
				}),
				lt : vt(function (e, t, n) {
					var r = 0 > n ? n + t : n;
					for (; --r >= 0; )
						e.push(r);
					return e
				}),
				gt : vt(function (e, t, n) {
					var r = 0 > n ? n + t : n;
					for (; t > ++r; )
						e.push(r);
					return e
				})
			}
		};
		for (n in {
			radio : !0,
			checkbox : !0,
			file : !0,
			password : !0,
			image : !0
		})
			o.pseudos[n] = mt(n);
		for (n in {
			submit : !0,
			reset : !0
		})
			o.pseudos[n] = yt(n);
		function bt(e, t) {
			var n,
			r,
			i,
			a,
			s,
			l,
			u,
			c = k[e + " "];
			if (c)
				return t ? 0 : c.slice(0);
			s = e,
			l = [],
			u = o.preFilter;
			while (s) {
				(!n || (r = X.exec(s))) && (r && (s = s.slice(r[0].length) || s), l.push(i = [])),
				n = !1,
				(r = U.exec(s)) && (n = r.shift(), i.push({
						value : n,
						type : r[0].replace(z, " ")
					}), s = s.slice(n.length));
				for (a in o.filter)
					!(r = Q[a].exec(s)) || u[a] && !(r = u[a](r)) || (n = r.shift(), i.push({
							value : n,
							type : a,
							matches : r
						}), s = s.slice(n.length));
				if (!n)
					break
			}
			return t ? s.length : s ? at.error(e) : k(e, l).slice(0)
		}
		function xt(e) {
			var t = 0,
			n = e.length,
			r = "";
			for (; n > t; t++)
				r += e[t].value;
			return r
		}
		function wt(e, t, n) {
			var r = t.dir,
			o = n && "parentNode" === r,
			a = C++;
			return t.first ? function (t, n, i) {
				while (t = t[r])
					if (1 === t.nodeType || o)
						return e(t, n, i)
			}
			 : function (t, n, s) {
				var l,
				u,
				c,
				p = T + " " + a;
				if (s) {
					while (t = t[r])
						if ((1 === t.nodeType || o) && e(t, n, s))
							return !0
				} else
					while (t = t[r])
						if (1 === t.nodeType || o)
							if (c = t[b] || (t[b] = {}), (u = c[r]) && u[0] === p) {
								if ((l = u[1]) === !0 || l === i)
									return l === !0
							} else if (u = c[r] = [p], u[1] = e(t, n, s) || i, u[1] === !0)
								return !0
			}
		}
		function Tt(e) {
			return e.length > 1 ? function (t, n, r) {
				var i = e.length;
				while (i--)
					if (!e[i](t, n, r))
						return !1;
				return !0
			}
			 : e[0]
		}
		function Ct(e, t, n, r, i) {
			var o,
			a = [],
			s = 0,
			l = e.length,
			u = null != t;
			for (; l > s; s++)
				(o = e[s]) && (!n || n(o, r, i)) && (a.push(o), u && t.push(s));
			return a
		}
		function Nt(e, t, n, r, i, o) {
			return r && !r[b] && (r = Nt(r)),
			i && !i[b] && (i = Nt(i, o)),
			ut(function (o, a, s, l) {
				var u,
				c,
				p,
				f = [],
				d = [],
				h = a.length,
				g = o || St(t || "*", s.nodeType ? [s] : s, []),
				m = !e || !o && t ? g : Ct(g, f, e, s, l),
				y = n ? i || (o ? e : h || r) ? [] : a : m;
				if (n && n(m, y, s, l), r) {
					u = Ct(y, d),
					r(u, [], s, l),
					c = u.length;
					while (c--)
						(p = u[c]) && (y[d[c]] = !(m[d[c]] = p))
				}
				if (o) {
					if (i || e) {
						if (i) {
							u = [],
							c = y.length;
							while (c--)
								(p = y[c]) && u.push(m[c] = p);
							i(null, y = [], u, l)
						}
						c = y.length;
						while (c--)
							(p = y[c]) && (u = i ? F.call(o, p) : f[c]) > -1 && (o[u] = !(a[u] = p))
					}
				} else
					y = Ct(y === a ? y.splice(h, y.length) : y), i ? i(null, a, y, l) : M.apply(a, y)
			})
		}
		function kt(e) {
			var t,
			n,
			r,
			i = e.length,
			a = o.relative[e[0].type],
			s = a || o.relative[" "],
			l = a ? 1 : 0,
			c = wt(function (e) {
					return e === t
				}, s, !0),
			p = wt(function (e) {
					return F.call(t, e) > -1
				}, s, !0),
			f = [function (e, n, r) {
					return !a && (r || n !== u) || ((t = n).nodeType ? c(e, n, r) : p(e, n, r))
				}
			];
			for (; i > l; l++)
				if (n = o.relative[e[l].type])
					f = [wt(Tt(f), n)];
				else {
					if (n = o.filter[e[l].type].apply(null, e[l].matches), n[b]) {
						for (r = ++l; i > r; r++)
							if (o.relative[e[r].type])
								break;
						return Nt(l > 1 && Tt(f), l > 1 && xt(e.slice(0, l - 1).concat({
									value : " " === e[l - 2].type ? "*" : ""
								})).replace(z, "$1"), n, r > l && kt(e.slice(l, r)), i > r && kt(e = e.slice(r)), i > r && xt(e))
					}
					f.push(n)
				}
			return Tt(f)
		}
		function Et(e, t) {
			var n = 0,
			r = t.length > 0,
			a = e.length > 0,
			s = function (s, l, c, p, d) {
				var h,
				g,
				m,
				y = [],
				v = 0,
				b = "0",
				x = s && [],
				w = null != d,
				C = u,
				N = s || a && o.find.TAG("*", d && l.parentNode || l),
				k = T += null == C ? 1 : Math.random() || .1;
				for (w && (u = l !== f && l, i = n); null != (h = N[b]); b++) {
					if (a && h) {
						g = 0;
						while (m = e[g++])
							if (m(h, l, c)) {
								p.push(h);
								break
							}
						w && (T = k, i = ++n)
					}
					r && ((h = !m && h) && v--, s && x.push(h))
				}
				if (v += b, r && b !== v) {
					g = 0;
					while (m = t[g++])
						m(x, y, l, c);
					if (s) {
						if (v > 0)
							while (b--)
								x[b] || y[b] || (y[b] = q.call(p));
						y = Ct(y)
					}
					M.apply(p, y),
					w && !s && y.length > 0 && v + t.length > 1 && at.uniqueSort(p)
				}
				return w && (T = k, u = C),
				x
			};
			return r ? ut(s) : s
		}
		l = at.compile = function (e, t) {
			var n,
			r = [],
			i = [],
			o = E[e + " "];
			if (!o) {
				t || (t = bt(e)),
				n = t.length;
				while (n--)
					o = kt(t[n]), o[b] ? r.push(o) : i.push(o);
				o = E(e, Et(i, r))
			}
			return o
		};
		function St(e, t, n) {
			var r = 0,
			i = t.length;
			for (; i > r; r++)
				at(e, t[r], n);
			return n
		}
		function At(e, t, n, i) {
			var a,
			s,
			u,
			c,
			p,
			f = bt(e);
			if (!i && 1 === f.length) {
				if (s = f[0] = f[0].slice(0), s.length > 2 && "ID" === (u = s[0]).type && r.getById && 9 === t.nodeType && h && o.relative[s[1].type]) {
					if (t = (o.find.ID(u.matches[0].replace(rt, it), t) || [])[0], !t)
						return n;
					e = e.slice(s.shift().value.length)
				}
				a = Q.needsContext.test(e) ? 0 : s.length;
				while (a--) {
					if (u = s[a], o.relative[c = u.type])
						break;
					if ((p = o.find[c]) && (i = p(u.matches[0].replace(rt, it), V.test(s[0].type) && t.parentNode || t))) {
						if (s.splice(a, 1), e = i.length && xt(s), !e)
							return M.apply(n, i), n;
						break
					}
				}
			}
			return l(e, f)(i, t, !h, n, V.test(e)),
			n
		}
		o.pseudos.nth = o.pseudos.eq;
		function jt() {}
		jt.prototype = o.filters = o.pseudos,
		o.setFilters = new jt,
		r.sortStable = b.split("").sort(A).join("") === b,
		p(),
		[0, 0].sort(A),
		r.detectDuplicates = S,
		x.find = at,
		x.expr = at.selectors,
		x.expr[":"] = x.expr.pseudos,
		x.unique = at.uniqueSort,
		x.text = at.getText,
		x.isXMLDoc = at.isXML,
		x.contains = at.contains
	}
	(e);
	var O = {};
	function F(e) {
		var t = O[e] = {};
		return x.each(e.match(T) || [], function (e, n) {
			t[n] = !0
		}),
		t
	}
	x.Callbacks = function (e) {
		e = "string" == typeof e ? O[e] || F(e) : x.extend({}, e);
		var n,
		r,
		i,
		o,
		a,
		s,
		l = [],
		u = !e.once && [],
		c = function (t) {
			for (r = e.memory && t, i = !0, a = s || 0, s = 0, o = l.length, n = !0; l && o > a; a++)
				if (l[a].apply(t[0], t[1]) === !1 && e.stopOnFalse) {
					r = !1;
					break
				}
			n = !1,
			l && (u ? u.length && c(u.shift()) : r ? l = [] : p.disable())
		},
		p = {
			add : function () {
				if (l) {
					var t = l.length;
					(function i(t) {
						x.each(t, function (t, n) {
							var r = x.type(n);
							"function" === r ? e.unique && p.has(n) || l.push(n) : n && n.length && "string" !== r && i(n)
						})
					})(arguments),
					n ? o = l.length : r && (s = t, c(r))
				}
				return this
			},
			remove : function () {
				return l && x.each(arguments, function (e, t) {
					var r;
					while ((r = x.inArray(t, l, r)) > -1)
						l.splice(r, 1), n && (o >= r && o--, a >= r && a--)
				}),
				this
			},
			has : function (e) {
				return e ? x.inArray(e, l) > -1 : !(!l || !l.length)
			},
			empty : function () {
				return l = [],
				o = 0,
				this
			},
			disable : function () {
				return l = u = r = t,
				this
			},
			disabled : function () {
				return !l
			},
			lock : function () {
				return u = t,
				r || p.disable(),
				this
			},
			locked : function () {
				return !u
			},
			fireWith : function (e, t) {
				return t = t || [],
				t = [e, t.slice ? t.slice() : t],
				!l || i && !u || (n ? u.push(t) : c(t)),
				this
			},
			fire : function () {
				return p.fireWith(this, arguments),
				this
			},
			fired : function () {
				return !!i
			}
		};
		return p
	},
	x.extend({
		Deferred : function (e) {
			var t = [["resolve", "done", x.Callbacks("once memory"), "resolved"], ["reject", "fail", x.Callbacks("once memory"), "rejected"], ["notify", "progress", x.Callbacks("memory")]],
			n = "pending",
			r = {
				state : function () {
					return n
				},
				always : function () {
					return i.done(arguments).fail(arguments),
					this
				},
				then : function () {
					var e = arguments;
					return x.Deferred(function (n) {
						x.each(t, function (t, o) {
							var a = o[0],
							s = x.isFunction(e[t]) && e[t];
							i[o[1]](function () {
								var e = s && s.apply(this, arguments);
								e && x.isFunction(e.promise) ? e.promise().done(n.resolve).fail(n.reject).progress(n.notify) : n[a + "With"](this === r ? n.promise() : this, s ? [e] : arguments)
							})
						}),
						e = null
					}).promise()
				},
				promise : function (e) {
					return null != e ? x.extend(e, r) : r
				}
			},
			i = {};
			return r.pipe = r.then,
			x.each(t, function (e, o) {
				var a = o[2],
				s = o[3];
				r[o[1]] = a.add,
				s && a.add(function () {
					n = s
				}, t[1^e][2].disable, t[2][2].lock),
				i[o[0]] = function () {
					return i[o[0] + "With"](this === i ? r : this, arguments),
					this
				},
				i[o[0] + "With"] = a.fireWith
			}),
			r.promise(i),
			e && e.call(i, i),
			i
		},
		when : function (e) {
			var t = 0,
			n = g.call(arguments),
			r = n.length,
			i = 1 !== r || e && x.isFunction(e.promise) ? r : 0,
			o = 1 === i ? e : x.Deferred(),
			a = function (e, t, n) {
				return function (r) {
					t[e] = this,
					n[e] = arguments.length > 1 ? g.call(arguments) : r,
					n === s ? o.notifyWith(t, n) : --i || o.resolveWith(t, n)
				}
			},
			s,
			l,
			u;
			if (r > 1)
				for (s = Array(r), l = Array(r), u = Array(r); r > t; t++)
					n[t] && x.isFunction(n[t].promise) ? n[t].promise().done(a(t, u, n)).fail(o.reject).progress(a(t, l, s)) : --i;
			return i || o.resolveWith(u, n),
			o.promise()
		}
	}),
	x.support = function (t) {
		var n,
		r,
		o,
		s,
		l,
		u,
		c,
		p,
		f,
		d = a.createElement("div");
		if (d.setAttribute("className", "t"), d.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>", n = d.getElementsByTagName("*") || [], r = d.getElementsByTagName("a")[0], !r || !r.style || !n.length)
			return t;
		s = a.createElement("select"),
		u = s.appendChild(a.createElement("option")),
		o = d.getElementsByTagName("input")[0],
		r.style.cssText = "top:1px;float:left;opacity:.5",
		t.getSetAttribute = "t" !== d.className,
		t.leadingWhitespace = 3 === d.firstChild.nodeType,
		t.tbody = !d.getElementsByTagName("tbody").length,
		t.htmlSerialize = !!d.getElementsByTagName("link").length,
		t.style = /top/.test(r.getAttribute("style")),
		t.hrefNormalized = "/a" === r.getAttribute("href"),
		t.opacity = /^0.5/.test(r.style.opacity),
		t.cssFloat = !!r.style.cssFloat,
		t.checkOn = !!o.value,
		t.optSelected = u.selected,
		t.enctype = !!a.createElement("form").enctype,
		t.html5Clone = "<:nav></:nav>" !== a.createElement("nav").cloneNode(!0).outerHTML,
		t.inlineBlockNeedsLayout = !1,
		t.shrinkWrapBlocks = !1,
		t.pixelPosition = !1,
		t.deleteExpando = !0,
		t.noCloneEvent = !0,
		t.reliableMarginRight = !0,
		t.boxSizingReliable = !0,
		o.checked = !0,
		t.noCloneChecked = o.cloneNode(!0).checked,
		s.disabled = !0,
		t.optDisabled = !u.disabled;
		try {
			delete d.test
		} catch (h) {
			t.deleteExpando = !1
		}
		o = a.createElement("input"),
		o.setAttribute("value", ""),
		t.input = "" === o.getAttribute("value"),
		o.value = "t",
		o.setAttribute("type", "radio"),
		t.radioValue = "t" === o.value,
		o.setAttribute("checked", "t"),
		o.setAttribute("name", "t"),
		l = a.createDocumentFragment(),
		l.appendChild(o),
		t.appendChecked = o.checked,
		t.checkClone = l.cloneNode(!0).cloneNode(!0).lastChild.checked,
		d.attachEvent && (d.attachEvent("onclick", function () {
				t.noCloneEvent = !1
			}), d.cloneNode(!0).click());
		for (f in {
			submit : !0,
			change : !0,
			focusin : !0
		})
			d.setAttribute(c = "on" + f, "t"), t[f + "Bubbles"] = c in e || d.attributes[c].expando === !1;
		d.style.backgroundClip = "content-box",
		d.cloneNode(!0).style.backgroundClip = "",
		t.clearCloneStyle = "content-box" === d.style.backgroundClip;
		for (f in x(t))
			break;
		return t.ownLast = "0" !== f,
		x(function () {
			var n,
			r,
			o,
			s = "padding:0;margin:0;border:0;display:block;box-sizing:content-box;-moz-box-sizing:content-box;-webkit-box-sizing:content-box;",
			l = a.getElementsByTagName("body")[0];
			l && (n = a.createElement("div"), n.style.cssText = "border:0;width:0;height:0;position:absolute;top:0;left:-9999px;margin-top:1px", l.appendChild(n).appendChild(d), d.innerHTML = "<table><tr><td></td><td>t</td></tr></table>", o = d.getElementsByTagName("td"), o[0].style.cssText = "padding:0;margin:0;border:0;display:none", p = 0 === o[0].offsetHeight, o[0].style.display = "", o[1].style.display = "none", t.reliableHiddenOffsets = p && 0 === o[0].offsetHeight, d.innerHTML = "", d.style.cssText = "box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%;", x.swap(l, null != l.style.zoom ? {
					zoom : 1
				}
					 : {}, function () {
					t.boxSizing = 4 === d.offsetWidth
				}), e.getComputedStyle && (t.pixelPosition = "1%" !== (e.getComputedStyle(d, null) || {}).top, t.boxSizingReliable = "4px" === (e.getComputedStyle(d, null) || {
							width : "4px"
						}).width, r = d.appendChild(a.createElement("div")), r.style.cssText = d.style.cssText = s, r.style.marginRight = r.style.width = "0", d.style.width = "1px", t.reliableMarginRight = !parseFloat((e.getComputedStyle(r, null) || {}).marginRight)), typeof d.style.zoom !== i && (d.innerHTML = "", d.style.cssText = s + "width:1px;padding:1px;display:inline;zoom:1", t.inlineBlockNeedsLayout = 3 === d.offsetWidth, d.style.display = "block", d.innerHTML = "<div></div>", d.firstChild.style.width = "5px", t.shrinkWrapBlocks = 3 !== d.offsetWidth, t.inlineBlockNeedsLayout && (l.style.zoom = 1)), l.removeChild(n), n = d = o = r = null)
		}),
		n = s = l = u = r = o = null,
		t
	}
	({});
	var B = /(?:\{[\s\S]*\}|\[[\s\S]*\])$/,
	P = /([A-Z])/g;
	function R(e, n, r, i) {
		if (x.acceptData(e)) {
			var o,
			a,
			s = x.expando,
			l = e.nodeType,
			u = l ? x.cache : e,
			c = l ? e[s] : e[s] && s;
			if (c && u[c] && (i || u[c].data) || r !== t || "string" != typeof n)
				return c || (c = l ? e[s] = p.pop() || x.guid++ : s), u[c] || (u[c] = l ? {}
					 : {
					toJSON : x.noop
				}), ("object" == typeof n || "function" == typeof n) && (i ? u[c] = x.extend(u[c], n) : u[c].data = x.extend(u[c].data, n)), a = u[c], i || (a.data || (a.data = {}), a = a.data), r !== t && (a[x.camelCase(n)] = r), "string" == typeof n ? (o = a[n], null == o && (o = a[x.camelCase(n)])) : o = a, o
		}
	}
	function W(e, t, n) {
		if (x.acceptData(e)) {
			var r,
			i,
			o = e.nodeType,
			a = o ? x.cache : e,
			s = o ? e[x.expando] : x.expando;
			if (a[s]) {
				if (t && (r = n ? a[s] : a[s].data)) {
					x.isArray(t) ? t = t.concat(x.map(t, x.camelCase)) : t in r ? t = [t] : (t = x.camelCase(t), t = t in r ? [t] : t.split(" ")),
					i = t.length;
					while (i--)
						delete r[t[i]];
					if (n ? !I(r) : !x.isEmptyObject(r))
						return
				}
				(n || (delete a[s].data, I(a[s]))) && (o ? x.cleanData([e], !0) : x.support.deleteExpando || a != a.window ? delete a[s] : a[s] = null)
			}
		}
	}
	x.extend({
		cache : {},
		noData : {
			applet : !0,
			embed : !0,
			object : "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"
		},
		hasData : function (e) {
			return e = e.nodeType ? x.cache[e[x.expando]] : e[x.expando],
			!!e && !I(e)
		},
		data : function (e, t, n) {
			return R(e, t, n)
		},
		removeData : function (e, t) {
			return W(e, t)
		},
		_data : function (e, t, n) {
			return R(e, t, n, !0)
		},
		_removeData : function (e, t) {
			return W(e, t, !0)
		},
		acceptData : function (e) {
			if (e.nodeType && 1 !== e.nodeType && 9 !== e.nodeType)
				return !1;
			var t = e.nodeName && x.noData[e.nodeName.toLowerCase()];
			return !t || t !== !0 && e.getAttribute("classid") === t
		}
	}),
	x.fn.extend({
		data : function (e, n) {
			var r,
			i,
			o = null,
			a = 0,
			s = this[0];
			if (e === t) {
				if (this.length && (o = x.data(s), 1 === s.nodeType && !x._data(s, "parsedAttrs"))) {
					for (r = s.attributes; r.length > a; a++)
						i = r[a].name, 0 === i.indexOf("data-") && (i = x.camelCase(i.slice(5)), $(s, i, o[i]));
					x._data(s, "parsedAttrs", !0)
				}
				return o
			}
			return "object" == typeof e ? this.each(function () {
				x.data(this, e)
			}) : arguments.length > 1 ? this.each(function () {
				x.data(this, e, n)
			}) : s ? $(s, e, x.data(s, e)) : null
		},
		removeData : function (e) {
			return this.each(function () {
				x.removeData(this, e)
			})
		}
	});
	function $(e, n, r) {
		if (r === t && 1 === e.nodeType) {
			var i = "data-" + n.replace(P, "-$1").toLowerCase();
			if (r = e.getAttribute(i), "string" == typeof r) {
				try {
					r = "true" === r ? !0 : "false" === r ? !1 : "null" === r ? null : +r + "" === r ? +r : B.test(r) ? x.parseJSON(r) : r
				} catch (o) {}
				x.data(e, n, r)
			} else
				r = t
		}
		return r
	}
	function I(e) {
		var t;
		for (t in e)
			if (("data" !== t || !x.isEmptyObject(e[t])) && "toJSON" !== t)
				return !1;
		return !0
	}
	x.extend({
		queue : function (e, n, r) {
			var i;
			return e ? (n = (n || "fx") + "queue", i = x._data(e, n), r && (!i || x.isArray(r) ? i = x._data(e, n, x.makeArray(r)) : i.push(r)), i || []) : t
		},
		dequeue : function (e, t) {
			t = t || "fx";
			var n = x.queue(e, t),
			r = n.length,
			i = n.shift(),
			o = x._queueHooks(e, t),
			a = function () {
				x.dequeue(e, t)
			};
			"inprogress" === i && (i = n.shift(), r--),
			i && ("fx" === t && n.unshift("inprogress"), delete o.stop, i.call(e, a, o)),
			!r && o && o.empty.fire()
		},
		_queueHooks : function (e, t) {
			var n = t + "queueHooks";
			return x._data(e, n) || x._data(e, n, {
				empty : x.Callbacks("once memory").add(function () {
					x._removeData(e, t + "queue"),
					x._removeData(e, n)
				})
			})
		}
	}),
	x.fn.extend({
		queue : function (e, n) {
			var r = 2;
			return "string" != typeof e && (n = e, e = "fx", r--),
			r > arguments.length ? x.queue(this[0], e) : n === t ? this : this.each(function () {
				var t = x.queue(this, e, n);
				x._queueHooks(this, e),
				"fx" === e && "inprogress" !== t[0] && x.dequeue(this, e)
			})
		},
		dequeue : function (e) {
			return this.each(function () {
				x.dequeue(this, e)
			})
		},
		delay : function (e, t) {
			return e = x.fx ? x.fx.speeds[e] || e : e,
			t = t || "fx",
			this.queue(t, function (t, n) {
				var r = setTimeout(t, e);
				n.stop = function () {
					clearTimeout(r)
				}
			})
		},
		clearQueue : function (e) {
			return this.queue(e || "fx", [])
		},
		promise : function (e, n) {
			var r,
			i = 1,
			o = x.Deferred(),
			a = this,
			s = this.length,
			l = function () {
				--i || o.resolveWith(a, [a])
			};
			"string" != typeof e && (n = e, e = t),
			e = e || "fx";
			while (s--)
				r = x._data(a[s], e + "queueHooks"), r && r.empty && (i++, r.empty.add(l));
			return l(),
			o.promise(n)
		}
	});
	var z,
	X,
	U = /[\t\r\n\f]/g,
	V = /\r/g,
	Y = /^(?:input|select|textarea|button|object)$/i,
	J = /^(?:a|area)$/i,
	G = /^(?:checked|selected)$/i,
	Q = x.support.getSetAttribute,
	K = x.support.input;
	x.fn.extend({
		attr : function (e, t) {
			return x.access(this, x.attr, e, t, arguments.length > 1)
		},
		removeAttr : function (e) {
			return this.each(function () {
				x.removeAttr(this, e)
			})
		},
		prop : function (e, t) {
			return x.access(this, x.prop, e, t, arguments.length > 1)
		},
		removeProp : function (e) {
			return e = x.propFix[e] || e,
			this.each(function () {
				try {
					this[e] = t,
					delete this[e]
				} catch (n) {}
			})
		},
		addClass : function (e) {
			var t,
			n,
			r,
			i,
			o,
			a = 0,
			s = this.length,
			l = "string" == typeof e && e;
			if (x.isFunction(e))
				return this.each(function (t) {
					x(this).addClass(e.call(this, t, this.className))
				});
			if (l)
				for (t = (e || "").match(T) || []; s > a; a++)
					if (n = this[a], r = 1 === n.nodeType && (n.className ? (" " + n.className + " ").replace(U, " ") : " ")) {
						o = 0;
						while (i = t[o++])
							0 > r.indexOf(" " + i + " ") && (r += i + " ");
						n.className = x.trim(r)
					}
			return this
		},
		removeClass : function (e) {
			var t,
			n,
			r,
			i,
			o,
			a = 0,
			s = this.length,
			l = 0 === arguments.length || "string" == typeof e && e;
			if (x.isFunction(e))
				return this.each(function (t) {
					x(this).removeClass(e.call(this, t, this.className))
				});
			if (l)
				for (t = (e || "").match(T) || []; s > a; a++)
					if (n = this[a], r = 1 === n.nodeType && (n.className ? (" " + n.className + " ").replace(U, " ") : "")) {
						o = 0;
						while (i = t[o++])
							while (r.indexOf(" " + i + " ") >= 0)
								r = r.replace(" " + i + " ", " ");
						n.className = e ? x.trim(r) : ""
					}
			return this
		},
		toggleClass : function (e, t) {
			var n = typeof e,
			r = "boolean" == typeof t;
			return x.isFunction(e) ? this.each(function (n) {
				x(this).toggleClass(e.call(this, n, this.className, t), t)
			}) : this.each(function () {
				if ("string" === n) {
					var o,
					a = 0,
					s = x(this),
					l = t,
					u = e.match(T) || [];
					while (o = u[a++])
						l = r ? l : !s.hasClass(o), s[l ? "addClass" : "removeClass"](o)
				} else (n === i || "boolean" === n) && (this.className && x._data(this, "__className__", this.className), this.className = this.className || e === !1 ? "" : x._data(this, "__className__") || "")
			})
		},
		hasClass : function (e) {
			var t = " " + e + " ",
			n = 0,
			r = this.length;
			for (; r > n; n++)
				if (1 === this[n].nodeType && (" " + this[n].className + " ").replace(U, " ").indexOf(t) >= 0)
					return !0;
			return !1
		},
		val : function (e) {
			var n,
			r,
			i,
			o = this[0]; {
				if (arguments.length)
					return i = x.isFunction(e), this.each(function (n) {
						var o;
						1 === this.nodeType && (o = i ? e.call(this, n, x(this).val()) : e, null == o ? o = "" : "number" == typeof o ? o += "" : x.isArray(o) && (o = x.map(o, function (e) {
											return null == e ? "" : e + ""
										})), r = x.valHooks[this.type] || x.valHooks[this.nodeName.toLowerCase()], r && "set" in r && r.set(this, o, "value") !== t || (this.value = o))
					});
				if (o)
					return r = x.valHooks[o.type] || x.valHooks[o.nodeName.toLowerCase()], r && "get" in r && (n = r.get(o, "value")) !== t ? n : (n = o.value, "string" == typeof n ? n.replace(V, "") : null == n ? "" : n)
			}
		}
	}),
	x.extend({
		valHooks : {
			option : {
				get : function (e) {
					var t = x.find.attr(e, "value");
					return null != t ? t : e.text
				}
			},
			select : {
				get : function (e) {
					var t,
					n,
					r = e.options,
					i = e.selectedIndex,
					o = "select-one" === e.type || 0 > i,
					a = o ? null : [],
					s = o ? i + 1 : r.length,
					l = 0 > i ? s : o ? i : 0;
					for (; s > l; l++)
						if (n = r[l], !(!n.selected && l !== i || (x.support.optDisabled ? n.disabled : null !== n.getAttribute("disabled")) || n.parentNode.disabled && x.nodeName(n.parentNode, "optgroup"))) {
							if (t = x(n).val(), o)
								return t;
							a.push(t)
						}
					return a
				},
				set : function (e, t) {
					var n,
					r,
					i = e.options,
					o = x.makeArray(t),
					a = i.length;
					while (a--)
						r = i[a], (r.selected = x.inArray(x(r).val(), o) >= 0) && (n = !0);
					return n || (e.selectedIndex = -1),
					o
				}
			}
		},
		attr : function (e, n, r) {
			var o,
			a,
			s = e.nodeType;
			if (e && 3 !== s && 8 !== s && 2 !== s)
				return typeof e.getAttribute === i ? x.prop(e, n, r) : (1 === s && x.isXMLDoc(e) || (n = n.toLowerCase(), o = x.attrHooks[n] || (x.expr.match.bool.test(n) ? X : z)), r === t ? o && "get" in o && null !== (a = o.get(e, n)) ? a : (a = x.find.attr(e, n), null == a ? t : a) : null !== r ? o && "set" in o && (a = o.set(e, r, n)) !== t ? a : (e.setAttribute(n, r + ""), r) : (x.removeAttr(e, n), t))
		},
		removeAttr : function (e, t) {
			var n,
			r,
			i = 0,
			o = t && t.match(T);
			if (o && 1 === e.nodeType)
				while (n = o[i++])
					r = x.propFix[n] || n, x.expr.match.bool.test(n) ? K && Q || !G.test(n) ? e[r] = !1 : e[x.camelCase("default-" + n)] = e[r] = !1 : x.attr(e, n, ""), e.removeAttribute(Q ? n : r)
		},
		attrHooks : {
			type : {
				set : function (e, t) {
					if (!x.support.radioValue && "radio" === t && x.nodeName(e, "input")) {
						var n = e.value;
						return e.setAttribute("type", t),
						n && (e.value = n),
						t
					}
				}
			}
		},
		propFix : {
			"for" : "htmlFor",
			"class" : "className"
		},
		prop : function (e, n, r) {
			var i,
			o,
			a,
			s = e.nodeType;
			if (e && 3 !== s && 8 !== s && 2 !== s)
				return a = 1 !== s || !x.isXMLDoc(e), a && (n = x.propFix[n] || n, o = x.propHooks[n]), r !== t ? o && "set" in o && (i = o.set(e, r, n)) !== t ? i : e[n] = r : o && "get" in o && null !== (i = o.get(e, n)) ? i : e[n]
		},
		propHooks : {
			tabIndex : {
				get : function (e) {
					var t = x.find.attr(e, "tabindex");
					return t ? parseInt(t, 10) : Y.test(e.nodeName) || J.test(e.nodeName) && e.href ? 0 : -1
				}
			}
		}
	}),
	X = {
		set : function (e, t, n) {
			return t === !1 ? x.removeAttr(e, n) : K && Q || !G.test(n) ? e.setAttribute(!Q && x.propFix[n] || n, n) : e[x.camelCase("default-" + n)] = e[n] = !0,
			n
		}
	},
	x.each(x.expr.match.bool.source.match(/\w+/g), function (e, n) {
		var r = x.expr.attrHandle[n] || x.find.attr;
		x.expr.attrHandle[n] = K && Q || !G.test(n) ? function (e, n, i) {
			var o = x.expr.attrHandle[n],
			a = i ? t : (x.expr.attrHandle[n] = t) != r(e, n, i) ? n.toLowerCase() : null;
			return x.expr.attrHandle[n] = o,
			a
		}
		 : function (e, n, r) {
			return r ? t : e[x.camelCase("default-" + n)] ? n.toLowerCase() : null
		}
	}),
	K && Q || (x.attrHooks.value = {
			set : function (e, n, r) {
				return x.nodeName(e, "input") ? (e.defaultValue = n, t) : z && z.set(e, n, r)
			}
		}),
	Q || (z = {
			set : function (e, n, r) {
				var i = e.getAttributeNode(r);
				return i || e.setAttributeNode(i = e.ownerDocument.createAttribute(r)),
				i.value = n += "",
				"value" === r || n === e.getAttribute(r) ? n : t
			}
		}, x.expr.attrHandle.id = x.expr.attrHandle.name = x.expr.attrHandle.coords = function (e, n, r) {
		var i;
		return r ? t : (i = e.getAttributeNode(n)) && "" !== i.value ? i.value : null
	}, x.valHooks.button = {
			get : function (e, n) {
				var r = e.getAttributeNode(n);
				return r && r.specified ? r.value : t
			},
			set : z.set
		}, x.attrHooks.contenteditable = {
			set : function (e, t, n) {
				z.set(e, "" === t ? !1 : t, n)
			}
		}, x.each(["width", "height"], function (e, n) {
			x.attrHooks[n] = {
				set : function (e, r) {
					return "" === r ? (e.setAttribute(n, "auto"), r) : t
				}
			}
		})),
	x.support.hrefNormalized || x.each(["href", "src"], function (e, t) {
		x.propHooks[t] = {
			get : function (e) {
				return e.getAttribute(t, 4)
			}
		}
	}),
	x.support.style || (x.attrHooks.style = {
			get : function (e) {
				return e.style.cssText || t
			},
			set : function (e, t) {
				return e.style.cssText = t + ""
			}
		}),
	x.support.optSelected || (x.propHooks.selected = {
			get : function (e) {
				var t = e.parentNode;
				return t && (t.selectedIndex, t.parentNode && t.parentNode.selectedIndex),
				null
			}
		}),
	x.each(["tabIndex", "readOnly", "maxLength", "cellSpacing", "cellPadding", "rowSpan", "colSpan", "useMap", "frameBorder", "contentEditable"], function () {
		x.propFix[this.toLowerCase()] = this
	}),
	x.support.enctype || (x.propFix.enctype = "encoding"),
	x.each(["radio", "checkbox"], function () {
		x.valHooks[this] = {
			set : function (e, n) {
				return x.isArray(n) ? e.checked = x.inArray(x(e).val(), n) >= 0 : t
			}
		},
		x.support.checkOn || (x.valHooks[this].get = function (e) {
			return null === e.getAttribute("value") ? "on" : e.value
		})
	});
	var Z = /^(?:input|select|textarea)$/i,
	et = /^key/,
	tt = /^(?:mouse|contextmenu)|click/,
	nt = /^(?:focusinfocus|focusoutblur)$/,
	rt = /^([^.]*)(?:\.(.+)|)$/;
	function it() {
		return !0
	}
	function ot() {
		return !1
	}
	function at() {
		try {
			return a.activeElement
		} catch (e) {}
	}
	x.event = {
		global : {},
		add : function (e, n, r, o, a) {
			var s,
			l,
			u,
			c,
			p,
			f,
			d,
			h,
			g,
			m,
			y,
			v = x._data(e);
			if (v) {
				r.handler && (c = r, r = c.handler, a = c.selector),
				r.guid || (r.guid = x.guid++),
				(l = v.events) || (l = v.events = {}),
				(f = v.handle) || (f = v.handle = function (e) {
					return typeof x === i || e && x.event.triggered === e.type ? t : x.event.dispatch.apply(f.elem, arguments)
				}, f.elem = e),
				n = (n || "").match(T) || [""],
				u = n.length;
				while (u--)
					s = rt.exec(n[u]) || [], g = y = s[1], m = (s[2] || "").split(".").sort(), g && (p = x.event.special[g] || {}, g = (a ? p.delegateType : p.bindType) || g, p = x.event.special[g] || {}, d = x.extend({
								type : g,
								origType : y,
								data : o,
								handler : r,
								guid : r.guid,
								selector : a,
								needsContext : a && x.expr.match.needsContext.test(a),
								namespace : m.join(".")
							}, c), (h = l[g]) || (h = l[g] = [], h.delegateCount = 0, p.setup && p.setup.call(e, o, m, f) !== !1 || (e.addEventListener ? e.addEventListener(g, f, !1) : e.attachEvent && e.attachEvent("on" + g, f))), p.add && (p.add.call(e, d), d.handler.guid || (d.handler.guid = r.guid)), a ? h.splice(h.delegateCount++, 0, d) : h.push(d), x.event.global[g] = !0);
				e = null
			}
		},
		remove : function (e, t, n, r, i) {
			var o,
			a,
			s,
			l,
			u,
			c,
			p,
			f,
			d,
			h,
			g,
			m = x.hasData(e) && x._data(e);
			if (m && (c = m.events)) {
				t = (t || "").match(T) || [""],
				u = t.length;
				while (u--)
					if (s = rt.exec(t[u]) || [], d = g = s[1], h = (s[2] || "").split(".").sort(), d) {
						p = x.event.special[d] || {},
						d = (r ? p.delegateType : p.bindType) || d,
						f = c[d] || [],
						s = s[2] && RegExp("(^|\\.)" + h.join("\\.(?:.*\\.|)") + "(\\.|$)"),
						l = o = f.length;
						while (o--)
							a = f[o], !i && g !== a.origType || n && n.guid !== a.guid || s && !s.test(a.namespace) || r && r !== a.selector && ("**" !== r || !a.selector) || (f.splice(o, 1), a.selector && f.delegateCount--, p.remove && p.remove.call(e, a));
						l && !f.length && (p.teardown && p.teardown.call(e, h, m.handle) !== !1 || x.removeEvent(e, d, m.handle), delete c[d])
					} else
						for (d in c)
							x.event.remove(e, d + t[u], n, r, !0);
				x.isEmptyObject(c) && (delete m.handle, x._removeData(e, "events"))
			}
		},
		trigger : function (n, r, i, o) {
			var s,
			l,
			u,
			c,
			p,
			f,
			d,
			h = [i || a],
			g = v.call(n, "type") ? n.type : n,
			m = v.call(n, "namespace") ? n.namespace.split(".") : [];
			if (u = f = i = i || a, 3 !== i.nodeType && 8 !== i.nodeType && !nt.test(g + x.event.triggered) && (g.indexOf(".") >= 0 && (m = g.split("."), g = m.shift(), m.sort()), l = 0 > g.indexOf(":") && "on" + g, n = n[x.expando] ? n : new x.Event(g, "object" == typeof n && n), n.isTrigger = o ? 2 : 3, n.namespace = m.join("."), n.namespace_re = n.namespace ? RegExp("(^|\\.)" + m.join("\\.(?:.*\\.|)") + "(\\.|$)") : null, n.result = t, n.target || (n.target = i), r = null == r ? [n] : x.makeArray(r, [n]), p = x.event.special[g] || {}, o || !p.trigger || p.trigger.apply(i, r) !== !1)) {
				if (!o && !p.noBubble && !x.isWindow(i)) {
					for (c = p.delegateType || g, nt.test(c + g) || (u = u.parentNode); u; u = u.parentNode)
						h.push(u), f = u;
					f === (i.ownerDocument || a) && h.push(f.defaultView || f.parentWindow || e)
				}
				d = 0;
				while ((u = h[d++]) && !n.isPropagationStopped())
					n.type = d > 1 ? c : p.bindType || g, s = (x._data(u, "events") || {})[n.type] && x._data(u, "handle"), s && s.apply(u, r), s = l && u[l], s && x.acceptData(u) && s.apply && s.apply(u, r) === !1 && n.preventDefault();
				if (n.type = g, !o && !n.isDefaultPrevented() && (!p._default || p._default.apply(h.pop(), r) === !1) && x.acceptData(i) && l && i[g] && !x.isWindow(i)) {
					f = i[l],
					f && (i[l] = null),
					x.event.triggered = g;
					try {
						i[g]()
					} catch (y) {}
					x.event.triggered = t,
					f && (i[l] = f)
				}
				return n.result
			}
		},
		dispatch : function (e) {
			e = x.event.fix(e);
			var n,
			r,
			i,
			o,
			a,
			s = [],
			l = g.call(arguments),
			u = (x._data(this, "events") || {})[e.type] || [],
			c = x.event.special[e.type] || {};
			if (l[0] = e, e.delegateTarget = this, !c.preDispatch || c.preDispatch.call(this, e) !== !1) {
				s = x.event.handlers.call(this, e, u),
				n = 0;
				while ((o = s[n++]) && !e.isPropagationStopped()) {
					e.currentTarget = o.elem,
					a = 0;
					while ((i = o.handlers[a++]) && !e.isImmediatePropagationStopped())
						(!e.namespace_re || e.namespace_re.test(i.namespace)) && (e.handleObj = i, e.data = i.data, r = ((x.event.special[i.origType] || {}).handle || i.handler).apply(o.elem, l), r !== t && (e.result = r) === !1 && (e.preventDefault(), e.stopPropagation()))
				}
				return c.postDispatch && c.postDispatch.call(this, e),
				e.result
			}
		},
		handlers : function (e, n) {
			var r,
			i,
			o,
			a,
			s = [],
			l = n.delegateCount,
			u = e.target;
			if (l && u.nodeType && (!e.button || "click" !== e.type))
				for (; u != this; u = u.parentNode || this)
					if (1 === u.nodeType && (u.disabled !== !0 || "click" !== e.type)) {
						for (o = [], a = 0; l > a; a++)
							i = n[a], r = i.selector + " ", o[r] === t && (o[r] = i.needsContext ? x(r, this).index(u) >= 0 : x.find(r, this, null, [u]).length), o[r] && o.push(i);
						o.length && s.push({
							elem : u,
							handlers : o
						})
					}
			return n.length > l && s.push({
				elem : this,
				handlers : n.slice(l)
			}),
			s
		},
		fix : function (e) {
			if (e[x.expando])
				return e;
			var t,
			n,
			r,
			i = e.type,
			o = e,
			s = this.fixHooks[i];
			s || (this.fixHooks[i] = s = tt.test(i) ? this.mouseHooks : et.test(i) ? this.keyHooks : {}),
			r = s.props ? this.props.concat(s.props) : this.props,
			e = new x.Event(o),
			t = r.length;
			while (t--)
				n = r[t], e[n] = o[n];
			return e.target || (e.target = o.srcElement || a),
			3 === e.target.nodeType && (e.target = e.target.parentNode),
			e.metaKey = !!e.metaKey,
			s.filter ? s.filter(e, o) : e
		},
		props : "altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),
		fixHooks : {},
		keyHooks : {
			props : "char charCode key keyCode".split(" "),
			filter : function (e, t) {
				return null == e.which && (e.which = null != t.charCode ? t.charCode : t.keyCode),
				e
			}
		},
		mouseHooks : {
			props : "button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
			filter : function (e, n) {
				var r,
				i,
				o,
				s = n.button,
				l = n.fromElement;
				return null == e.pageX && null != n.clientX && (i = e.target.ownerDocument || a, o = i.documentElement, r = i.body, e.pageX = n.clientX + (o && o.scrollLeft || r && r.scrollLeft || 0) - (o && o.clientLeft || r && r.clientLeft || 0), e.pageY = n.clientY + (o && o.scrollTop || r && r.scrollTop || 0) - (o && o.clientTop || r && r.clientTop || 0)),
				!e.relatedTarget && l && (e.relatedTarget = l === e.target ? n.toElement : l),
				e.which || s === t || (e.which = 1 & s ? 1 : 2 & s ? 3 : 4 & s ? 2 : 0),
				e
			}
		},
		special : {
			load : {
				noBubble : !0
			},
			focus : {
				trigger : function () {
					if (this !== at() && this.focus)
						try {
							return this.focus(),
							!1
						} catch (e) {}
				},
				delegateType : "focusin"
			},
			blur : {
				trigger : function () {
					return this === at() && this.blur ? (this.blur(), !1) : t
				},
				delegateType : "focusout"
			},
			click : {
				trigger : function () {
					return x.nodeName(this, "input") && "checkbox" === this.type && this.click ? (this.click(), !1) : t
				},
				_default : function (e) {
					return x.nodeName(e.target, "a")
				}
			},
			beforeunload : {
				postDispatch : function (e) {
					e.result !== t && (e.originalEvent.returnValue = e.result)
				}
			}
		},
		simulate : function (e, t, n, r) {
			var i = x.extend(new x.Event, n, {
					type : e,
					isSimulated : !0,
					originalEvent : {}
				});
			r ? x.event.trigger(i, null, t) : x.event.dispatch.call(t, i),
			i.isDefaultPrevented() && n.preventDefault()
		}
	},
	x.removeEvent = a.removeEventListener ? function (e, t, n) {
		e.removeEventListener && e.removeEventListener(t, n, !1)
	}
	 : function (e, t, n) {
		var r = "on" + t;
		e.detachEvent && (typeof e[r] === i && (e[r] = null), e.detachEvent(r, n))
	},
	x.Event = function (e, n) {
		return this instanceof x.Event ? (e && e.type ? (this.originalEvent = e, this.type = e.type, this.isDefaultPrevented = e.defaultPrevented || e.returnValue === !1 || e.getPreventDefault && e.getPreventDefault() ? it : ot) : this.type = e, n && x.extend(this, n), this.timeStamp = e && e.timeStamp || x.now(), this[x.expando] = !0, t) : new x.Event(e, n)
	},
	x.Event.prototype = {
		isDefaultPrevented : ot,
		isPropagationStopped : ot,
		isImmediatePropagationStopped : ot,
		preventDefault : function () {
			var e = this.originalEvent;
			this.isDefaultPrevented = it,
			e && (e.preventDefault ? e.preventDefault() : e.returnValue = !1)
		},
		stopPropagation : function () {
			var e = this.originalEvent;
			this.isPropagationStopped = it,
			e && (e.stopPropagation && e.stopPropagation(), e.cancelBubble = !0)
		},
		stopImmediatePropagation : function () {
			this.isImmediatePropagationStopped = it,
			this.stopPropagation()
		}
	},
	x.each({
		mouseenter : "mouseover",
		mouseleave : "mouseout"
	}, function (e, t) {
		x.event.special[e] = {
			delegateType : t,
			bindType : t,
			handle : function (e) {
				var n,
				r = this,
				i = e.relatedTarget,
				o = e.handleObj;
				return (!i || i !== r && !x.contains(r, i)) && (e.type = o.origType, n = o.handler.apply(this, arguments), e.type = t),
				n
			}
		}
	}),
	x.support.submitBubbles || (x.event.special.submit = {
			setup : function () {
				return x.nodeName(this, "form") ? !1 : (x.event.add(this, "click._submit keypress._submit", function (e) {
						var n = e.target,
						r = x.nodeName(n, "input") || x.nodeName(n, "button") ? n.form : t;
						r && !x._data(r, "submitBubbles") && (x.event.add(r, "submit._submit", function (e) {
								e._submit_bubble = !0
							}), x._data(r, "submitBubbles", !0))
					}), t)
			},
			postDispatch : function (e) {
				e._submit_bubble && (delete e._submit_bubble, this.parentNode && !e.isTrigger && x.event.simulate("submit", this.parentNode, e, !0))
			},
			teardown : function () {
				return x.nodeName(this, "form") ? !1 : (x.event.remove(this, "._submit"), t)
			}
		}),
	x.support.changeBubbles || (x.event.special.change = {
			setup : function () {
				return Z.test(this.nodeName) ? (("checkbox" === this.type || "radio" === this.type) && (x.event.add(this, "propertychange._change", function (e) {
							"checked" === e.originalEvent.propertyName && (this._just_changed = !0)
						}), x.event.add(this, "click._change", function (e) {
							this._just_changed && !e.isTrigger && (this._just_changed = !1),
							x.event.simulate("change", this, e, !0)
						})), !1) : (x.event.add(this, "beforeactivate._change", function (e) {
						var t = e.target;
						Z.test(t.nodeName) && !x._data(t, "changeBubbles") && (x.event.add(t, "change._change", function (e) {
								!this.parentNode || e.isSimulated || e.isTrigger || x.event.simulate("change", this.parentNode, e, !0)
							}), x._data(t, "changeBubbles", !0))
					}), t)
			},
			handle : function (e) {
				var n = e.target;
				return this !== n || e.isSimulated || e.isTrigger || "radio" !== n.type && "checkbox" !== n.type ? e.handleObj.handler.apply(this, arguments) : t
			},
			teardown : function () {
				return x.event.remove(this, "._change"),
				!Z.test(this.nodeName)
			}
		}),
	x.support.focusinBubbles || x.each({
		focus : "focusin",
		blur : "focusout"
	}, function (e, t) {
		var n = 0,
		r = function (e) {
			x.event.simulate(t, e.target, x.event.fix(e), !0)
		};
		x.event.special[t] = {
			setup : function () {
				0 === n++ && a.addEventListener(e, r, !0)
			},
			teardown : function () {
				0 === --n && a.removeEventListener(e, r, !0)
			}
		}
	}),
	x.fn.extend({
		on : function (e, n, r, i, o) {
			var a,
			s;
			if ("object" == typeof e) {
				"string" != typeof n && (r = r || n, n = t);
				for (a in e)
					this.on(a, n, r, e[a], o);
				return this
			}
			if (null == r && null == i ? (i = n, r = n = t) : null == i && ("string" == typeof n ? (i = r, r = t) : (i = r, r = n, n = t)), i === !1)
				i = ot;
			else if (!i)
				return this;
			return 1 === o && (s = i, i = function (e) {
				return x().off(e),
				s.apply(this, arguments)
			}, i.guid = s.guid || (s.guid = x.guid++)),
			this.each(function () {
				x.event.add(this, e, i, r, n)
			})
		},
		one : function (e, t, n, r) {
			return this.on(e, t, n, r, 1)
		},
		off : function (e, n, r) {
			var i,
			o;
			if (e && e.preventDefault && e.handleObj)
				return i = e.handleObj, x(e.delegateTarget).off(i.namespace ? i.origType + "." + i.namespace : i.origType, i.selector, i.handler), this;
			if ("object" == typeof e) {
				for (o in e)
					this.off(o, n, e[o]);
				return this
			}
			return (n === !1 || "function" == typeof n) && (r = n, n = t),
			r === !1 && (r = ot),
			this.each(function () {
				x.event.remove(this, e, r, n)
			})
		},
		trigger : function (e, t) {
			return this.each(function () {
				x.event.trigger(e, t, this)
			})
		},
		triggerHandler : function (e, n) {
			var r = this[0];
			return r ? x.event.trigger(e, n, r, !0) : t
		}
	});
	var st = /^.[^:#\[\.,]*$/,
	lt = /^(?:parents|prev(?:Until|All))/,
	ut = x.expr.match.needsContext,
	ct = {
		children : !0,
		contents : !0,
		next : !0,
		prev : !0
	};
	x.fn.extend({
		find : function (e) {
			var t,
			n = [],
			r = this,
			i = r.length;
			if ("string" != typeof e)
				return this.pushStack(x(e).filter(function () {
						for (t = 0; i > t; t++)
							if (x.contains(r[t], this))
								return !0
					}));
			for (t = 0; i > t; t++)
				x.find(e, r[t], n);
			return n = this.pushStack(i > 1 ? x.unique(n) : n),
			n.selector = this.selector ? this.selector + " " + e : e,
			n
		},
		has : function (e) {
			var t,
			n = x(e, this),
			r = n.length;
			return this.filter(function () {
				for (t = 0; r > t; t++)
					if (x.contains(this, n[t]))
						return !0
			})
		},
		not : function (e) {
			return this.pushStack(ft(this, e || [], !0))
		},
		filter : function (e) {
			return this.pushStack(ft(this, e || [], !1))
		},
		is : function (e) {
			return !!ft(this, "string" == typeof e && ut.test(e) ? x(e) : e || [], !1).length
		},
		closest : function (e, t) {
			var n,
			r = 0,
			i = this.length,
			o = [],
			a = ut.test(e) || "string" != typeof e ? x(e, t || this.context) : 0;
			for (; i > r; r++)
				for (n = this[r]; n && n !== t; n = n.parentNode)
					if (11 > n.nodeType && (a ? a.index(n) > -1 : 1 === n.nodeType && x.find.matchesSelector(n, e))) {
						n = o.push(n);
						break
					}
			return this.pushStack(o.length > 1 ? x.unique(o) : o)
		},
		index : function (e) {
			return e ? "string" == typeof e ? x.inArray(this[0], x(e)) : x.inArray(e.jquery ? e[0] : e, this) : this[0] && this[0].parentNode ? this.first().prevAll().length : -1
		},
		add : function (e, t) {
			var n = "string" == typeof e ? x(e, t) : x.makeArray(e && e.nodeType ? [e] : e),
			r = x.merge(this.get(), n);
			return this.pushStack(x.unique(r))
		},
		addBack : function (e) {
			return this.add(null == e ? this.prevObject : this.prevObject.filter(e))
		}
	});
	function pt(e, t) {
		do
			e = e[t];
		while (e && 1 !== e.nodeType);
		return e
	}
	x.each({
		parent : function (e) {
			var t = e.parentNode;
			return t && 11 !== t.nodeType ? t : null
		},
		parents : function (e) {
			return x.dir(e, "parentNode")
		},
		parentsUntil : function (e, t, n) {
			return x.dir(e, "parentNode", n)
		},
		next : function (e) {
			return pt(e, "nextSibling")
		},
		prev : function (e) {
			return pt(e, "previousSibling")
		},
		nextAll : function (e) {
			return x.dir(e, "nextSibling")
		},
		prevAll : function (e) {
			return x.dir(e, "previousSibling")
		},
		nextUntil : function (e, t, n) {
			return x.dir(e, "nextSibling", n)
		},
		prevUntil : function (e, t, n) {
			return x.dir(e, "previousSibling", n)
		},
		siblings : function (e) {
			return x.sibling((e.parentNode || {}).firstChild, e)
		},
		children : function (e) {
			return x.sibling(e.firstChild)
		},
		contents : function (e) {
			return x.nodeName(e, "iframe") ? e.contentDocument || e.contentWindow.document : x.merge([], e.childNodes)
		}
	}, function (e, t) {
		x.fn[e] = function (n, r) {
			var i = x.map(this, t, n);
			return "Until" !== e.slice(-5) && (r = n),
			r && "string" == typeof r && (i = x.filter(r, i)),
			this.length > 1 && (ct[e] || (i = x.unique(i)), lt.test(e) && (i = i.reverse())),
			this.pushStack(i)
		}
	}),
	x.extend({
		filter : function (e, t, n) {
			var r = t[0];
			return n && (e = ":not(" + e + ")"),
			1 === t.length && 1 === r.nodeType ? x.find.matchesSelector(r, e) ? [r] : [] : x.find.matches(e, x.grep(t, function (e) {
					return 1 === e.nodeType
				}))
		},
		dir : function (e, n, r) {
			var i = [],
			o = e[n];
			while (o && 9 !== o.nodeType && (r === t || 1 !== o.nodeType || !x(o).is(r)))
				1 === o.nodeType && i.push(o), o = o[n];
			return i
		},
		sibling : function (e, t) {
			var n = [];
			for (; e; e = e.nextSibling)
				1 === e.nodeType && e !== t && n.push(e);
			return n
		}
	});
	function ft(e, t, n) {
		if (x.isFunction(t))
			return x.grep(e, function (e, r) {
				return !!t.call(e, r, e) !== n
			});
		if (t.nodeType)
			return x.grep(e, function (e) {
				return e === t !== n
			});
		if ("string" == typeof t) {
			if (st.test(t))
				return x.filter(t, e, n);
			t = x.filter(t, e)
		}
		return x.grep(e, function (e) {
			return x.inArray(e, t) >= 0 !== n
		})
	}
	function dt(e) {
		var t = ht.split("|"),
		n = e.createDocumentFragment();
		if (n.createElement)
			while (t.length)
				n.createElement(t.pop());
		return n
	}
	var ht = "abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",
	gt = / jQuery\d+="(?:null|\d+)"/g,
	mt = RegExp("<(?:" + ht + ")[\\s/>]", "i"),
	yt = /^\s+/,
	vt = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
	bt = /<([\w:]+)/,
	xt = /<tbody/i,
	wt = /<|&#?\w+;/,
	Tt = /<(?:script|style|link)/i,
	Ct = /^(?:checkbox|radio)$/i,
	Nt = /checked\s*(?:[^=]|=\s*.checked.)/i,
	kt = /^$|\/(?:java|ecma)script/i,
	Et = /^true\/(.*)/,
	St = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,
	At = {
		option : [1, "<select multiple='multiple'>", "</select>"],
		legend : [1, "<fieldset>", "</fieldset>"],
		area : [1, "<map>", "</map>"],
		param : [1, "<object>", "</object>"],
		thead : [1, "<table>", "</table>"],
		tr : [2, "<table><tbody>", "</tbody></table>"],
		col : [2, "<table><tbody></tbody><colgroup>", "</colgroup></table>"],
		td : [3, "<table><tbody><tr>", "</tr></tbody></table>"],
		_default : x.support.htmlSerialize ? [0, "", ""] : [1, "X<div>", "</div>"]
	},
	jt = dt(a),
	Dt = jt.appendChild(a.createElement("div"));
	At.optgroup = At.option,
	At.tbody = At.tfoot = At.colgroup = At.caption = At.thead,
	At.th = At.td,
	x.fn.extend({
		text : function (e) {
			return x.access(this, function (e) {
				return e === t ? x.text(this) : this.empty().append((this[0] && this[0].ownerDocument || a).createTextNode(e))
			}, null, e, arguments.length)
		},
		append : function () {
			return this.domManip(arguments, function (e) {
				if (1 === this.nodeType || 11 === this.nodeType || 9 === this.nodeType) {
					var t = Lt(this, e);
					t.appendChild(e)
				}
			})
		},
		prepend : function () {
			return this.domManip(arguments, function (e) {
				if (1 === this.nodeType || 11 === this.nodeType || 9 === this.nodeType) {
					var t = Lt(this, e);
					t.insertBefore(e, t.firstChild)
				}
			})
		},
		before : function () {
			return this.domManip(arguments, function (e) {
				this.parentNode && this.parentNode.insertBefore(e, this)
			})
		},
		after : function () {
			return this.domManip(arguments, function (e) {
				this.parentNode && this.parentNode.insertBefore(e, this.nextSibling)
			})
		},
		remove : function (e, t) {
			var n,
			r = e ? x.filter(e, this) : this,
			i = 0;
			for (; null != (n = r[i]); i++)
				t || 1 !== n.nodeType || x.cleanData(Ft(n)), n.parentNode && (t && x.contains(n.ownerDocument, n) && _t(Ft(n, "script")), n.parentNode.removeChild(n));
			return this
		},
		empty : function () {
			var e,
			t = 0;
			for (; null != (e = this[t]); t++) {
				1 === e.nodeType && x.cleanData(Ft(e, !1));
				while (e.firstChild)
					e.removeChild(e.firstChild);
				e.options && x.nodeName(e, "select") && (e.options.length = 0)
			}
			return this
		},
		clone : function (e, t) {
			return e = null == e ? !1 : e,
			t = null == t ? e : t,
			this.map(function () {
				return x.clone(this, e, t)
			})
		},
		html : function (e) {
			return x.access(this, function (e) {
				var n = this[0] || {},
				r = 0,
				i = this.length;
				if (e === t)
					return 1 === n.nodeType ? n.innerHTML.replace(gt, "") : t;
				if (!("string" != typeof e || Tt.test(e) || !x.support.htmlSerialize && mt.test(e) || !x.support.leadingWhitespace && yt.test(e) || At[(bt.exec(e) || ["", ""])[1].toLowerCase()])) {
					e = e.replace(vt, "<$1></$2>");
					try {
						for (; i > r; r++)
							n = this[r] || {},
						1 === n.nodeType && (x.cleanData(Ft(n, !1)), n.innerHTML = e);
						n = 0
					} catch (o) {}
				}
				n && this.empty().append(e)
			}, null, e, arguments.length)
		},
		replaceWith : function () {
			var e = x.map(this, function (e) {
					return [e.nextSibling, e.parentNode]
				}),
			t = 0;
			return this.domManip(arguments, function (n) {
				var r = e[t++],
				i = e[t++];
				i && (r && r.parentNode !== i && (r = this.nextSibling), x(this).remove(), i.insertBefore(n, r))
			}, !0),
			t ? this : this.remove()
		},
		detach : function (e) {
			return this.remove(e, !0)
		},
		domManip : function (e, t, n) {
			e = d.apply([], e);
			var r,
			i,
			o,
			a,
			s,
			l,
			u = 0,
			c = this.length,
			p = this,
			f = c - 1,
			h = e[0],
			g = x.isFunction(h);
			if (g || !(1 >= c || "string" != typeof h || x.support.checkClone) && Nt.test(h))
				return this.each(function (r) {
					var i = p.eq(r);
					g && (e[0] = h.call(this, r, i.html())),
					i.domManip(e, t, n)
				});
			if (c && (l = x.buildFragment(e, this[0].ownerDocument, !1, !n && this), r = l.firstChild, 1 === l.childNodes.length && (l = r), r)) {
				for (a = x.map(Ft(l, "script"), Ht), o = a.length; c > u; u++)
					i = l, u !== f && (i = x.clone(i, !0, !0), o && x.merge(a, Ft(i, "script"))), t.call(this[u], i, u);
				if (o)
					for (s = a[a.length - 1].ownerDocument, x.map(a, qt), u = 0; o > u; u++)
						i = a[u], kt.test(i.type || "") && !x._data(i, "globalEval") && x.contains(s, i) && (i.src ? x._evalUrl(i.src) : x.globalEval((i.text || i.textContent || i.innerHTML || "").replace(St, "")));
				l = r = null
			}
			return this
		}
	});
	function Lt(e, t) {
		return x.nodeName(e, "table") && x.nodeName(1 === t.nodeType ? t : t.firstChild, "tr") ? e.getElementsByTagName("tbody")[0] || e.appendChild(e.ownerDocument.createElement("tbody")) : e
	}
	function Ht(e) {
		return e.type = (null !== x.find.attr(e, "type")) + "/" + e.type,
		e
	}
	function qt(e) {
		var t = Et.exec(e.type);
		return t ? e.type = t[1] : e.removeAttribute("type"),
		e
	}
	function _t(e, t) {
		var n,
		r = 0;
		for (; null != (n = e[r]); r++)
			x._data(n, "globalEval", !t || x._data(t[r], "globalEval"))
	}
	function Mt(e, t) {
		if (1 === t.nodeType && x.hasData(e)) {
			var n,
			r,
			i,
			o = x._data(e),
			a = x._data(t, o),
			s = o.events;
			if (s) {
				delete a.handle,
				a.events = {};
				for (n in s)
					for (r = 0, i = s[n].length; i > r; r++)
						x.event.add(t, n, s[n][r])
			}
			a.data && (a.data = x.extend({}, a.data))
		}
	}
	function Ot(e, t) {
		var n,
		r,
		i;
		if (1 === t.nodeType) {
			if (n = t.nodeName.toLowerCase(), !x.support.noCloneEvent && t[x.expando]) {
				i = x._data(t);
				for (r in i.events)
					x.removeEvent(t, r, i.handle);
				t.removeAttribute(x.expando)
			}
			"script" === n && t.text !== e.text ? (Ht(t).text = e.text, qt(t)) : "object" === n ? (t.parentNode && (t.outerHTML = e.outerHTML), x.support.html5Clone && e.innerHTML && !x.trim(t.innerHTML) && (t.innerHTML = e.innerHTML)) : "input" === n && Ct.test(e.type) ? (t.defaultChecked = t.checked = e.checked, t.value !== e.value && (t.value = e.value)) : "option" === n ? t.defaultSelected = t.selected = e.defaultSelected : ("input" === n || "textarea" === n) && (t.defaultValue = e.defaultValue)
		}
	}
	x.each({
		appendTo : "append",
		prependTo : "prepend",
		insertBefore : "before",
		insertAfter : "after",
		replaceAll : "replaceWith"
	}, function (e, t) {
		x.fn[e] = function (e) {
			var n,
			r = 0,
			i = [],
			o = x(e),
			a = o.length - 1;
			for (; a >= r; r++)
				n = r === a ? this : this.clone(!0), x(o[r])[t](n), h.apply(i, n.get());
			return this.pushStack(i)
		}
	});
	function Ft(e, n) {
		var r,
		o,
		a = 0,
		s = typeof e.getElementsByTagName !== i ? e.getElementsByTagName(n || "*") : typeof e.querySelectorAll !== i ? e.querySelectorAll(n || "*") : t;
		if (!s)
			for (s = [], r = e.childNodes || e; null != (o = r[a]); a++)
				!n || x.nodeName(o, n) ? s.push(o) : x.merge(s, Ft(o, n));
		return n === t || n && x.nodeName(e, n) ? x.merge([e], s) : s
	}
	function Bt(e) {
		Ct.test(e.type) && (e.defaultChecked = e.checked)
	}
	x.extend({
		clone : function (e, t, n) {
			var r,
			i,
			o,
			a,
			s,
			l = x.contains(e.ownerDocument, e);
			if (x.support.html5Clone || x.isXMLDoc(e) || !mt.test("<" + e.nodeName + ">") ? o = e.cloneNode(!0) : (Dt.innerHTML = e.outerHTML, Dt.removeChild(o = Dt.firstChild)), !(x.support.noCloneEvent && x.support.noCloneChecked || 1 !== e.nodeType && 11 !== e.nodeType || x.isXMLDoc(e)))
				for (r = Ft(o), s = Ft(e), a = 0; null != (i = s[a]); ++a)
					r[a] && Ot(i, r[a]);
			if (t)
				if (n)
					for (s = s || Ft(e), r = r || Ft(o), a = 0; null != (i = s[a]); a++)
						Mt(i, r[a]);
				else
					Mt(e, o);
			return r = Ft(o, "script"),
			r.length > 0 && _t(r, !l && Ft(e, "script")),
			r = s = i = null,
			o
		},
		buildFragment : function (e, t, n, r) {
			var i,
			o,
			a,
			s,
			l,
			u,
			c,
			p = e.length,
			f = dt(t),
			d = [],
			h = 0;
			for (; p > h; h++)
				if (o = e[h], o || 0 === o)
					if ("object" === x.type(o))
						x.merge(d, o.nodeType ? [o] : o);
					else if (wt.test(o)) {
						s = s || f.appendChild(t.createElement("div")),
						l = (bt.exec(o) || ["", ""])[1].toLowerCase(),
						c = At[l] || At._default,
						s.innerHTML = c[1] + o.replace(vt, "<$1></$2>") + c[2],
						i = c[0];
						while (i--)
							s = s.lastChild;
						if (!x.support.leadingWhitespace && yt.test(o) && d.push(t.createTextNode(yt.exec(o)[0])), !x.support.tbody) {
							o = "table" !== l || xt.test(o) ? "<table>" !== c[1] || xt.test(o) ? 0 : s : s.firstChild,
							i = o && o.childNodes.length;
							while (i--)
								x.nodeName(u = o.childNodes[i], "tbody") && !u.childNodes.length && o.removeChild(u)
						}
						x.merge(d, s.childNodes),
						s.textContent = "";
						while (s.firstChild)
							s.removeChild(s.firstChild);
						s = f.lastChild
					} else
						d.push(t.createTextNode(o));
			s && f.removeChild(s),
			x.support.appendChecked || x.grep(Ft(d, "input"), Bt),
			h = 0;
			while (o = d[h++])
				if ((!r || -1 === x.inArray(o, r)) && (a = x.contains(o.ownerDocument, o), s = Ft(f.appendChild(o), "script"), a && _t(s), n)) {
					i = 0;
					while (o = s[i++])
						kt.test(o.type || "") && n.push(o)
				}
			return s = null,
			f
		},
		cleanData : function (e, t) {
			var n,
			r,
			o,
			a,
			s = 0,
			l = x.expando,
			u = x.cache,
			c = x.support.deleteExpando,
			f = x.event.special;
			for (; null != (n = e[s]); s++)
				if ((t || x.acceptData(n)) && (o = n[l], a = o && u[o])) {
					if (a.events)
						for (r in a.events)
							f[r] ? x.event.remove(n, r) : x.removeEvent(n, r, a.handle);
					u[o] && (delete u[o], c ? delete n[l] : typeof n.removeAttribute !== i ? n.removeAttribute(l) : n[l] = null, p.push(o))
				}
		},
		_evalUrl : function (e) {
			return x.ajax({
				url : e,
				type : "GET",
				dataType : "script",
				async : !1,
				global : !1,
				"throws" : !0
			})
		}
	}),
	x.fn.extend({
		wrapAll : function (e) {
			if (x.isFunction(e))
				return this.each(function (t) {
					x(this).wrapAll(e.call(this, t))
				});
			if (this[0]) {
				var t = x(e, this[0].ownerDocument).eq(0).clone(!0);
				this[0].parentNode && t.insertBefore(this[0]),
				t.map(function () {
					var e = this;
					while (e.firstChild && 1 === e.firstChild.nodeType)
						e = e.firstChild;
					return e
				}).append(this)
			}
			return this
		},
		wrapInner : function (e) {
			return x.isFunction(e) ? this.each(function (t) {
				x(this).wrapInner(e.call(this, t))
			}) : this.each(function () {
				var t = x(this),
				n = t.contents();
				n.length ? n.wrapAll(e) : t.append(e)
			})
		},
		wrap : function (e) {
			var t = x.isFunction(e);
			return this.each(function (n) {
				x(this).wrapAll(t ? e.call(this, n) : e)
			})
		},
		unwrap : function () {
			return this.parent().each(function () {
				x.nodeName(this, "body") || x(this).replaceWith(this.childNodes)
			}).end()
		}
	});
	var Pt,
	Rt,
	Wt,
	$t = /alpha\([^)]*\)/i,
	It = /opacity\s*=\s*([^)]*)/,
	zt = /^(top|right|bottom|left)$/,
	Xt = /^(none|table(?!-c[ea]).+)/,
	Ut = /^margin/,
	Vt = RegExp("^(" + w + ")(.*)$", "i"),
	Yt = RegExp("^(" + w + ")(?!px)[a-z%]+$", "i"),
	Jt = RegExp("^([+-])=(" + w + ")", "i"),
	Gt = {
		BODY : "block"
	},
	Qt = {
		position : "absolute",
		visibility : "hidden",
		display : "block"
	},
	Kt = {
		letterSpacing : 0,
		fontWeight : 400
	},
	Zt = ["Top", "Right", "Bottom", "Left"],
	en = ["Webkit", "O", "Moz", "ms"];
	function tn(e, t) {
		if (t in e)
			return t;
		var n = t.charAt(0).toUpperCase() + t.slice(1),
		r = t,
		i = en.length;
		while (i--)
			if (t = en[i] + n, t in e)
				return t;
		return r
	}
	function nn(e, t) {
		return e = t || e,
		"none" === x.css(e, "display") || !x.contains(e.ownerDocument, e)
	}
	function rn(e, t) {
		var n,
		r,
		i,
		o = [],
		a = 0,
		s = e.length;
		for (; s > a; a++)
			r = e[a], r.style && (o[a] = x._data(r, "olddisplay"), n = r.style.display, t ? (o[a] || "none" !== n || (r.style.display = ""), "" === r.style.display && nn(r) && (o[a] = x._data(r, "olddisplay", ln(r.nodeName)))) : o[a] || (i = nn(r), (n && "none" !== n || !i) && x._data(r, "olddisplay", i ? n : x.css(r, "display"))));
		for (a = 0; s > a; a++)
			r = e[a], r.style && (t && "none" !== r.style.display && "" !== r.style.display || (r.style.display = t ? o[a] || "" : "none"));
		return e
	}
	x.fn.extend({
		css : function (e, n) {
			return x.access(this, function (e, n, r) {
				var i,
				o,
				a = {},
				s = 0;
				if (x.isArray(n)) {
					for (o = Rt(e), i = n.length; i > s; s++)
						a[n[s]] = x.css(e, n[s], !1, o);
					return a
				}
				return r !== t ? x.style(e, n, r) : x.css(e, n)
			}, e, n, arguments.length > 1)
		},
		show : function () {
			return rn(this, !0)
		},
		hide : function () {
			return rn(this)
		},
		toggle : function (e) {
			var t = "boolean" == typeof e;
			return this.each(function () {
				(t ? e : nn(this)) ? x(this).show() : x(this).hide()
			})
		}
	}),
	x.extend({
		cssHooks : {
			opacity : {
				get : function (e, t) {
					if (t) {
						var n = Wt(e, "opacity");
						return "" === n ? "1" : n
					}
				}
			}
		},
		cssNumber : {
			columnCount : !0,
			fillOpacity : !0,
			fontWeight : !0,
			lineHeight : !0,
			opacity : !0,
			orphans : !0,
			widows : !0,
			zIndex : !0,
			zoom : !0
		},
		cssProps : {
			"float" : x.support.cssFloat ? "cssFloat" : "styleFloat"
		},
		style : function (e, n, r, i) {
			if (e && 3 !== e.nodeType && 8 !== e.nodeType && e.style) {
				var o,
				a,
				s,
				l = x.camelCase(n),
				u = e.style;
				if (n = x.cssProps[l] || (x.cssProps[l] = tn(u, l)), s = x.cssHooks[n] || x.cssHooks[l], r === t)
					return s && "get" in s && (o = s.get(e, !1, i)) !== t ? o : u[n];
				if (a = typeof r, "string" === a && (o = Jt.exec(r)) && (r = (o[1] + 1) * o[2] + parseFloat(x.css(e, n)), a = "number"), !(null == r || "number" === a && isNaN(r) || ("number" !== a || x.cssNumber[l] || (r += "px"), x.support.clearCloneStyle || "" !== r || 0 !== n.indexOf("background") || (u[n] = "inherit"), s && "set" in s && (r = s.set(e, r, i)) === t)))
					try {
						u[n] = r
					} catch (c) {}
			}
		},
		css : function (e, n, r, i) {
			var o,
			a,
			s,
			l = x.camelCase(n);
			return n = x.cssProps[l] || (x.cssProps[l] = tn(e.style, l)),
			s = x.cssHooks[n] || x.cssHooks[l],
			s && "get" in s && (a = s.get(e, !0, r)),
			a === t && (a = Wt(e, n, i)),
			"normal" === a && n in Kt && (a = Kt[n]),
			"" === r || r ? (o = parseFloat(a), r === !0 || x.isNumeric(o) ? o || 0 : a) : a
		}
	}),
	e.getComputedStyle ? (Rt = function (t) {
		return e.getComputedStyle(t, null)
	}, Wt = function (e, n, r) {
		var i,
		o,
		a,
		s = r || Rt(e),
		l = s ? s.getPropertyValue(n) || s[n] : t,
		u = e.style;
		return s && ("" !== l || x.contains(e.ownerDocument, e) || (l = x.style(e, n)), Yt.test(l) && Ut.test(n) && (i = u.width, o = u.minWidth, a = u.maxWidth, u.minWidth = u.maxWidth = u.width = l, l = s.width, u.width = i, u.minWidth = o, u.maxWidth = a)),
		l
	}) : a.documentElement.currentStyle && (Rt = function (e) {
		return e.currentStyle
	}, Wt = function (e, n, r) {
		var i,
		o,
		a,
		s = r || Rt(e),
		l = s ? s[n] : t,
		u = e.style;
		return null == l && u && u[n] && (l = u[n]),
		Yt.test(l) && !zt.test(n) && (i = u.left, o = e.runtimeStyle, a = o && o.left, a && (o.left = e.currentStyle.left), u.left = "fontSize" === n ? "1em" : l, l = u.pixelLeft + "px", u.left = i, a && (o.left = a)),
		"" === l ? "auto" : l
	});
	function on(e, t, n) {
		var r = Vt.exec(t);
		return r ? Math.max(0, r[1] - (n || 0)) + (r[2] || "px") : t
	}
	function an(e, t, n, r, i) {
		var o = n === (r ? "border" : "content") ? 4 : "width" === t ? 1 : 0,
		a = 0;
		for (; 4 > o; o += 2)
			"margin" === n && (a += x.css(e, n + Zt[o], !0, i)), r ? ("content" === n && (a -= x.css(e, "padding" + Zt[o], !0, i)), "margin" !== n && (a -= x.css(e, "border" + Zt[o] + "Width", !0, i))) : (a += x.css(e, "padding" + Zt[o], !0, i), "padding" !== n && (a += x.css(e, "border" + Zt[o] + "Width", !0, i)));
		return a
	}
	function sn(e, t, n) {
		var r = !0,
		i = "width" === t ? e.offsetWidth : e.offsetHeight,
		o = Rt(e),
		a = x.support.boxSizing && "border-box" === x.css(e, "boxSizing", !1, o);
		if (0 >= i || null == i) {
			if (i = Wt(e, t, o), (0 > i || null == i) && (i = e.style[t]), Yt.test(i))
				return i;
			r = a && (x.support.boxSizingReliable || i === e.style[t]),
			i = parseFloat(i) || 0
		}
		return i + an(e, t, n || (a ? "border" : "content"), r, o) + "px"
	}
	function ln(e) {
		var t = a,
		n = Gt[e];
		return n || (n = un(e, t), "none" !== n && n || (Pt = (Pt || x("<iframe frameborder='0' width='0' height='0'/>").css("cssText", "display:block !important")).appendTo(t.documentElement), t = (Pt[0].contentWindow || Pt[0].contentDocument).document, t.write("<!doctype html><html><body>"), t.close(), n = un(e, t), Pt.detach()), Gt[e] = n),
		n
	}
	function un(e, t) {
		var n = x(t.createElement(e)).appendTo(t.body),
		r = x.css(n[0], "display");
		return n.remove(),
		r
	}
	x.each(["height", "width"], function (e, n) {
		x.cssHooks[n] = {
			get : function (e, r, i) {
				return r ? 0 === e.offsetWidth && Xt.test(x.css(e, "display")) ? x.swap(e, Qt, function () {
					return sn(e, n, i)
				}) : sn(e, n, i) : t
			},
			set : function (e, t, r) {
				var i = r && Rt(e);
				return on(e, t, r ? an(e, n, r, x.support.boxSizing && "border-box" === x.css(e, "boxSizing", !1, i), i) : 0)
			}
		}
	}),
	x.support.opacity || (x.cssHooks.opacity = {
			get : function (e, t) {
				return It.test((t && e.currentStyle ? e.currentStyle.filter : e.style.filter) || "") ? .01 * parseFloat(RegExp.$1) + "" : t ? "1" : ""
			},
			set : function (e, t) {
				var n = e.style,
				r = e.currentStyle,
				i = x.isNumeric(t) ? "alpha(opacity=" + 100 * t + ")" : "",
				o = r && r.filter || n.filter || "";
				n.zoom = 1,
				(t >= 1 || "" === t) && "" === x.trim(o.replace($t, "")) && n.removeAttribute && (n.removeAttribute("filter"), "" === t || r && !r.filter) || (n.filter = $t.test(o) ? o.replace($t, i) : o + " " + i)
			}
		}),
	x(function () {
		x.support.reliableMarginRight || (x.cssHooks.marginRight = {
				get : function (e, n) {
					return n ? x.swap(e, {
						display : "inline-block"
					}, Wt, [e, "marginRight"]) : t
				}
			}),
		!x.support.pixelPosition && x.fn.position && x.each(["top", "left"], function (e, n) {
			x.cssHooks[n] = {
				get : function (e, r) {
					return r ? (r = Wt(e, n), Yt.test(r) ? x(e).position()[n] + "px" : r) : t
				}
			}
		})
	}),
	x.expr && x.expr.filters && (x.expr.filters.hidden = function (e) {
		return 0 >= e.offsetWidth && 0 >= e.offsetHeight || !x.support.reliableHiddenOffsets && "none" === (e.style && e.style.display || x.css(e, "display"))
	}, x.expr.filters.visible = function (e) {
		return !x.expr.filters.hidden(e)
	}),
	x.each({
		margin : "",
		padding : "",
		border : "Width"
	}, function (e, t) {
		x.cssHooks[e + t] = {
			expand : function (n) {
				var r = 0,
				i = {},
				o = "string" == typeof n ? n.split(" ") : [n];
				for (; 4 > r; r++)
					i[e + Zt[r] + t] = o[r] || o[r - 2] || o[0];
				return i
			}
		},
		Ut.test(e) || (x.cssHooks[e + t].set = on)
	});
	var cn = /%20/g,
	pn = /\[\]$/,
	fn = /\r?\n/g,
	dn = /^(?:submit|button|image|reset|file)$/i,
	hn = /^(?:input|select|textarea|keygen)/i;
	x.fn.extend({
		serialize : function () {
			return x.param(this.serializeArray())
		},
		serializeArray : function () {
			return this.map(function () {
				var e = x.prop(this, "elements");
				return e ? x.makeArray(e) : this
			}).filter(function () {
				var e = this.type;
				return this.name && !x(this).is(":disabled") && hn.test(this.nodeName) && !dn.test(e) && (this.checked || !Ct.test(e))
			}).map(function (e, t) {
				var n = x(this).val();
				return null == n ? null : x.isArray(n) ? x.map(n, function (e) {
					return {
						name : t.name,
						value : e.replace(fn, "\r\n")
					}
				}) : {
					name : t.name,
					value : n.replace(fn, "\r\n")
				}
			}).get()
		}
	}),
	x.param = function (e, n) {
		var r,
		i = [],
		o = function (e, t) {
			t = x.isFunction(t) ? t() : null == t ? "" : t,
			i[i.length] = encodeURIComponent(e) + "=" + encodeURIComponent(t)
		};
		if (n === t && (n = x.ajaxSettings && x.ajaxSettings.traditional), x.isArray(e) || e.jquery && !x.isPlainObject(e))
			x.each(e, function () {
				o(this.name, this.value)
			});
		else
			for (r in e)
				gn(r, e[r], n, o);
		return i.join("&").replace(cn, "+")
	};
	function gn(e, t, n, r) {
		var i;
		if (x.isArray(t))
			x.each(t, function (t, i) {
				n || pn.test(e) ? r(e, i) : gn(e + "[" + ("object" == typeof i ? t : "") + "]", i, n, r)
			});
		else if (n || "object" !== x.type(t))
			r(e, t);
		else
			for (i in t)
				gn(e + "[" + i + "]", t[i], n, r)
	}
	x.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "), function (e, t) {
		x.fn[t] = function (e, n) {
			return arguments.length > 0 ? this.on(t, null, e, n) : this.trigger(t)
		}
	}),
	x.fn.extend({
		hover : function (e, t) {
			return this.mouseenter(e).mouseleave(t || e)
		},
		bind : function (e, t, n) {
			return this.on(e, null, t, n)
		},
		unbind : function (e, t) {
			return this.off(e, null, t)
		},
		delegate : function (e, t, n, r) {
			return this.on(t, e, n, r)
		},
		undelegate : function (e, t, n) {
			return 1 === arguments.length ? this.off(e, "**") : this.off(t, e || "**", n)
		}
	});
	var mn,
	yn,
	vn = x.now(),
	bn = /\?/,
	xn = /#.*$/,
	wn = /([?&])_=[^&]*/,
	Tn = /^(.*?):[ \t]*([^\r\n]*)\r?$/gm,
	Cn = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
	Nn = /^(?:GET|HEAD)$/,
	kn = /^\/\//,
	En = /^([\w.+-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/,
	Sn = x.fn.load,
	An = {},
	jn = {},
	Dn = "*/".concat("*");
	try {
		yn = o.href
	} catch (Ln) {
		yn = a.createElement("a"),
		yn.href = "",
		yn = yn.href
	}
	mn = En.exec(yn.toLowerCase()) || [];
	function Hn(e) {
		return function (t, n) {
			"string" != typeof t && (n = t, t = "*");
			var r,
			i = 0,
			o = t.toLowerCase().match(T) || [];
			if (x.isFunction(n))
				while (r = o[i++])
					"+" === r[0] ? (r = r.slice(1) || "*", (e[r] = e[r] || []).unshift(n)) : (e[r] = e[r] || []).push(n)
		}
	}
	function qn(e, n, r, i) {
		var o = {},
		a = e === jn;
		function s(l) {
			var u;
			return o[l] = !0,
			x.each(e[l] || [], function (e, l) {
				var c = l(n, r, i);
				return "string" != typeof c || a || o[c] ? a ? !(u = c) : t : (n.dataTypes.unshift(c), s(c), !1)
			}),
			u
		}
		return s(n.dataTypes[0]) || !o["*"] && s("*")
	}
	function _n(e, n) {
		var r,
		i,
		o = x.ajaxSettings.flatOptions || {};
		for (i in n)
			n[i] !== t && ((o[i] ? e : r || (r = {}))[i] = n[i]);
		return r && x.extend(!0, e, r),
		e
	}
	x.fn.load = function (e, n, r) {
		if ("string" != typeof e && Sn)
			return Sn.apply(this, arguments);
		var i,
		o,
		a,
		s = this,
		l = e.indexOf(" ");
		return l >= 0 && (i = e.slice(l, e.length), e = e.slice(0, l)),
		x.isFunction(n) ? (r = n, n = t) : n && "object" == typeof n && (a = "POST"),
		s.length > 0 && x.ajax({
			url : e,
			type : a,
			dataType : "html",
			data : n
		}).done(function (e) {
			o = arguments,
			s.html(i ? x("<div>").append(x.parseHTML(e)).find(i) : e)
		}).complete(r && function (e, t) {
			s.each(r, o || [e.responseText, t, e])
		}),
		this
	},
	x.each(["ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend"], function (e, t) {
		x.fn[t] = function (e) {
			return this.on(t, e)
		}
	}),
	x.extend({
		active : 0,
		lastModified : {},
		etag : {},
		ajaxSettings : {
			url : yn,
			type : "GET",
			isLocal : Cn.test(mn[1]),
			global : !0,
			processData : !0,
			async : !0,
			contentType : "application/x-www-form-urlencoded; charset=UTF-8",
			accepts : {
				"*" : Dn,
				text : "text/plain",
				html : "text/html",
				xml : "application/xml, text/xml",
				json : "application/json, text/javascript"
			},
			contents : {
				xml : /xml/,
				html : /html/,
				json : /json/
			},
			responseFields : {
				xml : "responseXML",
				text : "responseText",
				json : "responseJSON"
			},
			converters : {
				"* text" : String,
				"text html" : !0,
				"text json" : x.parseJSON,
				"text xml" : x.parseXML
			},
			flatOptions : {
				url : !0,
				context : !0
			}
		},
		ajaxSetup : function (e, t) {
			return t ? _n(_n(e, x.ajaxSettings), t) : _n(x.ajaxSettings, e)
		},
		ajaxPrefilter : Hn(An),
		ajaxTransport : Hn(jn),
		ajax : function (e, n) {
			"object" == typeof e && (n = e, e = t),
			n = n || {};
			var r,
			i,
			o,
			a,
			s,
			l,
			u,
			c,
			p = x.ajaxSetup({}, n),
			f = p.context || p,
			d = p.context && (f.nodeType || f.jquery) ? x(f) : x.event,
			h = x.Deferred(),
			g = x.Callbacks("once memory"),
			m = p.statusCode || {},
			y = {},
			v = {},
			b = 0,
			w = "canceled",
			C = {
				readyState : 0,
				getResponseHeader : function (e) {
					var t;
					if (2 === b) {
						if (!c) {
							c = {};
							while (t = Tn.exec(a))
								c[t[1].toLowerCase()] = t[2]
						}
						t = c[e.toLowerCase()]
					}
					return null == t ? null : t
				},
				getAllResponseHeaders : function () {
					return 2 === b ? a : null
				},
				setRequestHeader : function (e, t) {
					var n = e.toLowerCase();
					return b || (e = v[n] = v[n] || e, y[e] = t),
					this
				},
				overrideMimeType : function (e) {
					return b || (p.mimeType = e),
					this
				},
				statusCode : function (e) {
					var t;
					if (e)
						if (2 > b)
							for (t in e)
								m[t] = [m[t], e[t]];
						else
							C.always(e[C.status]);
					return this
				},
				abort : function (e) {
					var t = e || w;
					return u && u.abort(t),
					k(0, t),
					this
				}
			};
			if (h.promise(C).complete = g.add, C.success = C.done, C.error = C.fail, p.url = ((e || p.url || yn) + "").replace(xn, "").replace(kn, mn[1] + "//"), p.type = n.method || n.type || p.method || p.type, p.dataTypes = x.trim(p.dataType || "*").toLowerCase().match(T) || [""], null == p.crossDomain && (r = En.exec(p.url.toLowerCase()), p.crossDomain = !(!r || r[1] === mn[1] && r[2] === mn[2] && (r[3] || ("http:" === r[1] ? "80" : "443")) === (mn[3] || ("http:" === mn[1] ? "80" : "443")))), p.data && p.processData && "string" != typeof p.data && (p.data = x.param(p.data, p.traditional)), qn(An, p, n, C), 2 === b)
				return C;
			l = p.global,
			l && 0 === x.active++ && x.event.trigger("ajaxStart"),
			p.type = p.type.toUpperCase(),
			p.hasContent = !Nn.test(p.type),
			o = p.url,
			p.hasContent || (p.data && (o = p.url += (bn.test(o) ? "&" : "?") + p.data, delete p.data), p.cache === !1 && (p.url = wn.test(o) ? o.replace(wn, "$1_=" + vn++) : o + (bn.test(o) ? "&" : "?") + "_=" + vn++)),
			p.ifModified && (x.lastModified[o] && C.setRequestHeader("If-Modified-Since", x.lastModified[o]), x.etag[o] && C.setRequestHeader("If-None-Match", x.etag[o])),
			(p.data && p.hasContent && p.contentType !== !1 || n.contentType) && C.setRequestHeader("Content-Type", p.contentType),
			C.setRequestHeader("Accept", p.dataTypes[0] && p.accepts[p.dataTypes[0]] ? p.accepts[p.dataTypes[0]] + ("*" !== p.dataTypes[0] ? ", " + Dn + "; q=0.01" : "") : p.accepts["*"]);
			for (i in p.headers)
				C.setRequestHeader(i, p.headers[i]);
			if (p.beforeSend && (p.beforeSend.call(f, C, p) === !1 || 2 === b))
				return C.abort();
			w = "abort";
			for (i in {
				success : 1,
				error : 1,
				complete : 1
			})
				C[i](p[i]);
			if (u = qn(jn, p, n, C)) {
				C.readyState = 1,
				l && d.trigger("ajaxSend", [C, p]),
				p.async && p.timeout > 0 && (s = setTimeout(function () {
							C.abort("timeout")
						}, p.timeout));
				try {
					b = 1,
					u.send(y, k)
				} catch (N) {
					if (!(2 > b))
						throw N;
					k(-1, N)
				}
			} else
				k(-1, "No Transport");
			function k(e, n, r, i) {
				var c,
				y,
				v,
				w,
				T,
				N = n;
				2 !== b && (b = 2, s && clearTimeout(s), u = t, a = i || "", C.readyState = e > 0 ? 4 : 0, c = e >= 200 && 300 > e || 304 === e, r && (w = Mn(p, C, r)), w = On(p, w, C, c), c ? (p.ifModified && (T = C.getResponseHeader("Last-Modified"), T && (x.lastModified[o] = T), T = C.getResponseHeader("etag"), T && (x.etag[o] = T)), 204 === e || "HEAD" === p.type ? N = "nocontent" : 304 === e ? N = "notmodified" : (N = w.state, y = w.data, v = w.error, c = !v)) : (v = N, (e || !N) && (N = "error", 0 > e && (e = 0))), C.status = e, C.statusText = (n || N) + "", c ? h.resolveWith(f, [y, N, C]) : h.rejectWith(f, [C, N, v]), C.statusCode(m), m = t, l && d.trigger(c ? "ajaxSuccess" : "ajaxError", [C, p, c ? y : v]), g.fireWith(f, [C, N]), l && (d.trigger("ajaxComplete", [C, p]), --x.active || x.event.trigger("ajaxStop")))
			}
			return C
		},
		getJSON : function (e, t, n) {
			return x.get(e, t, n, "json")
		},
		getScript : function (e, n) {
			return x.get(e, t, n, "script")
		}
	}),
	x.each(["get", "post"], function (e, n) {
		x[n] = function (e, r, i, o) {
			return x.isFunction(r) && (o = o || i, i = r, r = t),
			x.ajax({
				url : e,
				type : n,
				dataType : o,
				data : r,
				success : i
			})
		}
	});
	function Mn(e, n, r) {
		var i,
		o,
		a,
		s,
		l = e.contents,
		u = e.dataTypes;
		while ("*" === u[0])
			u.shift(), o === t && (o = e.mimeType || n.getResponseHeader("Content-Type"));
		if (o)
			for (s in l)
				if (l[s] && l[s].test(o)) {
					u.unshift(s);
					break
				}
		if (u[0]in r)
			a = u[0];
		else {
			for (s in r) {
				if (!u[0] || e.converters[s + " " + u[0]]) {
					a = s;
					break
				}
				i || (i = s)
			}
			a = a || i
		}
		return a ? (a !== u[0] && u.unshift(a), r[a]) : t
	}
	function On(e, t, n, r) {
		var i,
		o,
		a,
		s,
		l,
		u = {},
		c = e.dataTypes.slice();
		if (c[1])
			for (a in e.converters)
				u[a.toLowerCase()] = e.converters[a];
		o = c.shift();
		while (o)
			if (e.responseFields[o] && (n[e.responseFields[o]] = t), !l && r && e.dataFilter && (t = e.dataFilter(t, e.dataType)), l = o, o = c.shift())
				if ("*" === o)
					o = l;
				else if ("*" !== l && l !== o) {
					if (a = u[l + " " + o] || u["* " + o], !a)
						for (i in u)
							if (s = i.split(" "), s[1] === o && (a = u[l + " " + s[0]] || u["* " + s[0]])) {
								a === !0 ? a = u[i] : u[i] !== !0 && (o = s[0], c.unshift(s[1]));
								break
							}
					if (a !== !0)
						if (a && e["throws"])
							t = a(t);
						else
							try {
								t = a(t)
							} catch (p) {
								return {
									state : "parsererror",
									error : a ? p : "No conversion from " + l + " to " + o
								}
							}
				}
		return {
			state : "success",
			data : t
		}
	}
	x.ajaxSetup({
		accepts : {
			script : "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
		},
		contents : {
			script : /(?:java|ecma)script/
		},
		converters : {
			"text script" : function (e) {
				return x.globalEval(e),
				e
			}
		}
	}),
	x.ajaxPrefilter("script", function (e) {
		e.cache === t && (e.cache = !1),
		e.crossDomain && (e.type = "GET", e.global = !1)
	}),
	x.ajaxTransport("script", function (e) {
		if (e.crossDomain) {
			var n,
			r = a.head || x("head")[0] || a.documentElement;
			return {
				send : function (t, i) {
					n = a.createElement("script"),
					n.async = !0,
					e.scriptCharset && (n.charset = e.scriptCharset),
					n.src = e.url,
					n.onload = n.onreadystatechange = function (e, t) {
						(t || !n.readyState || /loaded|complete/.test(n.readyState)) && (n.onload = n.onreadystatechange = null, n.parentNode && n.parentNode.removeChild(n), n = null, t || i(200, "success"))
					},
					r.insertBefore(n, r.firstChild)
				},
				abort : function () {
					n && n.onload(t, !0)
				}
			}
		}
	});
	var Fn = [],
	Bn = /(=)\?(?=&|$)|\?\?/;
	x.ajaxSetup({
		jsonp : "callback",
		jsonpCallback : function () {
			var e = Fn.pop() || x.expando + "_" + vn++;
			return this[e] = !0,
			e
		}
	}),
	x.ajaxPrefilter("json jsonp", function (n, r, i) {
		var o,
		a,
		s,
		l = n.jsonp !== !1 && (Bn.test(n.url) ? "url" : "string" == typeof n.data && !(n.contentType || "").indexOf("application/x-www-form-urlencoded") && Bn.test(n.data) && "data");
		return l || "jsonp" === n.dataTypes[0] ? (o = n.jsonpCallback = x.isFunction(n.jsonpCallback) ? n.jsonpCallback() : n.jsonpCallback, l ? n[l] = n[l].replace(Bn, "$1" + o) : n.jsonp !== !1 && (n.url += (bn.test(n.url) ? "&" : "?") + n.jsonp + "=" + o), n.converters["script json"] = function () {
			return s || x.error(o + " was not called"),
			s[0]
		}, n.dataTypes[0] = "json", a = e[o], e[o] = function () {
			s = arguments
		}, i.always(function () {
				e[o] = a,
				n[o] && (n.jsonpCallback = r.jsonpCallback, Fn.push(o)),
				s && x.isFunction(a) && a(s[0]),
				s = a = t
			}), "script") : t
	});
	var Pn,
	Rn,
	Wn = 0,
	$n = e.ActiveXObject && function () {
		var e;
		for (e in Pn)
			Pn[e](t, !0)
	};
	function In() {
		try {
			return new e.XMLHttpRequest
		} catch (t) {}
	}
	function zn() {
		try {
			return new e.ActiveXObject("Microsoft.XMLHTTP")
		} catch (t) {}
	}
	x.ajaxSettings.xhr = e.ActiveXObject ? function () {
		return !this.isLocal && In() || zn()
	}
	 : In,
	Rn = x.ajaxSettings.xhr(),
	x.support.cors = !!Rn && "withCredentials" in Rn,
	Rn = x.support.ajax = !!Rn,
	Rn && x.ajaxTransport(function (n) {
		if (!n.crossDomain || x.support.cors) {
			var r;
			return {
				send : function (i, o) {
					var a,
					s,
					l = n.xhr();
					if (n.username ? l.open(n.type, n.url, n.async, n.username, n.password) : l.open(n.type, n.url, n.async), n.xhrFields)
						for (s in n.xhrFields)
							l[s] = n.xhrFields[s];
					n.mimeType && l.overrideMimeType && l.overrideMimeType(n.mimeType),
					n.crossDomain || i["X-Requested-With"] || (i["X-Requested-With"] = "XMLHttpRequest");
					try {
						for (s in i)
							l.setRequestHeader(s, i[s])
					} catch (u) {}
					l.send(n.hasContent && n.data || null),
					r = function (e, i) {
						var s,
						u,
						c,
						p;
						try {
							if (r && (i || 4 === l.readyState))
								if (r = t, a && (l.onreadystatechange = x.noop, $n && delete Pn[a]), i)
									4 !== l.readyState && l.abort();
								else {
									p = {},
									s = l.status,
									u = l.getAllResponseHeaders(),
									"string" == typeof l.responseText && (p.text = l.responseText);
									try {
										c = l.statusText
									} catch (f) {
										c = ""
									}
									s || !n.isLocal || n.crossDomain ? 1223 === s && (s = 204) : s = p.text ? 200 : 404
								}
						} catch (d) {
							i || o(-1, d)
						}
						p && o(s, c, p, u)
					},
					n.async ? 4 === l.readyState ? setTimeout(r) : (a = ++Wn, $n && (Pn || (Pn = {}, x(e).unload($n)), Pn[a] = r), l.onreadystatechange = r) : r()
				},
				abort : function () {
					r && r(t, !0)
				}
			}
		}
	});
	var Xn,
	Un,
	Vn = /^(?:toggle|show|hide)$/,
	Yn = RegExp("^(?:([+-])=|)(" + w + ")([a-z%]*)$", "i"),
	Jn = /queueHooks$/,
	Gn = [nr],
	Qn = {
		"*" : [function (e, t) {
				var n = this.createTween(e, t),
				r = n.cur(),
				i = Yn.exec(t),
				o = i && i[3] || (x.cssNumber[e] ? "" : "px"),
				a = (x.cssNumber[e] || "px" !== o && +r) && Yn.exec(x.css(n.elem, e)),
				s = 1,
				l = 20;
				if (a && a[3] !== o) {
					o = o || a[3],
					i = i || [],
					a = +r || 1;
					do
						s = s || ".5", a /= s, x.style(n.elem, e, a + o);
					while (s !== (s = n.cur() / r) && 1 !== s && --l)
				}
				return i && (a = n.start = +a || +r || 0, n.unit = o, n.end = i[1] ? a + (i[1] + 1) * i[2] : +i[2]),
				n
			}
		]
	};
	function Kn() {
		return setTimeout(function () {
			Xn = t
		}),
		Xn = x.now()
	}
	function Zn(e, t, n) {
		var r,
		i = (Qn[t] || []).concat(Qn["*"]),
		o = 0,
		a = i.length;
		for (; a > o; o++)
			if (r = i[o].call(n, t, e))
				return r
	}
	function er(e, t, n) {
		var r,
		i,
		o = 0,
		a = Gn.length,
		s = x.Deferred().always(function () {
				delete l.elem
			}),
		l = function () {
			if (i)
				return !1;
			var t = Xn || Kn(),
			n = Math.max(0, u.startTime + u.duration - t),
			r = n / u.duration || 0,
			o = 1 - r,
			a = 0,
			l = u.tweens.length;
			for (; l > a; a++)
				u.tweens[a].run(o);
			return s.notifyWith(e, [u, o, n]),
			1 > o && l ? n : (s.resolveWith(e, [u]), !1)
		},
		u = s.promise({
				elem : e,
				props : x.extend({}, t),
				opts : x.extend(!0, {
					specialEasing : {}
				}, n),
				originalProperties : t,
				originalOptions : n,
				startTime : Xn || Kn(),
				duration : n.duration,
				tweens : [],
				createTween : function (t, n) {
					var r = x.Tween(e, u.opts, t, n, u.opts.specialEasing[t] || u.opts.easing);
					return u.tweens.push(r),
					r
				},
				stop : function (t) {
					var n = 0,
					r = t ? u.tweens.length : 0;
					if (i)
						return this;
					for (i = !0; r > n; n++)
						u.tweens[n].run(1);
					return t ? s.resolveWith(e, [u, t]) : s.rejectWith(e, [u, t]),
					this
				}
			}),
		c = u.props;
		for (tr(c, u.opts.specialEasing); a > o; o++)
			if (r = Gn[o].call(u, e, c, u.opts))
				return r;
		return x.map(c, Zn, u),
		x.isFunction(u.opts.start) && u.opts.start.call(e, u),
		x.fx.timer(x.extend(l, {
				elem : e,
				anim : u,
				queue : u.opts.queue
			})),
		u.progress(u.opts.progress).done(u.opts.done, u.opts.complete).fail(u.opts.fail).always(u.opts.always)
	}
	function tr(e, t) {
		var n,
		r,
		i,
		o,
		a;
		for (n in e)
			if (r = x.camelCase(n), i = t[r], o = e[n], x.isArray(o) && (i = o[1], o = e[n] = o[0]), n !== r && (e[r] = o, delete e[n]), a = x.cssHooks[r], a && "expand" in a) {
				o = a.expand(o),
				delete e[r];
				for (n in o)
					n in e || (e[n] = o[n], t[n] = i)
			} else
				t[r] = i
	}
	x.Animation = x.extend(er, {
			tweener : function (e, t) {
				x.isFunction(e) ? (t = e, e = ["*"]) : e = e.split(" ");
				var n,
				r = 0,
				i = e.length;
				for (; i > r; r++)
					n = e[r], Qn[n] = Qn[n] || [], Qn[n].unshift(t)
			},
			prefilter : function (e, t) {
				t ? Gn.unshift(e) : Gn.push(e)
			}
		});
	function nr(e, t, n) {
		var r,
		i,
		o,
		a,
		s,
		l,
		u = this,
		c = {},
		p = e.style,
		f = e.nodeType && nn(e),
		d = x._data(e, "fxshow");
		n.queue || (s = x._queueHooks(e, "fx"), null == s.unqueued && (s.unqueued = 0, l = s.empty.fire, s.empty.fire = function () {
				s.unqueued || l()
			}), s.unqueued++, u.always(function () {
				u.always(function () {
					s.unqueued--,
					x.queue(e, "fx").length || s.empty.fire()
				})
			})),
		1 === e.nodeType && ("height" in t || "width" in t) && (n.overflow = [p.overflow, p.overflowX, p.overflowY], "inline" === x.css(e, "display") && "none" === x.css(e, "float") && (x.support.inlineBlockNeedsLayout && "inline" !== ln(e.nodeName) ? p.zoom = 1 : p.display = "inline-block")),
		n.overflow && (p.overflow = "hidden", x.support.shrinkWrapBlocks || u.always(function () {
				p.overflow = n.overflow[0],
				p.overflowX = n.overflow[1],
				p.overflowY = n.overflow[2]
			}));
		for (r in t)
			if (i = t[r], Vn.exec(i)) {
				if (delete t[r], o = o || "toggle" === i, i === (f ? "hide" : "show"))
					continue;
				c[r] = d && d[r] || x.style(e, r)
			}
		if (!x.isEmptyObject(c)) {
			d ? "hidden" in d && (f = d.hidden) : d = x._data(e, "fxshow", {}),
			o && (d.hidden = !f),
			f ? x(e).show() : u.done(function () {
				x(e).hide()
			}),
			u.done(function () {
				var t;
				x._removeData(e, "fxshow");
				for (t in c)
					x.style(e, t, c[t])
			});
			for (r in c)
				a = Zn(f ? d[r] : 0, r, u), r in d || (d[r] = a.start, f && (a.end = a.start, a.start = "width" === r || "height" === r ? 1 : 0))
		}
	}
	function rr(e, t, n, r, i) {
		return new rr.prototype.init(e, t, n, r, i)
	}
	x.Tween = rr,
	rr.prototype = {
		constructor : rr,
		init : function (e, t, n, r, i, o) {
			this.elem = e,
			this.prop = n,
			this.easing = i || "swing",
			this.options = t,
			this.start = this.now = this.cur(),
			this.end = r,
			this.unit = o || (x.cssNumber[n] ? "" : "px")
		},
		cur : function () {
			var e = rr.propHooks[this.prop];
			return e && e.get ? e.get(this) : rr.propHooks._default.get(this)
		},
		run : function (e) {
			var t,
			n = rr.propHooks[this.prop];
			return this.pos = t = this.options.duration ? x.easing[this.easing](e, this.options.duration * e, 0, 1, this.options.duration) : e,
			this.now = (this.end - this.start) * t + this.start,
			this.options.step && this.options.step.call(this.elem, this.now, this),
			n && n.set ? n.set(this) : rr.propHooks._default.set(this),
			this
		}
	},
	rr.prototype.init.prototype = rr.prototype,
	rr.propHooks = {
		_default : {
			get : function (e) {
				var t;
				return null == e.elem[e.prop] || e.elem.style && null != e.elem.style[e.prop] ? (t = x.css(e.elem, e.prop, ""), t && "auto" !== t ? t : 0) : e.elem[e.prop]
			},
			set : function (e) {
				x.fx.step[e.prop] ? x.fx.step[e.prop](e) : e.elem.style && (null != e.elem.style[x.cssProps[e.prop]] || x.cssHooks[e.prop]) ? x.style(e.elem, e.prop, e.now + e.unit) : e.elem[e.prop] = e.now
			}
		}
	},
	rr.propHooks.scrollTop = rr.propHooks.scrollLeft = {
		set : function (e) {
			e.elem.nodeType && e.elem.parentNode && (e.elem[e.prop] = e.now)
		}
	},
	x.each(["toggle", "show", "hide"], function (e, t) {
		var n = x.fn[t];
		x.fn[t] = function (e, r, i) {
			return null == e || "boolean" == typeof e ? n.apply(this, arguments) : this.animate(ir(t, !0), e, r, i)
		}
	}),
	x.fn.extend({
		fadeTo : function (e, t, n, r) {
			return this.filter(nn).css("opacity", 0).show().end().animate({
				opacity : t
			}, e, n, r)
		},
		animate : function (e, t, n, r) {
			var i = x.isEmptyObject(e),
			o = x.speed(t, n, r),
			a = function () {
				var t = er(this, x.extend({}, e), o);
				(i || x._data(this, "finish")) && t.stop(!0)
			};
			return a.finish = a,
			i || o.queue === !1 ? this.each(a) : this.queue(o.queue, a)
		},
		stop : function (e, n, r) {
			var i = function (e) {
				var t = e.stop;
				delete e.stop,
				t(r)
			};
			return "string" != typeof e && (r = n, n = e, e = t),
			n && e !== !1 && this.queue(e || "fx", []),
			this.each(function () {
				var t = !0,
				n = null != e && e + "queueHooks",
				o = x.timers,
				a = x._data(this);
				if (n)
					a[n] && a[n].stop && i(a[n]);
				else
					for (n in a)
						a[n] && a[n].stop && Jn.test(n) && i(a[n]);
				for (n = o.length; n--; )
					o[n].elem !== this || null != e && o[n].queue !== e || (o[n].anim.stop(r), t = !1, o.splice(n, 1));
				(t || !r) && x.dequeue(this, e)
			})
		},
		finish : function (e) {
			return e !== !1 && (e = e || "fx"),
			this.each(function () {
				var t,
				n = x._data(this),
				r = n[e + "queue"],
				i = n[e + "queueHooks"],
				o = x.timers,
				a = r ? r.length : 0;
				for (n.finish = !0, x.queue(this, e, []), i && i.stop && i.stop.call(this, !0), t = o.length; t--; )
					o[t].elem === this && o[t].queue === e && (o[t].anim.stop(!0), o.splice(t, 1));
				for (t = 0; a > t; t++)
					r[t] && r[t].finish && r[t].finish.call(this);
				delete n.finish
			})
		}
	});
	function ir(e, t) {
		var n,
		r = {
			height : e
		},
		i = 0;
		for (t = t ? 1 : 0; 4 > i; i += 2 - t)
			n = Zt[i], r["margin" + n] = r["padding" + n] = e;
		return t && (r.opacity = r.width = e),
		r
	}
	x.each({
		slideDown : ir("show"),
		slideUp : ir("hide"),
		slideToggle : ir("toggle"),
		fadeIn : {
			opacity : "show"
		},
		fadeOut : {
			opacity : "hide"
		},
		fadeToggle : {
			opacity : "toggle"
		}
	}, function (e, t) {
		x.fn[e] = function (e, n, r) {
			return this.animate(t, e, n, r)
		}
	}),
	x.speed = function (e, t, n) {
		var r = e && "object" == typeof e ? x.extend({}, e) : {
			complete : n || !n && t || x.isFunction(e) && e,
			duration : e,
			easing : n && t || t && !x.isFunction(t) && t
		};
		return r.duration = x.fx.off ? 0 : "number" == typeof r.duration ? r.duration : r.duration in x.fx.speeds ? x.fx.speeds[r.duration] : x.fx.speeds._default,
		(null == r.queue || r.queue === !0) && (r.queue = "fx"),
		r.old = r.complete,
		r.complete = function () {
			x.isFunction(r.old) && r.old.call(this),
			r.queue && x.dequeue(this, r.queue)
		},
		r
	},
	x.easing = {
		linear : function (e) {
			return e
		},
		swing : function (e) {
			return .5 - Math.cos(e * Math.PI) / 2
		}
	},
	x.timers = [],
	x.fx = rr.prototype.init,
	x.fx.tick = function () {
		var e,
		n = x.timers,
		r = 0;
		for (Xn = x.now(); n.length > r; r++)
			e = n[r], e() || n[r] !== e || n.splice(r--, 1);
		n.length || x.fx.stop(),
		Xn = t
	},
	x.fx.timer = function (e) {
		e() && x.timers.push(e) && x.fx.start()
	},
	x.fx.interval = 13,
	x.fx.start = function () {
		Un || (Un = setInterval(x.fx.tick, x.fx.interval))
	},
	x.fx.stop = function () {
		clearInterval(Un),
		Un = null
	},
	x.fx.speeds = {
		slow : 600,
		fast : 200,
		_default : 400
	},
	x.fx.step = {},
	x.expr && x.expr.filters && (x.expr.filters.animated = function (e) {
		return x.grep(x.timers, function (t) {
			return e === t.elem
		}).length
	}),
	x.fn.offset = function (e) {
		if (arguments.length)
			return e === t ? this : this.each(function (t) {
				x.offset.setOffset(this, e, t)
			});
		var n,
		r,
		o = {
			top : 0,
			left : 0
		},
		a = this[0],
		s = a && a.ownerDocument;
		if (s)
			return n = s.documentElement, x.contains(n, a) ? (typeof a.getBoundingClientRect !== i && (o = a.getBoundingClientRect()), r = or(s), {
				top : o.top + (r.pageYOffset || n.scrollTop) - (n.clientTop || 0),
				left : o.left + (r.pageXOffset || n.scrollLeft) - (n.clientLeft || 0)
			}) : o
	},
	x.offset = {
		setOffset : function (e, t, n) {
			var r = x.css(e, "position");
			"static" === r && (e.style.position = "relative");
			var i = x(e),
			o = i.offset(),
			a = x.css(e, "top"),
			s = x.css(e, "left"),
			l = ("absolute" === r || "fixed" === r) && x.inArray("auto", [a, s]) > -1,
			u = {},
			c = {},
			p,
			f;
			l ? (c = i.position(), p = c.top, f = c.left) : (p = parseFloat(a) || 0, f = parseFloat(s) || 0),
			x.isFunction(t) && (t = t.call(e, n, o)),
			null != t.top && (u.top = t.top - o.top + p),
			null != t.left && (u.left = t.left - o.left + f),
			"using" in t ? t.using.call(e, u) : i.css(u)
		}
	},
	x.fn.extend({
		position : function () {
			if (this[0]) {
				var e,
				t,
				n = {
					top : 0,
					left : 0
				},
				r = this[0];
				return "fixed" === x.css(r, "position") ? t = r.getBoundingClientRect() : (e = this.offsetParent(), t = this.offset(), x.nodeName(e[0], "html") || (n = e.offset()), n.top += x.css(e[0], "borderTopWidth", !0), n.left += x.css(e[0], "borderLeftWidth", !0)), {
					top : t.top - n.top - x.css(r, "marginTop", !0),
					left : t.left - n.left - x.css(r, "marginLeft", !0)
				}
			}
		},
		offsetParent : function () {
			return this.map(function () {
				var e = this.offsetParent || s;
				while (e && !x.nodeName(e, "html") && "static" === x.css(e, "position"))
					e = e.offsetParent;
				return e || s
			})
		}
	}),
	x.each({
		scrollLeft : "pageXOffset",
		scrollTop : "pageYOffset"
	}, function (e, n) {
		var r = /Y/.test(n);
		x.fn[e] = function (i) {
			return x.access(this, function (e, i, o) {
				var a = or(e);
				return o === t ? a ? n in a ? a[n] : a.document.documentElement[i] : e[i] : (a ? a.scrollTo(r ? x(a).scrollLeft() : o, r ? o : x(a).scrollTop()) : e[i] = o, t)
			}, e, i, arguments.length, null)
		}
	});
	function or(e) {
		return x.isWindow(e) ? e : 9 === e.nodeType ? e.defaultView || e.parentWindow : !1
	}
	x.each({
		Height : "height",
		Width : "width"
	}, function (e, n) {
		x.each({
			padding : "inner" + e,
			content : n,
			"" : "outer" + e
		}, function (r, i) {
			x.fn[i] = function (i, o) {
				var a = arguments.length && (r || "boolean" != typeof i),
				s = r || (i === !0 || o === !0 ? "margin" : "border");
				return x.access(this, function (n, r, i) {
					var o;
					return x.isWindow(n) ? n.document.documentElement["client" + e] : 9 === n.nodeType ? (o = n.documentElement, Math.max(n.body["scroll" + e], o["scroll" + e], n.body["offset" + e], o["offset" + e], o["client" + e])) : i === t ? x.css(n, r, s) : x.style(n, r, i, s)
				}, n, a ? i : t, a, null)
			}
		})
	}),
	x.fn.size = function () {
		return this.length
	},
	x.fn.andSelf = x.fn.addBack,
	"object" == typeof module && module && "object" == typeof module.exports ? module.exports = x : (e.jQuery = e.$ = x, "function" == typeof define && define.amd && define("jquery", [], function () {
				return x
			}))
})(window);
(function (jQuery, window, undefined) {
	var warnedAbout = {};
	jQuery.migrateWarnings = [];
	if (!jQuery.migrateMute && window.console && console.log) {
		console.log("JQMIGRATE: Logging is active")
	}
	if (jQuery.migrateTrace === undefined) {
		jQuery.migrateTrace = true
	}
	jQuery.migrateReset = function () {
		warnedAbout = {};
		jQuery.migrateWarnings.length = 0
	};
	function migrateWarn(msg) {
		if (!warnedAbout[msg]) {
			warnedAbout[msg] = true;
			jQuery.migrateWarnings.push(msg);
			if (window.console && console.warn && !jQuery.migrateMute) {
				console.warn("JQMIGRATE: " + msg);
				if (jQuery.migrateTrace && console.trace) {
					console.trace()
				}
			}
		}
	}
	function migrateWarnProp(obj, prop, value, msg) {
		if (Object.defineProperty) {
			try {
				Object.defineProperty(obj, prop, {
					configurable : true,
					enumerable : true,
					get : function () {
						migrateWarn(msg);
						return value
					},
					set : function (newValue) {
						migrateWarn(msg);
						value = newValue
					}
				});
				return
			} catch (err) {}
		}
		jQuery._definePropertyBroken = true;
		obj[prop] = value
	}
	if (document.compatMode === "BackCompat") {
		migrateWarn("jQuery is not compatible with Quirks Mode")
	}
	var attrFn = jQuery("<input/>", {
			size : 1
		}).attr("size") && jQuery.attrFn,
	oldAttr = jQuery.attr,
	valueAttrGet = jQuery.attrHooks.value && jQuery.attrHooks.value.get || function () {
		return null
	},
	valueAttrSet = jQuery.attrHooks.value && jQuery.attrHooks.value.set || function () {
		return undefined
	},
	rnoType = /^(?:input|button)$/i,
	rnoAttrNodeType = /^[238]$/,
	rboolean = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i,
	ruseDefault = /^(?:checked|selected)$/i;
	migrateWarnProp(jQuery, "attrFn", attrFn || {}, "jQuery.attrFn is deprecated");
	jQuery.attr = function (elem, name, value, pass) {
		var lowerName = name.toLowerCase(),
		nType = elem && elem.nodeType;
		if (pass) {
			if (oldAttr.length < 4) {
				migrateWarn("jQuery.fn.attr( props, pass ) is deprecated")
			}
			if (elem && !rnoAttrNodeType.test(nType) && (attrFn ? name in attrFn : jQuery.isFunction(jQuery.fn[name]))) {
				return jQuery(elem)[name](value)
			}
		}
		if (name === "type" && value !== undefined && rnoType.test(elem.nodeName) && elem.parentNode) {
			migrateWarn("Can't change the 'type' of an input or button in IE 6/7/8")
		}
		if (!jQuery.attrHooks[lowerName] && rboolean.test(lowerName)) {
			jQuery.attrHooks[lowerName] = {
				get : function (elem, name) {
					var attrNode,
					property = jQuery.prop(elem, name);
					return property === true || typeof property !== "boolean" && (attrNode = elem.getAttributeNode(name)) && attrNode.nodeValue !== false ? name.toLowerCase() : undefined
				},
				set : function (elem, value, name) {
					var propName;
					if (value === false) {
						jQuery.removeAttr(elem, name)
					} else {
						propName = jQuery.propFix[name] || name;
						if (propName in elem) {
							elem[propName] = true
						}
						elem.setAttribute(name, name.toLowerCase())
					}
					return name
				}
			};
			if (ruseDefault.test(lowerName)) {
				migrateWarn("jQuery.fn.attr('" + lowerName + "') may use property instead of attribute")
			}
		}
		return oldAttr.call(jQuery, elem, name, value)
	};
	jQuery.attrHooks.value = {
		get : function (elem, name) {
			var nodeName = (elem.nodeName || "").toLowerCase();
			if (nodeName === "button") {
				return valueAttrGet.apply(this, arguments)
			}
			if (nodeName !== "input" && nodeName !== "option") {
				migrateWarn("jQuery.fn.attr('value') no longer gets properties")
			}
			return name in elem ? elem.value : null
		},
		set : function (elem, value) {
			var nodeName = (elem.nodeName || "").toLowerCase();
			if (nodeName === "button") {
				return valueAttrSet.apply(this, arguments)
			}
			if (nodeName !== "input" && nodeName !== "option") {
				migrateWarn("jQuery.fn.attr('value', val) no longer sets properties")
			}
			elem.value = value
		}
	};
	var matched,
	browser,
	oldInit = jQuery.fn.init,
	oldParseJSON = jQuery.parseJSON,
	rquickExpr = /^(?:[^<]*(<[\w\W]+>)[^>]*|#([\w\-]*))$/;
	jQuery.fn.init = function (selector, context, rootjQuery) {
		var match;
		if (selector && typeof selector === "string" && !jQuery.isPlainObject(context) && (match = rquickExpr.exec(selector)) && match[1]) {
			if (selector.charAt(0) !== "<") {
				migrateWarn("$(html) HTML strings must start with '<' character")
			}
			if (context && context.context) {
				context = context.context
			}
			if (jQuery.parseHTML) {
				return oldInit.call(this, jQuery.parseHTML(jQuery.trim(selector), context, true), context, rootjQuery)
			}
		}
		return oldInit.apply(this, arguments)
	};
	jQuery.fn.init.prototype = jQuery.fn;
	jQuery.parseJSON = function (json) {
		if (!json && json !== null) {
			migrateWarn("jQuery.parseJSON requires a valid JSON string");
			return null
		}
		return oldParseJSON.apply(this, arguments)
	};
	jQuery.uaMatch = function (ua) {
		ua = ua.toLowerCase();
		var match = /(chrome)[ \/]([\w.]+)/.exec(ua) || /(webkit)[ \/]([\w.]+)/.exec(ua) || /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) || /(msie) ([\w.]+)/.exec(ua) || ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) || [];
		return {
			browser : match[1] || "",
			version : match[2] || "0"
		}
	};
	if (!jQuery.browser) {
		matched = jQuery.uaMatch(navigator.userAgent);
		browser = {};
		if (matched.browser) {
			browser[matched.browser] = true;
			browser.version = matched.version
		}
		if (browser.chrome) {
			browser.webkit = true
		} else if (browser.webkit) {
			browser.safari = true
		}
		jQuery.browser = browser
	}
	migrateWarnProp(jQuery, "browser", jQuery.browser, "jQuery.browser is deprecated");
	jQuery.sub = function () {
		function jQuerySub(selector, context) {
			return new jQuerySub.fn.init(selector, context)
		}
		jQuery.extend(true, jQuerySub, this);
		jQuerySub.superclass = this;
		jQuerySub.fn = jQuerySub.prototype = this();
		jQuerySub.fn.constructor = jQuerySub;
		jQuerySub.sub = this.sub;
		jQuerySub.fn.init = function init(selector, context) {
			if (context && context instanceof jQuery && !(context instanceof jQuerySub)) {
				context = jQuerySub(context)
			}
			return jQuery.fn.init.call(this, selector, context, rootjQuerySub)
		};
		jQuerySub.fn.init.prototype = jQuerySub.fn;
		var rootjQuerySub = jQuerySub(document);
		migrateWarn("jQuery.sub() is deprecated");
		return jQuerySub
	};
	jQuery.ajaxSetup({
		converters : {
			"text json" : jQuery.parseJSON
		}
	});
	var oldFnData = jQuery.fn.data;
	jQuery.fn.data = function (name) {
		var ret,
		evt,
		elem = this[0];
		if (elem && name === "events" && arguments.length === 1) {
			ret = jQuery.data(elem, name);
			evt = jQuery._data(elem, name);
			if ((ret === undefined || ret === evt) && evt !== undefined) {
				migrateWarn("Use of jQuery.fn.data('events') is deprecated");
				return evt
			}
		}
		return oldFnData.apply(this, arguments)
	};
	var rscriptType = /\/(java|ecma)script/i,
	oldSelf = jQuery.fn.andSelf || jQuery.fn.addBack;
	jQuery.fn.andSelf = function () {
		migrateWarn("jQuery.fn.andSelf() replaced by jQuery.fn.addBack()");
		return oldSelf.apply(this, arguments)
	};
	if (!jQuery.clean) {
		jQuery.clean = function (elems, context, fragment, scripts) {
			context = context || document;
			context = !context.nodeType && context[0] || context;
			context = context.ownerDocument || context;
			migrateWarn("jQuery.clean() is deprecated");
			var i,
			elem,
			handleScript,
			jsTags,
			ret = [];
			jQuery.merge(ret, jQuery.buildFragment(elems, context).childNodes);
			if (fragment) {
				handleScript = function (elem) {
					if (!elem.type || rscriptType.test(elem.type)) {
						return scripts ? scripts.push(elem.parentNode ? elem.parentNode.removeChild(elem) : elem) : fragment.appendChild(elem)
					}
				};
				for (i = 0; (elem = ret[i]) != null; i++) {
					if (!(jQuery.nodeName(elem, "script") && handleScript(elem))) {
						fragment.appendChild(elem);
						if (typeof elem.getElementsByTagName !== "undefined") {
							jsTags = jQuery.grep(jQuery.merge([], elem.getElementsByTagName("script")), handleScript);
							ret.splice.apply(ret, [i + 1, 0].concat(jsTags));
							i += jsTags.length
						}
					}
				}
			}
			return ret
		}
	}
	var eventAdd = jQuery.event.add,
	eventRemove = jQuery.event.remove,
	eventTrigger = jQuery.event.trigger,
	oldToggle = jQuery.fn.toggle,
	oldLive = jQuery.fn.live,
	oldDie = jQuery.fn.die,
	ajaxEvents = "ajaxStart|ajaxStop|ajaxSend|ajaxComplete|ajaxError|ajaxSuccess",
	rajaxEvent = new RegExp("\\b(?:" + ajaxEvents + ")\\b"),
	rhoverHack = /(?:^|\s)hover(\.\S+|)\b/,
	hoverHack = function (events) {
		if (typeof events !== "string" || jQuery.event.special.hover) {
			return events
		}
		if (rhoverHack.test(events)) {
			migrateWarn("'hover' pseudo-event is deprecated, use 'mouseenter mouseleave'")
		}
		return events && events.replace(rhoverHack, "mouseenter$1 mouseleave$1")
	};
	if (jQuery.event.props && jQuery.event.props[0] !== "attrChange") {
		jQuery.event.props.unshift("attrChange", "attrName", "relatedNode", "srcElement")
	}
	if (jQuery.event.dispatch) {
		migrateWarnProp(jQuery.event, "handle", jQuery.event.dispatch, "jQuery.event.handle is undocumented and deprecated")
	}
	jQuery.event.add = function (elem, types, handler, data, selector) {
		if (elem !== document && rajaxEvent.test(types)) {
			migrateWarn("AJAX events should be attached to document: " + types)
		}
		eventAdd.call(this, elem, hoverHack(types || ""), handler, data, selector)
	};
	jQuery.event.remove = function (elem, types, handler, selector, mappedTypes) {
		eventRemove.call(this, elem, hoverHack(types) || "", handler, selector, mappedTypes)
	};
	jQuery.fn.error = function () {
		var args = Array.prototype.slice.call(arguments, 0);
		migrateWarn("jQuery.fn.error() is deprecated");
		args.splice(0, 0, "error");
		if (arguments.length) {
			return this.bind.apply(this, args)
		}
		this.triggerHandler.apply(this, args);
		return this
	};
	jQuery.fn.toggle = function (fn, fn2) {
		if (!jQuery.isFunction(fn) || !jQuery.isFunction(fn2)) {
			return oldToggle.apply(this, arguments)
		}
		migrateWarn("jQuery.fn.toggle(handler, handler...) is deprecated");
		var args = arguments,
		guid = fn.guid || jQuery.guid++,
		i = 0,
		toggler = function (event) {
			var lastToggle = (jQuery._data(this, "lastToggle" + fn.guid) || 0) % i;
			jQuery._data(this, "lastToggle" + fn.guid, lastToggle + 1);
			event.preventDefault();
			return args[lastToggle].apply(this, arguments) || false
		};
		toggler.guid = guid;
		while (i < args.length) {
			args[i++].guid = guid
		}
		return this.click(toggler)
	};
	jQuery.fn.live = function (types, data, fn) {
		migrateWarn("jQuery.fn.live() is deprecated");
		if (oldLive) {
			return oldLive.apply(this, arguments)
		}
		jQuery(this.context).on(types, this.selector, data, fn);
		return this
	};
	jQuery.fn.die = function (types, fn) {
		migrateWarn("jQuery.fn.die() is deprecated");
		if (oldDie) {
			return oldDie.apply(this, arguments)
		}
		jQuery(this.context).off(types, this.selector || "**", fn);
		return this
	};
	jQuery.event.trigger = function (event, data, elem, onlyHandlers) {
		if (!elem && !rajaxEvent.test(event)) {
			migrateWarn("Global events are undocumented and deprecated")
		}
		return eventTrigger.call(this, event, data, elem || document, onlyHandlers)
	};
	jQuery.each(ajaxEvents.split("|"), function (_, name) {
		jQuery.event.special[name] = {
			setup : function () {
				var elem = this;
				if (elem !== document) {
					jQuery.event.add(document, name + "." + jQuery.guid, function () {
						jQuery.event.trigger(name, null, elem, true)
					});
					jQuery._data(this, name, jQuery.guid++)
				}
				return false
			},
			teardown : function () {
				if (this !== document) {
					jQuery.event.remove(document, name + "." + jQuery._data(this, name))
				}
				return false
			}
		}
	})
})(jQuery, window);
jQuery.cookie = function (name, value, options) {
	if (typeof value != "undefined") {
		options = options || {};
		if (value === null) {
			value = "";
			options.expires = -1
		}
		var expires = "";
		if (options.expires && (typeof options.expires == "number" || options.expires.toUTCString)) {
			var date;
			if (typeof options.expires == "number") {
				date = new Date;
				date.setTime(date.getTime() + options.expires * 24 * 60 * 60 * 1e3)
			} else {
				date = options.expires
			}
			expires = "; expires=" + date.toUTCString()
		}
		var path = options.path ? "; path=" + options.path : "";
		var domain = options.domain ? "; domain=" + options.domain : "";
		var secure = options.secure ? "; secure" : "";
		document.cookie = [name, "=", encodeURIComponent(value), expires, path, domain, secure].join("")
	} else {
		var cookieValue = null;
		if (document.cookie && document.cookie != "") {
			var cookies = document.cookie.split(";");
			for (var i = 0; i < cookies.length; i++) {
				var cookie = jQuery.trim(cookies[i]);
				if (cookie.substring(0, name.length + 1) == name + "=") {
					cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
					break
				}
			}
		}
		return cookieValue
	}
};
(function ($) {
	function Placeholder(input) {
		this.input = input;
		if (input.attr("type") == "password") {
			this.handlePassword()
		}
		$(input[0].form).submit(function () {
			if (input.hasClass("placeholder") && input[0].value == input.attr("placeholder")) {
				input[0].value = ""
			}
		})
	}
	Placeholder.prototype = {
		show : function (loading) {
			if (this.input[0].value === "" || loading && this.valueIsPlaceholder()) {
				if (this.isPassword) {
					try {
						this.input[0].setAttribute("type", "text")
					} catch (e) {
						this.input.before(this.fakePassword.show()).hide()
					}
				}
				this.input.addClass("placeholder");
				this.input[0].value = this.input.attr("placeholder")
			}
		},
		hide : function () {
			if (this.valueIsPlaceholder() && this.input.hasClass("placeholder")) {
				this.input.removeClass("placeholder");
				this.input[0].value = "";
				if (this.isPassword) {
					try {
						this.input[0].setAttribute("type", "password")
					} catch (e) {}
					this.input.show();
					this.input[0].focus()
				}
			}
		},
		valueIsPlaceholder : function () {
			return this.input[0].value == this.input.attr("placeholder")
		},
		handlePassword : function () {
			var input = this.input;
			input.attr("realType", "password");
			this.isPassword = true;
			if ($.browser.msie && input[0].outerHTML) {
				var fakeHTML = $(input[0].outerHTML.replace(/type=(['"])?password\1/gi, "type=$1text$1"));
				this.fakePassword = fakeHTML.val(input.attr("placeholder")).addClass("placeholder").focus(function () {
						input.trigger("focus");
						$(this).hide()
					});
				$(input[0].form).submit(function () {
					fakeHTML.remove();
					input.show()
				})
			}
		}
	};
	var NATIVE_SUPPORT = !!("placeholder" in document.createElement("input"));
	$.fn.placeholder = function () {
		return NATIVE_SUPPORT ? this : this.each(function () {
			var input = $(this);
			var placeholder = new Placeholder(input);
			placeholder.show(true);
			input.focus(function () {
				placeholder.hide()
			});
			input.blur(function () {
				placeholder.show(false)
			});
			if ($.browser.msie) {
				$(window).load(function () {
					if (input.val()) {
						input.removeClass("placeholder")
					}
					placeholder.show(true)
				});
				input.focus(function () {
					if (this.value == "") {
						var range = this.createTextRange();
						range.collapse(true);
						range.moveStart("character", 0);
						range.select()
					}
				})
			}
		})
	}
})(jQuery);
(function () {
	(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["macros.html"] = function () {
		function root(env, context, frame, runtime, cb) {
			var lineno = null;
			var colno = null;
			var output = "";
			try {
				var macro_t_1 = runtime.makeMacro(["result"], [], function (l_result, kwargs) {
						frame = frame.push();
						kwargs = kwargs || {};
						frame.set("result", l_result);
						var output = "";
						output += '\n  <div class="result ';
						output += runtime.suppressValue(runtime.memberLookup(l_result, "type", env.autoesc), env.autoesc);
						output += '">\n    <h3><a class="title" href="';
						output += runtime.suppressValue(runtime.memberLookup(l_result, "url", env.autoesc), env.autoesc);
						output += '" data-ga-click="_trackEvent | Instant Search | Result Clicked">';
						output += runtime.suppressValue(runtime.memberLookup(l_result, "title", env.autoesc), env.autoesc);
						output += '</a></h3>\n    <a tabindex="-1" href="';
						output += runtime.suppressValue(runtime.memberLookup(l_result, "url", env.autoesc), env.autoesc);
						output += '" data-ga-click="_trackEvent | Instant Search | Result Clicked">';
						output += runtime.suppressValue(env.getFilter("safe").call(context, runtime.memberLookup(l_result, "search_summary", env.autoesc)), env.autoesc);
						output += "</a>\n    ";
						if (runtime.memberLookup(l_result, "type", env.autoesc) == "question") {
							output += '\n      <ul class="thread-meta cf">\n        ';
							if (runtime.memberLookup(l_result, "is_solved", env.autoesc)) {
								output += "\n          <li>";
								output += runtime.suppressValue((lineno = 7, colno = 16, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["Solved"])), env.autoesc);
								output += "</li>\n        "
							}
							output += "\n        <li>\n          ";
							if (runtime.memberLookup(l_result, "num_answers", env.autoesc) > 0) {
								output += "\n            ";
								output += runtime.suppressValue(env.getFilter("f").call(context, (lineno = 11, colno = 21, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "ngettext"), "ngettext", ["1 reply", "%s replies", runtime.memberLookup(l_result, "num_answers", env.autoesc)])), [runtime.memberLookup(l_result, "num_answers", env.autoesc)]), env.autoesc);
								output += "\n          "
							} else {
								output += "\n            ";
								output += runtime.suppressValue((lineno = 13, colno = 14, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["No replies"])), env.autoesc);
								output += "\n          "
							}
							output += "\n        </li>\n        <li>\n          ";
							output += runtime.suppressValue(env.getFilter("f").call(context, (lineno = 17, colno = 19, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "ngettext"), "ngettext", ["1 person has this problem", "%s people have this problem", runtime.memberLookup(l_result, "num_votes", env.autoesc)])), [runtime.memberLookup(l_result, "num_votes", env.autoesc)]), env.autoesc);
							output += "\n        </li>\n        <li>\n          ";
							output += runtime.suppressValue(env.getFilter("f").call(context, (lineno = 20, colno = 19, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "ngettext"), "ngettext", ["1 new this week", "%s new this week", runtime.memberLookup(l_result, "num_votes_past_week", env.autoesc)])), [runtime.memberLookup(l_result, "num_votes_past_week", env.autoesc)]), env.autoesc);
							output += "\n        </li>\n      </ul>\n    "
						}
						output += "\n  </div>\n";
						frame = frame.pop();
						return new runtime.SafeString(output)
					});
				context.addExport("search_result");
				context.setVariable("search_result", macro_t_1);
				output += "\n";
				cb(null, output)
			} catch (e) {
				cb(runtime.handleError(e, lineno, colno))
			}
		}
		return {
			root : root
		}
	}
	()
})();
(function () {
	(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["mobile-product-search-results.html"] = function () {
		function root(env, context, frame, runtime, cb) {
			var lineno = null;
			var colno = null;
			var output = "";
			try {
				output += '<div class="search-header">';
				output += runtime.suppressValue((lineno = 0, colno = 29, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["Search results"])), env.autoesc);
				output += '</div>\n<ul class="document-list">\n  ';
				if (runtime.contextOrFrameLookup(context, frame, "num_results") > 0) {
					output += "\n    ";
					frame = frame.push();
					var t_3 = runtime.contextOrFrameLookup(context, frame, "results");
					if (t_3) {
						for (var t_1 = 0; t_1 < t_3.length; t_1++) {
							var t_4 = t_3[t_1];
							frame.set("doc", t_4);
							output += '\n      <li>\n        <a href="';
							output += runtime.suppressValue(runtime.memberLookup(t_4, "url", env.autoesc), env.autoesc);
							output += '">';
							output += runtime.suppressValue(runtime.memberLookup(t_4, "title", env.autoesc), env.autoesc);
							output += "</a>\n      </li>\n    "
						}
					}
					frame = frame.pop();
					output += "\n  "
				} else {
					output += '\n    <li><a href="#">';
					output += runtime.suppressValue((lineno = 9, colno = 22, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["No results found."])), env.autoesc);
					output += "</a></li>\n  "
				}
				output += "\n</ul>\n";
				cb(null, output)
			} catch (e) {
				cb(runtime.handleError(e, lineno, colno))
			}
		}
		return {
			root : root
		}
	}
	()
})();
(function () {
	(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["mobile-search-results.html"] = function () {
		function root(env, context, frame, runtime, cb) {
			var lineno = null;
			var colno = null;
			var output = "";
			try {
				if (runtime.contextOrFrameLookup(context, frame, "results")) {
					output += '\n  <ol class="search-results">\n    ';
					frame = frame.push();
					var t_3 = runtime.contextOrFrameLookup(context, frame, "results");
					if (t_3) {
						for (var t_1 = 0; t_1 < t_3.length; t_1++) {
							var t_4 = t_3[t_1];
							frame.set("doc", t_4);
							output += '\n      <li class="';
							output += runtime.suppressValue(runtime.memberLookup(t_4, "type", env.autoesc), env.autoesc);
							output += '">\n        <a href="';
							output += runtime.suppressValue(env.getFilter("encodeURI").call(context, env.getFilter("urlparams").call(context, runtime.memberLookup(t_4, "url", env.autoesc), runtime.makeKeywordArgs({
											s : runtime.contextOrFrameLookup(context, frame, "q"),
											as : "s"
										}))), env.autoesc);
							output += '">\n          <span class="title">';
							output += runtime.suppressValue(runtime.memberLookup(t_4, "title", env.autoesc), env.autoesc);
							output += "</span>\n          ";
							output += runtime.suppressValue(env.getFilter("safe").call(context, runtime.memberLookup(t_4, "search_summary", env.autoesc)), env.autoesc);
							output += "\n        </a>\n      </li>\n    "
						}
					}
					frame = frame.pop();
					output += "\n  </ol>\n"
				} else {
					output += "\n  ";
					output += runtime.suppressValue((lineno = 12, colno = 4, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["No results found"])), env.autoesc);
					output += "\n"
				}
				output += "\n";
				cb(null, output)
			} catch (e) {
				cb(runtime.handleError(e, lineno, colno))
			}
		}
		return {
			root : root
		}
	}
	()
})();
(function () {
	(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["search-results-list.html"] = function () {
		function root(env, context, frame, runtime, cb) {
			var lineno = null;
			var colno = null;
			var output = "";
			try {
				env.getTemplate("macros.html", function (t_2, t_1) {
					if (t_2) {
						cb(t_2);
						return
					}
					t_1.getExported(function (t_3, t_1) {
						if (t_3) {
							cb(t_3);
							return
						}
						if (t_1.hasOwnProperty("search_result")) {
							var t_4 = t_1.search_result
						} else {
							cb(new Error("cannot import 'search_result'"));
							return
						}
						context.setVariable("search_result", t_4);
						output += "\n\n";
						if (runtime.contextOrFrameLookup(context, frame, "num_results") > 0) {
							output += "\n  <h2>\n    ";
							output += "\n    ";
							output += runtime.suppressValue(env.getFilter("safe").call(context, env.getFilter("f").call(context, (lineno = 5, colno = 13, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "ngettext"), "ngettext", ["Found <strong>%(n)s</strong> result for <strong>%(q)s</strong> for <strong>%(product)s</strong>", "Found <strong>%(n)s</strong> results for <strong>%(q)s</strong> for <strong>%(product)s</strong>", runtime.contextOrFrameLookup(context, frame, "num_results")])), {
										n : runtime.contextOrFrameLookup(context, frame, "num_results"),
										q : runtime.contextOrFrameLookup(context, frame, "q"),
										product : runtime.contextOrFrameLookup(context, frame, "product_titles")
									}, true)), env.autoesc);
							output += '\n  </h2>\n\n  <div class="content-box">\n    ';
							frame = frame.push();
							var t_7 = runtime.contextOrFrameLookup(context, frame, "results");
							if (t_7) {
								for (var t_5 = 0; t_5 < t_7.length; t_5++) {
									var t_8 = t_7[t_5];
									frame.set("doc", t_8);
									output += "\n      ";
									output += runtime.suppressValue((lineno = 14, colno = 20, runtime.callWrap(t_4, "search_result", [t_8])), env.autoesc);
									output += "\n    "
								}
							}
							frame = frame.pop();
							output += "\n  </div>\n"
						} else {
							output += "\n  <h2>\n    ";
							output += "\n    ";
							output += runtime.suppressValue(env.getFilter("safe").call(context, env.getFilter("f").call(context, (lineno = 20, colno = 6, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["We couldn't find any results for <strong>%(q)s</strong> in <strong>%(l)s</strong>. Maybe one of these articles will be helpful?"])), {
										q : runtime.contextOrFrameLookup(context, frame, "q"),
										l : runtime.contextOrFrameLookup(context, frame, "lang_name")
									}, true)), env.autoesc);
							output += '\n  </h2>\n\n  <div class="content-box">\n    ';
							frame = frame.push();
							var t_11 = runtime.contextOrFrameLookup(context, frame, "fallback_results");
							if (t_11) {
								for (var t_9 = 0; t_9 < t_11.length; t_9++) {
									var t_12 = t_11[t_9];
									frame.set("doc", t_12);
									output += '\n      <div class="result document">\n        <h3><a class="title" href="';
									output += runtime.suppressValue(runtime.memberLookup(t_12, "url", env.autoesc), env.autoesc);
									output += '">';
									output += runtime.suppressValue(runtime.memberLookup(t_12, "document_title", env.autoesc), env.autoesc);
									output += '</a></h3>\n        <a tabindex="-1" href="';
									output += runtime.suppressValue(runtime.memberLookup(t_12, "url", env.autoesc), env.autoesc);
									output += '">';
									output += runtime.suppressValue(runtime.memberLookup(t_12, "document_summary", env.autoesc), env.autoesc);
									output += "</a>\n      </div>\n    "
								}
							}
							frame = frame.pop();
							output += "\n  </div>\n"
						}
						output += "\n\n";
						if (runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "pagination"), "num_pages", env.autoesc) > 1) {
							output += '\n  <ol class="pagination cf">\n  ';
							if (runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "pagination"), "has_previous", env.autoesc)) {
								output += '\n    <li class="prev">\n      <a class="btn-page btn-page-prev" href="#" data-instant-search="link" data-href="';
								output += runtime.suppressValue(env.getFilter("urlparams").call(context, runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "pagination"), "url", env.autoesc), {
										page : runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "pagination"), "number", env.autoesc) - 1
									}), env.autoesc);
								output += '">\n        ';
								output += runtime.suppressValue((lineno = 40, colno = 10, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["Previous"])), env.autoesc);
								output += "\n      </a>\n    </li>\n  "
							}
							output += "\n  ";
							if (runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "pagination"), "dotted_lower", env.autoesc)) {
								output += '\n    <li><a href="#" data-instant-search="link" data-href="';
								output += runtime.suppressValue(env.getFilter("urlparams").call(context, runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "pagination"), "url", env.autoesc), {
										page : 1
									}), env.autoesc);
								output += '">';
								output += runtime.suppressValue(1, env.autoesc);
								output += "</a></li>\n    ";
								if (runtime.memberLookup(runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "pagination"), "page_range", env.autoesc), 0, env.autoesc) != 2) {
									output += '\n      <li class="skip">&hellip;</li>\n    '
								}
								output += "\n  "
							}
							output += "\n  ";
							frame = frame.push();
							var t_15 = runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "pagination"), "page_range", env.autoesc);
							if (t_15) {
								for (var t_13 = 0; t_13 < t_15.length; t_13++) {
									var t_16 = t_15[t_13];
									frame.set("x", t_16);
									output += "\n    <li ";
									output += runtime.suppressValue(env.getFilter("class_selected").call(context, t_16, runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "pagination"), "number", env.autoesc)), env.autoesc);
									output += '>\n      <a href="#" class="';
									if (t_16 == runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "pagination"), "number", env.autoesc)) {
										output += "btn-page"
									}
									output += '" data-instant-search="link" data-href="';
									output += runtime.suppressValue(env.getFilter("urlparams").call(context, runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "pagination"), "url", env.autoesc), {
											page : t_16
										}), env.autoesc);
									output += '">';
									output += runtime.suppressValue(t_16, env.autoesc);
									output += "</a>\n    </li>\n  "
								}
							}
							frame = frame.pop();
							output += "\n  ";
							if (runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "page"), "dotted_upper", env.autoesc)) {
								output += "\n    ";
								if (runtime.memberLookup(runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "pagination"), "page_range", env.autoesc), -1, env.autoesc) != runtime.contextOrFrameLookup(context, frame, "num_pages") - 1) {
									output += '\n      <li class="skip">&hellip;</li>\n    '
								}
								output += '\n    <li><a href="#" data-instant-search="link" data-href="';
								output += runtime.suppressValue(env.getFilter("urlparams").call(context, runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "pagination"), "url", env.autoesc), {
										page : runtime.contextOrFrameLookup(context, frame, "num_pages")
									}), env.autoesc);
								output += '">';
								output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "num_pages"), env.autoesc);
								output += "</a></li>\n  "
							}
							output += "\n  ";
							if (runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "pagination"), "has_next", env.autoesc)) {
								output += '\n    <li class="next">\n      <a class="btn-page btn-page-next" href="#" data-instant-search="link" data-href="';
								output += runtime.suppressValue(env.getFilter("urlparams").call(context, runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "pagination"), "url", env.autoesc), {
										page : runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "pagination"), "number", env.autoesc) + 1
									}), env.autoesc);
								output += '">\n        ';
								output += runtime.suppressValue((lineno = 64, colno = 10, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["Next"])), env.autoesc);
								output += "\n      </a>\n    </li>\n  "
							}
							output += "\n  </ol>\n"
						}
						output += "\n";
						cb(null, output)
					})
				})
			} catch (e) {
				cb(runtime.handleError(e, lineno, colno))
			}
		}
		return {
			root : root
		}
	}
	()
})();
(function () {
	(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["search-results.html"] = function () {
		function root(env, context, frame, runtime, cb) {
			var lineno = null;
			var colno = null;
			var output = "";
			try {
				output += '<div id="search-results">\n  <div class="grid_3">\n    ';
				var t_1;
				t_1 = runtime.contextOrFrameLookup(context, frame, "base_url");
				frame.set("base_doctype_url", t_1);
				if (!frame.parent) {
					context.setVariable("base_doctype_url", t_1);
					context.addExport("base_doctype_url")
				}
				output += "\n    ";
				if (runtime.contextOrFrameLookup(context, frame, "product")) {
					output += "\n      ";
					t_1 = env.getFilter("urlparams").call(context, t_1, runtime.makeKeywordArgs({
								product : runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "product"), "slug", env.autoesc)
							}));
					frame.set("base_doctype_url", t_1);
					if (!frame.parent) {
						context.setVariable("base_doctype_url", t_1);
						context.addExport("base_doctype_url")
					}
					output += "\n    "
				}
				output += '\n    <ul id="doctype-filter" class="search-filter sidebar-nav">\n      <li ';
				output += runtime.suppressValue(env.getFilter("class_selected").call(context, runtime.contextOrFrameLookup(context, frame, "w"), 3), env.autoesc);
				output += '>\n        <a href="#" data-instant-search-set-params="w=3" data-instant-search="link" data-href="';
				output += runtime.suppressValue(env.getFilter("encodeURI").call(context, t_1), env.autoesc);
				output += '">\n          ';
				output += runtime.suppressValue((lineno = 9, colno = 12, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["Show Everything"])), env.autoesc);
				output += "\n        </a>\n      </li>\n      <li ";
				output += runtime.suppressValue(env.getFilter("class_selected").call(context, runtime.contextOrFrameLookup(context, frame, "w"), 1), env.autoesc);
				output += '>\n        <a href="#" data-instant-search-set-params="w=1" data-instant-search="link" data-href="';
				output += runtime.suppressValue(env.getFilter("encodeURI").call(context, env.getFilter("urlparams").call(context, t_1, runtime.makeKeywordArgs({
								w : 1
							}))), env.autoesc);
				output += '">\n          ';
				output += runtime.suppressValue((lineno = 14, colno = 12, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["Help Articles Only"])), env.autoesc);
				output += "\n        </a>\n      </li>\n      <li ";
				output += runtime.suppressValue(env.getFilter("class_selected").call(context, runtime.contextOrFrameLookup(context, frame, "w"), 2), env.autoesc);
				output += '>\n        <a href="#" data-instant-search-set-params="w=2" data-instant-search="link" data-href="';
				output += runtime.suppressValue(env.getFilter("encodeURI").call(context, env.getFilter("urlparams").call(context, t_1, runtime.makeKeywordArgs({
								w : 2
							}))), env.autoesc);
				output += '">\n          ';
				output += runtime.suppressValue((lineno = 19, colno = 12, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["Community Discussion Only"])), env.autoesc);
				output += "\n        </a>\n      </li>\n    </ul>\n\n    ";
				var t_2;
				t_2 = runtime.contextOrFrameLookup(context, frame, "base_url");
				frame.set("base_product_url", t_2);
				if (!frame.parent) {
					context.setVariable("base_product_url", t_2);
					context.addExport("base_product_url")
				}
				output += "\n    ";
				if (runtime.contextOrFrameLookup(context, frame, "w") != 3) {
					output += "\n      ";
					t_2 = env.getFilter("urlparams").call(context, t_2, runtime.makeKeywordArgs({
								w : runtime.contextOrFrameLookup(context, frame, "w")
							}));
					frame.set("base_product_url", t_2);
					if (!frame.parent) {
						context.setVariable("base_product_url", t_2);
						context.addExport("base_product_url")
					}
					output += "\n    "
				}
				output += '\n    <ul id="product-filter" class="search-filter sidebar-nav">\n      <li ';
				output += runtime.suppressValue(env.getFilter("class_selected").call(context, runtime.contextOrFrameLookup(context, frame, "product"), runtime.contextOrFrameLookup(context, frame, "null")), env.autoesc);
				output += '>\n        <a href="#" data-instant-search-unset-params="product" data-instant-search-set-params="all_products=1" data-instant-search="link" data-href="';
				output += runtime.suppressValue(env.getFilter("encodeURI").call(context, env.getFilter("urlparams").call(context, t_2, runtime.makeKeywordArgs({
								all_products : 1
							}))), env.autoesc);
				output += '">\n          ';
				output += runtime.suppressValue((lineno = 31, colno = 12, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["All Products"])), env.autoesc);
				output += "\n        </a>\n      </li>\n      ";
				frame = frame.push();
				var t_5 = runtime.contextOrFrameLookup(context, frame, "products");
				if (t_5) {
					for (var t_3 = 0; t_3 < t_5.length; t_3++) {
						var t_6 = t_5[t_3];
						frame.set("p", t_6);
						output += "\n        <li ";
						output += runtime.suppressValue(env.getFilter("class_selected").call(context, runtime.contextOrFrameLookup(context, frame, "product"), runtime.memberLookup(t_6, "slug", env.autoesc)), env.autoesc);
						output += '>\n          <a href="#" data-instant-search-set-params="product=';
						output += runtime.suppressValue(runtime.memberLookup(t_6, "slug", env.autoesc), env.autoesc);
						output += '" data-instant-search-unset-params="all_products" data-instant-search="link" data-href="';
						output += runtime.suppressValue(env.getFilter("encodeURI").call(context, env.getFilter("urlparams").call(context, t_2, runtime.makeKeywordArgs({
										product : runtime.memberLookup(t_6, "slug", env.autoesc)
									}))), env.autoesc);
						output += '">\n            ';
						output += runtime.suppressValue(runtime.memberLookup(t_6, "title", env.autoesc), env.autoesc);
						output += "\n          </a>\n        </li>\n      "
					}
				}
				frame = frame.pop();
				output += '\n    </ul>\n    <br />\n  </div>\n\n  <div class="grid_9" id="search-results-list">\n    ';
				env.getTemplate("search-results-list.html", function (t_9, t_7) {
					if (t_9) {
						cb(t_9);
						return
					}
					t_7.render(context.getVariables(), frame.push(), function (t_10, t_8) {
						if (t_10) {
							cb(t_10);
							return
						}
						output += t_8;
						output += "\n  </div>\n</div>\n";
						cb(null, output)
					})
				})
			} catch (e) {
				cb(runtime.handleError(e, lineno, colno))
			}
		}
		return {
			root : root
		}
	}
	()
})();
(function () {
	(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["wiki-related-doc.html"] = function () {
		function root(env, context, frame, runtime, cb) {
			var lineno = null;
			var colno = null;
			var output = "";
			try {
				output += '<li data-pk="';
				output += runtime.suppressValue(runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "doc"), "id", env.autoesc), env.autoesc);
				output += '">\n  <input type="checkbox" name="';
				output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "name"), env.autoesc);
				output += '" value="';
				output += runtime.suppressValue(runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "doc"), "id", env.autoesc), env.autoesc);
				output += '" checked />\n  ';
				output += runtime.suppressValue(runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "doc"), "title", env.autoesc), env.autoesc);
				output += '\n  <span data-close-type="remove" class="close-button"></span>\n</li>\n';
				cb(null, output)
			} catch (e) {
				cb(runtime.handleError(e, lineno, colno))
			}
		}
		return {
			root : root
		}
	}
	()
})();
(function () {
	(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["wiki-search-results.html"] = function () {
		function root(env, context, frame, runtime, cb) {
			var lineno = null;
			var colno = null;
			var output = "";
			try {
				output += "<ul>\n  ";
				frame = frame.push();
				var t_3 = runtime.contextOrFrameLookup(context, frame, "results");
				if (t_3) {
					for (var t_1 = 0; t_1 < t_3.length; t_1++) {
						var t_4 = t_3[t_1];
						frame.set("doc", t_4);
						output += '\n    <li data-pk="';
						output += runtime.suppressValue(runtime.memberLookup(t_4, "id", env.autoesc), env.autoesc);
						output += '">';
						output += runtime.suppressValue(runtime.memberLookup(t_4, "title", env.autoesc), env.autoesc);
						output += "</li>\n  "
					}
				}
				frame = frame.pop();
				output += "\n</ul>\n";
				cb(null, output)
			} catch (e) {
				cb(runtime.handleError(e, lineno, colno))
			}
		}
		return {
			root : root
		}
	}
	()
})();
(function () {
	(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["macros.html"] = function () {
		function root(env, context, frame, runtime, cb) {
			var lineno = null;
			var colno = null;
			var output = "";
			try {
				var macro_t_1 = runtime.makeMacro(["result"], [], function (l_result, kwargs) {
						frame = frame.push();
						kwargs = kwargs || {};
						frame.set("result", l_result);
						var output = "";
						output += '\n  <div class="result ';
						output += runtime.suppressValue(runtime.memberLookup(l_result, "type", env.autoesc), env.autoesc);
						output += '">\n    <h3><a class="title" href="';
						output += runtime.suppressValue(runtime.memberLookup(l_result, "url", env.autoesc), env.autoesc);
						output += '" data-ga-click="_trackEvent | Instant Search | Result Clicked">';
						output += runtime.suppressValue(runtime.memberLookup(l_result, "title", env.autoesc), env.autoesc);
						output += '</a></h3>\n    <a tabindex="-1" href="';
						output += runtime.suppressValue(runtime.memberLookup(l_result, "url", env.autoesc), env.autoesc);
						output += '" data-ga-click="_trackEvent | Instant Search | Result Clicked">';
						output += runtime.suppressValue(env.getFilter("safe").call(context, runtime.memberLookup(l_result, "search_summary", env.autoesc)), env.autoesc);
						output += "</a>\n    ";
						if (runtime.memberLookup(l_result, "type", env.autoesc) == "question") {
							output += '\n      <ul class="thread-meta cf">\n        ';
							if (runtime.memberLookup(l_result, "is_solved", env.autoesc)) {
								output += "\n          <li>";
								output += runtime.suppressValue((lineno = 7, colno = 16, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["Solved"])), env.autoesc);
								output += "</li>\n        "
							}
							output += "\n        <li>\n          ";
							if (runtime.memberLookup(l_result, "num_answers", env.autoesc) > 0) {
								output += "\n            ";
								output += runtime.suppressValue(env.getFilter("f").call(context, (lineno = 11, colno = 21, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "ngettext"), "ngettext", ["1 reply", "%s replies", runtime.memberLookup(l_result, "num_answers", env.autoesc)])), [runtime.memberLookup(l_result, "num_answers", env.autoesc)]), env.autoesc);
								output += "\n          "
							} else {
								output += "\n            ";
								output += runtime.suppressValue((lineno = 13, colno = 14, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["No replies"])), env.autoesc);
								output += "\n          "
							}
							output += "\n        </li>\n        <li>\n          ";
							output += runtime.suppressValue(env.getFilter("f").call(context, (lineno = 17, colno = 19, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "ngettext"), "ngettext", ["1 person has this problem", "%s people have this problem", runtime.memberLookup(l_result, "num_votes", env.autoesc)])), [runtime.memberLookup(l_result, "num_votes", env.autoesc)]), env.autoesc);
							output += "\n        </li>\n        <li>\n          ";
							output += runtime.suppressValue(env.getFilter("f").call(context, (lineno = 20, colno = 19, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "ngettext"), "ngettext", ["1 new this week", "%s new this week", runtime.memberLookup(l_result, "num_votes_past_week", env.autoesc)])), [runtime.memberLookup(l_result, "num_votes_past_week", env.autoesc)]), env.autoesc);
							output += "\n        </li>\n      </ul>\n    "
						}
						output += "\n  </div>\n";
						frame = frame.pop();
						return new runtime.SafeString(output)
					});
				context.addExport("search_result");
				context.setVariable("search_result", macro_t_1);
				output += "\n";
				cb(null, output)
			} catch (e) {
				cb(runtime.handleError(e, lineno, colno))
			}
		}
		return {
			root : root
		}
	}
	()
})();
(function () {
	(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["mobile-product-search-results.html"] = function () {
		function root(env, context, frame, runtime, cb) {
			var lineno = null;
			var colno = null;
			var output = "";
			try {
				output += '<div class="search-header">';
				output += runtime.suppressValue((lineno = 0, colno = 29, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["Search results"])), env.autoesc);
				output += '</div>\n<ul class="document-list">\n  ';
				if (runtime.contextOrFrameLookup(context, frame, "num_results") > 0) {
					output += "\n    ";
					frame = frame.push();
					var t_3 = runtime.contextOrFrameLookup(context, frame, "results");
					if (t_3) {
						for (var t_1 = 0; t_1 < t_3.length; t_1++) {
							var t_4 = t_3[t_1];
							frame.set("doc", t_4);
							output += '\n      <li>\n        <a href="';
							output += runtime.suppressValue(runtime.memberLookup(t_4, "url", env.autoesc), env.autoesc);
							output += '">';
							output += runtime.suppressValue(runtime.memberLookup(t_4, "title", env.autoesc), env.autoesc);
							output += "</a>\n      </li>\n    "
						}
					}
					frame = frame.pop();
					output += "\n  "
				} else {
					output += '\n    <li><a href="#">';
					output += runtime.suppressValue((lineno = 9, colno = 22, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["No results found."])), env.autoesc);
					output += "</a></li>\n  "
				}
				output += "\n</ul>\n";
				cb(null, output)
			} catch (e) {
				cb(runtime.handleError(e, lineno, colno))
			}
		}
		return {
			root : root
		}
	}
	()
})();
(function () {
	(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["mobile-search-results.html"] = function () {
		function root(env, context, frame, runtime, cb) {
			var lineno = null;
			var colno = null;
			var output = "";
			try {
				if (runtime.contextOrFrameLookup(context, frame, "results")) {
					output += '\n  <ol class="search-results">\n    ';
					frame = frame.push();
					var t_3 = runtime.contextOrFrameLookup(context, frame, "results");
					if (t_3) {
						for (var t_1 = 0; t_1 < t_3.length; t_1++) {
							var t_4 = t_3[t_1];
							frame.set("doc", t_4);
							output += '\n      <li class="';
							output += runtime.suppressValue(runtime.memberLookup(t_4, "type", env.autoesc), env.autoesc);
							output += '">\n        <a href="';
							output += runtime.suppressValue(env.getFilter("encodeURI").call(context, env.getFilter("urlparams").call(context, runtime.memberLookup(t_4, "url", env.autoesc), runtime.makeKeywordArgs({
											s : runtime.contextOrFrameLookup(context, frame, "q"),
											as : "s"
										}))), env.autoesc);
							output += '">\n          <span class="title">';
							output += runtime.suppressValue(runtime.memberLookup(t_4, "title", env.autoesc), env.autoesc);
							output += "</span>\n          ";
							output += runtime.suppressValue(env.getFilter("safe").call(context, runtime.memberLookup(t_4, "search_summary", env.autoesc)), env.autoesc);
							output += "\n        </a>\n      </li>\n    "
						}
					}
					frame = frame.pop();
					output += "\n  </ol>\n"
				} else {
					output += "\n  ";
					output += runtime.suppressValue((lineno = 12, colno = 4, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["No results found"])), env.autoesc);
					output += "\n"
				}
				output += "\n";
				cb(null, output)
			} catch (e) {
				cb(runtime.handleError(e, lineno, colno))
			}
		}
		return {
			root : root
		}
	}
	()
})();
(function () {
	(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["search-results-list.html"] = function () {
		function root(env, context, frame, runtime, cb) {
			var lineno = null;
			var colno = null;
			var output = "";
			try {
				env.getTemplate("macros.html", function (t_2, t_1) {
					if (t_2) {
						cb(t_2);
						return
					}
					t_1.getExported(function (t_3, t_1) {
						if (t_3) {
							cb(t_3);
							return
						}
						if (t_1.hasOwnProperty("search_result")) {
							var t_4 = t_1.search_result
						} else {
							cb(new Error("cannot import 'search_result'"));
							return
						}
						context.setVariable("search_result", t_4);
						output += "\n\n";
						if (runtime.contextOrFrameLookup(context, frame, "num_results") > 0) {
							output += "\n  <h2>\n    ";
							output += "\n    ";
							output += runtime.suppressValue(env.getFilter("safe").call(context, env.getFilter("f").call(context, (lineno = 5, colno = 13, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "ngettext"), "ngettext", ["Found <strong>%(n)s</strong> result for <strong>%(q)s</strong> for <strong>%(product)s</strong>", "Found <strong>%(n)s</strong> results for <strong>%(q)s</strong> for <strong>%(product)s</strong>", runtime.contextOrFrameLookup(context, frame, "num_results")])), {
										n : runtime.contextOrFrameLookup(context, frame, "num_results"),
										q : runtime.contextOrFrameLookup(context, frame, "q"),
										product : runtime.contextOrFrameLookup(context, frame, "product_titles")
									}, true)), env.autoesc);
							output += '\n  </h2>\n\n  <div class="content-box">\n    ';
							frame = frame.push();
							var t_7 = runtime.contextOrFrameLookup(context, frame, "results");
							if (t_7) {
								for (var t_5 = 0; t_5 < t_7.length; t_5++) {
									var t_8 = t_7[t_5];
									frame.set("doc", t_8);
									output += "\n      ";
									output += runtime.suppressValue((lineno = 14, colno = 20, runtime.callWrap(t_4, "search_result", [t_8])), env.autoesc);
									output += "\n    "
								}
							}
							frame = frame.pop();
							output += "\n  </div>\n"
						} else {
							output += "\n  <h2>\n    ";
							output += "\n    ";
							output += runtime.suppressValue(env.getFilter("safe").call(context, env.getFilter("f").call(context, (lineno = 20, colno = 6, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["We couldn't find any results for <strong>%(q)s</strong> in <strong>%(l)s</strong>. Maybe one of these articles will be helpful?"])), {
										q : runtime.contextOrFrameLookup(context, frame, "q"),
										l : runtime.contextOrFrameLookup(context, frame, "lang_name")
									}, true)), env.autoesc);
							output += '\n  </h2>\n\n  <div class="content-box">\n    ';
							frame = frame.push();
							var t_11 = runtime.contextOrFrameLookup(context, frame, "fallback_results");
							if (t_11) {
								for (var t_9 = 0; t_9 < t_11.length; t_9++) {
									var t_12 = t_11[t_9];
									frame.set("doc", t_12);
									output += '\n      <div class="result document">\n        <h3><a class="title" href="';
									output += runtime.suppressValue(runtime.memberLookup(t_12, "url", env.autoesc), env.autoesc);
									output += '">';
									output += runtime.suppressValue(runtime.memberLookup(t_12, "document_title", env.autoesc), env.autoesc);
									output += '</a></h3>\n        <a tabindex="-1" href="';
									output += runtime.suppressValue(runtime.memberLookup(t_12, "url", env.autoesc), env.autoesc);
									output += '">';
									output += runtime.suppressValue(runtime.memberLookup(t_12, "document_summary", env.autoesc), env.autoesc);
									output += "</a>\n      </div>\n    "
								}
							}
							frame = frame.pop();
							output += "\n  </div>\n"
						}
						output += "\n\n";
						if (runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "pagination"), "num_pages", env.autoesc) > 1) {
							output += '\n  <ol class="pagination cf">\n  ';
							if (runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "pagination"), "has_previous", env.autoesc)) {
								output += '\n    <li class="prev">\n      <a class="btn-page btn-page-prev" href="#" data-instant-search="link" data-href="';
								output += runtime.suppressValue(env.getFilter("urlparams").call(context, runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "pagination"), "url", env.autoesc), {
										page : runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "pagination"), "number", env.autoesc) - 1
									}), env.autoesc);
								output += '">\n        ';
								output += runtime.suppressValue((lineno = 40, colno = 10, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["Previous"])), env.autoesc);
								output += "\n      </a>\n    </li>\n  "
							}
							output += "\n  ";
							if (runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "pagination"), "dotted_lower", env.autoesc)) {
								output += '\n    <li><a href="#" data-instant-search="link" data-href="';
								output += runtime.suppressValue(env.getFilter("urlparams").call(context, runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "pagination"), "url", env.autoesc), {
										page : 1
									}), env.autoesc);
								output += '">';
								output += runtime.suppressValue(1, env.autoesc);
								output += "</a></li>\n    ";
								if (runtime.memberLookup(runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "pagination"), "page_range", env.autoesc), 0, env.autoesc) != 2) {
									output += '\n      <li class="skip">&hellip;</li>\n    '
								}
								output += "\n  "
							}
							output += "\n  ";
							frame = frame.push();
							var t_15 = runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "pagination"), "page_range", env.autoesc);
							if (t_15) {
								for (var t_13 = 0; t_13 < t_15.length; t_13++) {
									var t_16 = t_15[t_13];
									frame.set("x", t_16);
									output += "\n    <li ";
									output += runtime.suppressValue(env.getFilter("class_selected").call(context, t_16, runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "pagination"), "number", env.autoesc)), env.autoesc);
									output += '>\n      <a href="#" class="';
									if (t_16 == runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "pagination"), "number", env.autoesc)) {
										output += "btn-page"
									}
									output += '" data-instant-search="link" data-href="';
									output += runtime.suppressValue(env.getFilter("urlparams").call(context, runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "pagination"), "url", env.autoesc), {
											page : t_16
										}), env.autoesc);
									output += '">';
									output += runtime.suppressValue(t_16, env.autoesc);
									output += "</a>\n    </li>\n  "
								}
							}
							frame = frame.pop();
							output += "\n  ";
							if (runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "page"), "dotted_upper", env.autoesc)) {
								output += "\n    ";
								if (runtime.memberLookup(runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "pagination"), "page_range", env.autoesc), -1, env.autoesc) != runtime.contextOrFrameLookup(context, frame, "num_pages") - 1) {
									output += '\n      <li class="skip">&hellip;</li>\n    '
								}
								output += '\n    <li><a href="#" data-instant-search="link" data-href="';
								output += runtime.suppressValue(env.getFilter("urlparams").call(context, runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "pagination"), "url", env.autoesc), {
										page : runtime.contextOrFrameLookup(context, frame, "num_pages")
									}), env.autoesc);
								output += '">';
								output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "num_pages"), env.autoesc);
								output += "</a></li>\n  "
							}
							output += "\n  ";
							if (runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "pagination"), "has_next", env.autoesc)) {
								output += '\n    <li class="next">\n      <a class="btn-page btn-page-next" href="#" data-instant-search="link" data-href="';
								output += runtime.suppressValue(env.getFilter("urlparams").call(context, runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "pagination"), "url", env.autoesc), {
										page : runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "pagination"), "number", env.autoesc) + 1
									}), env.autoesc);
								output += '">\n        ';
								output += runtime.suppressValue((lineno = 64, colno = 10, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["Next"])), env.autoesc);
								output += "\n      </a>\n    </li>\n  "
							}
							output += "\n  </ol>\n"
						}
						output += "\n";
						cb(null, output)
					})
				})
			} catch (e) {
				cb(runtime.handleError(e, lineno, colno))
			}
		}
		return {
			root : root
		}
	}
	()
})();
(function () {
	(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["search-results.html"] = function () {
		function root(env, context, frame, runtime, cb) {
			var lineno = null;
			var colno = null;
			var output = "";
			try {
				output += '<div id="search-results">\n  <div class="grid_3">\n    ';
				var t_1;
				t_1 = runtime.contextOrFrameLookup(context, frame, "base_url");
				frame.set("base_doctype_url", t_1);
				if (!frame.parent) {
					context.setVariable("base_doctype_url", t_1);
					context.addExport("base_doctype_url")
				}
				output += "\n    ";
				if (runtime.contextOrFrameLookup(context, frame, "product")) {
					output += "\n      ";
					t_1 = env.getFilter("urlparams").call(context, t_1, runtime.makeKeywordArgs({
								product : runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "product"), "slug", env.autoesc)
							}));
					frame.set("base_doctype_url", t_1);
					if (!frame.parent) {
						context.setVariable("base_doctype_url", t_1);
						context.addExport("base_doctype_url")
					}
					output += "\n    "
				}
				output += '\n    <ul id="doctype-filter" class="search-filter sidebar-nav">\n      <li ';
				output += runtime.suppressValue(env.getFilter("class_selected").call(context, runtime.contextOrFrameLookup(context, frame, "w"), 3), env.autoesc);
				output += '>\n        <a href="#" data-instant-search-set-params="w=3" data-instant-search="link" data-href="';
				output += runtime.suppressValue(env.getFilter("encodeURI").call(context, t_1), env.autoesc);
				output += '">\n          ';
				output += runtime.suppressValue((lineno = 9, colno = 12, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["Show Everything"])), env.autoesc);
				output += "\n        </a>\n      </li>\n      <li ";
				output += runtime.suppressValue(env.getFilter("class_selected").call(context, runtime.contextOrFrameLookup(context, frame, "w"), 1), env.autoesc);
				output += '>\n        <a href="#" data-instant-search-set-params="w=1" data-instant-search="link" data-href="';
				output += runtime.suppressValue(env.getFilter("encodeURI").call(context, env.getFilter("urlparams").call(context, t_1, runtime.makeKeywordArgs({
								w : 1
							}))), env.autoesc);
				output += '">\n          ';
				output += runtime.suppressValue((lineno = 14, colno = 12, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["Help Articles Only"])), env.autoesc);
				output += "\n        </a>\n      </li>\n      <li ";
				output += runtime.suppressValue(env.getFilter("class_selected").call(context, runtime.contextOrFrameLookup(context, frame, "w"), 2), env.autoesc);
				output += '>\n        <a href="#" data-instant-search-set-params="w=2" data-instant-search="link" data-href="';
				output += runtime.suppressValue(env.getFilter("encodeURI").call(context, env.getFilter("urlparams").call(context, t_1, runtime.makeKeywordArgs({
								w : 2
							}))), env.autoesc);
				output += '">\n          ';
				output += runtime.suppressValue((lineno = 19, colno = 12, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["Community Discussion Only"])), env.autoesc);
				output += "\n        </a>\n      </li>\n    </ul>\n\n    ";
				var t_2;
				t_2 = runtime.contextOrFrameLookup(context, frame, "base_url");
				frame.set("base_product_url", t_2);
				if (!frame.parent) {
					context.setVariable("base_product_url", t_2);
					context.addExport("base_product_url")
				}
				output += "\n    ";
				if (runtime.contextOrFrameLookup(context, frame, "w") != 3) {
					output += "\n      ";
					t_2 = env.getFilter("urlparams").call(context, t_2, runtime.makeKeywordArgs({
								w : runtime.contextOrFrameLookup(context, frame, "w")
							}));
					frame.set("base_product_url", t_2);
					if (!frame.parent) {
						context.setVariable("base_product_url", t_2);
						context.addExport("base_product_url")
					}
					output += "\n    "
				}
				output += '\n    <ul id="product-filter" class="search-filter sidebar-nav">\n      <li ';
				output += runtime.suppressValue(env.getFilter("class_selected").call(context, runtime.contextOrFrameLookup(context, frame, "product"), runtime.contextOrFrameLookup(context, frame, "null")), env.autoesc);
				output += '>\n        <a href="#" data-instant-search-unset-params="product" data-instant-search-set-params="all_products=1" data-instant-search="link" data-href="';
				output += runtime.suppressValue(env.getFilter("encodeURI").call(context, env.getFilter("urlparams").call(context, t_2, runtime.makeKeywordArgs({
								all_products : 1
							}))), env.autoesc);
				output += '">\n          ';
				output += runtime.suppressValue((lineno = 31, colno = 12, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["All Products"])), env.autoesc);
				output += "\n        </a>\n      </li>\n      ";
				frame = frame.push();
				var t_5 = runtime.contextOrFrameLookup(context, frame, "products");
				if (t_5) {
					for (var t_3 = 0; t_3 < t_5.length; t_3++) {
						var t_6 = t_5[t_3];
						frame.set("p", t_6);
						output += "\n        <li ";
						output += runtime.suppressValue(env.getFilter("class_selected").call(context, runtime.contextOrFrameLookup(context, frame, "product"), runtime.memberLookup(t_6, "slug", env.autoesc)), env.autoesc);
						output += '>\n          <a href="#" data-instant-search-set-params="product=';
						output += runtime.suppressValue(runtime.memberLookup(t_6, "slug", env.autoesc), env.autoesc);
						output += '" data-instant-search-unset-params="all_products" data-instant-search="link" data-href="';
						output += runtime.suppressValue(env.getFilter("encodeURI").call(context, env.getFilter("urlparams").call(context, t_2, runtime.makeKeywordArgs({
										product : runtime.memberLookup(t_6, "slug", env.autoesc)
									}))), env.autoesc);
						output += '">\n            ';
						output += runtime.suppressValue(runtime.memberLookup(t_6, "title", env.autoesc), env.autoesc);
						output += "\n          </a>\n        </li>\n      "
					}
				}
				frame = frame.pop();
				output += '\n    </ul>\n    <br />\n  </div>\n\n  <div class="grid_9" id="search-results-list">\n    ';
				env.getTemplate("search-results-list.html", function (t_9, t_7) {
					if (t_9) {
						cb(t_9);
						return
					}
					t_7.render(context.getVariables(), frame.push(), function (t_10, t_8) {
						if (t_10) {
							cb(t_10);
							return
						}
						output += t_8;
						output += "\n  </div>\n</div>\n";
						cb(null, output)
					})
				})
			} catch (e) {
				cb(runtime.handleError(e, lineno, colno))
			}
		}
		return {
			root : root
		}
	}
	()
})();
(function () {
	(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["wiki-related-doc.html"] = function () {
		function root(env, context, frame, runtime, cb) {
			var lineno = null;
			var colno = null;
			var output = "";
			try {
				output += '<li data-pk="';
				output += runtime.suppressValue(runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "doc"), "id", env.autoesc), env.autoesc);
				output += '">\n  <input type="checkbox" name="';
				output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "name"), env.autoesc);
				output += '" value="';
				output += runtime.suppressValue(runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "doc"), "id", env.autoesc), env.autoesc);
				output += '" checked />\n  ';
				output += runtime.suppressValue(runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "doc"), "title", env.autoesc), env.autoesc);
				output += '\n  <span data-close-type="remove" class="close-button"></span>\n</li>\n';
				cb(null, output)
			} catch (e) {
				cb(runtime.handleError(e, lineno, colno))
			}
		}
		return {
			root : root
		}
	}
	()
})();
(function () {
	(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["wiki-search-results.html"] = function () {
		function root(env, context, frame, runtime, cb) {
			var lineno = null;
			var colno = null;
			var output = "";
			try {
				output += "<ul>\n  ";
				frame = frame.push();
				var t_3 = runtime.contextOrFrameLookup(context, frame, "results");
				if (t_3) {
					for (var t_1 = 0; t_1 < t_3.length; t_1++) {
						var t_4 = t_3[t_1];
						frame.set("doc", t_4);
						output += '\n    <li data-pk="';
						output += runtime.suppressValue(runtime.memberLookup(t_4, "id", env.autoesc), env.autoesc);
						output += '">';
						output += runtime.suppressValue(runtime.memberLookup(t_4, "title", env.autoesc), env.autoesc);
						output += "</li>\n  "
					}
				}
				frame = frame.pop();
				output += "\n</ul>\n";
				cb(null, output)
			} catch (e) {
				cb(runtime.handleError(e, lineno, colno))
			}
		}
		return {
			root : root
		}
	}
	()
})();
(function () {
	(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["macros.html"] = function () {
		function root(env, context, frame, runtime, cb) {
			var lineno = null;
			var colno = null;
			var output = "";
			try {
				var macro_t_1 = runtime.makeMacro(["result"], [], function (l_result, kwargs) {
						frame = frame.push();
						kwargs = kwargs || {};
						frame.set("result", l_result);
						var output = "";
						output += '\n  <div class="result ';
						output += runtime.suppressValue(runtime.memberLookup(l_result, "type", env.autoesc), env.autoesc);
						output += '">\n    <h3><a class="title" href="';
						output += runtime.suppressValue(runtime.memberLookup(l_result, "url", env.autoesc), env.autoesc);
						output += '" data-ga-click="_trackEvent | Instant Search | Result Clicked">';
						output += runtime.suppressValue(runtime.memberLookup(l_result, "title", env.autoesc), env.autoesc);
						output += '</a></h3>\n    <a tabindex="-1" href="';
						output += runtime.suppressValue(runtime.memberLookup(l_result, "url", env.autoesc), env.autoesc);
						output += '" data-ga-click="_trackEvent | Instant Search | Result Clicked">';
						output += runtime.suppressValue(env.getFilter("safe").call(context, runtime.memberLookup(l_result, "search_summary", env.autoesc)), env.autoesc);
						output += "</a>\n    ";
						if (runtime.memberLookup(l_result, "type", env.autoesc) == "question") {
							output += '\n      <ul class="thread-meta cf">\n        ';
							if (runtime.memberLookup(l_result, "is_solved", env.autoesc)) {
								output += "\n          <li>";
								output += runtime.suppressValue((lineno = 7, colno = 16, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["Solved"])), env.autoesc);
								output += "</li>\n        "
							}
							output += "\n        <li>\n          ";
							if (runtime.memberLookup(l_result, "num_answers", env.autoesc) > 0) {
								output += "\n            ";
								output += runtime.suppressValue(env.getFilter("f").call(context, (lineno = 11, colno = 21, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "ngettext"), "ngettext", ["1 reply", "%s replies", runtime.memberLookup(l_result, "num_answers", env.autoesc)])), [runtime.memberLookup(l_result, "num_answers", env.autoesc)]), env.autoesc);
								output += "\n          "
							} else {
								output += "\n            ";
								output += runtime.suppressValue((lineno = 13, colno = 14, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["No replies"])), env.autoesc);
								output += "\n          "
							}
							output += "\n        </li>\n        <li>\n          ";
							output += runtime.suppressValue(env.getFilter("f").call(context, (lineno = 17, colno = 19, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "ngettext"), "ngettext", ["1 person has this problem", "%s people have this problem", runtime.memberLookup(l_result, "num_votes", env.autoesc)])), [runtime.memberLookup(l_result, "num_votes", env.autoesc)]), env.autoesc);
							output += "\n        </li>\n        <li>\n          ";
							output += runtime.suppressValue(env.getFilter("f").call(context, (lineno = 20, colno = 19, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "ngettext"), "ngettext", ["1 new this week", "%s new this week", runtime.memberLookup(l_result, "num_votes_past_week", env.autoesc)])), [runtime.memberLookup(l_result, "num_votes_past_week", env.autoesc)]), env.autoesc);
							output += "\n        </li>\n      </ul>\n    "
						}
						output += "\n  </div>\n";
						frame = frame.pop();
						return new runtime.SafeString(output)
					});
				context.addExport("search_result");
				context.setVariable("search_result", macro_t_1);
				output += "\n";
				cb(null, output)
			} catch (e) {
				cb(runtime.handleError(e, lineno, colno))
			}
		}
		return {
			root : root
		}
	}
	()
})();
(function () {
	(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["mobile-product-search-results.html"] = function () {
		function root(env, context, frame, runtime, cb) {
			var lineno = null;
			var colno = null;
			var output = "";
			try {
				output += '<div class="search-header">';
				output += runtime.suppressValue((lineno = 0, colno = 29, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["Search results"])), env.autoesc);
				output += '</div>\n<ul class="document-list">\n  ';
				if (runtime.contextOrFrameLookup(context, frame, "num_results") > 0) {
					output += "\n    ";
					frame = frame.push();
					var t_3 = runtime.contextOrFrameLookup(context, frame, "results");
					if (t_3) {
						for (var t_1 = 0; t_1 < t_3.length; t_1++) {
							var t_4 = t_3[t_1];
							frame.set("doc", t_4);
							output += '\n      <li>\n        <a href="';
							output += runtime.suppressValue(runtime.memberLookup(t_4, "url", env.autoesc), env.autoesc);
							output += '">';
							output += runtime.suppressValue(runtime.memberLookup(t_4, "title", env.autoesc), env.autoesc);
							output += "</a>\n      </li>\n    "
						}
					}
					frame = frame.pop();
					output += "\n  "
				} else {
					output += '\n    <li><a href="#">';
					output += runtime.suppressValue((lineno = 9, colno = 22, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["No results found."])), env.autoesc);
					output += "</a></li>\n  "
				}
				output += "\n</ul>\n";
				cb(null, output)
			} catch (e) {
				cb(runtime.handleError(e, lineno, colno))
			}
		}
		return {
			root : root
		}
	}
	()
})();
(function () {
	(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["mobile-search-results.html"] = function () {
		function root(env, context, frame, runtime, cb) {
			var lineno = null;
			var colno = null;
			var output = "";
			try {
				if (runtime.contextOrFrameLookup(context, frame, "results")) {
					output += '\n  <ol class="search-results">\n    ';
					frame = frame.push();
					var t_3 = runtime.contextOrFrameLookup(context, frame, "results");
					if (t_3) {
						for (var t_1 = 0; t_1 < t_3.length; t_1++) {
							var t_4 = t_3[t_1];
							frame.set("doc", t_4);
							output += '\n      <li class="';
							output += runtime.suppressValue(runtime.memberLookup(t_4, "type", env.autoesc), env.autoesc);
							output += '">\n        <a href="';
							output += runtime.suppressValue(env.getFilter("encodeURI").call(context, env.getFilter("urlparams").call(context, runtime.memberLookup(t_4, "url", env.autoesc), runtime.makeKeywordArgs({
											s : runtime.contextOrFrameLookup(context, frame, "q"),
											as : "s"
										}))), env.autoesc);
							output += '">\n          <span class="title">';
							output += runtime.suppressValue(runtime.memberLookup(t_4, "title", env.autoesc), env.autoesc);
							output += "</span>\n          ";
							output += runtime.suppressValue(env.getFilter("safe").call(context, runtime.memberLookup(t_4, "search_summary", env.autoesc)), env.autoesc);
							output += "\n        </a>\n      </li>\n    "
						}
					}
					frame = frame.pop();
					output += "\n  </ol>\n"
				} else {
					output += "\n  ";
					output += runtime.suppressValue((lineno = 12, colno = 4, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["No results found"])), env.autoesc);
					output += "\n"
				}
				output += "\n";
				cb(null, output)
			} catch (e) {
				cb(runtime.handleError(e, lineno, colno))
			}
		}
		return {
			root : root
		}
	}
	()
})();
(function () {
	(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["search-results-list.html"] = function () {
		function root(env, context, frame, runtime, cb) {
			var lineno = null;
			var colno = null;
			var output = "";
			try {
				env.getTemplate("macros.html", function (t_2, t_1) {
					if (t_2) {
						cb(t_2);
						return
					}
					t_1.getExported(function (t_3, t_1) {
						if (t_3) {
							cb(t_3);
							return
						}
						if (t_1.hasOwnProperty("search_result")) {
							var t_4 = t_1.search_result
						} else {
							cb(new Error("cannot import 'search_result'"));
							return
						}
						context.setVariable("search_result", t_4);
						output += "\n\n";
						if (runtime.contextOrFrameLookup(context, frame, "num_results") > 0) {
							output += "\n  <h2>\n    ";
							output += "\n    ";
							output += runtime.suppressValue(env.getFilter("safe").call(context, env.getFilter("f").call(context, (lineno = 5, colno = 13, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "ngettext"), "ngettext", ["Found <strong>%(n)s</strong> result for <strong>%(q)s</strong> for <strong>%(product)s</strong>", "Found <strong>%(n)s</strong> results for <strong>%(q)s</strong> for <strong>%(product)s</strong>", runtime.contextOrFrameLookup(context, frame, "num_results")])), {
										n : runtime.contextOrFrameLookup(context, frame, "num_results"),
										q : runtime.contextOrFrameLookup(context, frame, "q"),
										product : runtime.contextOrFrameLookup(context, frame, "product_titles")
									}, true)), env.autoesc);
							output += '\n  </h2>\n\n  <div class="content-box">\n    ';
							frame = frame.push();
							var t_7 = runtime.contextOrFrameLookup(context, frame, "results");
							if (t_7) {
								for (var t_5 = 0; t_5 < t_7.length; t_5++) {
									var t_8 = t_7[t_5];
									frame.set("doc", t_8);
									output += "\n      ";
									output += runtime.suppressValue((lineno = 14, colno = 20, runtime.callWrap(t_4, "search_result", [t_8])), env.autoesc);
									output += "\n    "
								}
							}
							frame = frame.pop();
							output += "\n  </div>\n"
						} else {
							output += "\n  <h2>\n    ";
							output += "\n    ";
							output += runtime.suppressValue(env.getFilter("safe").call(context, env.getFilter("f").call(context, (lineno = 20, colno = 6, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["We couldn't find any results for <strong>%(q)s</strong> in <strong>%(l)s</strong>. Maybe one of these articles will be helpful?"])), {
										q : runtime.contextOrFrameLookup(context, frame, "q"),
										l : runtime.contextOrFrameLookup(context, frame, "lang_name")
									}, true)), env.autoesc);
							output += '\n  </h2>\n\n  <div class="content-box">\n    ';
							frame = frame.push();
							var t_11 = runtime.contextOrFrameLookup(context, frame, "fallback_results");
							if (t_11) {
								for (var t_9 = 0; t_9 < t_11.length; t_9++) {
									var t_12 = t_11[t_9];
									frame.set("doc", t_12);
									output += '\n      <div class="result document">\n        <h3><a class="title" href="';
									output += runtime.suppressValue(runtime.memberLookup(t_12, "url", env.autoesc), env.autoesc);
									output += '">';
									output += runtime.suppressValue(runtime.memberLookup(t_12, "document_title", env.autoesc), env.autoesc);
									output += '</a></h3>\n        <a tabindex="-1" href="';
									output += runtime.suppressValue(runtime.memberLookup(t_12, "url", env.autoesc), env.autoesc);
									output += '">';
									output += runtime.suppressValue(runtime.memberLookup(t_12, "document_summary", env.autoesc), env.autoesc);
									output += "</a>\n      </div>\n    "
								}
							}
							frame = frame.pop();
							output += "\n  </div>\n"
						}
						output += "\n\n";
						if (runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "pagination"), "num_pages", env.autoesc) > 1) {
							output += '\n  <ol class="pagination cf">\n  ';
							if (runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "pagination"), "has_previous", env.autoesc)) {
								output += '\n    <li class="prev">\n      <a class="btn-page btn-page-prev" href="#" data-instant-search="link" data-href="';
								output += runtime.suppressValue(env.getFilter("urlparams").call(context, runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "pagination"), "url", env.autoesc), {
										page : runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "pagination"), "number", env.autoesc) - 1
									}), env.autoesc);
								output += '">\n        ';
								output += runtime.suppressValue((lineno = 40, colno = 10, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["Previous"])), env.autoesc);
								output += "\n      </a>\n    </li>\n  "
							}
							output += "\n  ";
							if (runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "pagination"), "dotted_lower", env.autoesc)) {
								output += '\n    <li><a href="#" data-instant-search="link" data-href="';
								output += runtime.suppressValue(env.getFilter("urlparams").call(context, runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "pagination"), "url", env.autoesc), {
										page : 1
									}), env.autoesc);
								output += '">';
								output += runtime.suppressValue(1, env.autoesc);
								output += "</a></li>\n    ";
								if (runtime.memberLookup(runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "pagination"), "page_range", env.autoesc), 0, env.autoesc) != 2) {
									output += '\n      <li class="skip">&hellip;</li>\n    '
								}
								output += "\n  "
							}
							output += "\n  ";
							frame = frame.push();
							var t_15 = runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "pagination"), "page_range", env.autoesc);
							if (t_15) {
								for (var t_13 = 0; t_13 < t_15.length; t_13++) {
									var t_16 = t_15[t_13];
									frame.set("x", t_16);
									output += "\n    <li ";
									output += runtime.suppressValue(env.getFilter("class_selected").call(context, t_16, runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "pagination"), "number", env.autoesc)), env.autoesc);
									output += '>\n      <a href="#" class="';
									if (t_16 == runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "pagination"), "number", env.autoesc)) {
										output += "btn-page"
									}
									output += '" data-instant-search="link" data-href="';
									output += runtime.suppressValue(env.getFilter("urlparams").call(context, runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "pagination"), "url", env.autoesc), {
											page : t_16
										}), env.autoesc);
									output += '">';
									output += runtime.suppressValue(t_16, env.autoesc);
									output += "</a>\n    </li>\n  "
								}
							}
							frame = frame.pop();
							output += "\n  ";
							if (runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "page"), "dotted_upper", env.autoesc)) {
								output += "\n    ";
								if (runtime.memberLookup(runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "pagination"), "page_range", env.autoesc), -1, env.autoesc) != runtime.contextOrFrameLookup(context, frame, "num_pages") - 1) {
									output += '\n      <li class="skip">&hellip;</li>\n    '
								}
								output += '\n    <li><a href="#" data-instant-search="link" data-href="';
								output += runtime.suppressValue(env.getFilter("urlparams").call(context, runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "pagination"), "url", env.autoesc), {
										page : runtime.contextOrFrameLookup(context, frame, "num_pages")
									}), env.autoesc);
								output += '">';
								output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "num_pages"), env.autoesc);
								output += "</a></li>\n  "
							}
							output += "\n  ";
							if (runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "pagination"), "has_next", env.autoesc)) {
								output += '\n    <li class="next">\n      <a class="btn-page btn-page-next" href="#" data-instant-search="link" data-href="';
								output += runtime.suppressValue(env.getFilter("urlparams").call(context, runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "pagination"), "url", env.autoesc), {
										page : runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "pagination"), "number", env.autoesc) + 1
									}), env.autoesc);
								output += '">\n        ';
								output += runtime.suppressValue((lineno = 64, colno = 10, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["Next"])), env.autoesc);
								output += "\n      </a>\n    </li>\n  "
							}
							output += "\n  </ol>\n"
						}
						output += "\n";
						cb(null, output)
					})
				})
			} catch (e) {
				cb(runtime.handleError(e, lineno, colno))
			}
		}
		return {
			root : root
		}
	}
	()
})();
(function () {
	(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["search-results.html"] = function () {
		function root(env, context, frame, runtime, cb) {
			var lineno = null;
			var colno = null;
			var output = "";
			try {
				output += '<div id="search-results">\n  <div class="grid_3">\n    ';
				var t_1;
				t_1 = runtime.contextOrFrameLookup(context, frame, "base_url");
				frame.set("base_doctype_url", t_1);
				if (!frame.parent) {
					context.setVariable("base_doctype_url", t_1);
					context.addExport("base_doctype_url")
				}
				output += "\n    ";
				if (runtime.contextOrFrameLookup(context, frame, "product")) {
					output += "\n      ";
					t_1 = env.getFilter("urlparams").call(context, t_1, runtime.makeKeywordArgs({
								product : runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "product"), "slug", env.autoesc)
							}));
					frame.set("base_doctype_url", t_1);
					if (!frame.parent) {
						context.setVariable("base_doctype_url", t_1);
						context.addExport("base_doctype_url")
					}
					output += "\n    "
				}
				output += '\n    <ul id="doctype-filter" class="search-filter sidebar-nav">\n      <li ';
				output += runtime.suppressValue(env.getFilter("class_selected").call(context, runtime.contextOrFrameLookup(context, frame, "w"), 3), env.autoesc);
				output += '>\n        <a href="#" data-instant-search-set-params="w=3" data-instant-search="link" data-href="';
				output += runtime.suppressValue(env.getFilter("encodeURI").call(context, t_1), env.autoesc);
				output += '">\n          ';
				output += runtime.suppressValue((lineno = 9, colno = 12, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["Show Everything"])), env.autoesc);
				output += "\n        </a>\n      </li>\n      <li ";
				output += runtime.suppressValue(env.getFilter("class_selected").call(context, runtime.contextOrFrameLookup(context, frame, "w"), 1), env.autoesc);
				output += '>\n        <a href="#" data-instant-search-set-params="w=1" data-instant-search="link" data-href="';
				output += runtime.suppressValue(env.getFilter("encodeURI").call(context, env.getFilter("urlparams").call(context, t_1, runtime.makeKeywordArgs({
								w : 1
							}))), env.autoesc);
				output += '">\n          ';
				output += runtime.suppressValue((lineno = 14, colno = 12, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["Help Articles Only"])), env.autoesc);
				output += "\n        </a>\n      </li>\n      <li ";
				output += runtime.suppressValue(env.getFilter("class_selected").call(context, runtime.contextOrFrameLookup(context, frame, "w"), 2), env.autoesc);
				output += '>\n        <a href="#" data-instant-search-set-params="w=2" data-instant-search="link" data-href="';
				output += runtime.suppressValue(env.getFilter("encodeURI").call(context, env.getFilter("urlparams").call(context, t_1, runtime.makeKeywordArgs({
								w : 2
							}))), env.autoesc);
				output += '">\n          ';
				output += runtime.suppressValue((lineno = 19, colno = 12, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["Community Discussion Only"])), env.autoesc);
				output += "\n        </a>\n      </li>\n    </ul>\n\n    ";
				var t_2;
				t_2 = runtime.contextOrFrameLookup(context, frame, "base_url");
				frame.set("base_product_url", t_2);
				if (!frame.parent) {
					context.setVariable("base_product_url", t_2);
					context.addExport("base_product_url")
				}
				output += "\n    ";
				if (runtime.contextOrFrameLookup(context, frame, "w") != 3) {
					output += "\n      ";
					t_2 = env.getFilter("urlparams").call(context, t_2, runtime.makeKeywordArgs({
								w : runtime.contextOrFrameLookup(context, frame, "w")
							}));
					frame.set("base_product_url", t_2);
					if (!frame.parent) {
						context.setVariable("base_product_url", t_2);
						context.addExport("base_product_url")
					}
					output += "\n    "
				}
				output += '\n    <ul id="product-filter" class="search-filter sidebar-nav">\n      <li ';
				output += runtime.suppressValue(env.getFilter("class_selected").call(context, runtime.contextOrFrameLookup(context, frame, "product"), runtime.contextOrFrameLookup(context, frame, "null")), env.autoesc);
				output += '>\n        <a href="#" data-instant-search-unset-params="product" data-instant-search-set-params="all_products=1" data-instant-search="link" data-href="';
				output += runtime.suppressValue(env.getFilter("encodeURI").call(context, env.getFilter("urlparams").call(context, t_2, runtime.makeKeywordArgs({
								all_products : 1
							}))), env.autoesc);
				output += '">\n          ';
				output += runtime.suppressValue((lineno = 31, colno = 12, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["All Products"])), env.autoesc);
				output += "\n        </a>\n      </li>\n      ";
				frame = frame.push();
				var t_5 = runtime.contextOrFrameLookup(context, frame, "products");
				if (t_5) {
					for (var t_3 = 0; t_3 < t_5.length; t_3++) {
						var t_6 = t_5[t_3];
						frame.set("p", t_6);
						output += "\n        <li ";
						output += runtime.suppressValue(env.getFilter("class_selected").call(context, runtime.contextOrFrameLookup(context, frame, "product"), runtime.memberLookup(t_6, "slug", env.autoesc)), env.autoesc);
						output += '>\n          <a href="#" data-instant-search-set-params="product=';
						output += runtime.suppressValue(runtime.memberLookup(t_6, "slug", env.autoesc), env.autoesc);
						output += '" data-instant-search-unset-params="all_products" data-instant-search="link" data-href="';
						output += runtime.suppressValue(env.getFilter("encodeURI").call(context, env.getFilter("urlparams").call(context, t_2, runtime.makeKeywordArgs({
										product : runtime.memberLookup(t_6, "slug", env.autoesc)
									}))), env.autoesc);
						output += '">\n            ';
						output += runtime.suppressValue(runtime.memberLookup(t_6, "title", env.autoesc), env.autoesc);
						output += "\n          </a>\n        </li>\n      "
					}
				}
				frame = frame.pop();
				output += '\n    </ul>\n    <br />\n  </div>\n\n  <div class="grid_9" id="search-results-list">\n    ';
				env.getTemplate("search-results-list.html", function (t_9, t_7) {
					if (t_9) {
						cb(t_9);
						return
					}
					t_7.render(context.getVariables(), frame.push(), function (t_10, t_8) {
						if (t_10) {
							cb(t_10);
							return
						}
						output += t_8;
						output += "\n  </div>\n</div>\n";
						cb(null, output)
					})
				})
			} catch (e) {
				cb(runtime.handleError(e, lineno, colno))
			}
		}
		return {
			root : root
		}
	}
	()
})();
(function () {
	(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["wiki-related-doc.html"] = function () {
		function root(env, context, frame, runtime, cb) {
			var lineno = null;
			var colno = null;
			var output = "";
			try {
				output += '<li data-pk="';
				output += runtime.suppressValue(runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "doc"), "id", env.autoesc), env.autoesc);
				output += '">\n  <input type="checkbox" name="';
				output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "name"), env.autoesc);
				output += '" value="';
				output += runtime.suppressValue(runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "doc"), "id", env.autoesc), env.autoesc);
				output += '" checked />\n  ';
				output += runtime.suppressValue(runtime.memberLookup(runtime.contextOrFrameLookup(context, frame, "doc"), "title", env.autoesc), env.autoesc);
				output += '\n  <span data-close-type="remove" class="close-button"></span>\n</li>\n';
				cb(null, output)
			} catch (e) {
				cb(runtime.handleError(e, lineno, colno))
			}
		}
		return {
			root : root
		}
	}
	()
})();
(function () {
	(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["wiki-search-results.html"] = function () {
		function root(env, context, frame, runtime, cb) {
			var lineno = null;
			var colno = null;
			var output = "";
			try {
				output += "<ul>\n  ";
				frame = frame.push();
				var t_3 = runtime.contextOrFrameLookup(context, frame, "results");
				if (t_3) {
					for (var t_1 = 0; t_1 < t_3.length; t_1++) {
						var t_4 = t_3[t_1];
						frame.set("doc", t_4);
						output += '\n    <li data-pk="';
						output += runtime.suppressValue(runtime.memberLookup(t_4, "id", env.autoesc), env.autoesc);
						output += '">';
						output += runtime.suppressValue(runtime.memberLookup(t_4, "title", env.autoesc), env.autoesc);
						output += "</li>\n  "
					}
				}
				frame = frame.pop();
				output += "\n</ul>\n";
				cb(null, output)
			} catch (e) {
				cb(runtime.handleError(e, lineno, colno))
			}
		}
		return {
			root : root
		}
	}
	()
})();
(function () {
	var modules = {};
	(function () {
		"use strict";
		function extend(cls, name, props) {
			var F = function () {};
			F.prototype = cls.prototype;
			var prototype = new F;
			var fnTest = /xyz/.test(function () {
					xyz
				}) ? /\bparent\b/ : /.*/;
			props = props || {};
			for (var k in props) {
				var src = props[k];
				var parent = prototype[k];
				if (typeof parent === "function" && typeof src === "function" && fnTest.test(src)) {
					prototype[k] = function (src, parent) {
						return function () {
							var tmp = this.parent;
							this.parent = parent;
							var res = src.apply(this, arguments);
							this.parent = tmp;
							return res
						}
					}
					(src, parent)
				} else {
					prototype[k] = src
				}
			}
			prototype.typename = name;
			var new_cls = function () {
				if (prototype.init) {
					prototype.init.apply(this, arguments)
				}
			};
			new_cls.prototype = prototype;
			new_cls.prototype.constructor = new_cls;
			new_cls.extend = function (name, props) {
				if (typeof name === "object") {
					props = name;
					name = "anonymous"
				}
				return extend(new_cls, name, props)
			};
			return new_cls
		}
		modules["object"] = extend(Object, "Object", {})
	})();
	(function () {
		"use strict";
		var ArrayProto = Array.prototype;
		var ObjProto = Object.prototype;
		var escapeMap = {
			"&" : "&amp;",
			'"' : "&quot;",
			"'" : "&#39;",
			"<" : "&lt;",
			">" : "&gt;"
		};
		var escapeRegex = /[&"'<>]/g;
		var lookupEscape = function (ch) {
			return escapeMap[ch]
		};
		var exports = modules["lib"] = {};
		exports.withPrettyErrors = function (path, withInternals, func) {
			try {
				return func()
			} catch (e) {
				if (!e.Update) {
					e = new exports.TemplateError(e)
				}
				e.Update(path);
				if (!withInternals) {
					var old = e;
					e = new Error(old.message);
					e.name = old.name
				}
				throw e
			}
		};
		exports.TemplateError = function (message, lineno, colno) {
			var err = this;
			if (message instanceof Error) {
				err = message;
				message = message.name + ": " + message.message
			} else {
				if (Error.captureStackTrace) {
					Error.captureStackTrace(err)
				}
			}
			err.name = "Template render error";
			err.message = message;
			err.lineno = lineno;
			err.colno = colno;
			err.firstUpdate = true;
			err.Update = function (path) {
				var message = "(" + (path || "unknown path") + ")";
				if (this.firstUpdate) {
					if (this.lineno && this.colno) {
						message += " [Line " + this.lineno + ", Column " + this.colno + "]"
					} else if (this.lineno) {
						message += " [Line " + this.lineno + "]"
					}
				}
				message += "\n ";
				if (this.firstUpdate) {
					message += " "
				}
				this.message = message + (this.message || "");
				this.firstUpdate = false;
				return this
			};
			return err
		};
		exports.TemplateError.prototype = Error.prototype;
		exports.escape = function (val) {
			return val.replace(escapeRegex, lookupEscape)
		};
		exports.isFunction = function (obj) {
			return ObjProto.toString.call(obj) === "[object Function]"
		};
		exports.isArray = Array.isArray || function (obj) {
			return ObjProto.toString.call(obj) === "[object Array]"
		};
		exports.isString = function (obj) {
			return ObjProto.toString.call(obj) === "[object String]"
		};
		exports.isObject = function (obj) {
			return ObjProto.toString.call(obj) === "[object Object]"
		};
		exports.groupBy = function (obj, val) {
			var result = {};
			var iterator = exports.isFunction(val) ? val : function (obj) {
				return obj[val]
			};
			for (var i = 0; i < obj.length; i++) {
				var value = obj[i];
				var key = iterator(value, i);
				(result[key] || (result[key] = [])).push(value)
			}
			return result
		};
		exports.toArray = function (obj) {
			return Array.prototype.slice.call(obj)
		};
		exports.without = function (array) {
			var result = [];
			if (!array) {
				return result
			}
			var index = -1,
			length = array.length,
			contains = exports.toArray(arguments).slice(1);
			while (++index < length) {
				if (exports.indexOf(contains, array[index]) === -1) {
					result.push(array[index])
				}
			}
			return result
		};
		exports.extend = function (obj, obj2) {
			for (var k in obj2) {
				obj[k] = obj2[k]
			}
			return obj
		};
		exports.repeat = function (char_, n) {
			var str = "";
			for (var i = 0; i < n; i++) {
				str += char_
			}
			return str
		};
		exports.each = function (obj, func, context) {
			if (obj == null) {
				return
			}
			if (ArrayProto.each && obj.each === ArrayProto.each) {
				obj.forEach(func, context)
			} else if (obj.length === +obj.length) {
				for (var i = 0, l = obj.length; i < l; i++) {
					func.call(context, obj[i], i, obj)
				}
			}
		};
		exports.map = function (obj, func) {
			var results = [];
			if (obj == null) {
				return results
			}
			if (ArrayProto.map && obj.map === ArrayProto.map) {
				return obj.map(func)
			}
			for (var i = 0; i < obj.length; i++) {
				results[results.length] = func(obj[i], i)
			}
			if (obj.length === +obj.length) {
				results.length = obj.length
			}
			return results
		};
		exports.asyncIter = function (arr, iter, cb) {
			var i = -1;
			function next() {
				i++;
				if (i < arr.length) {
					iter(arr[i], i, next, cb)
				} else {
					cb()
				}
			}
			next()
		};
		exports.asyncFor = function (obj, iter, cb) {
			var keys = exports.keys(obj);
			var len = keys.length;
			var i = -1;
			function next() {
				i++;
				var k = keys[i];
				if (i < len) {
					iter(k, obj[k], i, len, next)
				} else {
					cb()
				}
			}
			next()
		};
		exports.indexOf = Array.prototype.indexOf ? function (arr, searchElement, fromIndex) {
			return Array.prototype.indexOf.call(arr, searchElement, fromIndex)
		}
		 : function (arr, searchElement, fromIndex) {
			var length = this.length >>> 0;
			fromIndex = +fromIndex || 0;
			if (Math.abs(fromIndex) === Infinity) {
				fromIndex = 0
			}
			if (fromIndex < 0) {
				fromIndex += length;
				if (fromIndex < 0) {
					fromIndex = 0
				}
			}
			for (; fromIndex < length; fromIndex++) {
				if (arr[fromIndex] === searchElement) {
					return fromIndex
				}
			}
			return -1
		};
		if (!Array.prototype.map) {
			Array.prototype.map = function () {
				throw new Error("map is unimplemented for this js engine")
			}
		}
		exports.keys = function (obj) {
			if (Object.prototype.keys) {
				return obj.keys()
			} else {
				var keys = [];
				for (var k in obj) {
					if (obj.hasOwnProperty(k)) {
						keys.push(k)
					}
				}
				return keys
			}
		}
	})();
	(function () {
		"use strict";
		var lib = modules["lib"];
		var Obj = modules["object"];
		var Frame = Obj.extend({
				init : function (parent) {
					this.variables = {};
					this.parent = parent
				},
				set : function (name, val, resolveUp) {
					var parts = name.split(".");
					var obj = this.variables;
					var frame = this;
					if (resolveUp) {
						if (frame = this.resolve(parts[0])) {
							frame.set(name, val);
							return
						}
						frame = this
					}
					for (var i = 0; i < parts.length - 1; i++) {
						var id = parts[i];
						if (!obj[id]) {
							obj[id] = {}
						}
						obj = obj[id]
					}
					obj[parts[parts.length - 1]] = val
				},
				get : function (name) {
					var val = this.variables[name];
					if (val !== undefined && val !== null) {
						return val
					}
					return null
				},
				lookup : function (name) {
					var p = this.parent;
					var val = this.variables[name];
					if (val !== undefined && val !== null) {
						return val
					}
					return p && p.lookup(name)
				},
				resolve : function (name) {
					var p = this.parent;
					var val = this.variables[name];
					if (val !== undefined && val !== null) {
						return this
					}
					return p && p.resolve(name)
				},
				push : function () {
					return new Frame(this)
				},
				pop : function () {
					return this.parent
				}
			});
		function makeMacro(argNames, kwargNames, func) {
			return function () {
				var argCount = numArgs(arguments);
				var args;
				var kwargs = getKeywordArgs(arguments);
				if (argCount > argNames.length) {
					args = Array.prototype.slice.call(arguments, 0, argNames.length);
					var vals = Array.prototype.slice.call(arguments, args.length, argCount);
					for (var i = 0; i < vals.length; i++) {
						if (i < kwargNames.length) {
							kwargs[kwargNames[i]] = vals[i]
						}
					}
					args.push(kwargs)
				} else if (argCount < argNames.length) {
					args = Array.prototype.slice.call(arguments, 0, argCount);
					for (var i = argCount; i < argNames.length; i++) {
						var arg = argNames[i];
						args.push(kwargs[arg]);
						delete kwargs[arg]
					}
					args.push(kwargs)
				} else {
					args = arguments
				}
				return func.apply(this, args)
			}
		}
		function makeKeywordArgs(obj) {
			obj.__keywords = true;
			return obj
		}
		function getKeywordArgs(args) {
			var len = args.length;
			if (len) {
				var lastArg = args[len - 1];
				if (lastArg && lastArg.hasOwnProperty("__keywords")) {
					return lastArg
				}
			}
			return {}
		}
		function numArgs(args) {
			var len = args.length;
			if (len === 0) {
				return 0
			}
			var lastArg = args[len - 1];
			if (lastArg && lastArg.hasOwnProperty("__keywords")) {
				return len - 1
			} else {
				return len
			}
		}
		function SafeString(val) {
			if (typeof val !== "string") {
				return val
			}
			this.val = val
		}
		SafeString.prototype = Object.create(String.prototype);
		SafeString.prototype.valueOf = function () {
			return this.val
		};
		SafeString.prototype.toString = function () {
			return this.val
		};
		function copySafeness(dest, target) {
			if (dest instanceof SafeString) {
				return new SafeString(target)
			}
			return target.toString()
		}
		function markSafe(val) {
			var type = typeof val;
			if (type === "string") {
				return new SafeString(val)
			} else if (type !== "function") {
				return val
			} else {
				return function () {
					var ret = val.apply(this, arguments);
					if (typeof ret === "string") {
						return new SafeString(ret)
					}
					return ret
				}
			}
		}
		function suppressValue(val, autoescape) {
			val = val !== undefined && val !== null ? val : "";
			if (autoescape && typeof val === "string") {
				val = lib.escape(val)
			}
			return val
		}
		function memberLookup(obj, val) {
			obj = obj || {};
			if (typeof obj[val] === "function") {
				return function () {
					return obj[val].apply(obj, arguments)
				}
			}
			return obj[val]
		}
		function callWrap(obj, name, args) {
			if (!obj) {
				throw new Error("Unable to call `" + name + "`, which is undefined or falsey")
			} else if (typeof obj !== "function") {
				throw new Error("Unable to call `" + name + "`, which is not a function")
			}
			return obj.apply(this, args)
		}
		function contextOrFrameLookup(context, frame, name) {
			var val = frame.lookup(name);
			return val !== undefined && val !== null ? val : context.lookup(name)
		}
		function handleError(error, lineno, colno) {
			if (error.lineno) {
				return error
			} else {
				return new lib.TemplateError(error, lineno, colno)
			}
		}
		function asyncEach(arr, dimen, iter, cb) {
			if (lib.isArray(arr)) {
				var len = arr.length;
				lib.asyncIter(arr, function (item, i, next) {
					switch (dimen) {
					case 1:
						iter(item, i, len, next);
						break;
					case 2:
						iter(item[0], item[1], i, len, next);
						break;
					case 3:
						iter(item[0], item[1], item[2], i, len, next);
						break;
					default:
						item.push(i, next);
						iter.apply(this, item)
					}
				}, cb)
			} else {
				lib.asyncFor(arr, function (key, val, i, len, next) {
					iter(key, val, i, len, next)
				}, cb)
			}
		}
		function asyncAll(arr, dimen, func, cb) {
			var finished = 0;
			var len;
			var outputArr;
			function done(i, output) {
				finished++;
				outputArr[i] = output;
				if (finished === len) {
					cb(null, outputArr.join(""))
				}
			}
			if (lib.isArray(arr)) {
				len = arr.length;
				outputArr = new Array(len);
				if (len === 0) {
					cb(null, "")
				} else {
					for (var i = 0; i < arr.length; i++) {
						var item = arr[i];
						switch (dimen) {
						case 1:
							func(item, i, len, done);
							break;
						case 2:
							func(item[0], item[1], i, len, done);
							break;
						case 3:
							func(item[0], item[1], item[2], i, len, done);
							break;
						default:
							item.push(i, done);
							func.apply(this, item)
						}
					}
				}
			} else {
				var keys = lib.keys(arr);
				len = keys.length;
				outputArr = new Array(len);
				if (len === 0) {
					cb(null, "")
				} else {
					for (var i = 0; i < keys.length; i++) {
						var k = keys[i];
						func(k, arr[k], i, len, done)
					}
				}
			}
		}
		modules["runtime"] = {
			Frame : Frame,
			makeMacro : makeMacro,
			makeKeywordArgs : makeKeywordArgs,
			numArgs : numArgs,
			suppressValue : suppressValue,
			memberLookup : memberLookup,
			contextOrFrameLookup : contextOrFrameLookup,
			callWrap : callWrap,
			handleError : handleError,
			isArray : lib.isArray,
			keys : lib.keys,
			SafeString : SafeString,
			copySafeness : copySafeness,
			markSafe : markSafe,
			asyncEach : asyncEach,
			asyncAll : asyncAll
		}
	})();
	(function () {
		"use strict";
		var path = modules["path"];
		var Obj = modules["object"];
		var lib = modules["lib"];
		var Loader = Obj.extend({
				on : function (name, func) {
					this.listeners = this.listeners || {};
					this.listeners[name] = this.listeners[name] || [];
					this.listeners[name].push(func)
				},
				emit : function (name) {
					var args = Array.prototype.slice.call(arguments, 1);
					if (this.listeners && this.listeners[name]) {
						lib.each(this.listeners[name], function (listener) {
							listener.apply(null, args)
						})
					}
				},
				resolve : function (from, to) {
					return path.resolve(path.dirname(from), to)
				},
				isRelative : function (filename) {
					return filename.indexOf("./") === 0 || filename.indexOf("../") === 0
				}
			});
		modules["loader"] = Loader
	})();
	(function () {
		"use strict";
		var Loader = modules["loader"];
		var WebLoader = Loader.extend({
				init : function (baseURL, neverUpdate) {
					this.precompiled = window.nunjucksPrecompiled || {};
					this.baseURL = baseURL || "";
					this.neverUpdate = neverUpdate
				},
				getSource : function (name) {
					if (this.precompiled[name]) {
						return {
							src : {
								type : "code",
								obj : this.precompiled[name]
							},
							path : name
						}
					} else {
						var src = this.fetch(this.baseURL + "/" + name);
						if (!src) {
							return null
						}
						return {
							src : src,
							path : name,
							noCache : !this.neverUpdate
						}
					}
				},
				fetch : function (url, callback) {
					var ajax;
					var loading = true;
					var src;
					if (window.XMLHttpRequest) {
						ajax = new XMLHttpRequest
					} else if (window.ActiveXObject) {
						ajax = new ActiveXObject("Microsoft.XMLHTTP")
					}
					ajax.onreadystatechange = function () {
						if (ajax.readyState === 4 && (ajax.status === 0 || ajax.status === 200) && loading) {
							loading = false;
							src = ajax.responseText
						}
					};
					url += (url.indexOf("?") === -1 ? "?" : "&") + "s=" + (new Date).getTime();
					ajax.open("GET", url, false);
					ajax.send();
					return src
				}
			});
		modules["web-loaders"] = {
			WebLoader : WebLoader
		}
	})();
	(function () {
		if (typeof window === "undefined" || window !== this) {
			modules["loaders"] = modules["node-loaders"]
		} else {
			modules["loaders"] = modules["web-loaders"]
		}
	})();
	(function () {
		"use strict";
		var lib = modules["lib"];
		var r = modules["runtime"];
		var filters = {
			abs : function (n) {
				return Math.abs(n)
			},
			batch : function (arr, linecount, fill_with) {
				var res = [];
				var tmp = [];
				for (var i = 0; i < arr.length; i++) {
					if (i % linecount === 0 && tmp.length) {
						res.push(tmp);
						tmp = []
					}
					tmp.push(arr[i])
				}
				if (tmp.length) {
					if (fill_with) {
						for (var i = tmp.length; i < linecount; i++) {
							tmp.push(fill_with)
						}
					}
					res.push(tmp)
				}
				return res
			},
			capitalize : function (str) {
				var ret = str.toLowerCase();
				return r.copySafeness(str, ret.charAt(0).toUpperCase() + ret.slice(1))
			},
			center : function (str, width) {
				width = width || 80;
				if (str.length >= width) {
					return str
				}
				var spaces = width - str.length;
				var pre = lib.repeat(" ", spaces / 2 - spaces % 2);
				var post = lib.repeat(" ", spaces / 2);
				return r.copySafeness(str, pre + str + post)
			},
			"default" : function (val, def) {
				return val ? val : def
			},
			dictsort : function (val, case_sensitive, by) {
				if (!lib.isObject(val)) {
					throw new lib.TemplateError("dictsort filter: val must be an object")
				}
				var array = [];
				for (var k in val) {
					array.push([k, val[k]])
				}
				var si;
				if (by === undefined || by === "key") {
					si = 0
				} else if (by === "value") {
					si = 1
				} else {
					throw new lib.TemplateError("dictsort filter: You can only sort by either key or value")
				}
				array.sort(function (t1, t2) {
					var a = t1[si];
					var b = t2[si];
					if (!case_sensitive) {
						if (lib.isString(a)) {
							a = a.toUpperCase()
						}
						if (lib.isString(b)) {
							b = b.toUpperCase()
						}
					}
					return a > b ? 1 : a === b ? 0 : -1
				});
				return array
			},
			escape : function (str) {
				if (typeof str === "string" || str instanceof r.SafeString) {
					return lib.escape(str)
				}
				return str
			},
			safe : function (str) {
				return r.markSafe(str)
			},
			first : function (arr) {
				return arr[0]
			},
			groupby : function (arr, attr) {
				return lib.groupBy(arr, attr)
			},
			indent : function (str, width, indentfirst) {
				width = width || 4;
				var res = "";
				var lines = str.split("\n");
				var sp = lib.repeat(" ", width);
				for (var i = 0; i < lines.length; i++) {
					if (i === 0 && !indentfirst) {
						res += lines[i] + "\n"
					} else {
						res += sp + lines[i] + "\n"
					}
				}
				return r.copySafeness(str, res)
			},
			join : function (arr, del, attr) {
				del = del || "";
				if (attr) {
					arr = lib.map(arr, function (v) {
							return v[attr]
						})
				}
				return arr.join(del)
			},
			last : function (arr) {
				return arr[arr.length - 1]
			},
			length : function (arr) {
				return arr !== undefined ? arr.length : 0
			},
			list : function (val) {
				if (lib.isString(val)) {
					return val.split("")
				} else if (lib.isObject(val)) {
					var keys = [];
					if (Object.keys) {
						keys = Object.keys(val)
					} else {
						for (var k in val) {
							keys.push(k)
						}
					}
					return lib.map(keys, function (k) {
						return {
							key : k,
							value : val[k]
						}
					})
				} else if (lib.isArray(val)) {
					return val
				} else {
					throw new lib.TemplateError("list filter: type not iterable")
				}
			},
			lower : function (str) {
				return str.toLowerCase()
			},
			random : function (arr) {
				return arr[Math.floor(Math.random() * arr.length)]
			},
			rejectattr : function (arr, attr) {
				return arr.filter(function (item) {
					return !item[attr]
				})
			},
			selectattr : function (arr, attr) {
				return arr.filter(function (item) {
					return !!item[attr]
				})
			},
			replace : function (str, old, new_, maxCount) {
				if (old instanceof RegExp) {
					return str.replace(old, new_)
				}
				var res = str;
				var last = res;
				var count = 1;
				res = res.replace(old, new_);
				while (last !== res) {
					if (count >= maxCount) {
						break
					}
					last = res;
					res = res.replace(old, new_);
					count++
				}
				return r.copySafeness(str, res)
			},
			reverse : function (val) {
				var arr;
				if (lib.isString(val)) {
					arr = filters.list(val)
				} else {
					arr = lib.map(val, function (v) {
							return v
						})
				}
				arr.reverse();
				if (lib.isString(val)) {
					return r.copySafeness(val, arr.join(""))
				}
				return arr
			},
			round : function (val, precision, method) {
				precision = precision || 0;
				var factor = Math.pow(10, precision);
				var rounder;
				if (method === "ceil") {
					rounder = Math.ceil
				} else if (method === "floor") {
					rounder = Math.floor
				} else {
					rounder = Math.round
				}
				return rounder(val * factor) / factor
			},
			slice : function (arr, slices, fillWith) {
				var sliceLength = Math.floor(arr.length / slices);
				var extra = arr.length % slices;
				var offset = 0;
				var res = [];
				for (var i = 0; i < slices; i++) {
					var start = offset + i * sliceLength;
					if (i < extra) {
						offset++
					}
					var end = offset + (i + 1) * sliceLength;
					var slice = arr.slice(start, end);
					if (fillWith && i >= extra) {
						slice.push(fillWith)
					}
					res.push(slice)
				}
				return res
			},
			sort : function (arr, reverse, caseSens, attr) {
				arr = lib.map(arr, function (v) {
						return v
					});
				arr.sort(function (a, b) {
					var x,
					y;
					if (attr) {
						x = a[attr];
						y = b[attr]
					} else {
						x = a;
						y = b
					}
					if (!caseSens && lib.isString(x) && lib.isString(y)) {
						x = x.toLowerCase();
						y = y.toLowerCase()
					}
					if (x < y) {
						return reverse ? 1 : -1
					} else if (x > y) {
						return reverse ? -1 : 1
					} else {
						return 0
					}
				});
				return arr
			},
			string : function (obj) {
				return r.copySafeness(obj, obj)
			},
			title : function (str) {
				var words = str.split(" ");
				for (var i = 0; i < words.length; i++) {
					words[i] = filters.capitalize(words[i])
				}
				return r.copySafeness(str, words.join(" "))
			},
			trim : function (str) {
				return r.copySafeness(str, str.replace(/^\s*|\s*$/g, ""))
			},
			truncate : function (input, length, killwords, end) {
				var orig = input;
				length = length || 255;
				if (input.length <= length)
					return input;
				if (killwords) {
					input = input.substring(0, length)
				} else {
					var idx = input.lastIndexOf(" ", length);
					if (idx === -1) {
						idx = length
					}
					input = input.substring(0, idx)
				}
				input += end !== undefined && end !== null ? end : "...";
				return r.copySafeness(orig, input)
			},
			upper : function (str) {
				return str.toUpperCase()
			},
			urlencode : function (obj) {
				var enc = encodeURIComponent;
				if (lib.isString(obj)) {
					return enc(obj)
				} else {
					var parts;
					if (lib.isArray(obj)) {
						parts = obj.map(function (item) {
								return enc(item[0]) + "=" + enc(item[1])
							})
					} else {
						parts = [];
						for (var k in obj) {
							if (obj.hasOwnProperty(k)) {
								parts.push(enc(k) + "=" + enc(obj[k]))
							}
						}
					}
					return parts.join("&")
				}
			},
			urlize : function (str, length, nofollow) {
				if (isNaN(length))
					length = Infinity;
				var noFollowAttr = nofollow === true ? ' rel="nofollow"' : "";
				var puncRE = /^(?:\(|<|&lt;)?(.*?)(?:\.|,|\)|\n|&gt;)?$/;
				var emailRE = /^[\w.!#$%&'*+\-\/=?\^`{|}~]+@[a-z\d\-]+(\.[a-z\d\-]+)+$/i;
				var httpHttpsRE = /^https?:\/\/.*$/;
				var wwwRE = /^www\./;
				var tldRE = /\.(?:org|net|com)(?:\:|\/|$)/;
				var words = str.split(/\s+/).filter(function (word) {
						return word && word.length
					}).map(function (word) {
						var matches = word.match(puncRE);
						var possibleUrl = matches && matches[1] || word;
						if (httpHttpsRE.test(possibleUrl))
							return '<a href="' + possibleUrl + '"' + noFollowAttr + ">" + possibleUrl.substr(0, length) + "</a>";
						if (wwwRE.test(possibleUrl))
							return '<a href="http://' + possibleUrl + '"' + noFollowAttr + ">" + possibleUrl.substr(0, length) + "</a>";
						if (emailRE.test(possibleUrl))
							return '<a href="mailto:' + possibleUrl + '">' + possibleUrl + "</a>";
						if (tldRE.test(possibleUrl))
							return '<a href="http://' + possibleUrl + '"' + noFollowAttr + ">" + possibleUrl.substr(0, length) + "</a>";
						return word
					});
				return words.join(" ")
			},
			wordcount : function (str) {
				var words = str ? str.match(/\w+/g) : null;
				return words ? words.length : null
			},
			"float" : function (val, def) {
				var res = parseFloat(val);
				return isNaN(res) ? def : res
			},
			"int" : function (val, def) {
				var res = parseInt(val, 10);
				return isNaN(res) ? def : res
			}
		};
		filters.d = filters["default"];
		filters.e = filters.escape;
		modules["filters"] = filters
	})();
	(function () {
		"use strict";
		function cycler(items) {
			var index = -1;
			return {
				current : null,
				reset : function () {
					index = -1;
					this.current = null
				},
				next : function () {
					index++;
					if (index >= items.length) {
						index = 0
					}
					this.current = items[index];
					return this.current
				}
			}
		}
		function joiner(sep) {
			sep = sep || ",";
			var first = true;
			return function () {
				var val = first ? "" : sep;
				first = false;
				return val
			}
		}
		var globals = {
			range : function (start, stop, step) {
				if (!stop) {
					stop = start;
					start = 0;
					step = 1
				} else if (!step) {
					step = 1
				}
				var arr = [];
				for (var i = start; i < stop; i += step) {
					arr.push(i)
				}
				return arr
			},
			cycler : function () {
				return cycler(Array.prototype.slice.call(arguments))
			},
			joiner : function (sep) {
				return joiner(sep)
			}
		};
		modules["globals"] = globals
	})();
	(function () {
		"use strict";
		var path = modules["path"];
		var lib = modules["lib"];
		var Obj = modules["object"];
		var lexer = modules["lexer"];
		var compiler = modules["compiler"];
		var builtin_filters = modules["filters"];
		var builtin_loaders = modules["loaders"];
		var runtime = modules["runtime"];
		var globals = modules["globals"];
		var Frame = runtime.Frame;
		var Environment = Obj.extend({
				init : function (loaders, opts) {
					var opts = this.opts = opts || {};
					this.opts.dev = !!opts.dev;
					this.opts.autoescape = !!opts.autoescape;
					this.opts.trimBlocks = !!opts.trimBlocks;
					this.opts.lstripBlocks = !!opts.lstripBlocks;
					if (!loaders) {
						if (builtin_loaders.FileSystemLoader) {
							this.loaders = [new builtin_loaders.FileSystemLoader("views")]
						} else {
							this.loaders = [new builtin_loaders.WebLoader("/views")]
						}
					} else {
						this.loaders = lib.isArray(loaders) ? loaders : [loaders]
					}
					this.initCache();
					this.filters = {};
					this.asyncFilters = [];
					this.extensions = {};
					this.extensionsList = [];
					for (var name in builtin_filters) {
						this.addFilter(name, builtin_filters[name])
					}
				},
				initCache : function () {
					lib.each(this.loaders, function (loader) {
						loader.cache = {};
						if (typeof loader.on === "function") {
							loader.on("update", function (template) {
								loader.cache[template] = null
							})
						}
					})
				},
				addExtension : function (name, extension) {
					extension._name = name;
					this.extensions[name] = extension;
					this.extensionsList.push(extension)
				},
				getExtension : function (name) {
					return this.extensions[name]
				},
				addGlobal : function (name, value) {
					globals[name] = value
				},
				addFilter : function (name, func, async) {
					var wrapped = func;
					if (async) {
						this.asyncFilters.push(name)
					}
					this.filters[name] = wrapped
				},
				getFilter : function (name) {
					if (!this.filters[name]) {
						throw new Error("filter not found: " + name)
					}
					return this.filters[name]
				},
				resolveTemplate : function (loader, parentName, filename) {
					var isRelative = loader.isRelative && parentName ? loader.isRelative(filename) : false;
					return isRelative && loader.resolve ? loader.resolve(parentName, filename) : filename
				},
				getTemplate : function (name, eagerCompile, parentName, cb) {
					var that = this;
					var tmpl = null;
					if (name && name.raw) {
						name = name.raw
					}
					if (lib.isFunction(parentName)) {
						cb = parentName;
						parentName = null;
						eagerCompile = eagerCompile || false
					}
					if (lib.isFunction(eagerCompile)) {
						cb = eagerCompile;
						eagerCompile = false
					}
					if (typeof name !== "string") {
						throw new Error("template names must be a string: " + name)
					}
					for (var i = 0; i < this.loaders.length; i++) {
						var _name = this.resolveTemplate(this.loaders[i], parentName, name);
						tmpl = this.loaders[i].cache[_name];
						if (tmpl)
							break
					}
					if (tmpl) {
						if (eagerCompile) {
							tmpl.compile()
						}
						if (cb) {
							cb(null, tmpl)
						} else {
							return tmpl
						}
					} else {
						var syncResult;
						lib.asyncIter(this.loaders, function (loader, i, next, done) {
							function handle(src) {
								if (src) {
									src.loader = loader;
									done(src)
								} else {
									next()
								}
							}
							name = that.resolveTemplate(loader, parentName, name);
							if (loader.async) {
								loader.getSource(name, function (err, src) {
									if (err) {
										throw err
									}
									handle(src)
								})
							} else {
								handle(loader.getSource(name))
							}
						}, function (info) {
							if (!info) {
								var err = new Error("template not found: " + name);
								if (cb) {
									cb(err)
								} else {
									throw err
								}
							} else {
								var tmpl = new Template(info.src, this, info.path, eagerCompile);
								if (!info.noCache) {
									info.loader.cache[name] = tmpl
								}
								if (cb) {
									cb(null, tmpl)
								} else {
									syncResult = tmpl
								}
							}
						}
							.bind(this));
						return syncResult
					}
				},
				express : function (app) {
					var env = this;
					function NunjucksView(name, opts) {
						this.name = name;
						this.path = name;
						this.defaultEngine = opts.defaultEngine;
						this.ext = path.extname(name);
						if (!this.ext && !this.defaultEngine)
							throw new Error("No default engine was specified and no extension was provided.");
						if (!this.ext)
							this.name += this.ext = ("." !== this.defaultEngine[0] ? "." : "") + this.defaultEngine
					}
					NunjucksView.prototype.render = function (opts, cb) {
						env.render(this.name, opts, cb)
					};
					app.set("view", NunjucksView)
				},
				render : function (name, ctx, cb) {
					if (lib.isFunction(ctx)) {
						cb = ctx;
						ctx = null
					}
					var syncResult = null;
					this.getTemplate(name, function (err, tmpl) {
						if (err && cb) {
							cb(err)
						} else if (err) {
							throw err
						} else {
							tmpl.render(ctx, cb || function (err, res) {
								if (err) {
									throw err
								}
								syncResult = res
							})
						}
					});
					return syncResult
				},
				renderString : function (src, ctx, opts, cb) {
					if (lib.isFunction(opts)) {
						cb = opts;
						opts = {}
					}
					opts = opts || {};
					var tmpl = new Template(src, this, opts.path);
					return tmpl.render(ctx, cb)
				}
			});
		var Context = Obj.extend({
				init : function (ctx, blocks) {
					this.ctx = ctx;
					this.blocks = {};
					this.exported = [];
					for (var name in blocks) {
						this.addBlock(name, blocks[name])
					}
				},
				lookup : function (name) {
					if (name in globals && !(name in this.ctx)) {
						return globals[name]
					} else {
						return this.ctx[name]
					}
				},
				setVariable : function (name, val) {
					this.ctx[name] = val
				},
				getVariables : function () {
					return this.ctx
				},
				addBlock : function (name, block) {
					this.blocks[name] = this.blocks[name] || [];
					this.blocks[name].push(block)
				},
				getBlock : function (name) {
					if (!this.blocks[name]) {
						throw new Error('unknown block "' + name + '"')
					}
					return this.blocks[name][0]
				},
				getSuper : function (env, name, block, frame, runtime, cb) {
					var idx = lib.indexOf(this.blocks[name] || [], block);
					var blk = this.blocks[name][idx + 1];
					var context = this;
					if (idx === -1 || !blk) {
						throw new Error('no super block available for "' + name + '"')
					}
					blk(env, context, frame, runtime, cb)
				},
				addExport : function (name) {
					this.exported.push(name)
				},
				getExported : function () {
					var exported = {};
					for (var i = 0; i < this.exported.length; i++) {
						var name = this.exported[i];
						exported[name] = this.ctx[name]
					}
					return exported
				}
			});
		var Template = Obj.extend({
				init : function (src, env, path, eagerCompile) {
					this.env = env || new Environment;
					if (lib.isObject(src)) {
						switch (src.type) {
						case "code":
							this.tmplProps = src.obj;
							break;
						case "string":
							this.tmplStr = src.obj;
							break
						}
					} else if (lib.isString(src)) {
						this.tmplStr = src
					} else {
						throw new Error("src must be a string or an object describing " + "the source")
					}
					this.path = path;
					if (eagerCompile) {
						lib.withPrettyErrors(this.path, this.env.dev, this._compile.bind(this))
					} else {
						this.compiled = false
					}
				},
				render : function (ctx, frame, cb) {
					if (typeof ctx === "function") {
						cb = ctx;
						ctx = {}
					} else if (typeof frame === "function") {
						cb = frame;
						frame = null
					}
					return lib.withPrettyErrors(this.path, this.env.dev, function () {
						try {
							this.compile()
						} catch (e) {
							if (cb)
								return cb(e);
							else
								throw e
						}
						var context = new Context(ctx || {}, this.blocks);
						var syncResult = null;
						this.rootRenderFunc(this.env, context, frame || new Frame, runtime, cb || function (err, res) {
							if (err) {
								throw err
							}
							syncResult = res
						});
						return syncResult
					}
						.bind(this))
				},
				getExported : function (ctx, frame, cb) {
					if (typeof ctx === "function") {
						cb = ctx;
						ctx = {}
					}
					if (typeof frame === "function") {
						cb = frame;
						frame = null
					}
					try {
						this.compile()
					} catch (e) {
						if (cb)
							return cb(e);
						else
							throw e
					}
					var context = new Context(ctx || {}, this.blocks);
					this.rootRenderFunc(this.env, context, frame || new Frame, runtime, function () {
						cb(null, context.getExported())
					})
				},
				compile : function () {
					if (!this.compiled) {
						this._compile()
					}
				},
				_compile : function () {
					var props;
					if (this.tmplProps) {
						props = this.tmplProps
					} else {
						var source = compiler.compile(this.tmplStr, this.env.asyncFilters, this.env.extensionsList, this.path, this.env.opts);
						var func = new Function(source);
						props = func()
					}
					this.blocks = this._getBlocks(props);
					this.rootRenderFunc = props.root;
					this.compiled = true
				},
				_getBlocks : function (props) {
					var blocks = {};
					for (var k in props) {
						if (k.slice(0, 2) === "b_") {
							blocks[k.slice(2)] = props[k]
						}
					}
					return blocks
				}
			});
		modules["environment"] = {
			Environment : Environment,
			Template : Template
		}
	})();
	var nunjucks;
	var lib = modules["lib"];
	var env = modules["environment"];
	var compiler = modules["compiler"];
	var parser = modules["parser"];
	var lexer = modules["lexer"];
	var runtime = modules["runtime"];
	var Loader = modules["loader"];
	var loaders = modules["loaders"];
	var precompile = modules["precompile"];
	nunjucks = {};
	nunjucks.Environment = env.Environment;
	nunjucks.Template = env.Template;
	nunjucks.Loader = Loader;
	nunjucks.FileSystemLoader = loaders.FileSystemLoader;
	nunjucks.WebLoader = loaders.WebLoader;
	nunjucks.compiler = compiler;
	nunjucks.parser = parser;
	nunjucks.lexer = lexer;
	nunjucks.runtime = runtime;
	var e;
	nunjucks.configure = function (templatesPath, opts) {
		opts = opts || {};
		if (lib.isObject(templatesPath)) {
			opts = templatesPath;
			templatesPath = null
		}
		var noWatch = "watch" in opts ? !opts.watch : false;
		var loader = loaders.FileSystemLoader || loaders.WebLoader;
		e = new env.Environment(new loader(templatesPath, noWatch), opts);
		if (opts && opts.express) {
			e.express(opts.express)
		}
		return e
	};
	nunjucks.compile = function (src, env, path, eagerCompile) {
		if (!e) {
			nunjucks.configure()
		}
		return new nunjucks.Template(src, env, path, eagerCompile)
	};
	nunjucks.render = function (name, ctx, cb) {
		if (!e) {
			nunjucks.configure()
		}
		return e.render(name, ctx, cb)
	};
	nunjucks.renderString = function (src, ctx, cb) {
		if (!e) {
			nunjucks.configure()
		}
		return e.renderString(src, ctx, cb)
	};
	if (precompile) {
		nunjucks.precompile = precompile.precompile;
		nunjucks.precompileString = precompile.precompileString
	}
	nunjucks.require = function (name) {
		return modules[name]
	};
	if (typeof define === "function" && define.amd) {
		define(function () {
			return nunjucks
		})
	} else {
		window.nunjucks = nunjucks;
		if (typeof module !== "undefined")
			module.exports = nunjucks
	}
})();
(function ($) {
	window.k = window.k || {};
	var env = nunjucks.configure({
			autoescape : true
		});
	env.addGlobal("_", gettext);
	env.addGlobal("ngettext", window.ngettext);
	env.addFilter("f", function (fmt, obj, named) {
		var keys = Object.keys(obj);
		var escape = env.getFilter("escape");
		for (var i = 0; i < keys.length; i++) {
			obj[keys[i]] = escape(obj[keys[i]])
		}
		return interpolate(fmt, obj, named)
	});
	env.addFilter("urlparams", function (url, params) {
		if (url) {
			var i;
			var base = url.split("?")[0];
			var qs = url.split("?")[1] || "";
			qs = qs.split("&");
			var old_params = {};
			for (i = 0; i < qs.length; i++) {
				var s = qs[i].split("=");
				old_params[s.shift()] = s.join("=")
			}
			params = $.extend({}, old_params, params);
			url = base;
			var keys = Object.keys(params);
			for (i = 0; i < keys.length; i++) {
				url += url.indexOf("?") === -1 ? "?" : "&";
				url += keys[i];
				var val = params[keys[i]];
				if (val !== undefined && val !== null && val !== "") {
					url += "=" + val
				}
			}
			return url
		}
	});
	env.addFilter("class_selected", function (v1, v2) {
		if (v1 === v2) {
			return ' class="selected" '
		}
		return ""
	});
	env.addFilter("stringify", function (obj) {
		return JSON.stringify(obj)
	});
	env.addFilter("encodeURI", function (uri) {
		return encodeURI(uri)
	});
	k.nunjucksEnv = env
})(jQuery);
(function ($) {
	window.k = window.k || {};
	var cache = {};
	function CachedXHR() {}
	CachedXHR.prototype.dumpCache = function () {
		return cache
	};
	CachedXHR.prototype.clearCache = function () {
		cache = {};
		return this
	};
	CachedXHR.prototype.fetch = function (url, cacheKey) {
		var key = url;
		if (cacheKey) {
			key += "::" + cacheKey
		}
		return cache[key]
	};
	CachedXHR.prototype.store = function (url, cacheKey, lifetime, data, textStatus, jqXHR) {
		var key = url;
		if (cacheKey) {
			key += "::" + cacheKey
		}
		cache[key] = {
			expires : moment().add(lifetime[0], lifetime[1]),
			data : data,
			textStatus : textStatus,
			jqXHR : jqXHR
		};
		return this
	};
	CachedXHR.prototype.request = function (url, options) {
		var self = this;
		options = $.extend({
				lifetime : [5, "minutes"]
			}, options);
		var success = options.success;
		var callback = function (data, textStatus, jqXHR) {
			self.store(url, options.cacheKey, options.lifetime, data, textStatus, jqXHR);
			if (success) {
				success(data, textStatus, jqXHR)
			}
		};
		options.success = callback;
		var cached = self.fetch(url, options.cacheKey);
		if (cached && cached.expires > moment() && !options.forceReload) {
			if (success) {
				success(cached.data, cached.textStatus, cached.jqXHR)
			}
		} else {
			$.ajax(url, options)
		}
		return self
	};
	k.CachedXHR = CachedXHR
})(jQuery);
(function ($, _) {
	window.k = k || {};
	var cxhr = new k.CachedXHR;
	function Search(baseUrl, params) {
		this.baseUrl = baseUrl;
		this.params = $.extend({}, params)
	}
	Search.prototype._buildQueryUrl = function (query, params) {
		var url = this.baseUrl + "?q=" + query;
		if (params) {
			url += "&" + params
		}
		return url
	};
	Search.prototype.setParam = function (key, value) {
		this.params[key] = value;
		return this
	};
	Search.prototype.setParams = function (params) {
		$.extend(this.params, params);
		return this
	};
	Search.prototype.getParam = function (key) {
		return this.params[key]
	};
	Search.prototype.unsetParam = function (key) {
		delete this.params[key];
		return this
	};
	Search.prototype.clearLastQuery = function () {
		this.lastQuery = "";
		this.lastParams = ""
	};
	Search.prototype.hasLastQuery = function () {
		return !!this.lastQuery
	};
	Search.prototype.lastQueryUrl = function () {
		return this._buildQueryUrl(this.lastQuery, this.lastParams)
	};
	Search.prototype.queryUrl = function (query) {
		return this._buildQueryUrl(this.lastQuery, this.serializeParams())
	};
	Search.prototype.serializeParams = function (extra) {
		var params = $.extend({}, this.params, extra);
		var keys = Object.keys(params);
		var paramStrings = [];
		$(keys).each(function () {
			paramStrings.push(this + "=" + params[this])
		});
		return paramStrings.join("&")
	};
	Search.prototype.query = function (string, callback) {
		var data = $.extend({}, this.params, {
				q : string
			});
		this.lastQuery = string;
		this.lastParams = this.serializeParams({
				q : string
			});
		cxhr.request(this.baseUrl, {
			cacheKey : this.lastParams,
			data : data,
			dataType : "json",
			success : callback
		});
		return this
	};
	k.Search = Search
})(jQuery, k.nunjucksEnv);
var BrowserDetect = window.BrowserDetect = {
	init : function () {
		var detected = this.detect();
		this.browser = detected[0];
		this.version = detected[1];
		this.OS = detected[2]
	},
	detect : function (inputString) {
		var browser = this.searchString(this.dataBrowser, inputString);
		var version;
		if (inputString) {
			version = this.searchVersion(inputString)
		} else {
			version = this.searchVersion(navigator.userAgent, inputString) || this.searchVersion(navigator.appVersion, inputString)
		}
		var os = this.searchString(this.dataOS, inputString);
		var res = this.fxosSpecialCase(inputString, browser, version, os);
		return res
	},
	searchString : function (data, inputString) {
		for (var i = 0, l = data.length; i < l; i++) {
			var matchedAll,
			dataString = inputString || data[i].string;
			this.versionSearchString = data[i].versionSearch || data[i].identity;
			matchedAll = _.reduce(data[i].subStrings, function (memo, sub) {
					if (sub instanceof RegExp) {
						return memo && sub.exec(dataString)
					} else {
						return memo && dataString.indexOf(sub) !== -1
					}
				}, true);
			if (matchedAll) {
				return data[i].identity
			}
		}
	},
	searchVersion : function (dataString) {
		var index = dataString.indexOf(this.versionSearchString);
		if (index === -1) {
			return null
		}
		return parseFloat(dataString.substring(index + this.versionSearchString.length + 1))
	},
	fxosSpecialCase : function (ua, browser, version, os) {
		ua = ua || navigator.userAgent;
		var match = /Gecko\/([\d.]+)/.exec(ua);
		if (os === "fxos" && !!match) {
			var geckoVersion = parseFloat(match[1]);
			version = this.dataGeckoToFxOS[geckoVersion];
			browser = "fxos"
		}
		return [browser, version, os]
	},
	dataBrowser : [{
			string : navigator.userAgent,
			subStrings : ["Fennec"],
			versionSearch : "Fennec",
			identity : "m"
		}, {
			string : navigator.userAgent,
			subStrings : ["Android", "Firefox"],
			versionSearch : "Firefox",
			identity : "m"
		}, {
			string : navigator.userAgent,
			subStrings : ["Firefox"],
			versionSearch : "Firefox",
			identity : "fx"
		}, {
			string : navigator.userAgent,
			subStrings : ["FxiOS"],
			identity : "fxios",
			versionSearch : "FxiOS"
		}
	],
	dataOS : [{
			string : navigator.userAgent,
			subStrings : [/Windows NT 6.[23]/],
			identity : "win8"
		}, {
			string : navigator.userAgent,
			subStrings : [/Windows NT 6\.[01]/],
			identity : "win7"
		}, {
			string : navigator.userAgent,
			subStrings : [/Windows NT 5\./],
			identity : "winxp"
		}, {
			string : navigator.userAgent,
			subStrings : [/Windows NT 10\./],
			identity : "win10"
		}, {
			string : navigator.platform,
			subStrings : ["Win"],
			identity : "win"
		}, {
			string : navigator.userAgent,
			subStrings : [/iPad|iPhone|iPod Touch/],
			identity : "ios"
		}, {
			string : navigator.platform,
			subStrings : ["Mac"],
			identity : "mac"
		}, {
			string : navigator.userAgent,
			subStrings : ["Android"],
			identity : "android"
		}, {
			string : navigator.userAgent,
			subStrings : ["Maemo"],
			identity : "maemo"
		}, {
			string : navigator.platform,
			subStrings : ["Linux"],
			identity : "linux"
		}, {
			string : navigator.userAgent,
			subStrings : ["Firefox"],
			identity : "fxos"
		}
	],
	dataGeckoToFxOS : {
		18 : 1,
		18.1 : 1.1,
		26 : 1.2,
		28 : 1.3,
		30 : 1.4,
		32 : 2,
		34 : 2.1,
		37 : 2.2,
		44 : 2.5
	}
};
BrowserDetect.init();
if (typeof Mozilla == "undefined") {
	var Mozilla = {}
}
(function ($) {
	"use strict";
	if (typeof Mozilla.UITour == "undefined") {
		Mozilla.UITour = {}
	}
	var themeIntervalId = null;
	function _stopCyclingThemes() {
		if (themeIntervalId) {
			clearInterval(themeIntervalId);
			themeIntervalId = null
		}
	}
	function _sendEvent(action, data) {
		var event = new CustomEvent("mozUITour", {
				bubbles : true,
				detail : {
					action : action,
					data : data || {}
				}
			});
		document.dispatchEvent(event)
	}
	function _generateCallbackID() {
		return Math.random().toString(36).replace(/[^a-z]+/g, "")
	}
	function _waitForCallback(callback) {
		var id = _generateCallbackID();
		function listener(event) {
			if (typeof event.detail != "object")
				return;
			if (event.detail.callbackID != id)
				return;
			document.removeEventListener("mozUITourResponse", listener);
			callback(event.detail.data)
		}
		document.addEventListener("mozUITourResponse", listener);
		return id
	}
	var notificationListener = null;
	function _notificationListener(event) {
		if (typeof event.detail != "object")
			return;
		if (typeof notificationListener != "function")
			return;
		notificationListener(event.detail.event, event.detail.params)
	}
	Mozilla.UITour.DEFAULT_THEME_CYCLE_DELAY = 10 * 1e3;
	Mozilla.UITour.CONFIGNAME_SYNC = "sync";
	Mozilla.UITour.CONFIGNAME_AVAILABLETARGETS = "availableTargets";
	Mozilla.UITour.ping = function (callback) {
		var data = {};
		if (callback) {
			data.callbackID = _waitForCallback(callback)
		}
		_sendEvent("ping", data)
	};
	Mozilla.UITour.observe = function (listener, callback) {
		notificationListener = listener;
		if (listener) {
			document.addEventListener("mozUITourNotification", _notificationListener);
			Mozilla.UITour.ping(callback)
		} else {
			document.removeEventListener("mozUITourNotification", _notificationListener)
		}
	};
	Mozilla.UITour.registerPageID = function (pageID) {
		_sendEvent("registerPageID", {
			pageID : pageID
		})
	};
	Mozilla.UITour.showHighlight = function (target, effect) {
		_sendEvent("showHighlight", {
			target : target,
			effect : effect
		})
	};
	Mozilla.UITour.hideHighlight = function () {
		_sendEvent("hideHighlight")
	};
	Mozilla.UITour.showInfo = function (target, title, text, icon, buttons, options) {
		var buttonData = [];
		if (Array.isArray(buttons)) {
			for (var i = 0; i < buttons.length; i++) {
				buttonData.push({
					label : buttons[i].label,
					icon : buttons[i].icon,
					style : buttons[i].style,
					callbackID : _waitForCallback(buttons[i].callback)
				})
			}
		}
		var closeButtonCallbackID,
		targetCallbackID;
		if (options && options.closeButtonCallback)
			closeButtonCallbackID = _waitForCallback(options.closeButtonCallback);
		if (options && options.targetCallback)
			targetCallbackID = _waitForCallback(options.targetCallback);
		_sendEvent("showInfo", {
			target : target,
			title : title,
			text : text,
			icon : icon,
			buttons : buttonData,
			closeButtonCallbackID : closeButtonCallbackID,
			targetCallbackID : targetCallbackID
		})
	};
	Mozilla.UITour.hideInfo = function () {
		_sendEvent("hideInfo")
	};
	Mozilla.UITour.previewTheme = function (theme) {
		_stopCyclingThemes();
		_sendEvent("previewTheme", {
			theme : JSON.stringify(theme)
		})
	};
	Mozilla.UITour.resetTheme = function () {
		_stopCyclingThemes();
		_sendEvent("resetTheme")
	};
	Mozilla.UITour.cycleThemes = function (themes, delay, callback) {
		_stopCyclingThemes();
		if (!delay) {
			delay = Mozilla.UITour.DEFAULT_THEME_CYCLE_DELAY
		}
		function nextTheme() {
			var theme = themes.shift();
			themes.push(theme);
			_sendEvent("previewTheme", {
				theme : JSON.stringify(theme),
				state : true
			});
			callback(theme)
		}
		themeIntervalId = setInterval(nextTheme, delay);
		nextTheme()
	};
	Mozilla.UITour.addPinnedTab = function () {
		_sendEvent("addPinnedTab")
	};
	Mozilla.UITour.removePinnedTab = function () {
		_sendEvent("removePinnedTab")
	};
	Mozilla.UITour.showMenu = function (name, callback) {
		var showCallbackID;
		if (callback)
			showCallbackID = _waitForCallback(callback);
		_sendEvent("showMenu", {
			name : name,
			showCallbackID : showCallbackID
		})
	};
	Mozilla.UITour.hideMenu = function (name) {
		_sendEvent("hideMenu", {
			name : name
		})
	};
	Mozilla.UITour.startUrlbarCapture = function (text, url) {
		_sendEvent("startUrlbarCapture", {
			text : text,
			url : url
		})
	};
	Mozilla.UITour.endUrlbarCapture = function () {
		_sendEvent("endUrlbarCapture")
	};
	Mozilla.UITour.getConfiguration = function (configName, callback) {
		_sendEvent("getConfiguration", {
			callbackID : _waitForCallback(callback),
			configuration : configName
		})
	};
	Mozilla.UITour.showFirefoxAccounts = function () {
		_sendEvent("showFirefoxAccounts")
	};
	Mozilla.UITour.resetFirefox = function () {
		_sendEvent("resetFirefox")
	};
	Mozilla.UITour.addNavBarWidget = function (name, callback) {
		_sendEvent("addNavBarWidget", {
			name : name,
			callbackID : _waitForCallback(callback)
		})
	};
	Mozilla.UITour.setDefaultSearchEngine = function (identifier) {
		_sendEvent("setDefaultSearchEngine", {
			identifier : identifier
		})
	};
	Mozilla.UITour.setTreatmentTag = function (name, value) {
		_sendEvent("setTreatmentTag", {
			name : name,
			value : value
		})
	};
	Mozilla.UITour.getTreatmentTag = function (name, callback) {
		_sendEvent("getTreatmentTag", {
			name : name,
			callbackID : _waitForCallback(callback)
		})
	};
	Mozilla.UITour.setSearchTerm = function (term) {
		_sendEvent("setSearchTerm", {
			term : term
		})
	};
	Mozilla.UITour.openSearchPanel = function (callback) {
		_sendEvent("openSearchPanel", {
			callbackID : _waitForCallback(callback)
		})
	}
})();
(function ($) {
	"use strict";
	var TEMPLATE = '<div class="kbox-container">' + '<a href="#close" class="kbox-close">&#x2716;</a>' + '<div class="kbox-title"></div>' + '<div class="kbox-wrap"><div class="kbox-placeholder"/></div>' + "</div>",
	OVERLAY = '<div id="kbox-overlay"></div>';
	function KBox(el, options) {
		KBox.prototype.init.call(this, el, options)
	}
	KBox.prototype = {
		init : function (el, options) {
			var self = this;
			self.el = el;
			self.html = typeof el === "string" && el;
			self.$el = $(el);
			options = $.extend({
					clickTarget : self.$el.data("target"),
					closeOnEsc : self.$el.data("close-on-esc") === undefined ? true : !!self.$el.data("close-on-esc"),
					closeOnOutClick : !!self.$el.data("close-on-out-click"),
					container : self.html && $("body"),
					destroy : !!self.$el.data("destroy"),
					id : self.$el.data("id"),
					modal : !!self.$el.data("modal"),
					position : self.$el.data("position") || "center",
					preOpen : false,
					preClose : false,
					template : TEMPLATE,
					title : self.$el.attr("title") || self.$el.attr("data-title")
				}, options);
			self.options = options;
			self.$clickTarget = options.clickTarget && $(options.clickTarget);
			self.$container = options.container && $(options.container);
			self.rendered = false;
			self.$ph = false;
			self.$kbox = $();
			self.isOpen = false;
			self.$el.data("kbox", self);
			if (self.$clickTarget) {
				self.$clickTarget.click(function (ev) {
					ev.preventDefault();
					self.open()
				})
			}
		},
		updateOptions : function (options) {
			var self = this;
			self.options = $.extend(self.options, options);
			self.$clickTarget = options.clickTarget && $(options.clickTarget);
			self.$container = options.container && $(options.container)
		},
		render : function () {
			var self = this;
			self.$kbox = $(self.options.template);
			if (self.$container) {
				if (self.$el.parent().length) {
					self.$ph = self.$el.before('<div style="display:none;"/>').prev()
				}
				self.$kbox.appendTo(self.$container)
			} else {
				self.$el.before(self.$kbox)
			}
			if (self.options.id) {
				self.$kbox.attr("id", self.options.id)
			}
			if (self.options.title) {
				self.$kbox.find(".kbox-title").text(self.options.title)
			}
			self.$kbox.find(".kbox-placeholder").replaceWith(self.$el.detach());
			self.$kbox.delegate(".kbox-close, .kbox-cancel", "click", function (ev) {
				ev.preventDefault();
				self.close()
			});
			self.rendered = true
		},
		open : function () {
			var self = this;
			if (self.options.preOpen && !self.options.preOpen.call(self)) {
				return
			}
			if (self.isOpen) {
				return
			}
			self.isOpen = true;
			if (!self.rendered) {
				self.render()
			}
			self.$kbox.addClass("kbox-open");
			self.setPosition();
			if (self.options.modal) {
				self.createOverlay()
			}
			if (self.options.closeOnEsc) {
				self.keypressHandler = function (ev) {
					if (ev.keyCode === 27) {
						self.close()
					}
				};
				$(document).keypress(self.keypressHandler)
			}
			if (self.options.closeOnOutClick) {
				self.clickHandler = function (ev) {
					if ($(ev.target).closest(".kbox-container").length === 0) {
						self.close()
					}
				};
				setTimeout(function () {
					$("body").click(self.clickHandler)
				}, 0)
			}
		},
		setPosition : function (position) {
			var self = this,
			toX,
			toY,
			$parent,
			parentOffset,
			minX,
			minY,
			scrollL,
			scrollT;
			if (!position) {
				position = self.options.position
			}
			if (position === "none" || !self.$kbox.length) {
				return
			}
			if (position === "center") {
				$parent = self.$kbox.offsetParent();
				parentOffset = $parent.offset();
				scrollL = $(window).scrollLeft();
				scrollT = $(window).scrollTop();
				minX = -parentOffset.left + scrollL;
				minY = -parentOffset.top + scrollT;
				toX = ($(window).width() - self.$kbox.outerWidth()) / 2 - parentOffset.left + scrollL;
				toY = ($(window).height() - self.$kbox.outerHeight()) / 2 - parentOffset.top + scrollT;
				if (toX < minX) {
					toX = minX
				}
				if (toY < minY) {
					toY = minY
				}
				self.$kbox.css({
					left : toX,
					top : toY,
					right : "inherit",
					bottom : "inherit"
				})
			}
		},
		close : function () {
			var self = this;
			if (self.options.preClose && !self.options.preClose.call(self)) {
				return
			}
			if (!self.isOpen) {
				return
			}
			self.isOpen = false;
			self.$kbox.removeClass("kbox-open");
			if (self.options.modal) {
				self.destroyOverlay()
			}
			if (self.options.destroy) {
				self.destroy()
			}
			if (self.options.closeOnEsc) {
				$("body").unbind("keypress", self.keypressHandler)
			}
			if (self.options.closeOnOutClick) {
				$("body").unbind("click", self.clickHandler)
			}
		},
		destroy : function () {
			var self = this;
			if (self.$container && self.$ph) {
				self.$ph.replaceWith(self.$el.detach())
			}
			self.$kbox.remove()
		},
		createOverlay : function () {
			var self = this;
			self.$overlay = $(OVERLAY);
			self.$kbox.before(self.$overlay)
		},
		destroyOverlay : function () {
			if (this.$overlay) {
				this.$overlay.remove();
				delete this.$overlay
			}
		}
	};
	$.fn.kbox = function (options) {
		return this.each(function () {
			new KBox(this, options)
		})
	};
	window.KBox = KBox;
	$(".kbox").kbox()
})(jQuery);
window.k = window.k || {};
(function () {
	k.LAZY_DELAY = 500;
	k.STATIC_URL = $("body").data("static-url");
	k.getQueryParamsAsDict = function (url) {
		var queryString = "",
		splitUrl,
		urlParams = {},
		e,
		a = /\+/g,
		r = /([^&=]+)=?([^&]*)/g,
		d = function (s) {
			return decodeURIComponent(s.replace(a, " "))
		};
		if (url) {
			splitUrl = url.split("?");
			if (splitUrl.length > 1) {
				queryString = splitUrl.splice(1).join("")
			}
		} else {
			queryString = window.location.search.substring(1)
		}
		e = r.exec(queryString);
		while (e) {
			urlParams[d(e[1])] = d(e[2]);
			e = r.exec(queryString)
		}
		return urlParams
	};
	k.queryParamStringFromDict = function (obj) {
		var qs = "";
		_.forEach(obj, function (value, key) {
			if (value === undefined || value === null) {
				return
			}
			qs += key + "=" + encodeURIComponent(value);
			qs += "&"
		});
		qs = qs.slice(0, -1);
		return "?" + qs
	};
	k.getReferrer = function (urlParams) {
		if (urlParams.as === "s") {
			return "search"
		} else if (urlParams.as === "u") {
			return "inproduct"
		} else {
			return document.referrer
		}
	};
	k.getSearchQuery = function (urlParams, referrer) {
		if (referrer === "search") {
			return urlParams.s
		} else if (referrer !== "inproduct") {
			return k.getQueryParamsAsDict(referrer).q || ""
		}
		return ""
	};
	k.unquote = function (str) {
		if (str) {
			str = str.replace(/\\\"/g, '"');
			if (str[0] === '"' && str[str.length - 1] === '"') {
				return str.slice(1, str.length - 1)
			}
		}
		return str
	};
	var UNSAFE_CHARS = {
		"&" : "&amp;",
		"<" : "&lt;",
		">" : "&gt;",
		"'" : "&#39;",
		'"' : "&quot;"
	};
	k.safeString = function (str) {
		if (str) {
			return str.replace(new RegExp("[&<>'\"]", "g"), function (m) {
				return UNSAFE_CHARS[m]
			})
		}
		return str
	};
	k.safeInterpolate = function (fmt, obj, named) {
		if (named) {
			for (var j in obj) {
				obj[j] = k.safeString(obj[j])
			}
		} else {
			for (var i = 0, l = obj.length; i < l; i++) {
				obj[i] = k.safeString(obj[i])
			}
		}
		return interpolate(fmt, obj, named)
	};
	$.ajaxSetup({
		beforeSend : function (xhr, settings) {
			var csrfElem = document.querySelector("input[name=csrfmiddlewaretoken]");
			var csrf = $.cookie("csrftoken");
			if (!csrf && csrfElem) {
				csrf = csrfElem.value
			}
			if (csrf) {
				xhr.setRequestHeader("X-CSRFToken", csrf)
			}
		}
	});
	$(document).ready(function () {
		layoutTweaks();
		$("#content ul.errorlist a").click(function () {
			$($(this).attr("href")).focus();
			return false
		});
		if ($("body").data("readonly")) {
			var $forms = $("form[method=post]");
			$forms.find("input, button, select, textarea").attr("disabled", "disabled");
			$forms.find("input[type=image]").css("opacity", .5);
			$("div.editor-tools").remove()
		}
		$("input[placeholder]").placeholder();
		initAutoSubmitSelects();
		disableFormsOnSubmit();
		removeAuthToken();
		userMessageUI();
		$("#skip-to-search").on("click", function (ev) {
			ev.preventDefault();
			$("input[name=q]").last().get(0).focus()
		})
	});
	window.addEventListener("popstate", function () {
		setTimeout(layoutTweaks, 0)
	});
	function initAutoSubmitSelects() {
		$("select.autosubmit").change(function () {
			$(this).closest("form").submit()
		})
	}
	function disableFormsOnSubmit() {
		$("form").submit(function (ev) {
			var $this = $(this);
			if ($this.attr("method").toLowerCase() === "post") {
				if ($this.data("disabled")) {
					ev.preventDefault()
				} else {
					$this.data("disabled", true).addClass("disabled")
				}
				function enableForm() {
					$this.data("disabled", false).removeClass("disabled")
				}
				$this.ajaxComplete(function () {
					enableForm();
					$this.unbind("ajaxComplete")
				});
				$(window).unload(enableForm);
				setTimeout(enableForm, 5e3)
			}
		})
	}
	function remove_item(from_list, match_against) {
		match_against = match_against.toLowerCase();
		for (var i in from_list) {
			if (match_against.indexOf(from_list[i]) >= 0) {
				from_list.splice(i, 1)
			}
		}
	}
	function userMessageUI() {
		$(".user-messages > li").each(function () {
			var $msg = $(this);
			$("<div>", {
				"class" : "close-button"
			}).appendTo($msg)
		});
		function key($msg) {
			return "user-message::dismissed::" + $msg.attr("id")
		}
		$(".user-messages .dismissible").each(function () {
			if (Modernizr.localstorage) {
				var $msg = $(this);
				if (!localStorage.getItem(key($msg))) {
					$msg.show()
				}
			}
		});
		$(".user-messages").on("click", ".dismissible .btn.dismiss", function (e) {
			if (Modernizr.localstorage) {
				var $msg = $(this).parent();
				localStorage.setItem(key($msg), true);
				$msg.hide()
			}
		})
	}
	function layoutTweaks() {
		$(".card-grid").each(function () {
			var $cards = $(this).children("li");
			var max = 0;
			$cards.each(function () {
				var h = $(this).height();
				if (h > max) {
					max = h
				}
			});
			$cards.height(max)
		})
	}
	function pad(str, length, padChar) {
		str = "" + str;
		while (str.length < length) {
			str = padChar + str
		}
		return str
	}
	k.dateFormat = function (format, d) {
		var dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
		var month = pad(d.getMonth() + 1, 2, "0");
		var date = pad(d.getDate(), 2, "0");
		var hours = pad(d.getHours(), 2, "0");
		var minutes = pad(d.getMinutes(), 2, "0");
		var seconds = pad(d.getSeconds(), 2, "0");
		return interpolate(format, {
			year : d.getFullYear(),
			month : month,
			date : date,
			day : dayNames[d.getDay()],
			hours : hours,
			minutes : minutes,
			seconds : seconds
		}, true)
	};
	function removeAuthToken() {
		var qs = window.location.search.slice(1);
		var query = qs.split("&").map(function (pair) {
				return [pair.split("=")[0], pair.split("=").slice(1).join("=")]
			});
		var authFound = false;
		query = query.filter(function (pair) {
				if (pair[0] === "auth") {
					authFound = true;
					return false
				}
				return true
			});
		if (authFound) {
			qs = "?" + query.map(function (pair) {
					return pair.join("=")
				}).join("&");
			history.replaceState(this.state, {}, qs)
		}
	}
})();
var format = function () {
	var re = /\{([^}]+)\}/g;
	return function (s, args) {
		if (!args) {
			return s
		}
		if (!(args instanceof Array || args instanceof Object)) {
			args = Array.prototype.slice.call(arguments, 1)
		}
		return s.replace(re, function (_, match) {
			return args[match]
		})
	}
}
();
function template(s) {
	return function (args) {
		return format(s, args)
	}
}
window.Modernizr = function (window, document, undefined) {
	var version = "2.6.1",
	Modernizr = {},
	enableClasses = true,
	docElement = document.documentElement,
	mod = "modernizr",
	modElem = document.createElement(mod),
	mStyle = modElem.style,
	inputElem = document.createElement("input"),
	smile = ":)",
	toString = {}
	.toString,
	prefixes = " -webkit- -moz- -o- -ms- ".split(" "),
	omPrefixes = "Webkit Moz O ms",
	cssomPrefixes = omPrefixes.split(" "),
	domPrefixes = omPrefixes.toLowerCase().split(" "),
	ns = {
		svg : "http://www.w3.org/2000/svg"
	},
	tests = {},
	inputs = {},
	attrs = {},
	classes = [],
	slice = classes.slice,
	featureName,
	injectElementWithStyles = function (rule, callback, nodes, testnames) {
		var style,
		ret,
		node,
		div = document.createElement("div"),
		body = document.body,
		fakeBody = body ? body : document.createElement("body");
		if (parseInt(nodes, 10)) {
			while (nodes--) {
				node = document.createElement("div");
				node.id = testnames ? testnames[nodes] : mod + (nodes + 1);
				div.appendChild(node)
			}
		}
		style = ["&#173;", '<style id="s', mod, '">', rule, "</style>"].join("");
		div.id = mod;
		(body ? div : fakeBody).innerHTML += style;
		fakeBody.appendChild(div);
		if (!body) {
			fakeBody.style.background = "";
			docElement.appendChild(fakeBody)
		}
		ret = callback(div, rule);
		!body ? fakeBody.parentNode.removeChild(fakeBody) : div.parentNode.removeChild(div);
		return !!ret
	},
	testMediaQuery = function (mq) {
		var matchMedia = window.matchMedia || window.msMatchMedia;
		if (matchMedia) {
			return matchMedia(mq).matches
		}
		var bool;
		injectElementWithStyles("@media " + mq + " { #" + mod + " { position: absolute; } }", function (node) {
			bool = (window.getComputedStyle ? getComputedStyle(node, null) : node.currentStyle)["position"] == "absolute"
		});
		return bool
	},
	isEventSupported = function () {
		var TAGNAMES = {
			select : "input",
			change : "input",
			submit : "form",
			reset : "form",
			error : "img",
			load : "img",
			abort : "img"
		};
		function isEventSupported(eventName, element) {
			element = element || document.createElement(TAGNAMES[eventName] || "div");
			eventName = "on" + eventName;
			var isSupported = eventName in element;
			if (!isSupported) {
				if (!element.setAttribute) {
					element = document.createElement("div")
				}
				if (element.setAttribute && element.removeAttribute) {
					element.setAttribute(eventName, "");
					isSupported = is(element[eventName], "function");
					if (!is(element[eventName], "undefined")) {
						element[eventName] = undefined
					}
					element.removeAttribute(eventName)
				}
			}
			element = null;
			return isSupported
		}
		return isEventSupported
	}
	(),
	_hasOwnProperty = {}
	.hasOwnProperty,
	hasOwnProp;
	if (!is(_hasOwnProperty, "undefined") && !is(_hasOwnProperty.call, "undefined")) {
		hasOwnProp = function (object, property) {
			return _hasOwnProperty.call(object, property)
		}
	} else {
		hasOwnProp = function (object, property) {
			return property in object && is(object.constructor.prototype[property], "undefined")
		}
	}
	if (!Function.prototype.bind) {
		Function.prototype.bind = function bind(that) {
			var target = this;
			if (typeof target != "function") {
				throw new TypeError
			}
			var args = slice.call(arguments, 1),
			bound = function () {
				if (this instanceof bound) {
					var F = function () {};
					F.prototype = target.prototype;
					var self = new F;
					var result = target.apply(self, args.concat(slice.call(arguments)));
					if (Object(result) === result) {
						return result
					}
					return self
				} else {
					return target.apply(that, args.concat(slice.call(arguments)))
				}
			};
			return bound
		}
	}
	function setCss(str) {
		mStyle.cssText = str
	}
	function setCssAll(str1, str2) {
		return setCss(prefixes.join(str1 + ";") + (str2 || ""))
	}
	function is(obj, type) {
		return typeof obj === type
	}
	function contains(str, substr) {
		return !!~("" + str).indexOf(substr)
	}
	function testProps(props, prefixed) {
		for (var i in props) {
			var prop = props[i];
			if (!contains(prop, "-") && mStyle[prop] !== undefined) {
				return prefixed == "pfx" ? prop : true
			}
		}
		return false
	}
	function testDOMProps(props, obj, elem) {
		for (var i in props) {
			var item = obj[props[i]];
			if (item !== undefined) {
				if (elem === false)
					return props[i];
				if (is(item, "function")) {
					return item.bind(elem || obj)
				}
				return item
			}
		}
		return false
	}
	function testPropsAll(prop, prefixed, elem) {
		var ucProp = prop.charAt(0).toUpperCase() + prop.slice(1),
		props = (prop + " " + cssomPrefixes.join(ucProp + " ") + ucProp).split(" ");
		if (is(prefixed, "string") || is(prefixed, "undefined")) {
			return testProps(props, prefixed)
		} else {
			props = (prop + " " + domPrefixes.join(ucProp + " ") + ucProp).split(" ");
			return testDOMProps(props, prefixed, elem)
		}
	}
	tests["flexbox"] = function () {
		return testPropsAll("flexWrap")
	};
	tests["flexboxlegacy"] = function () {
		return testPropsAll("boxDirection")
	};
	tests["canvas"] = function () {
		var elem = document.createElement("canvas");
		return !!(elem.getContext && elem.getContext("2d"))
	};
	tests["canvastext"] = function () {
		return !!(Modernizr["canvas"] && is(document.createElement("canvas").getContext("2d").fillText, "function"))
	};
	tests["webgl"] = function () {
		return !!window.WebGLRenderingContext
	};
	tests["touch"] = function () {
		var bool;
		if ("ontouchstart" in window || window.DocumentTouch && document instanceof DocumentTouch) {
			bool = true
		} else {
			injectElementWithStyles(["@media (", prefixes.join("touch-enabled),("), mod, ")", "{#modernizr{top:9px;position:absolute}}"].join(""), function (node) {
				bool = node.offsetTop === 9
			})
		}
		return bool
	};
	tests["geolocation"] = function () {
		return "geolocation" in navigator
	};
	tests["postmessage"] = function () {
		return !!window.postMessage
	};
	tests["websqldatabase"] = function () {
		return !!window.openDatabase
	};
	tests["indexedDB"] = function () {
		return !!testPropsAll("indexedDB", window)
	};
	tests["hashchange"] = function () {
		return isEventSupported("hashchange", window) && (document.documentMode === undefined || document.documentMode > 7)
	};
	tests["history"] = function () {
		return !!(window.history && history.pushState)
	};
	tests["draganddrop"] = function () {
		var div = document.createElement("div");
		return "draggable" in div || "ondragstart" in div && "ondrop" in div
	};
	tests["websockets"] = function () {
		return "WebSocket" in window || "MozWebSocket" in window
	};
	tests["rgba"] = function () {
		setCss("background-color:rgba(150,255,150,.5)");
		return contains(mStyle.backgroundColor, "rgba")
	};
	tests["hsla"] = function () {
		setCss("background-color:hsla(120,40%,100%,.5)");
		return contains(mStyle.backgroundColor, "rgba") || contains(mStyle.backgroundColor, "hsla")
	};
	tests["multiplebgs"] = function () {
		setCss("background:url(https://),url(https://),red url(https://)");
		return /(url\s*\(.*?){3}/.test(mStyle.background)
	};
	tests["backgroundsize"] = function () {
		return testPropsAll("backgroundSize")
	};
	tests["borderimage"] = function () {
		return testPropsAll("borderImage")
	};
	tests["borderradius"] = function () {
		return testPropsAll("borderRadius")
	};
	tests["boxshadow"] = function () {
		return testPropsAll("boxShadow")
	};
	tests["textshadow"] = function () {
		return document.createElement("div").style.textShadow === ""
	};
	tests["opacity"] = function () {
		setCssAll("opacity:.55");
		return /^0.55$/.test(mStyle.opacity)
	};
	tests["cssanimations"] = function () {
		return testPropsAll("animationName")
	};
	tests["csscolumns"] = function () {
		return testPropsAll("columnCount")
	};
	tests["cssgradients"] = function () {
		var str1 = "background-image:",
		str2 = "gradient(linear,left top,right bottom,from(#9f9),to(white));",
		str3 = "linear-gradient(left top,#9f9, white);";
		setCss((str1 + "-webkit- ".split(" ").join(str2 + str1) + prefixes.join(str3 + str1)).slice(0, -str1.length));
		return contains(mStyle.backgroundImage, "gradient")
	};
	tests["cssreflections"] = function () {
		return testPropsAll("boxReflect")
	};
	tests["csstransforms"] = function () {
		return !!testPropsAll("transform")
	};
	tests["csstransforms3d"] = function () {
		var ret = !!testPropsAll("perspective");
		if (ret && "webkitPerspective" in docElement.style) {
			injectElementWithStyles("@media (transform-3d),(-webkit-transform-3d){#modernizr{left:9px;position:absolute;height:3px;}}", function (node, rule) {
				ret = node.offsetLeft === 9 && node.offsetHeight === 3
			})
		}
		return ret
	};
	tests["csstransitions"] = function () {
		return testPropsAll("transition")
	};
	tests["fontface"] = function () {
		var bool;
		injectElementWithStyles('@font-face {font-family:"font";src:url("https://")}', function (node, rule) {
			var style = document.getElementById("smodernizr"),
			sheet = style.sheet || style.styleSheet,
			cssText = sheet ? sheet.cssRules && sheet.cssRules[0] ? sheet.cssRules[0].cssText : sheet.cssText || "" : "";
			bool = /src/i.test(cssText) && cssText.indexOf(rule.split(" ")[0]) === 0
		});
		return bool
	};
	tests["generatedcontent"] = function () {
		var bool;
		injectElementWithStyles(['#modernizr:after{content:"', smile, '";visibility:hidden}'].join(""), function (node) {
			bool = node.offsetHeight >= 1
		});
		return bool
	};
	tests["video"] = function () {
		var elem = document.createElement("video"),
		bool = false;
		try {
			if (bool = !!elem.canPlayType) {
				bool = new Boolean(bool);
				bool.ogg = elem.canPlayType('video/ogg; codecs="theora"').replace(/^no$/, "");
				bool.h264 = elem.canPlayType('video/mp4; codecs="avc1.42E01E"').replace(/^no$/, "");
				bool.webm = elem.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/, "")
			}
		} catch (e) {}
		return bool
	};
	tests["audio"] = function () {
		var elem = document.createElement("audio"),
		bool = false;
		try {
			if (bool = !!elem.canPlayType) {
				bool = new Boolean(bool);
				bool.ogg = elem.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, "");
				bool.mp3 = elem.canPlayType("audio/mpeg;").replace(/^no$/, "");
				bool.wav = elem.canPlayType('audio/wav; codecs="1"').replace(/^no$/, "");
				bool.m4a = (elem.canPlayType("audio/x-m4a;") || elem.canPlayType("audio/aac;")).replace(/^no$/, "")
			}
		} catch (e) {}
		return bool
	};
	tests["localstorage"] = function () {
		try {
			localStorage.setItem(mod, mod);
			localStorage.removeItem(mod);
			return true
		} catch (e) {
			return false
		}
	};
	tests["sessionstorage"] = function () {
		try {
			sessionStorage.setItem(mod, mod);
			sessionStorage.removeItem(mod);
			return true
		} catch (e) {
			return false
		}
	};
	tests["webworkers"] = function () {
		return !!window.Worker
	};
	tests["applicationcache"] = function () {
		return !!window.applicationCache
	};
	tests["svg"] = function () {
		return !!document.createElementNS && !!document.createElementNS(ns.svg, "svg").createSVGRect
	};
	tests["inlinesvg"] = function () {
		var div = document.createElement("div");
		div.innerHTML = "<svg/>";
		return (div.firstChild && div.firstChild.namespaceURI) == ns.svg
	};
	tests["smil"] = function () {
		return !!document.createElementNS && /SVGAnimate/.test(toString.call(document.createElementNS(ns.svg, "animate")))
	};
	tests["svgclippaths"] = function () {
		return !!document.createElementNS && /SVGClipPath/.test(toString.call(document.createElementNS(ns.svg, "clipPath")))
	};
	function webforms() {
		Modernizr["input"] = function (props) {
			for (var i = 0, len = props.length; i < len; i++) {
				attrs[props[i]] = !!(props[i]in inputElem)
			}
			if (attrs.list) {
				attrs.list = !!(document.createElement("datalist") && window.HTMLDataListElement)
			}
			return attrs
		}
		("autocomplete autofocus list placeholder max min multiple pattern required step".split(" "));
		Modernizr["inputtypes"] = function (props) {
			for (var i = 0, bool, inputElemType, defaultView, len = props.length; i < len; i++) {
				inputElem.setAttribute("type", inputElemType = props[i]);
				bool = inputElem.type !== "text";
				if (bool) {
					inputElem.value = smile;
					inputElem.style.cssText = "position:absolute;visibility:hidden;";
					if (/^range$/.test(inputElemType) && inputElem.style.WebkitAppearance !== undefined) {
						docElement.appendChild(inputElem);
						defaultView = document.defaultView;
						bool = defaultView.getComputedStyle && defaultView.getComputedStyle(inputElem, null).WebkitAppearance !== "textfield" && inputElem.offsetHeight !== 0;
						docElement.removeChild(inputElem)
					} else if (/^(search|tel)$/.test(inputElemType)) {}
					else if (/^(url|email)$/.test(inputElemType)) {
						bool = inputElem.checkValidity && inputElem.checkValidity() === false
					} else {
						bool = inputElem.value != smile
					}
				}
				inputs[props[i]] = !!bool
			}
			return inputs
		}
		("search tel url email datetime date month week time datetime-local number range color".split(" "))
	}
	for (var feature in tests) {
		if (hasOwnProp(tests, feature)) {
			featureName = feature.toLowerCase();
			Modernizr[featureName] = tests[feature]();
			classes.push((Modernizr[featureName] ? "" : "no-") + featureName)
		}
	}
	Modernizr.input || webforms();
	Modernizr.addTest = function (feature, test) {
		if (typeof feature == "object") {
			for (var key in feature) {
				if (hasOwnProp(feature, key)) {
					Modernizr.addTest(key, feature[key])
				}
			}
		} else {
			feature = feature.toLowerCase();
			if (Modernizr[feature] !== undefined) {
				return Modernizr
			}
			test = typeof test == "function" ? test() : test;
			if (enableClasses) {
				docElement.className += " " + (test ? "" : "no-") + feature
			}
			Modernizr[feature] = test
		}
		return Modernizr
	};
	setCss("");
	modElem = inputElem = null;
	(function (window, document) {
		var options = window.html5 || {};
		var reSkip = /^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i;
		var saveClones = /^<|^(?:a|b|button|code|div|fieldset|form|h1|h2|h3|h4|h5|h6|i|iframe|img|input|label|li|link|ol|option|p|param|q|script|select|span|strong|style|table|tbody|td|textarea|tfoot|th|thead|tr|ul)$/i;
		var supportsHtml5Styles;
		var expando = "_html5shiv";
		var expanID = 0;
		var expandoData = {};
		var supportsUnknownElements;
		(function () {
			try {
				var a = document.createElement("a");
				a.innerHTML = "<xyz></xyz>";
				supportsHtml5Styles = "hidden" in a;
				supportsUnknownElements = a.childNodes.length == 1 || function () {
					document.createElement("a");
					var frag = document.createDocumentFragment();
					return typeof frag.cloneNode == "undefined" || typeof frag.createDocumentFragment == "undefined" || typeof frag.createElement == "undefined"
				}
				()
			} catch (e) {
				supportsHtml5Styles = true;
				supportsUnknownElements = true
			}
		})();
		function addStyleSheet(ownerDocument, cssText) {
			var p = ownerDocument.createElement("p"),
			parent = ownerDocument.getElementsByTagName("head")[0] || ownerDocument.documentElement;
			p.innerHTML = "x<style>" + cssText + "</style>";
			return parent.insertBefore(p.lastChild, parent.firstChild)
		}
		function getElements() {
			var elements = html5.elements;
			return typeof elements == "string" ? elements.split(" ") : elements
		}
		function getExpandoData(ownerDocument) {
			var data = expandoData[ownerDocument[expando]];
			if (!data) {
				data = {};
				expanID++;
				ownerDocument[expando] = expanID;
				expandoData[expanID] = data
			}
			return data
		}
		function createElement(nodeName, ownerDocument, data) {
			if (!ownerDocument) {
				ownerDocument = document
			}
			if (supportsUnknownElements) {
				return ownerDocument.createElement(nodeName)
			}
			if (!data) {
				data = getExpandoData(ownerDocument)
			}
			var node;
			if (data.cache[nodeName]) {
				node = data.cache[nodeName].cloneNode()
			} else if (saveClones.test(nodeName)) {
				node = (data.cache[nodeName] = data.createElem(nodeName)).cloneNode()
			} else {
				node = data.createElem(nodeName)
			}
			return node.canHaveChildren && !reSkip.test(nodeName) ? data.frag.appendChild(node) : node
		}
		function createDocumentFragment(ownerDocument, data) {
			if (!ownerDocument) {
				ownerDocument = document
			}
			if (supportsUnknownElements) {
				return ownerDocument.createDocumentFragment()
			}
			data = data || getExpandoData(ownerDocument);
			var clone = data.frag.cloneNode(),
			i = 0,
			elems = getElements(),
			l = elems.length;
			for (; i < l; i++) {
				clone.createElement(elems[i])
			}
			return clone
		}
		function shivMethods(ownerDocument, data) {
			if (!data.cache) {
				data.cache = {};
				data.createElem = ownerDocument.createElement;
				data.createFrag = ownerDocument.createDocumentFragment;
				data.frag = data.createFrag()
			}
			ownerDocument.createElement = function (nodeName) {
				if (!html5.shivMethods) {
					return data.createElem(nodeName)
				}
				return createElement(nodeName, ownerDocument, data)
			};
			ownerDocument.createDocumentFragment = Function("h,f", "return function(){" + "var n=f.cloneNode(),c=n.createElement;" + "h.shivMethods&&(" + getElements().join().replace(/\w+/g, function (nodeName) {
						data.createElem(nodeName);
						data.frag.createElement(nodeName);
						return 'c("' + nodeName + '")'
					}) + ");return n}")(html5, data.frag)
		}
		function shivDocument(ownerDocument) {
			if (!ownerDocument) {
				ownerDocument = document
			}
			var data = getExpandoData(ownerDocument);
			if (html5.shivCSS && !supportsHtml5Styles && !data.hasCSS) {
				data.hasCSS = !!addStyleSheet(ownerDocument, "article,aside,figcaption,figure,footer,header,hgroup,nav,section{display:block}" + "mark{background:#FF0;color:#000}")
			}
			if (!supportsUnknownElements) {
				shivMethods(ownerDocument, data)
			}
			return ownerDocument
		}
		var html5 = {
			elements : options.elements || "abbr article aside audio bdi canvas data datalist details figcaption figure footer header hgroup mark meter nav output progress section summary time video",
			shivCSS : options.shivCSS !== false,
			supportsUnknownElements : supportsUnknownElements,
			shivMethods : options.shivMethods !== false,
			type : "default",
			shivDocument : shivDocument,
			createElement : createElement,
			createDocumentFragment : createDocumentFragment
		};
		window.html5 = html5;
		shivDocument(document)
	})(this, document);
	Modernizr._version = version;
	Modernizr._prefixes = prefixes;
	Modernizr._domPrefixes = domPrefixes;
	Modernizr._cssomPrefixes = cssomPrefixes;
	Modernizr.mq = testMediaQuery;
	Modernizr.hasEvent = isEventSupported;
	Modernizr.testProp = function (prop) {
		return testProps([prop])
	};
	Modernizr.testAllProps = testPropsAll;
	Modernizr.testStyles = injectElementWithStyles;
	Modernizr.prefixed = function (prop, obj, elem) {
		if (!obj) {
			return testPropsAll(prop, "pfx")
		} else {
			return testPropsAll(prop, obj, elem)
		}
	};
	docElement.className = docElement.className.replace(/(^|\s)no-js(\s|$)/, "$1$2") + (enableClasses ? " js " + classes.join(" ") : "");
	return Modernizr
}
(this, this.document);
(function () {
	var GeoIPUrl = "https://location.services.mozilla.com/v1/country?key=fa6d7fc9-e091-4be1-b6c1-5ada5815ae9d";
	var countryData = {
		country_name : $.cookie("geoip_country_name"),
		country_code : $.cookie("geoip_country_code")
	};
	if (!countryData.country_name) {
		$.ajax({
			method : "GET",
			url : GeoIPUrl
		}).done(function (data) {
			$.cookie("geoip_country_name", data.country_name);
			$.cookie("geoip_country_code", data.country_code);
			countryData = data
		}).fail(function (error) {
			throw new Error("Error retrieving geoip data")
		}).always(function () {
			handleLocale(countryData.country_name)
		})
	} else {
		handleLocale(countryData.country_name)
	}
})();
function handleLocale(countryName) {
	var languageSuggestions = {
		"en-US" : {
			Indonesia : "id",
			Bangladesh : "bn-BD"
		}
	};
	var currentLocale = $("html").attr("lang");
	var suggestedLocale = (languageSuggestions[currentLocale] || {})[countryName];
	var $announceBar = $("#announce-geoip-suggestion");
	if (suggestedLocale) {
		$.ajax({
			method : "GET",
			url : "/geoip-suggestion",
			data : {
				locales : [currentLocale, suggestedLocale]
			}
		}).done(function (data) {
			var languageInCurrentLocale = data.locales[suggestedLocale][0];
			var languageInNativeLocale = data.locales[suggestedLocale][1];
			var currentLocaleSuggestion = interpolate(data[currentLocale].suggestion, {
					language : languageInCurrentLocale
				}, true);
			var suggestedLocaleSuggestion = interpolate(data[suggestedLocale].suggestion, {
					language : languageInNativeLocale
				}, true);
			var $container = $announceBar.find(".container_12");
			var $message = $container.find(".grid_12");
			$message.append($("<span/>").text(currentLocaleSuggestion));
			$message.append($('<button class="btn confirm" />').text(data[currentLocale].confirm));
			$message.append($('<button class="btn cancel" />').text(data[currentLocale].cancel));
			if (data[currentLocale].suggestion !== data[suggestedLocale].suggestion) {
				$message = $('<div class="grid_12" />').appendTo($container);
				$message.append($("<span/>").text(suggestedLocaleSuggestion));
				$message.append($('<button class="btn confirm" />').text(data[suggestedLocale].confirm));
				$message.append($('<button class="btn cancel" />').text(data[suggestedLocale].cancel))
			}
			trackEvent("Geo IP Targeting", "show banner")
		}).error(function (err) {
			console.error("GeoIP suggestion error", err)
		});
		$announceBar.on("click", ".btn", function (ev) {
			var $this = $(this);
			$announceBar.find(".close-button").click();
			if ($this.hasClass("confirm")) {
				trackEvent("Geo IP Targeting", "click yes");
				setTimeout(function () {
					var newQsVar = "lang=" + suggestedLocale;
					if (window.location.search.length === 0) {
						newQsVar = "?" + newQsVar
					} else {
						newQsVar = "&" + newQsVar
					}
					window.location.search += newQsVar
				}, 250)
			} else {
				trackEvent("Geo IP Targeting", "click no")
			}
		})
	} else {
		$announceBar.remove()
	}
}
var Mailcheck = {
	domainThreshold : 4,
	topLevelThreshold : 3,
	defaultDomains : ["yahoo.com", "google.com", "hotmail.com", "gmail.com", "me.com", "aol.com", "mac.com", "live.com", "comcast.net", "googlemail.com", "msn.com", "hotmail.co.uk", "yahoo.co.uk", "facebook.com", "verizon.net", "sbcglobal.net", "att.net", "gmx.com", "mail.com", "outlook.com", "icloud.com"],
	defaultTopLevelDomains : ["co.jp", "co.uk", "com", "net", "org", "info", "edu", "gov", "mil", "ca"],
	run : function (opts) {
		opts.domains = opts.domains || Mailcheck.defaultDomains;
		opts.topLevelDomains = opts.topLevelDomains || Mailcheck.defaultTopLevelDomains;
		opts.distanceFunction = opts.distanceFunction || Mailcheck.sift3Distance;
		var defaultCallback = function (result) {
			return result
		};
		var suggestedCallback = opts.suggested || defaultCallback;
		var emptyCallback = opts.empty || defaultCallback;
		var result = Mailcheck.suggest(Mailcheck.encodeEmail(opts.email), opts.domains, opts.topLevelDomains, opts.distanceFunction);
		return result ? suggestedCallback(result) : emptyCallback()
	},
	suggest : function (email, domains, topLevelDomains, distanceFunction) {
		email = email.toLowerCase();
		var emailParts = this.splitEmail(email);
		var closestDomain = this.findClosestDomain(emailParts.domain, domains, distanceFunction, this.domainThreshold);
		if (closestDomain) {
			if (closestDomain != emailParts.domain) {
				return {
					address : emailParts.address,
					domain : closestDomain,
					full : emailParts.address + "@" + closestDomain
				}
			}
		} else {
			var closestTopLevelDomain = this.findClosestDomain(emailParts.topLevelDomain, topLevelDomains, distanceFunction, this.topLevelThreshold);
			if (emailParts.domain && closestTopLevelDomain && closestTopLevelDomain != emailParts.topLevelDomain) {
				var domain = emailParts.domain;
				closestDomain = domain.substring(0, domain.lastIndexOf(emailParts.topLevelDomain)) + closestTopLevelDomain;
				return {
					address : emailParts.address,
					domain : closestDomain,
					full : emailParts.address + "@" + closestDomain
				}
			}
		}
		return false
	},
	findClosestDomain : function (domain, domains, distanceFunction, threshold) {
		threshold = threshold || this.topLevelThreshold;
		var dist;
		var minDist = 99;
		var closestDomain = null;
		if (!domain || !domains) {
			return false
		}
		if (!distanceFunction) {
			distanceFunction = this.sift3Distance
		}
		for (var i = 0; i < domains.length; i++) {
			if (domain === domains[i]) {
				return domain
			}
			dist = distanceFunction(domain, domains[i]);
			if (dist < minDist) {
				minDist = dist;
				closestDomain = domains[i]
			}
		}
		if (minDist <= threshold && closestDomain !== null) {
			return closestDomain
		} else {
			return false
		}
	},
	sift3Distance : function (s1, s2) {
		if (s1 == null || s1.length === 0) {
			if (s2 == null || s2.length === 0) {
				return 0
			} else {
				return s2.length
			}
		}
		if (s2 == null || s2.length === 0) {
			return s1.length
		}
		var c = 0;
		var offset1 = 0;
		var offset2 = 0;
		var lcs = 0;
		var maxOffset = 5;
		while (c + offset1 < s1.length && c + offset2 < s2.length) {
			if (s1.charAt(c + offset1) == s2.charAt(c + offset2)) {
				lcs++
			} else {
				offset1 = 0;
				offset2 = 0;
				for (var i = 0; i < maxOffset; i++) {
					if (c + i < s1.length && s1.charAt(c + i) == s2.charAt(c)) {
						offset1 = i;
						break
					}
					if (c + i < s2.length && s1.charAt(c) == s2.charAt(c + i)) {
						offset2 = i;
						break
					}
				}
			}
			c++
		}
		return (s1.length + s2.length) / 2 - lcs
	},
	splitEmail : function (email) {
		var parts = email.trim().split("@");
		if (parts.length < 2) {
			return false
		}
		for (var i = 0; i < parts.length; i++) {
			if (parts[i] === "") {
				return false
			}
		}
		var domain = parts.pop();
		var domainParts = domain.split(".");
		var tld = "";
		if (domainParts.length == 0) {
			return false
		} else if (domainParts.length == 1) {
			tld = domainParts[0]
		} else {
			for (var i = 1; i < domainParts.length; i++) {
				tld += domainParts[i] + "."
			}
			if (domainParts.length >= 2) {
				tld = tld.substring(0, tld.length - 1)
			}
		}
		return {
			topLevelDomain : tld,
			domain : domain,
			address : parts.join("@")
		}
	},
	encodeEmail : function (email) {
		var result = encodeURI(email);
		result = result.replace("%20", " ").replace("%25", "%").replace("%5E", "^").replace("%60", "`").replace("%7B", "{").replace("%7C", "|").replace("%7D", "}");
		return result
	}
};
if (typeof module !== "undefined" && module.exports) {
	module.exports = Mailcheck
}
if (typeof window !== "undefined" && window.jQuery) {
	(function ($) {
		$.fn.mailcheck = function (opts) {
			var self = this;
			if (opts.suggested) {
				var oldSuggested = opts.suggested;
				opts.suggested = function (result) {
					oldSuggested(self, result)
				}
			}
			if (opts.empty) {
				var oldEmpty = opts.empty;
				opts.empty = function () {
					oldEmpty.call(null, self)
				}
			}
			opts.email = this.val();
			Mailcheck.run(opts)
		}
	})(jQuery)
}
(function ($) {
	"use strict";
	$(document).ready(function () {
		initFolding();
		initAnnouncements();
		$("#delete-profile-username-input").keyup(function (ev) {
			var username = $("#delete-profile-username").val();
			var inputUsername = $("#delete-profile-username-input").val();
			if (inputUsername === username) {
				$("#delete-profile-button").prop("disabled", false)
			} else {
				$("#delete-profile-button").prop("disabled", true)
			}
		});
		$(window).scroll(_.throttle(function () {
				if ($(window).scrollTop() > $("body > header").outerHeight()) {
					$("body").addClass("scroll-header")
				} else {
					$("body").removeClass("scroll-header")
				}
			}, 100));
		if ($.datepicker) {
			$('input[type="date"]').datepicker()
		}
		$(".ui-truncatable .show-more-link").click(function (ev) {
			ev.preventDefault();
			$(this).closest(".ui-truncatable").removeClass("truncated")
		});
		$(document).on("click", ".close-button", function () {
			var $this = $(this);
			var $target;
			if ($this.data("close-id")) {
				$target = $("#" + $this.data("close-id"));
				if ($this.data("close-memory") === "remember") {
					if (Modernizr.localstorage) {
						localStorage.setItem($this.data("close-id") + ".closed", true)
					}
				}
			} else {
				$target = $this.parent()
			}
			if ($this.data("close-type") === "remove") {
				$target.remove()
			} else {
				$target.hide()
			}
		});
		$(document).on("change", "select[data-submit]", function () {
			var $this = $(this);
			var $form = $this.data("submit") ? $("#" + $this.data("submit")) : $this.closest("form");
			$form.submit()
		});
		$('[data-close-memory="remember"]').each(function () {
			var $this = $(this);
			var id = $this.data("close-id");
			if (id) {
				if (Modernizr.localstorage) {
					if (localStorage.getItem(id + ".closed") === "true") {
						var $target = $("#" + id);
						if ($this.data("close-type") === "remove") {
							$target.remove()
						} else {
							$("#" + id).hide()
						}
					}
				}
			}
		});
		$("[data-toggle]").each(function () {
			var $this = $(this);
			var $target = $this.data("toggle-target") ? $($this.data("toggle-target")) : $this;
			var trigger = $this.data("toggle-trigger") ? $this.data("toggle-trigger") : "click";
			var targetId = $target.attr("id");
			if ($this.data("toggle-sticky") && targetId) {
				if (Modernizr.localstorage) {
					var targetClasses = localStorage.getItem(targetId + ".classes") || "[]";
					targetClasses = JSON.parse(targetClasses);
					$target.addClass(targetClasses.join(" "))
				}
			}
			$this.on(trigger, function (ev) {
				ev.preventDefault();
				var classname = $this.data("toggle");
				$target.toggleClass(classname);
				if ($this.data("toggle-sticky") && targetId) {
					if (Modernizr.localstorage) {
						var classes = localStorage.getItem(targetId + ".classes") || "[]";
						classes = JSON.parse(classes);
						var i = classes.indexOf(classname);
						if ($target.hasClass(classname) && i === -1) {
							classes.push(classname)
						} else if (!$target.hasClass(classname) && i > -1) {
							classes.splice(i, 1)
						}
						localStorage.setItem(targetId + ".classes", JSON.stringify(classes))
					}
				}
				return false
			})
		});
		$('[data-ui-type="tabbed-view"]').each(function () {
			var $tv = $(this);
			var $tabs = $tv.children('[data-tab-role="tabs"]').children();
			var $panels = $tv.children('[data-tab-role="panels"]').children();
			$tabs.each(function (i) {
				$(this).on("click", function () {
					$panels.hide();
					$panels.eq(i).show();
					$tabs.removeClass("selected");
					$tabs.eq(i).addClass("selected")
				})
			});
			$tabs.first().trigger("click")
		});
		$(".btn, a").each(function () {
			var $this = $(this);
			var $form = $this.closest("form");
			var type = $this.attr("data-type");
			var trigger = $this.attr("data-trigger");
			if (type === "submit") {
				if ($this.attr("data-form")) {
					$form = $("#" + $this.attr("data-form"))
				}
				$this.on("click", function (ev) {
					var name = $this.attr("data-name");
					var value = $this.attr("data-value");
					ev.preventDefault();
					if (name) {
						var $input = $('<input type="hidden">');
						$input.attr("name", name);
						if (value) {
							$input.val(value)
						} else {
							$input.val("1")
						}
						$form.append($input)
					}
					if ($this.attr("data-nosubmit") !== "1") {
						$form.trigger("submit")
					}
				})
			} else if (trigger === "click") {
				$this.on("click", function (ev) {
					ev.preventDefault();
					$($this.attr("data-trigger-target"))[0].click();
					return false
				})
			}
		});
		var foldingSelectors = '.folding-section, [data-ui-type="folding-section"]';
		$("body").on("click", foldingSelectors + " header", function () {
			$(this).closest(foldingSelectors).toggleClass("collapsed")
		});
		$("form[data-confirm]").on("submit", function () {
			return confirm($(this).data("confirm-text"))
		})
	});
	$(window).load(function () {
		correctFixedHeader();
		$('[data-ui-type="carousel"]').each(function () {
			var $this = $(this);
			var $container = $(this).children().first();
			var width = 0;
			var height = 0;
			$container.children().each(function () {
				if (height < $(this).outerHeight()) {
					height = $(this).outerHeight()
				}
				width += $(this).outerWidth() + parseInt($(this).css("marginRight")) + parseInt($(this).css("marginLeft"))
			});
			$this.css("height", height + "px");
			$container.css({
				width : width + "px",
				height : height + "px"
			});
			$container.children().css("height", height + "px");
			var $left = $("#" + $this.data("left"));
			var $right = $("#" + $this.data("right"));
			var scrollInterval;
			$left.on("mouseover", function () {
				scrollInterval = setInterval(function () {
						$this.scrollLeft($this.scrollLeft() - 1)
					}, 1)
			});
			$left.on("mouseout", function () {
				clearInterval(scrollInterval)
			});
			$right.on("mouseover", function () {
				scrollInterval = setInterval(function () {
						$this.scrollLeft($this.scrollLeft() + 1)
					}, 1)
			});
			$right.on("mouseout", function () {
				clearInterval(scrollInterval)
			})
		})
	});
	function initFolding() {
		var $folders = $(".sidebar-folding > li");
		$folders.children("a, span").click(function () {
			var $parent = $(this).parent();
			$parent.toggleClass("selected");
			if (Modernizr.localstorage) {
				var id = $parent.attr("id");
				var folded = $parent.hasClass("selected");
				if (id) {
					localStorage.setItem(id + ".folded", folded)
				}
			}
			return false
		});
		if (Modernizr.localstorage) {
			$folders.each(function () {
				var $this = $(this);
				var id = $this.attr("id");
				if (id) {
					var folded = localStorage.getItem(id + ".folded");
					if (folded === "true") {
						$this.addClass("selected")
					} else if (folded === "false") {
						$this.removeClass("selected")
					}
				}
			})
		}
	}
	function correctFixedHeader() {
		var headerHeight = document.querySelector("header");
		var scrollHeight = headerHeight.scrollHeight;
		if (window.location.hash && document.querySelector(window.location.hash)) {
			window.scrollBy(0, -scrollHeight)
		}
	}
	function initAnnouncements() {
		var $announcements = $("#announcements");
		$(document).on("click", "#tabzilla", function () {
			$("body").prepend($announcements)
		});
		if (Modernizr.localstorage) {
			$announcements.on("click", ".close-button", function () {
				var id = $(this).closest(".announce-bar").attr("id");
				localStorage.setItem(id + ".closed", true)
			});
			$announcements.find(".announce-bar").each(function () {
				var $this = $(this);
				var id = $this.attr("id");
				if (localStorage.getItem(id + ".closed") !== "true") {
					$this.show()
				}
			})
		} else {
			$announcements.find(".announce-bar").show()
		}
	}
	$(document).on("click", "#show-password", function () {
		var $form = $(this).closest("form");
		var $pw = $form.find('input[name="password"]');
		$pw.attr("type", this.checked ? "text" : "password")
	});
	var validate_field_cb = function () {
		var $this = $(this);
		var $v = $this.closest("[data-validate-url]");
		var url = $v.data("validate-url");
		var $label = $v.find(".validation-label");
		var extras = $v.data("validate-extras");
		if (_.contains(extras, "email")) {
			var domain = $this.val().split("@").pop();
			var corrected = Mailcheck.findClosestDomain(domain, ["gmail.com", "yahoo.com", "hotmail.com"]);
			var ignoreList = $this.data("mailcheck-ignore") || [];
			if (corrected && corrected !== domain && !_.contains(ignoreList, $this.val())) {
				var $ignore = $("<a />").attr("href", "#").addClass("ignore-email").text(gettext("No, ignore"));
				$ignore.on("click", function (ev) {
					ev.preventDefault();
					ignoreList.push($this.val());
					$this.data("mailcheck-ignore", ignoreList);
					$this.trigger("change")
				});
				$label.removeClass("valid");
				$label.text(interpolate(gettext("Did you mean %s?"), [corrected]));
				$label.append($ignore);
				$label.show();
				return false
			} else {
				$label.hide()
			}
		}
		$.getJSON(url, {
			field : $this.attr("name"),
			value : $this.val()
		}, function (data) {
			if ($this.val().length) {
				if (data.valid) {
					$label.addClass("valid");
					$label.text($v.data("valid-label"))
				} else {
					$label.removeClass("valid");
					$label.text(data.error)
				}
				$label.show()
			} else {
				$label.hide()
			}
		})
	};
	$(document).on("keyup", "[data-validate-url] input", _.throttle(validate_field_cb, 200));
	$(document).on("change", "[data-validate-url] input", _.throttle(validate_field_cb, 200));
	$(window).on("hashchange", correctFixedHeader);
	$(document).on("click", "[data-mozilla-ui-reset]", function (ev) {
		ev.preventDefault();
		if (Mozilla && Mozilla.UITour) {
			/*trackEvent("Refresh Firefox", "click refresh button");
			if (JSON.parse($("body").data("waffle-refresh-survey"))) {
				$.cookie("showFirefoxResetSurvey", "1", {
					expires : 365
				})
			}*/
			Mozilla.UITour.resetFirefox()
		}
		return false
	})
})(jQuery);
function _dntEnabled(dnt, _ua) {
	"use strict";
	var dntStatus = dnt || navigator.doNotTrack || window.doNotTrack || navigator.msDoNotTrack;
	var ua = _ua || navigator.userAgent;
	var anomalousWinVersions = ["Windows NT 6.1", "Windows NT 6.2", "Windows NT 6.3"];
	var fxMatch = ua.match(/Firefox\/(\d+)/);
	var ieRegEx = /MSIE|Trident/i;
	var isIE = ieRegEx.test(ua);
	var platform = ua.match(/Windows.+?(?=;)/g);
	if (isIE && typeof Array.prototype.indexOf !== "function") {
		return false
	} else if (fxMatch && parseInt(fxMatch[1], 10) < 32) {
		dntStatus = "Unspecified"
	} else if (isIE && platform && anomalousWinVersions.indexOf(platform.toString()) !== -1) {
		dntStatus = "Unspecified"
	} else {
		dntStatus = {
			0 : "Disabled",
			1 : "Enabled"
		}
		[dntStatus] || "Unspecified"
	}
	//return dntStatus === "Enabled" ? true : false
	return true;
}
if (!_dntEnabled()) {
	var _gaq = _gaq || [];
	var extraPush = $("body").data("ga-push");
	var alternateUrl = $("body").data("ga-alternate-url");
	_gaq.push(["_setAccount", "UA-36116321-2"]);
	if (extraPush && extraPush.length) {
		for (var i = 0, l = extraPush.length; i < l; i++) {
			_gaq.push(extraPush[i])
		}
	}
	if (alternateUrl) {
		_gaq.push(["_trackPageview", alternateUrl])
	} else {
		_gaq.push(["_trackPageview"])
	}
	(function () {
		var ga = document.createElement("script");
		ga.type = "text/javascript";
		ga.async = true;
		if (document.location.protocol === "https:") {
			ga.src = "https://ssl.google-analytics.com/ga.js"
		} else {
			ga.src = "http://www.google-analytics.com/ga.js"
		}
		var s = document.getElementsByTagName("script")[0];
		s.parentNode.insertBefore(ga, s)
	})();
	function parseAnalyticsData(data) {
		var items = data.split(/,\s*/);
		var results = [];
		$(items).each(function () {
			results.push(this.split(/\s*\|\s*/))
		});
		return results
	}
	$("body").on("click", "a[data-ga-click]", function (ev) {
		ev.preventDefault();
		var $this = $(this);
		var gaData = parseAnalyticsData($this.data("ga-click"));
		var href = $this.attr("href");
		$(gaData).each(function () {
			_gaq.push(this)
		});
		setTimeout(function () {
			document.location.href = href
		}, 250);
		return false
	});
	$("body").on("click", "button[data-ga-click]", function (ev) {
		ev.preventDefault();
		var $this = $(this);
		var gaData = parseAnalyticsData($this.data("ga-click"));
		$(gaData).each(function () {
			_gaq.push(this)
		});
		setTimeout(function () {
			$this.closest("form").submit()
		}, 250);
		return false
	});
	if ($("body").is(".product-landing")) {
		setTimeout(function () {
			if (_gaq) {
				_gaq.push(["_trackEvent", "Landing Page Read - 10 seconds", $("body").data("product-slug")])
			}
		}, 1e4);
		setTimeout(function () {
			if (_gaq) {
				_gaq.push(["_trackEvent", "Landing Page Read - 5 seconds", $("body").data("product-slug")])
			}
		}, 5e3)
	}
}
function trackEvent(category, action, value) {
	if (_gaq) {
		_gaq.push(["_trackEvent", category, action, value])
	}
}
function trackPageview(value) {
	if (_gaq) {
		_gaq.push(["_trackPageview", value])
	}
}
(function () {
	function launchWindow(url) {
		var sg_div = document.createElement("div");
		sg_div.innerHTML = "<h1>You have been selected for a survey</h1>" + '<p>We appreciate your feedback!</p><p><a href="' + url + '">Please click here to start it now.</a></p>' + "<a href=\"#\" onclick=\"document.getElementById('sg-popup').style.display = 'none';return false;\">No, thank you.</a>";
		sg_div.id = "sg-popup";
		document.body.appendChild(sg_div)
	}
	function basicSurvey(surveyGizmoURL) {
		if (!$.cookie("hasSurveyed")) {
			window.addEventListener("load", function (e) {
				launchWindow(surveyGizmoURL);
				$.cookie("hasSurveyed", "1", {
					expires : 365
				})
			})
		}
	}
	var surveys = {
		mobile : function () {
			basicSurvey("https://qsurvey.mozilla.com/s3/63ac9fdb1ce1")
		},
		questions : function () {
			basicSurvey("https://www.surveygizmo.com/s3/1717268/SUMO-Survey-candidate-collection-forum")
		},
		firefox_refresh : function () {
			var surveyGizmoURL = "https://www.surveygizmo.com/s3/2010802/69cc2a79f50b";
			if ($.cookie("showFirefoxResetSurvey") === "1" && !$.cookie("hasEverFirefoxResetSurvey")) {
				window.addEventListener("load", function (e) {
					launchWindow(surveyGizmoURL);
					$.cookie("showFirefoxResetSurvey", "0", {
						expires : 365
					});
					$.cookie("hasEverFirefoxResetSurvey", "1", {
						expires : 365
					})
				})
			}
		},
		beacon : function () {
			window.SurveyGizmoBeacon = "sg_beacon";
			window.sg_beacon = window.sg_beacon || function () {
				window.sg_beacon.q = window.sg_beacon.q || [];
				window.sg_beacon.q.push(arguments)
			};
			var beaconScript = document.createElement("script");
			beaconScript.async = 1;
			beaconScript.src = "//d2bnxibecyz4h5.cloudfront.net/runtimejs/intercept/intercept.js";
			var lastScriptTag = document.getElementsByTagName("script")[0];
			lastScriptTag.parentNode.insertBefore(beaconScript, lastScriptTag);
			window.sg_beacon("init", "MjgwNDktQUYyRDQ3ODk0MjY1NEVFNUIwNTI3MjhFMDk2QTE3RDU=")
		}
	};
	$(function () {
		var surveyList = $("body").data("survey-gizmos") || [];
		for (var i = 0; i < surveyList.length; i++) {
			var survey = surveys[surveyList[i]];
			if (survey) {
				survey()
			}
		}
	})
})();
(function ($) {
	var searchTimeout;
	var locale = $("html").attr("lang");
	var search = new k.Search("/" + locale + "/search");
	var cxhr = new k.CachedXHR;
	function hideContent() {
		$("#main-content").hide();
		$("#main-content").siblings("aside").hide();
		$("#main-breadcrumbs").hide()
	}
	function showContent() {
		$("#main-content").show();
		$("#main-content").siblings("aside").show();
		$("#main-breadcrumbs").show();
		$("#instant-search-content").remove()
	}
	function render(data) {
		var context = $.extend({}, data);
		var base_url = search.lastQueryUrl();
		var $searchContent;
		context.base_url = base_url;
		if ($("#instant-search-content").length) {
			$searchContent = $("#instant-search-content")
		} else {
			$searchContent = $("<div />").attr("id", "instant-search-content");
			$("#main-content").after($searchContent)
		}
		$searchContent.html(k.nunjucksEnv.render("search-results.html", context))
	}
	window.k.InstantSearchSettings = {
		hideContent : hideContent,
		showContent : showContent,
		render : render,
		searchClient : search
	};
	$(document).on("submit", '[data-instant-search="form"]', function (ev) {
		ev.preventDefault()
	});
	$(document).on("keyup", '[data-instant-search="form"] input[type="search"]', function (ev) {
		var $this = $(this);
		var params = {
			format : "json"
		};
		if ($this.val().length === 0) {
			if (searchTimeout) {
				window.clearTimeout(searchTimeout)
			}
			window.k.InstantSearchSettings.showContent()
		} else if ($this.val() !== search.lastQuery) {
			if (searchTimeout) {
				window.clearTimeout(searchTimeout)
			}
			$this.closest("form").find("input").each(function () {
				if ($(this).attr("type") === "submit") {
					return true
				}
				if ($(this).attr("type") === "button") {
					return true
				}
				if ($(this).attr("name") === "q") {
					return true
				}
				params[$(this).attr("name")] = $(this).val()
			});
			searchTimeout = setTimeout(function () {
					if (search.hasLastQuery) {
						trackEvent("Instant Search", "Exit Search", search.lastQueryUrl())
					}
					search.setParams(params);
					search.query($this.val(), k.InstantSearchSettings.render);
					trackEvent("Instant Search", "Search", search.lastQueryUrl());
					trackPageview(search.lastQueryUrl())
				}, 200);
			k.InstantSearchSettings.hideContent()
		}
	});
	$(document).on("click", '[data-instant-search="link"]', function (ev) {
		ev.preventDefault();
		var $this = $(this);
		if (search.hasLastQuery) {
			trackEvent("Instant Search", "Exit Search", search.queryUrl(search.lastQuery))
		}
		var setParams = $this.data("instant-search-set-params");
		if (setParams) {
			setParams = setParams.split("&");
			$(setParams).each(function () {
				var p = this.split("=");
				search.setParam(p.shift(), p.join("="))
			})
		}
		var unsetParams = $this.data("instant-search-unset-params");
		if (unsetParams) {
			unsetParams = unsetParams.split("&");
			$(unsetParams).each(function () {
				search.unsetParam(this)
			})
		}
		trackEvent("Instant Search", "Search", $this.data("href"));
		trackPageview($this.data("href"));
		cxhr.request($this.data("href"), {
			data : {
				format : "json"
			},
			dataType : "json",
			success : k.InstantSearchSettings.render
		})
	})
})(jQuery);
