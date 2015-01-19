Xr.layers = Xr.layers || {};

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
				var scale = level.getElementsByTagName("Scale")[0].childNodes[0].nodeValue;
				var unitsPerPixel = level.getElementsByTagName("UnitsPerPixel")[0].childNodes[0].nodeValue;;
				var tileMapWidth = level.getElementsByTagName("TileMapWidth")[0].childNodes[0].nodeValue;
				var tileMapHeight = level.getElementsByTagName("TileMapHeight")[0].childNodes[0].nodeValue;
				var minX = level.getElementsByTagName("MinX")[0].childNodes[0].nodeValue;
				var minY = level.getElementsByTagName("MinY")[0].childNodes[0].nodeValue;
				var rows = level.getElementsByTagName("Rows")[0].childNodes[0].nodeValue;
				var columns = level.getElementsByTagName("Columns")[0].childNodes[0].nodeValue;
			
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