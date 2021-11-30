
import {
  CORPORATE_DIRECTORS_PATH,
  CORPORATE_SECRETARIES_PATH,
  NATURAL_PERSON_DIRECTORS_PATH,
  NATURAL_PERSON_SECRETARIES_PATH } from "types/page.urls";
import { OFFICER_TYPE } from "utils/constants";


enum OFFICER_DETAILS_PAGE_ID {
  NATURAL_SECRETARIES,
  CORPORATE_SECRETARIES,
  NATURAL_DIRECTORS,
  CORPORATE_DIRECTORS
}

interface OfficerDetailsPage {
  officerType: OFFICER_TYPE,
  pageId: OFFICER_DETAILS_PAGE_ID,
  url: String
}

// Order of the array needs to be the order the screens are displayed to user
const officerDetailsPages: OfficerDetailsPage[] = [
  {
    officerType: OFFICER_TYPE.NATURAL_SECRETARY,
    pageId: OFFICER_DETAILS_PAGE_ID.NATURAL_SECRETARIES,
    url: NATURAL_PERSON_SECRETARIES_PATH
  },
  {
    officerType: OFFICER_TYPE.CORPORATE_SECRETARIES,
    pageId: OFFICER_DETAILS_PAGE_ID.CORPORATE_SECRETARIES,
    url: CORPORATE_SECRETARIES_PATH
  },
  {
    officerType: OFFICER_TYPE.NATURAL_DIRECTOR,
    pageId: OFFICER_DETAILS_PAGE_ID.NATURAL_DIRECTORS,
    url: NATURAL_PERSON_DIRECTORS_PATH
  },
  {
    officerType: OFFICER_TYPE.CORPORATE_DIRECTORS,
    pageId: OFFICER_DETAILS_PAGE_ID.CORPORATE_DIRECTORS,
    url: CORPORATE_DIRECTORS_PATH
  }
];

const getNextPageUrl = (currentPageId: OFFICER_DETAILS_PAGE_ID, officerTypes: OFFICER_TYPE[]): String | undefined => {
  const officerDetailsPagesLength = officerDetailsPages.length;
  for (let i = 0; i < officerDetailsPagesLength; i++) {
    // find position in the officerDetailsPages array of current page
    if (officerDetailsPages[i].pageId === currentPageId) {
      // then search through remaining pages to find the next one to show
      for (let j = i + 1; j < officerDetailsPagesLength; j++) {
        const page = officerDetailsPages[j];
        if (officerTypes.includes(page.officerType)) {
          return page.url;
        }
      }
    }
  }
};

export const activeOfficerDetailsNavigator = {
  OFFICER_DETAILS_PAGE_ID,
  getNextPageUrl
};
