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
		
	construct: function(name, connectionString) {
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

		this._levelDataList = new Array();
		this._mbr = new Xr.MBR();
		this._connected = false;
		
		this._nextRequestUrlIndex = 0;
	},
 	
	methods: {
		container: function() {
			return this._div;
		},
		
		connect: function(coordMapper) {},
		
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

		_removeTileImages: function(bAll) {
			var div = this.container();
			
			var imgs = div.getElementsByClassName("tilemap");
			for(var iImg=(imgs.length-1); iImg>=0; iImg--) {
				var img = imgs[iImg];
				if(!bAll && !img.candidateBeDeleted) {
					continue;	
				}

				div.removeChild(img);
			}
		},

		update: function (coordMapper, mouseAction, offsetX, offsetY) {
		    var mapScale = coordMapper.mapScale();

		    if (this.visibility().needRendering(mapScale)) {
		        var div = this.container();

		        var imgs = div.getElementsByClassName("tilemap");
		        var imgsLength = imgs.length;

		        for (var iImg = (imgsLength - 1) ; iImg >= 0; iImg--) {
		            imgs[iImg].candidateBeDeleted = true;
		        }

		        var viewportMBR = coordMapper.viewportMBR();
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

		        if (coordMapper.intersectMBR(mbrOfPiramid, viewportMBR)) {
		            var LeftDownColumn = parseInt((viewportMBR.minX - mbrOfPiramid.minX) / piramidTileMapWidth);

		            var LeftDownRow;
		            if (this._bReversedRows) LeftDownRow = parseInt((mbrOfPiramid.maxY - viewportMBR.maxY) / piramidTileMapHeight);
		            else LeftDownRow = parseInt((viewportMBR.minY - mbrOfPiramid.minY) / piramidTileMapHeight);

		            var RightUpColumn = parseInt((viewportMBR.maxX - mbrOfPiramid.minX) / piramidTileMapWidth);

		            var RightUpRow;
		            if (this._bReversedRows) RightUpRow = parseInt((mbrOfPiramid.maxY - viewportMBR.minY) / piramidTileMapHeight);
		            else RightUpRow = parseInt((viewportMBR.maxY - mbrOfPiramid.minY) / piramidTileMapHeight);

		            LeftDownRow--; RightUpRow++;
		            LeftDownColumn--; RightUpColumn++;

		            var PointDClass = Xr.PointD;
		            var bRevRows = this._bReversedRows;
		            var piramidRows = piramid.rows;
		            var piramidCols = piramid.columns();
		            
		            for (var iRow = RightUpRow; iRow >= LeftDownRow; iRow--) {
		                for (var iColumn = LeftDownColumn; iColumn <= RightUpColumn; ++iColumn) {
		                    if (iRow < 0 || iColumn < 0 || iRow > (piramidRows - 1) || iColumn > (piramidCols - 1)) continue;

		                    var bCreateNewImage = true;
		                    var oldImg;

		                    for (var iImg = (imgsLength - 1) ; iImg >= 0; iImg--) {
		                        oldImg = imgs[iImg];

		                        if (oldImg.nPiramid == nPiramid && oldImg.nRow == iRow && oldImg.nColumn == iColumn) {
		                            oldImg.candidateBeDeleted = false;
		                            bCreateNewImage = false;
		                            break;
		                        }
		                    }

		                    var newImg;

		                    if (bCreateNewImage) {
		                        newImg = document.createElement("img");
		                        newImg.setAttribute("class", "tilemap");

		                        this._nextRequestUrlIndex = (++this._nextRequestUrlIndex) % this._urls.length;
		                        var url = this._urls[this._nextRequestUrlIndex].replace("${z}", nPiramid + 1)
								    .replace("${y}", iRow).replace("${x}", iColumn);
		                        newImg.setAttribute("src", url);

		                        newImg.nPiramid = nPiramid;
		                        newImg.nRow = iRow;
		                        newImg.nColumn = iColumn;
		                        newImg.candidateBeDeleted = false;

		                        div.appendChild(newImg);
		                    } else {
		                        newImg = oldImg;
		                    }

		                    var imgStyle = newImg.style;

		                    imgStyle.setProperty("-webkit-transform", "rotate(" + coordMapper.rotationAngle() + "deg)");
		                    imgStyle.setProperty("transform", "rotate(" + coordMapper.rotationAngle() + "deg)");

		                    //
						    //var tileMinX = piramid.getMinX() + iColumn * piramid.getTileMapWidth();
						    //var tileMinY = piramid.getMinY() + iRow * piramid.getTileMapHeight();
						    //var tileMaxX = tileMinX + piramid.getTileMapWidth();
						    //var tileMaxY = tileMinY + piramid.getTileMapHeight();
                            //
						    //var tileMBR = new Xr.MBR(tileMinX, tileMinY, tileMaxX, tileMaxY);
				            //

		                    var wPtLT;
		                    if (bRevRows) {
		                        wPtLT = new PointDClass(piramidMinX + iColumn * piramidTileMapWidth, mbrOfPiramid.maxY - piramidTileMapHeight * iRow);
		                        wPtRT = new PointDClass(piramidMinX + piramidTileMapWidth * (iColumn + 1), piramidMaxY - piramidTileMapHeight * (iRow));
		                        wPtRB = new PointDClass(piramidMinX + iColumn * piramidTileMapWidth + piramidTileMapWidth, mbrOfPiramid.maxY - piramidTileMapHeight * (iRow + 1));
		                    } else {
		                        wPtLT = new PointDClass(piramidMinX + iColumn * piramidTileMapWidth, piramidMinY + (iRow + 1) * piramidTileMapHeight);
		                        wPtRT = new PointDClass(piramidMinX + piramidTileMapWidth * (iColumn + 1), piramidMinY + piramidTileMapHeight * (iRow + 1));
		                        wPtRB = new PointDClass(piramidMinX + (iColumn + 1) * piramidTileMapWidth, piramidMinY + iRow * piramidTileMapHeight);
		                    }

		                    var vPtLT = coordMapper.W2V(wPtLT);
		                    var vPtRT = coordMapper.W2V(wPtRT);
		                    var vPtRB = coordMapper.W2V(wPtRB);

		                    imgStyle.top = (vPtLT.y);// + "px";
		                    imgStyle.left = (vPtLT.x);// + "px";

		                    imgStyle.width = (Math.sqrt(Math.pow(vPtLT.x - vPtRT.x, 2.0) + Math.pow(vPtLT.y - vPtRT.y, 2.0)));// + "px";
		                    imgStyle.height = (Math.sqrt(Math.pow(vPtRT.x - vPtRB.x, 2.0) + Math.pow(vPtRT.y - vPtRB.y, 2.0)));// + "px";

		                    console.log(newImg.style.width + " x " + newImg.style.height);
		                }
		            }
		            console.log("-------------------------------------------------------");

		            if (mouseAction == Xr.MouseActionEnum.NO_MOUSE) {
		                var that = this;
		                setTimeout(function () {
		                    that._removeTileImages(false);
		                }, 800);
		            } else {
		                this._removeTileImages(false);
		            }
		        }
		    } else {
		        this._removeTileImages(true);
		    }
		},
		
		MBR: function() {
			return this._mbr;
		},
		
		conneted: function() {
			return this._connected; 
		}
	}
});