/**
 * Creates a random car name by selecting a random brand
 * and a random model from the provided data.
 *
 * @param {Record<string, string[]>} data - An object where keys are car brands (string)
 * and values are arrays of models
 * @return {string} - A randomly generated car name in the format "Brand Model"
 */
export const getRandomCarName = (data: Record<string, string[]>): string => {
  const brands: string[] = Object.keys(data);
  const brandIndex: number = Math.floor(Math.random() * brands.length);
  const randomBrandName: string = brands[brandIndex];

  const model: string[] = data[randomBrandName];
  const modelIndex: number = Math.floor(Math.random() * model.length);
  const randomModelName: string = model[modelIndex];

  return `${randomBrandName} ${randomModelName}`;
};

/**
 * Generates and returns a random hexadecimal color string
 *
 *  @return {string} - A random HEX color
 */
export const getRandomHexColor = (): string => {
  const fillString = '0';
  const maxLength = 6;
  const maxColorValue = 16_777_215; // From 0 to FFFFFF

  const randomColor = Math.floor(Math.random() * (maxColorValue + 1)).toString(
    16
  );
  const hexColorString = randomColor.padStart(maxLength, fillString);

  return `#${hexColorString}`;
};
