Xr.Visibility = Xr.Class({
    name: "Visibility",

    construct: function () {
        this._bVisibleByScale = false;
        this._bVisible = true;
        this._fromScale = 0;
        this._toScale = Number.MAX_VALUE;
    },

    methods: {
        /* void / boolean */ visible: function (/* optional boolean */ bVisible) {
            if (arguments.length == 0) {
                return this._bVisible;
            } else {
                this._bVisible = bVisible;
            }
        },

        /* void / boolean */ visibleByScale: function (/* optional boolean */ bUse) {
            if (arguments.length == 0) {
                return this._bVisibleByScale;
            } else {
                this._bVisibleByScale = bUse;
            }
        },

        /* void / number */ fromScale: function (/* optional number */ v) {
            if (arguments.length == 0) {
                return this._fromScale;
            } else {
                this._fromScale = v;
            }
        },

        /* void / number */ toScale: function (/* optional number */ v) {
            if (arguments.length == 0) {
                return this._toScale;
            } else {
                this._toScale = v;
            }
        },

        /* void / boolean */ needRendering: function (/* optional number optional */ scale) {
            if (arguments.length == 0) {
                return this._bVisible;
            }  else {
                if (this._bVisibleByScale) {
                    return this._bVisible && this._fromScale <= scale && this._toScale > scale;
                } else {
                    return this._bVisible;
                }
            }
        }
    }
});