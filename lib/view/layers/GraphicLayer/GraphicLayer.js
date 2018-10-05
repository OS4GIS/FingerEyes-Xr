Xr.layers = Xr.layers || {};

/**  
 * @classdesc 지도 위에 다양한 그래픽 요소를 매쉬업(Mashup)하고 편집할 수 있는 그래픽 레이어에 대한 클래스입니다.
 * @class
 * @param {String} name - 레이어의 이름으로 고유한 ID 값
 * @copyright GEOSERVICE.CO.KR
 * @license LGPL
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
        this._svg.style.top = 0;
        this._svg.style.left = 0;
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

        connect: function (/* CoordMapper */ coordMapper, /* optional function */ callbackFunction) {
            this._coordMapper = coordMapper;

            if (callbackFunction) {
                callbackFunction(caller);
            }
        },

        refresh: function() {
            this.update(this._coordMapper);
        },

        addRowFromJSON: function (/* int */ id, /* JSON Object */ item) {
            var arrayToPointDArray = function (/* array of array */ pts) {
                var result = [];
                var cntItems = pts.length;
                for (var i = 0; i < cntItems; i++) {

                    var item = pts[i];
                    var cntPts = item.length;
                    var partArray = [];
                    for (var j = 0; j < cntPts; j++) {
                        var pt = item[j];
                        partArray.push(new Xr.PointD(pt.x, pt.y));
                    }

                    result.push(partArray);
                }

                return result;
            };

            var copyToObject = function (props, gr) {
                for (var prop in props) {
                    if (prop !== "metadata" && prop !== "map") {
                        var value = props[prop];
                        if (value === null) continue;

                        if (typeof value === "number" || typeof value === "string") {
                            gr[prop] = value;
                        } else if (value instanceof Array) {
                            gr[prop] = arrayToPointDArray(value);
                        } else if (typeof value === "object") {
                            copyToObject(value, gr[prop]);
                        }
                    }
                }
            };

            var metadata = item.metadata;
            //var mbr = mapInfos[item.map - 1].mbr;
            var row = null;

            if (metadata.type === "Rectangle") {
                row = new Xr.data.RectangleGraphicRow(id, new Xr.data.RectangleShapeData(new Xr.MBR()));
            } else if (metadata.type === "Ellipse") {
                row = new Xr.data.EllipseGraphicRow(id, new Xr.data.EllipseShapeData(new Xr.MBR()));
            } else if (metadata.type === "Point") {
                row = new Xr.data.PointGraphicRow(id, new Xr.data.PointShapeData(new Xr.PointD(0, 0)));

                if (metadata.subtype === "Rectangle") {
                    var penSymbol = new Xr.symbol.PenSymbol();
                    var brushSymbol = new Xr.symbol.BrushSymbol();

                    row.markerSymbol(new Xr.symbol.RectangleMarkerSymbol(penSymbol, brushSymbol));
                } else if (metadata.subtype === "Ellipse") {
                    var penSymbol = new Xr.symbol.PenSymbol();
                    var brushSymbol = new Xr.symbol.BrushSymbol();

                    row.markerSymbol(new Xr.symbol.CircleMarkerSymbol(penSymbol, brushSymbol));
                } else if (metadata.subtype === "Image") {
                    row.markerSymbol(new Xr.symbol.ImageMarkerSymbol({}));
                }
            } else if (metadata.type === "Polyline") {
                row = new Xr.data.PolylineGraphicRow(id, new Xr.data.PolylineShapeData([[]]));
            } else if (metadata.type === "Polygon") {
                row = new Xr.data.PolygonGraphicRow(id, new Xr.data.PolygonShapeData([[]]));
            } else if (metadata.type === "Text") {
                row = new Xr.data.TextGraphicRow(id, new Xr.data.TextShapeData({ x: 0, y: 0, text: "" }));
            }

            if (row) {
                //var _mbr = item._graphicData._mbr;
                //mbr.append(new Xr.MBR(_mbr.minX, _mbr.minY, _mbr.maxX, _mbr.maxY));
                copyToObject(item, row);
                this.add(row);
            }
        },

        /* boolean */ hilighting: function (/* int */ id, /* optional float */ delay, /* optinal int */ repeatCount) {
            var element = this.container().getElementById(this.name() + id);
            
            if (element) {
                // Old
                /*
                var sty = element.style;
                sty.animationDuration = "0.2s";

                if (delay) {
                    sty.animationDuration = delay + "s";
                }

                sty.animationIterationCount = 10;
                sty.animationDirection = "alternate";
                sty.animationName = "kf_hilighting";
                */

                // New
                //=========================================
                var newone = element.cloneNode(true);

                if (delay) {
                    newone.style.animationDuration = delay + "s";
                } else {
                    newone.style.animationDuration = "0.2s";
                }

                if (repeatCount) {
                    newone.style.animationIterationCount = repeatCount;
                } else {
                    newone.style.animationIterationCount = 7;
                }

                newone.style.animationDirection = "alternate";
                newone.style.animationName = "kf_hilighting";

                element.parentNode.replaceChild(newone, element);
                //=========================================

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
                if (container.style.display != "block") container.style.display = "block"

                var childNode;

                if (mouseAction == Xr.MouseActionEnum.MOUSE_DOWN) {
                    //.
                } else if (mouseAction == Xr.MouseActionEnum.MOUSE_DRAG) {
                    /* //!
                    var cntChildNodes = childNodes.length;

                    for (var i = 0; i < cntChildNodes; i++) {
                        childNode = childNodes[i];
                        childNode.setAttribute("transform", "translate(" + offsetX + "," + offsetY + ")");
                    }*/
                    
                    container.style.top = offsetY + "px"; //!
                    container.style.left = offsetX + "px"; //!
                } else {
                    container.style.top = 0; //!
                    container.style.left = 0; //!

                    var viewMBR = coordMapper.viewportMBR();
                    this._removeAllChildNode();
                    var row, rowMBR, childSvg;
                    var graphicRows = this.rowSet().rows();
                    var lyrName = this.name();

                    for (var id in graphicRows) {
                        row = graphicRows[id];
                        rowMBR = row.MBR(coordMapper, container);

                        if (coordMapper.intersectMBR(rowMBR, viewMBR)) {
                            childSvg = row.appendSVG(coordMapper, container);
                            childSvg.id = lyrName + id;

                            var titleSVG = row.titleSVG(coordMapper, row.graphicData().representativePoint());
                            if (titleSVG) {
                                childSvg.appendChild(titleSVG);
                            }
                        }
                    }

                    var mapContainer = container.parentNode;
                    if (mapContainer) {
                        var e = Xr.Events.create(Xr.Events.LayerUpdateCompleted, { layerName: lyrName });
                        Xr.Events.fire(mapContainer, e);
                    }

                }
            } else { // Need not draw
                if (container.style.display != "none") container.style.display = "none";
                this._removeAllChildNode();
            }
        },

        _removeAllChildNode: function () {
            /*
            var container = this._svg;
            var childNodes = container.childNodes;
            var cntChildNodes = childNodes.length;
            var childNode;

            for (var i = 0; i < cntChildNodes; i++) {
                childNode = childNodes[0];
                container.removeChild(childNode);
            }
            */
            var svg = this._svg;
            while (svg.lastChild) {
                svg.removeChild(svg.lastChild);
            }
        },

        release: function () {
            this.reset();
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

            if (child) {
                container.removeChild(child);
            }
        },

        reset: function() {
            this.removeAll();
        },

        /* int */ count: function() {
            return this._rowSet.count();
        },

        /* MBR */ MBR: function () {
            return this._mbr;
        },

        needRendering: function (mapScale) {
            return this.visibility().needRendering(mapScale);
        },

        /* boolean */ conneted: function () {
            return this._connected;
        },

        /* ShapeRowSet */ rowSet: function () {
            return this._rowSet;
        },

        /* boolean */ add: function (/* GraphicRow */ row) {
            return this._rowSet.add(row);
        },

        /* GraphicRow */ row: function(/* int */ id) {
            var graphicRows = this.rowSet().rows();
            return graphicRows[id];
        },

        /* Array */ IdByMousePoint: function (/* number*/ mouseX, /* number */ mouseY, /* boolean */ bOnlyOne) {
            var result = new Array();
            var cm = this._coordMapper;
            //var coord = cm.V2W(mouseX, mouseY);
            //var container = this._svg;
            var graphicRows = this.rowSet().rows();
            var PointGraphicRowClass = Xr.data.PointGraphicRow;

            for (var id in graphicRows) {
                row = graphicRows[id];

                if (row instanceof PointGraphicRowClass) {
                    if (row.hitTest(mouseX, mouseY, cm)) {
                        result.push(id);
                        if (bOnlyOne) return result;
                    }
                }
            }

            var PolylineGraphicRowClass = Xr.data.PolylineGraphicRow;
            for (var id in graphicRows) {
                row = graphicRows[id];

                if (!(row instanceof PointGraphicRowClass) && row instanceof PolylineGraphicRowClass) {
                    if (row.hitTest(mouseX, mouseY, cm)) {
                        result.push(id);
                        if (bOnlyOne) return result;
                    }
                }
            }

            var PolygonGraphicRowClass = Xr.data.PolygonGraphicRow;
            for (var id in graphicRows) {
                row = graphicRows[id];

                if (!(row instanceof PointGraphicRowClass) && !(row instanceof PolylineGraphicRowClass)) {
                    if (row.hitTest(mouseX, mouseY, cm)) {
                        result.push(id);
                        if (bOnlyOne) return result;
                    }
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
        },

        drawOnCanvas: function (/* canvas DOM */ canvas) {
            var ctx = canvas.getContext("2d");
            var domSvg = this.container();
            var svgString = new XMLSerializer().serializeToString(domSvg);
            var img = new Image();

            img.onload = function (img) {
                return function () {
                    ctx.drawImage(img, 0, 0);
                };
            }(img);

            var coordMapper = this.coordMapper();
            var viewMBR = coordMapper.viewportMBR();
            var graphicRows = this.rowSet().rows();

            for (var id in graphicRows) {
                row = graphicRows[id];
                rowMBR = row.MBR(coordMapper, domSvg);

                if (coordMapper.intersectMBR(rowMBR, viewMBR)) {
                    if (row instanceof Xr.data.PointGraphicRow) {
                        var markerSym = row.markerSymbol();
                        if (markerSym instanceof Xr.symbol.ImageMarkerSymbol) {
                            var point = row.graphicData().data();
                            var vp = coordMapper.W2V(point);
                            var w = markerSym.width();
                            var h = markerSym.height();

                            ctx.drawImage(markerSym.image(), vp.x - (w / 2), vp.y - (h / 2), w, h);
                        }
                    }
                }
            }

            //img.setAttribute("crossOrigin", "anonymous");
            img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgString)));
        }
    }
});