import {
  CfnOutput,
  Duration,
  StackProps,
  RemovalPolicy,
  aws_cognito as cognito,
  aws_iam as iam,
  aws_secretsmanager as secretsmanager,
} from "aws-cdk-lib";
import { AttributeType, BillingMode, Table, TableEncryption } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { LambdaStackWithContext } from "@netizen/utils-aws-cdk";
import { getEnvironmentValue } from "@netizen/utils-env";
import { verificationEmailHtml } from "./email-templates/Verification";

export class UserStack extends LambdaStackWithContext {
  public iamStatements: iam.PolicyStatement[] = [];

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, { ...props, srcPath: "libs/nanikore/user/src" });

    const secret = secretsmanager.Secret.fromSecretAttributes(this, `${id}-userpool-google-secret`, {
      secretCompleteArn: getEnvironmentValue("COGNITO_GOOGLE_CLIENT_SECRET_ARN"),
    }).secretValue;

    const userPool = new cognito.UserPool(this, `${id}-userpool`, {
      signInCaseSensitive: false,
      selfSignUpEnabled: true,
      // @TODO: Updated email details
      userVerification: {
        emailSubject: "Verify your email for our awesome app!",
        emailBody: verificationEmailHtml,
        emailStyle: cognito.VerificationEmailStyle.LINK,
        smsMessage: "Thanks for signing up to our awesome app! Your verification code is {####}.",
      },
      signInAliases: {
        username: false,
        email: true,
      },
      autoVerify: {
        email: true,
        phone: true,
      },
      keepOriginal: {
        phone: true,
        email: true,
      },
      mfa: cognito.Mfa.OPTIONAL,
      mfaSecondFactor: {
        otp: true,
        sms: true,
      },
      passwordPolicy: {
        minLength: 8,
        tempPasswordValidity: Duration.days(3),
      },
      standardAttributes: {
        email: { required: true },
      },
      customAttributes: {
        rights: new cognito.NumberAttribute({ mutable: true }),
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      deletionProtection: this.deploymentTarget === "production",
    });

    new cognito.UserPoolIdentityProviderGoogle(this, `${id}-userpool-google`, {
      userPool,
      clientId: getEnvironmentValue("COGNITO_GOOGLE_CLIENT_ID"),
      clientSecretValue: secret,
      scopes: ["email", "profile"],
      attributeMapping: {
        email: cognito.ProviderAttribute.GOOGLE_EMAIL,
        fullname: cognito.ProviderAttribute.GOOGLE_NAME,
        phoneNumber: cognito.ProviderAttribute.GOOGLE_PHONE_NUMBERS,
        profilePicture: cognito.ProviderAttribute.GOOGLE_PICTURE,
        birthdate: cognito.ProviderAttribute.GOOGLE_BIRTHDAYS,
        gender: cognito.ProviderAttribute.GOOGLE_GENDER,
        custom: { email_verified: cognito.ProviderAttribute.other("email_verified") },
      },
    });

    const callbackUrl = getEnvironmentValue("COGNITO_URL_CALLBACK");
    const logoutUrl = getEnvironmentValue("COGNITO_URL_LOGOUT");

    const readAttributes = new cognito.ClientAttributes()
      .withStandardAttributes({
        phoneNumber: true,
        email: true,
        emailVerified: true,
        phoneNumberVerified: true,
        fullname: true,
        address: true,
        birthdate: true,
        gender: true,
        locale: true,
        nickname: true,
        profilePicture: true,
        lastUpdateTime: true,
      })
      .withCustomAttributes("rights");
    const writeAttributes = new cognito.ClientAttributes()
      .withStandardAttributes({
        phoneNumber: true,
        email: true,
        fullname: true,
        address: true,
        birthdate: true,
        gender: true,
        locale: true,
        nickname: true,
        profilePicture: true,
        lastUpdateTime: true,
      })
      .withStandardAttributes({});

    const poolClient = new cognito.UserPoolClient(this, `${id}-userpool-client`, {
      userPool,
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        scopes: [
          cognito.OAuthScope.OPENID,
          cognito.OAuthScope.EMAIL,
          cognito.OAuthScope.PROFILE,
          cognito.OAuthScope.COGNITO_ADMIN,
        ],
        callbackUrls: [callbackUrl],
        logoutUrls: [logoutUrl],
      },
      readAttributes,
      writeAttributes,
      generateSecret: true,
    });

    userPool.addDomain(`${id}-oAuth-domain`, {
      cognitoDomain: {
        domainPrefix: `${id}-oAuth`.toLowerCase(),
      },
    });

    // @TODO: To further restrict the access once development is completed
    this.iamStatements.push(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["cognito-idp:*"],
        resources: [userPool.userPoolArn],
      }),
    );
    this.iamStatements.push(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["cognito-idp:ListUserPools"],
        resources: ["*"],
      }),
    );

    new CfnOutput(this, "cognitoUserPoolId", {
      value: userPool.userPoolId,
    });
    new CfnOutput(this, "cognitoUserPoolClientId", {
      value: poolClient.userPoolClientId,
    });

    const tableTransactions = new Table(this, "transactions", {
      partitionKey: { name: "userId", type: AttributeType.STRING },
      sortKey: { name: "date", type: AttributeType.STRING },
      encryption: TableEncryption.DEFAULT,
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: this.deploymentTarget === "production" ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
    });

    tableTransactions.addLocalSecondaryIndex({
      indexName: "transactionIdLSI",
      sortKey: { name: "transactionId", type: AttributeType.STRING },
    });

    tableTransactions.addLocalSecondaryIndex({
      indexName: "sourceOfIncomeIdLSI",
      sortKey: { name: "sourceOfIncomeId", type: AttributeType.STRING },
    });

    const tableProfiles = new Table(this, "profiles", {
      partitionKey: { name: "userId", type: AttributeType.STRING },
      sortKey: { name: "sort", type: AttributeType.STRING },
      encryption: TableEncryption.DEFAULT,
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: this.deploymentTarget === "production" ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
    });

    this.iamStatements.push(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "dynamodb:PutItem",
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:GetItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:BatchWriteItem",
          "dynamodb:BatchGetItem",
          "dynamodb:DescribeTable",
        ],
        resources: [`${tableProfiles.tableArn}*`],
      }),
    );
    this.iamStatements.push(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "dynamodb:PutItem",
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:GetItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:BatchWriteItem",
          "dynamodb:BatchGetItem",
          "dynamodb:DescribeTable",
        ],
        resources: [`${tableTransactions.tableArn}*`],
      }),
    );

    new CfnOutput(this, "tableTransactions", {
      value: tableTransactions.tableName,
    });

    new CfnOutput(this, "tableArnTransactions", {
      value: tableTransactions.tableArn,
    });

    new CfnOutput(this, "tableProfiles", {
      value: tableProfiles.tableName,
    });

    new CfnOutput(this, "tableArnProfiles", {
      value: tableProfiles.tableArn,
    });

    // Lambda
    const lambdas = this.createFunctions({
      linkUsers: { entry: "lambda/linkUsers.ts" },
    });

    // @TODO: To further restrict the access once development is completed
    const cognitoPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        "cognito-idp:AdminCreateUser",
        "cognito-idp:AdminLinkProviderForUser",
        "cognito-idp:AdminSetUserPassword",
        "cognito-idp:AdminGetUser",
      ],
      resources: [userPool.userPoolArn],
    });

    lambdas.linkUsers.role?.attachInlinePolicy(
      new iam.Policy(this, "cognito-operations", {
        statements: [cognitoPolicy],
      }),
    );

    userPool.addTrigger(cognito.UserPoolOperation.PRE_SIGN_UP, lambdas.linkUsers);
  }
}
