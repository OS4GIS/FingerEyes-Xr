self.onmessage = function (event) {
    var postData = event.data;
    var cntRows = postData.countRows;
    var resolution = postData.resolution;
    var radius = postData.radius;
    var mbr = postData.mbr;
    var mbrMinX = mbr.minX;
    var mbrMinY = mbr.minY;
    var cntColumns = postData.countColumns;
    var cells = postData.cells;
    var minValue = Number.MAX_VALUE;
    var maxValue = -Number.MAX_VALUE;
    var data = postData.data;
    var colorTable = postData.colorTable;
    var imgRawData = postData.imgRawData;

    // analysis density
    var cntData = data.length;
    if (data.length > 0) {
        for (var i = 0; i < cntData; i++) {
            var progress = (i / cntData) * 70; // 70%
            self.postMessage(progress);

            var datum = data[i];
            var cx = datum.x;
            var cy = datum.y;
            var value = datum.value;
            var startX = cx - radius;
            var endX = cx + radius;
            var startY = cy - radius;
            var endY = cy + radius;
            var s = radius / 4; // 나누는 값이 클수록 경계가 더 매끄럽게 표현됨

            for (var x = startX; x <= endX; x += resolution) {
                for (var y = startY; y <= endY; y += resolution) {
                    var r = Math.sqrt(Math.pow(x - cx, 2.0) + Math.pow(y - cy, 2.0));
                    if (r > radius) continue;

                    var fx = (1 / (Math.sqrt(2 * Math.PI) * s)) * Math.pow(Math.E, -0.5 * Math.pow(r / s, 2.0));
                    var v = value * fx;

                    var row = cntRows - parseInt(Math.floor((y - mbrMinY) / resolution)) - 1;
                    var column = parseInt(Math.floor((x-mbrMinX) / resolution));
                    var cellIdx = row * cntColumns + column;
                    var prevValue = cells[cellIdx];
                    if (prevValue != undefined) {
                        if (isNaN(prevValue)) prevValue = 0;
                        var lastValue = prevValue + v;
                        cells[cellIdx] = lastValue;

                        if (lastValue < minValue) minValue = lastValue;
                        if (lastValue > maxValue) maxValue = lastValue;
                    }
                }
            }
        }
        // .

        // create bitmap
        var countIntv = colorTable.length;
        var lenIntv = (maxValue - minValue) / countIntv;
        var totalCells = cntRows * cntColumns;

        for (var row = 0; row < cntRows; row++) {
            for (var col = 0; col < cntColumns; col++) {
                var progress = ((row * cntColumns + col) / totalCells) * 30; // 30%
                if (progress - parseInt(progress) == 0) {
                    self.postMessage(70 + progress);
                }

                var cellValue = cells[row * cntColumns + col];
                if (cellValue && !isNaN(cellValue)) {
                    var xx = cellValue - minValue;
                    var indexIntv = Math.floor((cellValue - minValue) / lenIntv);
                    
                    if (indexIntv == countIntv) indexIntv--;
                    var clr = colorTable[indexIntv];

                    imgRawData[((cntColumns * row) + col) * 4] = clr.r;
                    imgRawData[((cntColumns * row) + col) * 4 + 1] = clr.g;
                    imgRawData[((cntColumns * row) + col) * 4 + 2] = clr.b;
                    imgRawData[((cntColumns * row) + col) * 4 + 3] = clr.a;
                }
            }
        }

        self.postMessage(100);
        // .

        self.postMessage(
            {
                imgRawData: imgRawData,
                cells: cells,
                minValue: minValue,
                maxValue: maxValue
            }
        );
    }
}