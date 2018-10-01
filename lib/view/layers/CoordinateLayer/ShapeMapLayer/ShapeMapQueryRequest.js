Xr.layers = Xr.layers || {};

/**  
 * @classdesc ShapeMapLayer가 공간 서버로부터 공간 데이터와 속성 데이터에 대한 요청을 실행하는 클래스입니다.
 * @class
 * @param {String} url - 공간 서버에 필요한 공간 데이터와 속성 데이터를 요청하기 위한 URL
 * @param {Xr.layers.ShapeMapLayer} layer - 데이터 요청을 실행하는 레이어 객체
 * @param {Xr.CoordMapper} coordMapper - 지도와 화면 간의 좌표계 변환 객체
 * @param {Xr.MouseActionEnum} mouseAction - 이 요청을 할 때 마우스의 조작 상태에 대한 값
 * @param {function} onCompleted - 공간 서버 연결이 성공할 경우 호출될 함수이며 선택 사항입니다.
 * @param {function} onFailed - 공간 서버 연결이 실패했을 때 호출될 함수이며 선택 사항입니다.
 * @copyright GEOSERVICE.CO.KR
 * @license LGPL
 */
Xr.layers.ShapeMapQueryRequest = Xr.Class({
    name: "ShapeMapQueryRequest",
    extend: Xr.layers.CoordinateQueryRequest,

	construct: function (/* string */ url, /* ShapeMapLayr */ layer, /* CoordMapper */ coordMapper,
                        /* MouseAction enum */ mouseAction, /* optional function */ onCompleted, /* optional function */ onFailed) {
	    this.superclass(url, layer, coordMapper, mouseAction, onCompleted, onFailed);
		this._xhr.responseType = "arraybuffer";
	},

	methods: {
        _buildAttributeRows: function (attributeDataLength, data, offset, rowset, fids) {
            var dataview = new DataView(data);
            var dataLength = dataview.byteLength;

		    //rowset.reset();

		    var rows = rowset.rows();
		    for (var fid in rows) {
		        rows[fid].willBeDeleted = true;
		    }

			var fidIndex = 0;
			var cursor = offset;
			var fieldTypes = rowset.fieldSet().fieldTypes();
			var fieldsCount = fieldTypes.length;
			var FieldTypeEnum = Xr.data.FieldType;
			var OperationHelper = Xr.OperationHelper;
			var AttributeRowClass = Xr.data.AttributeRow;

            try {
			    for(var fidIndex=0; fidIndex<fids.length; ++fidIndex) {
				    var fid = fids[fidIndex];

                    var chunkLength = dataview.getUint32(cursor, true);
                    cursor += 4;
                    
				    if (rows[fid] != undefined) {
				        cursor += chunkLength;
				        rows[fid].willBeDeleted = false;
				    } else {
				        var row = new AttributeRowClass(fid, fieldsCount);
				        for (var iField = 0; iField < fieldsCount; ++iField) {
				            var fieldType = fieldTypes[iField];
				            if (fieldType == FieldTypeEnum.DOUBLE) {
				                var doubleTypeValue = dataview.getFloat64(cursor, true);
				                cursor += 8;
				                row.setValue(iField, doubleTypeValue.toString());
				                //console.log(iField + " = " + doubleTypeValue);
				            }
				            else if (fieldType == FieldTypeEnum.FLOAT) {
				                var floatTypeValue = dataview.getFloat32(cursor, true);
				                cursor += 4;
				                row.setValue(iField, floatTypeValue.toString());
				                //console.log(iField + " = " + floatTypeValue);
				            }
				            else if (fieldType == FieldTypeEnum.INTEGER) {
				                var intTypeValue = dataview.getInt32(cursor, true);
				                cursor += 4;
				                row.setValue(iField, intTypeValue.toString());
				                //console.log(iField + " = " + intTypeValue);
				            }
				            else if (fieldType == FieldTypeEnum.SHORT) {
				                var shortTypeValue = dataview.getInt16(cursor, true);
				                cursor += 2;
				                row.setValue(iField, shortTypeValue.toString());
				                //console.log(iField + " = " + shortTypeValue);
				            }
				            else if (fieldType == FieldTypeEnum.STRING) {
				                var lenValue = dataview.getUint8(cursor, true);
				                cursor += 1;

				                var stringTypeValue = OperationHelper.stringUTF8(dataview, cursor, lenValue-1);
				                cursor += lenValue;

				                row.setValue(iField, stringTypeValue);

				                //if (iField == 20 || iField == 8) {
                                //console.log("fid = " + fid + " iField = " + iField + " stringTypeValue = " + stringTypeValue + " lenValue = " + lenValue);
				                //}
				            }
				            else if (fieldType == FieldTypeEnum.VERYSHORT) {
				                var vertShortTypeValue = dataview.getInt8(cursor);
				                cursor += 1;
				                row.setValue(iField, vertShortTypeValue.toString());
				                //console.log(iField + " = " + vertShortTypeValue);						
				            } else {
				                alert("[_buildAttributeRows] Unknown Type: " + fieldType);
				            }
				        }

				        rowset.add(row);
                    }	
			    }

			    for (var fid in rows) {
			        if (rows[fid].willBeDeleted) {
			            delete rows[fid];
			        }
                }
            } catch (e) {
                rowset.reset();
                return;
            }
		},
	
		_buildPointRows: function(shapeDataLength, dataview, rowset, fids) {
		    var rows = rowset.rows();
		    for (var fid in rows) {
		        rows[fid].willBeDeleted = true;
		    }

			var fidIndex = 0;
			var cursor = 12;
			var MBRClass = Xr.MBR;
			var PointShapeDataClass = Xr.data.PointShapeData;
			var PointShapeRowClass = Xr.data.PointShapeRow;

			while((cursor-12) < shapeDataLength) {
				var fid = dataview.getUint32(cursor, true);
				cursor += 4;
			
				var chunkLength = dataview.getUint32(cursor, true);
				cursor += 4;
			
				if (rows[fid] != undefined) {
				    cursor += chunkLength;
				    rows[fid].willBeDeleted = false;
				} else {

				    var X = dataview.getFloat32(cursor, true);
				    cursor += 4;

				    var Y = dataview.getFloat32(cursor, true);
				    cursor += 4;

				    var mbr = new MBRClass(X, Y, X, Y);
				    var shapeData = new PointShapeDataClass(mbr);
				    var row = new PointShapeRowClass(fid, shapeData);

				    rowset.add(row);

				    //console.log(fids + " " + fidIndex + " " + fid);
				}

				fids[fidIndex++] = fid;
			}	
			
			for (var fid in rows) {
			    if (rows[fid].willBeDeleted) {
			        delete rows[fid];
			    }
			}

			return cursor;
		},
		
		_buildPolylineRows: function(shapeDataLength, dataview, rowset, fids) {
		    var rows = rowset.rows();
            for (var fid in rows) {
		        rows[fid].willBeDeleted = true;
		    }

			var fidIndex = 0;
			var cursor = 12;
			var MBRClass = Xr.MBR;
			var PolylineShapeDataClass = Xr.data.PolylineShapeData;
			var PolylineShapeRowClass = Xr.data.PolylineShapeRow;

			while ((cursor - 12) < shapeDataLength) {
			    var fid = dataview.getUint32(cursor, true);
			    cursor += 4;

			    var chunkLength = dataview.getUint32(cursor, true);
			    cursor += 4;

			    if (rows[fid] != undefined) {
			        cursor += chunkLength;
			        rows[fid].willBeDeleted = false;
			    } else {
			        var mbrMinX = dataview.getFloat32(cursor, true);
			        cursor += 4;

			        var mbrMinY = dataview.getFloat32(cursor, true);
			        cursor += 4;

			        var mbrMaxX = dataview.getFloat32(cursor, true);
			        cursor += 4;

			        var mbrMaxY = dataview.getFloat32(cursor, true);
			        cursor += 4;

			        var mbr = new MBRClass(mbrMinX, mbrMinY, mbrMaxX, mbrMaxY);

			        var ringCount = dataview.getUint16(cursor, true);
			        cursor += 2;

			        var vtxCountsOfRings = new Array(ringCount);

			        for (var iRing = 0; iRing < ringCount; ++iRing) {
			            vtxCountsOfRings[iRing] = dataview.getUint32(cursor, true);
			            cursor += 4;
			        }

			        var shapeData = new PolylineShapeDataClass(mbr);
			        var polylines = shapeData.data();

			        for (var iRing = 0; iRing < ringCount; ++iRing) {
			            var vertexCount = vtxCountsOfRings[iRing];
			            var polyline = new Array(vertexCount);
			            for (var iVtx = 0; iVtx < vertexCount; ++iVtx) {
			                var x = dataview.getFloat32(cursor, true);
			                cursor += 4;

			                var y = dataview.getFloat32(cursor, true);
			                cursor += 4;

			                var wp = new Xr.PointD(x, y);
			                polyline[iVtx] = wp;
			            }

			            polylines[iRing] = polyline;
			        }

			        var row = new PolylineShapeRowClass(fid, shapeData);
			        rowset.add(row);
			    }

			    fids[fidIndex++] = fid;
			}

			for (var fid in rows) {
			    if (rows[fid].willBeDeleted) {
			        delete rows[fid];
			    }
			}

			return cursor;
		},

		_buildPolygonRows: function(shapeDataLength, dataview, rowset, fids) {
		    var rows = rowset.rows();
		    for (var fid in rows) {
		        rows[fid].willBeDeleted = true;
		    }

			var fidIndex = 0;
			var cursor = 12;
			var MBRClass = Xr.MBR;
			var PolygonShapeDataClass = Xr.data.PolygonShapeData;
			var PolygonShapeRowClass = Xr.data.PolygonShapeRow;

			while((cursor-12) < shapeDataLength) {
				var fid = dataview.getUint32(cursor, true);
				cursor += 4;

				var chunkLength = dataview.getUint32(cursor, true);
				cursor += 4;

				if (rows[fid] != undefined) {
				    cursor += chunkLength;
				    rows[fid].willBeDeleted = false;
				} else {
				    var mbrMinX = dataview.getFloat32(cursor, true);
				    cursor += 4;

				    var mbrMinY = dataview.getFloat32(cursor, true);
				    cursor += 4;

				    var mbrMaxX = dataview.getFloat32(cursor, true);
				    cursor += 4;

				    var mbrMaxY = dataview.getFloat32(cursor, true);
				    cursor += 4;

				    var mbr = new MBRClass(mbrMinX, mbrMinY, mbrMaxX, mbrMaxY);

				    var ringCount = dataview.getUint16(cursor, true);
				    cursor += 2;

				    var vtxCountsOfRings = new Array(ringCount);

				    for (var iRing = 0; iRing < ringCount; ++iRing) {
				        vtxCountsOfRings[iRing] = dataview.getUint32(cursor, true);
				        cursor += 4;
				    }

				    var shapeData = new PolygonShapeDataClass(mbr);
				    var polygons = shapeData.data();

				    for (var iRing = 0; iRing < ringCount; ++iRing) {
				        var vertexCount = vtxCountsOfRings[iRing];
				        var polygon = new Array(vertexCount);
				        for (var iVtx = 0; iVtx < vertexCount; ++iVtx) {
				            var x = dataview.getFloat32(cursor, true);
				            cursor += 4;

				            var y = dataview.getFloat32(cursor, true);
				            cursor += 4;

				            var wp = new Xr.PointD(x, y);
				            polygon[iVtx] = wp;
				        }

				        polygons[iRing] = polygon;
				    }

				    var row = new PolygonShapeRowClass(fid, shapeData);
				    row.willBeDeleted = false;
				    rowset.add(row);
				}

				fids[fidIndex++] = fid;
			}

			for (var fid in rows) {
			    if (rows[fid].willBeDeleted) {
			        delete rows[fid];
			    }
			}

			return cursor;
		},

		_parsingData: function(data, layer) {
			var dataview = new DataView(data);
			var shpRowset = layer.shapeRowSet();
			var shapeType = shpRowset.shapeType();
			var offset;
			var fids = new Array();

			var totalDataLength = dataview.getUint32(0, true); // true -> Little Endian
			var shapeDataLength = dataview.getUint32(4, true);
			var attributeDataLength = dataview.getUint32(8, true);

			if(shapeType == Xr.data.ShapeType.POINT)
				offset = this._buildPointRows(shapeDataLength, dataview, shpRowset, fids);
			else if(shapeType == Xr.data.ShapeType.POLYLINE)
				offset = this._buildPolylineRows(shapeDataLength, dataview, shpRowset, fids);		
			else if(shapeType == Xr.data.ShapeType.POLYGON)
				offset = this._buildPolygonRows(shapeDataLength, dataview, shpRowset, fids);

			if (attributeDataLength > 0) {
			    var attRowSet = layer.attributeRowSet();
			    this._buildAttributeRows(attributeDataLength, data, offset, attRowSet, fids);
			}
		}
	}
});