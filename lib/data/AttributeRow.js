Xr.data = Xr.data || {};

/** 
 * @classdesc 공간 데이터에 대한 속성 값을 저장하고 있는 Row에 대한 클래스입니다.
 * @class
 * @param {int} fid - 고유 ID 값
 * @param {int} fieldCount - 필드의 개수
 * @copyright [(주)지오서비스]{@link http://www.geoservice.co.kr}
 * @license LGPL 
 */
Xr.data.AttributeRow = Xr.Class({
	name: "AttributeRow",

	construct: function (fid, fieldCount) {
		this._fid = fid;
		this._values = new Array(fieldCount);
	},
 	
	methods: {
        /** 
         * @desc Row에 대한 fid(Feature ID) 값을 얻습니다. 
         * @memberOf Xr.data.AttributeRow
         * @instance
         * @return {int} feature Id
         */
		/* uint */ fid: function() {
			return this._fid;
		},
		
        /** 
         * @desc 인덱스 값으로부터 문자 타입의 피드값을 얻습니다.
         * @memberOf Xr.data.AttributeRow
         * @param {int} index - 0 값으로 시작하는 인덱스 값
         * @instance
         * @return {string} Field value
         */
		/* string */ valueAsString: function(/* uint */ index) {
			return this._values[index];
		},
		
        /** 
         * @desc 인덱스 값으로부터 정수 타입의 피드값을 얻습니다.
         * @memberOf Xr.data.AttributeRow
         * @param {int} index - 0 값으로 시작하는 인덱스 값
         * @instance
         * @return {int} Field value
         */
	    /* int */ valueAsInteger: function (/* int */ index) {
			return parseInt(this._values[index]);
		},
		
        /** 
         * @desc 인덱스 값으로부터 정수 타입의 피드값을 얻습니다.
         * @memberOf Xr.data.AttributeRow
         * @param {int} index - 0 값으로 시작하는 인덱스 값
         * @instance
         * @return {int} Field value
         */
		/* number */ valueAsFloat: function(/* uint */ index) {
			return parseFloat(this._values[index]);
		},
		
	    /** 
         * @desc 인덱스 값에 해당하는 필드의 값을 설정합니다.
         * @memberOf Xr.data.AttributeRow
         * @param {int} index - 0 값으로 시작하는 인덱스 값
         * @instance
         * @return {int} Field value
         */
		setValue: function(/* uint */ index, /* string */ value) {
			this._values[index] = value;
		},

	    /** 
         * @desc 라벨 구성을 위한 SVG 요소를 생성합니다.
         * @memberOf Xr.data.AttributeRow
         * @param {CoordMapper} coordMapper - 지도/화면 좌표 변환을 위한 CoordMapper
         * @param {ShapeRow} shpRow - 해당되는 공간 데이터에 대한 Row
         * @param {String} labelText - 라벨로 표시될 문자열
         * @param {FontSymbol} sym - 라벨 표시에 사용될 폰트 심벌
         * @instance
         * @return {g} SVG의 g
         */
		/* SVG Element */ createSVG: function(/* CoordMapper */ coordMapper, /* ShapeRow */ shpRow, /* String */ labelText, /* FontSymbol */ sym, /* Label */ label) {
            var xmlns = Xr.CommonStrings.SVG_NAMESPACE;
            var shapeData = shpRow.shapeData();
            var rPt = undefined;
            var rot = 0;

            
            if (shapeData.type() == Xr.data.ShapeType.POLYLINE && label.repeatMode()) {
                return this._createSVGForPolylineShapeRow(coordMapper, shpRow, labelText, sym, label);
            }

            if (shapeData.type() == Xr.data.ShapeType.POLYLINE) {
                var rObj = shapeData.representativePointWithAngle();
                rot = rObj.angle;
                rPt = rObj.pt;
            } else {
                rPt = shapeData.representativePoint();
            }

            var vp = coordMapper.W2V(rPt);
            var g = document.createElementNS(xmlns, "g");
            var stroke = undefined;
            var offsetX = label.offsetX();
            var offsetY = label.offsetY();
            var vx = vp.x + offsetX;
            var vy = vp.y + offsetY + sym.size() / 2.0;

            if (sym.needStroke()) {
                stroke = document.createElementNS(xmlns, "text");
                stroke.setAttribute("x", vx);
                stroke.setAttribute("y", vy);
                stroke.setAttribute("text-anchor", "middle");
                if (rot != 0) {
                    stroke.setAttribute("transform", "rotate(" + rot + " " + vx + "," + vy + ")");
                }
                sym.attributeForStroke(stroke);
                stroke.textContent = labelText;
            }

            var text = document.createElementNS(xmlns, "text");

            text.setAttribute("x", vx);
            text.setAttribute("y", vy);
            text.setAttribute("text-anchor", "middle");
            if (rot != 0) {
                text.setAttribute("transform", "rotate(" + rot + " " + vx + "," + +vy + ")");
            }

            sym.attribute(text);
            text.textContent = labelText;

            if (stroke != undefined) {
                g.appendChild(stroke);
            }

            g.appendChild(text);

            return g;
        },

        /** 
         * @desc 라벨 구성을 위한 SVG 요소를 생성합니다.
         * @memberOf Xr.data.AttributeRow
         * @param {CoordMapper} coordMapper - 지도/화면 좌표 변환을 위한 CoordMapper
         * @param {PolylineShapeRow} shpRow - 해당되는 공간 데이터에 대한 Row
         * @param {String} labelText - 라벨로 표시될 문자열
         * @param {FontSymbol} sym - 라벨 표시에 사용될 폰트 심벌
         * @instance
         * @return {g} SVG의 g
         */
		/* SVG Element */ _createSVGForPolylineShapeRow: function (/* CoordMapper */ coordMapper, /* PolylineShapeRow */ shpRow, /* String */ labelText, /* FontSymbol */ sym, /* Label */ label) {
            var xmlns = Xr.CommonStrings.SVG_NAMESPACE;
            var shapeData = shpRow.shapeData();
            var polylines = shapeData.data();
            var cntPolylines = polylines.length;
            var distance = coordMapper.mapLength(label.repeatLength());
            var startDistance = coordMapper.mapLength(distance / 5);

            var g = document.createElementNS(xmlns, "g");
            var offsetX = label.offsetX();
            var offsetY = label.offsetY();

            for (var iPolyline = 0; iPolyline < cntPolylines; iPolyline++) {
                var polyline = polylines[iPolyline];
                var pts = Xr.GeometryHelper.verticesOnPolylineByDistance(polyline, startDistance, distance);

                if (pts) {
                    var cntPts = pts.length;
                    for (var iPt = 0; iPt < cntPts; iPt++) {
                        var pt = pts[iPt];
                        var vp = coordMapper.W2V(pt.pt);            
                        var rot = pt.angle;
                        var stroke = undefined;

                        var vx = vp.x + offsetX;
                        var vy = vp.y + offsetY + sym.size() / 2.0

                        if (sym.needStroke()) {
                            stroke = document.createElementNS(xmlns, "text");
                            stroke.setAttribute("x", vx);
                            stroke.setAttribute("y", vy);
                            stroke.setAttribute("text-anchor", "middle");
                            if (rot != 0) {
                                stroke.setAttribute("transform", "rotate(" + rot + " " + vx + "," + vy + ")");
                            }
                            sym.attributeForStroke(stroke);
                            stroke.textContent = labelText;
                        }

                        var text = document.createElementNS(xmlns, "text");

                        text.setAttribute("x", vx);
                        text.setAttribute("y", vy);
                        text.setAttribute("text-anchor", "middle");
                        if (rot != 0) {
                            text.setAttribute("transform", "rotate(" + rot + " " + vx + "," + +vy + ")");
                        }

                        sym.attribute(text);
                        text.textContent = labelText;

                        if (stroke != undefined) {
                            g.appendChild(stroke);
                        }

                        g.appendChild(text);
                    }
                }
            }

            return g;
        }
	}
});