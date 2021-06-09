const nonAlphanumericRegex = /[^a-zA-Z0-9\s]+/g;
const titleCaseRegex = /(^\w{1})|(\s{1}\w{1})/g;
const allowedCharacters = /[/]+/g;
const multipleSpaces = /[\s]+/g;

export const editCompanyTypeDisplay = (companyTypeKey: string, displayValue: string): string => {
  let editedDisplayValue: string = removeNonAlphanumericChars(displayValue);
  editedDisplayValue = removeUnrequiredWords(companyTypeKey, editedDisplayValue, displayValue);
  if (editedDisplayValue.length === 0) {
    return displayValue;
  }
  return ensureTitleCase(editedDisplayValue);
};

const removeNonAlphanumericChars = (displayValue: string): string => {
  return displayValue.replace(nonAlphanumericRegex, " ");
};

const ensureTitleCase = (editedDisplayValue: string): string => {
  return editedDisplayValue.replace(titleCaseRegex, match => match.toUpperCase());
};

const removeUnrequiredWords = (companyTypeKey: string, editedDisplayValue: string, displayValue: string): string => {
  const displayValueArray: string[] = editedDisplayValue.split(" ");
  const alphanumerickey: string = companyTypeKey.replace(nonAlphanumericRegex, " ");
  for (let index = 0; index < displayValueArray.length; index++) {
    const singleWord: string = displayValueArray[index];
    if (!alphanumerickey.toLowerCase().includes(singleWord.toLowerCase())) {
      editedDisplayValue = handleAllowNonAlphanumericChars(singleWord, editedDisplayValue, displayValue);
    }
  }
  return removeExcessWhitespaces(editedDisplayValue);
};

const handleAllowNonAlphanumericChars = (singleWord: string, editedDisplayValue: string, displayValue: string): string => {
  if (displayValue.match(allowedCharacters)){
    return displayValue.replace(singleWord, "");
  } else {
    return editedDisplayValue.replace(singleWord, "");
  }
};

const removeExcessWhitespaces = (editedDisplayValue: string): string => {
  editedDisplayValue = editedDisplayValue.replace(multipleSpaces, " ");
  return editedDisplayValue.trim();
};

