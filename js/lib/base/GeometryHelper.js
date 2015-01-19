Xr.GeometryHelper = Xr.Class({
    name: "GeometryHelper",

    statics: {
        /* boolean */ pointInMBR: function(/* MBR */ mbr, /* PointD */ pt, /* number */margin)
        {
            return !((mbr.minX-margin) > pt.x || (mbr.minY-margin) > pt.y || (mbr.maxX+margin) < pt.x || (mbr.maxY+margin) < pt.y);
        },
		
        /* boolean */ pointIn: function PointIn(/* number */ centerX, /* number */ centerY, /* number */ radius, /* PointD */ pt)
        {
            return Math.pow(centerX-pt.x, 2) + Math.pow(centerY-pt.y, 2) <= Math.pow(radius, 2); 	
        },
				
        /* number */ signedArea: function(/* PointD Array */ coordsList)
        {
            var cntCoords = coordsList.length;
            if(cntCoords < 3)
            {
                return 0.0;
            }
			
            var next;
            var area = 0.0;

            for (var i=0; i<cntCoords; i++) 
            {
                next = (i+1) % cntCoords;

                var coordA = coordsList[i];
                var coordB = coordsList[next];

                area += coordA.x * coordB.y;
                area -= coordA.y * coordB.x;
            }

            area /= 2.0;

            return area;
        },
		
        /* PointD */ centroidOfPolygon: function centroidOfPolygon(/* PointD Array */ coordsList)
        {
            var area = this.signedArea(coordsList);
            if(area == 0.0)
            {
                return undefined;
            }
			
            var cntCoords = coordsList.length;
            var cent = new Xr.PointD(0.0, 0.0);
            var factor;
            
            for (var i=0; i<cntCoords; i++) 
            {
                var j = (i + 1) % cntCoords;
                var coordA = coordsList[i];
                var coordB = coordsList[j];
                factor = (coordA.x*coordB.y-coordB.x*coordA.y);

                cent.x += (coordA.x+coordB.x)*factor;
                cent.y += (coordA.y+coordB.y)*factor;
            }

            area *= 6.0;
            factor = 1/area;
			
            cent.x *= factor;
            cent.y *= factor;

            return cent;			
        },
		
        /* PointD */ centroidOfPolyline: function centroidOfPolyline(/* PointD Array */ coordsList) {
            var cntCoord = coordsList.length;
            if (cntCoord < 2) {
                return undefined;
            }

            if (cntCoord == 2) {
                var coord1 = coordsList[0];
                var coord2 = coordsList[1];

                return new Xr.PointD((coord1.x + coord2.x) / 2, (coord1.y + coord2.y) / 2);
            }

            var halfIndex = parseInt(cntCoord / 2.0);
            var centerCoord = coordsList[halfIndex];

            return new Xr.PointD(centerCoord.x, centerCoord.y);
        },

        /* number */ magnitude: function(/* PointD */ p1, /* PointD */ p2)
        {
            var vector = new Xr.PointD();
				
            vector.x = p2.x - p1.x;
            vector.y = p2.y - p1.y;
				
            return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
        },
			
        /* number */ distanceOfLineFromPoint: function (/* PointD */ p1, /* PointD */  p2, /* PointD */  pt, /* PointD */ itPt)
        {
            var lineMag = Xr.GeometryHelper.magnitude(p2, p1);
            var u = ( ( ( pt.x - p1.x ) * ( p2.x - p1.x ) ) +
                ( ( pt.y - p1.y ) * ( p2.y - p1.y ) )) /
                ( lineMag * lineMag );
					
            if( u < 0.0 || u > 1.0 ) return -1;
					
            itPt.x = p1.x + u * ( p2.x - p1.x);
            itPt.y = p1.y + u * ( p2.y - p1.y);
					
            return Xr.GeometryHelper.magnitude(pt, itPt);
        },

        /* PointD */ intersectPointFromLine: function(/* PointD */  p1, /* PointD */ p2, /* PointD */ pt, /* number */ distance)
        {
            if(p1.x != p2.x || p1.y != p2.y)
            {
                var lineMag = Xr.GeometryHelper.magnitude(p2, p1);
                var u = ( ( ( pt.x - p1.x ) * ( p2.x - p1.x ) ) +
                    ( ( pt.y - p1.y ) * ( p2.y - p1.y ) )) /
                    ( lineMag * lineMag );
			
                if( u < 0.0 || u > 1.0 ) return undefined;
			
                var itPt = new Xr.PointD(p1.x + u * ( p2.x - p1.x), p1.y + u * ( p2.y - p1.y));

                if(Xr.GeometryHelper.magnitude(pt, itPt) > distance)
                {
                    return undefined;
                }
                else
                {
                    return itPt;
                }
             }		
		
             return undefined;
        },
		
        /* MBR */ MBR: function(/* PointD Array Array */ coords)
        {
            var result = new Xr.MBR();
			var nParts = coords.length;
            
			for(var iPart=0; iPart<nParts; ++iPart)
			{
                var part  = coords[iPart];
                var nCoords = part.length;
                
                for(var iCoord=0; iCoord<nCoords; ++iCoord)
                {
                    var coord = part[iCoord];
                    result.append(coord);
                }
            }
			
            return result;
        },
		
        // DO TESTING
        /* number */ distanceBetweenLineAndPoint: function(/* PointD */ linePt1, /* PointD */ linePt2, /* PointD */ pt)
        {
            var lineMag = Math.sqrt(Math.pow(linePt2.x - linePt1.x, 2.0) + Math.pow(linePt2.y - linePt1.y, 2.0));
            var U = ((pt.x - linePt1.x) * (linePt2.x - linePt1.x) + 
                (pt.y - linePt1.y) * (linePt2.y - linePt1.y)) / (lineMag * lineMag);
			
            if ((U < 0.0) || (U > 1.0)) return -1.0;
			
            var intX = linePt1.x + U * (linePt2.x - linePt1.x);
            var intY = linePt1.y + U * (linePt2.y - linePt1.y);
			
            return Math.sqrt(Math.pow(intX - pt.x, 2.0) + Math.pow(intY - pt.y, 2.0));
        },
		
        /* boolean */ pointInPolyline: function(/* PointD Array */ points, /* PointD */ pt, /* number */ tol)
        {
            var n = points.length;
            for (var i = 1; i < n; i++) {
                var p1 = points[i - 1];
                var p2 = points[i];
				
                var dist = this.distanceBetweenLineAndPoint(p1, p2, pt);
                if ((dist > 0.0) && (dist < tol)) {
                    return true;
                }
            }
			
            return false;
        },
		
        /* boolean */ pointInPolygon: function(/* PointD Array */ pointList, /* PointD */ p)
        {
            var counter = 0;
            var xinters;
            var p1 = pointList[0];
            var p2;
            var n = pointList.length;

            for (var i = 1; i <= n; i++)
            {
                p2 = pointList[i % n];
                if (p.y > Math.min(p1.y, p2.y) && p.y <= Math.max(p1.y, p2.y) && p.x <= Math.max(p1.x, p2.x) && p1.y != p2.y)
                {
                    xinters = (p.y - p1.y) * (p2.x - p1.x) / (p2.y - p1.y) + p1.x;
                    if (p1.x == p2.x || p.x <= xinters) counter++;
                }
                
                p1 = p2;
            }
			
            return counter % 2 != 0;
        },
		
        /* number */ angle: function(/* PointD */ start, /* PointD */ end) {   
            var dy = end.y-start.y;   
            var dx = end.x-start.x;
			
            if(dx == 0.0) return 0.0;
			
            var angle = Math.atan(dy/dx) * (180.0/Math.PI);   

            if(dx < 0.0) {   
                angle += 180.0;   
            } else {   
                if(dy<0.0) angle += 360.0;   
            }   
			
            return angle; //360.0 - (angle - 90.0);
        },  
		
        /* PointD */ vertexOnLineByDistance: function(/* PointD */ lineA, /* PointD */ lineB, /* number */ distance)
        {
            var lengthOfLine = Math.sqrt((lineA.x-lineB.x)*(lineA.x-lineB.x) + (lineA.y-lineB.y )*(lineA.y-lineB.y));
			
            if(lengthOfLine == 0) return undefined;
			
            var t = distance / lengthOfLine;
            if(t > 1.0) {  
                return undefined;
            } else {
                return new PointD(lineA.x + t * (lineB.x - lineA.x), lineA.y + t * (lineB.y - lineA.y));
            }
        }
    }
});