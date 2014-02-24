(function(root) {

	var ARRAY_PROTO = Array.prototype;

	var _extend = function() {
		var args = ARRAY_PROTO.slice.call(arguments),
			base = args[0] || {},
			idx = 1, length = args.length,
			source, prop;
		for (; idx < length; idx++) {
			source = args[idx];
			if (source) {
				for (prop in source) {
					base[prop] = source[prop];
				}
			}
		}

		return base;
	};

	var _randomBetween = function(minValue, maxValue) {
		return minValue + Math.floor((maxValue - minValue + 1) * (Math.random() % 1));
	};

	// See: http://bost.ocks.org/mike/shuffle/
	var _fisherYatesShuffle = function(array) {
		var idx = array.length, t, i;

		// While there remain elements to shuffle…
		while (idx) {
			// Pick a remaining element…
			i = Math.floor(Math.random() * idx--);

			// And swap it with the current element.
			t = array[idx];
				array[idx] = array[i];
				array[i] = t;
		}

		return array;
	};

	var _generateBag = function(bag, opts) {
		bag = bag || [];

		var idx = opts.qty;
		while (idx--) {
			bag[idx] = _randomBetween(opts.min, opts.max);
		}

		return bag;
	};

	var ShuffleBag = root.ShuffleBag = function(options) {
		this._opts = _extend({}, ShuffleBag.defaults, this.defaults, options);
		
		this.bag = _generateBag([], this._opts);
		this.length = this.bag.length;
		this.idx = 0;
		
		this.shuffle();
	};

	ShuffleBag.defaults = {
		min: 0,
		max: 1,
		qty: 100
	};

	ShuffleBag.prototype = {
		defaults: {},

		/**
		 * Get a value at an index
		 * @param  {Number} idx [index]
		 * @return {Number}
		 */
		at: function(idx) {
			return this.bag[idx];
		},

		/**
		 * Clears out the bag
		 * @return {ShuffleBag}
		 */
		clear: function() {
			this.bag.length = 0;
			this.idx = 0;
			this.length = 0;
			return this;
		},

		/**
		 * Reset the values in the bag
		 * and reshuffle
		 * @return {ShuffleBag}
		 */
		reset: function() {
			this.clear();

			this.bag = _generateBag(this.bag, this._opts);
			this.length = this.bag.length;

			this.shuffle();
			return this;
		},

		/**
		 * Shuffles the bag
		 * @return {ShuffleBag}
		 */
		shuffle: function() {
			this.bag = _fisherYatesShuffle(this.bag);
			return this;
		},

		/**
		 * Get the next value in the bag
		 * @return {Number}
		 */
		get: function() {
			var idx = this.idx;
			return this.bag[this.idx = (idx >= this.length) ? 0 : (idx + 1)];
		},

		/**
		 * Proxy for get
		 * @return {Number}
		 */
		next: function() {
			return this.get();
		},

		/**
		 * To go with prev
		 * @return {Number}
		 */
		prev: function() {
			var idx = this.idx;
			return this.bag[this.idx = (idx <= 0) ? (this.length - 1) : (idx - 1)];	
		}
	};

	// Proxy array methods to the bag
	var proxyMethods = [
			'lastIndexOf',
			'indexOf',
			'join',
			'reverse',
			'slice',
			'sort',
			'valueOf',
			'toString',
			
			// Loops
			'forEach',
			'map',

			// Length altering methods
			'concat',
			'pop',
			'push',
			'shift',
			'splice',
			'unshift'
		],
		idx = proxyMethods.length,
		proxyMethod = function(method) {
			ShuffleBag.prototype[method] = function() {
				var val = ARRAY_PROTO[method].apply(this.bag, arguments);
				this.length = this.bag.length;
				return val;
			};
		};

	while (idx--) {
		proxyMethod(proxyMethods[idx]);
	}

	// AMD registration
	if (typeof define === 'function' && define.amd) {
		define('ShuffleBag', [], function() {
			return ShuffleBag;
		});
	}

}(this));