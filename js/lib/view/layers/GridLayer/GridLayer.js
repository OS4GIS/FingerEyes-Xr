Xr.layers = Xr.layers || {};

/**  
 * @classdesc 그리드(Grid) 기반의 레이어에 대한 클래스입니다.
 * @class
 * @param {String} name - 레이어의 이름으로 고유한 ID 값
 * @param {Object} params - 그리드 레이어를 구성하기 위한 파라메터를 지정하기 위한 객체로 mbr과 resolution를 지정해야 합니다.
 * mbr은 {Xr.MBR} 타입의 객체이며 resolution은 그리드를 구성하는 셀(Cell)의 해상도입니다.
 * @copyright GEOSERVICE.CO.KR
 * @license LGPL
 */
Xr.layers.GridLayer = Xr.Class({
    name: "GridLayer",
    extend: Xr.layers.Layer,
    requires: [Xr.layers.ILayer],

    construct: function (/* String */ name, /* Object */ params) {
        this.superclass(name, undefined);
        //Xr.layers.Layer.call(this, name, undefined);

        this._div = document.createElement("div");
        this._div.style.position = "absolute";
        this._div.style.top = "0px";
        this._div.style.left = "0px";
        this._div.style.border = "none";
        this._div.style.width = "100%";
        this._div.style.height = "100%";
        this._div.style.overflow = "hidden";
        this._div.style.setProperty("pointer-events", "none");

        this._img = document.createElement("img");
        this._img.style.position = "absolute";
        this._img.style.setProperty("pointer-events", "none");
        this._img.style.setProperty("user-select", "none");
        this._img.style.overflow = "hidden";
        this._img.style.display = "none";

        this.container().appendChild(this._img);

        if (params.mbr) {
            this._mbr = params.mbr;
        }

        if (params.resolution) {
            this._resolution = params.resolution;
        }

        this._connected = this._mbr != undefined && this._resolution != undefined;
        if (this._connected) {
            this._countRows = parseInt(Math.ceil((this._mbr.maxY - this._mbr.minY) / this._resolution));
            this._countColumns = parseInt(Math.ceil((this._mbr.maxX - this._mbr.minX) / this._resolution));

            var countCells = this._countRows * this._countColumns;
            this._cells = new Float64Array(countCells);

            //Not Yet Supported
            //this._cells.fill(NaN);

            for (var i = 0; i < countCells; i++) {
                this._cells[i] = NaN;
            }
        }

        this._maxValue = -Number.MAX_VALUE;
        this._minValue = Number.MAX_VALUE;

        this._coordMapper = undefined;
    },

    methods: {
        reset: function () {
            var countCells = this._countRows * this._countColumns;
            //Not Yet Supported
            //this._cells.fill(NaN);

            for (var i = 0; i < countCells; i++) {
                this._cells[i] = NaN;
            }

            this._maxValue = -Number.MAX_VALUE;
            this._minValue = Number.MAX_VALUE;
        },

        minValue: function () {
            return this._minValue;
        },

        maxValue: function () {
            return this._maxValue;
        },

        /* boolean */ densityByLayer: function (/* ILayer */ lyr, /* number */ radius, /* Array */ colorTable, /* optinal string */ weightedFieldName,
            /* function */ progressCallback, /* optional String */ jsFileName) {
            var data = new Array();

            if (lyr instanceof Xr.layers.ShapeMapLayer) {
                var shpRows = lyr.shapeRowSet().rows();
                var attRows = lyr.attributeRowSet().rows();
                var weightedFieldIndex = -1;

                if (weightedFieldName) {
                    var fieldSet = lyr.attributeRowSet().fieldSet();
                    var fieldType = fieldSet.fieldType(weightedFieldName);

                    if (fieldType == undefined || fieldType == Xr.data.FieldType.STRING) return false;

                    weightedFieldIndex = fieldSet.fieldIndex(weightedFieldName);
                    if (weightedFieldIndex == -1) return false;
                }

                var mbr = this.MBR();
                for (var fid in shpRows) {
                    var shpRow = shpRows[fid];
                    var rPt = shpRow.shapeData().representativePoint();

                    if (mbr.contain(rPt)) {
                        var value = 1;

                        if (weightedFieldIndex != -1) {
                            var attRow = attRows[fid];
                            value = attRow.valueAsFloat(weightedFieldIndex);
                        }

                        data.push({ value: value, x: rPt.x, y: rPt.y });
                    }
                }
            } else {
                return false;
            }

            var jsFile = jsFileName == undefined ? window.Xr.rasterOperatorsPath + "density.js" : jsFileName;
            var worker = new Worker(jsFile)
            var canvas = document.createElement("canvas");

            canvas.style.position = "absolute";
            canvas.style.top = "0px";
            canvas.style.left = "0px";
            canvas.width = this._countColumns;
            canvas.height = this._countRows;

            var context = canvas.getContext('2d');
            var imageData = canvas.getContext('2d').createImageData(this._countColumns, this._countRows);
            var imgRawData = imageData.data;
            var that = this;

            worker.onmessage = function (event) {
                var dataProcessed = event.data;

                if (typeof dataProcessed === "number") {
                    if (progressCallback) {
                        progressCallback(dataProcessed);
                    }
                } else {
                    that._minValue = dataProcessed.minValue;
                    that._maxValue = dataProcessed.maxValue;
                    that._cells.set(dataProcessed.cells);

                    imgRawData.set(dataProcessed.imgRawData);
                    context.putImageData(imageData, 0, 0);

                    that._img.src = canvas.toDataURL();
                    that._img.style.display = "block";
                    that.refresh();

                    canvas = undefined;
                    imgRawData = undefined;
                }
            }

            worker.postMessage({
                data: data,
                mbr: this._mbr,
                resolution: this._resolution,
                radius: radius,
                countRows: this._countRows,
                countColumns: this._countColumns,
                cells: this._cells,
                colorTable: colorTable,
                imgRawData: imgRawData
            });

            return true;
        },

        /* boolean */ cellValuesByLayer: function (/* ILayer */ lyr, /* optional String */ weightedFieldName) {
            if (lyr instanceof Xr.layers.ShapeMapLayer) {
                var shpRows = lyr.shapeRowSet().rows();
                var attRows = lyr.attributeRowSet().rows();
                var weightedFieldIndex = -1;

                if (weightedFieldName) {
                    var fieldSet = attRows.fieldSet();
                    var fieldType = fieldSet.fieldType(weightedFieldName);

                    if (!fieldType || fieldType == Xr.data.FieldType.STRING) return false;

                    weightedFieldIndex = fieldSet.fieldIndex(weightedFieldName);
                    if (weightedFieldIndex == -1) return false;
                }

                for (var fid in shpRows) {
                    var shpRow = shpRows[fid];
                    var rPt = shpRow.shapeData().representativePoint();
                    var value = 1;

                    if (weightedFieldIndex != -1) {
                        var attRow = attRows[fid];
                        value = attrRow.valueAsFloat(weightedFieldIndex);
                    }

                    this.value(rPt.x, rPt.y, value);
                }
            } else {
                return false;
            }

            return true;
        },

        /* DIV */ container: function () {
            return this._div;
        },

        connect: function (/* CoordMapper */ coordMapper) {
            this._coordMapper = coordMapper;
        },

        /* value */ valueByIndex: function (/* int */ row, /* int */ column, /* optional number */ value) {
            if (arguments.length == 2) {
                return this._cells[row * this._countColumns + column];
            } else {
                this._cells[row * this._countColumns + column] = value;
            }
        },

        /* number */ accumulate: function (/* number */ mapX, /* number */ mapY, /* number */ value) {
            var v = this.value(mapX, mapY);
            if (v != undefined) {
                var result;
                if (isNaN(v)) result = value;
                else result = value + this.value(mapX, mapY);

                this.value(mapX, mapY, result);

                return result;
            } else {
                return undefined;
            }
        },

        /* value */ value: function (/* number */ mapX, /* number */ mapY, /* optional number */ value) {
            if (!this._mbr.contain(new Xr.PointD(mapX, mapY))) return undefined;

            var row = this.row(mapY);
            var column = this.column(mapX);

            //if (row < 0 || row >= this._countRows) return undefined;
            //if (column < 0 || column >= this._countColumns) return undefined;

            if (arguments.length == 2) {
                return this._cells[row * this._countColumns + column];
            } else {
                this._cells[row * this._countColumns + column] = value;

                if (value < this._minValue) this._minValue = value;
                if (value > this._maxValue) this._maxValue = value;
            }
        },

        /* int */ row: function (/* number */ mapY) {
            var revRow = parseInt(Math.floor((mapY - this._mbr.minY) / this._resolution));
            return this._countRows - revRow - 1;
        },

        /* int */ column: function (/* number */ mapX) {
            return parseInt(Math.floor((mapX - this._mbr.minX) / this._resolution));
        },

        refresh: function () {
            this.update(this._coordMapper);
        },

        update: function (/* CoordMapper */ coordMapper, /* MouseAction enum */ mouseAction, /* number */ offsetX, /* number */ offsetY) {
            var mapScale = coordMapper.mapScale();
            //if (isNaN(mapScale)) return;

            if (this.visibility().needRendering(mapScale)) {
                this._div.style.display = "block";

                if (mouseAction == Xr.MouseActionEnum.MOUSE_DOWN) {
                    this._previousImgLeft = Xr.OperationHelper.valueFromPx(this._img.style.left);
                    this._previousImgTop = Xr.OperationHelper.valueFromPx(this._img.style.top);
                } else if (mouseAction == Xr.MouseActionEnum.MOUSE_DRAG) {
                    var left = Xr.OperationHelper.valueFromPx(this._img.style.left);
                    var top = Xr.OperationHelper.valueFromPx(this._img.style.top);

                    this._img.style.top = this._previousImgTop + offsetY;
                    this._img.style.left = this._previousImgLeft + offsetX;
                } else {
                    var cm = this._coordMapper;
                    var lt = cm.W2V(new Xr.PointD(this._mbr.minX, this._mbr.maxY));
                    var rb = cm.W2V(new Xr.PointD(this._mbr.maxX, this._mbr.minY));
                    var rt = cm.W2V(new Xr.PointD(this._mbr.maxX, this._mbr.maxY));

                    this._img.style.setProperty("-webkit-transform-origin", "0px 0px");
                    this._img.style.setProperty("-webkit-transform", "rotate(" + cm.rotationAngle() + "deg)");

                    this._img.style.setProperty("transform-origin", "0px 0px");
                    this._img.style.setProperty("transform", "rotate(" + cm.rotationAngle() + "deg)");

                    //this._img.style.setProperty("transform-origin", "0px 0px");
                    //this._img.style.transform = "rotate(" + cm.rotationAngle() + "deg)";

                    this._img.style.top = Math.floor(lt.y);// + "px";
                    this._img.style.left = Math.floor(lt.x);// + "px";

                    this._img.style.width = Math.ceil(Math.sqrt(Math.pow(lt.x - rt.x, 2.0) + Math.pow(lt.y - rt.y, 2.0)));// + "px";
                    this._img.style.height = Math.ceil(Math.sqrt(Math.pow(rt.x - rb.x, 2.0) + Math.pow(rt.y - rb.y, 2.0)));// + "px";

                    var mapContainer = this.container().parentNode;
                    if (mapContainer) {
                        var e = Xr.Events.create(Xr.Events.LayerUpdateCompleted, { layerName: this.name() });
                        Xr.Events.fire(mapContainer, e);
                    }
                }
            } else { // Need not draw
                this._div.style.display = "none";
            }
        },

        /* MBR */ MBR: function () {
            return this._mbr;
        },

        /* boolean */ conneted: function () {
            return this._connected;
        },
    }
});
