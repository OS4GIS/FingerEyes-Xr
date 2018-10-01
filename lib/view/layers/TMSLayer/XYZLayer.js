Xr.layers = Xr.layers || {};

/**  
 * @classdesc 구체적인 타일맵 레이어가 상속받는 부모 클래스입니다.
 * @class
 * @param {String} name - 레이어의 이름으로 고유한 ID 값
 * @param {String} connectionString - 연결 문자열
 * @copyright GEOSERVICE.CO.KR
 * @license LGPL
 */
Xr.layers.XYZLayer = Xr.Class({
	name: "XYZLayer",
	extend: Xr.layers.Layer,
		
    construct: function (name, connectionString) {
        if (arguments[0] === __XR_CLASS_LOADING_TIME__) return; // for preventing Error in Xr.Class

		//this.superclass(name, connectionString);
		Xr.layers.Layer.call(this, name, connectionString);
	
		this._div = document.createElement("div");
		this._div.style.position = "absolute";
		this._div.style.top = "0px";
		this._div.style.left = "0px";
		this._div.style.width = "100%";
		this._div.style.height = "100%";
		this._div.style.overflow = "hidden";
		this._div.style.setProperty("pointer-events", "none");		

		this._divTileImgs = document.createElement("div");
		this._divTileImgs.style.position = "absolute";
		this._divTileImgs.style.top = "0px";
		this._divTileImgs.style.left = "0px";

		this._div.appendChild(this._divTileImgs);

		this._levelDataList = new Array();
		this._mbr = new Xr.MBR();
		this._connected = false;
		
		this._nextRequestUrlIndex = 0;
	},

	methods: {
		container: function() {
			return this._div;
		},

		_tileImagesContainer: function() {
		    return this._divTileImgs;
		},
		
        connect: function (coordMapper, /* optional function */ callbackFunction) {},
		
		_getOptimizePiramidIndex: function(coordMapper) {
			var mpp = coordMapper.metersPerOnePixel();
			var cntPiramids = this._levelDataList.length;
			var gap = Number.MAX_VALUE;
			var result = -1;
	
			for(var iPiramid=0; iPiramid<cntPiramids; ++iPiramid) {
				var piramid = this._levelDataList[iPiramid];
				var calGap = Math.abs(piramid.unitsPerPixel() - mpp);
				if(gap > calGap) {
					gap = calGap;
					result = iPiramid;
				}
			}
	
			return result;
		},

        release: function () {
            this._removeTileImages(true);
        },

        _removeTileImages: function (bAll) {
		    var div = this._tileImagesContainer();
			var imgs = div.getElementsByClassName("tilemap");
			var cntImgs = imgs.length;

			//console.log("_removeTileImages - " + (bAll ? "All" : "Part"));

			var cntRemoved = 0;
		    for (var iImg = (cntImgs - 1) ; iImg >= 0; iImg--) {
		        var img = imgs[iImg];

		        if (!bAll && !img.candidateBeDeleted) {
		            continue;
		        }

		        div.removeChild(img);
		        cntRemoved++;
		    }

		    //console.log("removeChild " + cntRemoved + " in " + cntImgs);
		},

        currentTileImagesList: function (coordMapper) {
            var result = [];
            var mapScale = coordMapper.mapScale();
            var nPiramid = this._getOptimizePiramidIndex(coordMapper);
            var piramid = this._levelDataList[nPiramid];

            if (piramid) {
                var viewportMBR = coordMapper.viewportMBR();
                var piramidMinX = piramid.minX();
                var piramidMinY = piramid.minY();
                var piramidMaxX = piramid.maxX();
                var piramidMaxY = piramid.maxY();
                var piramidTileMapWidth = piramid.tileMapWidth();
                var piramidTileMapHeight = piramid.tileMapHeight();

                var mbrOfPiramid = new Xr.MBR(piramidMinX, piramidMinY, piramidMaxX, piramidMaxY);

                // 현재 뷰의 MBR과 피리미드의 MBR이 중첩된다면 ...
                if (coordMapper.intersectMBR(mbrOfPiramid, viewportMBR)) {
                    // 좌측 하단의 Column 인덱스
                    var LeftDownColumn = parseInt(Math.floor((viewportMBR.minX - mbrOfPiramid.minX) / piramidTileMapWidth));

                    // 좌측 하단의 Row 인덱스
                    var LeftDownRow;
                    if (this._bReversedRows) LeftDownRow = parseInt(Math.floor((mbrOfPiramid.maxY - viewportMBR.maxY) / piramidTileMapHeight));
                    else LeftDownRow = parseInt(Math.floor((viewportMBR.minY - mbrOfPiramid.minY) / piramidTileMapHeight));

                    // 우측 상단의 Column 인덱스
                    var RightUpColumn = parseInt(Math.floor((viewportMBR.maxX - mbrOfPiramid.minX) / piramidTileMapWidth));

                    // 우측 상단의 Row 인덱스
                    var RightUpRow;
                    var bRevRows = this._bReversedRows;
                    var bRevLvls = this._bReversedLevels;

                    if (bRevRows) RightUpRow = parseInt(Math.floor((mbrOfPiramid.maxY - viewportMBR.minY) / piramidTileMapHeight));
                    else RightUpRow = parseInt(Math.floor((viewportMBR.maxY - mbrOfPiramid.minY) / piramidTileMapHeight));

                    var PointDClass = Xr.PointD;
                    var piramidRows = piramid.rows();
                    var piramidCols = piramid.columns();
                    var iRow, iColumn, iImg;
                    var url; // String
                    var rot = coordMapper.rotationAngle();; // Number
                    var wPtLT, vPtLT, vPtRT, vPtRB; // PointD

                    if (rot != 0) {
                        LeftDownRow -= 1;
                        RightUpRow += 1;
                        LeftDownColumn -= 1;
                        RightUpColumn += 1;
                    }

                    for (iRow = RightUpRow; iRow >= LeftDownRow; iRow--) {
                        for (iColumn = LeftDownColumn; iColumn <= RightUpColumn; ++iColumn) {
                            this._nextRequestUrlIndex = (++this._nextRequestUrlIndex) % this._urls.length;

                            if (bRevLvls) {
                                url = this._urls[this._nextRequestUrlIndex].replace("${z}", (this._levelDataList.length + 1) - (nPiramid + 1))
                                    .replace("${y}", iRow).replace("${x}", iColumn);
                            } else {
                                url = this._urls[this._nextRequestUrlIndex].replace("${z}", (nPiramid + 1))
                                    .replace("${y}", iRow).replace("${x}", iColumn);
                            }

                            result.push(url);
                        }
                    }
                }

                var resultMBR = {
                    minX: piramidMinX + LeftDownColumn * piramidTileMapWidth,
                    minY: piramidMinY + LeftDownRow * piramidTileMapHeight,
                    maxX: piramidMinX + (RightUpColumn+1) * piramidTileMapWidth,
                    maxY: piramidMinY + (RightUpRow+1) * piramidTileMapHeight
                };

                return { urls: result, rows: RightUpRow - LeftDownRow + 1, colums: RightUpColumn - LeftDownColumn + 1, mbr: resultMBR };
            } else {
                return null;
            }
        },

		update: function (coordMapper, mouseAction, offsetX, offsetY) {
		    //console.log("[START] " + mouseAction + " " + offsetX + " " + offsetY);

		    if (mouseAction == Xr.MouseActionEnum.MOUSE_DOWN) {
		        return;
		    }

		    if (offsetX == 0 && offsetY == 0 && mouseAction != Xr.MouseActionEnum.NO_MOUSE) {
		        if (mouseAction == Xr.MouseActionEnum.MOUSE_UP) {
		            this._removeTileImages(false);
		        }
		        //console.log("<update cancel>");
		        return;
		    }

            // 지도 축척값 얻기
		    var mapScale = coordMapper.mapScale();

            var parentDiv = this.container();

            // 해당 축척에서 지도 그릴 필요가 있는지 검사
            if (this.visibility().needRendering(mapScale)) {
                if (parentDiv.style.display != "block") parentDiv.style.display = "block"

		        var div = this._tileImagesContainer();

		        // 현재 화면에 표시된 타일맵 이미지의 개수 얻기
		        var imgs = div.getElementsByClassName("tilemap");

		        var imgsLength = imgs.length;
		        //console.log("imgsLength = " + imgsLength);

		        // 모든 타일맵을 삭제 대상으로 지정
		        var iImg;
		        for (iImg = (imgsLength - 1) ; iImg >= 0; iImg--) {
		            imgs[iImg].candidateBeDeleted = true;
		        }

                // 현재 뷰의 MBR 얻기
		        var viewportMBR = coordMapper.viewportMBR();

                // 현재 최적의 피리미드 인덱스 얻기
		        var nPiramid = this._getOptimizePiramidIndex(coordMapper);
		        var piramid = this._levelDataList[nPiramid];
		        if (!piramid) return;

		        var piramidMinX = piramid.minX();
		        var piramidMinY = piramid.minY();
		        var piramidMaxX = piramid.maxX();
		        var piramidMaxY = piramid.maxY();
		        var piramidTileMapWidth = piramid.tileMapWidth();
		        var piramidTileMapHeight = piramid.tileMapHeight();

		        var mbrOfPiramid = new Xr.MBR(piramidMinX, piramidMinY, piramidMaxX, piramidMaxY);

                // 현재 뷰의 MBR과 피리미드의 MBR이 중첩된다면 ...
		        if (coordMapper.intersectMBR(mbrOfPiramid, viewportMBR)) {
                    // 좌측 하단의 Column 인덱스
		            var LeftDownColumn = parseInt(Math.floor((viewportMBR.minX - mbrOfPiramid.minX) / piramidTileMapWidth));

                    // 좌측 하단의 Row 인덱스
		            var LeftDownRow;
		            if (this._bReversedRows) LeftDownRow = parseInt(Math.floor((mbrOfPiramid.maxY - viewportMBR.maxY) / piramidTileMapHeight));
		            else LeftDownRow = parseInt(Math.floor((viewportMBR.minY - mbrOfPiramid.minY) / piramidTileMapHeight));

                    // 우측 상단의 Column 인덱스
		            var RightUpColumn = parseInt(Math.floor((viewportMBR.maxX - mbrOfPiramid.minX) / piramidTileMapWidth));

                    // 우측 상단의 Row 인덱스
		            var RightUpRow;
		            var bRevRows = this._bReversedRows;
		            var bRevLvls = this._bReversedLevels;

		            if (bRevRows) RightUpRow = parseInt(Math.floor((mbrOfPiramid.maxY - viewportMBR.minY) / piramidTileMapHeight));
		            else RightUpRow = parseInt(Math.floor((viewportMBR.maxY - mbrOfPiramid.minY) / piramidTileMapHeight));

		            var PointDClass = Xr.PointD;
		            var piramidRows = piramid.rows();
		            var piramidCols = piramid.columns();
		            var newImg = undefined;
		            var iRow, iColumn, iImg;
		            var bCreateNewImage;
		            var oldImg; // Image 
		            var url; // String
		            var imgStyle; // Style 
		            var rot = coordMapper.rotationAngle();; // Number
		            var wPtLT, vPtLT, vPtRT, vPtRB; // PointD
		            var imgId;

		            if (rot != 0) {
		                LeftDownRow -= 1;
		                RightUpRow += 1;
		                LeftDownColumn -= 1;
		                RightUpColumn += 1;
		            }

		            for (iRow = RightUpRow; iRow >= LeftDownRow; iRow--) {
		                for (iColumn = LeftDownColumn; iColumn <= RightUpColumn; ++iColumn) {
		                    //if (iRow < 0 || iColumn < 0 || iRow > (piramidRows - 1) || iColumn > (piramidCols - 1)) continue;

		                    bCreateNewImage = true;
		                    imgId = nPiramid + "_" + iRow + "_" + iColumn;

		                    for (iImg = (imgsLength - 1) ; iImg >= 0; iImg--) {
		                        oldImg = imgs[iImg];
		                        //if (oldImg.nColumn == iColumn && oldImg.nRow == iRow && oldImg.nPiramid == nPiramid) {
		                        if (oldImg.imgId == imgId) {
    		                        oldImg.candidateBeDeleted = false;
		                            bCreateNewImage = false;
		                            break;
		                        }
		                    }

		                    if (bCreateNewImage) {
		                        if (newImg) {
		                            newImg = newImg.cloneNode(false);
		                        } else {
                                    newImg = document.createElement("img");
                                    newImg.setAttribute("crossOrigin", "anonymous");
		                            newImg.className = "tilemap"; //tilemap tilemap_anim";
		                        }

		                        newImg.candidateBeDeleted = false;

		                        this._nextRequestUrlIndex = (++this._nextRequestUrlIndex) % this._urls.length;

		                        if (bRevLvls) {
		                            url = this._urls[this._nextRequestUrlIndex].replace("${z}", (this._levelDataList.length + 1) - (nPiramid + 1))
                                        .replace("${y}", iRow).replace("${x}", iColumn);
		                        } else {
		                            url = this._urls[this._nextRequestUrlIndex].replace("${z}", (nPiramid + 1))
                                        .replace("${y}", iRow).replace("${x}", iColumn);
		                        }

		                        newImg.src = url;

                                /*
		                        newImg.nPiramid = nPiramid;
		                        newImg.nRow = iRow;
		                        newImg.nColumn = iColumn;
                                */
		                        newImg.imgId = imgId;

		                        div.appendChild(newImg);
		                    } else {
		                        newImg = oldImg;
		                    }

		                    imgStyle = newImg.style;

		                    if (rot != 0) {
		                        imgStyle.setProperty("-webkit-transform", "rotate(" + rot + "deg)");
		                        imgStyle.setProperty("transform", "rotate(" + rot + "deg)");
		                    }

		                    if (bRevRows) {
		                        wPtLT = new PointDClass(piramidMinX + iColumn * piramidTileMapWidth, mbrOfPiramid.maxY - piramidTileMapHeight * iRow);
		                        wPtRT = new PointDClass(piramidMinX + piramidTileMapWidth * (iColumn + 1), piramidMaxY - piramidTileMapHeight * (iRow));
		                        wPtRB = new PointDClass(piramidMinX + iColumn * piramidTileMapWidth + piramidTileMapWidth, mbrOfPiramid.maxY - piramidTileMapHeight * (iRow + 1));
		                    } else {
		                        wPtLT = new PointDClass(piramidMinX + iColumn * piramidTileMapWidth, piramidMinY + (iRow + 1) * piramidTileMapHeight);
		                        wPtRT = new PointDClass(piramidMinX + piramidTileMapWidth * (iColumn + 1), piramidMinY + piramidTileMapHeight * (iRow + 1));
		                        wPtRB = new PointDClass(piramidMinX + (iColumn + 1) * piramidTileMapWidth, piramidMinY + iRow * piramidTileMapHeight);
		                    }

		                    vPtLT = coordMapper.W2V(wPtLT); 
		                    vPtRT = coordMapper.W2V(wPtRT);
		                    vPtRB = coordMapper.W2V(wPtRB);
                            
		                    imgStyle.top = (vPtLT.y) + "px";
		                    imgStyle.left = (vPtLT.x) + "px";

		                    imgStyle.width = Math.ceil(
                                (Math.sqrt(Math.pow(vPtLT.x - vPtRT.x, 2.0) + Math.pow(vPtLT.y - vPtRT.y, 2.0)))
                            ) + "px";
		                    imgStyle.height = Math.ceil(
                                (Math.sqrt(Math.pow(vPtRT.x - vPtRB.x, 2.0) + Math.pow(vPtRT.y - vPtRB.y, 2.0))) 
                            ) + "px";

		                    //console.log(newImg.style.width + " x " + newImg.style.height);
		                }
		            }

		            //console.log("-------------------------------------------------------");

		            if (mouseAction == Xr.MouseActionEnum.NO_MOUSE) { // Zoom In/Out
		                var that = this;
		                setTimeout(function () {
		                    that._removeTileImages(false);
		                }, 400);
		            } else { // Pan
		                this._removeTileImages(false);
		            }
		        }
            } else {
                if (parentDiv.style.display != "none") parentDiv.style.display = "none"
		        this._removeTileImages(true);
		    }

		    //console.log("[END] " + createdImageCount);
		},

		MBR: function() {
			return this._mbr;
		},
		
		conneted: function() {
			return this._connected; 
        },

        needRendering: function (mapScale) {
            return this.visibility().needRendering(mapScale);
        },

        drawOnCanvas: function (/* canvas DOM */ canvas) {
            var domDiv = this._tileImagesContainer();
            var cntImgs = domDiv.childNodes.length;
            var ctx = canvas.getContext("2d");

            for (var iTile = 0; iTile < cntImgs; iTile++) {
                var domImg = domDiv.childNodes[iTile];
                var styImg = domImg.style;
                var imgX = parseFloat(styImg.left);
                var imgY = parseFloat(styImg.top);
                var imgW = parseFloat(styImg.width);
                var imgH = parseFloat(styImg.height);

                ctx.drawImage(domImg, imgX, imgY, imgW, imgH);
            }
        }
	}
});