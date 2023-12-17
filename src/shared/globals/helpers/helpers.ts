export const parseJson = (str: string) => {
  try {
    return JSON.parse(str);
  } catch (error) {
    str;
  }
};

export const generateRandomIntegers = (integerLength: number) => {
  const characters = '0123456789';
  let result = ' ';
  const charactersLength = characters.length;
  for (let i = 0; i < integerLength; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return parseInt(result, 10);
};
