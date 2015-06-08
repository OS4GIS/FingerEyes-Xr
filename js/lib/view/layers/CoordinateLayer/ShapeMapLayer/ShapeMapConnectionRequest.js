/**  
 * @desc layers 네임스페이스입니다. ShapeMapLayer, WMSLayer, WFSLayer, GraphicLayer, GridLayer, TMSLayer, TileMapLayer 등과 같은 클래스들이 담겨 있습니다.
 * @namespace
 * @copyright [(주)지오서비스]{@link http://www.geoservice.co.kr}
 * @license GPL
 */
Xr.layers = Xr.layers || {};

/**  
 * @classdesc ShapeMapLayer가 공간 서버와 연결(Connection)을 맺기 위한 요청을 실행하는 클래스입니다.
 * @class
 * @param {String} url - 공간 서버와 연결을 위한 URL
 * @param {function} onCompleted - 공간 서버 연결이 성공할 경우 호출될 함수
 * @param {function} onFailed - 공간 서버 연결이 실패했을 때 호출될 함수
 * @copyright GEOSERVICE.CO.KR
 * @license GPL
 */
Xr.layers.ShapeMapConnectionRequest = Xr.Class({
	name: "ShapeMapConnectionRequest",

	construct: function(url, onCompleted, onFailed) {
		this._xhr = Xr.OperationHelper.createXMLHttpObject();
		this._xhr.open("GET", url);
		this._xhr.responseType = "arraybuffer";

		var caller = this;
		this._xhr.onreadystatechange = function(evt) {
			if(caller._xhr.readyState == 4) {
				if(caller._xhr.status == 200) {
					var arrayBuffer = caller._xhr.response;
					
					caller._parsingData(arrayBuffer);
					
					if(onCompleted) onCompleted();
				} else {
					if(onFailed) onFailed();
					else alert("ShapeMapConnectionRequest ERROR : " + url);
				}		
			}				
		}
	},

	methods: {
		_parsingData: function(data) {
			var dataview = new DataView(data);	
			var TotalDataLength = dataview.getUint32(0, true); // true -> Little Endian
			var XrVVersion = dataview.getInt8(4);
			
			this._vectorType = dataview.getInt8(5);
			this._recordCount = dataview.getUint32(6, true);
			
			var mbrMinX = dataview.getFloat32(10, true);
			var mbrMinY = dataview.getFloat32(14, true);
			var mbrMaxX = dataview.getFloat32(18, true);
			var mbrMaxY = dataview.getFloat32(22, true);
			this._mbr = new Xr.MBR(mbrMinX, mbrMinY, mbrMaxX, mbrMaxY);
		
			var XrTVersion = dataview.getInt8(26);
			this._fieldCount = dataview.getUint32(27, true);
			
			this._fieldSet = new Xr.data.FieldSet();
			var cursor = 31;
			for(var iField=0; iField<this._fieldCount; ++iField) {
				var cFieldType = dataview.getInt8(cursor, true);
				cursor += 1;
				
				var fieldType;
				if(cFieldType == 73) fieldType = Xr.data.FieldType.INTEGER; // 'I'
				else if(cFieldType == 83) fieldType = Xr.data.FieldType.SHORT; // 'S'
				else if(cFieldType == 115) fieldType = Xr.data.FieldType.VERTSHORT; // 's' 
				else if(cFieldType == 70) fieldType = Xr.data.FieldType.FLOAT; // 'F' 
				else if(cFieldType == 68) fieldType = Xr.data.FieldType.DOUBLE; // 'D'
				else if(cFieldType == 88) fieldType = Xr.data.FieldType.STRING; // 'X'
				
				var fieldNameLength = dataview.getInt8(cursor, true);
				cursor += 1;

				var fieldName = Xr.OperationHelper.stringFromDataView(dataview, cursor, fieldNameLength-1);
				cursor += fieldNameLength;
				
				var field = new Xr.data.Field(fieldName, fieldType);
				this._fieldSet.add(field);

				//console.log(fieldName);
			}			
		},
	
		vectorType: function() {
			return this._vectorType;
		},
		
		recordCount: function() {
			return this._recordCount;
		},
		
		MBR: function() {
			return this._mbr;
		},
		
		fieldCount: function() {
			return this._fieldCount;
		},
	
		request: function() {
			this._xhr.send(null);
		},
		
		fieldSet: function() {
			return this._fieldSet;
		}	
	}
});