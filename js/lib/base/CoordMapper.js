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
		resize: function(viewWidth, viewHeight) {   
		    var centerMap = this.V2W(this._viewWidth / 2, this._viewHeight / 2);

		    this._viewWidth = viewWidth;
			this._viewHeight = viewHeight;
			this._viewCenter.set(viewWidth / 2, viewHeight / 2);
			this.transform(0, 0, 0);
			this.moveTo(centerMap.x, centerMap.y);
		},

		DPI: function(DPI) {
		    if (arguments.lenght == 0) {
		        return this._DPI;
		    } else {
		        this._DPI = DPI; 
		    }
		},

		viewWidth: function() {
			return this._viewWidth;
		},

		viewHeight: function () {
		    return this._viewHeight;
		},

		rotationAngle: function() {
			return this._totalRot;
		},
		
		regenPickingTolerance: function() {
			var w1 = this.V2W(0, 0);
			var w2 = this.V2W(7, 0);
		
			this._pickingTolerance = Math.sqrt(Math.pow(w1.x-w2.x, 2.0) + Math.pow(w1.y-w2.y, 2.0));
			if(this._pickingTolerance == 0.0) this._pickingTolerance = 0.000009;
		},
	
		pickingTolerance: function () {
			return this._pickingTolerance;
		},

		snappingTolerance: function() {
		    return this._pickingTolerance;// / 2.0;
		},
		
		viewLength: function(mapLength) 
		{
			var p1 = new Xr.PointD(mapLength, 0);
			var p2 = new Xr.PointD(0, 0);
			
			var pt1 = this.W2V(p1);
			var pt2 = this.W2V(p2);	
		
			var length = Math.sqrt(Math.pow(pt1.x-pt2.x, 2.0) + Math.pow(pt1.y-pt2.y, 2.0));
		
			return length;
		},
	
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

		intersectMBR: function(mbrA, mbrB) {
			return mbrA.minX <= mbrB.maxX &&
					(mbrA.maxX >= mbrB.minX) &&
						(mbrA.minY <= mbrB.maxY) &&
							(mbrA.maxY >= mbrB.minY);
		},

		intersectViewportMBR: function(mbr) {
			return mbr.minX<=_viewWidth && (mbr.maxX>=0.0) && (mbr.minY<=this._viewHeight) && (mbr.maxY>=0); 
		},

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
	
		rotate: function(dRot) {
			this.transform(0, 0, dRot);
		},

		rotateAbsolute: function(rot) {
			this.transform(0, 0, -this._totalRot+rot);
		},

		zoomIn: function() {
			this._scale *= 1.2;
			this.transform(0,0,0);
		},

		zoomOut: function() {
			this._scale *= 0.8;
			this.transform(0,0,0);
		},	

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

		zoomByMeterPerOnePixel: function(metersPerPixel) {
			var currentValue = this.metersPerOnePixel();
			var	ratio = currentValue/metersPerPixel;
	
			var currentScale = this.scale();
			var newScale = currentScale * ratio;

			this.scale(newScale);		
		},

		pixelsPerOneMeter: function() {
			var v1 = new Xr.PointD(0, 0);
			var v2 = new Xr.PointD(1, 0);
			var w1 = this.W2V(v1);
			var	w2 = this.W2V(v2);
		
			var pixels = Math.sqrt(Math.pow(w1.x-w2.x, 2.0) + Math.pow(w1.y-w2.y, 2.0));
			return pixels;	
		},

		metersPerOnePixel: function() {
			var w1 = this.V2W(0, 0);
			var w2 = this.V2W(1, 0);
		
			var length = Math.sqrt(Math.pow(w1.x-w2.x, 2.0) + Math.pow(w1.y-w2.y, 2.0));
			return length;
		},
	
		zoomByMapScale: function(mapScale) {
			var currentMapScale = this.mapScale();
			var mapScaleRatio = currentMapScale/mapScale;
	
			var currentScale = this.scale();
			var	newScale = currentScale * mapScaleRatio;

			this.scale(newScale);
		},

		mapScaleFromMetersPerOnePixel: function(metersPerPixel) {
			var currentValue = this.metersPerOnePixel();
			var ratio = metersPerPixel / currentValue;
	
			var currentMapScale = this.mapScale();
			var newMapScale = currentMapScale * ratio;

			return newMapScale;		
		},
	
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