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

    //Add Load balancer controller
    new AWSLoadBalancerControllerAddOn(cluster, "kube-system").deploy();
    //Secrets store not is necessary to run pods

    /*
     // Deploy AWS Load Balancer Controller

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
 * Validar que el service account tenga el rol establecido
 * Test pod with load balancer service expose
 * Lograr levantar load balancers con el rol establecido
 *  Al parecer existe un error de permisos que no permite que el rol despliegue LB
 *  Volver a correr el deploy service y validar el error
 *  el grupo es: BancDemoEKSDeployment-BancDemoEKSawsloadbalancercon-2wHQPyP4TfP8
 *
 * add istio
 * deploy a pod
 * test get secrets manager data
 * test get environment data
 * check permisions to role for connect to ssm
 *
 */
