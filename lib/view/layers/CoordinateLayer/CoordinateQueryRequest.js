Xr.layers = Xr.layers || {};

/**  
 * @classdesc 서버로부터 실제 좌표값과 속성값을 받아 처리하는 레이어가 실제로 공간 데이터와 속성 데이터를 요청하는 클래스가 상속받는 부모 클래스입니다.
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
Xr.layers.CoordinateQueryRequest = Xr.Class({
    name: "CoordinateQueryRequest",

	construct: function (/* string */ url, /* ShapeMapLayr */ layer, /* CoordMapper */ coordMapper,
                        /* MouseAction enum */ mouseAction, /* optional function */ onCompleted, /* optional function */ onFailed) {
		this._xhr = Xr.OperationHelper.createXMLHttpObject();
		this._xhr.open("GET", url);
		this._mouseAction = mouseAction;

		var caller = this;
		this._xhr.onreadystatechange = function(evt) {
			if(caller._xhr.readyState == 4) {
                if (caller._xhr.status == 200) {
                    if (!caller._bOnRequesting) { // cancel 매서드에 의한 취소시
                        return;
                    }

                    caller._bOnRequesting = false;

					var arrayBuffer = caller._xhr.response;
					
					caller._parsingData(arrayBuffer, layer);
					caller._buildSVG(layer, coordMapper);
					
                    if (onCompleted) onCompleted();                    
				} else {
                    if (onFailed) onFailed();
                    else {
                        //throw new Error("CoordinateQueryRequest Error: " + url);
                    }
				}		
			}				
		}
	},

    methods: {
		_buildSVG: function(layer, coordMapper) {
			var svg = layer.container();
			var childNodes = svg.childNodes;
			var cntChildNodes = childNodes.length;	
			var childNode;

			var attRowSet = layer.attributeRowSet();
			var fieldSet = attRowSet.fieldSet();
			var attRows = attRowSet.rows();
			var theme = layer.theme();
			var layerName = layer.name();
			var labelDrawer = layer.labelDrawer();
			var label = layer.label();
			var mapScale = coordMapper.mapScale();
			var shpRows = layer.shapeRowSet().rows();
			var formatter = label.formatter();
			var labelTheme = label.theme();
			var labelSvg = labelDrawer.container();
			var bLabeling = label.enable() && label.visibility().needRendering(mapScale);
			var shpType = layer.shapeRowSet().shapeType();
            
            for (var i = cntChildNodes-1; i >= 0; i--) {
                childNodes[i]._beDeleted = true;
            }
            
			labelDrawer.markClean(layerName);
            
            var bShpDraw = layer.visibility().needRendering(mapScale); 

            if (bShpDraw || bLabeling) {
			    for (var fid in shpRows) {
			        var shpRow = shpRows[fid];
                    var attRow = attRows[fid];

                    if (bShpDraw) {
                        childNode = svg.getElementById(fid);
                        if (childNode) {
                            delete childNode._beDeleted;
                            //childNode.setAttribute("fill", "red");
                        } else {
                            var sym = theme.symbol(shpRow, fieldSet, attRow);
                            if (sym == null) {
                                continue;
                            }

                            var path = shpRow.createSVG(coordMapper, attRow, sym);

                            path.id = fid;
                            svg.appendChild(path);
                            path.mbr = shpRow.shapeData().MBR();
                            path._offsetX = 0;
                            path._offsetY = 0;

                            var deferableTheme = layer.deferableTheme();
                            if (deferableTheme) {
                                deferableTheme.requestCondition(fid);
                            }
                        }
                    }

                    if (bLabeling) {
                        var labelId = layerName + fid;
                        childNode = labelSvg.getElementById(labelId)

                        if (childNode) {
                            delete childNode._beDeleted;
                            //childNode.setAttribute("stroke", "red");
                        } else {
                            var labelText = formatter.value(shpRow, fieldSet, attRow);
                            if (labelText && labelText.length > 0) {
                                var fontSym = labelTheme.symbol(shpRow, fieldSet, attRow);

                                if (fontSym == null) {
                                    continue;
                                }

                                var text = attRow.createSVG(coordMapper, shpRow, labelText, fontSym, label); // creating SVG and setting Symbol

                                text._offsetX = 0;
                                text._offsetY = 0;

                                labelSvg.appendChild(text);

                                var bbox = text.getBBox();
                                var rPt = shpRow.shapeData().representativePoint();
                                var hLen = coordMapper.mapLength(bbox.width);
                                var vLen = coordMapper.mapLength(bbox.height);
                                var cx = rPt.x;
                                var cy = rPt.y;
                                var mx = (hLen / 3);
                                var my = (vLen / 3);

                                if (shpType != Xr.data.ShapeType.POLYLINE && !labelDrawer.add(labelId, new Xr.MBR(cx - mx, cy - my, cx + mx, cy + my))) {
                                    labelSvg.removeChild(text);
                                } else {
                                    text.id = labelId;

                                    var deferableLabelText = layer.deferableLabelText();
                                    if (deferableLabelText) {
                                        deferableLabelText.requestLabelText(fid);
                                    }

                                    //test(labelSvg, layerName + fid);
                                }
                            }
                        }
			        }
                }
                
                for (var i = childNodes.length-1; i >= 0; i--) {
                    childNode = childNodes[i];

                    if (childNode._beDeleted) {
                        svg.removeChild(childNode);
                    }
                }

                //labelDrawer.clean(layerName);
            }

            labelDrawer.clean(layerName);
		},
		
		request: function() {
            this._xhr.send(null);
            this._bOnRequesting = true; 
        },

        cancel: function () {
            if (this._bOnRequesting) {
                this._bOnRequesting = false;

                if (this._xhr.abort) {
                    this._xhr.abort();
                }
            }
        }
	}
});