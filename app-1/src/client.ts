import axios from "axios";

export interface QueryResult {
  meta: {
    _type: "RESULTSET";
    _schema_version: string;
    _created: string;
    _executed_aql: string;
    resultsize: number;
  };
  q: string;
  columns: Array<{
    path: string;
    name: string;
  }>;
  rows: [any[]];
}

export const ehrbaseClient = axios.create({
  baseURL: "https://openehr-bootcamp.medblocks.com/ehrbase/rest/openehr/v1",
});
