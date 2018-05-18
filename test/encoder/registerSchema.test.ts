import { registerSchema } from "../../ts/avro-encoder";
import { Options } from "../../ts/types/types";
import { handleError } from "../../ts/util";
import { ACCEPT_HEADERS } from "../../ts/config";
import * as rp from "request-promise";

import { logger } from "../__fixtures__/logger";

const opts: Options = {
  subject: "subject",
  schemaRegistry: "host",
  numRetries: 1,
  wrapUnions: "auto",
  schema: "schema"
};

jest.mock("request-promise", () => {
  return jest.fn();
});

rp
  .mockImplementationOnce(params => {
    return {
      body: {
        id: 1
      }
    };
  })
  .mockImplementationOnce(params => {
    throw {
      statusCode: 500,
      error: {
        error_code: 50002,
        message: "Retry error 500:50002"
      },
      message: "retry1"
    };
  })
  .mockImplementationOnce(params => {
    throw {
      statusCode: 500,
      error: {
        error_code: 50002,
        message: "Retry error 500:50002"
      },
      message: "retry1"
    };
  })
  .mockImplementationOnce(params => {
    throw {
      statusCode: 600,
      error: {
        error_code: 50002,
        message: "Retry error 500:50002"
      },
      message: "retry1"
    };
  });

describe("registerSchema", () => {
  it("should get the schema ID on success", async () => {
    expect.assertions(3);

    const schemaId = await registerSchema(opts);

    expect(rp).toHaveBeenCalledTimes(1);

    expect(schemaId).toMatchSnapshot();
    expect(rp).toHaveBeenCalledWith({
      body: { schema: '"schema"' },
      headers: { Accept: ACCEPT_HEADERS },
      json: true,
      method: "POST",
      resolveWithFullResponse: true,
      uri: "host/subjects/subject/versions"
    });
  });

  /*
     * Retry once and on a retriable error and then fail
     * one all configured retries have been exhausted
     */
  it("should retry 1 times on retriable error", async () => {
    expect.assertions(2);

    await expect(registerSchema(opts)).rejects.toMatchSnapshot();

    expect(rp).toHaveBeenCalledTimes(3);
  });

  /*
     * Do NOT retry on a NON retriable error even though
     * retries are configured
     */
  it("should retry 0 times on fatal error", async () => {
    expect.assertions(2);

    await expect(registerSchema(opts)).rejects.toMatchSnapshot();

    expect(rp).toHaveBeenCalledTimes(4);
  });
});
