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
    maxVel: { x: 999999, y: 999999 },
    contactBuffer: [],

    isBullet: false,
    fixedRotation: false,

    init: function( x, y , settings ) {
        this.parent( x, y, settings );

        // Only create a box2d body when we are not in Weltmeister
        if( !ig.global.wm ) {
            this.createBody();
            this.body.entity = this;
            this.body.SetFixedRotation(this.fixedRotation);
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
        this.body.SetBullet(this.isBullet);

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
        this.last.x = this.pos.x;
        this.last.y = this.pos.y;
        this.angle = this.body.GetAngle().round(2);

        this.limitVelocity();
        this.body.SetGravityScale(this.gravityFactor);

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
    },

    limitVelocity: function() {
        var velocity = this.body.GetLinearVelocity();
        var x = velocity.get_x() / Box2D.b2SCALE;
        var y = velocity.get_y() / Box2D.b2SCALE;
        if(x < -this.maxVel.x)     x = -this.maxVel.x;
        else if(x > this.maxVel.x) x = this.maxVel.x;
        if(y < -this.maxVel.y)     y = -this.maxVel.y;
        else if(y > this.maxVel.y) y = this.maxVel.y;
        velocity.set_x(x * Box2D.b2SCALE);
        velocity.set_y(y * Box2D.b2SCALE);
        this.body.SetLinearVelocity( velocity, this.body.GetPosition() );
    }

});

});