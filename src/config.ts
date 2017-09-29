// drawing configs
export const vertexRadius = 25;

// Spring forces
export const springLength = 50;
export const stiffness = 0.03;
export const vertexMass = 10;
export const damping = 0.04;

// electrostatic repulsion
export const coulombConst = 1;
export const vertexCharge = 100;

export const cappedElectro = true;
export const electroCapStrengthDistance = vertexRadius / 2;

// export const minDistForBarnesHutApprox = vertexRadius * 5;
export const theta = 0.85;

// centering 'force'
export const centerForce = 1; // max of 1, min of 0

// Gravity
export const G = 2; // gravitational constants

/**
 * Styles
 */

export const backgroundColour = "#019851";
export const nodeBodyColour = "#446CB3";
export const edgeColour = "#E4F1FE";
export const borderWidth = 10;
export const edgeWidth = 15;
