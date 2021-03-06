import React, { useEffect, useState } from "react";
import { FunctionComponent } from "react";
import qs from "query-string";
import { useLocation } from "react-router-dom";
import { RecoveryRequest } from "@oryd/kratos-client";
import { useKratos, useLogger } from "../services";
import { KratosForm, KratosMessages } from "../components";
import { useTranslation } from "react-i18next";

export const Recovery: FunctionComponent = () => {
  const [body, setBody] = useState<RecoveryRequest>();
  const location = useLocation();
  const { request } = qs.parse(location.search);
  const kratos = useKratos();
  const logger = useLogger();
  const { t } = useTranslation();

  useEffect(() => {
    kratos
      .initRecover(request)
      .then((b) => {
        if (b) {
          setBody(b);
        }
      })
      .catch((err) => logger.error("Error: ", err));
  }, [kratos, logger, request]);

  const messages = body?.messages;
  const form = body?.methods?.link?.config;

  return (
    <>
      {messages && <KratosMessages messages={messages} />}
      {form && (
        <KratosForm
          submitLabel={t("RECOVERY")}
          actionURL={form.action}
          fields={form.fields}
          messages={form.messages}
          title={t("RECOVERY_TITLE")}
        />
      )}
    </>
  );
};
