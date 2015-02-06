/** 
 * @classdesc 지도 좌표와 화면 좌표에 대한 상호 변환을 위한 클래스로써 
 * 행렬(Matrix)를 이용하여 지도 좌표에 대한 확대, 이동, 회전 등과 같은 연산을 처리합니다.
 * @class
 * @param {int} viewWidth - 지도가 표출될 DIV의 가로 길이로써 픽셀 단위입니다.
 * @param {int} viewHeight - 지도가 표출될 DIV의 세로 길이로써 픽셀 단위입니다.
 * @copyright [(주)지오서비스]{@link http://www.geoservice.co.kr}
 * @license LGPL
 */
Xr.CoordMapper = Xr.Class({
	name: "CoordMapper",

	construct: 
		CoordMapper = function(viewWidth, viewHeight) {
		    this._viewCenter = new Xr.PointD(0.0, 0.0);
			this._totalOffsetX = 0.0;
			this._totalOffsetY = 0.0;
			this._scale = 1.0;
			this._totalRot = 0.0;
			this._viewWidth = 0.0;
			this._viewHeight = 0.0;
			this._transformMatrix = Matrix.identity(3, 3);
			this._DPI = 0.0;
			this._pickingTolerance = 0.0;
			this.resize(viewWidth, viewHeight);
		},

	methods: {
	    /**       
         * @desc 지도가 표출될 DIV의 크기가 변경되었을 때 호출하는 매서드입니다. 
         * 일반적으로 해당 DIV의 크기가 변경됬었을때 발생하는 이벤트를 통해 자동으로 이 매서드가 호출됩니다.
         * @memberOf Xr.CoordMapper
         * @param {int} viewWidth - 변경된 가로 길이로써 픽셀 단위입니다. 
         * @param {int} viewHeight - 변경된 세로 길이로써 픽셀 단위입니다. 
         * @instance
         */
		resize: function(viewWidth, viewHeight) {   
		    var centerMap = this.V2W(this._viewWidth / 2, this._viewHeight / 2);

		    this._viewWidth = viewWidth;
			this._viewHeight = viewHeight;
			this._viewCenter.set(viewWidth / 2, viewHeight / 2);
			this.transform(0, 0, 0);
			this.moveTo(centerMap.x, centerMap.y);
		},

	    /**       
         * @desc 화면 해상도에 대한 DPI 값을 설정하거나 얻는 함수입니다.
         * @memberOf Xr.CoordMapper 
         * @param {number} DPI - 이 파라메터가 지정되면 지정된 값으로 화면 DPI가 설정됩니다.
         * @instance
         * @return {number} DPI 파라메터가 지정되지 않았을 경우에 이전에 지정된 DPI 값이 반환됩니다. 
         */
		DPI: function(DPI) {
		    if (arguments.lenght == 0) {
		        return this._DPI;
		    } else {
		        this._DPI = DPI; 
		    }
		},

	    /**       
         * @desc 지도가 표출될 DIV에 대한 가로 길이를 픽셀 단위로 얻습니다. 
         * @memberOf Xr.CoordMapper 
         * @instance
         * @return {int} 지도가 표출될 DIV의 가로 길이로써 단위는 픽셀 단위입니다. 
         */
		viewWidth: function() {
			return this._viewWidth;
		},

	    /**       
         * @desc 지도가 표출될 DIV에 대한 세로 길이를 픽셀 단위로 얻습니다. 
         * @memberOf Xr.CoordMapper 
         * @instance
         * @return {int} 지도가 표출될 DIV의 세로 길이로써 단위는 픽셀 단위입니다. 
         */
		viewHeight: function () {
		    return this._viewHeight;
		},

	    /**       
         * @desc 지도가 회전된 각도를 얻습니다. 단위는 도(Degree) 입니다.
         * @memberOf Xr.CoordMapper 
         * @instance
         * @return {number} 지도가 회전된 도(Degree) 단위의 각도 값
         */
		rotationAngle: function() {
			return this._totalRot;
		},
		
	    /**       
         * @desc 화면상에 표시된 그래픽 요소를 마우스 클릭을 통해 선택할 때의 허용 임계값을 계산합니다. 
         * 내부적으로 반경 7 픽셀에 대한 지도 길이를 허용치로 계산합니다.
         * @memberOf Xr.CoordMapper 
         * @instance
         */
		regenPickingTolerance: function() {
			var w1 = this.V2W(0, 0);
			var w2 = this.V2W(7, 0);
		
			this._pickingTolerance = Math.sqrt(Math.pow(w1.x-w2.x, 2.0) + Math.pow(w1.y-w2.y, 2.0));
			if(this._pickingTolerance == 0.0) this._pickingTolerance = 0.000009;
		},
	
	    /**       
         * @desc 화면상에 표시된 그래픽 요소를 마우스 클릭을 통해 선택할 때의 허용 임계값을 얻습니다. 
         * 이 값은 지도 화면이 변경될 때 [regenPickingTolerance]{@link Xr.CoordMapper#regenPickingTolerance} 함수를 자동으로 호출하여 계산됩니다.
         * @memberOf Xr.CoordMapper 
         * @instance
         * @return {number} 화면상에 표시된 그래픽 요소의 마우스 선택시 허용되는 임계치로써 지도 단위 길이입니다.
         */
		pickingTolerance: function () {
			return this._pickingTolerance;
		},

	    /**       
         * @desc 편집에서 스냅핑 기능에 대한 허용 임계값을 얻습니다. 
         * 이 값은 지도 화면이 변경될 때 [regenPickingTolerance]{@link Xr.CoordMapper#regenPickingTolerance} 함수를 자동으로 호출하여 계산되는 값을 그대로 사용합니다.
         * @memberOf Xr.CoordMapper 
         * @instance
         * @return {number} 편집에서 스냅핑 기능에 대한 허용 임계치로써 지도 단위 길이입니다.
         */
		snappingTolerance: function() {
		    return this._pickingTolerance;// / 2.0;
		},
		
	    /**       
         * @desc 지도 좌표에 대한 길이값에 해당되는 화면 좌표에 대한 길이 값으로 변환합니다.
         * @memberOf Xr.CoordMapper 
         * @param {number} mapLength - 변환하고자 하는 지도 좌표에 대한 길이값
         * @instance
         * @return {number} 변환된 화면 좌표에 대한 길이 
         */
		viewLength: function(mapLength) 
		{
			var p1 = new Xr.PointD(mapLength, 0);
			var p2 = new Xr.PointD(0, 0);
			
			var pt1 = this.W2V(p1);
			var pt2 = this.W2V(p2);	
		
			var length = Math.sqrt(Math.pow(pt1.x-pt2.x, 2.0) + Math.pow(pt1.y-pt2.y, 2.0));
		
			return length;
		},
	
	    /**       
         * @desc 화면 좌표에 대한 길이값에 해당되는 지도 좌표에 대한 길이 값으로 변환합니다.
         * @memberOf Xr.CoordMapper 
         * @param {number} viewLength - 변환하고자 하는 화면 좌표에 대한 길이값
         * @instance
         * @return {number} 변환된 지도 좌표에 대한 길이 
         */
		mapLength: function(viewLength) 
		{
			var pt1 = this.V2W(viewLength, 0);
			var pt2 = this.V2W(0, 0);
			
			var length = Math.sqrt(Math.pow(pt1.x-pt2.x, 2.0) + Math.pow(pt1.y-pt2.y, 2.0));
			
			return length;
		},
	
		translateMatrix: function(x, y)
		{
			var translateMatrix = Matrix.create(
				[
					[1, 0, x],
					[0, 1, y],
					[0, 0, 1]
				]
			);		

		    return translateMatrix;
		},

	    /**       
         * @desc 화면 좌표를 지도 좌표로 변환합니다.
         * @memberOf Xr.CoordMapper 
         * @param {int} X - 화면 좌표에 대한 X 좌표
         * @param {int} Y - 화면 좌표에 대한 Y 좌표
         * @instance
         * @return {Xr.PointD} 변환된 지도 좌표값  
         */
		V2W: function(x, y) {
			var inverseTransformMatrix = Matrix.inverse(this._transformMatrix);
			var pt = Matrix.create(
				[
					[x],
					[this._viewHeight - y],
					[1]
				]);		

			var result = Matrix.mult(inverseTransformMatrix, pt);
		
			return new Xr.PointD(result.mat[0][0], result.mat[1][0]);
		},

	    /** 
         * @desc 지도 좌표를 화면 좌표로 변환합니다.       
         * @memberOf Xr.CoordMapper 
         * @param {Xr.PointD} pt - 변환하고자 하는 지도 좌표값
         * @instance
         * @return {Xr.PointD} 변환된 화면 좌표값
         */
		W2V: function(pt) {
			var vtx = Matrix.create(
				[
					[pt.x],
					[pt.y],
					[1]
				]);

			var result = Matrix.mult(this._transformMatrix, vtx);
	
			return new Xr.PointD(result.mat[0][0], this._viewHeight - result.mat[1][0]);
		},

	    /**       
         * @desc 두개의 MBR이 교차하는지 검사합니다.
         * @memberOf Xr.CoordMapper 
         * @param {Xr.MBR} mbrA - 교차 검사를 위한 첫번째 MBR 객체 
         * @param {Xr.MBR} mbrB - 교차 검사를 위한 두번째 MBR 객체
         * @instance
         * @return {boolean} 두 MBR이 교차되었다면 true를 반환하고 교차되지 않았다면 false를 반환합니다.
         */
		intersectMBR: function(mbrA, mbrB) {
			return mbrA.minX<=mbrB.maxX &&
					(mbrA.maxX>=mbrB.minX) &&
						(mbrA.minY<=mbrB.maxY) &&
							(mbrA.maxY>=mbrB.minY);
		},

	    /**       
         * @desc 지정된 MBR과 현재 지도 화면에 대한 MBR이 교차하는지 검사합니다.
         * @memberOf Xr.CoordMapper 
         * @param {Xr.MBR} mbr - 지도 화면에 대한 MBR과의 교차 여부를 검사하기 위한 mbr 입니다.
         * @instance
         * @return {boolean} 지정된 MBR과 지도 화면에 대한 MBR이 교차한다면 true를 반환하고 교차하지 않는다면 false를 반환합니다.
         */
		intersectViewportMBR: function(mbr) {
			return mbr.minX<=_viewWidth && (mbr.maxX>=0.0) && (mbr.minY<=this._viewHeight) && (mbr.maxY>=0); 
		},

	    /**       
         * @desc 현재 지도 화면에 대한 MBR을 반환합니다.
         * @memberOf Xr.CoordMapper 
         * @instance
         * @return {Xr.MBR} 현재 지도 화면에 대한 MBR
         */
		viewportMBR: function() {
			var p1 = this.V2W(0, 0);
			var p2 = this.V2W(this._viewWidth, this._viewHeight);
			var p3 = this.V2W(this._viewWidth, 0);
			var p4 = this.V2W(0, this._viewHeight);

			var minX = Math.min(Math.min(p3.x, p4.x), Math.min(p1.x, p2.x));
			var minY = Math.min(Math.min(p3.y, p4.y), Math.min(p1.y, p2.y));
			var maxX = Math.max(Math.max(p3.x, p4.x), Math.max(p1.x, p2.x));
			var maxY = Math.max(Math.max(p3.y, p4.y), Math.max(p1.y, p2.y));		
			
			var mbr = new Xr.MBR(minX, minY, maxX, maxY);
		
			return mbr;
		},
	
		transform: function(dx, dy, dRot) {
			var vtx = Matrix.create([[0],[0],[1]]);		

			var prevVtx = Matrix.mult(
				Matrix.mult(
					this.translateMatrix(this._totalOffsetX, this._totalOffsetY), 
					this.rotateMatrix(this._totalRot, this._viewCenter)
				),
				vtx
			);

			var transformedCentroid = Matrix.mult(
				Matrix.mult(
					this.rotateMatrix(dRot, this._viewCenter), 
					this.translateMatrix(dx/this._scale, dy/this._scale)
				), 
				prevVtx
			);

			this._totalRot += dRot;
			if(this._totalRot > 360.0) this._totalRot -= 360.0;
		
			var rotateMatrix = this.rotateMatrix(this._totalRot, this._viewCenter);

			var resultVtx = Matrix.mult(rotateMatrix, vtx);
	    			
			this._totalOffsetX = transformedCentroid.mat[0][0] - resultVtx.mat[0][0];
			this._totalOffsetY = transformedCentroid.mat[1][0] - resultVtx.mat[1][0];
		
			this._transformMatrix = Matrix.mult(
				Matrix.mult(
					this.scaleMatrix(this._scale, this._viewCenter), 
					this.translateMatrix(this._totalOffsetX, this._totalOffsetY)
				),
				this.rotateMatrix(this._totalRot, this._viewCenter)
			);	
	
			this.regenPickingTolerance();
		},

	    /**       
         * @desc 지도를 이동하고자 하는 위치로써 지도 좌표계 입니다.
         * @memberOf Xr.CoordMapper 
         * @param {number} x - 이동하고자 하는 지도 좌표계의 X 값
         * @param {number} y - 이동하고자 하는 지도 좌표계의 Y 값
         * @instance
         */
		moveTo: function(x, y) {
			var p = this.W2V(new Xr.PointD(x, y));
			this.translate(this._viewCenter.x-p.x, this._viewCenter.y-p.y);
		},
	
		translate: function(dx, dy) {	
			this.transform(dx, -dy, 0);
		},

		reset: function() {
			this._totalOffsetX = 0;
			this._totalOffsetY = 0;
			this._totalRot = 0;
			this._scale = 1;
			this.transform(0, 0, 0);
		},
	
	    /**       
         * @desc 지도를 현재 각도에서 주어진 각도만큼 더해 회전합니다.
         * @memberOf Xr.CoordMapper 
         * @param {number} dRot - 더 해질 각도 값으로 단위는 도(Degree)입니다. 
         * @instance
         */
		rotate: function(dRot) {
			this.transform(0, 0, dRot);
		},

	    /**       
         * @desc 지도를 주어진 각도 값으로 회전합니다.
         * @memberOf Xr.CoordMapper 
         * @param {number} rot - 회전할 각도값이며 단위는 도(Degree)입니다.
         * @instance
         */
		rotateAbsolute: function(rot) {
			this.transform(0, 0, -this._totalRot+rot);
		},

	    /**       
         * @desc 지도를 현재 크기에서 120% 만큼 확대 합니다.
         * @memberOf Xr.CoordMapper 
         * @instance
         */
		zoomIn: function() {
			this._scale *= 1.2;
			this.transform(0,0,0);
		},

	    /**       
         * @desc 지도를 현재 크기에서 80% 만큼 축소 합니다.
         * @memberOf Xr.CoordMapper 
         * @instance
         */
		zoomOut: function() {
			this._scale *= 0.8;
			this.transform(0,0,0);
		},	

	    /**       
         * @desc 지도를 주어진 MBR로 이동하고 크기를 조정합니다.
         * @memberOf Xr.CoordMapper 
         * @param {Xr.MBR} mbr - 지도를 이동할 MBR
         * @instance
         */
		zoomByMBR: function(mbr) {
			var lengthOfWindow, lengthOfView;

			if(this._viewWidth < this._viewHeight) {
				lengthOfWindow = mbr.maxX - mbr.minX;
				lengthOfView = this._viewWidth;
			} else {
				lengthOfWindow = mbr.maxY - mbr.minY;
				lengthOfView = this._viewHeight;
			}

			this.scale(lengthOfView / lengthOfWindow);
			this.moveTo((mbr.maxX+mbr.minX)/2.0, (mbr.maxY+mbr.minY)/2.0);
		},

		rotateMatrix: function(angle, rotatePivot) {
   		 	var translateOriginMatrix = Matrix.create([
   	 			[ 1, 0, (rotatePivot.x) ],
		    	[ 0, 1, (rotatePivot.y) ],
   	 			[ 0, 0, 1 ]
	    	]);

   		 	var rad = angle * (Math.PI/180.0);
	   	 	var rotateMatrix = Matrix.create([
   		 		[ Math.cos(rad), Math.sin(rad), 0 ],
	    		[ -Math.sin(rad), Math.cos(rad), 0 ],
    			[ 0, 0, 1 ]
	    	]);

	   	 	var invertTranslateOriginMatrix = Matrix.create([
	   	 		[ 1, 0, -(rotatePivot.x) ], 
    			[ 0, 1, -(rotatePivot.y) ], 
	    		[ 0, 0, 1 ]     
    		]);
        
			return Matrix.mult(
				Matrix.mult(
					translateOriginMatrix, 
					rotateMatrix
				), 
				invertTranslateOriginMatrix
			);
		},

		scaleMatrix: function(scale, scalePivot)
		{
   		 	var translateOriginMatrix = Matrix.create([
   	 			[ 1, 0, (scalePivot.x) ], 
		    	[ 0, 1, (scalePivot.y) ], 
   	 			[ 0, 0, 1 ]
   	 		]);

   		 	var scaleMatrix = Matrix.create([
    			[ scale, 0, 0 ],
		    	[ 0, scale, 0 ],
    			[ 0, 0, 1 ]
	    	]);

   		 	var invertTranslateOriginMatrix = Matrix.create([
    			[ 1, 0, -(scalePivot.x) ], 
    			[ 0, 1, -(scalePivot.y) ], 
	    		[ 0, 0, 1 ] 
	    	]);
        
			return Matrix.mult(
				Matrix.mult(
					translateOriginMatrix,
					scaleMatrix
				), 
				invertTranslateOriginMatrix
			);
		}, 
	
		scale: function (scale) {
		    if (arguments.length == 0) {
		        return this._scale;
		    } else {
		        this._scale = scale;
		        this.transform(0, 0, 0);
		    }
		},

	    /**       
         * @desc 1 픽셀에 대한 미터 단위 값으로 지도를 줌(Zoom) 합니다.
         * @memberOf Xr.CoordMapper 
         * @param {number} metersPerPixel - 지도를 줌(Zoom)할 1픽셀에 대한 미터 단위 값
         * @instance
         */
		zoomByMeterPerOnePixel: function(metersPerPixel) {
			var currentValue = this.metersPerOnePixel();
			var	ratio = currentValue/metersPerPixel;
	
			var currentScale = this.scale();
			var newScale = currentScale * ratio;

			this.scale(newScale);		
		},

	    /**       
         * @desc 1미터를 차지하는 픽셀 개수를 얻습니다.
         * @memberOf Xr.CoordMapper 
         * @instance
         * @return {number} 1미터를 차지하는 픽셀 개수 
         */
		pixelsPerOneMeter: function() {
			var v1 = new Xr.PointD(0, 0);
			var v2 = new Xr.PointD(1, 0);
			var w1 = this.W2V(v1);
			var	w2 = this.W2V(v2);
		
			var pixels = Math.sqrt(Math.pow(w1.x-w2.x, 2.0) + Math.pow(w1.y-w2.y, 2.0));
			return pixels;	
		},

	    /**       
         * @desc 1 픽셀에 대한 미터 길이를 얻습니다.
         * @memberOf Xr.CoordMapper 
         * @instance
         * @return {number} 1픽셀에 대한 미터 길이 
         */
		metersPerOnePixel: function() {
			var w1 = this.V2W(0, 0);
			var w2 = this.V2W(1, 0);
		
			var length = Math.sqrt(Math.pow(w1.x-w2.x, 2.0) + Math.pow(w1.y-w2.y, 2.0));
			return length;
		},
	
	    /**       
         * @desc 주어진 값으로 지도를 줌(Zoom) 합니다. 주어진 값은 지도축척값을 1/N 형태의 분수로 나타내었을 때 N값 입니다. 
         * @memberOf Xr.CoordMapper 
         * @param {number} mapScale - 지도축척값을 1/N 형태의 분수로 나타내었을 때의 N값
         * @instance
         */
		zoomByMapScale: function(mapScale) {
			var currentMapScale = this.mapScale();
			var mapScaleRatio = currentMapScale/mapScale;
	
			var currentScale = this.scale();
			var	newScale = currentScale * mapScaleRatio;

			this.scale(newScale);
		},

	    /**       
         * @desc 1픽셀에 대한 미터값을 지도 축척의 분모 값으로 변환하여 반환합니다. 지도 축척값을 1/N 형태의 분모로 나타내었을 때 N이 지도 축척의 분모값입니다.
         * @memberOf Xr.CoordMapper 
         * @param {number} metersPerPixel - 1픽셀에 대한 미터값
         * @instance
         * @return {number} 1픽셀에 대한 미터값을 지도 축척의 분모 값으로써, 지도 축척값을 1/N 형태의 분모로 나타내었을 때 N에 해당함.
         */
		mapScaleFromMetersPerOnePixel: function(metersPerPixel) {
			var currentValue = this.metersPerOnePixel();
			var ratio = metersPerPixel / currentValue;
	
			var currentMapScale = this.mapScale();
			var newMapScale = currentMapScale * ratio;

			return newMapScale;		
		},
	
	    /**       
         * @desc 지도 축척의 분모 값으로 지도를 줌(Zoom) 하거나 현재의 지도 축척의 분모값을 얻습니다. 지도 축척값을 1/N 형태의 분모로 나타내었을 때 N이 지도 축척의 분모값입니다.
         * @memberOf Xr.CoordMapper 
         * @param {number} v - 이 값이 지정되면 지정된 값으로 지도를 줌(Zoom) 합니다. 이 값은 지도 축척의 분모값입니다. 지도 축척값을 1/N 형태의 분모로 나타내었을 때 N이 지도 축척의 분모값입니다.
         * @instance
         * @return {number} 매개 변수 v를 지정하지 않을 경우 현재의 지도 축척의 분모값이 반환됩니다. 지도 축척값을 1/N 형태의 분모로 나타내었을 때 N이 지도 축척의 분모값입니다.
         */
		mapScale: function (v) {
		    if (arguments.length == 0) {
		        var cntPixelsPer1Cm = (1.0 / 2.54) * this._DPI;
		        var w1 = this.V2W(0, 0);
		        var w2 = this.V2W(cntPixelsPer1Cm, 0);

		        var dist = Math.sqrt(Math.pow(w1.x - w2.x, 2.0) + Math.pow(w1.y - w2.y, 2.0));
		        var scale = dist / 0.01;

		        return scale;
		    } else {
		        var currentMapScale = this.mapScale();
		        var mapScaleRatio = currentMapScale / v;

		        var currentScale = this.scale();
		        var newScale = currentScale * mapScaleRatio;

		        this.scale(newScale);
		    }
		}
	}
});