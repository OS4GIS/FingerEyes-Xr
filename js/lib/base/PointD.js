Xr.PointD = Xr.Class({
	name: "PointD",

	construct: function(x, y) {
		this.x = x;
		this.y = y;
	},

	methods: {
	    clone: function() {
	        return new Xr.PointD(this.x, this.y);
	    },

		set: function(x, y) {
			this.x = x;
			this.y = y;
		},

		equal: function(p) {
			return this.x == p.x && this.y == p.y;
		},

		distanceFrom: function(p) {
			return Math.sqrt((this.x-p.x)*(this.x-p.x) + (this.y-p.y)*(this.y-p.y));
		},

		add: function(dX, dY) {
		    this.x += dX;
		    this.y += dY;
		},

		toString: function() {
			return "(" + this.x + ", " + this.y + ")";
		},

	    /* PointD */ clone: function () {
	        return new Xr.PointD(this.x, this.y);
	    }
	}
});