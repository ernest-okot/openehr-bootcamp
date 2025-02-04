import { ehrbaseClient } from "./client.js";

ehrbaseClient
  .post(
    "/query/aql",
    {
      q: "SELECT e/ehr_id/value FROM EHR e",
    },
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  )
  .then(console.log);
