export const generateRandomIntegers: (integerLength: number) => number = (integerLength) => {
  const characters = '0123456789';
  let result = ' ';
  const charactersLength = characters.length;
  for (let i = 0; i < integerLength; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return parseInt(result, 10);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parseJson: (prop: string) => any = (prop) => {
  try {
    JSON.parse(prop);
  } catch (error) {
    return prop;
  }
  return JSON.parse(prop);
};

export const isDataURL: (value: string) => boolean = (value) => {
  const dataUrlRegex = /^\s*data:([a-z]+\/[a-z0-9-+.]+(;[a-z-]+=[a-z0-9-]+)?)?(;base64)?,([a-z0-9!$&',()*+;=\-._~:@\\/?%\s]*)\s*$/i;
  return dataUrlRegex.test(value);
};

export const shuffle: (list: string[]) => string[] = (list) => {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
};

export const escapeRegex: (text: string) => string = (text) => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};
