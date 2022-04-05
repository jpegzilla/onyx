// luminance

export const LUM_LOWER = 0.03928
export const LUM_DIVISOR_H = 12.92
export const LUM_DIVISOR_L = 1.055
export const LUM_ADDEND = 0.055
export const LUM_EXP = 2.4
export const LUM_COEFF = 0.2126
export const LUM_R_ADDEND = 0.7152
export const LUM_G_ADDEND = 0.0722

// rgb

export const RGB_MAX = 255

// brightness

export const BRIGHTNESS = {
  R: 0.299,
  G: 0.587,
  B: 0.114,
}

// math

export const EPSILON = 216 / 24389
export const KAPPA = 24389 / 27
export const TAU = 2 * Math.PI

// standard white points
// https://www.w3.org/TR/css-color-4/#:~:text=//%20standard%20white%20points%2C%20defined%20by%204%2Dfigure%20CIE%20x%2Cy%20chromaticities

export const D50 = [0.3457 / 0.3585, 1.0, (1.0 - 0.3457 - 0.3585) / 0.3585]
export const D65 = [0.3127 / 0.329, 1.0, (1.0 - 0.3127 - 0.329) / 0.329]

// xyz / srgb

export const RGB_THRESHOLD = 0.04045
export const XYZ_THRESHOLD = 0.008856
