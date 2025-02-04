import { useEffect, useRef, useState } from "react";
import { AutoForm, MedblocksAutoForm } from "./auto-form";
import {
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { useMutation } from "react-query";
import { ehrbaseClient } from "./client";
import { Add, Close, Delete, Edit } from "@mui/icons-material";
import template from "./template.json";

type Props = {
  title: string;
  ehrId: string;
  templateId: string;
  compositionId?: string;
  open: boolean;
  close(): void;
};

export const CompositionEditor: React.FC<Props> = ({
  open,
  close,
  title,
  templateId,
  compositionId,
  ehrId,
}) => {
  const form = useRef<MedblocksAutoForm | null>(null);

  // const webTemplate = useQuery({
  //   queryKey: ["web-template"],
  //   queryFn() {
  //     return ehrbaseClient
  //       .get(`/definition/template/adl1.4/${templateId}`, {
  //         headers: {
  //           "Content-Type": "application/json",
  //           Accept: "application/openehr.wt+json",
  //           Prefer: "return=representation",
  //         },
  //       })
  //       .then((response) => response.data);
  //   },
  // });

  const createComposition = useMutation({
    mutationKey: ["create-compositions"],
    mutationFn(flatJson: object) {
      return ehrbaseClient
        .post(`/ehr/${ehrId}/composition?templateId=${templateId}`, flatJson, {
          headers: {
            "Content-Type": "application/openehr.wt.flat.schema+json",
            Accept: "application/openehr.wt.flat.schema+json",
            Prefer: "return=representation",
          },
        })
        .then((response) => response.data);
    },
    onSuccess() {
      form.current?.clear();
      close();
    },
    onError(error: Error) {
      alert("Failed to save: " + error.message);
    },
  });

  const updateComposition = useMutation({
    mutationKey: ["update-composition", compositionId],
    mutationFn(flatJson: object) {
      const [uid] = compositionId?.split("::") || [];
      return ehrbaseClient
        .put(
          `/ehr/${ehrId}/composition/${uid}?templateId=${templateId}`,
          flatJson,
          {
            headers: {
              "Content-Type": "application/openehr.wt.flat.schema+json",
              Accept: "application/openehr.wt.flat.schema+json",
              Prefer: "return=representation",
              "If-Match": compositionId,
            },
          }
        )
        .then((response) => response.data);
    },
    onSuccess() {
      form.current?.clear();
      close();
    },
    onError(error: Error) {
      alert("Failed to update: " + error.message);
    },
  });

  function handleSubmit() {
    const data = form.current?.export();

    if (!compositionId) {
      return createComposition.mutateAsync(data);
    }

    return updateComposition.mutateAsync(data);
  }

  useEffect(() => {
    if (compositionId) {
      ehrbaseClient
        .get(`/ehr/${ehrId}/composition/${compositionId}`, {
          headers: {
            Accept: "application/openehr.wt.flat.schema+json",
          },
        })
        .then((response) => response.data)
        .then((flatJson) => {
          return form.current?.import(flatJson);
        });
    }
  }, []);

  return (
    <Dialog open={open} fullWidth maxWidth="md">
      <DialogTitle>
        <Stack direction={"row"} justifyContent={"space-between"}>
          <Typography variant="h5">{title}</Typography>
          <IconButton onClick={() => close()}>
            <Close />
          </IconButton>
        </Stack>
      </DialogTitle>

      <AutoForm ref={form} webTemplate={template as any} />

      <DialogActions>
        <Button variant="contained" onClick={handleSubmit}>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

type DialogProps = Omit<Props, "open" | "close"> & {
  onSave(): void;
};

export const AddCompositionButton: React.FC<DialogProps> = (props) => {
  const [open, setOpen] = useState(false);

  function toggle() {
    setOpen((v) => !v);
  }

  function handleClose() {
    toggle();
    props.onSave();
  }

  return (
    <>
      <IconButton onClick={toggle}>
        <Add />
      </IconButton>
      {open ? (
        <CompositionEditor
          key={Date.now()}
          open={open}
          close={handleClose}
          {...props}
        />
      ) : null}
    </>
  );
};

export const UpdateCompositionButton: React.FC<DialogProps> = (props) => {
  const [open, setOpen] = useState(false);

  function toggle() {
    setOpen((v) => !v);
  }

  function handleClose() {
    toggle();
    props.onSave();
  }

  return (
    <>
      <IconButton onClick={toggle}>
        <Edit />
      </IconButton>
      {open ? (
        <CompositionEditor
          key={Date.now()}
          open={open}
          close={handleClose}
          {...props}
        />
      ) : null}
    </>
  );
};

export const DeleteCompositionButton: React.FC<{
  compositionId: string;
  ehrId: string;
  onDelete(): void;
}> = ({ compositionId, ehrId, onDelete }) => {
  function handleDelete() {
    const confirmed = confirm("Are you sure you want to delete this record?");

    if (!confirmed) return;

    return ehrbaseClient
      .delete(`/ehr/${ehrId}/composition/${compositionId}`)
      .then(() => onDelete())
      .catch((error: Error) => alert("Failed to delete: " + error.message));
  }

  return (
    <IconButton onClick={handleDelete}>
      <Delete />
    </IconButton>
  );
};
