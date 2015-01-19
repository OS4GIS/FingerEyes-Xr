Xr.OperationHelper = Xr.Class({
    name: "OperationHelper",

    statics: {
        createXMLHttpObject: function() {
            var xhr = null;
	
            if(window.XMLHttpRequest) xhr = new XMLHttpRequest();
            else xhr = new ActiveXObject("Microsoft.XMLHTTP");
	
            return xhr;
        },
		
        // ASCII 코드값에서만 의미가 있음
        stringFromDataView: function (dataview, offset, length) {
            var array = new Array();

            for (var i = 0; i < length; ++i) {
                array[i] = dataview.getUint8(offset + i);
            }

            return String.fromCharCode.apply(null, array);
        },

        stringUTF8: function (dataview, offset, length) {
            var s = '';

            for (var i = 0, c; i < length;) {
                c = dataview.getUint8(offset + i++);
                s += String.fromCharCode(
                    c > 0xdf && c < 0xf0 && i < length - 1
                        ? (c & 0xf) << 12 | (dataview.getUint8(offset + i++) & 0x3f) << 6 | dataview.getUint8(offset + i++) & 0x3f
                    : c > 0x7f && i < length
                        ? (c & 0x1f) << 6 | dataview.getUint8(offset + i++) & 0x3f
                    : c
                );
            }

            return s;
        },
		
        trim: function(str) {
            str = str.replace(/^\s+/, '');
            for (var i = str.length - 1; i > 0; i--) {
                if (/\S/.test(str.charAt(i))) {
                    str = str.substring(0, i + 1);
                    break;
                }
            }
			
            return str;
        },

        xmlFromString: function (xmlStr) {
            var parseXml;

            if (window.DOMParser) {
                var dp = new window.DOMParser();
                return dp.parseFromString(xmlStr, "text/xml");
            } else if (typeof window.ActiveXObject != "undefined" && new window.ActiveXObject("Microsoft.XMLDOM")) {
                var xmlDoc = new window.ActiveXObject("Microsoft.XMLDOM");
                xmlDoc.async = "false";
                xmlDoc.loadXML(xmlStr);

                return xmlDoc;
            }

            return null;
        },

        /* boolean */ containsInArray: function (/* Array */ array, /* object */ item) {
            var cnt = array.length;
            for (var i = 0; i < cnt; i++) {
                if (array[i] === item) {
                    return true;
                }
            }

            return false;
        },

        /* Array Of PointD */ copyArrayOfPointD: function (/* array */ array) {
            var cntPts = array.length;
            var result = [];

            for (var i = 0; i < cntPts; i++) {
                result.push(array[i].clone());
            }

            return result;
        },

        /* number */ valueFromPx: function(/* string(ex: 100px) */ s) {
            var idx = s.indexOf("px");

            if (idx > -1) {
                s = s.substring(0, idx);
            }

            return parseFloat(s);
        },

        /* PointD */ offsetXY: function (/* MouseEvent */ e) {
            var rect = e.target.getBoundingClientRect();
            return new Xr.PointD(e.clientX - rect.left, e.clientY - rect.top);
        }
	}
});


