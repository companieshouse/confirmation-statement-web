import { RegisterLocation } from "private-api-sdk-node/dist/services/confirmation-statement";

export const mockRegisterLocation: RegisterLocation[] = [
  {
    registerTypeDesc: "Reg desc",
    sailAddress: {
      addressLine1: "Add Line 1",
      addressLine2: "Add Line 2",
      careOf: "care of",
      country: "country",
      locality: "locality",
      poBox: "po box",
      postalCode: "post code",
      premises: "premises",
      region: "region"
    }
  }
];

export const mockRegisterLocationNoReg: RegisterLocation[] = [
  {
    registerTypeDesc: "",
    sailAddress: {
      addressLine1: "Add Line 1",
      addressLine2: "Add Line 2",
      careOf: "care of",
      country: "country",
      locality: "locality",
      poBox: "po box",
      postalCode: "post code",
      premises: "premises",
      region: "region"
    }
  }
];

export const mockRegisterLocationNoRegNoSail: RegisterLocation[] = [
  {
    registerTypeDesc: "",
    sailAddress: {}
  }
];

