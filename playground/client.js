import axios from "axios";

export const ehrbaseClient = axios.create({
  baseURL: "http://localhost:8080/ehrbase/rest/openehr/v1",
});
