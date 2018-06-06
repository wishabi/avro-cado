jest.mock("request-promise", () => {
  return jest.fn();
});

import * as rp from "request-promise";
import { registerSchema } from "../../ts/avro-encoder";
import {
  handleError,
  RETRY_STATUS_CODE_500,
  RETRY_ERROR_CODE_50002,
  RETRY_ERROR_CODE_50003
} from "../../ts/util";
import { ACCEPT_HEADERS } from "../../ts/config";
import { Options } from "../../ts/types/types";

const opts: Options = {
  subject: "subject",
  schemaRegistry: "host",
  numRetries: 1,
  schema: { data: "schema" }
};

describe("registerSchema", () => {
  it("should get the schema ID on success", async () => {
    rp.mockImplementationOnce(params => {
      return {
        body: {
          id: 1
        }
      };
    });

    expect.assertions(3);

    const schemaId = await registerSchema(opts);

    expect(rp).toHaveBeenCalledTimes(1);

    expect(schemaId).toMatchSnapshot();
    expect(rp).toHaveBeenCalledWith({
      body: { schema: JSON.stringify(opts.schema) },
      headers: { Accept: ACCEPT_HEADERS },
      json: true,
      method: "POST",
      resolveWithFullResponse: true,
      uri: `${opts.schemaRegistry}/subjects/${opts.subject}/versions`
    });
  });

  /*
   * Retry once and on a retriable error and then fail
   * one all configured retries have been exhausted
   */
  it("should retry 1 time on retriable error code 50002", async () => {
    rp
      .mockImplementationOnce(params => {
        throw {
          statusCode: RETRY_STATUS_CODE_500,
          error: {
            error_code: RETRY_ERROR_CODE_50002,
            message: "500:50002"
          },
          message: "500:50002"
        };
      })
      .mockImplementationOnce(params => {
        throw {
          statusCode: RETRY_STATUS_CODE_500,
          error: {
            error_code: RETRY_ERROR_CODE_50002,
            message: "500:50002"
          },
          message: "500:50002"
        };
      });

    expect.assertions(2);

    await expect(registerSchema(opts)).rejects.toMatchSnapshot();

    expect(rp).toHaveBeenCalledTimes(3);
  });

  it("should retry 1 time on retriable error code 50003", async () => {
    rp
      .mockImplementationOnce(params => {
        throw {
          statusCode: RETRY_STATUS_CODE_500,
          error: {
            error_code: RETRY_ERROR_CODE_50003,
            message: "500:50003"
          },
          message: "500:50003"
        };
      })
      .mockImplementationOnce(params => {
        throw {
          statusCode: RETRY_STATUS_CODE_500,
          error: {
            error_code: RETRY_ERROR_CODE_50003,
            message: "500:50003"
          },
          message: "500:50003"
        };
      });

    expect.assertions(2);

    await expect(registerSchema(opts)).rejects.toMatchSnapshot();

    expect(rp).toHaveBeenCalledTimes(5);
  });

  /*
   * Do NOT retry on a NON retriable error even though
   * retries are configured
   */
  it("should retry 0 times on fatal error", async () => {
    rp.mockImplementationOnce(params => {
      throw {
        statusCode: 600,
        error: {
          error_code: 50002,
          message: "600:50002"
        },
        message: "600:50002"
      };
    });

    expect.assertions(2);

    await expect(registerSchema(opts)).rejects.toMatchSnapshot();

    expect(rp).toHaveBeenCalledTimes(6);
  });
});
