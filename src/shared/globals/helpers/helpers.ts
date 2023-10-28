export const parseJson = (str: string) => {
  try {
    return JSON.parse(str);
  } catch (error) {
    str;
  }
};
