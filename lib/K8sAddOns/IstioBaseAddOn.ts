import { Cluster } from "aws-cdk-lib/aws-eks";
import { createNamespace } from "../utils/cluster-utils";
export const ISTIO_VERSION = "1.23.2";

export class IstioBaseAddOn {
  constructor(private cluster: Cluster) {}

  deploy() {
    const namespace = createNamespace("istio-system", this.cluster);
    const chartIstioBase = this.cluster.addHelmChart("IstioBase", {
      chart: "base",
      repository: "https://istio-release.storage.googleapis.com/charts",
      namespace: "istio-system",
      release: "istio-base",
      version: ISTIO_VERSION,
    });
    chartIstioBase.node.addDependency(namespace);
  }
}
