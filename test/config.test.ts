import { processOptions } from "../ts/config";

/*
 *****************************************************************
 *                                                  processOptions
 *****************************************************************
 */

const ERROR_OPTIONS = [
  // schema key missing
  {
    schemaRegistry: "http://localhost:8081",
    numRetries: 10,
    wrapUnions: "auto",
    subject: "subject",
  },
  // subject key missing
  {
    schemaRegistry: "http://localhost:8081",
    numRetries: 10,
    wrapUnions: "auto",
    schema: {},
  },
];

const OPTIONS = [
  {
    schemaRegistry: "schemaRegistry",
    numRetries: 100,
    wrapUnions: "never",
    subject: "subject",
    schema: {},
  },
];

describe("processOptions", () => {
  it("should throw error on invalid options", () => {
    expect.assertions(ERROR_OPTIONS.length);

    ERROR_OPTIONS.forEach((err_opts) => {
      const throwsError = () => {
        processOptions(err_opts);
      };
      expect(throwsError).toThrowErrorMatchingSnapshot();
    });
  });

  it("should process the options correctly", () => {
    expect.assertions(OPTIONS.length);

    OPTIONS.forEach((opts) => {
      expect(processOptions(opts)).toMatchSnapshot();
    });
  });
});
