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
	    /**       
         * @desc 깊은 복사(Deep-Copy)로 동일 값을 갖는 객체를 생성하여 반환합니다.
         * @memberOf Xr.MBR 
         * @instance
         * @return {Xr.MBR} 깊은 복사(Deep-Copy)로 동일한 값을 반환 
         */
	    clone: function() {
	        return new Xr.MBR(this.minX, this.minY, this.maxX, this.maxY);
	    },

	    /**       
         * @desc 다른 MBR 객체와 동일한 값을 갖는지 검사합니다. MBR의 minX, minY, maxX, maxY 값이 모두 같을 경우 동일하다고 판단합니다.
         * @memberOf Xr.MBR 
         * @param {Xr.MBR} other - 비교할 다른 MBR 객체
         * @instance
         * @return {boolean} 동일한 값일 때 true를 반환하고 다르다면 false를 반환합니다. 
         */
	    same: function(/* MBR */ other) {
	        return (this.minX == other.minX) && (this.minY == other.minY) && (this.maxX == other.maxX) && (this.maxY == other.maxY);
	    },

	    /**       
         * @desc MBR을 구성하는 minX, minY, maxX, maxY의 값을 초기화합니다. 
         * 초기화 값은 minX와 minY에는 최대값으로 초기화하고 maxX, maxY는 최소값으로 초기화합니다. 
         * @memberOf Xr.MBR 
         * @instance
         */
	    reset: function () {
			this.set(Number.MAX_VALUE, Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);
		},
	    /**       
         * @desc 의미있는 문자열을 반환합니다.
         * @memberOf Xr.MBR 
         * @instance
         * @return {String} 의미있는 문자열값으로 형식은 (MinX, MinY, MaxX, MaxY)입니다. 
         */
		toString: function() {
			return "(" + this.minX + ", " + this.minY + ", " + this.maxX + ", " + this.maxY + ")";
		},

	    /**       
         * @desc MBR에 대한 가로 길이를 얻습니다.
         * @memberOf Xr.MBR 
         * @instance
         * @return {number} MBR의 가로 길이
         */
		width: function() {
			return this.maxX - this.minX;
		},

	    /**       
         * @desc MBR에 대한 세로 길이를 얻습니다.
         * @memberOf Xr.MBR 
         * @instance
         * @return {number} MBR의 세로 길이 
         */
		height: function() {
			return this.maxY - this.minY;
		},

	    /**       
         * @desc MBR을 구성하는 minX, minY, maxX, maxY 값을 지정합니다.
         * @memberOf Xr.MBR 
         * @param {number} minX - 지정할 MBR의 최소 X 값 
         * @param {number} minY - 지정할 MBR의 최소 Y 값 
         * @param {number} maxX - 지정할 MBR의 최대 X 값 
         * @param {number} maxX - 지정할 MBR의 최대 Y 값 
         * @instance
         */
		set: function(minX, minY, maxX, maxY) {
			this.minX = minX;
			this.minY = minY;
			this.maxX = maxX;
			this.maxY = maxY;
		},

	    /**       
         * @desc 어떤 포인트가 MBR의 내부에 포함되는지 검사합니다. 
         * 검사할때 허용치값을 사용할 수 있으며, 포함 여부 검사시에 이 허용치 값을 MBR의 가로와 세로 크기에 합하여 검사합니다.
         * @memberOf Xr.MBR 
         * @param {Xr.PointD} coord - 포함되는지 검사하기 위한 포인트
         * @param {number} tol - 허용치 값이며 선택 사항(Optional)입니다.
         * @instance
         * @return {boolean} 포함되면 true를 반환하고 포함되지 않으면 false를 반환합니다. 
         */
		/* boolean */ contain: function(/* PointD */ coord, /* option Number */ tol) {
			if(arguments.length == 1) {
				return coord.x >= this.minX && coord.x <= this.maxX && coord.y >= this.minY && coord.y <= this.maxY;
			} else {
				return coord.x > (this.minX - tol) && coord.x < (this.maxX + tol) && coord.y > (this.minY - tol) && coord.y < (this.maxY + tol);
			}
		},
	    /**       
         * @desc MBR의 크기를 가로와 세로 크기에 대해 지정된 값만큼 확장하여 확장된 MBR을 반환합니다. 원래의 MBR은 크기가 변하지 않습니다.
         * @memberOf Xr.MBR 
         * @param {number} value - 확장시킬 값
         * @instance
         * @return {Xr.MBR} 확장된 MBR 객체 
         */
		/* MBR */ expand: function(/*double*/ value) {
			var newMBR = new Xr.MBR(this.minX-value, this.minY-value, this.maxX+value, this.maxY+value);
			return newMBR;	
		},

	    /**       
         * @desc MBR을 지정된 위치로 이동합니다.
         * @memberOf Xr.MBR 
         * @param {number} x - 이동시킬 X축에 대한 값 
         * @param {number} y - 이동시킬 Y축에 대한 값 
         * @instance
         */
		move: function(/*Number*/ x, /*Number*/ y) {
			var deltaX = this.getCenterY() - x;
			var deltaY = this.getCenterY() - y;
	
			this.moveByOffset(deltaX, deltaY);
			//this.minX -= deltaX;
			//this.minY -= deltaY;
			//this.maxX -= deltaX;
			//this.maxY -= deltaY;	
		},

	    /**       
         * @desc MBR을 상대적으로 이동시킵니다.
         * @memberOf Xr.MBR 
         * @param {number} deltaX - 상대적으로 이동할 X축의 값 
         * @param {number} deltaY - 상대적으로 이동할 Y축의 값
         * @instance
         */
		moveByOffset: function(/* Number */ deltaX, /* Number */ deltaY) {
		    this.minX += deltaX;
		    this.minY += deltaY;
		    this.maxX += deltaX;
		    this.maxY += deltaY;
		},

	    /**       
         * @desc 다른 MBR 또는 포인트가 포함될 수 있는 가장 작은 MBR로 재구성합니다.
         * @memberOf Xr.MBR 
         * @param {Xr.MBR} arg - 포함되어야 할 MBR (Selective-Paramter)
         * @param {Xr.PointD} arg - 포함되어야 할 포인트 (Selective-Paramter)
         * @instance
         */
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

	    /**       
         * @desc MBR의 중심점에 대한 X 좌표을 구합니다.
         * @memberOf Xr.MBR 
         * @instance
         * @return {number} MBR의 중심점에 대한 X 좌표 
         */
		centerX: function() {
			return (this.maxX + this.minX) / 2.0;
		},

	    /**       
         * @desc MBR의 중심점에 대한 Y 좌표을 구합니다.
         * @memberOf Xr.MBR 
         * @instance
         * @return {number} MBR의 중심점에 대한 X 좌표 
         */
		centerY: function() {
			return (this.maxY + this.minY) / 2.0;
		},
		
	    /**       
         * @desc MBR의 중심점에 대한 좌표를 구합니다.
         * @memberOf Xr.MBR 
         * @instance
         * @return {Xr.PointD} 중심점에 대한 좌표 
         */
		center: function() {
			var x = this.centerX();
			var y = this.centerY();
			
			return new Xr.PointD(x, y);
		},

	    /**       
         * @desc MBR에 저장된 minX, minY, maxX, maxY 값들이 서로 옳바른지 검사합니다. 만약 minX가 maxX보다 크다면 옳바르지 않은 것입니다.
         * @memberOf Xr.MBR 
         * @instance
         * @return {boolean} 옳바르지 않다면 false를 반환하고 옳바르다면 true를 반환합니다. 
         */
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