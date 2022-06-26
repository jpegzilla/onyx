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
export const PI = Math.PI
export const ANGLE_MAX = 360

// standard white points

// reference values of a perfect reflecting diffuser (cie 1931)
// https://www.w3.org/TR/css-color-4/#:~:text=//%20standard%20white%20points%2C%20defined%20by%204%2Dfigure%20CIE%20x%2Cy%20chromaticities
export const CIE_1931_XYZ_REFERENCE = {
  D50: [96.422, 100, 82.521],
  D55: [95.682, 100, 92.149],
  D65: [95.047, 100, 108.883],
  D75: [94.972, 100, 122.638],
}

// reference values of a perfect reflecting diffuser (cie 1964)
// https://lost-contact.mit.edu/afs/inf.ed.ac.uk/group/teaching/matlab-help/R2016b/images/ref/whitepoint.html
export const CIE_1964_XYZ_REFERENCE = {
  D50: [96.72, 100, 81.427],
  D55: [95.799, 100, 90.926],
  D65: [94.811, 100, 107.304],
  D75: [94.416, 100.0, 120.641],
}

// xyz / srgb

export const RGB_THRESHOLD = 0.04045
export const XYZ_THRESHOLD = 0.08
