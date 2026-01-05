// Game configuration constants

export const GAME_CONFIG = {
  // Game dimensions
  WIDTH: 800,
  HEIGHT: 1200,

  // Player car
  PLAYER_START_X: 400,
  PLAYER_START_Y: 1000,
  PLAYER_CAR_WIDTH: 40,
  PLAYER_CAR_HEIGHT: 60,
  MAX_SPEED: 250, // km/h
  ACCELERATION: 10, // km/h per frame
  BRAKING: 10, // km/h per frame
  AUTO_DECELERATION: 5, // km/h per frame

  // Lives and fuel
  INITIAL_LIVES: 3,
  INITIAL_FUEL: 100,
  FUEL_DEPLETION_RATE: 1, // per second
  FUEL_PICKUP_VALUE: 10, // fuel per pickup
  TOTAL_FUEL_PICKUPS: 5,

  //Fuel pickup
  FUEL_PICKUP_WIDTH: 40,
  FUEL_PICKUP_HEIGHT: 60,

  // Enemy cars
  ENEMY_CAR_WIDTH: 40,
  ENEMY_CAR_HEIGHT: 60,
  ENEMY_SPEED_MIN: 80, // km/h
  ENEMY_SPEED_MAX: 180, // km/h
  ENEMY_SPAWN_DELAY_MIN: 2000, // ms
  ENEMY_SPAWN_DELAY_MAX: 3500, // ms

  // Road
  ROAD_WIDTH: 400,
  ROAD_CENTER_X: 400,
  ROAD_LEFT_BOUND: 200,
  ROAD_RIGHT_BOUND: 600,
  LANE_POSITIONS: [300, 400, 500], // X positions for 3 lanes
  SCROLL_SPEED_FACTOR: 4, // Multiplier for speed to pixels conversion

  // Collision
  COLLISION_PUSH_FORCE: 300,
  INVINCIBILITY_DURATION: 1000, // ms
  SPEED_REDUCTION_ON_HIT: 0.5, // 50%

  // Scoring
  SCORE_DISTANCE_MULTIPLIER: 1,
  SCORE_OVERTAKE_BONUS: 50,
  SPEED_BONUS_THRESHOLDS: [
    { min: 0, max: 100, multiplier: 1 },
    { min: 101, max: 200, multiplier: 1.5 },
    { min: 201, max: 250, multiplier: 2 }
  ],

  // Colors
  COLORS: {
    GRASS: 0x228b22,
    // ROAD: 0x4a4a4a,
    ROAD: 0x808080,
    LANE_MARK: 0xffffff,
    PLAYER_CAR: 0xff0000,
    ENEMY_CARS: [0x0000ff, 0xffff00, 0x00ff00],
    FUEL_PICKUP: 0xffaa00,
    HUD_TEXT: '#ffffff',
    HUD_SHADOW: '#000000'
  }
};
