declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.mp3' {
  const src: string;
  export default src;
}

declare module '*.svg?raw' {
  const content: string;
  export default content;
}
