import { useMutation, useQuery } from "react-query";
import { Link } from "react-router-dom";
import { ehrbaseClient, QueryResult } from "./client";
import {
  Avatar,
  Container,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { Fragment } from "react/jsx-runtime";
import moment from "moment";

const ehrQuery = `
SELECT 
  e/ehr_id/value, 
  e/time_created/value 
FROM EHR e
`;

export const Home = () => {
  const patients = useQuery({
    queryKey: ["ehrs"],
    queryFn() {
      return ehrbaseClient.post<QueryResult>(
        "/query/aql",
        {
          q: ehrQuery,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
    },
  });

  const patientCreate = useMutation({
    mutationKey: ["create-patient"],
    mutationFn() {
      return ehrbaseClient.post("/ehr", undefined, {
        headers: {
          Prefer: "return=minimal",
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
    },
  });

  function createPatient() {
    patientCreate.mutateAsync().then(() => patients.refetch());
  }

  return (
    <Container>
      <Stack
        direction={"row"}
        justifyContent={"space-between"}
        alignItems={"center"}
      >
        <Typography variant="h5">Patients</Typography>
        <IconButton onClick={createPatient}>
          <Add />
        </IconButton>
      </Stack>

      <List>
        {patients.data?.data.rows
          .sort(([, a], [, b]) => new Date(b).getTime() - new Date(a).getTime())
          .map(([id, createdAt]) => (
            <Fragment key={id}>
              <ListItem
                component={Link}
                to={`/patient/${id}`}
                alignItems="center"
              >
                <ListItemAvatar>
                  <Avatar alt={id} />
                </ListItemAvatar>
                <ListItemText
                  primary={id}
                  secondary={moment(createdAt).fromNow()}
                />
              </ListItem>
              <Divider component={"li"} />
            </Fragment>
          ))}
      </List>
    </Container>
  );
};
