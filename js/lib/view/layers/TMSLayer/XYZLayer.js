Xr.layers = Xr.layers || {};

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
		        for (var iImg = (imgs.length - 1) ; iImg >= 0; iImg--) {
		            imgs[iImg].candidateBeDeleted = true;
		        }

		        var viewportMBR = coordMapper.viewportMBR();
		        var nPiramid = this._getOptimizePiramidIndex(coordMapper);
		        var piramid = this._levelDataList[nPiramid];
		        if (!piramid) return;

		        var mbrOfPiramid = new Xr.MBR(piramid.minX(), piramid.minY(), piramid.maxX(), piramid.maxY());

		        if (coordMapper.intersectMBR(mbrOfPiramid, viewportMBR)) {
		            var LeftDownColumn = parseInt((viewportMBR.minX - mbrOfPiramid.minX) / piramid.tileMapWidth());

		            var LeftDownRow;
		            if (this._bReversedRows) LeftDownRow = parseInt((mbrOfPiramid.maxY - viewportMBR.maxY) / piramid.tileMapHeight());
		            else LeftDownRow = parseInt((viewportMBR.minY - mbrOfPiramid.minY) / piramid.tileMapHeight());

		            var RightUpColumn = parseInt((viewportMBR.maxX - mbrOfPiramid.minX) / piramid.tileMapWidth());

		            var RightUpRow;
		            if (this._bReversedRows) RightUpRow = parseInt((mbrOfPiramid.maxY - viewportMBR.minY) / piramid.tileMapHeight());
		            else RightUpRow = parseInt((viewportMBR.maxY - mbrOfPiramid.minY) / piramid.tileMapHeight());

		            LeftDownRow--; RightUpRow++;
		            LeftDownColumn--; RightUpColumn++;

		            for (var iRow = RightUpRow; iRow >= LeftDownRow; iRow--) {
		                for (var iColumn = LeftDownColumn; iColumn <= RightUpColumn; ++iColumn) {
		                    if (iRow < 0 || iColumn < 0 || iRow > (piramid.rows - 1) || iColumn > (piramid.columns() - 1)) continue;

		                    var bCreateNewImage = true;
		                    var oldImg;

		                    for (var iImg = (imgs.length - 1) ; iImg >= 0; iImg--) {
		                        oldImg = imgs[iImg];

		                        if (oldImg.nPiramid == nPiramid && oldImg.nRow == iRow && oldImg.nColumn == iColumn) {
		                            oldImg.candidateBeDeleted = false;
		                            bCreateNewImage = false;
		                            break;
		                        }
		                    }

		                    var newImg;

		                    if (bCreateNewImage) {
		                        //!newImg = document.createElement("div");
		                        newImg = document.createElement("img"); //!
		                        newImg.style.position = "absolute";
		                        //newImg.style.setProperty("pointer-events", "none");
		                        //newImg.style.setProperty("user-select", "none");
		                        newImg.style.border = "none";

		                        newImg.setAttribute("class", "tilemap");
		                        //newImg.setAttribute("unselectable", "on");

		                        this._nextRequestUrlIndex = (++this._nextRequestUrlIndex) % this._urls.length;
		                        var url = this._urls[this._nextRequestUrlIndex].replace("${z}", nPiramid + 1)
								    .replace("${y}", iRow).replace("${x}", iColumn);
		                        newImg.setAttribute("src", url); //!
		                        //!newImg.style.setProperty("background-image", "url(" + url + ")");
		                        //!newImg.style.setProperty("background-size", "100%");
		                        //!newImg.style.setProperty("transform-origin", "0 0");
		                        //!newImg.style.setProperty("background-repeat", "no-repeat");

		                        newImg.style.animationDuration = "0.6s";
		                        newImg.style.animationName = "kf_tileMapShowing";

		                        newImg.nPiramid = nPiramid;
		                        newImg.nRow = iRow;
		                        newImg.nColumn = iColumn;
		                        newImg.candidateBeDeleted = false;

		                        div.appendChild(newImg);
		                    } else {
		                        newImg = oldImg;
		                    }

		                    newImg.style.setProperty("-webkit-transform-origin", "0px 0px");
		                    newImg.style.setProperty("-webkit-transform", "rotate(" + coordMapper.rotationAngle() + "deg)");

		                    newImg.style.setProperty("transform-origin", "0px 0px");
		                    newImg.style.setProperty("transform", "rotate(" + coordMapper.rotationAngle() + "deg)");


		                    /*@!
						    var tileMinX = piramid.getMinX() + iColumn * piramid.getTileMapWidth();
						    var tileMinY = piramid.getMinY() + iRow * piramid.getTileMapHeight();
						    var tileMaxX = tileMinX + piramid.getTileMapWidth();
						    var tileMaxY = tileMinY + piramid.getTileMapHeight();

						    var tileMBR = new Xr.MBR(tileMinX, tileMinY, tileMaxX, tileMaxY);
				            */

		                    var wPtLT;
		                    if (this._bReversedRows) {
		                        wPtLT = new Xr.PointD(piramid.minX() + iColumn * piramid.tileMapWidth(), mbrOfPiramid.maxY - piramid.tileMapHeight() * iRow);
		                        wPtRT = new Xr.PointD(piramid.minX() + piramid.tileMapWidth() * (iColumn + 1), piramid.maxY() - piramid.tileMapHeight() * (iRow));
		                        wPtRB = new Xr.PointD(piramid.minX() + iColumn * piramid.tileMapWidth() + piramid.tileMapWidth(), mbrOfPiramid.maxY - piramid.tileMapHeight() * (iRow + 1));
		                    } else {
		                        wPtLT = new Xr.PointD(piramid.minX() + iColumn * piramid.tileMapWidth(), piramid.minY() + (iRow + 1) * piramid.tileMapHeight());
		                        wPtRT = new Xr.PointD(piramid.minX() + piramid.tileMapWidth() * (iColumn + 1), piramid.minY() + piramid.tileMapHeight() * (iRow + 1));
		                        wPtRB = new Xr.PointD(piramid.minX() + (iColumn + 1) * piramid.tileMapWidth(), piramid.minY() + iRow * piramid.tileMapHeight());
		                    }

		                    var vPtLT = coordMapper.W2V(wPtLT);
		                    var vPtRT = coordMapper.W2V(wPtRT);
		                    var vPtRB = coordMapper.W2V(wPtRB);

		                    newImg.style.top = Math.floor(vPtLT.y);// + "px";
		                    newImg.style.left = Math.floor(vPtLT.x);// + "px";

		                    newImg.style.width = Math.ceil(Math.sqrt(Math.pow(vPtLT.x - vPtRT.x, 2.0) + Math.pow(vPtLT.y - vPtRT.y, 2.0)));// + "px";
		                    newImg.style.height = Math.ceil(Math.sqrt(Math.pow(vPtRT.x - vPtRB.x, 2.0) + Math.pow(vPtRT.y - vPtRB.y, 2.0)));// + "px";

		                    //console.log(newImg.style.width + " x " + newImg.style.height);
		                }
		            }

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