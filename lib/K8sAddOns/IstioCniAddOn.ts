import { Cluster } from "aws-cdk-lib/aws-eks";
import { ISTIO_VERSION } from "./IstioBaseAddOn";

export class IstioCniAddOn {
  constructor(private cluster: Cluster) {}

  deploy() {
    this.cluster.addHelmChart("IstioCni", {
      chart: "cni",
      repository: "https://istio-release.storage.googleapis.com/charts",
      namespace: "istio-system",
      release: "cni",
      version: ISTIO_VERSION,
      createNamespace: false,
    });
  }
}
