// TODO: Optimize draw calls to return if they are off-canvas,
// or do the fill methods automatically return if they are
// not on canvas?
ig.module(
    'plugins.box2d.debug'
)
.requires(
    'plugins.box2d.lib'
)
.defines(function(){


var e_shapeBit = 0x0001;
var e_jointBit = 0x0002;
var e_aabbBit = 0x0004;
var e_pairBit = 0x0008;
var e_centerOfMassBit = 0x0010;

Box2D.b2SCALE = 0.1;


ig.Box2DDebug = ig.Class.extend({

    drawer: null,
    world: null,
    alpha: 0.5,
    drawScale: null,

    init: function( world, alpha, thickness ) {
        this.alpha = alpha || this.alpha;
        this.drawScale = 1 / Box2D.b2SCALE * ig.system.scale;
        this.drawer = new Box2D.b2Draw();
        this.drawer.SetFlags(e_shapeBit | e_jointBit);
        this.bindDebugDrawCallbacks(this.drawer);
        this.world = world;
        this.world.SetDebugDraw(this.drawer);
    },

    draw: function() {
        ig.system.context.save();
        ig.system.context.translate(-ig.game.screen.x * ig.system.scale, -ig.game.screen.y * ig.system.scale);
        this.world.DrawDebugData();
        ig.system.context.restore();
    },

    setColorFromDebugDrawCallback: function(color) {
        var col = Box2D.wrapPointer(color, Box2D.b2Color);
        var red = (col.get_r() * 255) | 0;
        var green = (col.get_g() * 255) | 0;
        var blue = (col.get_b() * 255) | 0;
        var colStr = red + "," + green + "," + blue;
        ig.system.context.fillStyle = "rgba(" + colStr + "," + this.alpha + ")";
        ig.system.context.strokeStyle = "rgb(" + colStr + ")";
    },

    drawSegment: function(vert1, vert2) {
        console.log("drawSegment called.");
        /*
        var vert1V = Box2D.wrapPointer(vert1, Box2D.b2Vec2);
        var vert2V = Box2D.wrapPointer(vert2, Box2D.b2Vec2);
        ig.system.context.beginPath();
        ig.system.context.moveTo(vert1V.get_x() * this.drawScale, vert1V.get_y() * this.drawScale);
        ig.system.context.lineTo(vert2V.get_x() * this.drawScale, vert2V.get_y() * this.drawScale);
        ig.system.context.stroke();
        */
    },

    drawPolygon: function(vertices, vertexCount, fill) {
        ig.system.context.beginPath();
        for (tmpI = 0; tmpI < vertexCount; tmpI++) {
            var vert = Box2D.wrapPointer(vertices + (tmpI * 8), Box2D.b2Vec2);
            if (tmpI == 0)
                ig.system.context.moveTo(vert.get_x() * this.drawScale, vert.get_y() * this.drawScale);
            else
                ig.system.context.lineTo(vert.get_x() * this.drawScale, vert.get_y() * this.drawScale);
        }
        ig.system.context.closePath();
        if (fill)
            ig.system.context.fill();
        ig.system.context.stroke();
    },

    drawCircle: function(center, radius, axis, fill) {
        console.log("drawCircle called.");
        /*
        var centerV = Box2D.wrapPointer(center, Box2D.b2Vec2);
        var axisV = Box2D.wrapPointer(axis, Box2D.b2Vec2);

        ig.system.context.beginPath();
        ig.system.context.arc(centerV.get_x(), centerV.get_y(), radius, 0, 2 * Math.PI, false);
        if (fill)
            ig.system.context.fill();
        ig.system.context.stroke();

        if (fill) {
            //render axis marker
            var vert2V = copyVec2(centerV);
            vert2V.op_add(scaledVec2(axisV, radius));
            ig.system.context.beginPath();
            ig.system.context.moveTo(centerV.get_x(), centerV.get_y());
            ig.system.context.lineTo(vert2V.get_x(), vert2V.get_y());
            ig.system.context.stroke();
        }
        */
    },

    drawTransform: function(transform) {
        console.log("drawTransform called.");
        /*
        var trans = Box2D.wrapPointer(transform, Box2D.b2Transform);
        var pos = trans.get_p();
        var rot = trans.get_q();
        ig.system.context.save();
        ig.system.context.translate(pos.get_x(), pos.get_y());
        ig.system.context.scale(0.5, 0.5);
        ig.system.context.rotate(rot.GetAngle());
        ig.system.context.lineWidth *= 2;
        this.drawAxes(ig.system.context);
        ig.system.context.restore();
        */
    },

    drawAxes: function(ctx) {
        ctx.strokeStyle = 'rgb(192,0,0)';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(1, 0);
        ctx.stroke();
        ctx.strokeStyle = 'rgb(0,192,0)';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 1);
        ctx.stroke();
    },

    bindDebugDrawCallbacks: function(debugDraw) {
        var self = this;
        Box2D.customizeVTable(debugDraw, [{
                original: Box2D.b2Draw.prototype.DrawSegment,
                replacement: function(ths, vert1, vert2, color) {
                    self.setColorFromDebugDrawCallback(color);
                    self.drawSegment(vert1, vert2);
                }
            }
        ]);
        Box2D.customizeVTable(debugDraw, [{
                original: Box2D.b2Draw.prototype.DrawPolygon,
                replacement: function(ths, vertices, vertexCount, color) {
                    self.setColorFromDebugDrawCallback(color);
                    self.drawPolygon(vertices, vertexCount, false);
                }
            }
        ]);
        Box2D.customizeVTable(debugDraw, [{
                original: Box2D.b2Draw.prototype.DrawSolidPolygon,
                replacement: function(ths, vertices, vertexCount, color) {
                    self.setColorFromDebugDrawCallback(color);
                    self.drawPolygon(vertices, vertexCount, true);
                }
            }
        ]);
        Box2D.customizeVTable(debugDraw, [{
                original: Box2D.b2Draw.prototype.DrawCircle,
                replacement: function(ths, center, radius, color) {
                    self.setColorFromDebugDrawCallback(color);
                    var dummyAxis = b2Vec2(0, 0);
                    self.drawCircle(center, radius, dummyAxis, false);
                }
            }
        ]);
        Box2D.customizeVTable(debugDraw, [{
                original: Box2D.b2Draw.prototype.DrawSolidCircle,
                replacement: function(ths, center, radius, axis, color) {
                    self.setColorFromDebugDrawCallback(color);
                    self.drawCircle(center, radius, axis, true);
                }
            }
        ]);
        Box2D.customizeVTable(debugDraw, [{
                original: Box2D.b2Draw.prototype.DrawTransform,
                replacement: function(ths, transform) {
                    self.drawTransform(transform);
                }
            }
        ]);
    }

});

});