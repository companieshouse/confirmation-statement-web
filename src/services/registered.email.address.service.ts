export const getRegisteredEmailAddress = async (companyNumber: string): Promise<string> => {
  if (Math.random() > 0.5) { // TODO: implement actual check once sdk library updated
    return "name@example.com";
  } else {
    return "";
  }};

export const doesCompanyHaveEmailAddress = async (companyNumber: string): Promise<boolean> => {
  const emailAddress: string = await getRegisteredEmailAddress(companyNumber);
  if (emailAddress) {
    return true
  } else {
    return false;
  }
};
