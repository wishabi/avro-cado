jest.mock("axios");

import axios from "axios";
import { registerSchema } from "../../ts/avro-encoder";
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

describe("registerSchema", () => {
  beforeEach(() => {
    axios.mockReset();
  });

  it("should get the schema ID on success", async () => {
    axios.mockImplementationOnce((params) => {
      return {
        data: {
          id: 1
        }
      };
    });

    expect.assertions(3);

    const schemaId = await registerSchema(opts);

    expect(axios).toHaveBeenCalledTimes(1);

    expect(schemaId).toMatchSnapshot();
    expect(axios).toHaveBeenCalledWith({
      data: { schema: JSON.stringify(opts.schema) },
      headers: { Accept: ACCEPT_HEADERS },
      json: true,
      method: "POST",
      url: `${opts.schemaRegistry}/subjects/${opts.subject}/versions`
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

    await expect(registerSchema(opts)).rejects.toMatchSnapshot();

    expect(axios).toHaveBeenCalledTimes(2);
  });

  it("should retry 1 time on retriable error code 50003", async () => {
    axios
      .mockImplementationOnce((params) => {
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
      .mockImplementationOnce((params) => {
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

    await expect(registerSchema(opts)).rejects.toMatchSnapshot();

    expect(axios).toHaveBeenCalledTimes(2);
  });

  /*
   * Do NOT retry on a NON retriable error even though
   * retries are configured
   */
  it("should retry 0 times on fatal error", async () => {
    axios.mockImplementation(() => {
      throw {
        response: {
          status: 600,
          data: {
            error_code: 60002,
            message: "600:50002"
          }
        },
        message: "600:50002"
      };
    });

    expect.assertions(2);

    await expect(registerSchema(opts)).rejects.toMatchSnapshot();

    expect(axios).toHaveBeenCalledTimes(1);
  });
});
