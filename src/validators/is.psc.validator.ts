export const isPscFlagValid = (isPsc: string): boolean => {

  if (isPsc !== 'false' && isPsc !== 'true') {
    return false;
  }

  return true;
};
