Xr.layers = Xr.layers || {};

/**  
 * @classdesc 지도 위에 다양한 그래픽 요소를 매쉬업(Mashup)하고 편집할 수 있는 그래픽 레이어에 대한 클래스입니다.
 * @class
 * @param {String} name - 레이어의 이름으로 고유한 ID 값
 * @copyright GEOSERVICE.CO.KR
 * @license GPL
 */
Xr.layers.GraphicLayer = Xr.Class({
    name: "GraphicLayer",
    extend: Xr.layers.Layer,
    requires: [Xr.layers.ILayer, Xr.edit.ISnap],

    construct: function (name) {
        //this.superclass(name, connectionString);
        Xr.layers.Layer.call(this, name, undefined);

        this._svg = document.createElementNS(Xr.CommonStrings.SVG_NAMESPACE, "svg");
        this._svg.style.position = "absolute";
        this._svg.style.top = "0px";
        this._svg.style.left = "0px";
        this._svg.style.width = "100%";
        this._svg.style.height = "100%";
        this._svg.style.overflow = "hidden";
        this._svg.style.setProperty("pointer-events", "none");

        this._rowSet = new Xr.data.GraphicRowSet(this);
        this._mbr = undefined;
        this._connected = true; // GraphicLayer connected status is always true;

        this._coordMapper = undefined;
    },

    methods: {
        /* SVG */ container: function () {
            return this._svg;
        },

        connect: function (/* CoordMapper */ coordMapper) {
            this._coordMapper = coordMapper;
        },

        refresh: function() {
            this.update(this._coordMapper);
        },

        /* boolean */ hilighting: function (/* int */ id, /* optional float */ delay) {
            var element = this.container().getElementById(this.name() + id);
            if (element) {
                element.style.animationDuration = "0.2s";

                if (delay) {
                    element.style.animationDuration = delay + "s";
                }

                element.style.animationIterationCount = 10;
                element.style.animationDirection = "alternate";
                element.style.animationName = "kf_hilighting";
                return true;
            } else {
                return false;
            }
        },

        update: function (/* CoordMapper */ coordMapper, /* MouseAction enum */ mouseAction, /* number */ offsetX, /* number */ offsetY) {
            var mapScale = coordMapper.mapScale();
            //if (isNaN(mapScale)) return;

            var container = this._svg;
            var childNodes = container.childNodes;

            if (this.visibility().needRendering(mapScale)) {
                var childNode;

                if (mouseAction == Xr.MouseActionEnum.MOUSE_DOWN) {
                    //.
                } else if (mouseAction == Xr.MouseActionEnum.MOUSE_DRAG) {
                    //var graphicRows = this.rowSet().rows();
                    var cntChildNodes = childNodes.length;

                    for (var i = 0; i < cntChildNodes; i++) {
                        childNode = childNodes[i];
                        childNode.setAttribute("transform", "translate(" + offsetX + "," + offsetY + ")");
                    }
                } else {
                    var viewMBR = coordMapper.viewportMBR();
                    this._removeAllChildNode();
                    var row, rowMBR, childSvg;
                    var graphicRows = this.rowSet().rows();
                    for (var id in graphicRows) {
                        row = graphicRows[id];
                        rowMBR = row.MBR(coordMapper, container);
                        if (coordMapper.intersectMBR(rowMBR, viewMBR)) {
                            childSvg = row.createSVG(coordMapper);
                            childSvg.id = this.name() + id;
                            container.appendChild(childSvg);
                        }
                    }

                    var mapContainer = this.container().parentNode;
                    if (mapContainer) {
                        var e = Xr.Events.create(Xr.Events.LayerUpdateCompleted, { layerName: this.name() });
                        Xr.Events.fire(mapContainer, e);
                    }

                }
            } else { // Need not draw
                this._removeAllChildNode();
            }
        },

        _removeAllChildNode: function() {
            var container = this._svg;
            var childNodes = container.childNodes;
            var cntChildNodes = childNodes.length;
            var childNode;

            for (var i = 0; i < cntChildNodes; i++) {
                childNode = childNodes[0];
                container.removeChild(childNode);
            }
        },

        removeAll: function() {
            this._rowSet.reset();
            this._removeAllChildNode();
        },

        remove: function(/* int */ id) {
            this._rowSet.remove(id);

            var svgId = this.name() + id;
            var container = this._svg;
            var child = container.getElementById(svgId);
            container.removeChild(child);

        },

        reset: function() {
            this.removeAll();
        },

        /* MBR */ MBR: function () {
            return this._mbr;
        },

        /* boolean */ conneted: function () {
            return this._connected;
        },

        /* ShapeRowSet */ rowSet: function () {
            return this._rowSet;
        },

        /* Array */ IdByMousePoint: function (/* number*/ mouseX, /* number */ mouseY, /* boolean */ bOnlyOne) {
            var result = new Array();
            var cm = this._coordMapper;
            //var coord = cm.V2W(mouseX, mouseY);
            //var container = this._svg;
            var graphicRows = this.rowSet().rows();
            for (var id in graphicRows) {
                row = graphicRows[id];
                if (row.hitTest(mouseX, mouseY, cm)) {
                    result.push(id);
                    if (bOnlyOne) break;
                }
            }

            return result;
        },

        /* PointD */ vertexSnap: function (/* PointD */ mapPt, /* number */ tol) {
            var graphicRows = this.rowSet().rows();
            var graphicRow = undefined;
            var graphicData = undefined;
            var result = undefined;

            for (var id in graphicRows) {
                graphicRow = graphicRows[id];
                graphicData = graphicRow.graphicData();
                result = graphicData.vertexSnap(mapPt, tol);
                if (result) break;
            }

            return result;
        },

        /* PointD */ edgeSnap: function (/* PointD */ mapPt, /* number */ tol) {
            var graphicRows = this.rowSet().rows();
            var graphicRow = undefined;
            var graphicData = undefined;
            var result = undefined;

            for (var id in graphicRows) {
                graphicRow = graphicRows[id];
                graphicData = graphicRow.graphicData();
                result = graphicData.edgeSnap(mapPt, tol);
                if (result) break;
            }

            return result;
        }
    }
});