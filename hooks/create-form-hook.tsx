import {
  CheckboxWindow95Field,
  DropdownWindow95Field,
  FieldError,
  FileUploadWindow95Field,
  SubmitWindow95Button,
  TextWindow95Field,
} from "@/components/form";
import { createFormHookContexts, createFormHook } from "@tanstack/react-form";

export const { fieldContext, formContext, useFieldContext } =
  createFormHookContexts();

const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextWindow95Field,
    DropdownWindow95Field,
    CheckboxWindow95Field,
    FileUploadWindow95Field,
  },
  formComponents: {
    SubmitWindow95Button,
    FieldError,
  },
});

export { useAppForm, withForm };
