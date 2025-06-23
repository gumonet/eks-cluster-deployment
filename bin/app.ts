#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { BancDemoEKSDeployment } from "../lib/main";

const app = new cdk.App();
new BancDemoEKSDeployment(app, "BancDemoEKSDeployment", {
  env: { account: "171057908863", region: "us-west-2" },
  environment: "dev",
  adminPasswordSecretName: "internal-k8s-argocd-password",
  credentialsSecretName: "internal-k8s-argocd-repository-credentials",
  repositoryUrl: "https://github.com/b365tech/k8s-workloads.git",
  applicationPath: "pci/envs/dev",
  clusterName: "BancDemoEKS",
  meshId: "demo.banc365.com",
  network: "clusterUno",
});

new BancDemoEKSDeployment(app, "BancSecondDeployment", {
  env: { account: "171057908863", region: "us-west-2" },
  environment: "dev",
  adminPasswordSecretName: "internal-k8s-argocd-password",
  credentialsSecretName: "internal-k8s-argocd-repository-credentials",
  repositoryUrl: "https://github.com/b365tech/k8s-workloads.git",
  applicationPath: "pci/envs/dev",
  clusterName: "BancSecondary",
  meshId: "demo.banc365.com",
  network: "clusterDos",
});
