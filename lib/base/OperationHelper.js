/**  
 * @classdesc 공통적으로 사용되는 유틸리티 함수를 제공하는 클래스입니다.
 * @class
 * @copyright [(주)지오서비스]{@link http://www.geoservice.co.kr}
 * @license LGPL
 */
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
            // [ToDo] 대체한 코드가 올바르게 작동하는지 검사가 필요함

            //*
            //var rect = e.target.getBoundingClientRect();
            //return new Xr.PointD(e.clientX - rect.left, e.clientY - rect.top);
            //*/

            return new Xr.PointD(e.offsetX, e.offsetY);
        },

        /* PointD */ screenXY: function (/* MouseEvent */ e) {
            //return new Xr.PointD(e.screenX, e.screenY);

            //WebBrowser의 Zoom을 변경하면 문제가 발생함에 따라 screenX,Y 대신 pageX,Y을 사용함 

            //console.log(e.screenX + " " + e.screenY + " , " + e.pageX + " " + e.pageY);

            return new Xr.PointD(e.pageX, e.pageY);
        },

        /* g SVG */ strokeTextSvg: function(/* int */ x, /* int */ y, /* String */ text, /* int */ textSize, /* String(#ffffff) */ txtColor, /* String(#ffffff) */ strokeColor, /* int */ strokeWidth, /* int */ rotateDegree) {
            var xmlns = Xr.CommonStrings.SVG_NAMESPACE;
            var g = document.createElementNS(xmlns, "g");
            var textSvg = document.createElementNS(xmlns, "text");

            textSvg.setAttribute("x", x);
            textSvg.setAttribute("y", y);
            textSvg.setAttribute("text-anchor", "middle");
	        textSvg.setAttribute("font-size", textSize);
	        textSvg.setAttribute("font-weight", "bold");
	        textSvg.setAttribute("font-family", "Arial");
            textSvg.setAttribute("fill", txtColor);

	        if(rotateDegree) {
	            textSvg.setAttribute("transform", "rotate(" + rotateDegree + " " + x + " " + y + ")");
            }

            textSvg.textContent = text;

	        var strokeSvg = textSvg.cloneNode(true);
	        strokeSvg.setAttribute("fill", "none");
	        strokeSvg.setAttribute("stroke", strokeColor);
	        strokeSvg.setAttribute("stroke-width", strokeWidth);
	        strokeSvg.setAttribute("stroke-opacity", "0.9");
	        strokeSvg.setAttribute("stroke-linecap", "round");
	        strokeSvg.setAttribute("stroke-linejoin", "round");

	        g.appendChild(strokeSvg);
	        g.appendChild(textSvg);

	        return g;
        },

        leadingZeros: function (/* int */ n, /* int */ digits) {
            var zero = '';
            n = n.toString();

            if (n.length < digits) {
                for (var i = 0; i < digits - n.length; i++)
                    zero += '0';
            }

            return zero + n;
        },

        highlightingDOM: function (dom) {
            var cl = dom.classList;

            if (!cl.contains("highlighting_dom_animation")) {
                cl.toggle("highlighting_dom_animation");

                setTimeout(function () {
                    cl.toggle("highlighting_dom_animation");
                }, 2000);
            }
        },

        uploadFile: function (args, /* File Seek Position, Do not specify value! */ start) {
            /*  
            var args = {
                server: "http://www.gisdeveloper.co.kr:8080",
                imageFile: imageFile,
                savedFileName: Date.now() + "." + imageFile.name.split('.').pop(),
                uploadDir: "CCTV_IMAGES",

                onCompleted: function () {
                    alert("completed");
                },

                onFailed: function () {
                    alert("failed");
                }
            };
            */

            if (!start) {
                start = 0;
            }

            if(!args.imageReader) {
                args.imageReader = new FileReader();
            }

            if (!args.server || !args.imageFile || !args.savedFileName || !args.uploadDir) return false;

            var slice_size = 1000 * 1024;
            var reader = args.imageReader;
            var file = args.imageFile;

            var next_slice = start + slice_size + 1;
            var blob = file.slice(start, next_slice);

            reader.onloadend = function (event) {
                if (event.target.readyState !== FileReader.DONE) {
                    return;
                }

                var base64Result = reader.result.substr(reader.result.indexOf(',') + 1);
                var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
                var url = args.server + "/Xr?upload|" + encodeURIComponent(args.uploadDir) + "|"
                    + encodeURIComponent(args.savedFileName) + "|" + start + "|" + base64Result.length + "|" + file.size;

                xhr.open("POST", url);

                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4) {
                        if (xhr.status === 200) {
                            var size_done = start + slice_size;
                            var percent_done = Math.floor((size_done / file.size) * 100);

                            if (next_slice < file.size) {
                                Xr.OperationHelper.uploadFile(args, next_slice);
                            } else {
                                if (args.onCompleted) {
                                    args.onCompleted();
                                }
                            }
                        } else {
                            if (args.onFailed) {
                                args.onFailed();
                            }
                        }
                    }
                };

                xhr.send(base64Result);
            };

            reader.readAsDataURL(blob);
        },

        isIE: function () {
            return (navigator.appName === 'Netscape' && navigator.userAgent.search('Trident') !== -1) ||
                navigator.userAgent.toLowerCase().indexOf("msie") !== -1;
        },

        createTextFile: function (/* string */ fileName, /* Array of string */ contents) {
            var blob = null;

            if (Xr.OperationHelper.isIE()) {
                blob = new Blob(contents, { type: "text/plain", endings: "native" });
                window.navigator.msSaveBlob(blob, fileName);
            } else {
                blob = new Blob(contents, { type: 'text/plain' });
                objURL = window.URL.createObjectURL(blob);

                // 이전에 생성된 메모리 해제
                if (window.__Xr_objURL_forCreatingFile__) {
                    window.URL.revokeObjectURL(window.__Xr_objURL_forCreatingFile__);
                }
                window.__Xr_objURL_forCreatingFile__ = objURL;

                var a = document.createElement('a');

                a.download = fileName;
                a.href = objURL;
                a.click();
            }
        }
    }
});