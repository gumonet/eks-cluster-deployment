import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { Vpc } from "aws-cdk-lib/aws-ec2";
import { StringParameter } from "aws-cdk-lib/aws-ssm";

import {
  ArgoCdAddOn,
  AWSLoadBalancerControllerAddOn,
  IstioBaseAddOn,
  IstioCniAddOn,
} from "./K8sAddOns/";
import {
  createControlPlaneSG,
  createEksAdminRole,
  createEkscluster,
} from "./modules";
import { IstioControlPlaneAddOn } from "./K8sAddOns/IstioControlPlaneAddOn";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

const PCI_VPC_ID_PARAMETER_NAME = "/b365tech/pci/vpc-id";

interface infraStackProps extends StackProps {
  environment: string;
  adminPasswordSecretName: string;
  credentialsSecretName: string;
  repositoryUrl: string;
  applicationPath: string;
  clusterName: string;
  meshId: string; // Optional, used for Istio control plane
  network: string; // Optional, used for Istio control plane
  vpcId: string; // Optional, if not provided will use the parameter store
}

export class BancDemoEKSDeployment extends Stack {
  constructor(scope: Construct, id: string, props: infraStackProps) {
    super(scope, id, props);

    const PCI_K8S_CLUSTER_ADMIN_ROLE_NAME = `${props.clusterName}-K8sClusterAdminRole`;
    /*const vpcId = StringParameter.valueFromLookup(
      this,
      PCI_VPC_ID_PARAMETER_NAME
    );*/
    const vpc = Vpc.fromLookup(this, "VPC", { vpcId: props.vpcId });

    //Configure securirty group for EKS control plane
    const controlPlaneSecurityGroup = createControlPlaneSG(
      this,
      vpc,
      props.clusterName + "EKSControlPlaneSG"
    );
    //Create EKS cluster admin role
    const clusterAdminRole = createEksAdminRole(
      this,
      this.account,
      PCI_K8S_CLUSTER_ADMIN_ROLE_NAME,
      props.clusterName
    );

    //Create EKS cluster
    const cluster = createEkscluster(
      this,
      vpc,
      controlPlaneSecurityGroup,
      clusterAdminRole,
      props.clusterName + "EKS",
      1,
      3,
      2,
      props.environment
    );

    //Create ArgoCD
    new ArgoCdAddOn(
      cluster,
      props.adminPasswordSecretName,
      this.region
    ).deploy();

    //Add Load balancer controller
    new AWSLoadBalancerControllerAddOn(cluster, "kube-system").deploy();
    //Add Isto Base
    new IstioBaseAddOn(cluster).deploy();
    new IstioControlPlaneAddOn(cluster, props.meshId, props.network).deploy();
    new IstioCniAddOn(cluster).deploy();
    //Secrets store is not necessary to run pods
  } //Enc class
}

//Tmw test
/**
 *
 * test get environment data
 * check permisions to role for connect to ssm
 *
 */
