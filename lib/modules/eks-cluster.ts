import { KubectlV30Layer } from "@aws-cdk/lambda-layer-kubectl-v30";
import {
  CfnLaunchTemplate,
  InstanceType,
  IVpc,
  SecurityGroup,
  SubnetType,
} from "aws-cdk-lib/aws-ec2";
import {
  CapacityType,
  Cluster,
  KubernetesVersion,
  NodegroupAmiType,
} from "aws-cdk-lib/aws-eks";
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
    version: KubernetesVersion.V1_32,
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
    instanceType,
    CapacityType.ON_DEMAND
    //launchTemplate,
  );
  return cluster;
};

const createNodeGroup = (
  nodeGroupID: string,
  cluster: Cluster,
  minSize: number,
  maxSize: number,
  desiredSize: number,
  instanceType: string,
  capacityType: CapacityType
  //launchTemplate: CfnLaunchTemplate
) => {
  cluster.addNodegroupCapacity(nodeGroupID, {
    minSize: minSize,
    maxSize: maxSize,
    desiredSize: desiredSize,
    instanceTypes: [new InstanceType(instanceType)],
    amiType: NodegroupAmiType.BOTTLEROCKET_ARM_64,
    subnets: { subnetType: SubnetType.PRIVATE_WITH_EGRESS },
    capacityType: capacityType,
    /*launchTemplateSpec: {
      id: launchTemplate.ref,
    },*/
  });
};
