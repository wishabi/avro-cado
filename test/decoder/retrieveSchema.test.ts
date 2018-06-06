jest.mock("request-promise", () => {
  return jest.fn();
});

import * as rp from "request-promise";
import { retrieveSchema } from "../../ts/avro-decoder";
import { ACCEPT_HEADERS } from "../../ts/config";
import { Options } from "../../ts/types/types";
import {
  handleError,
  RETRY_ERROR_CODE_50002,
  RETRY_ERROR_CODE_50003,
  RETRY_STATUS_CODE_500
} from "../../ts/util";

const opts: Options = {
  subject: "subject",
  schemaRegistry: "host",
  numRetries: 1,
  schema: { data: "schema" }
};

const SCHEMA_ID = 1;

describe("genSchemaRetriever", () => {
  it("should get the schema on success", async () => {
    rp.mockImplementationOnce(params => {
      return {
        body: {
          schema: JSON.stringify(opts.schema)
        }
      };
    });

    expect.assertions(3);

    const schema = await retrieveSchema(opts, SCHEMA_ID);

    expect(rp).toHaveBeenCalledTimes(1);

    expect(schema).toMatchSnapshot();
    expect(rp).toHaveBeenCalledWith({
      headers: { Accept: ACCEPT_HEADERS },
      json: true,
      resolveWithFullResponse: true,
      uri: `${opts.schemaRegistry}/schemas/ids/${SCHEMA_ID}`
    });
  });

  /*
   * Retry once and on a retriable error and then fail
   * one all configured retries have been exhausted
   */
  it("should retry 1 time on retriable error code 50002", async () => {
    rp.mockImplementationOnce(params => {
      throw {
        statusCode: RETRY_STATUS_CODE_500,
        error: {
          error_code: RETRY_ERROR_CODE_50002,
          message: "500:50002"
        },
        message: "500:50002"
      };
    }).mockImplementationOnce(params => {
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

    await expect(retrieveSchema(opts, SCHEMA_ID)).rejects.toMatchSnapshot();

    expect(rp).toHaveBeenCalledTimes(3);
  });

  it("should retry 1 time on retriable error code 50003", async () => {
    rp.mockImplementationOnce(params => {
      throw {
        statusCode: RETRY_STATUS_CODE_500,
        error: {
          error_code: RETRY_ERROR_CODE_50003,
          message: "500:50003"
        },
        message: "500:50003"
      };
    }).mockImplementationOnce(params => {
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

    await expect(retrieveSchema(opts, SCHEMA_ID)).rejects.toMatchSnapshot();

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

    await expect(retrieveSchema(opts, SCHEMA_ID)).rejects.toMatchSnapshot();

    expect(rp).toHaveBeenCalledTimes(6);
  });
});
