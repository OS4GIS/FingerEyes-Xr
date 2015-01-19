Xr.data = Xr.data || {};

Xr.data.AttributeRow = Xr.Class({
	name: "AttributeRow",
 	
	construct: function(fid, fieldCount) {
		this._fid = fid;
		this._values = new Array(fieldCount);
	},
 	
	methods: {
		/* uint */ fid: function() {
			return this._fid;
		},
		
		/* string */ valueAsString: function(/* uint */ index) {
			return this._values[index];
		},
		
		/* int */ valueAsInteger: function(/* uint */ index) {
			return parseInt(this._values[index]);
		},
		
		/* number */ valueAsFloat: function(/* uint */ index) {
			return parseFloat(this._values[index]);
		},
		
		setValue: function(/* uint */ index, /* string */ value) {
			this._values[index] = value;
		},

		/* SVG Element */ createSVG: function(/* CoordMapper */ coordMapper, /* ShapeRow */ shpRow, /* String */ labelText, /* FontSymbol */ sym) {
		    var xmlns = Xr.CommonStrings.SVG_NAMESPACE;
		    var shapeData = shpRow.shapeData();
			var rPt = shapeData.representativePoint();

			var vp = coordMapper.W2V(rPt);
			var g = document.createElementNS(xmlns, "g");
			var stroke = undefined;

			if (sym.needStroke()) {
			    stroke = document.createElementNS(xmlns, "text");
			    stroke.setAttribute("x", vp.x);
			    stroke.setAttribute("y", vp.y);
			    stroke.setAttribute("text-anchor", "middle");
			    sym.attributeForStroke(stroke);
			    stroke.textContent = labelText;
			}

			var text = document.createElementNS(xmlns, "text");			
			text.setAttribute("x", vp.x);
			text.setAttribute("y", vp.y);
			text.setAttribute("text-anchor", "middle");
			sym.attribute(text);
			text.textContent = labelText;

            /*
            // Setting Not Seletable Text, but not work. 
            text.setAttribute("unselectable", "on");
			text.style.setProperty("user-select", "none");
		    text.style.setProperty("-ms-user-select", "none");
		    text.style.setProperty("-moz-user-select", "-moz-none");
			text.style.setProperty("-khtml-user-select", "none");
			text.style.setProperty("-webkit-user-select", "none");
			text.style.setProperty("-webkit-touch-callout", "none");
            */

			if (stroke != undefined) {
			    var filter = document.createElementNS(xmlns, "filter");
			    filter.setAttribute("id", "_fe_labelBlur");

			    var blur = document.createElementNS(xmlns, "feGaussianBlur");
			    blur.setAttribute("stdDeviation", "1.5");

			    filter.appendChild(blur);
			    g.appendChild(filter);

			    stroke.setAttribute("filter", "url(#_fe_labelBlur)");
			    g.appendChild(stroke);
			}

			g.appendChild(text);

			return g;
		}

	}
});