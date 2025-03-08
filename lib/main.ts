import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { Vpc } from "aws-cdk-lib/aws-ec2";
import { StringParameter } from "aws-cdk-lib/aws-ssm";

import { ArgoCdAddOn, AWSLoadBalancerControllerAddOn } from "./K8sAddOns/";
import {
  createControlPlaneSG,
  createEksAdminRole,
  createEkscluster,
} from "./modules";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

const PCI_VPC_ID_PARAMETER_NAME = "/b365tech/pci/vpc-id";
const PCI_K8S_CLUSTER_ADMIN_ROLE_NAME = "BancDemoK8sClusterAdminRole";

interface infraStackProps extends StackProps {
  environment: string;
  adminPasswordSecretName: string;
  credentialsSecretName: string;
  repositoryUrl: string;
  applicationPath: string;
}

export class BancDemoEKSDeployment extends Stack {
  constructor(scope: Construct, id: string, props: infraStackProps) {
    super(scope, id, props);

    const vpcId = StringParameter.valueFromLookup(
      this,
      PCI_VPC_ID_PARAMETER_NAME
    );
    const vpc = Vpc.fromLookup(this, "VPC", { vpcId: vpcId });

    //Configure securirty group for EKS control plane
    const controlPlaneSecurityGroup = createControlPlaneSG(
      this,
      vpc,
      "DemoEKSControlPlaneSG"
    );
    //Create EKS cluster admin role
    const clusterAdminRole = createEksAdminRole(
      this,
      this.account,
      PCI_K8S_CLUSTER_ADMIN_ROLE_NAME,
      "BancDemo"
    );

    //Create EKS cluster
    const cluster = createEkscluster(
      this,
      vpc,
      controlPlaneSecurityGroup,
      clusterAdminRole,
      "BancDemoEKS",
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
    new AWSLoadBalancerControllerAddOn(cluster, "kube-system").deploy();
    //Secrets store not is necessary to run pods

    /*****
     **** move alll HelmChart to addons library
     **** Start to add istio
     */

    /*
     // Deploy AWS Load Balancer Controller
     
     values:
  clusterName: pci-k8s-cluster
  createIngressClassResource: true
  enableServiceMutatorWebhook: false
  enableShield: false
  enableWaf: false
  enableWafv2: false
  image:
    repository: 602401143452.dkr.ecr.us-west-2.amazonaws.com/amazon/aws-load-balancer-controller
  ingressClass: alb
  region: us-west-2
  serviceAccount:
    create: false
    name: aws-load-balancer-controller
  vpcId: vpc-081892aa3471307c3

    // Deploy Istio Base
    cluster.addHelmChart('IstioBase', {
      chart: 'base',
      repository: 'https://istio-release.storage.googleapis.com/charts',
      namespace: 'istio-system',
    });

    // Deploy Istio Control Plane
    cluster.addHelmChart('IstioControlPlane', {
      chart: 'istiod',
      repository: 'https://istio-release.storage.googleapis.com/charts',
      namespace: 'istio-system',
    });

    // Deploy Istio CNI
    cluster.addHelmChart('IstioCNI', {
      chart: 'cni',
      repository: 'https://istio-release.storage.googleapis.com/charts',
      namespace: 'istio-system',
    }); */
  } //Enc class
}

//Tmw test
/**
 * add istio
 * deploy services load balanced
 * deploy a pod
 * test get secrets manager data
 * test get environment data
 * check permisions to role for connect to ssm
 *
 */
