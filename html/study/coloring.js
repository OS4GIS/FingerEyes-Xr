self.onmessage = function (event) {
    var data = event.data;

    var width = data.width;
    var height = data.height;
    var imageData = data.data;
    var total = height * width;

    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            var progress = parseInt(((y * width + x) / total) * 100);
            if (progress % 10 == 0) {
                self.postMessage(progress);
            }

            imageData[((width * y) + x) * 4] = 255;                 // RED
            imageData[((width * y) + x) * 4 + 1] = 0;               // GREEN
            imageData[((width * y) + x) * 4 + 2] = 0;               // BLUE
            imageData[((width * y) + x) * 4 + 3] = (x + y) % 255;   // ALPHA
        }
    }

    self.postMessage(imageData);
}