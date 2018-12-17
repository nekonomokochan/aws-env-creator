# aws-env-creator

[![npm version](https://badge.fury.io/js/%40nekonomokochan%2Faws-env-creator.svg)](https://badge.fury.io/js/%40nekonomokochan%2Faws-env-creator)
[![Build Status](https://travis-ci.org/nekonomokochan/aws-env-creator.svg?branch=master)](https://travis-ci.org/nekonomokochan/aws-env-creator)
[![Coverage Status](https://coveralls.io/repos/github/nekonomokochan/aws-env-creator/badge.svg)](https://coveralls.io/github/nekonomokochan/aws-env-creator)

Create an env file from AWS Secrets Manager.

# Getting Started

## Install npm package

### yarn
`yarn add @nekonomokochan/aws-env-creator`

### npm
`npm install --save @nekonomokochan/aws-env-creator`

## Set up AWS credentials

Please set credentials using AWS CLI.

The following is the setting procedure in MacOS.

1. `brew install awscli`
1. `aws configure --profile YOUR_PROFILE_NAME`

```
AWS Access Key ID [None]: `YOUR_AWS_ACCESS_KEY_ID`
AWS Secret Access Key [None]: `YOUR_AWS_SECRET_ACCESS_KEY`
Default region name [None]: ap-northeast-1
Default output format [None]: json
```

- Be sure to set the profile name.
- The access key must also have at least the following permissions.
  - `secretsmanager:ListSecrets`
  - `secretsmanager:DescribeSecret`
  - `secretsmanager:GetSecretValue`
  - `kms:Decrypt`

# How To Use

## Use With TypeScript

```typescript
import { createEnvFile, EnvFileType, AwsRegion } from "@nekonomokochan/aws-env-creator";

(async () => {
  const params = {
    type: EnvFileType.dotenv,
    outputDir: "./",
    secretId: "dev/app",
    profile: "nekochans-dev",
    region: AwsRegion.ap_northeast_1
  };

  await createEnvFile(params);
})();
```

`.env` is created in your current directory.

## Use With JavaScript

```javascript
(async () => {
  "use strict";

  const awsEnvCreator = require("@nekonomokochan/aws-env-creator");

  const params = {
    type: ".env",
    outputDir: "./",
    secretId: "dev/app",
    profile: "nekochans-dev",
    region: "ap-northeast-1"
  };

  await awsEnvCreator.createEnvFile(params);
})();
```

`.env` is created in your current directory.

# A description of the parameter

| parameter | description                                          | value       |
|-----------|------------------------------------------------------|-------------|
| type      | The type of file to output                           | Enum `.env` `.envrc` |
| outputDir | Output path                                          | String      |
| secretId  | Your AWS Secrets Manager ID                          | String      |
| profile   | Your AWS CLI Credentials Name                        | String      |
| region    | The region where your AWS Secrets Manager is located | String      |

# License
MIT
