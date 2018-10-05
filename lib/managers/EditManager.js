/**  
 * @desc managers 네임스페이스입니다. 복합적인 연산 또는 기능과 연관된 클래스들에 대한 제어(Control) 및 관리를 위한 클래스를 담고 있습니다.
 * @namespace
 * @copyright [(주)지오서비스]{@link http://www.geoservice.co.kr}
 * @license LGPL
 */
Xr.managers = Xr.managers || {};

/**  
 * @classdesc 편집에 대한 기능을 관리하는 클래스입니다.
 * @class
 * @param {Xr.Map} map - 편집에 대한 기능을 사용자에게 제공하는 지도 객체
 * @copyright GEOSERVICE.CO.KR
 * @license LGPL
 */
Xr.managers.EditManager = Xr.Class({
    name: "EditManager",
    requires: [Xr.IMouseInteraction, Xr.IKeyboardInteraction],

    construct: function (map) {
        this._map = map;
        this._coordMapper = map.coordMapper();

        this._svg = document.createElementNS(Xr.CommonStrings.SVG_NAMESPACE, "svg");
        this._svg.style.position = "absolute";
        this._svg.style.top = "0px";
        this._svg.style.left = "0px";
        this._svg.style.width = "100%";
        this._svg.style.height = "100%";
        this._svg.style.overflow = "hidden";
        this._svg.style.setProperty("pointer-events", "none");

        this._sketch = undefined;
        this._targetGraphicLayer = undefined;
        this._editHistory = new Xr.edit.EditHistory(this);
        this._snapManager = new Xr.edit.SnapManager(this);
    },

    methods: {
        /* SnapManager */ snap: function() {
            return this._snapManager;
        },

        /* GraphicLayer */ targetGraphicLayer: function (/* optional GraphicLayer */ graphicLayer) {
            if (arguments.length == 1) {
                this._targetGraphicLayer = graphicLayer;
            } else {
                return this._targetGraphicLayer;
            }
        },

        history: function() {
            return this._editHistory;
        },

        coordMapper: function() {
            return this._map.coordMapper();
        },

        container: function () {
            return this._svg;
        },

        newPolyline: function (/* int */ id, /* optional boolean */ bMeasured) {
            if (this._map.userMode() == Xr.UserModeEnum.EDIT) {
                this.cancelSketch();

                var polylines = new Array();
                var polyline = new Array();

                polylines.push(polyline);

                if (!bMeasured) bMeasured = false;

                var shapeData = new Xr.data.PolylineShapeData(polylines);

                this._sketch = new Xr.edit.PolylineSketch(this, shapeData, id, true, bMeasured);

                return true;
            } else {
                return false;
            }
        },

        newPolygon: function (/* int */ id, /* optional boolean */ bMeasured) {
            if (this._map.userMode() == Xr.UserModeEnum.EDIT) {
                this.cancelSketch();

                var polygons = new Array();
                var polygon = new Array();
                polygons.push(polygon);

                if (!bMeasured) bMeasured = false;

                var shapeData = new Xr.data.PolygonShapeData(polygons, bMeasured);

                this._sketch = new Xr.edit.PolygonSketch(this, shapeData, id, true, bMeasured);

                return true;
            } else {
                return false;
            }
        },

        newEllipse: function (/* int */ id, /* optional boolean */ bMeasured) {
            if (this._map.userMode() == Xr.UserModeEnum.EDIT) {
                this.cancelSketch();

                var data = { cx: 0, cy: 0, rx: 0, ry: 0 };

                if (!bMeasured) bMeasured = false;

                var shapeData = new Xr.data.EllipseShapeData(data, bMeasured);

                this._sketch = new Xr.edit.EllipseSketch(this, shapeData, id, true, bMeasured);

                return true;
            } else {
                return false;
            }
        },


        newPoint: function (/* int */ id) {
            if (this._map.userMode() == Xr.UserModeEnum.EDIT) {
                this.cancelSketch();

                var wpt = new Xr.PointD();
                var shapeData = new Xr.data.PointShapeData(wpt);
                this._sketch = new Xr.edit.PointSketch(this, shapeData, id, true);

                return true;
            } else {
                return false;
            }
        },

        newText: function (/* int */ id /*, string txt */) {
            if (this._map.userMode() == Xr.UserModeEnum.EDIT) {
                this.cancelSketch();

                var text = { x: 0, y: 0, text: "TEXT1" };
                //var text = { x: 0, y: 0, text: txt };
                var shapeData = new Xr.data.TextShapeData(text);
                this._sketch = new Xr.edit.TextSketch(this, shapeData, id, true);

                return true;
            } else {
                return false;
            }
        },

        newRectangle: function(/* int */ id) {
            if (this._map.userMode() == Xr.UserModeEnum.EDIT) {
                this.cancelSketch();

                var rect = new Xr.MBR();
                var shapeData = new Xr.data.RectangleShapeData(rect);
                
                this._sketch = new Xr.edit.RectangleSketch(this, shapeData, id, true);

                return true;
            } else {
                return false;
            }
        },

        _calculateSnapMapPt: function (e) {
            var coordMapper = this._coordMapper;
            var offsetXY = Xr.OperationHelper.offsetXY(e);
            var mapPt = coordMapper.V2W(offsetXY.x, offsetXY.y);
            var snap = this._snapManager;
            var tol = coordMapper.snappingTolerance();
            var result = undefined;
            var mouseState = coordMapper.mouseState;

            //Xr.UserState.snapMapPt = mapPt;
            mouseState.snapMapPt = mapPt;
            //Xr.UserState.bSnapVertex = false;
            mouseState.bSnapVertex = false;
            //Xr.UserState.bSnapEdge = false
            mouseState.bSnapEdge = false;

            result = snap.vertexSnap(mapPt, tol);
            if (result != undefined) {
                //Xr.UserState.bSnapVertex = true;
                mouseState.bSnapVertex = true;
            } else {
                result = snap.edgeSnap(mapPt, tol);
                if (result != undefined) {
                    //Xr.UserState.bSnapEdge = true;
                    mouseState.bSnapEdge = true;
                }
            }

            if (result != undefined) {
                //Xr.UserState.snapMapPt = result.clone();
                mouseState.snapMapPt = result.clone();
            }
        },

        mouseDown: function (e) {
            var coordMapper = this.coordMapper();
            var mouseState = coordMapper.mouseState;

            this._calculateSnapMapPt(e);
            //Xr.UserState.mouseDownMapSnapPt = Xr.UserState.snapMapPt;
            mouseState.downMapSnapPt = mouseState.snapMapPt;
            //Xr.UserState.mouseDownAndMoveMapSnapPt = Xr.UserState.snapMapPt;
            mouseState.downAndMoveMapSnapPt = mouseState.snapMapPt;

            if (this._sketch != undefined) {
                return this._sketch.mouseDown(e); // Sketch를 건드렸는지
            } else {
                return false; // Sketch가 없으므로 Sketch를 건드리지 않았음을 의미하는 false.
            }
        },

        mouseMoveOnPanningMode: function(e) {
            this.refreshSketch();
        },

        mouseMove: function (e) {
            this._calculateSnapMapPt(e);

            if (this._sketch != undefined) {
                this._sketch.mouseMove(e);
            }

            var mouseState = this.coordMapper().mouseState;
            //if (Xr.UserState.mouseDown) {
            if (mouseState.bDown) {
                //Xr.UserState.mouseDownAndMoveMapSnapPt = Xr.UserState.snapMapPt;
                mouseState.downAndMoveMapSnapPt = mouseState.snapMapPt;
            }
        },

        mouseUp: function (e) {
            this._calculateSnapMapPt(e);

            if (this._sketch != undefined) {
                this._sketch.mouseUp(e);
            }
        },

        click: function (e) {
            this._calculateSnapMapPt(e);

            var bAppend = e.shiftKey;
                        
            var gl = this.targetGraphicLayer();
            var offsetXY = Xr.OperationHelper.offsetXY(e);
            var idArray = gl.IdByMousePoint(offsetXY.x, offsetXY.y, false);

            if (this._sketch && !this._sketch.isNew() && !this._sketch.stay()) {
                this.cancelSketch();
            }

            if (this._sketch && this._sketch.stay()) this._sketch.stay(false);

            if (this._sketch) {
                this._sketch.click(e);
            } else {
                if (idArray.length > 0) {
                    var rows = gl.rowSet().rows();
                    var id = idArray[0];
                    var row = rows[id];
                    var sketch = row.graphicData().toSketch(this, parseInt(id), row._bMeasured);

                    this.cleanContainer();
                    var svg = sketch.createSVG(this.coordMapper());
                    this.container().appendChild(svg);

                    this._sketch = sketch;

                    var e = Xr.Events.create(Xr.Events.EditingSelectionChanged, { selectedRow: row });
                    Xr.Events.fire(this._map.container(), e);
                } else {
                    this.cancelSketch();

                    var e = Xr.Events.create(Xr.Events.EditingSelectionChanged, { selectedRow: null });
                    Xr.Events.fire(this._map.container(), e);
                }
            }
        },

        dblClick: function (e) {
            this._calculateSnapMapPt(e);

            if (this._sketch != undefined) {
                this._sketch.dblClick(e);
            }
        },

        keyDown: function (e) {
            if (this._sketch != undefined) {
                this._sketch.keyDown(e);
            }
        },

        keyPress: function (e) {
            if (this._sketch != undefined) {
                this._sketch.keyPress(e);
            }
        },

        keyUp: function (e) {
            if (this._sketch != undefined) {
                this._sketch.keyUp(e);
            }
        },

        cleanContainer: function () {
            var svg = this.container();
            var childNodes = svg.childNodes;
            var cntChildNodes = childNodes.length;
            var childNode;

            for (var i = 0; i < cntChildNodes; i++) {
                childNode = childNodes[0];
                svg.removeChild(childNode);
            }
        },

        cancelSketch: function () {
            this.cleanContainer();
            this._sketch = undefined;
        },

        /* ISketch */ currentSketch: function() {
            return this._sketch;
        },

        /* ISketch */ setSketchById: function (/* int */ id) {
            this.cancelSketch();

            var gl = this.targetGraphicLayer();
            var rows = gl.rowSet().rows();
            var row = rows[id];
            if (row == undefined) return undefined;

            var sketch = row.graphicData().toSketch(this, id, row._bMeasured);
            var svg = sketch.createSVG(this.coordMapper());
            sketch.stay(true);

            this.container().appendChild(svg);
            this._sketch = sketch;

            return this._sketch;
        },

        refreshSketch: function() {
            if (this._sketch) {
                var id = this._sketch.id();
                this.setSketchById(id);
            }
        },

        /* boolean */ synchronize: function (/* ICommand */ cmd) {
            if (cmd) {
                if (cmd.run()) {
                    var cmdType = cmd.type();
                    var sketch = this._sketch;
                    if (cmdType == Xr.edit.AddPartCommand.TYPE) {
                        sketch.isNew(false);
                        sketch.update();
                    } else if (cmdType == Xr.edit.AddVertexCommand.TYPE) {
                        this.refreshSketch();
                    } else if (cmdType == Xr.edit.MoveCommand.TYPE) {
                        sketch.stay(true);
                    } else if (cmdType == Xr.edit.MoveControlPointCommand.TYPE) {
                        sketch.stay(true);
                    } else if (cmdType == Xr.edit.NewCommand.TYPE) {
                        sketch.isNew(false);
                        sketch.stay(true);
                        sketch.update();
                    } else if (cmdType == Xr.edit.RemoveCommand.TYPE) {
                        this.cancelSketch();
                    } else if (cmdType == Xr.edit.RemovePartCommand.TYPE) {
                        this.refreshSketch();
                    } else if (cmdType == Xr.edit.RemoveVertexCommand.TYPE) {
                        this.refreshSketch();
                    }

                    this._editHistory.add(cmd);

                    var e = Xr.Events.create(Xr.Events.EditingCompleted, { map: this._map, editCommandType: cmdType, rowId: sketch.id() });
                    Xr.Events.fire(this._map.container(), e);
                }
            }

            if (this._targetGraphicLayer) this._targetGraphicLayer.refresh();
            //this._map.update();
        },

        map: function() {
            return this._map;
        },

        update: function () {
            if (this._sketch) {
                this._sketch.update();
            }
        }
    }
});