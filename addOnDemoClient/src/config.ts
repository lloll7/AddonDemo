const domain = import.meta.env.VITE_APP_EWL_DOMAIN;

const ewlApiUrl = `http://${domain}/v2`;
const localUrl = "http://localhost:5174";

export { ewlApiUrl, localUrl };
