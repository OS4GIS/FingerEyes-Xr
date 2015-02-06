/**  
 * @classdesc 지오메트리(Geometry)에 대한 연산 기능을 담고 있는 정적 클래스입니다.
 * @class
 * @copyright [(주)지오서비스]{@link http://www.geoservice.co.kr}
 * @license LGPL
 */
Xr.GeometryHelper = Xr.Class({
    name: "GeometryHelper",

    statics: {
        /**       
         * @desc MBR 안에 포인트가 주어진 여백(margin) 내에 존재하는지 검사합니다.
         * @memberOf Xr.GeometryHelper 
         * @param {Xr.MBR} mbr - 검사할 MBR
         * @param {Xr.PointD} pt - 검사할 포인트
         * @param {number} margin - MBR 영역에 대한 여백
         * @static
         * @return {boolean} 포인트가 여백까지 포함하는 MBR 내부에 존재한다면 true를 반환합니다. 
         */
        /* boolean */ pointInMBR: function (/* MBR */ mbr, /* PointD */ pt, /* number */margin)
        {
            return !((mbr.minX-margin) > pt.x || (mbr.minY-margin) > pt.y || (mbr.maxX+margin) < pt.x || (mbr.maxY+margin) < pt.y);
        },

        /**       
         * @desc 중심점에 대한 반경을 가지는 원 안에 어떤 포인트가 존재하는지 검사합니다.
         * @memberOf Xr.GeometryHelper 
         * @param {number} centerX - 포인트가 존재하는지 검사할 원의 중심점에 대한 X 좌표값
         * @param {number} centerY - 포인트가 존재하는지 검사할 원의 중심점에 대한 Y 좌표값
         * @param {number} radius - 포인트가 존재하는지 검사할 원의 반경
         * @param {Xr.PointD} pt - 원 내부에 존재하는지 검사하고자 하는 포인트
         * @static
         */
        /* boolean */ pointIn: function PointIn(/* number */ centerX, /* number */ centerY, /* number */ radius, /* PointD */ pt)
        {
            return Math.pow(centerX-pt.x, 2) + Math.pow(centerY-pt.y, 2) <= Math.pow(radius, 2); 	
        },

        /**       
         * @desc 좌표로 구성된 배열로부터 부호가 있는 넓이값을 구합니다.
         * @memberOf Xr.GeometryHelper 
         * @param {Array} coordsList - [Xr.PointD]{@link Xr.PointD}로 구성된 배열 
         * @static
         * @return {number} 부호가 있는 넓이값 
         */
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
		
        /**       
         * @desc 폴리곤의 무게중심점(Centroid)를 얻습니다.
         * @memberOf Xr.GeometryHelper 
         * @param {Array} coordsList - 폴리곤을 구성하는 좌표([Xr.PointD]{@link Xr.PointD})로 구성된 배열 
         * @static
         * @return {Xr.PointD} 폴리곤의 무게중심점 
         */
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
		
        /**       
         * @desc 폴리라인에 대한 라벨을 표시할 위치를 얻습니다.
         * @memberOf Xr.GeometryHelper 
         * @param {Array} coordList - 폴리라인을 구성하는 좌표([Xr.PointD]{@link Xr.PointD})로 구성된 배열 
         * @static
         * @return {Xr.PointD} 폴리라인에 대한 라벨 표시 위치
         */
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
			
        /**       
         * @desc 하나의 선분에서 어떤 포인트까지의 최단 거리를 구합니다. 
         * @memberOf Xr.GeometryHelper 
         * @param {Xr.PointD} p1 - 선분을 구성하는 시작점
         * @param {Xr.PointD} p2 - 선분을 구성하는 끝점
         * @param {Xr.PointD} p - 선분에서 거리를 구하고자 하는 포인트
         * @param {Xr.PointD} itPt - 포인트에서 선분까지의 최단 거리를 구할때 최단 거리에 대한 선분 상의 좌표 
         * @static
         * @return {number} 포인트에서 선분까지의 최단 거리 
         */
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

        /**       
         * @desc 하나의 선분에서 다른 포인트까지의 거리가 지정된 거리(distance 인자) 이내에 들어올때 해당 거리에 대한 선분 상의 좌표를 구합니다.
         * @memberOf Xr.GeometryHelper 
         * @param {Xr.PointD} p1 - 선분을 구성하는 시작점 
         * @param {Xr.PointD} p2 - 선분을 구성하는 끝
         * @param {Xr.PointD} pt - 선분에서 거리를 구하고자 하는 포인트
         * @param {number} distance - 지정된 거리로써 선분과 포인트 간의 거리가 이 지정된 거리보다 작을 때에만 선분상의 교차점을 반환합니다.
         * @static
         * @return {Xr.PointD} 선분과 포인트 간의 거리가 이 지정된 거리보다 작을 때의 선분상의 교차점을 반환합니다. 교차점이 없거나 거리가 지정된 거리보다 클때 undefined를 반환합니다.
         */
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
		
        /**       
         * @desc 지정된 포인트들을 포함하는 MBR을 구합니다.
         * @memberOf Xr.GeometryHelper 
         * @param {Array} coords - [Xr.PointD]{@link Xr.PointD}로 구성된 배열 
         * @static
         * @return {Xr.MBR} 지정된 포인트를 포함하는 MBR 
         */
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

        /**       
         * @desc 어떤 선분과 또 다른 포인트 간의 최단 거리를 구합니다.
         * @memberOf Xr.GeometryHelper 
         * @todo 테스트가 필요함
         * @param {Xr.PointD} linePt1 - 선분을 구성하는 시작점
         * @param {Xr.PointD} linePt2 - 선분을 구성하는 끝점
         * @param {Xr.PointD} pt - 선분까지의 거리를 구하고자 하는 포인트
         * @static
         * @return {Xr.MBR} 지정된 포인트를 포함하는 MBR 
         */
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
		
        /**       
         * @desc 어떤 포인트가 폴리라인 상에 존재하는지를 허용치(tol)를 사용하여 검사합니다.
         * @memberOf Xr.GeometryHelper 
         * @param {Array} points - [Xr.PointD]{@link Xr.PointD}로 구성된 배열로써 폴리라인의 좌표 리스트임
         * @param {Xr.PointD} pt - 폴리라인에 존재하는지 검사하고자 하는 포인트
         * @static
         * @return {boolean} 어떤 포인트가 폴리라인 상에 허용치 이내의 거리에 존재한다면 true 반환하고 그렇지 않다면 false를 반한합니다.
         */
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
		
        /**       
         * @desc 어떤 포인트가 폴리곤 안에 존재하는지의 여부를 검사합니다.
         * @param {Array} pointList - [Xr.PointD]{@link Xr.PointD}로 구성된 배열로써 폴리곤의 좌표 리스트임
         * @param {Xr.PointD} p - 폴리곤 안에 존재하는지의 여부를 검사할 포인트
         * @memberOf Xr.GeometryHelper 
         * @static
         * @return {boolean} 어떤 포인트가 폴리곤 안에 존재한다면 true를 반환하고 그렇지 않다면 false를 반환함 
         */
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
		
        /**       
         * @desc 어떤 선분의 방위각을 계산합니다. 계산된 방위각의 단위는 Degree 입니다.
         * @memberOf Xr.GeometryHelper 
         * @param {Xr.PointD} start - 어떤 선분에 대한 시작점
         * @param {Xr.PointD} end - 어떤 선분에 대한 끝점
         * @static
         * @return {number} 선분에 대한 방위각으로써 단위는 Degree 입니다. 
         */
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
		
        /**       
         * @desc 어떤 선분에 대해서 그 선분을 구성하는 시작점(lineA)에서 시작하여 선분을 따라 어떤 거리(distance 인자)만큼에 해당하는 위치 좌표를 계산합니다. 
         * @memberOf Xr.GeometryHelper 
         * @param {Xr.PointD} lineA - 어떤 선분을 구성하는 시작점 
         * @param {Xr.PointD} lineB - 어떤 선분을 구성하는 끝점
         * @param {number} distance - 거리
         * @static
         * @return {Xr.PointD} 어떤 선분에 대해서 그 선분을 구성하는 시작점(lineA)에서 시작하여 선분을 따라 어떤 거리(distance 인자)만큼에 해당하는 위치 좌표
         */
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