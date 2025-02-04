import {
  Box,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { Link, useParams } from "react-router-dom";
import { Close } from "@mui/icons-material";
import { useQuery } from "react-query";
import moment from "moment";

import { ehrbaseClient, QueryResult } from "./client";
import {
  AddCompositionButton,
  DeleteCompositionButton,
  UpdateCompositionButton,
} from "./template";
import { Fragment } from "react/jsx-runtime";
import { useState } from "react";

const templateId = "vital_signs_ernest_final.v0";

const compositionsQuery = `
SELECT 
    c/uid/value as id,
    c/content[openEHR-EHR-OBSERVATION.pulse.v2]/data[at0002]/events[at0003]/data[at0001]/items[at0004]/value as heartRate,
    c/content[openEHR-EHR-OBSERVATION.blood_pressure.v2]/data[at0001]/events[at0006]/data[at0003]/items[at0004]/value as bpSystolic,
    c/content[openEHR-EHR-OBSERVATION.blood_pressure.v2]/data[at0001]/events[at0006]/data[at0003]/items[at0005]/value as bpDiastolic,
    c/content[openEHR-EHR-OBSERVATION.pulse_oximetry.v1]/data[at0001]/events[at0002]/data[at0003]/items[at0006]/value as spo2,
    c/content[openEHR-EHR-OBSERVATION.height.v2]/data[at0001]/events[at0002]/data[at0003]/items[at0004]/value as height,
    c/content[openEHR-EHR-OBSERVATION.body_weight.v2]/data[at0002]/events[at0003]/data[at0001]/items[at0004]/value as weight,
    c/context/start_time/value as startedAt
FROM 
    EHR e CONTAINS COMPOSITION c 
WHERE 
    c/archetype_details/template_id/value = $template_id AND
    e/ehr_id/value = $ehr_id
ORDER BY c/context/start_time/value DESC
`;

export const Patient = () => {
  const [version, setVersion] = useState(Date.now());
  const { id } = useParams();

  if (!id) {
    return <div />;
  }

  return (
    <Container>
      <Stack
        direction={"row"}
        alignItems={"center"}
        justifyContent={"center"}
        spacing={1}
      >
        <Stack flexGrow={1} direction={"row"} spacing={1} alignItems={"center"}>
          <Stack component={Link} to={"/"}>
            <IconButton>
              <Close />
            </IconButton>
          </Stack>
          <Typography variant="h5">Vitals - Patient {id}</Typography>
        </Stack>
        <Stack>
          <AddCompositionButton
            ehrId={id}
            templateId={templateId}
            title="Record Vitals"
            onSave={() => setVersion(Date.now())}
          />
        </Stack>
      </Stack>

      <Stack marginTop={1}>
        <Compositions key={version} templateId={templateId} ehrId={id} />
      </Stack>
    </Container>
  );
};

const Compositions: React.FC<{
  ehrId: string;
  templateId: string;
}> = ({ ehrId, templateId }) => {
  const compositions = useQuery({
    queryKey: ["compositions"],
    queryFn() {
      return ehrbaseClient
        .post<QueryResult>(
          "/query/aql",
          {
            q: compositionsQuery,
            query_parameters: { ehr_id: ehrId, template_id: templateId },
          },
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        )
        .then((response) => response.data);
    },
  });

  if (compositions.isLoading || !compositions.data) {
    return (
      <Box
        margin={8}
        display={"flex"}
        alignItems={"center"}
        justifyContent={"center"}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <List>
      {compositions.data?.rows?.map?.(
        ([
          id,
          heartRate,
          bpSystolic,
          bpDiastolic,
          spo2,
          height,
          weight,
          startedAt,
        ]) => (
          <Fragment key={id}>
            <ListItem alignItems="center">
              <ListItemText
                secondary={moment(startedAt).fromNow()}
                primary={[
                  heartRate &&
                    `Heart Rate: ${heartRate.magnitude}${heartRate.units}`,
                  bpSystolic &&
                    `BPS: ${bpSystolic.magnitude}${bpSystolic.units}`,
                  bpDiastolic &&
                    `BPD: ${bpDiastolic.magnitude}${bpDiastolic.units}`,
                  spo2 && `SpO₂: ${spo2.numerator}/${spo2.denominator}`,
                  height && `Height: ${height.magnitude}${height.units}`,
                  weight && `Weight: ${weight.magnitude}${weight.units}`,
                ]
                  .filter(Boolean)
                  .join("; ")}
              />
              <Stack direction={"row"} spacing={1}>
                <UpdateCompositionButton
                  title="Update Vitals"
                  ehrId={ehrId}
                  compositionId={id}
                  templateId={templateId}
                  onSave={() => compositions.refetch()}
                />
                <DeleteCompositionButton
                  ehrId={ehrId}
                  compositionId={id}
                  onDelete={() => compositions.refetch()}
                />
              </Stack>
            </ListItem>
            <Divider component={"li"} />
          </Fragment>
        )
      )}
    </List>
  );
};
