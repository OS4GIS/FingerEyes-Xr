Xr.data = Xr.data || {};

/**  
 * @classdesc 텍스트 그래픽 Row에 대한 도형 정보 값을 담고 있는 클래스입니다. 
 * @class
 * @param {Object} arg - 객체이며 x, y, text 속성이 있어야 함. x는 텍스트가 위치할 지도 좌표에 대한 X축 값이며 y는 텍스트가 위치할 지도 좌표에 대한 Y축 값, 그리고 text는 텍스트 문자열입니다.
 * @copyright [(주)지오서비스]{@link http://www.geoservice.co.kr}
 * @license LGPL
 */
Xr.data.TextShapeData = Xr.Class({
    name: "TextShapeData",
    requires: [Xr.data.IShapeData, Xr.edit.ISnap],

	construct: function (/* {x:Number, y:Number, text:String } */ arg) {
	    this._data = arg;

	    this._mbr = new Xr.MBR();
	},

	methods: {
	    /* boolean */ hitTest: function (/* number */ x, /* number */ y, /* CoordMapper */ cm) {
	        var mbr = this.MBR();
	        var coord = cm.V2W(x, y);

	        return Xr.GeometryHelper.pointInMBR(mbr, coord, 0);
	    },

	    /* ShapeData */ clone: function () {
	        var arg = { x: this._data.x, y: this._data.y, text: this._data.text };
	        var mbr = new Xr.MBR(this._mbr.minX, this._mbr.minY, this._mbr.maxX, this._mbr.maxY);

	        var newThing = new Xr.data.TextShapeData(arg);
	        newThing._mbr = mbr;

	        return newThing;
	    },

		data: function() { 
		    return this._data;
		},

		MBR: function () {
			return this._mbr;
		},

		/* PointD */ representativePoint: function () {
		    return new Xr.PointD(_mbr.centerX(), _mbr.centerY());
		},

	    /* String */ type: function () {
	        return "TEXT";
	    },

	    /* ISkecth */ toSketch: function (/* EditManager */ editManager, /* int */ id) {
	        var sketch = new Xr.edit.TextSketch(editManager, this, id, false);
	        return sketch;
	    },

        /*
		regenMBR: function (coordMapper:CoordMapper, symbol:FontSymbol) {
		    var height = coordMapper.mapLength(symbol.size());
		    var width = this._data.text.length * height;
		    var x = this._data.x;
		    var y = this._data.y;

		    if (this._mbr == undefined) this._mbr = new Xr.MBR();

		    this._mbr.minX = x - width;
		    this._mbr.minY = y - height;
		    this._mbr.maxX = x + width;
		    this._mbr.maxY = x + height;
        }
        */

	    moveByOffset: function (/* number */ deltaX, /* number */ deltaY) {
	        this._data.x += deltaX;
	        this._data.y += deltaY;

	        this._mbr.moveByOffset(deltaX, deltaY);
	    },

	    updateControlPoint: function (/* int */ partIndex, /* int */ controlPointIndex, /* PointD */ newPt, /* ouput PointD */ oldPt) {
	        var offsetX = newPt.x - this._data.x;
	        var offsetY = newPt.y - this._data.y;

	        if (oldPt) oldPt.set(this._data.x, this._data.y);

	        this._data.x = newPt.x;
	        this._data.y = newPt.y;

	        this._mbr.moveByOffset(offsetX, offsetY);
	    },

	    moveControlPointByOffset: function (/* int */ partIndex, /* int */ controlPointIndex, /* number */ deltaX, /* number */ deltaY) {
	        //.
	    },

	    /* PointD */ removeVertex: function (/* int */ partIndex, /* int */ controlPointIndex) { },
	    insertVertex: function (/* int */ partIndex, /* int */ controlPointIndex, /* PointD */ vtx) { },
	    insertPart: function (/* int */ partIndex, /* Array of PointD */ pointList) { },
	    /* Array of PointD */ removePart: function (/* int */ partIndex) { },

	    /* PointD */ vertexSnap: function (/* PointD */ mapPt, /* number */ tol) {
	        var pt = new Xr.PointD(this._data.x, this._data.y);

	        if (Xr.GeometryHelper.pointIn(pt.x, pt.y, tol, mapPt)) {
	            return pt;
	        }

	        return undefined;
	    },

	    /* PointD */ edgeSnap: function (/* PointD */ mapPt, /* number */ tol) { return undefined },

	    /* string */ toWKT: function (/* boolean */ bMulti) {
	        return undefined;
	    },

	    /* boolean */ fromWKT: function (/* String */ wkt) {
	        return false;
	    }
	}
});