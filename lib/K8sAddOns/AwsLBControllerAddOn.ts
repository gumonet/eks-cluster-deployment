import { Cluster } from "aws-cdk-lib/aws-eks";
import { AwsLoadbalancerControllerIamPolicy } from "./AwsLBControllerPolicy";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { registries } from "../utils/registry-utils";

const AWS_LOAD_BALANCER_CONTROLLER = "aws-load-balancer-controller";

export class AWSLoadBalancerControllerAddOn {
  constructor(private cluster: Cluster, private nameSpace: string) {}

  deploy() {
    const serviceAccount = this.createServiceAccount();
    const awsLBControllerChart = this.deployLBControllerChart(
      serviceAccount.serviceAccountName
    );
    awsLBControllerChart.node.addDependency(serviceAccount);
  }

  deployLBControllerChart(serviceAccountName: string) {
    let image = this.getImage();
    return this.cluster.addHelmChart("AWSLoadBalancerController", {
      chart: "aws-load-balancer-controller",
      repository: "https://aws.github.io/eks-charts",
      namespace: this.nameSpace,
      values: {
        clusterName: this.cluster.clusterName,
        ServiceAccount: {
          create: false,
          name: serviceAccountName,
        },
        createIngressClassResource: true,
        enableServiceMutatorWebhook: false,
        enableShield: false,
        enableWaf: false,
        enableWafv2: false,
        ingressClass: "alb",
        region: this.cluster.stack.region,
        ...image,
        vpcId: this.cluster.vpc.vpcId,
      },
    });
  }

  createServiceAccount() {
    const serviceAccount = this.cluster.addServiceAccount(
      "aws-load-balancer-controller",
      {
        name: AWS_LOAD_BALANCER_CONTROLLER,
        namespace: this.nameSpace,
      }
    );

    AwsLoadbalancerControllerIamPolicy(
      this.cluster.stack.partition
    ).Statement.forEach((statement) => {
      serviceAccount.addToPrincipalPolicy(PolicyStatement.fromJson(statement));
    });

    return serviceAccount;
  }

  getImage() {
    const region = this.cluster.stack.region;
    const registry = registries.get(region);
    if (registry == null) {
      console.log(
        "Unable to get ECR repository for AWS Loadbalancer Controller for region " +
          region +
          ". Using default helm image."
      );
      return {};
    }
    return {
      image: { repository: registry + "amazon/aws-load-balancer-controller" },
    };
  }
}
