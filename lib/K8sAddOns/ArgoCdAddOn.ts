import { Construct } from "constructs";
import { getSecretValue } from "../utils/secrets-managers-utils";
import { Cluster } from "aws-cdk-lib/aws-eks";
import * as bcrypt from "bcrypt";

export class ArgoCdAddOn {
  constructor(
    private cluster: Cluster,
    private adminPasswordSecretName: string,
    private region: string
  ) {}
  deploy() {
    this.generateSecretValue(this.adminPasswordSecretName, this.region)
      .then((argocdServerAdminPassword) => {
        this.deplooyArgoCd(argocdServerAdminPassword);
      })
      .catch((error) => {
        throw new Error("Error getting secret value: " + error);
      });
  }
  deplooyArgoCd(argocdServerAdminPassword: string) {
    // this.createNameSpace(this.cluster); Uncomment that when redeploy and add node dependecy
    this.cluster.addHelmChart("ArgoCD", {
      createNamespace: true,
      chart: "argo-cd",
      repository: "https://argoproj.github.io/argo-helm",
      namespace: "argocd",
      release: "argocd",
      values: {
        configs: {
          secret: {
            argocdServerAdminPassword: argocdServerAdminPassword,
          },
        },
      },
    });
  }

  createNameSpace(cluster: Cluster) {
    cluster.addManifest("ArgoNamespace", {
      apiVersion: "v1",
      kind: "Namespace",
      metadata: { name: "argocd" },
    });
  }

  //Create argocd namespace
  async generateSecretValue(
    secretName: string,
    region: string
  ): Promise<string> {
    const secretValue = await getSecretValue(secretName, region);
    const secretHashValue = await bcrypt.hash(secretValue, 10);
    return secretHashValue;
  }
}
