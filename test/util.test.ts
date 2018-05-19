import { handleError, aggregateOptions } from "../ts/util";
import { logger } from "./__fixtures__/logger";

/*
 *****************************************************************
 *                                                     handleError
 *****************************************************************
 */

const RETRY_ERRORS = [
  {
    statusCode: 500,
    error: {
      error_code: 50002,
      message: "Retry error 500:50002"
    },
    message: "retry1"
  },
  {
    statusCode: 500,
    error: {
      error_code: 50003,
      message: "Retry error 500:50003"
    },
    message: "retry1"
  }
];

const FATAL_ERRORS = [
  {
    statusCode: 400,
    message: "message1"
  },
  { message: "message2" },
  {
    statusCode: 500,
    message: "message3"
  },
  {
    statusCode: 500,
    error: {
      message: "Retry error 500:50003"
    },
    message: "message4"
  }
];

describe("handleError", () => {
  it("should return 'true' for an error eligible for retry", () => {
    RETRY_ERRORS.forEach(retry_err => {
      const retry: boolean = handleError(retry_err, logger, retry_err.message);
      expect(retry).toMatchSnapshot();
    });
  });

  it("should return 'false' for an error NOT eligible for retry", () => {
    FATAL_ERRORS.forEach(fatal_err => {
      const retry: boolean = handleError(fatal_err, logger, fatal_err.message);
      expect(retry).toMatchSnapshot();
    });
  });
});

/*
 *****************************************************************
 *                                                aggregateOptions
 *****************************************************************
 */

const CONFIG_DATA = [
  {
    default: {
      schemaRegistry: "schemaRegistry_default1",
      numRetries: 3,
      wrapUnions: "auto"
    },
    override: {}
  },
  {
    default: {
      schemaRegistry: "schemaRegistry_default2",
      numRetries: 3,
      wrapUnions: "auto"
    },
    override: {
      schemaRegistry: "schemaRegistry_override2",
      numRetries: 3,
      wrapUnions: "auto"
    }
  },
  {
    default: {
      schemaRegistry: "schemaRegistry_default3",
      numRetries: 3,
      wrapUnions: "auto"
    },
    override: {
      schemaRegistry: "schemaRegistry_override3",
      numRetries: 4,
      wrapUnions: "always"
    }
  },
  {
    default: {
      schemaRegistry: "schemaRegistry_default4",
      numRetries: 3,
      wrapUnions: "auto"
    },
    override: {
      schemaRegistry: "schemaRegistry_default4",
      numRetries: 3,
      wrapUnions: "auto",
      topic: "topic_override"
    }
  },
  {
    default: {
      schemaRegistry: "schemaRegistry_default5",
      numRetries: 3,
      wrapUnions: "auto"
    },
    override: null
  },
  {
    default: {
      schemaRegistry: "schemaRegistry_default6",
      numRetries: 3,
      wrapUnions: "auto"
    },
    override: {
      schemaRegistry: "schemaRegistry_default6",
      numRetries: 3,
      wrapUnions: "petre"
    }
  }
];

describe("aggregateOptions", () => {
  it("should merge the two objects correctly", () => {
    CONFIG_DATA.forEach(test => {
      const merged = aggregateOptions(test.default, test.override);
      expect(merged).toMatchSnapshot();
    });
  });
});
