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
		/* SVG Element */ createSVG: function(/* CoordMapper */ coordMapper, /* ShapeRow */ shpRow, /* String */ labelText, /* FontSymbol */ sym) {
		    var xmlns = Xr.CommonStrings.SVG_NAMESPACE;
		    var shapeData = shpRow.shapeData();
			var rPt = shapeData.representativePoint();

			var vp = coordMapper.W2V(rPt);
			var g = document.createElementNS(xmlns, "g"); 
			var stroke = undefined;

			if (sym.needStroke()) {
			    stroke = document.createElementNS(xmlns, "text");
			    stroke.setAttribute("x", vp.x);
			    stroke.setAttribute("y", vp.y);
			    stroke.setAttribute("text-anchor", "middle");
			    sym.attributeForStroke(stroke);
			    stroke.textContent = labelText;
			}

			var text = document.createElementNS(xmlns, "text");			
			text.setAttribute("x", vp.x);
			text.setAttribute("y", vp.y);
			text.setAttribute("text-anchor", "middle");
			sym.attribute(text);
			text.textContent = labelText;

            /*
            // Setting Not Seletable Text, but not work. 
            text.setAttribute("unselectable", "on");
			text.style.setProperty("user-select", "none");
		    text.style.setProperty("-ms-user-select", "none");
		    text.style.setProperty("-moz-user-select", "-moz-none");
			text.style.setProperty("-khtml-user-select", "none");
			text.style.setProperty("-webkit-user-select", "none");
			text.style.setProperty("-webkit-touch-callout", "none");
            */

			if (stroke != undefined) {
			    var filter = document.createElementNS(xmlns, "filter");
			    filter.setAttribute("id", "_fe_labelBlur");

			    var blur = document.createElementNS(xmlns, "feGaussianBlur");
			    blur.setAttribute("stdDeviation", "1.5");

			    filter.appendChild(blur);
			    g.appendChild(filter);

			    stroke.setAttribute("filter", "url(#_fe_labelBlur)");
			    g.appendChild(stroke);
			}

			g.appendChild(text);

			return g;
		}

	}
});