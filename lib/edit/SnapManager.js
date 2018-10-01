Xr.edit = Xr.edit || {};

/**
 * @classdesc 편집시 정점 또는 선분에 대한 스냅핑(Snapping) 기능을 관리하는 클래스입니다.
 * @class
 * @param {Xr.managers.EditManager} editManager - 편집 관리자 클래스 객체
 * @copyright GEOSERVICE.CO.KR
 * @license LGPL
 */
Xr.edit.SnapManager = Xr.Class({
    name: "SnapManager",

	construct: function(/* EditManager */ editManager) {
	    this._vertexSnapTargets = new Array();
	    this._segmentSnapTargets = new Array();
	    this._editManager = editManager;
	},
 	
	methods: {
	    /* boolean */ isVertexSnap: function (/* ISnap */ target) {
	        var targets = this._vertexSnapTargets;
	        var cntTargets = targets.length;

	        for (var i = 0; i < cntTargets; i++) {
	            if (targets[i] == target) {
	                return true;
	            }
	        }

	        return false;
	    },

	    /* SnapManager */ addVertexSnap: function (/* ISnap */ target) {
	        var targets = this._vertexSnapTargets;
            var cntTargets = targets.length;

            for (var i = 0; i < cntTargets; i++) {
		        if (targets[i] == target) {
		            return this;
		        }
		    }

            targets.push(target);
		    return this;
		},

	    /* void */ removeVertexSnap: function (/* ISnap */ target) {
	        var targets = this._vertexSnapTargets;
	        var cntTargets = targets.length;

	        for (var i = 0; i < cntTargets; i++) {
	            if (targets[i] == target) {
	                targets.splice(i, 1);
		        }
		    }
		},

	    /* void */ clearVertexSnapTargets: function () {
		    this._vertexSnapTargets.length = 0;
		},

	    /* boolean */ isSegmentSnap: function (/* ISnap */ target) {
	        var targets = this._segmentSnapTargets;
	        var cntTargets = targets.length;

	        for (var i = 0; i < cntTargets; i++) {
	            if (targets[i] == target) {
	                return true;
	            }
	        }

	        return false;
	    },

	    /* SnapManager */ addSegmentSnap: function (/* ISnap */ target) {
            var targets = this._segmentSnapTargets;
	        var cntTargets = targets.length;

	        for (var i = 0; i < cntTargets; i++) {
	            if (targets[i] == target) {
	                return this;
	            }
	        }

	        targets.push(target);
	        return this;
	    },

		/* void */ removeSegmentSnap: function (/* ISnap */ target) {
		    var targets = this._segmentSnapTargets;
		    var cntTargets = targets.length;

		    for (var i = 0; i < cntTargets; i++) {
		        if (targets[i] == target) {
		            targets.splice(i, 1);
		        }
		    }
		},

	    /* void */ clearSegmentSnapTargets: function () {
		    this._segmentSnapTargets.length = 0;
		},

	    /* PointD */ vertexSnap: function (/* PointD */ mapPt, /* number */ tol) {
	        var targets = this._vertexSnapTargets;
	        var cntTargets = targets.length;
	        var result = undefined;

	        for (var i = 0; i < cntTargets; i++) {
	            result = targets[i].vertexSnap(mapPt, tol)
	            if (result) break;
	        }

	        return result;
	    },

	    /* PointD */ edgeSnap: function (/* PointD */ mapPt, /* number */ tol) {
	        var targets = this._segmentSnapTargets;
	        var cntTargets = targets.length;
	        var result = undefined;

	        for (var i = 0; i < cntTargets; i++) {
	            result = targets[i].edgeSnap(mapPt, tol)
	            if (result) break;
	        }

	        return result;
	    }
	}
});