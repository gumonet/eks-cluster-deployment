import { Construct } from "constructs";
import { IVpc, Peer, Port, SecurityGroup } from "aws-cdk-lib/aws-ec2";
export const createControlPlaneSG = (
  scope: Construct,
  vpc: IVpc,
  sgName: string
) => {
  const sg = new SecurityGroup(scope, sgName, {
    vpc,
    securityGroupName: sgName,
    allowAllOutbound: true,
  });
  sg.addIngressRule(
    Peer.anyIpv4(),
    Port.tcp(443),
    "Allow all traffic from internet"
  );

  return sg;
};
