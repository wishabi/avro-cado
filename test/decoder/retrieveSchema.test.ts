jest.mock("axios");

import axios from "axios";
import { retrieveSchema } from "../../ts/avro-decoder";
import { ACCEPT_HEADERS } from "../../ts/config";
import { IOptions } from "../../ts/types/types";
import {
  RETRY_ERROR_CODE_50002,
  RETRY_ERROR_CODE_50003,
  RETRY_STATUS_CODE_500
} from "../../ts/util";

const opts: IOptions = {
  subject: "subject",
  schemaRegistry: "host",
  numRetries: 1,
  schema: { data: "schema" }
};

const SCHEMA_ID = 1;

describe("genSchemaRetriever", () => {
  beforeEach(() => {
    axios.mockReset();
  });

  it("should get the schema on success", async () => {
    axios.mockImplementationOnce(() => {
      return {
        data: {
          schema: JSON.stringify(opts.schema)
        }
      };
    });

    expect.assertions(3);

    const schema = await retrieveSchema(opts, SCHEMA_ID);

    expect(axios).toHaveBeenCalledTimes(1);

    expect(schema).toMatchSnapshot();
    expect(axios).toHaveBeenCalledWith({
      headers: { Accept: ACCEPT_HEADERS },
      method: "get",
      url: `${opts.schemaRegistry}/schemas/ids/${SCHEMA_ID}`
    });
  });

  /*
   * Retry once and on a retriable error and then fail
   * one all configured retries have been exhausted
   */
  it("should retry 1 time on retriable error code 50002", async () => {
    axios
      .mockImplementationOnce(() => {
        throw {
          response: {
            status: RETRY_STATUS_CODE_500,
            data: {
              error_code: RETRY_ERROR_CODE_50002,
              message: "500:50002"
            }
          },
          message: "500:50002"
        };
      })
      .mockImplementationOnce(() => {
        throw {
          response: {
            status: RETRY_STATUS_CODE_500,
            data: {
              error_code: RETRY_ERROR_CODE_50002,
              message: "500:50002"
            }
          },
          message: "500:50002"
        };
      });

    expect.assertions(2);

    await expect(retrieveSchema(opts, SCHEMA_ID)).rejects.toMatchSnapshot();

    expect(axios).toHaveBeenCalledTimes(2);
  });

  it("should retry 1 time on retriable error code 50003", async () => {
    axios
      .mockImplementationOnce(() => {
        throw {
          response: {
            status: RETRY_STATUS_CODE_500,
            data: {
              error_code: RETRY_ERROR_CODE_50003,
              message: "500:50003"
            }
          },
          message: "500:50003"
        };
      })
      .mockImplementationOnce(() => {
        throw {
          response: {
            status: RETRY_STATUS_CODE_500,
            data: {
              error_code: RETRY_ERROR_CODE_50003,
              message: "500:50003"
            }
          },
          message: "500:50003"
        };
      });

    expect.assertions(2);

    await expect(retrieveSchema(opts, SCHEMA_ID)).rejects.toMatchSnapshot();

    expect(axios).toHaveBeenCalledTimes(2);
  });

  /*
   * Do NOT retry on a NON retriable error even though
   * retries are configured
   */
  it("should retry 0 times on fatal error", async () => {
    axios.mockImplementationOnce(() => {
      throw {
        message: "600:60002",
        response: {
          status: 600,
          data: {
            error_code: RETRY_ERROR_CODE_50002,
            message: "600:60002"
          }
        }
      };
    });

    expect.assertions(2);

    await expect(retrieveSchema(opts, SCHEMA_ID)).rejects.toMatchSnapshot();

    expect(axios).toHaveBeenCalledTimes(1);
  });
});
