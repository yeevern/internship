import { StackProps } from "aws-cdk-lib";
import * as lightsail from "aws-cdk-lib/aws-lightsail";
import { Construct } from "constructs";
import { StackWithContext } from "@netizen/utils-aws-cdk";

export class LightsailStack extends StackWithContext {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);
    new lightsail.CfnContainer(this, `${id}-ligthsail`, {
      power: "micro",
      scale: 1,
      serviceName: `${id}-ligthsail`,
      publicDomainNames: [
        {
          domainNames:
            this.context.deploymentTarget === "production"
              ? ["internal.netizenexperience.com"]
              : ["stg.internal.netizenexperience.com"],
          certificateName: `${id}-ligthsail-certificate`,
        },
      ],
    });
  }
}
