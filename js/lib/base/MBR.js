/**  
 * @classdesc MBR(Minimum Bounding Rectangle)에 대한 클래스 
 * @class
 * @param {double} MinX - MBR을 구성하는 최소 X 좌표값
 * @param {double} MinY - MBR을 구성하는 최소 Y 좌표값
 * @param {double} MaxX - MBR을 구성하는 최대 X 좌표값
 * @param {double} MaxY - MBR을 구성하는 최대 Y 좌표값
 * @copyright [(주)지오서비스]{@link http://www.geoservice.co.kr}
 * @license LGPL
 */
Xr.MBR = Xr.Class({
	name: 'MBR',
	
	construct: function (minX, minY, maxX, maxY) {
	    if (arguments.length == 4) {
	        this.minX = minX;
	        this.minY = minY;
	        this.maxX = maxX;
	        this.maxY = maxY;
	    } else {
	        this.reset();
	    }
	},
	
	methods: {
	    clone: function() {
	        return new Xr.MBR(this.minX, this.minY, this.maxX, this.maxY);
	    },

	    same: function(/* MBR */ other) {
	        return (this.minX == other.minX) && (this.minY == other.minY) && (this.maxX == other.maxX) && (this.maxY == other.maxY);
	    },

	    reset: function () {
			this.set(Number.MAX_VALUE, Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);
		},

		toString: function() {
			return "(" + this.minX + ", " + this.minY + ", " + this.maxX + ", " + this.maxY + ")";
		},

		width: function() {
			return this.maxX - this.minX;
		},

		height: function() {
			return this.maxY - this.minY;
		},

		set: function(minX, minY, maxX, maxY) {
			this.minX = minX;
			this.minY = minY;
			this.maxX = maxX;
			this.maxY = maxY;
		},

		/* boolean */ contain: function(/* PointD */ coord, /* option Number */ tol) {
			if(arguments.length == 1) {
				return coord.x >= this.minX && coord.x <= this.maxX && coord.y >= this.minY && coord.y <= this.maxY;
			} else {
				return coord.x > (this.minX - tol) && coord.x < (this.maxX + tol) && coord.y > (this.minY - tol) && coord.y < (this.maxY + tol);
			}
		},

		/* MBR */ expand: function(/*double*/ value) {
			var newMBR = new Xr.MBR(this.minX-value, this.minY-value, this.maxX+value, this.maxY+value);
			return newMBR;	
		},

		move: function(/*Number*/ x, /*Number*/ y) {
			var deltaX = this.getCenterY() - x;
			var deltaY = this.getCenterY() - y;
	
			this.moveByOffset(deltaX, deltaY);
			//this.minX -= deltaX;
			//this.minY -= deltaY;
			//this.maxX -= deltaX;
			//this.maxY -= deltaY;	
		},

		moveByOffset: function(/* Number */ deltaX, /* Number */ deltaY) {
		    this.minX += deltaX;
		    this.minY += deltaY;
		    this.maxX += deltaX;
		    this.maxY += deltaY;
		},

		append: function(/*MBR or PointD*/ arg) {
			if(arg instanceof Xr.MBR) {
				if(mbr.minX < this.minX) {
					this.minX = mbr.minX;
				}
	
				if(mbr.minY < this.minY) {
					this.minY = mbr.minY;
				}
	
				if(mbr.maxX > this.maxX) {
					this.maxX = mbr.maxX;
				}
	
				if(mbr.maxY > this.maxY) {
					this.maxY = mbr.maxY;
				}
			} else if(arg instanceof Xr.PointD) {
				if(arg.x < this.minX) this.minX = arg.x;
				if(arg.y < this.minY) this.minY = arg.y;
				if(arg.x > this.maxX) this.maxX = arg.x;
				if(arg.y > this.maxY) this.maxY = arg.y;	
			}
		},

		centerX: function() {
			return (this.maxX + this.minX) / 2.0;
		},

		centerY: function() {
			return (this.maxY + this.minY) / 2.0;
		},
		
		center: function() {
			var x = this.centerX();
			var y = this.centerY();
			
			return new Xr.PointD(x, y);
		},

		valid: function() {
		    if (this.minX > this.maxX) {
				var tmp = this.minX;
				this.minX = this.maxX;
				this.maxX = tmp;
			}
	
			if(this.minY > this.maxY) {
				var tmp = this.minY;
				this.minY = this.maxY;
				this.maxY = tmp;
			}
		}
	}
});