Xr.layers = Xr.layers || {};

/**  
 * @classdesc WFSLayer가 공간 서버로부터 공간 데이터와 속성 데이터에 대한 요청을 실행하는 클래스입니다.
 * @class
 * @param {String} url - 공간 서버에 필요한 공간 데이터와 속성 데이터를 요청하기 위한 URL
 * @param {Xr.layers.WFSLayer} layer - 데이터 요청을 실행하는 레이어 객체
 * @param {Xr.CoordMapper} coordMapper - 지도와 화면 간의 좌표계 변환 객체
 * @param {Xr.MouseActionEnum} mouseAction - 이 요청을 할 때 마우스의 조작 상태에 대한 값
 * @param {function} onCompleted - 공간 서버 연결이 성공할 경우 호출될 함수이며 선택 사항입니다.
 * @param {function} onFailed - 공간 서버 연결이 실패했을 때 호출될 함수이며 선택 사항입니다.
 * @copyright GEOSERVICE.CO.KR
 * @license LGPL
 */
Xr.layers.WFSQueryRequest = Xr.Class({
    name: "WFSQueryRequest",
    extend: Xr.layers.CoordinateQueryRequest,

	construct: function (/* string */ url, /* WFSLayr */ layer, /* CoordMapper */ coordMapper,
                        /* MouseAction enum */ mouseAction, /* optional function */ onCompleted, /* optional function */ onFailed) {
	    this.superclass(url, layer, coordMapper, mouseAction, onCompleted, onFailed);
	},

	methods: {
	    _buildPointRows: function (jsonObj, shpRowset, attRowSet) {
	        var shpRows = shpRowset.rows();
	        var fieldSet = attRowSet.fieldSet();
	        var cntFields = fieldSet.size();

	        for (var fid in shpRows) {
	            shpRows[fid].willBeDeleted = true;
	        }

	        var PointShapeDataClass = Xr.data.PointShapeData;
	        var PointShapeRowClass = Xr.data.PointShapeRow;
	        var features = jsonObj.features;
	        var cntFeatures = features.length;
	        var idxSplitFid = -1;

	        for (var iFeature = 0; iFeature < cntFeatures; ++iFeature) {
	            var feature = features[iFeature];

	            if (idxSplitFid == -1) {
	                idxSplitFid = feature.id.indexOf(".") + 1;
	            }

	            var fid = feature.id.substring(idxSplitFid);

	            if (shpRows[fid] != undefined) {
	                shpRows[fid].willBeDeleted = false;
	            } else {
	                var coordinates = feature.geometry.coordinates;
	                var properties = feature.properties;
	                var type = feature.geometry.type;
	                
	                if (type === "Point") {

	                } else if (type === "MultiPoint") {
	                    alert("WFS MultiPoint Not Supported Yet.");
	                    return;
	                }

	                var shapeData = new PointShapeDataClass(new Xr.PointD(coordinates[0], coordinates[1]));
	                var shpRow = new PointShapeRowClass(fid, shapeData);
	                shpRow.willBeDeleted = false;
	                shpRowset.add(shpRow);

	                this._buildAttributeRow(fid, fieldSet, attRowSet, properties);
	            }
	        }

	        for (var fid in shpRows) {
	            if (shpRows[fid].willBeDeleted) {
	                delete shpRows[fid];
	            }
	        }
	    },

	    _buildPolylineRows: function (jsonObj, shpRowset, attRowSet) {
		    var shpRows = shpRowset.rows();
		    var fieldSet = attRowSet.fieldSet();
		    var cntFields = fieldSet.size();

		    for (var fid in shpRows) {
		        shpRows[fid].willBeDeleted = true;
		    }

		    var PolylineShapeDataClass = Xr.data.PolylineShapeData;
		    var PolylineShapeRowClass = Xr.data.PolylineShapeRow;
		    var features = jsonObj.features;
		    var cntFeatures = features.length;
		    var idxSplitFid = -1;

		    for (var iFeature = 0; iFeature < cntFeatures; ++iFeature) {
		        var feature = features[iFeature];

		        if (idxSplitFid == -1) {
		            idxSplitFid = feature.id.indexOf(".") + 1;
		        }

		        var fid = feature.id.substring(idxSplitFid);

		        if (shpRows[fid] != undefined) {
		            shpRows[fid].willBeDeleted = false;
		        } else {
		            var coordinates = feature.geometry.coordinates;
		            var properties = feature.properties;
		            var type = feature.geometry.type;
		            var polylines = new Array();

		            if (type === "MultiLineString") {
		                var cntPolylines = coordinates.length;

		                for (var iPolyline = 0; iPolyline < cntPolylines; ++iPolyline) {
		                    var part = coordinates[iPolyline]
		                    var cntVtx = part.length;
		                    var polyline = new Array(cntVtx);

		                    for (var iVtx = 0; iVtx < cntVtx; ++iVtx) {
		                        var vtx = part[iVtx];
		                        var wp = new Xr.PointD(vtx[0], vtx[1]);
		                        polyline[iVtx] = wp;
		                    }

		                    polylines.push(polyline);
		                }
		            } else if (type === "LineString") { // Not Tested
		                var cntVtx = coordinates.length;
                        var polyline = new Array(cntVtx);

		                for (var iVtx = 0; iVtx < cntVtx; ++iVtx) {
		                    var vtx = coordinates[iVtx];
		                    var wp = new Xr.PointD(vtx[0], vtx[1]);
		                    polyline[iVtx] = wp;
		                }

		                polylines.push(polyline);
		            }

		            var shapeData = new PolylineShapeDataClass(polylines);
		            var shpRow = new PolylineShapeRowClass(fid, shapeData);
		            shpRow.willBeDeleted = false;
		            shpRowset.add(shpRow);

		            this._buildAttributeRow(fid, fieldSet, attRowSet, properties);
		        }
		    }

		    for (var fid in shpRows) {
		        if (shpRows[fid].willBeDeleted) {
		            delete shpRows[fid];
		        }
		    }
		},

	    _buildPolygonRows: function (jsonObj, shpRowset, attRowSet) {
	        var shpRows = shpRowset.rows();
	        var fieldSet = attRowSet.fieldSet();
	        var cntFields = fieldSet.size();
	        
	        for (var fid in shpRows) {
		        shpRows[fid].willBeDeleted = true;
		    }

			var PolygonShapeDataClass = Xr.data.PolygonShapeData;
			var PolygonShapeRowClass = Xr.data.PolygonShapeRow;
			var features = jsonObj.features;
			var cntFeatures = features.length;
			var idxSplitFid = -1;
			
			for (var iFeature = 0; iFeature < cntFeatures; ++iFeature) {
			    var feature = features[iFeature];
			    
			    if (idxSplitFid == -1) {
			        idxSplitFid = feature.id.indexOf(".") + 1;
			    }

			    var fid = feature.id.substring(idxSplitFid);

			    if (shpRows[fid] != undefined) {
			        shpRows[fid].willBeDeleted = false;
			    } else {
			        var coordinates = feature.geometry.coordinates;
			        var properties = feature.properties;
			        var type = feature.geometry.type;
			        var polygons = new Array();

			        if (type === "MultiPolygon") {
			            var cntPolygons = coordinates.length;

			            for (var iPolygon = 0; iPolygon < cntPolygons; ++iPolygon) {
			                var rings = coordinates[iPolygon]
			                var cntRings = rings.length;
			                for (var iRing = 0; iRing < cntRings; ++iRing) {
			                    var ring = rings[iRing];
			                    var cntVtx = ring.length;
			                    var polygon = new Array(cntVtx);

			                    for (var iVtx = 0; iVtx < cntVtx; ++iVtx) {
			                        var vtx = ring[iVtx];
			                        var wp = new Xr.PointD(vtx[0], vtx[1]);
			                        polygon[iVtx] = wp;
			                    }

			                    polygons.push(polygon);
			                }
			            }
			        } else if (type === "Polygon") { // Not Tested
			            var cntPolygons = coordinates.length;

			            for (var iPolygon = 0; iPolygon < cntPolygons; ++iPolygon) {
			                var part = coordinates[iPolygon]
			                var cntVtx = part.length;
			                var polygon = new Array(cntVtx);

			                for (var iVtx = 0; iVtx < cntVtx; ++iVtx) {
			                    var vtx = part[iVtx];
			                    var wp = new Xr.PointD(vtx[0], vtx[1]);
			                    polygon[iVtx] = wp;
			                }

			                polygons.push(polygon);
			            }
			        }

			        var shapeData = new PolygonShapeDataClass(polygons);
			        var shpRow = new PolygonShapeRowClass(fid, shapeData);
			        shpRow.willBeDeleted = false;
			        shpRowset.add(shpRow);

			        this._buildAttributeRow(fid, fieldSet, attRowSet, properties);
			    }
			}

			for (var fid in shpRows) {
			    if (shpRows[fid].willBeDeleted) {
			        delete shpRows[fid];
			    }
			}
		},

	    _buildAttributeRow: function(/* int */ fid, /* FieldSet */ fieldSet, /* AttributeRowSet */ attRowSet, /* object */ properties) {
	        var cntFields = fieldSet.size();
	        var attRow = new Xr.data.AttributeRow(fid, cntFields);
	        for (var iField = 0; iField < cntFields; ++iField) {
	            var fieldName = fieldSet.fieldName(iField);
	            var value = properties[fieldName];
	            attRow.setValue(iField, value);
	        }

	        attRowSet.add(attRow);
	    },

		_parsingData: function(jsonData, layer) {
			var shpRowset = layer.shapeRowSet();
			var attRowSet = layer.attributeRowSet();
			var shapeType = shpRowset.shapeType();
			var jsonObj = JSON.parse(jsonData);

			if (shapeType == Xr.data.ShapeType.POINT)
			    this._buildPointRows(jsonObj, shpRowset, attRowSet);
			else if(shapeType == Xr.data.ShapeType.POLYLINE)
			    this._buildPolylineRows(jsonObj, shpRowset, attRowSet);
			else if(shapeType == Xr.data.ShapeType.POLYGON)
			    this._buildPolygonRows(jsonObj, shpRowset, attRowSet);
		}
	}
});