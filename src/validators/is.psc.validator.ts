export const isPscFlagValid = (isPsc: string): boolean => {

  if (!isPsc) {
    return false;
  }

  if (isPsc !== 'false' && isPsc !== 'true') {
    return false;
  }

  return true;
};
