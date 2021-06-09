const nonAlphanumericRegex = /[^a-zA-Z0-9\s]+/g;
const titleCaseRegex = /(^\w{1})|(\s{1}\w{1})/g;
const allowedCharacters = /[/]+/g;
const multipleSpaces = /[\s]+/g;

export const editCompanyTypeDisplay = (companyTypeKey: string, display: string): string => {
  let editedDisplay: string = removeNonAlphanumericChars(display);
  editedDisplay = removedUnrequiredWords(companyTypeKey, editedDisplay, display);
  if (editedDisplay.length === 0) {
    return display;
  }
  return ensureTitleCase(editedDisplay);
};

const removeNonAlphanumericChars = (display: string): string => {
  return display.replace(nonAlphanumericRegex, " ");
};

const ensureTitleCase = (editedDisplay: string): string => {
  return editedDisplay.replace(titleCaseRegex, match => match.toUpperCase());
};

const removedUnrequiredWords = (companyTypeKey: string, editedDisplay: string, display: string): string => {
  const displayArray: string[] = editedDisplay.split(" ");
  const alphanumerickey: string = companyTypeKey.replace(nonAlphanumericRegex, " ");
  for (let index = 0; index < displayArray.length; index++) {
    const singleWord: string = displayArray[index];
    if (!alphanumerickey.toLowerCase().includes(singleWord.toLowerCase())) {
      editedDisplay = handleAllowNonAlphanumericChars(singleWord, editedDisplay, display);
    }
  }
  return removeExcessWhitespaces(editedDisplay);
};

const handleAllowNonAlphanumericChars = (singleWord: string, editedDisplay: string, display: string): string => {
  if (display.match(allowedCharacters)){
    return display.replace(singleWord, "");
  } else {
    return editedDisplay.replace(singleWord, "");
  }
};

const removeExcessWhitespaces = (editedDisplay: string): string => {
  editedDisplay = editedDisplay.replace(multipleSpaces, " ");
  return editedDisplay.trim();
};

