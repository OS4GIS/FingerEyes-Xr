﻿Xr.layers = Xr.layers || {};

/**  
 * @classdesc 레이어가 반드시 구현해야 하는 매서드를 담고 있는 인터페이스입니다. 
 * @interface
 * @copyright GEOSERVICE.CO.KR
 * @license LGPL
 */
Xr.layers.ILayer = Xr.Class({
    name: "ILayer",

    methods: {
        container: function() { return null; },
        connect: function (coordMapper, /* optional function */ callbackFunction) { return false; },
        update: function(coordMapper, mouseAction, offsetX, offsetY) { return false; },
        MBR: function() { return null; },
        conneted: function () { return false; },
        release: function () { },
        needRendering: function (mapScale) { return false; },
        drawOnCanvas: function (/* canvas DOM */ canvas) { }
	}
});


