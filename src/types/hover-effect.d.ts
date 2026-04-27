declare module 'hover-effect' {
  interface HoverEffectOptions {
    parent: HTMLElement;
    intensity?: number;
    image1: string;
    image2: string;
    displacementImage: string;
    speedIn?: number;
    speedOut?: number;
    easing?: string;
    hover?: boolean;
  }

  class HoverEffect {
    constructor(options: HoverEffectOptions);
    destroy?: () => void;
  }

  export default HoverEffect;
}
