import { Cluster } from "aws-cdk-lib/aws-eks";

export class SecretsStoreProvider {
  constructor(private cluster: Cluster) {}

  build() {
    this.deploySecretsStoreProvider();
  }

  deploySecretsStoreProvider() {
    this.cluster.addHelmChart("SecretsStore", {
      chart: "secrets-store-csi-driver",
      repository:
        "https://kubernetes-sigs.github.io/secrets-store-csi-driver/charts",
      namespace: "kube-system",
    });
  }
}

//Adding secretProviderClass
/* const secretProviderClassManifest = cluster.addManifest(
      "SecretProviderClass",
      {
        apiVersion: "secrets-store.csi.x-k8s.io/v1",
        kind: "SecretProviderClass",
        metadata: {
          name: "blueprints-secret",
          namespace: "argocd",
        },
        spec: {
          provider: "aws",
          parameters: {
            objects: JSON.stringify([
              {
                objectName: props.adminPasswordSecretName,
                objectType: "secretsmanager",
                jmesPath: [
                  {
                    path: "url",
                    objectAlias: "url",
                  },
                  {
                    path: "username",
                    objectAlias: "username",
                  },
                  {
                    path: "password",
                    objectAlias: "password",
                  },
                ],
              },
            ]),
          },
          secretObjects: [
            {
              secretName: "internal-k8s-argocd-repository-credentials",
              type: "Opaque",
              labels: {
                "argocd.argoproj.io/secret-type": "repo-creds",
              },
              data: [
                {
                  objectName: "url",
                  key: "url",
                },
                {
                  objectName: "username",
                  key: "username",
                },
                {
                  objectName: "password",
                  key: "password",
                },
              ],
            },
          ],
        },
      }
    );
    secretProviderClassManifest.node.addDependency(argoNamespace);
    */
