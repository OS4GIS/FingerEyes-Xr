Xr.layers = Xr.layers || {};

/**  
 * @classdesc WFSLayer가 공간 서버와 연결(Connection)을 맺기 위한 요청을 실행하는 클래스입니다.
 * @class
 * @param {String} urlHeader - 공간 서버와 연결을 위한 최종 URL을 구성하기 위한 시작 url
 * @param {String} typeName - 공간 서버로부터 연결하고자 하는 레이어 데이터에 대한 이름
 * @param {function} onCompleted - 공간 서버 연결이 성공할 경우 호출될 함수
 * @param {function} onFailed - 공간 서버 연결이 실패했을 때 호출될 함수
 * @copyright GEOSERVICE.CO.KR
 * @license LGPL
 */
Xr.layers.WFSConnectionRequest = Xr.Class({
    name: "WFSConnectionRequest",

    construct: function (/* String */ proxy, /* String */ urlHeader, /* String */ typeName, /* function */ onCompleted, /* function */ onFailed) {
        // example -> http://localhost:8080/OGC/test/ows?service=wfs&version=1.0.0&request=DescribeFeatureType&typeName=test:muan_bld

        var queryString = encodeURI("service=wfs&version=1.0.0&request=DescribeFeatureType&typeName=" + typeName);
        var url = urlHeader + "?" + queryString;

	    if (proxy != undefined) {
	        url = proxy + "?reqPrx|" + urlHeader + "|" + queryString;
	    }

	    this._xhr = Xr.OperationHelper.createXMLHttpObject();
		this._xhr.open("GET", url);

		var caller = this;
		this._xhr.onreadystatechange = function(evt) {
			if(caller._xhr.readyState == 4) {
			    if (caller._xhr.status == 200) {
			        var xml = null;

			        if (proxy != undefined) {//caller._bProxy) {
			            var text = caller._xhr.responseText;
			            xml = Xr.OperationHelper.xmlFromString(text.substring(0, text.length - 1));
			        } else {
			            xml = caller._xhr.responseXML;
			        }

				    caller._parsingData(xml);
					
					if(onCompleted) onCompleted();
				} else {
                    if (onFailed) onFailed();
                    else {
                        throw new Error("WFSConnectionRequest Error: " + url);
                        //alert("WFSConnectionRequest ERROR : " + url);
                    }
				}		
			}				
		}
	},

	methods: {
	    _parsingData: function (/* XML */ xml) {
	        var elems = xml.getElementsByTagName("xsd:sequence");
	        if (elems.length == 1) {
	            elems = elems[0].getElementsByTagName("xsd:element");
	            this._fieldSet = new Xr.data.FieldSet();
	            var cntElems = elems.length;
	            for (var iElem = 0; iElem < cntElems; ++iElem) {
	                var elem = elems[iElem];
	                var fieldName = elem.getAttribute("name");
	                var fieldType = elem.getAttribute("type");

	                if (fieldType.indexOf("gml:") != -1) { // geometry field
	                    this._vectorType = fieldType;
	                } else { // attribute field	               
	                    if (fieldType == "xsd:long" || fieldType == "xsd:int") fieldType = Xr.data.FieldType.INTEGER;
	                        //else if (fieldType == "xsd:?") fieldType = Xr.data.FieldType.SHORT;
	                        //else if (fieldType == "xsd:?") fieldType = Xr.data.FieldType.VERTSHORT;
	                        //else if (fieldType == "xsd:?") fieldType = Xr.data.FieldType.FLOAT;
	                    else if (fieldType == "xsd:double") fieldType = Xr.data.FieldType.DOUBLE;
	                    else if (fieldType == "xsd:string") fieldType = Xr.data.FieldType.STRING;
	                    else {
	                        alert("Not Supported Yet : " + fieldType);
	                        return;
	                    }

	                    var field = new Xr.data.Field(fieldName, fieldType);
	                    this._fieldSet.add(field);
	                }
	            }
	        }
		},
	
		vectorType: function() {
			return this._vectorType;
		},
				
		fieldCount: function () {
		    return this._fieldSet.size();
		},
	
		request: function() {
			this._xhr.send(null);
		},
		
		fieldSet: function() {
			return this._fieldSet;
		}	
	}
});