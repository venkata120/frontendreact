export const animations = {
  durations: {
    fastest: 100,
    fast: 150,
    normal: 250,
    slow: 350,
    slowest: 500,
  },
  easings: {
    default: [0.4, 0, 0.2, 1],
    in: [0.4, 0, 1, 1],
    out: [0, 0, 0.2, 1],
    bounce: [0.68, -0.55, 0.265, 1.55],
  },
} as const;

export const transitionPresets = {
  fade: {
    duration: animations.durations.normal,
    easing: animations.easings.default,
  },
  scale: {
    duration: animations.durations.fast,
    easing: animations.easings.bounce,
  },
  slideUp: {
    duration: animations.durations.normal,
    easing: animations.easings.out,
  },
} as const;
