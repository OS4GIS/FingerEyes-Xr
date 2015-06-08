/**  
 * @classdesc X, Y 좌표를 나타내고 좌표에 대한 연산 기능을 가지고 있는 클래스입니다.
 * @class
 * @param {number} x - X 좌표값
 * @param {number} y - Y 좌표값
 * @copyright [(주)지오서비스]{@link http://www.geoservice.co.kr}
 * @license GPL
 */
Xr.PointD = Xr.Class({
	name: "PointD",

	construct: function(x, y) {
		this.x = x;
		this.y = y;
	},

	methods: {
	    clone: function () {
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
	}
});