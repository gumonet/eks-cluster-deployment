import { KubectlV30Layer } from "@aws-cdk/lambda-layer-kubectl-v30";
import {
  InstanceType,
  IVpc,
  SecurityGroup,
  SubnetType,
} from "aws-cdk-lib/aws-ec2";
import { Cluster, KubernetesVersion } from "aws-cdk-lib/aws-eks";
import { Role } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

export const createEkscluster = (
  scope: Construct,
  vpc: IVpc,
  controlPlaneSG: SecurityGroup,
  clusterAdminRole: Role,
  clusterName: string,
  minCapacity: number,
  maxCapacity: number,
  desiredCapacity: number,
  environment: string
) => {
  const instanceType = environment === "dev" ? "t4g.medium" : "m7g.large";
  const cluster = new Cluster(scope, clusterName, {
    vpc,
    clusterName: clusterName,
    version: KubernetesVersion.V1_29,
    defaultCapacity: 0,
    securityGroup: controlPlaneSG,
    mastersRole: clusterAdminRole,
    vpcSubnets: [{ subnetType: SubnetType.PRIVATE_WITH_EGRESS }],
    kubectlLayer: new KubectlV30Layer(scope, "KubectlLayer"),
  });

  createNodeGroup(
    `${clusterName}ManagedNodeGroup`,
    cluster,
    minCapacity,
    maxCapacity,
    desiredCapacity,
    instanceType
  );
  return cluster;
};

const createNodeGroup = (
  nodeGroupName: string,
  cluster: Cluster,
  minCapacity: number,
  maxCapacity: number,
  desiredCapacity: number,
  instanceType: string
) => {
  cluster.addAutoScalingGroupCapacity(nodeGroupName, {
    instanceType: new InstanceType(instanceType),
    minCapacity: minCapacity,
    maxCapacity: maxCapacity,
    desiredCapacity: desiredCapacity,
    vpcSubnets: { subnetType: SubnetType.PRIVATE_WITH_EGRESS },
  });
};
