Xr.layers = Xr.layers || {};

/**  
 * @classdesc 타일맵의 연결 요청을 위한 클래스입니다.
 * @class
 * @param {String} url - 연결 요청을 위한 url입니다.
 * @param {Array} levelDataList - {Xr.layers.TMSLevelData} 타입의 객체를 요소로 하는 배열 객체
 * @param {function} onCompleted - 공간 서버 연결이 성공할 경우 호출될 함수
 * @param {function} onFailed - 공간 서버 연결이 실패했을 때 호출될 함수
 * @copyright GEOSERVICE.CO.KR
 * @license LGPL
 */
Xr.layers.TMSConnectionRequest = Xr.Class({
	name: "TMSConnectionRequest",

	construct: function(url, levelDataList, bProxy, onCompleted, onFailed) {
	    //this._bProxy = bProxy;
	    this._xhr = Xr.OperationHelper.createXMLHttpObject();
		this._xhr.open("GET", url);

		this._levelDataList = levelDataList;

		var caller = this;
		this._xhr.onreadystatechange = function(evt) {
			if(caller._xhr.readyState == 4) {
			    if (caller._xhr.status == 200) {

			        var xml;
			        if (bProxy) {//caller._bProxy) {
			            var text = caller._xhr.responseText;
			            xml = Xr.OperationHelper.xmlFromString(text.substring(0, text.length-1));
			        } else {
			            xml = caller._xhr.responseXML;
			        }

			        caller._parsingXML(xml, levelDataList);
				
			        if (onCompleted) {
			            onCompleted();
			        }
				} else {
			        if (onFailed) {
			            onFailed();
			        } else {
			            alert("TMSConnectionRequest ERROR : " + url);
			        }
				}		
			}				
		};
	},
 	
	methods: {
		_parsingXML: function(xml, levelDataList) {
			var levels = xml.getElementsByTagName("Level");
		
			for(var iLevel=0; iLevel<levels.length; ++iLevel) {
				var level = levels[iLevel];
				var scale = parseFloat(level.getElementsByTagName("Scale")[0].childNodes[0].nodeValue);
				var unitsPerPixel = parseFloat(level.getElementsByTagName("UnitsPerPixel")[0].childNodes[0].nodeValue);
				var tileMapWidth = parseFloat(level.getElementsByTagName("TileMapWidth")[0].childNodes[0].nodeValue);
				var tileMapHeight = parseFloat(level.getElementsByTagName("TileMapHeight")[0].childNodes[0].nodeValue);
				var minX = parseFloat(level.getElementsByTagName("MinX")[0].childNodes[0].nodeValue);
				var minY = parseFloat(level.getElementsByTagName("MinY")[0].childNodes[0].nodeValue);
				var rows = parseInt(level.getElementsByTagName("Rows")[0].childNodes[0].nodeValue);
				var columns = parseInt(level.getElementsByTagName("Columns")[0].childNodes[0].nodeValue);
			
				var levelData = new Xr.layers.TMSLevelData(scale, unitsPerPixel, tileMapWidth, tileMapHeight, minX, minY, rows, columns);
				levelDataList[iLevel] = levelData;
				//alert(metadataList[iLevel].toString());
			}
		
			//alert("Total Levels Count = " + levelDataList.length);
		},
	
		request: function() {
			this._xhr.send(null);
		}	
	}
});