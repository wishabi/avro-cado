import { registerSchema } from "../../ts/avro-encoder";
import { handleError } from "../../ts/util";
import { ACCEPT_HEADERS } from "../../ts/config";
import * as rp from "request-promise";

const opts = {
  subject: "subject",
  schemaRegistry: "host",
  numRetries: 1,
  schema: "schema"
};

jest.mock("request-promise", () => {
  return jest.fn();
});

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
      body: { schema: '"schema"' },
      headers: { Accept: ACCEPT_HEADERS },
      json: true,
      method: "POST",
      resolveWithFullResponse: true,
      uri: `host/subjects/${opts.subject}/versions`
    });
  });

  /*
     * Retry once and on a retriable error and then fail
     * one all configured retries have been exhausted
     */
  it("should retry 1 times on retriable error", async () => {
    rp
      .mockImplementationOnce(params => {
        throw {
          statusCode: 500,
          error: {
            error_code: 50002,
            message: "500:50002"
          },
          message: "500:50002"
        };
      })
      .mockImplementationOnce(params => {
        throw {
          statusCode: 500,
          error: {
            error_code: 50002,
            message: "500:50002"
          },
          message: "500:50002"
        };
      });

    expect.assertions(2);

    await expect(registerSchema(opts)).rejects.toMatchSnapshot();

    expect(rp).toHaveBeenCalledTimes(3);
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

    expect(rp).toHaveBeenCalledTimes(4);
  });
});
