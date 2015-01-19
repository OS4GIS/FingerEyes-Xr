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
            target.dispatchEvent(eventObj);
        },

        // Event Name List
        UndoStateChanged: "undostatechanged",
        RedoStateChanged: "redostatechanged",
        MapScaleChanged: "mapscalechanged",
        MapViewChanged: "mapviewchanged",
        MapClick: "mapclick",
        EditCompleted: "editcompleted",
        LayerUpdateCompleted: "layerupdatecompleted"
        // .
    }
});