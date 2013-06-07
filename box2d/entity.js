ig.module(
    'plugins.box2d.entity'
)
.requires(
    'impact.entity',
    'plugins.box2d.game'
)
.defines(function(){


ig.Box2DEntity = ig.Entity.extend({
    body: null,
    angle: 0,

    init: function( x, y , settings ) {
        this.parent( x, y, settings );

        // Only create a box2d body when we are not in Weltmeister
        if( !ig.global.wm ) {
            this.createBody();
            this.body.entity = this;
        }
    },

    createBody: function() {
        var bodyDef = new Box2D.b2BodyDef();
        bodyDef.set_position(new Box2D.b2Vec2(
            (this.pos.x + this.size.x / 2) * Box2D.b2SCALE,
            (this.pos.y + this.size.y / 2) * Box2D.b2SCALE
        ));
        bodyDef.set_type(Box2D.b2_dynamicBody);
        this.body = ig.world.CreateBody(bodyDef);

        var shapeDef = new Box2D.b2PolygonShape();
        shapeDef.SetAsBox(
            this.size.x / 2 * Box2D.b2SCALE,
            this.size.y / 2 * Box2D.b2SCALE
        );

        var density = 1;
        this.body.CreateFixture(shapeDef, density);
    },

    update: function() {
        var pos = this.body.GetPosition();
        var x = pos.get_x();
        var y = pos.get_y();
        this.pos.x = x / Box2D.b2SCALE - this.size.x / 2;
        this.pos.y = y / Box2D.b2SCALE - this.size.y / 2;
        this.angle = this.body.GetAngle().round(2);

        /*
        // This logic should work to detect whether or not
        // the entity is standing. However, GetManifold()
        // doesn't seem to return an instance of b2Manifold.
        // https://github.com/kripken/box2d.js/issues/26
        this.standing = false;
        for(var edge = this.body.GetContactList(); edge.ptr !== 0; edge = edge.get_next()) {
            var contact = edge.get_contact();
            var manifold = contact.GetManifold();
            var localNormal = get_localNormal();
            if( localNormal.get_y() < 0 ) {
                this.standing = true;
                break;
            }
        }
        */

        if( this.currentAnim ) {
            this.currentAnim.update();
            this.currentAnim.angle = this.angle;
        }
    },

    kill: function() {
        ig.world.DestroyBody( this.body );
        this.parent();
    },

    touches: function( other ) {
        for(var edge = this.body.GetContactList(); edge.ptr !== 0; edge = edge.get_next()) {
            if(edge.get_other().entity === other) {
                return true;
            }
        }
        return false;
    }

});

});