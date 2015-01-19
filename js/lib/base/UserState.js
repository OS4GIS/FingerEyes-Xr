Xr.UserState = Xr.Class({
    name: "UserState",
    statics: {		
        mouseDown: false,

        mouseDownPt: new Xr.PointD(),
        mouseDownMapSnapPt: new Xr.PointD(),

        mouseDownAndMovePt: new Xr.PointD(),
        mouseDownAndMoveMapSnapPt: new Xr.PointD(),

        snapMapPt: new Xr.PointD(),
        bSnapVertex: false,
        bSnapEdge: false
    }
});