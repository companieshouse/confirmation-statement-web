export default () => {
  process.env.COOKIE_NAME = "cookie_name";
  process.env.COOKIE_DOMAIN = "cookie_domain";
  process.env.COOKIE_SECRET = "123456789012345678901234";
  process.env.CACHE_SERVER = "cache_server";
  process.env.SHOW_SERVICE_OFFLINE_PAGE = "false";
  process.env.CHS_API_KEY = "12345";
  process.env.INTERNAL_API_URL = "http://localhost:9333";
  process.env.FEATURE_FLAG_PRIVATE_SDK_12052021 = "true";
  process.env.CHS_URL = "http://chs.local";
  process.env.INVALID_COMPANY_STATUSES = "Converted / Closed,Dissolved";
};
