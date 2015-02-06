/**  
 * @classdesc X, Y 좌표를 나타내고 좌표에 대한 연산 기능을 가지고 있는 클래스입니다.
 * @class
 * @param {number} x - X 좌표값
 * @param {number} y - Y 좌표값
 * @copyright [(주)지오서비스]{@link http://www.geoservice.co.kr}
 * @license LGPL
 */
Xr.PointD = Xr.Class({
	name: "PointD",

	construct: function(x, y) {
		this.x = x;
		this.y = y;
	},

	methods: {
	    /**       
         * @desc 동일한 좌표값을 복사하여 반환합니다. 깊은 복사(Deep-Copy)를 사용합니다.
         * @memberOf Xr.PointD
         * @instance
         * @return {Xr.PointD} 복사되어 반환된 좌표의 인스턴스 
         */
	    clone: function () {
	        return new Xr.PointD(this.x, this.y);
	    },

	    /**       
         * @desc 좌표값을 지정합니다.
         * @memberOf Xr.PointD 
         * @param {number} X - 지정할 X 좌표값 
         * @param {number} Y - 지정할 Y 좌표값 
         * @instance
         */
		set: function(x, y) {
			this.x = x;
			this.y = y;
		},

	    /**       
         * @desc 두 개의 좌표가 동일한지 검사합니다. 좌표를 구성하는 X와 Y 값이 같다면 동일하다고 판단합니다.
         * @memberOf Xr.PointD 
         * @param {Xr.PointD} p - 비교할 좌표 
         * @instance
         * @return {boolean} 동일하다면 true를 반환하고 동일하지 않다면 false를 반환합니다. 
         */
		equal: function(p) {
			return this.x == p.x && this.y == p.y;
		},

	    /**       
         * @desc 다른 좌표계 간의 거리를 반환합니다.
         * @memberOf Xr.PointD 
         * @param {Xr.PointD} p - 거리를 계산할 또 다른 좌표 
         * @instance
         * @return {number} 다른 좌표계 간의 거리값
         */
		distanceFrom: function(p) {
			return Math.sqrt((this.x-p.x)*(this.x-p.x) + (this.y-p.y)*(this.y-p.y));
		},

	    /**       
         * @desc 좌표에 상대적인 값을 더(add)합니다.
         * @memberOf Xr.PointD 
         * @param {number} dX - 기존 X 좌표값에 더할 값 
         * @param {number} dY - 기존 Y 좌표값에 더할 값 
         * @instance
         */
		add: function(dX, dY) {
		    this.x += dX;
		    this.y += dY;
		},

	    /**       
         * @desc 객체를 의미가 있는 문자열로 변환합니다. (X, Y)와 같은 형태의 문자로 변환됩니다.
         * @memberOf Xr.PointD 
         * @instance
         * @return {string} 객체에 대한 의미있는 문자열 값 
         */
		toString: function() {
			return "(" + this.x + ", " + this.y + ")";
		},
	}
});