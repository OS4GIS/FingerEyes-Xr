(function () {
    // 자바스크립트 압축 시 'Xr.min.1.0.js' 문자열을 확인해야함
    var r = new RegExp("(^|(.*?\\/))(Xr.min.1.0.js)(\\?|$)"),
    	s = document.getElementsByTagName('script'),
       	src, m, l = "";

    for (var i = 0, len = s.length; i < len; i++) {
        src = s[i].getAttribute('src');
        if (src) {
            m = src.match(r);
            if (m) {
                l = m[1];
                break;
            }
        }
    }

    
    // 자바스크립트 압축 시 CSS 추가를 위해 필요한 코드
    document.write("<link rel='stylesheet' type='text/css' href='" + l + "Xr.1.0.css'>");
	window.__XR_CLASS_LOADING_TIME__ = "XrClassLoadingTime",

	window.Xr = 
	{
		LICENSE: 'LGPL',
		VERSION: '1.0',

		DEVELOPERS: 
		[
			{ name: 'Kim Hyoung-Jun', nickName: 'Dip2K', eMail: 'hjkim@geoservice.co.kr', homepage: 'www.gisdeveloper.co.kr' }
		],
		
		Class: function(x) {
			var classname = x.name;

			var superclass = x.extend || Object;
			var constructor = x.construct || function() {};
			var methods = x.methods || {};
			var statics = x.statics || {};
			var requires = x.requires || [];
			
			var proto = new superclass(__XR_CLASS_LOADING_TIME__);

			for(var p in proto) if(proto.hasOwnProperty(p)) delete proto[p];

			proto.constructor = constructor;
			proto.superclass = superclass;
			proto.classname = classname; 
			constructor.prototype = proto;

			for (var p in methods) {
			    proto[p] = methods[p];
			}

			for (var p in statics) constructor[p] = statics[p];

			for(var i=0; i<requires.length; i++) {
				var c = requires[i];
				for(var p in c.prototype) {
					if(typeof c.prototype[p] != "function" || p == "constructor" || p == "superclass") continue;

					if(p in proto && typeof proto[p] == "function" && proto[p].length == c.prototype[p].length) continue;

				    //자바스크립트 압축 시 아래의 코드에서 에러가 발생하므로 주석 처리함
					//throw new Error(classname + " class requires " + p + " method.");
				}
			} 

			return constructor;
		} 
	};

	window.Xr.rasterOperatorsPath = l + "rasterOperators/"
})();
