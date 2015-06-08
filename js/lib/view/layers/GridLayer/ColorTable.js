/**  
 * @classdesc 색상표(Color Table)을 쉽게 구성할 수 있는 유틸리티 클래스입니다.
 * @class
 * @param {int} countColors - 구성할 색상의 개수
 * @copyright GEOSERVICE.CO.KR
 * @license GPL
 */
Xr.ColorTable = Xr.Class({
    name: "ColorTable",

    construct: function (/* int */ countColors) {
        this._colors = new Array(countColors);
    },

    methods: {
        set: function (/* int */ index, /* int */ red, /* int */ green, /* int */ blue, /* int */ alpha) {
            this._colors[index] = {
                r: red,
                g: green,
                b: blue,
                a: alpha
            };
        },

        /* boolean */ build: function () {
            var idxs = new Array();
            var cntColors = this.size();

            if (cntColors < 2) return false;
            if (this._colors[0] == undefined || this._colors[cntColors-1] == undefined) return false;

            for (var i = 0; i < cntColors; i++) {
                var clr = this.color(i);
                if (clr) idxs.push(i);
            }

            var cntIdxs = idxs.length - 1;
            for (var i = 0; i < cntIdxs; i++) {
                var sIdx = idxs[i];
                var eIdx = idxs[i + 1];
                var sColor = this.color(sIdx);
                var eColor = this.color(eIdx);
                var deltaR = (eColor.r - sColor.r) / (eIdx - sIdx);
                var deltaG = (eColor.g - sColor.g) / (eIdx - sIdx);
                var deltaB = (eColor.b - sColor.b) / (eIdx - sIdx);
                var deltaA = (eColor.a - sColor.a) / (eIdx - sIdx);

                for (var s = (sIdx + 1) ; s < eIdx; s++) {
                    var preClr = this.color(s-1);
                    this.set(s, preClr.r + deltaR, preClr.g + deltaG, preClr.b + deltaB, preClr.a + deltaA);
                }
            }

            return true;
        },

        /* int */ size: function () {
            return this._colors.length;
        },

        /* int */ length: function() {
            return this._colors.length;
        },

        /* object */ color: function (/* int */ index) {
            return this._colors[index];
        },

        /* Array */ colors: function () {
            return this._colors;
        }
    }
});