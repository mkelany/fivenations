/**
 * Registers an object to fetch functions representing effects
 * The function needs to return a bool value. If the value is false
 * the effect will be regarded as finished and removed from the 
 * effect queue supervised by the EffectManager instance
 */
define('Entity.MotionManager.Effects', ['Util'], function(Util) {

	var effects = {

        /**
         * Initialise the helper variable for the movement
         * @return {boolean} always returns false
         */
        initMovement: function(motionManager) {
            var targetCoords; 
            var distance;
            var rotationOffset; 

            targetCoords = motionManager.activity.getCoords();
            distance = Phaser.Math.distance(motionManager.sprite.x, motionManager.sprite.y, targetCoords.x, targetCoords.y);
            rotationOffset = Math.floor(motionManager.rotation.maxAngleCount * 0.75);

            motionManager.movement.originX = motionManager.sprite.x;
            motionManager.movement.originY = motionManager.sprite.y;
            motionManager.movement.targetX = targetCoords.x;
            motionManager.movement.targetY = targetCoords.y;
            motionManager.movement.targetInitialDistance = distance;
            motionManager.movement.targetDragTreshold = Math.min(motionManager.movement.maxTargetDragTreshold, distance / 2);
            motionManager.movement.targetAngle = Math.atan2(motionManager.movement.targetY - motionManager.sprite.y, motionManager.movement.targetX - motionManager.sprite.x);

            if (motionManager.rotation.maxAngleCount === 1) {
                motionManager.movement.currentAngle = motionManager.movement.targetAngle;
                motionManager.rotation.targetConsolidatedAngle = motionManager.rotation.currentConsolidatedAngle = 0;
            } else {
                motionManager.rotation.calculatedAngle = Phaser.Math.radToDeg(Math.atan2(targetCoords.y - motionManager.sprite.y, targetCoords.x - motionManager.sprite.x));
                if (motionManager.rotation.calculatedAngle < 0) {
                    motionManager.rotation.calculatedAngle = 360 - Math.abs(motionManager.rotation.calculatedAngle);
                }
                motionManager.rotation.targetConsolidatedAngle = (Math.floor(motionManager.rotation.calculatedAngle / (360 / motionManager.rotation.maxAngleCount)) + rotationOffset) % motionManager.rotation.maxAngleCount;

                motionManager.rotation.stepNumberToRight = Util.calculateStepTo(motionManager.rotation.currentConsolidatedAngle, motionManager.rotation.targetConsolidatedAngle, motionManager.rotation.maxAngleCount, 1);
                motionManager.rotation.stepNumberToLeft = Util.calculateStepTo(motionManager.rotation.currentConsolidatedAngle, motionManager.rotation.targetConsolidatedAngle, motionManager.rotation.maxAngleCount, -1);
            }

            motionManager.isEntityArrivedAtDestination = false;
            motionManager.isEntityStoppedAtDestination = false;

            return false;
        },

		/**
         * Move the given entity object towards the x/y coordinates at a steady velocity.
         * @return {boolean} returning false when the effect is no longer must be applied on the entity
         */
        moveToTarget: function(motionManager) {

            motionManager.movement.acceleration = 0;
            if (motionManager.movement.distance > motionManager.movement.targetDragTreshold){
                return true;
            } else {
                motionManager.isEntityArrivedAtDestination = true;
                return false;
            }
            
        },

        /**
         * Move the given entity towards the target coordinates with an increasing velocity
         * @return {boolean} returning false when the effect is no longer must be applied on the entity
         */
        accelerateToTarget: function(motionManager) {

            motionManager.movement.acceleration = motionManager.movement.maxAcceleration;
            return motionManager.movement.distanceInverse < motionManager.movement.targetDragTreshold && motionManager.movement.velocity < motionManager.movement.maxVelocity;
        },

        /**
         * Making the given entity stop with a certain amount of drag
         * @return {boolean} returning false when the effect is no longer must be applied on the entity
         */
        stopping: function(motionManager) {

            motionManager.movement.acceleration = -motionManager.movement.maxAcceleration;
            if (motionManager.movement.distance > 0 && motionManager.movement.distanceFromOrigin < motionManager.movement.targetInitialDistance && motionManager.movement.velocity > 0){
                return true;
            } else {
                if (motionManager.isEntityArrivedAtDestination) {
                    motionManager.isEntityStoppedAtDestination = true;
                }
                return false;
            }

        },

        /**
         * Reset all the helper variables influencing the given entity so that further effects 
         * can be applied on the entitiy
         * @return {boolean} returning false when the effect is no longer must be applied on the entity
         */
        resetMovement: function(motionManager) {

            motionManager.movement.acceleration = 0;
            motionManager.movement.velocity = 0;
            motionManager.rotation.angularVelocity = 0;

            return false;
        },

        /**
         * Altering the rotation of the given entity to face towards the target coordinats 
         * @return {boolean} returning false when the effect is no longer must be applied on the entity
         */
        rotateToTarget: function(motionManager) {

            // if the entity is already accrelerating than it doesn't have to stop for rotating
            if (motionManager.movement.velocity > 0) {
                // it also can rotate with a lot higher speed to mimic flying units in Blizzard's Starcraft
                motionManager.rotation.angularVelocity = motionManager.rotation.maxAngularVelocity * 1.5;
                // jumping to the next effect
                return false;
            }

            // rotating with default speed until the entity arrives at the target angle 
            motionManager.rotation.angularVelocity = motionManager.rotation.maxAngularVelocity;
            return motionManager.rotation.currentConsolidatedAngle !== motionManager.rotation.targetConsolidatedAngle;
        }

    };


    return {

        /**
         * Returns a function that is registered as an effect 
         * with the given name
         * @param  {string} name [id of the effect]
         * @return {function} function that represents the requested effect 
         */
        get: function(name) {
            if (!name || !effects[name]) throw 'No effect is registered with the given name!';
            return effects[name];
        }

    }

});