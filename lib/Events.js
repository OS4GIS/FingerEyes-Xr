﻿/**  
 * @classdesc 이벤트의 등록 및 FingerEyes-Xr에서 사용하는 이벤트 종류에 대한 정보를 담고 있는 정적 클래스입니다. 
 * @class
 * @copyright GEOSERVICE.CO.KR
 * @license LGPL
 */
Xr.Events = Xr.Class({
    name: "Events",
    statics: {
        create: function(/* String */ eventName, /* object */ data, /* boolean */ bubbleable, /* boolean */ cancelable) {
            var e = document.createEvent("Event");

            for (var p in data) {
                if (data.hasOwnProperty(p)) {
                    e[p] = data[p];
                }
            }

            e.initEvent(eventName,
                bubbleable == undefined ? false : bubbleable,
                cancelable == undefined ? false : cancelable);

            return e;
        },

        fire: function(/* object */ target, /* Event object */ eventObj) {
            return target.dispatchEvent(eventObj);
        },

        // Event Name List
        MapScaleChanged: "mapscalechanged",
        MapViewChanged: "mapviewchanged",

        MapClick: "mapclick",
        MapMouseDown: "mapmousedown",

        EditingCompleted: "editingcompleted",
        EditingSelectionChanged: "editingselectionchanged",
        UndoStateChanged: "undostatechanged",
        RedoStateChanged: "redostatechanged",
        UndoActionCompleted: "undoactioncompleted",
        RedoActionCompleted: "redoactioncompleted",

        LayerUpdateCompleted: "layerupdatecompleted",
        InfoWindowClosed: "infowindowclosed",

        // for LiveTextObjectGraphicRow
        LiveGraphicRowRequestError: "livegraphicrowrequesterror",
        LiveGraphicRowRequestCompleted: "livegraphicrowrequestcompeted"
        // .
    }
});