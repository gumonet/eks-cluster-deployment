import { Values } from "./types";
import { Cluster } from "aws-cdk-lib/aws-eks";
import { KubernetesManifest } from "aws-cdk-lib/aws-eks";

/**
 * Creates namespace
 * (a prerequisite for serviceaccount and helm chart execution for many add-ons).
 * @param name
 * @param cluster
 * @param overwrite
 * @param prune
 * @returns KubernetesManifest
 */
export function createNamespace(
  name: string,
  cluster: Cluster,
  overwrite?: boolean,
  prune?: boolean,
  annotations?: Values,
  labels?: Values
) {
  if (name === "kube-system") {
    return cluster.clusterSecurityGroup; // a construct that is populated for the cluster l
  }
  return new KubernetesManifest(cluster.stack, `${name}-namespace-struct`, {
    cluster: cluster,
    manifest: [
      {
        apiVersion: "v1",
        kind: "Namespace",
        metadata: {
          name: name,
          annotations,
          labels,
        },
      },
    ],
    overwrite: overwrite ?? true,
    prune: prune ?? true,
  });
}
