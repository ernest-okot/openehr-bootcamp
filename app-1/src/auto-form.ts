import "medblocks-ui";
import "medblocks-ui/dist/styles";
import "medblocks-ui/dist/shoelace";
import { MedblocksAutoForm } from "medblocks-ui/dist/src/medblocks/form/autoForm";
import { createComponent } from "@lit/react";
import React from "react";

export { MedblocksAutoForm } from "medblocks-ui/dist/src/medblocks/form/autoForm";

export const AutoForm = createComponent({
  tagName: "mb-auto-form",
  elementClass: MedblocksAutoForm,
  react: React,
});
