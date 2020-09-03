import React, { FunctionComponent, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useLogger } from "../services";
import { OAuth2Client } from "@oryd/hydra-client";
import { useForm } from "react-hook-form";

type ConsentData = {
  csrfToken: string;
  challenge: string;
  requested_scope: string[];
  user: string;
  client: OAuth2Client;
};

export const Consent: FunctionComponent = () => {
  const [body, setBody] = useState<ConsentData>();
  const location = useLocation();
  const logger = useLogger();
  const { handleSubmit, register } = useForm();

  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/consent${location.search}`)
      .then((resp) => resp.json())
      .then((b) => setBody(b))
      .catch((err) => logger.error("Error: ", err));
  }, [location.search, logger]);

  const onSubmit = (values: Record<string, unknown>) => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/post-consent`, {
      method: "POST",
      body: JSON.stringify({
        _csrf: body?.csrfToken,
        challenge: body?.challenge,
        ...values,
      }),
    }).then((resp) => {
      console.log("resp: ", resp);
      window.location.assign(resp.url);
    });
  };

  const onDeny = () => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/post-consent`, {
      method: "POST",
      body: JSON.stringify({
        _csrf: body?.csrfToken,
        challenge: body?.challenge,
        submit: "false",
      }),
    }).then((resp) => {
      console.log("resp: ", resp);
      window.location.assign(resp.url);
    });
  };

  const render = () => {
    if (!body) {
      return <div>Loading...</div>;
    } else {
      return (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div>requested scopes:</div>
          {body.requested_scope.map((s) => (
            <label key={s}>
              <span>{s}</span>
              <input
                type="checkbox"
                value={s}
                name="grant_scope"
                ref={register}
              />
            </label>
          ))}

          {body.client.policyUri && (
            <div>
              <a href={body.client.policyUri}>Read the Privacy Policy</a>
            </div>
          )}
          {body.client.tosUri && (
            <div>
              <a href={body.client.tosUri}>Terms of Service</a>
            </div>
          )}

          <div>
            <label>
              <span>Do not ask me again</span>
              <input
                type="checkbox"
                id="remember"
                value="true"
                name="remember"
                ref={register}
              />
            </label>
          </div>

          <button
            type="submit"
            id="accept"
            name="submit"
            value="true"
            ref={register}
          >
            Allow access
          </button>
          <button onClick={onDeny}>Deny access</button>
        </form>
      );
    }
  };

  return render();
};