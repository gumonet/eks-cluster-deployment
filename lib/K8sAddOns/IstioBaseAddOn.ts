import { Cluster, KubernetesManifest } from "aws-cdk-lib/aws-eks";
import { createNamespace } from "../utils/cluster-utils";
import { ISecurityGroup } from "aws-cdk-lib/aws-ec2";
export const ISTIO_VERSION = "1.26.2";

export class IstioBaseAddOn {
  constructor(private cluster: Cluster) {}

  deploy() {
    const namespace = createNamespace("istio-system", this.cluster);
    this.addIstioBase(namespace);
  }

  addIstioBase(namespace: KubernetesManifest | ISecurityGroup) {
    const chartIstioBase = this.cluster.addHelmChart("IstioBase", {
      chart: "base",
      repository: "https://istio-release.storage.googleapis.com/charts",
      namespace: "istio-system",
      release: "istio-base",
      version: ISTIO_VERSION,
      values: {
        global: {
          istiod: {
            enableAnalysis: false,
          },
          configValidation: true,
          externalIstiod: false,
          base: {
            enableIstioConfigCRDs: true,
          },
        },
      },
    });
    chartIstioBase.node.addDependency(namespace);
  }
}
