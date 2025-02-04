const curl = `
curl --location --request POST 'https://openehr-bootcamp.medblocks.com/ehrbase/rest/openehr/v1/definition/template/adl1.4' \
--header 'Content-Type: application/xml' \
--header 'Prefer: return=representation' \
--data ''
`;

import axios from "axios";
import { readFile } from "fs/promises";

readFile("./nurse_vital_signs_ernest.v0.opt", "utf8")
  .then((content) =>
    axios.post(
      "https://openehr-bootcamp.medblocks.com/ehrbase/rest/openehr/v1/definition/template/adl1.4",
      content,
      {
        headers: {
          "Content-Type": "application/xml",
          Prefer: "return=representation",
        },
      }
    )
  )
  .then(console.log);
