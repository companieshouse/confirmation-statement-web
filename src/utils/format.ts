export const formatTitleCase = (str: string): string =>  {
  return str.replace(
    /\w\S*/g, (str) => {
      return str.charAt(0).toUpperCase() + str.substr(1).toLowerCase();
    });
};
