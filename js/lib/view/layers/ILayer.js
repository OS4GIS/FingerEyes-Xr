Xr.layers = Xr.layers || {};

Xr.layers.ILayer = Xr.Class({
    name: "ILayer",

    methods: {
        container: function() { return null; },
        connect: function(coordMapper) { return false; },
        update: function(coordMapper, mouseAction, offsetX, offsetY) { return false; },
        MBR: function() { return null; },
        conneted: function () { return false; },
	}
});


