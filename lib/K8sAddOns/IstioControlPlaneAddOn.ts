import { Cluster } from "aws-cdk-lib/aws-eks";
import { ISTIO_VERSION } from "./IstioBaseAddOn";

export class IstioControlPlaneAddOn {
  constructor(
    private cluster: Cluster,
    private meshID: string,
    private network: string
  ) {}

  deploy() {
    const chartIstioBase = this.cluster.addHelmChart("IstioControlPlane", {
      chart: "istiod",
      repository: "https://istio-release.storage.googleapis.com/charts",
      namespace: "istio-system",
      release: "istiod",
      version: ISTIO_VERSION,
      values: {
        awsRegion: this.cluster.stack.region,
        global: {
          meshID: this.meshID,
          multiCluster: { clusterName: this.cluster.clusterName },
          network: this.network,
        },
      },
    });
  }
}
